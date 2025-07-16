# FoodXchange Frontend

React 18 + TypeScript frontend for the FoodXchange B2B food commerce platform with comprehensive expert marketplace and AI-powered features.

## 🚀 Tech Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with comprehensive type definitions
- **Material-UI (MUI) v7** - Complete UI framework (NO CSS/Tailwind allowed)
- **Zustand** - Lightweight state management
- **React Router v7** - Client-side routing with lazy loading
- **React Hook Form + Zod** - Form handling with validation
- **WebSocket** - Real-time collaboration features
- **i18next** - Internationalization support
- **ESLint + Prettier** - Code formatting and linting
- **Craco** - Configuration overrides
- **Date-fns** - Date utilities

## 🏗️ Project Structure
```
src/
├── components/          # Reusable UI components
├── features/           # Business feature modules
│   ├── expert-marketplace/  # Expert marketplace (NEW)
│   ├── rfq/            # Request for Quote
│   ├── compliance/     # Compliance management
│   ├── logistics/      # Logistics tracking
│   ├── suppliers/      # Supplier management
│   ├── orders/         # Order management
│   ├── tracking/       # Sample tracking
│   └── validation/     # Spec validation
├── services/           # API clients and integrations
│   └── ai/            # AI-powered services
├── store/             # Zustand state stores
├── hooks/             # Custom React hooks
├── contexts/          # React contexts
├── layouts/           # Page layouts
├── pages/             # Main page components
├── router/            # Routing configuration
├── theme/             # MUI theme configuration
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── i18n/              # Internationalization
```

## 🆕 Expert Marketplace Features
Our new **Expert Marketplace** provides a comprehensive platform for connecting food industry professionals:

### Core Features
- **Expert Discovery**: Advanced search with faceted filtering
- **Expert Profiles**: Rich profiles with portfolios, reviews, and certifications
- **Real-time Collaboration**: Chat, video calls, document sharing, and project management
- **Booking System**: Calendar integration with availability checking
- **Service Management**: Service listings with detailed descriptions and pricing
- **Review System**: Comprehensive rating and feedback system
- **Payment Integration**: Secure booking and payment processing

### Technical Implementation
- **Atomic Design Pattern**: Components organized as atoms → molecules → organisms
- **Real-time Features**: WebSocket integration for live collaboration
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Material-UI Only**: No CSS files - fully MUI-based styling
- **Mobile Responsive**: Optimized for all device sizes
- **Performance**: Lazy loading, debounced search, and infinite scroll

## 🎨 Design System & Brand Guidelines
- **UI Framework**: Material-UI v7 (NO CSS/Tailwind CSS allowed)
- **Font**: Inter (loaded via @fontsource/inter)
- **Primary Colors**: 
  - Teal `#0d9aa2`
  - Orange `#fc8a10`
- **Design Pattern**: Atomic Design (atoms → molecules → organisms → templates)
- **Responsive**: Mobile-first approach with MUI breakpoints

## 🛠️ Development Guidelines

### Styling Rules
- ✅ **Use Material-UI components and styling**
- ✅ **Use MUI's `sx` prop for custom styling**
- ✅ **Use MUI theme for colors and spacing**
- ❌ **NO CSS files (.css, .scss, .sass)**
- ❌ **NO className props for styling**
- ❌ **NO Tailwind CSS classes**

### Code Standards
- TypeScript strict mode enabled
- ESLint and Prettier for code quality
- Functional components with hooks
- Custom hooks for business logic
- Error boundaries for robust error handling

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
npm install
```

### Development
```bash
npm start          # Start development server
npm run build      # Build for production
npm test          # Run tests
npm run lint      # Run ESLint
npm run type-check # TypeScript checking
```

### Quality Checks
```bash
npm run check:mui-only  # Verify no CSS files exist
npm run format         # Format code with Prettier
npm run test:coverage  # Run tests with coverage
```

## 🌍 Internationalization
Supported languages:
- English (default)
- Spanish
- French  
- German
- Chinese

## 📦 Key Dependencies
- `@mui/material` - UI components
- `@mui/icons-material` - Icons
- `react-router-dom` - Routing
- `zustand` - State management
- `react-hook-form` - Forms
- `zod` - Validation schemas
- `date-fns` - Date utilities
- `react-i18next` - Internationalization

## 🔧 Configuration Files
- `tsconfig.json` - TypeScript configuration
- `craco.config.js` - Build configuration overrides
- `.eslintrc.js` - ESLint rules
- `prettier.config.js` - Code formatting

## 📱 Features by Module

### RFQ (Request for Quote)
- Create and manage RFQs
- Supplier bidding system
- Quote comparison

### Expert Marketplace
- Expert discovery and profiles
- Real-time collaboration workspace
- Booking and scheduling system
- Service management

### Compliance
- Compliance dashboard
- Document verification
- Audit trails

### Logistics & Tracking
- Shipment tracking
- Temperature monitoring
- Sample tracking

### AI Services
- Demand forecasting
- Price optimization
- Supplier matching
- Document intelligence

## 🤝 Contributing
1. Follow Material-UI styling guidelines
2. Use TypeScript for all new code
3. Add tests for new features
4. Update documentation
5. Run quality checks before committing

## 📄 License
Proprietary - FoodXchange Platform
