# 🚀 FoodXchange Frontend (FDX-frontend)

A modern React TypeScript application for the FoodXchange food trading platform.

## 🌟 Features

- **Modern React 18** with TypeScript
- **Tailwind CSS** for responsive styling
- **Authentication System** with JWT tokens
- **RFQ Management** - Request for Quotations
- **Product Marketplace** - Browse and discover food products
- **Order Management** - Track orders and shipments
- **Supplier Directory** - Connect with verified suppliers
- **AI-Powered Features** - Smart supplier matching and recommendations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: React Scripts / Webpack
- **State Management**: React Hooks + Context API
- **HTTP Client**: Fetch API
- **Icons**: Heroicons
- **Development**: ESLint + Prettier

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

`ash
# Clone the repository
git clone https://github.com/foodXchange/FDX-frontend.git
cd FDX-frontend

# Install dependencies
npm install

# Start development server
npm start
`

### Backend Setup

Make sure the FoodXchange backend is running on http://localhost:5000:

`ash
# In backend directory
cd ../Foodxchange-backend
node server.js
`

## 📱 Usage

1. **Start the application**: 
pm start
2. **Open browser**: Navigate to http://localhost:3000
3. **Login with demo credentials**:
   - Email: demo@foodxchange.com
   - Password: demo123

## 🏗️ Project Structure

`
FDX-frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   ├── features/        # Feature-specific components
│   │   ├── auth/        # Authentication
│   │   ├── rfq/         # Request for Quotations
│   │   ├── marketplace/ # Product marketplace
│   │   └── orders/      # Order management
│   ├── services/        # API services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── App.tsx          # Main application component
├── package.json
└── README.md
`

## 🔧 Available Scripts

- 
pm start - Start development server
- 
pm build - Build for production
- 
pm test - Run tests
- 
pm run eject - Eject from Create React App

## 🌐 API Integration

The frontend communicates with the FoodXchange backend API:

- **Base URL**: http://localhost:5000/api
- **Authentication**: JWT tokens stored in localStorage
- **Endpoints**: /auth, /rfqs, /products, /suppliers, /orders

## 🎨 Design System

- **Primary Colors**: Blue (#2563eb)
- **Secondary Colors**: Green (#059669), Orange (#ea580c)
- **Typography**: System fonts with Tailwind CSS
- **Icons**: Heroicons for consistent iconography

## 🧪 Testing

`ash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
`

## 📦 Building for Production

`ash
# Create production build
npm run build

# The build folder contains optimized production files
`

## 🚀 Deployment

The application can be deployed to various platforms:

- **Netlify**: Connect GitHub repo for automatic deployments
- **Vercel**: Zero-config deployment for React apps
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Docker**: Use provided Dockerfile for containerization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: git checkout -b feature/amazing-feature
3. Commit changes: git commit -m 'Add amazing feature'
4. Push to branch: git push origin feature/amazing-feature
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [FoodXchange Docs](https://docs.foodxchange.com)
- **Issues**: [GitHub Issues](https://github.com/foodXchange/FDX-frontend/issues)
- **Discord**: [FoodXchange Community](https://discord.gg/foodxchange)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors who help make FoodXchange better

---

**Made with ❤️ by the FoodXchange Team**
