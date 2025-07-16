# Expert Marketplace - FoodXchange

A comprehensive expert marketplace feature that connects food industry professionals with clients seeking specialized expertise. Built with React 18, TypeScript, and Material-UI v7.

## 🎯 Overview

The Expert Marketplace enables:
- **Expert Discovery**: Advanced search and filtering for food industry experts
- **Real-time Collaboration**: Chat, video calls, document sharing, and project management
- **Booking System**: Calendar-based scheduling with availability management
- **Service Management**: Detailed service listings with pricing and deliverables
- **Review System**: Comprehensive rating and feedback mechanism

## 🏗️ Architecture

### Atomic Design Pattern
```
components/
├── atoms/           # Basic building blocks (ExpertAvatar, RatingDisplay, etc.)
├── molecules/       # Component combinations (ExpertCard, ChatPanel, etc.)
├── organisms/       # Complex components (ExpertProfile, CollaborationWorkspace, etc.)
└── templates/       # Page layouts and structures
```

### Feature Structure
```
src/features/expert-marketplace/
├── components/      # All UI components
├── contexts/        # React contexts for state management
├── hooks/          # Custom hooks for data fetching and logic
├── pages/          # Main page components
├── services/       # API integration layer
├── types/          # TypeScript type definitions
├── utils/          # Helper functions and utilities
├── routes.tsx      # Route definitions
└── index.ts        # Barrel exports
```

## 🔧 Technical Implementation

### Type Safety
- **15+ TypeScript interfaces** covering all data structures
- **Strict typing** for API calls and component props
- **Zod validation schemas** for runtime type checking

### State Management
- **Context-based architecture** with three main contexts:
  - `ExpertContext` - Expert search, filtering, and selection
  - `CollaborationContext` - Project management and real-time features
  - `BookingContext` - Scheduling and availability management
- **Custom hooks** for business logic encapsulation
- **Optimistic updates** for smooth user experience

### Real-time Features
- **WebSocket integration** for live collaboration
- **Typing indicators** and presence awareness
- **Real-time notifications** and updates
- **Auto-reconnection** with fallback handling

### Material-UI Integration
- **100% MUI components** - NO CSS files allowed
- **Consistent theming** using MUI theme system
- **Responsive design** with MUI breakpoints
- **Accessibility** built-in with MUI components

## 📱 Components Reference

### Atoms (Basic Building Blocks)
- `ExpertAvatar` - Profile images with verification and online status
- `RatingDisplay` - Star ratings with review counts
- `PriceDisplay` - Formatted pricing with multiple variants
- `AvailabilityBadge` - Real-time availability indicators
- `ExpertiseBadge` - Category and experience badges

### Molecules (Component Combinations)
- `ExpertCard` - Comprehensive expert display cards
- `ExpertSearchBar` - Advanced search with suggestions
- `ServiceList` - Service listings with booking actions
- `ChatPanel` - Real-time messaging interface
- `DocumentsPanel` - File sharing and management
- `BookingCalendar` - Interactive calendar with time slots

### Organisms (Complex Components)
- `ExpertProfile` - Complete expert profile with tabs
- `ExpertFilters` - Advanced filtering sidebar
- `CollaborationWorkspace` - Full collaboration environment
- `BookingManagement` - Booking dashboard and management

## 🎨 Design Guidelines

### Styling Rules
- ✅ **Use Material-UI components only**
- ✅ **Use MUI's `sx` prop for custom styling**
- ✅ **Follow MUI theme for colors and spacing**
- ❌ **NO CSS files (.css, .scss, .sass)**
- ❌ **NO className props for styling**
- ❌ **NO Tailwind CSS or other frameworks**

### Component Patterns
```tsx
// ✅ Correct MUI styling
<Box sx={{ p: 2, bgcolor: 'primary.light' }}>
  <Typography variant="h6">Expert Name</Typography>
</Box>

// ❌ Avoid CSS classes
<div className="expert-card">
  <h3 className="expert-name">Expert Name</h3>
</div>
```

## 🚀 Getting Started

### 1. Basic Expert Search
```tsx
import { ExpertDiscovery } from '@/features/expert-marketplace';

function App() {
  return <ExpertDiscovery />;
}
```

### 2. Expert Profile Display
```tsx
import { ExpertProfile } from '@/features/expert-marketplace';

function ExpertPage() {
  return (
    <ExpertProfile
      expertId="expert-123"
      onBook={() => console.log('Booking...')}
      onMessage={() => console.log('Messaging...')}
    />
  );
}
```

### 3. Collaboration Workspace
```tsx
import { CollaborationWorkspace } from '@/features/expert-marketplace';

function CollaborationPage() {
  return (
    <CollaborationWorkspace
      collaborationId="collab-123"
      onUpdateCollaboration={(updates) => console.log(updates)}
    />
  );
}
```

## 🔌 API Integration

### Expert API
```tsx
import { expertApi } from '@/features/expert-marketplace/services';

// Search experts
const results = await expertApi.searchExperts({
  query: 'supply chain',
  categories: ['Supply Chain Optimization'],
  minRating: 4.0,
});

// Get expert profile
const expert = await expertApi.getExpertById('expert-123');

// Create booking
const booking = await expertApi.createBooking({
  expertId: 'expert-123',
  scheduledDate: '2024-01-15',
  timeSlot: { start: '10:00', end: '11:00' },
  type: 'consultation',
});
```

