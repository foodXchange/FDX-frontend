import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBar } from '@/components/landing/TrustBar';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ROICalculator } from '@/components/landing/ROICalculator';
import { SocialProof } from '@/components/landing/SocialProof';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { StickyCTA } from '@/components/landing/StickyCTA';

const LandingPage: React.FC = () => {
  return (
    <div className="viewport-container">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustBar />
        <Features />
        <HowItWorks />
        <ROICalculator />
        <SocialProof />
        <CTA />
      </main>
      <Footer />
      <StickyCTA />
    </div>
  );
};

export default LandingPage;