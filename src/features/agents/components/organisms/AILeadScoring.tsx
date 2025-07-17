import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import {
  Psychology,
  Lightbulb,
  Schedule,
  Email,
  Assignment,
  Warning,
  Speed,
  MyLocation,
  Tune,
  Refresh,
  Science,
  Analytics,
  SmartToy,
  ModelTraining,
} from '@mui/icons-material';
import { useAgentStore } from '../../store';

interface LeadScore {
  leadId: string;
  overallScore: number;
  confidence: number;
  factors: ScoreFactor[];
  recommendations: Recommendation[];
  predictedOutcome: PredictedOutcome;
  riskFactors: RiskFactor[];
  optimizations: Optimization[];
  lastUpdated: string;
}

interface ScoreFactor {
  factor: string;
  weight: number;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface Recommendation {
  id: string;
  type: 'contact_time' | 'communication_channel' | 'approach' | 'pricing' | 'timeline';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: number;
  confidence: number;
  actionRequired: boolean;
}

interface PredictedOutcome {
  conversionProbability: number;
  estimatedDealSize: number;
  expectedCloseDate: string;
  confidence: number;
  timeToConversion: number;
}

interface RiskFactor {
  factor: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

interface Optimization {
  area: string;
  currentValue: number;
  optimizedValue: number;
  improvement: number;
  effort: 'low' | 'medium' | 'high';
  description: string;
}

interface AIModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  lastTraining: string;
  dataPoints: number;
  modelVersion: string;
}

const AILeadScoring: React.FC = () => {
  const theme = useTheme();
  const { leads, selectedLead, setSelectedLead } = useAgentStore();
  
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedModel, setSelectedModel] = useState('v2.1');
  const [modelMetrics, setModelMetrics] = useState<AIModelMetrics | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const loadModelMetrics = useCallback(() => {
    setModelMetrics({
      accuracy: 0.847,
      precision: 0.823,
      recall: 0.891,
      lastTraining: '2024-01-15T10:30:00Z',
      dataPoints: 15420,
      modelVersion: selectedModel,
    });
  }, [selectedModel]);

  const loadLeadScores = useCallback(async () => {
    setIsLoading(true);
    
    // Mock AI scoring data
    setTimeout(() => {
      const mockScores: LeadScore[] = leads.slice(0, 10).map((lead) => {
        const score = 0.2 + Math.random() * 0.7; // 20-90% range
        return {
          leadId: lead.id,
          overallScore: score,
          confidence: 0.75 + Math.random() * 0.2,
          factors: [
            {
              factor: 'Company Size',
              weight: 0.25,
              value: Math.random(),
              impact: 'positive',
              description: 'Mid-size company with growth potential',
            },
            {
              factor: 'Industry Match',
              weight: 0.20,
              value: Math.random(),
              impact: 'positive',
              description: 'High demand industry for our services',
            },
            {
              factor: 'Geographic Location',
              weight: 0.15,
              value: Math.random(),
              impact: 'neutral',
              description: 'Moderate market penetration in this area',
            },
            {
              factor: 'Budget Indicators',
              weight: 0.15,
              value: Math.random(),
              impact: 'positive',
              description: 'Strong financial indicators',
            },
            {
              factor: 'Timing',
              weight: 0.10,
              value: Math.random(),
              impact: Math.random() > 0.5 ? 'positive' : 'negative',
              description: 'Current market timing for decision',
            },
            {
              factor: 'Competition',
              weight: 0.15,
              value: Math.random(),
              impact: Math.random() > 0.3 ? 'positive' : 'negative',
              description: 'Competitive landscape analysis',
            },
          ],
          recommendations: [
            {
              id: '1',
              type: 'contact_time',
              priority: 'high',
              title: 'Optimal Contact Time',
              description: 'Contact between 10-11 AM on Tuesday-Thursday for 40% higher response rate',
              expectedImpact: 0.4,
              confidence: 0.85,
              actionRequired: true,
            },
            {
              id: '2',
              type: 'communication_channel',
              priority: 'medium',
              title: 'Preferred Channel',
              description: 'Email followed by phone call shows 25% better engagement',
              expectedImpact: 0.25,
              confidence: 0.78,
              actionRequired: false,
            },
            {
              id: '3',
              type: 'approach',
              priority: 'high',
              title: 'Value Proposition',
              description: 'Focus on cost savings rather than features for this industry',
              expectedImpact: 0.35,
              confidence: 0.82,
              actionRequired: true,
            },
          ],
          predictedOutcome: {
            conversionProbability: score,
            estimatedDealSize: 5000 + Math.random() * 15000,
            expectedCloseDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            confidence: 0.7 + Math.random() * 0.25,
            timeToConversion: 15 + Math.random() * 45, // days
          },
          riskFactors: score < 0.4 ? [
            {
              factor: 'Low Engagement',
              severity: 'high',
              description: 'Limited response to outreach attempts',
              mitigation: 'Try different communication channels and times',
            },
            {
              factor: 'Budget Constraints',
              severity: 'medium',
              description: 'Potential budget limitations indicated',
              mitigation: 'Present flexible pricing options',
            },
          ] : [
            {
              factor: 'Decision Timeline',
              severity: 'low',
              description: 'Extended decision-making process possible',
              mitigation: 'Maintain regular follow-up schedule',
            },
          ],
          optimizations: [
            {
              area: 'Response Time',
              currentValue: 4.2,
              optimizedValue: 1.5,
              improvement: 0.15,
              effort: 'low',
              description: 'Faster response time could improve conversion by 15%',
            },
            {
              area: 'Follow-up Frequency',
              currentValue: 3,
              optimizedValue: 5,
              improvement: 0.12,
              effort: 'medium',
              description: 'Increase follow-up touchpoints for better engagement',
            },
          ],
          lastUpdated: new Date().toISOString(),
        };
      });
      
      setLeadScores(mockScores);
      setIsLoading(false);
    }, 1500);
  }, [leads, selectedModel]);

