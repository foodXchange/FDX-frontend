import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Alert,
  Skeleton,
  Fab,
  Dialog,
} from '@mui/material';
import {
  ArrowBack,
  CalendarMonth,
} from '@mui/icons-material';
import { useExpert } from '../hooks';
import { ExpertProfile as ExpertProfileComponent, BookingCalendar } from '../components';

export const ExpertProfile: FC = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  
  const { expert, loading, error } = useExpert(expertId!);

  // Mock data for demonstration
  const mockServices = [
    {
      id: '1',
      expertId: expertId!,
      name: 'Supply Chain Optimization Consultation',
      description: 'Comprehensive analysis and recommendations for optimizing your food supply chain operations.',
      category: 'Supply Chain',
      subcategory: 'Optimization',
      deliverables: [
        'Current state analysis report',
        'Optimization recommendations',
        'Implementation roadmap',
        '30-day follow-up session'
      ],
      duration: { value: 2, unit: 'weeks' as const, isEstimate: false },
      pricing: {
        type: 'fixed' as const,
        amount: 2500,
        currency: 'USD',
      },
      tags: ['Supply Chain', 'Optimization', 'Cost Reduction'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockRatings = [
    {
      id: '1',
      expertId: expertId!,
      clientId: 'client1',
      collaborationId: 'collab1',
      overall: 4.8,
      communication: 5.0,
      expertise: 4.9,
      professionalism: 4.7,
      value: 4.8,
      comment: 'Exceptional expertise in supply chain optimization. The recommendations provided saved our company 20% in logistics costs.',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      expertId: expertId!,
      clientId: 'client2',
      collaborationId: 'collab2',
      overall: 4.9,
      communication: 4.8,
      expertise: 5.0,
      professionalism: 4.9,
      value: 4.8,
      comment: 'Outstanding work on our compliance audit. Very thorough and professional approach.',
      response: 'Thank you for the positive feedback! It was a pleasure working with your team.',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockPortfolio = [
    {
      id: '1',
      title: 'Global Food Retailer Supply Chain Transformation',
      description: 'Led a complete transformation of supply chain operations for a major food retailer, resulting in 25% cost reduction and improved delivery times.',
      category: 'Supply Chain Optimization',
      images: ['/placeholder-portfolio1.jpg', '/placeholder-portfolio2.jpg'],
      client: 'Fortune 500 Food Retailer',
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      results: 'Achieved 25% reduction in logistics costs, 40% improvement in delivery times, and 15% reduction in food waste.',
      testimonial: 'This project transformed our entire supply chain. The expert\'s recommendations were practical and highly effective.',
    },
    {
      id: '2',
      title: 'Food Safety Compliance Audit & Implementation',
      description: 'Comprehensive food safety audit and implementation of new compliance procedures for a mid-size food manufacturer.',
      category: 'Regulatory Compliance',
      images: ['/placeholder-portfolio3.jpg'],
      client: 'Regional Food Manufacturer',
      date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      results: 'Achieved 100% compliance with FDA regulations and reduced compliance risks by 80%.',
    },
  ];

  useEffect(() => {
    if (!expertId) {
      navigate('/experts/discover');
    }
  }, [expertId, navigate]);

  const handleBook = () => {
    setBookingDialogOpen(true);
  };

  const handleMessage = () => {
    // Navigate to messaging or open chat
    console.log('Open message dialog');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: expert ? `${expert.firstName} ${expert.lastName} - Expert Profile` : 'Expert Profile',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box mb={3}>
          <Skeleton variant="rectangular" height={200} />
        </Box>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (error || !expert) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">
          {error || 'Expert not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <ExpertProfileComponent
        expert={expert}
        services={mockServices}
        ratings={mockRatings}
        portfolio={mockPortfolio}
        onBook={handleBook}
        onMessage={handleMessage}
        onShare={handleShare}
      />

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Fab
          color="primary"
          onClick={handleBook}
          disabled={!expert.availability.isAvailable}
        >
          <CalendarMonth />
        </Fab>
        <Fab
          onClick={() => navigate(-1)}
          sx={{ bgcolor: 'grey.800', color: 'white' }}
        >
          <ArrowBack />
        </Fab>
      </Box>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <BookingCalendar
          expert={expert}
          service={mockServices[0]}
          onBookingComplete={(booking) => {
            console.log('Booking completed:', booking);
            setBookingDialogOpen(false);
            // Navigate to booking confirmation or show success message
          }}
        />
      </Dialog>
    </Container>
  );
};

export default ExpertProfile;