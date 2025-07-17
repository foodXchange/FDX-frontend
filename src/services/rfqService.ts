// RFQ (Request for Quotation) service for managing quotes, proposals, and supplier communications
import { api } from './api';
import { 
  RFQ, 
  RFQFilters, 
  CreateRFQData, 
  Proposal, 
  ApiResponse
} from '../shared/types';

export interface RFQResponse {
  data: RFQ[];
  total: number;
  page: number;
  limit: number;
}

export interface RFQStats {
  totalRFQs: number;
  activeRFQs: number;
  draftRFQs: number;
  closedRFQs: number;
  averageProposals: number;
  averageResponseTime: number;
}

export interface RFQMessage {
  id: string;
  rfqId: string;
  sender: string;
  recipient: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface SendMessageData {
  message: string;
  recipient: string;
}

class RFQService {
  async getRFQs(filters?: RFQFilters): Promise<RFQResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/rfqs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<ApiResponse<RFQResponse>>(endpoint);
    
    return response.data || { data: [], total: 0, page: 1, limit: 10 };
  }

  async getRFQById(id: string): Promise<RFQ> {
    const response = await api.get<ApiResponse<RFQ>>(`/rfqs/${id}`);
    
    if (!response.data) {
      throw new Error('RFQ not found');
    }
    
    return response.data;
  }

  async createRFQ(data: CreateRFQData): Promise<RFQ> {
    const response = await api.post<ApiResponse<RFQ>>('/rfqs', data);
    
    if (!response.data) {
      throw new Error('Failed to create RFQ');
    }
    
    return response.data;
  }

  async updateRFQ(id: string, data: Partial<CreateRFQData>): Promise<RFQ> {
    const response = await api.put<ApiResponse<RFQ>>(`/rfqs/${id}`, data);
    
    if (!response.data) {
      throw new Error('Failed to update RFQ');
    }
    
    return response.data;
  }

  async deleteRFQ(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/rfqs/${id}`);
  }

  async getRFQStats(): Promise<RFQStats> {
    const response = await api.get<ApiResponse<RFQStats>>('/rfqs/stats');
    
    return response.data || {
      totalRFQs: 0,
      activeRFQs: 0,
      draftRFQs: 0,
      closedRFQs: 0,
      averageProposals: 0,
      averageResponseTime: 0
    };
  }

  async getRecentRFQs(limit: number = 5): Promise<RFQ[]> {
    const response = await api.get<ApiResponse<RFQ[]>>(`/rfqs/recent?limit=${limit}`);
    return response.data || [];
  }

  async getProposals(rfqId: string): Promise<Proposal[]> {
    const response = await api.get<ApiResponse<Proposal[]>>(`/rfqs/${rfqId}/proposals`);
    return response.data || [];
  }

  async updateProposalStatus(proposalId: string, status: string): Promise<Proposal> {
    const response = await api.put<ApiResponse<Proposal>>(`/proposals/${proposalId}/status`, { status });
    
    if (!response.data) {
      throw new Error('Failed to update proposal status');
    }
    
    return response.data;
  }

  async getMessages(rfqId: string): Promise<RFQMessage[]> {
    const response = await api.get<ApiResponse<RFQMessage[]>>(`/rfqs/${rfqId}/messages`);
    return response.data || [];
  }

  async sendMessage(rfqId: string, messageData: SendMessageData): Promise<RFQMessage> {
    const response = await api.post<ApiResponse<RFQMessage>>(`/rfqs/${rfqId}/messages`, messageData);
    
    if (!response.data) {
      throw new Error('Failed to send message');
    }
    
    return response.data;
  }

  async publishRFQ(id: string): Promise<RFQ> {
    const response = await api.put<ApiResponse<RFQ>>(`/rfqs/${id}/publish`, {});
    
    if (!response.data) {
      throw new Error('Failed to publish RFQ');
    }
    
    return response.data;
  }

  async closeRFQ(id: string): Promise<RFQ> {
    const response = await api.put<ApiResponse<RFQ>>(`/rfqs/${id}/close`, {});
    
    if (!response.data) {
      throw new Error('Failed to close RFQ');
    }
    
    return response.data;
  }

  async extendDeadline(id: string, newDeadline: Date): Promise<RFQ> {
    const response = await api.put<ApiResponse<RFQ>>(`/rfqs/${id}/extend`, { 
      submissionDeadline: newDeadline.toISOString() 
    });
    
    if (!response.data) {
      throw new Error('Failed to extend deadline');
    }
    
    return response.data;
  }
}

export const rfqService = new RFQService();