  useEffect(() => {
    loadLeadScores();
    loadModelMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadLeadScores, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [leads, selectedModel, autoRefresh, loadLeadScores, loadModelMetrics]);


  const getScoreColor = (score: number) => {
    if (score >= 0.7) return theme.palette.success.main;
    if (score >= 0.4) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Hot';
    if (score >= 0.6) return 'Warm';
    if (score >= 0.4) return 'Cool';
    return 'Cold';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getLeadById = (leadId: string) => {
    return leads.find(lead => lead.id === leadId);
  };

  const ScoreCard: React.FC<{ leadScore: LeadScore }> = ({ leadScore }) => {
    const lead = getLeadById(leadScore.leadId);
    if (!lead) return null;

    return (
      <Card 
        sx={{ 
          cursor: 'pointer',
          '&:hover': { 
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        }}
        onClick={() => setSelectedLead(lead)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {lead.companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lead.contactPerson}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={getScoreLabel(leadScore.overallScore)}
                sx={{
                  bgcolor: alpha(getScoreColor(leadScore.overallScore), 0.1),
                  color: getScoreColor(leadScore.overallScore),
                  fontWeight: 600,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, color: getScoreColor(leadScore.overallScore) }}>
                {Math.round(leadScore.overallScore * 100)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Conversion Probability</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Math.round(leadScore.predictedOutcome.conversionProbability * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={leadScore.predictedOutcome.conversionProbability * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(getScoreColor(leadScore.overallScore), 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(leadScore.overallScore),
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Est. Deal Size: {formatCurrency(leadScore.predictedOutcome.estimatedDealSize)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(leadScore.predictedOutcome.timeToConversion)} days to close
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {leadScore.recommendations.slice(0, 2).map((rec) => (
              <Chip
                key={rec.id}
                label={rec.title}
                size="small"
                color={getPriorityColor(rec.priority) as any}
                variant="outlined"
                icon={<Lightbulb />}
              />
            ))}
          </Box>

          {leadScore.riskFactors.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="caption">
                {leadScore.riskFactors.length} risk factor(s) identified
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const LeadDetailPanel: React.FC<{ leadScore: LeadScore }> = ({ leadScore }) => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        AI Analysis Details
      </Typography>

      {/* Score Factors */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Speed color="primary" />
            Score Factors
          </Typography>
          {leadScore.factors.map((factor, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {factor.factor}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption">
                    {Math.round(factor.weight * 100)}% weight
                  </Typography>
                  <Chip
                    label={factor.impact}
                    size="small"
                    color={
                      factor.impact === 'positive' ? 'success' :
                      factor.impact === 'negative' ? 'error' : 'default'
                    }
                  />
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={factor.value * 100}
                sx={{ mb: 1, height: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {factor.description}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb color="primary" />
            AI Recommendations
          </Typography>
          <List>
            {leadScore.recommendations.map((rec) => (
              <ListItem key={rec.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${getPriorityColor(rec.priority)}.light` }}>
                    {rec.type === 'contact_time' ? <Schedule /> :
                     rec.type === 'communication_channel' ? <Email /> :
                     rec.type === 'approach' ? <Psychology /> :
                     <Assignment />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{rec.title}</Typography>
                      <Chip
                        label={`+${Math.round(rec.expectedImpact * 100)}%`}
                        size="small"
                        color="success"
                      />
                    </Box>
                  }
                  secondary={rec.description}
                />
                <ListItemSecondaryAction>
                  {rec.actionRequired && (
                    <Button size="small" variant="outlined">
                      Apply
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Predicted Outcome */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MyLocation color="primary" />
            Predicted Outcome
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Conversion Probability
              </Typography>
              <Typography variant="h6">
                {Math.round(leadScore.predictedOutcome.conversionProbability * 100)}%
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Deal Size
              </Typography>
              <Typography variant="h6">
                {formatCurrency(leadScore.predictedOutcome.estimatedDealSize)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Expected Close
              </Typography>
              <Typography variant="h6">
                {new Date(leadScore.predictedOutcome.expectedCloseDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Confidence
              </Typography>
              <Typography variant="h6">
                {Math.round(leadScore.predictedOutcome.confidence * 100)}%
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      {leadScore.riskFactors.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              Risk Factors
            </Typography>
            {leadScore.riskFactors.map((risk, index) => (
              <Alert key={index} severity={risk.severity === 'high' ? 'error' : risk.severity === 'medium' ? 'warning' : 'info'} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{risk.factor}</Typography>
                <Typography variant="body2">{risk.description}</Typography>
                <Typography variant="caption">Mitigation: {risk.mitigation}</Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <Psychology />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              AI Lead Scoring
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Machine learning-powered lead analysis and recommendations
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto-refresh"
          />
          <Button
            variant="outlined"
            startIcon={<Tune />}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<Science />}
            onClick={() => setShowExplanation(true)}
          >
            How it works
          </Button>
          <IconButton onClick={loadLeadScores} disabled={isLoading}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Model Performance */}
      {modelMetrics && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ModelTraining />
            <Typography variant="body2">
              Model v{modelMetrics.modelVersion} • Accuracy: {Math.round(modelMetrics.accuracy * 100)}% • 
              Last trained: {new Date(modelMetrics.lastTraining).toLocaleDateString()} • 
              {modelMetrics.dataPoints.toLocaleString()} data points
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Lead Scores */}
      <Grid container spacing={3}>
        {/* Lead Cards */}
        <Grid size={{ xs: 12, md: selectedLead ? 8 : 12 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <SmartToy sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                <Typography>AI is analyzing your leads...</Typography>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {leadScores
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((leadScore) => (
                  <Grid size={{ xs: 12, sm: 6, lg: selectedLead ? 6 : 4 }} key={leadScore.leadId}>
                    <ScoreCard leadScore={leadScore} />
                  </Grid>
                ))}
            </Grid>
          )}
        </Grid>

        {/* Detail Panel */}
        {selectedLead && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: 'sticky', top: 24 }}>
              <CardContent>
                {(() => {
                  const leadScore = leadScores.find(ls => ls.leadId === selectedLead.id);
                  return leadScore ? <LeadDetailPanel leadScore={leadScore} /> : (
                    <Typography>Loading analysis...</Typography>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Model Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Model Version</InputLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                label="Model Version"
              >
                <MenuItem value="v2.1">v2.1 (Latest) - Enhanced accuracy</MenuItem>
                <MenuItem value="v2.0">v2.0 - Stable</MenuItem>
                <MenuItem value="v1.9">v1.9 - Legacy</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
              label="Enable automatic refresh every 5 minutes"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button onClick={() => { setShowSettings(false); loadModelMetrics(); }} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* How it works Dialog */}
      <Dialog open={showExplanation} onClose={() => setShowExplanation(false)} maxWidth="md" fullWidth>
        <DialogTitle>How AI Lead Scoring Works</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics color="primary" />
                Data Collection
              </Typography>
              <Typography variant="body2">
                Our AI analyzes over 50+ data points including company information, interaction history, 
                industry trends, and behavioral patterns to create a comprehensive lead profile.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ModelTraining color="primary" />
                Machine Learning
              </Typography>
              <Typography variant="body2">
                Using advanced machine learning algorithms trained on thousands of successful deals, 
                the system identifies patterns and correlations that predict conversion likelihood.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MyLocation color="primary" />
                Scoring Algorithm
              </Typography>
              <Typography variant="body2">
                Each lead receives a score from 0-100 based on weighted factors. The algorithm 
                continuously learns from outcomes to improve accuracy over time.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb color="primary" />
                Recommendations
              </Typography>
              <Typography variant="body2">
                AI generates personalized recommendations for optimal contact times, communication 
                channels, and approaches based on similar successful conversions.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExplanation(false)} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AILeadScoring;