### Custom Hooks
```tsx
import { useExperts, useCollaboration, useBookings } from '@/features/expert-marketplace/hooks';

function ExpertComponent() {
  const { experts, loading, searchExperts } = useExperts();
  const { collaboration, sendMessage } = useCollaboration('collab-123');
  const { bookings, createBooking } = useBookings();
  
  // Use the hooks as needed
}
```

## 🔄 State Management

### Provider Setup
```tsx
import { ExpertMarketplaceProvider } from '@/features/expert-marketplace/providers';

function App() {
  return (
    <ExpertMarketplaceProvider>
      {/* Your app components */}
    </ExpertMarketplaceProvider>
  );
}
```

### Context Usage
```tsx
import { useExpertContext, useCollaborationContext } from '@/features/expert-marketplace/contexts';

function MyComponent() {
  const { experts, searchExperts } = useExpertContext();
  const { sendMessage, uploadDocument } = useCollaborationContext();
  
  // Component logic
}
```

## 📋 Data Models

### Core Types
- `Expert` - Expert profile information
- `Service` - Service offerings and pricing
- `Collaboration` - Project and collaboration data
- `Booking` - Scheduling and appointment data
- `Message` - Chat and communication data
- `Document` - File sharing and management

### Validation Schemas
All forms use Zod schemas for validation:
```tsx
import { expertProfileSchema, serviceSchema, bookingSchema } from '@/features/expert-marketplace/utils';

// Validate expert profile
const result = expertProfileSchema.parse(profileData);
```

## 🌐 Real-time Features

### WebSocket Integration
```tsx
import { useCollaborationWebSocket } from '@/features/expert-marketplace/hooks';

function CollaborationComponent({ collaborationId }) {
  const { isConnected, typingUsers, sendTypingIndicator } = useCollaborationWebSocket(collaborationId);
  
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
      {typingUsers.length > 0 && <span>{typingUsers.join(', ')} typing...</span>}
    </div>
  );
}
```

## 📱 Mobile Optimization

### Responsive Design
- **Mobile-first approach** with MUI breakpoints
- **Touch-optimized interactions** for all components
- **Drawer navigation** for mobile sidebar layouts
- **Adaptive layouts** that work on all screen sizes

### Performance
- **Lazy loading** for route-based code splitting
- **Debounced search** to reduce API calls
- **Infinite scroll** for large result sets
- **Skeleton loading** for better perceived performance

## 🔒 Security & Validation

### Input Validation
```tsx
import { validateFileType, validateFileSize } from '@/features/expert-marketplace/utils';

// File upload validation
const isValid = validateFileType(file, ['application/pdf', 'image/jpeg']) &&
                validateFileSize(file, 10); // 10MB limit
```

### Error Handling
- **Comprehensive error boundaries** for graceful failures
- **API error handling** with user-friendly messages
- **Form validation** with real-time feedback
- **Network failure recovery** with retry mechanisms

## 🧪 Testing

### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import { ExpertCard } from '@/features/expert-marketplace/components';

test('renders expert card with correct information', () => {
  const expert = { /* mock expert data */ };
  render(<ExpertCard expert={expert} />);
  
  expect(screen.getByText(expert.name)).toBeInTheDocument();
});
```

### Hook Testing
```tsx
import { renderHook } from '@testing-library/react';
import { useExperts } from '@/features/expert-marketplace/hooks';

test('useExperts hook fetches experts correctly', async () => {
  const { result } = renderHook(() => useExperts());
  
  expect(result.current.loading).toBe(true);
  // Add more assertions
});
```

## 🚀 Performance Best Practices

### Code Splitting
```tsx
// Routes are lazy-loaded automatically
const ExpertProfile = lazy(() => import('./pages/ExpertProfile'));
```

### Optimization Techniques
- **Memoization** for expensive calculations
- **Virtual scrolling** for large lists
- **Image optimization** with lazy loading
- **Caching** for API responses

## 📚 Additional Resources

### Documentation
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Code Examples
- See `src/features/expert-marketplace/pages/` for complete page examples
- Check `src/features/expert-marketplace/components/` for component patterns
- Review `src/features/expert-marketplace/hooks/` for custom hook implementations

## 🤝 Contributing

1. **Follow the atomic design pattern** for new components
2. **Use TypeScript** for all new code with proper typing
3. **Follow Material-UI guidelines** - no CSS files allowed
4. **Add comprehensive error handling** for all user interactions
5. **Include unit tests** for new components and hooks
6. **Update documentation** when adding new features

## 🐛 Troubleshooting

### Common Issues
1. **WebSocket connection failures** - Check network and authentication
2. **File upload errors** - Verify file size and type restrictions
3. **Search performance** - Ensure debouncing is working correctly
4. **Mobile layout issues** - Test across different screen sizes

### Debug Tools
- Use React DevTools for component debugging
- Check browser console for detailed error messages
- Monitor network tab for API call issues
- Use MUI theme debugging for styling issues

---

Built with ❤️ for the FoodXchange platform using React 18, TypeScript, and Material-UI v7.