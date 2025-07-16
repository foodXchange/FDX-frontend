import { FC, ReactNode } from 'react';
import {
  ExpertProvider,
  CollaborationProvider,
  BookingProvider,
} from '../contexts';

interface ExpertMarketplaceProviderProps {
  children: ReactNode;
}

export const ExpertMarketplaceProvider: FC<ExpertMarketplaceProviderProps> = ({
  children,
}) => {
  return (
    <ExpertProvider>
      <CollaborationProvider>
        <BookingProvider>
          {children}
        </BookingProvider>
      </CollaborationProvider>
    </ExpertProvider>
  );
};