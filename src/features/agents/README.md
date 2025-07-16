# Agent Module

A comprehensive mobile-first Progressive Web App (PWA) for FDX agents to manage leads, track commissions, and communicate via WhatsApp.

## Features

### 🎯 Core Functionality
- **Agent Portal**: Secure authentication and profile management
- **Onboarding Flow**: Multi-step wizard for new agent setup
- **Real-time Dashboard**: Performance metrics and notifications
- **Lead Management**: Drag-and-drop Kanban board with filtering
- **WhatsApp Integration**: Native chat interface with templates
- **Commission Tracking**: Detailed analytics and payment history

### 📱 Mobile-First Design
- **Responsive UI**: Optimized for mobile devices using Material-UI
- **Touch-friendly**: Large touch targets and gestures
- **Offline Support**: Service worker with caching strategies
- **PWA Features**: App shortcuts, push notifications, background sync

### 🔄 Real-time Features
- **WebSocket Connection**: Live updates for leads and notifications
- **Push Notifications**: Browser and PWA notifications
- **Background Sync**: Offline actions sync when online
- **Live Chat**: Real-time WhatsApp conversations

## Architecture

### Directory Structure
```
src/features/agents/
├── components/
│   ├── atoms/           # Basic UI components
│   ├── molecules/       # Composite components
│   ├── organisms/       # Complex components
│   └── templates/       # Page layouts
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── store/              # Zustand state management
├── types/              # TypeScript interfaces
└── utils/              # Utility functions
```

### State Management
- **Zustand**: Lightweight state management with persistence
- **Real-time Updates**: WebSocket integration with automatic sync
- **Offline Storage**: LocalStorage for offline functionality

### API Integration
- **RESTful API**: Complete CRUD operations for all entities
- **WebSocket**: Real-time updates and notifications
- **WhatsApp Business API**: Message sending and template management
- **Error Handling**: Comprehensive error handling and retry logic

## Components

### Pages
- `AgentPortal.tsx` - Authentication and landing page
- `AgentOnboarding.tsx` - Multi-step onboarding wizard
- `AgentDashboard.tsx` - Main dashboard with metrics
- `LeadManagement.tsx` - Lead management with Kanban view
- `WhatsAppIntegration.tsx` - WhatsApp chat interface
- `CommissionTracking.tsx` - Commission analytics and history

### Key Components
- `LeadKanban.tsx` - Drag-and-drop lead management
- `WhatsAppChat.tsx` - Real-time chat interface
- State management with Zustand store
- PWA utilities for offline functionality

## Configuration

### Environment Variables
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001

# WhatsApp Business API
REACT_APP_WHATSAPP_BUSINESS_ID=your_business_id
REACT_APP_WHATSAPP_ACCESS_TOKEN=your_access_token

# Push Notifications
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key

# Feature Flags
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=true
REACT_APP_ENABLE_OFFLINE_MODE=true
```

### PWA Configuration
- Service worker for offline functionality
- Web app manifest with shortcuts
- Push notification support
- Background sync capabilities

## Usage

### Basic Setup
```tsx
import { AgentPortal, useAgentStore } from '@/features/agents';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/agents" element={<AgentPortal />} />
        <Route path="/agents/dashboard" element={<AgentDashboard />} />
        <Route path="/agents/leads" element={<LeadManagement />} />
        <Route path="/agents/whatsapp" element={<WhatsAppIntegration />} />
        <Route path="/agents/commissions" element={<CommissionTracking />} />
      </Routes>
    </Router>
  );
}
```

### State Management
```tsx
import { useAgentStore } from '@/features/agents';

function MyComponent() {
  const { currentAgent, leads, updateLead } = useAgentStore();
  
  // Use agent data and actions
}
```

### PWA Features
```tsx
import { usePWA } from '@/features/agents';

function InstallPrompt() {
  const { canInstall, installApp } = usePWA();
  
  if (!canInstall) return null;
  
  return (
    <Button onClick={installApp}>
      Install App
    </Button>
  );
}
```

## API Endpoints

### Authentication
- `POST /agents/login` - Agent authentication
- `POST /agents/logout` - Sign out
- `GET /agents/me` - Current agent profile

### Dashboard
- `GET /agents/dashboard` - Dashboard data with metrics

### Leads
- `GET /agents/leads` - Search and filter leads
- `POST /agents/leads` - Create new lead
- `PATCH /agents/leads/:id` - Update lead
- `DELETE /agents/leads/:id` - Delete lead

### WhatsApp
- `GET /agents/whatsapp/templates` - Available templates
- `POST /agents/whatsapp/send` - Send message
- `GET /agents/whatsapp/messages/:leadId` - Message history

### Commissions
- `GET /agents/commissions` - Commission history
- `GET /agents/analytics/performance` - Performance metrics

## Mobile Features

### Touch Gestures
- Swipe actions on lead cards
- Pull-to-refresh on lists
- Touch-friendly drag and drop

### Responsive Design
- Mobile-first approach with Material-UI
- Adaptive layouts for different screen sizes
- Touch-optimized components

### Offline Functionality
- Offline lead viewing and editing
- Cached WhatsApp messages
- Background sync when connection restored

## Security

### Authentication
- JWT token-based authentication
- Secure token storage in localStorage
- Automatic token refresh

### Data Protection
- All API calls over HTTPS
- Input validation and sanitization
- XSS protection with Content Security Policy

## Performance

### Optimization
- Code splitting by route
- Lazy loading of components
- Image optimization and caching
- Service worker caching strategies

### Monitoring
- Real-time performance metrics
- Error tracking and reporting
- User analytics and usage patterns

## Development

### Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables
3. Start development server: `npm start`
4. Build for production: `npm run build`

### Testing
- Unit tests with Jest and React Testing Library
- Integration tests for API services
- E2E tests with Playwright

### Deployment
- PWA-ready build output
- Service worker for caching
- Offline functionality
- Push notification support

## Browser Support

### Minimum Requirements
- Chrome 63+ (mobile/desktop)
- Safari 13+ (iOS/macOS)
- Firefox 67+ (mobile/desktop)
- Edge 79+ (desktop)

### PWA Features
- Service Workers
- Web App Manifest
- Push Notifications
- Background Sync
- Share API

## Contributing

1. Follow the established file structure
2. Use TypeScript for all new code
3. Follow Material-UI design patterns
4. Ensure mobile responsiveness
5. Add appropriate tests
6. Update documentation

## License

This module is part of the FDX platform and follows the main project license.