import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Slider, Paper } from '@mui/material';

export const ROICalculator: React.FC = () => {
  const [monthlyRFQs, setMonthlyRFQs] = useState(50);
  const [avgOrderValue, setAvgOrderValue] = useState(25000);
  const [currentProcessTime, setCurrentProcessTime] = useState(7);

  const calculateSavings = () => {
    const timeSaved = currentProcessTime * 0.6; // 60% time reduction
    const costSavings = avgOrderValue * 0.15; // 15% cost reduction
    const monthlySavings = monthlyRFQs * costSavings;
    const yearlySavings = monthlySavings * 12;
    
    return {
      timeSaved: Math.round(timeSaved),
      monthlySavings: Math.round(monthlySavings),
      yearlySavings: Math.round(yearlySavings),
      efficiency: Math.round((timeSaved / currentProcessTime) * 100)
    };
  };

  const savings = calculateSavings();

  return (
    <Box component="section" sx={{ py: 10, background: 'linear-gradient(135deg, #1e40af, #1d4ed8, #ea580c)' }}>
      <Container maxWidth="xl">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ maxWidth: '6xl', mx: 'auto' }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
            {/* Left Column - Calculator */}
            <Paper sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: 4, p: 4, border: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>
                Calculate Your ROI
              </Typography>
              <Typography sx={{ color: '#dbeafe', mb: 4 }}>
                See how much you could save with FoodXchange's automated sourcing platform
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography sx={{ color: 'white', fontWeight: 500, mb: 1 }}>
                    Monthly RFQs: {monthlyRFQs}
                  </Typography>
                  <Slider
                    min={10}
                    max={200}
                    value={monthlyRFQs}
                    onChange={(_e, value) => setMonthlyRFQs(value as number)}
                    sx={{ 
                      color: 'white',
                      '& .MuiSlider-track': { bgcolor: 'white' },
                      '& .MuiSlider-rail': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                      '& .MuiSlider-thumb': { bgcolor: 'white' }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#bfdbfe', mt: 0.5 }}>
                    <span>10</span>
                    <span>200</span>
                  </Box>
                </Box>
                
                <Box>
                  <Typography sx={{ color: 'white', fontWeight: 500, mb: 1 }}>
                    Average Order Value: ${avgOrderValue.toLocaleString()}
                  </Typography>
                  <Slider
                    min={5000}
                    max={100000}
                    step={1000}
                    value={avgOrderValue}
                    onChange={(_e, value) => setAvgOrderValue(value as number)}
                    sx={{ 
                      color: 'white',
                      '& .MuiSlider-track': { bgcolor: 'white' },
                      '& .MuiSlider-rail': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                      '& .MuiSlider-thumb': { bgcolor: 'white' }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#bfdbfe', mt: 0.5 }}>
                    <span>$5K</span>
                    <span>$100K</span>
                  </Box>
                </Box>
                
                <Box>
                  <Typography sx={{ color: 'white', fontWeight: 500, mb: 1 }}>
                    Current Process Time: {currentProcessTime} days
                  </Typography>
                  <Slider
                    min={1}
                    max={30}
                    value={currentProcessTime}
                    onChange={(_e, value) => setCurrentProcessTime(value as number)}
                    sx={{ 
                      color: 'white',
                      '& .MuiSlider-track': { bgcolor: 'white' },
                      '& .MuiSlider-rail': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                      '& .MuiSlider-thumb': { bgcolor: 'white' }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#bfdbfe', mt: 0.5 }}>
                    <span>1 day</span>
                    <span>30 days</span>
                  </Box>
                </Box>
              </Box>
            </Paper>
            
            {/* Right Column - Results */}
            <Box sx={{ color: 'white' }}>
              <Box
                component={motion.div}
                key={savings.yearlySavings}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                sx={{ textAlign: 'center', mb: 4 }}
              >
                <Typography sx={{ fontSize: '3.75rem', fontWeight: 700, color: '#fdba74', mb: 1 }}>
                  ${savings.yearlySavings.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', color: '#dbeafe' }}>
                  Estimated Annual Savings
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
                <Paper
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: 3, p: 3, border: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Typography sx={{ fontSize: '1.875rem', fontWeight: 700, color: '#fdba74' }}>
                    {savings.timeSaved}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#bfdbfe' }}>
                    Days Saved per RFQ
                  </Typography>
                </Paper>
                
                <Paper
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: 3, p: 3, border: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Typography sx={{ fontSize: '1.875rem', fontWeight: 700, color: '#fdba74' }}>
                    ${savings.monthlySavings.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#bfdbfe' }}>
                    Monthly Savings
                  </Typography>
                </Paper>
                
                <Paper
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: 3, p: 3, border: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Typography sx={{ fontSize: '1.875rem', fontWeight: 700, color: '#fdba74' }}>
                    {savings.efficiency}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#bfdbfe' }}>
                    Efficiency Gain
                  </Typography>
                </Paper>
                
                <Paper
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: 3, p: 3, border: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Typography sx={{ fontSize: '1.875rem', fontWeight: 700, color: '#fdba74' }}>
                    15%
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#bfdbfe' }}>
                    Cost Reduction
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{ 
                    bgcolor: '#ea580c', 
                    color: 'white', 
                    px: 4, 
                    py: 2, 
                    borderRadius: 2, 
                    fontSize: '1.125rem', 
                    fontWeight: 700, 
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: 3,
                    transition: 'background-color 0.3s',
                    '&:hover': { bgcolor: '#dc2626' }
                  }}
                >
                  Start Saving Today
                </Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#bfdbfe', mt: 1 }}>
                  See these savings in your first month
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};