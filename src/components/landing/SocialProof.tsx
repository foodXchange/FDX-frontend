import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Paper, Avatar, IconButton, Modal } from '@mui/material';
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';

export const SocialProof: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const testimonials = [
    {
      quote: "FoodXchange reduced our sourcing time by 60% and helped us find suppliers we never would have discovered on our own.",
      author: "Sarah Chen",
      position: "Procurement Director",
      company: "Global Foods Inc",
      avatar: "SC",
      metrics: "60% faster sourcing",
      videoThumbnail: "/images/testimonial-sarah.jpg",
      videoUrl: "https://player.vimeo.com/video/123456789",
      hasVideo: true
    },
    {
      quote: "The compliance automation is a game-changer. We went from weeks to days for regulatory approvals.",
      author: "Michael Rodriguez",
      position: "Supply Chain Manager",
      company: "Fresh Supply Co",
      avatar: "MR",
      metrics: "3x faster approvals",
      videoThumbnail: "/images/testimonial-michael.jpg",
      videoUrl: "https://player.vimeo.com/video/123456790",
      hasVideo: true
    },
    {
      quote: "Real-time tracking and temperature monitoring gave us complete visibility into our perishable shipments.",
      author: "Emma Thompson",
      position: "Import Manager",
      company: "Quality Imports LLC",
      avatar: "ET",
      metrics: "99.5% on-time delivery",
      videoThumbnail: "/images/testimonial-emma.jpg",
      videoUrl: "",
      hasVideo: false
    }
  ];

  const stats = [
    { number: "500+", label: "Active Importers", color: "#1E4C8A" },
    { number: "10,000+", label: "Verified Suppliers", color: "#FF6B35" },
    { number: "50+", label: "Countries", color: "#52B788" },
    { number: "$2B+", label: "Trade Volume", color: "#B08D57" }
  ];

  return (
    <Box component="section" sx={{ py: 10, bgcolor: 'white' }}>
      <Container maxWidth="xl">
        {/* Statistics */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, color: 'text.primary', mb: 2 }}>
            Trusted by Industry Leaders
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 6 }}>
            Join thousands of food companies transforming their supply chains
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4 }}>
            {stats.map((stat, index) => (
              <Box
                component={motion.div}
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{ textAlign: 'center' }}
              >
                <Typography sx={{ fontSize: '3rem', fontWeight: 700, mb: 1, color: stat.color }}>
                  {stat.number}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>{stat.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Video Testimonials */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4, mb: 8 }}>
          {testimonials.map((testimonial, index) => (
            <Paper
              component={motion.div}
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              elevation={3}
              sx={{ borderRadius: 4, overflow: 'hidden', transition: 'all 0.3s', '&:hover': { boxShadow: 6 } }}
            >
              {testimonial.hasVideo ? (
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #dbeafe, #fed7aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.2)' }} />
                    <IconButton
                      component={motion.button}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedVideo(testimonial.videoUrl)}
                      sx={{ position: 'relative', zIndex: 10, width: 64, height: 64, bgcolor: 'white', boxShadow: 3 }}
                    >
                      <Box component={PlayIcon} sx={{ width: 24, height: 24, color: '#ea580c', ml: 0.5 }} />
                    </IconButton>
                    <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, color: 'white' }}>
                      <Typography sx={{ fontWeight: 700 }}>{testimonial.author}</Typography>
                      <Typography sx={{ fontSize: '0.875rem', opacity: 0.9 }}>{testimonial.position}</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ height: 24 }} />
              )}
              
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ width: 48, height: 48, bgcolor: '#FF6B35', mr: 2, boxShadow: 2 }}
                  >
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{testimonial.author}</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{testimonial.position}</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{testimonial.company}</Typography>
                  </Box>
                </Box>
                
                <Typography sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.8 }}>"{testimonial.quote}"</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                    <Box component="svg" width="16" height="16" sx={{ marginRight: 8, color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </Box>
                    <Typography sx={{ fontWeight: 500, color: 'success.main' }}>
                      {testimonial.metrics}
                    </Typography>
                  </Box>
                  {testimonial.hasVideo && (
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      Watch full story
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Case Study CTA */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', background: 'linear-gradient(90deg, #f9fafb, #f3f4f6)', borderRadius: 4, p: 4 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
            Ready to Join These Success Stories?
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            See how FoodXchange can transform your sourcing process in just 14 days
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Box
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ 
                bgcolor: '#ea580c', 
                color: 'white', 
                px: 4, 
                py: 1.5, 
                borderRadius: 2, 
                fontWeight: 700, 
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                '&:hover': { bgcolor: '#dc2626' }
              }}
            >
              Read Full Case Studies
            </Box>
            <Box
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ 
                border: 2,
                borderColor: 'grey.300',
                color: 'text.primary', 
                px: 4, 
                py: 1.5, 
                borderRadius: 2, 
                fontWeight: 700, 
                bgcolor: 'transparent',
                cursor: 'pointer',
                transition: 'border-color 0.3s',
                '&:hover': { borderColor: 'grey.400' }
              }}
            >
              Schedule a Demo
            </Box>
          </Box>
        </Paper>
      </Container>
      
      {/* Video Modal */}
      <Modal
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ position: 'relative', maxWidth: '4xl', width: '100%', p: 2 }}>
          <IconButton 
            onClick={() => setSelectedVideo(null)}
            sx={{ position: 'absolute', top: -40, right: 0, color: 'white', '&:hover': { color: 'grey.300' } }}
          >
            <Box component={XMarkIcon} sx={{ width: 24, height: 24 }} />
          </IconButton>
          <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <Box component="iframe" 
              src={selectedVideo || ''}
                title="Customer testimonial video"
                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8 }}
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};