// src/types/rfq.ts - RFQ specific types

export interface RFQFormData {
  title: string;
  description: string;
  products: RFQProductForm[];
  requirements: RFQRequirementsForm;
  timeline: RFQTimelineForm;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface RFQProductForm {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  specifications: { name: string; value: string; unit?: string }[];
  description?: string;
}

export interface RFQRequirementsForm {
  certifications: string[];
  qualityStandards: string[];
  paymentTerms: string[];
  deliveryTerms: string;
  packagingRequirements?: string;
  labeling?: string[];
}

export interface RFQTimelineForm {
  proposalDeadline: string;
  expectedDelivery: string;
  evaluationPeriod: number;
}

export interface RFQStatus {
  id: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  proposalCount: number;
  daysRemaining: number;
}

export interface RFQListItem {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  createdAt: string;
  deadline: string;
  proposalCount: number;
  buyerCompany: string;
  category: string;
}