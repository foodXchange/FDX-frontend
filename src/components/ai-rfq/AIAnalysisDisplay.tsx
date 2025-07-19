import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Lightbulb as LightbulbIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { AIAnalysisResult, AIRecommendation } from '../../types/ai-rfq';

interface AIAnalysisDisplayProps {
  analysis: AIAnalysisResult;
  onApplyRecommendation?: (recommendation: AIRecommendation) => void;
  onRequestReanalysis?: () => void;
  loading?: boolean;
}

export const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({
  analysis,
  onApplyRecommendation,
  onRequestReanalysis,
  loading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['insights']);

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <WarningIcon />;
      case 'opportunity': return <TrendingUpIcon />;
      case 'risk': return <SecurityIcon />;
      case 'compliance': return <AssessmentIcon />;
      default: return <LightbulbIcon />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            AI is analyzing your RFQ...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This may take a few moments
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            AI Analysis Results
          </Typography>
          <Chip
            label={`${Math.round(analysis.confidence * 100)}% Confidence`}
            color={analysis.confidence > 0.8 ? 'success' : analysis.confidence > 0.6 ? 'warning' : 'error'}
            size="small"
            sx={{ ml: 2 }}
          />
          <Button
            size="small"
            onClick={onRequestReanalysis}
            sx={{ ml: 'auto' }}
          >
            Re-analyze
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Analysis completed on {new Date(analysis.processedAt).toLocaleString()}
        </Typography>

        {/* Key Insights */}
        <Accordion
          expanded={expandedSections.includes('insights')}
          onChange={() => handleSectionToggle('insights')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">
              Key Insights ({analysis.insights.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {analysis.insights.map((insight, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemIcon>
                    {getInsightIcon(insight.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {insight.title}
                        </Typography>
                        <Chip
                          label={insight.severity}
                          size="small"
                          color={getSeverityColor(insight.severity) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {insight.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Impact: {insight.impact} | Confidence: {Math.round(insight.confidence * 100)}%
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Recommendations */}
        <Accordion
          expanded={expandedSections.includes('recommendations')}
          onChange={() => handleSectionToggle('recommendations')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">
              AI Recommendations ({analysis.recommendations.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {analysis.recommendations.map((recommendation, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {recommendation.title}
                        </Typography>
                        <Chip
                          label={recommendation.priority}
                          size="small"
                          color={recommendation.priority === 'high' ? 'error' : recommendation.priority === 'medium' ? 'warning' : 'info'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {recommendation.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Rationale: {recommendation.rationale}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onApplyRecommendation?.(recommendation)}
                          >
                            Apply
                          </Button>
                          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                            Complexity: {recommendation.implementationComplexity}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Risk Assessment */}
        {analysis.riskAssessment && (
          <Accordion
            expanded={expandedSections.includes('risk')}
            onChange={() => handleSectionToggle('risk')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                Risk Assessment
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert 
                severity={
                  analysis.riskAssessment.overallRisk === 'critical' ? 'error' :
                  analysis.riskAssessment.overallRisk === 'high' ? 'warning' :
                  analysis.riskAssessment.overallRisk === 'medium' ? 'info' : 'success'
                }
                sx={{ mb: 2 }}
              >
                Overall Risk Level: {analysis.riskAssessment.overallRisk.toUpperCase()}
              </Alert>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Risk Factors:
              </Typography>
              <List dense>
                {analysis.riskAssessment.riskFactors?.map((factor, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={factor.factor || 'Risk Factor'}
                      secondary={factor.description || 'No description available'}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Market Analysis */}
        {analysis.marketAnalysis && (
          <Accordion
            expanded={expandedSections.includes('market')}
            onChange={() => handleSectionToggle('market')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                Market Analysis
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Market Size: ${analysis.marketAnalysis.marketSize?.toLocaleString() || 'N/A'}
              </Typography>
              <Typography variant="body2" paragraph>
                Growth Rate: {analysis.marketAnalysis.marketGrowth || 'N/A'}%
              </Typography>
              <Typography variant="body2" paragraph>
                Competitiveness: {analysis.marketAnalysis.competitiveness || 'N/A'}
              </Typography>
              <Typography variant="body2" paragraph>
                Supply Risk: {analysis.marketAnalysis.supplyRisk || 'N/A'}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysisDisplay;