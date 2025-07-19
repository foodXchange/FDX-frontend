/** @jsx React.createElement */
import { render, screen, fireEvent, waitFor } from '../../test-utils/render';
import { ErrorProvider, useStandardErrorHandler } from '../../hooks/useStandardErrorHandler';
import { mockErrorHandler } from '../../test-utils/mocks';

// Example component test
describe('ErrorProvider', () => {
  it('should render children without errors', () => {
    render(
      <ErrorProvider>
        <div>Test Content</div>
      </ErrorProvider>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should handle error reporting', async () => {
    const TestComponent = () => {
      const { reportError } = useStandardErrorHandler();
      
      return (
        <button onClick={() => reportError({ message: 'Test error' } as any)}>
          Trigger Error
        </button>
      );
    };

    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockErrorHandler.reportError).toHaveBeenCalled();
    });
  });
});
