# Authentication Setup Guide

This guide explains how to set up and use authentication in the FDX Frontend application.

## Overview

The application supports both mock authentication (for development) and real API authentication (for production).

## Configuration

### Environment Variables

Update your `.env` file with the following settings:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Authentication Mode
REACT_APP_USE_MOCK_AUTH=false  # Set to 'true' for mock auth, 'false' for real API
```

## Running the Application

### Development Mode with Real API

To run both the frontend and API server together:

```bash
npm run dev:all
```

This will start:
- Frontend on http://localhost:3005
- API server on http://localhost:5000

### Running Separately

**Frontend only:**
```bash
npm start
```

**API server only:**
```bash
npm run api
```

## Default Users

The API server comes with the following default users:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@foodxchange.com | Admin123! | Admin | Full system access |
| buyer@example.com | Buyer123! | Buyer | Can view products, create RFQs |
| supplier@example.com | Supplier123! | Supplier | Can manage products, view RFQs |
| agent@example.com | Agent123! | Agent | Can manage leads and relationships |

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/validate` - Validate token
- `POST /api/auth/refresh` - Refresh token
- `PATCH /api/auth/users/:userId` - Update user profile
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/change-password` - Change password

### Request/Response Format

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "buyer",
      "company": "Company Name",
      "permissions": ["view_products", "create_rfq"],
      "avatar": "https://ui-avatars.com/api/..."
    },
    "token": "jwt-token",
    "refreshToken": "refresh-jwt-token"
  }
}
```

## Security Notes

1. **JWT Secret**: Change the `JWT_SECRET` in production
2. **HTTPS**: Use HTTPS in production
3. **Token Storage**: Tokens are stored in localStorage
4. **Token Expiry**: Access tokens expire in 24 hours, refresh tokens in 7 days

## Switching Between Mock and Real Authentication

To switch between mock and real authentication:

1. Update `REACT_APP_USE_MOCK_AUTH` in `.env`
2. Restart the application

## Production Deployment

For production deployment:

1. Set up a real database (PostgreSQL, MongoDB, etc.)
2. Update the API server to use the database instead of in-memory storage
3. Use environment variables for sensitive configuration
4. Enable CORS for your production domain
5. Use a process manager like PM2 or deploy to a cloud service

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the API server is running and CORS is properly configured
2. **Token Expired**: The application will automatically try to refresh the token
3. **Network Errors**: Check if both frontend and API server are running
4. **Port Conflicts**: Change ports in `.env` and `api-server.ts` if needed

### Debugging

Enable debug mode by setting:
```env
REACT_APP_DEBUG_MODE=true
```

This will log authentication-related actions to the console.