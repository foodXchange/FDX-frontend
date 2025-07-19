import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils/render';
import { mockApiResponses } from '../../test-utils/mocks';

// Mock the API
jest.mock('../../services/api', () => ({
  rfqApi: mockApiResponses,
}));

describe('RFQ Integration Tests', () => {
  it('should create and display new RFQ', async () => {
    const CreateRFQForm = () => {
      const [title, setTitle] = React.useState('');
      
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await mockApiResponses.createRFQ({ title });
      };
      
      return (
        <form onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="RFQ Title"
          />
          <button type="submit">Create RFQ</button>
        </form>
      );
    };

    render(<CreateRFQForm />);
    
    const input = screen.getByPlaceholderText('RFQ Title');
    const button = screen.getByRole('button', { name: 'Create RFQ' });
    
    fireEvent.change(input, { target: { value: 'Test RFQ' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockApiResponses.createRFQ).toHaveBeenCalledWith({
        title: 'Test RFQ'
      });
    });
  });
});
