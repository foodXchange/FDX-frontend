@description('The name of the dashboard')
param dashboardName string

@description('The location for the dashboard')
param location string = resourceGroup().location

@description('Application Insights resource ID')
param appInsightsResourceId string

@description('Static Web App resource ID')
param staticWebAppResourceId string

@description('Web App resource ID')
param webAppResourceId string

@description('Cosmos DB resource ID')
param cosmosDbResourceId string

@description('Tags to apply to the dashboard')
param tags object = {}

resource dashboard 'Microsoft.Portal/dashboards@2020-09-01-preview' = {
  name: dashboardName
  location: location
  tags: tags
  properties: {
    lenses: [
      {
        order: 0
        parts: [
          {
            position: {
              x: 0
              y: 0
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'Frontend Response Time'
                chartType: 'Line'
                metrics: [
                  {
                    resourceId: appInsightsResourceId
                    name: 'requests/duration'
                    aggregationType: 'avg'
                  }
                ]
                timeRange: {
                  relative: {
                    duration: 24
                    timeUnit: 'Hours'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 6
              y: 0
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'API Response Time'
                chartType: 'Line'
                metrics: [
                  {
                    resourceId: webAppResourceId
                    name: 'HttpResponseTime'
                    aggregationType: 'avg'
                  }
                ]
                timeRange: {
                  relative: {
                    duration: 24
                    timeUnit: 'Hours'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 0
              y: 4
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'Error Rate'
                chartType: 'Line'
                metrics: [
                  {
                    resourceId: appInsightsResourceId
                    name: 'requests/failed'
                    aggregationType: 'count'
                  }
                ]
                timeRange: {
                  relative: {
                    duration: 24
                    timeUnit: 'Hours'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 6
              y: 4
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'Active Users'
                chartType: 'Line'
                metrics: [
                  {
                    resourceId: appInsightsResourceId
                    name: 'users/count'
                    aggregationType: 'unique'
                  }
                ]
                timeRange: {
                  relative: {
                    duration: 7
                    timeUnit: 'Days'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 0
              y: 8
              colSpan: 4
              rowSpan: 3
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'CPU Usage'
                chartType: 'Line'
                metrics: [
                  {
                    resourceId: webAppResourceId
                    name: 'CpuPercentage'
                    aggregationType: 'avg'
                  }
                ]
                timeRange: {
                  relative: {
                    duration: 1
                    timeUnit: 'Hours'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 4
              y: 8
              colSpan: 4
              rowSpan: 3
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'Memory Usage'
                chartType: 'Line'
                metrics: [
                  {
                    resourceId: webAppResourceId
                    name: 'MemoryWorkingSet'
                    aggregationType: 'avg'
                  }
                ]
                timeRange: {
                  relative: {
                    duration: 1
                    timeUnit: 'Hours'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 8
              y: 8
              colSpan: 4
              rowSpan: 3
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'Database RU Consumption'
                chartType: 'Line'
                metrics: [
                  {
                    resourceId: cosmosDbResourceId
                    name: 'TotalRequestUnits'
                    aggregationType: 'avg'
                  }
                ]
                timeRange: {
                  relative: {
                    duration: 1
                    timeUnit: 'Hours'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 0
              y: 11
              colSpan: 12
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'Business Metrics - RFQs and Leads'
                chartType: 'Bar'
                customMetrics: [
                  {
                    name: 'RFQ Submitted'
                    query: 'customEvents | where name == "RFQ Submitted" | summarize count() by bin(timestamp, 1h)'
                  }
                  {
                    name: 'Lead Created'
                    query: 'customEvents | where name == "Lead Created" | summarize count() by bin(timestamp, 1h)'
                  }
                  {
                    name: 'Lead Converted'
                    query: 'customEvents | where name == "Lead Converted" | summarize count() by bin(timestamp, 1h)'
                  }
                ]
                timeRange: {
                  relative: {
                    duration: 7
                    timeUnit: 'Days'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 0
              y: 15
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/SingleValuePart'
              settings: {
                title: 'Total Cost (Last 30 Days)'
                query: 'summarize sum(Cost) by bin(UsageDate, 1d) | project UsageDate, DailyCost=sum_Cost | summarize TotalCost=sum(DailyCost)'
                timeRange: {
                  relative: {
                    duration: 30
                    timeUnit: 'Days'
                  }
                }
              }
            }
          }
          {
            position: {
              x: 6
              y: 15
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/Microsoft_Azure_Monitoring/PartType/MetricsChartPart'
              settings: {
                title: 'Cost Trend by Service'
                chartType: 'Area'
                costQuery: {
                  groupBy: 'ServiceName'
                  aggregation: 'sum'
                  granularity: 'Daily'
                }
                timeRange: {
                  relative: {
                    duration: 30
                    timeUnit: 'Days'
                  }
                }
              }
            }
          }
        ]
      }
    ]
    metadata: {
      model: {
        timeRange: {
          value: {
            relative: {
              duration: 24
              timeUnit: 'Hours'
            }
          }
          type: 'MsPortalFx.Composition.Configuration.ValueTypes.TimeRange'
        }
      }
    }
  }
}

output dashboardId string = dashboard.id