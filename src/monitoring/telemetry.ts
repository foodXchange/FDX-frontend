import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { monitoringConfig } from '../config/monitoring.config';

let isInitialized = false;
let provider: WebTracerProvider;

export function initializeMonitoring() {
  if (isInitialized || !monitoringConfig.enableAPM) {
    return;
  }

  provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: monitoringConfig.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.REACT_APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: monitoringConfig.environment,
    }),
  });

  const exporter = new OTLPTraceExporter({
    url: `${monitoringConfig.apiEndpoint}/v1/traces`,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
        },
        '@opentelemetry/instrumentation-xml-http-request': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
        },
      }),
    ],
  });

  isInitialized = true;
  console.log('📊 OpenTelemetry monitoring initialized');
}

export function createSpan(name: string, attributes?: Record<string, any>) {
  if (!isInitialized || !provider) return null;
  
  const tracer = provider.getTracer(monitoringConfig.serviceName);
  return tracer.startSpan(name, { attributes });
}