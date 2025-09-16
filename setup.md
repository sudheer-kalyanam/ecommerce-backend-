# Multi-Vendor eCommerce Backend Setup Guide

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed database with sample data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api/v1`

## 🔑 Sample Credentials

After seeding, you can use these credentials:

- **Admin**: admin@ecommerce.com / admin123
- **Seller**: seller@ecommerce.com / seller123  
- **Customer**: customer@ecommerce.com / customer123

## 🧪 API Testing

### Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"admin123"}'
```

### Products
```bash
# Get all products
curl http://localhost:3000/api/v1/products

# Search products
curl "http://localhost:3000/api/v1/products/search?q=iphone"
```

### Categories
```bash
# Get all categories
curl http://localhost:3000/api/v1/categories
```

### Admin Endpoints
```bash
# Get dashboard stats (requires admin token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/v1/admin/dashboard

# Get pending sellers
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/v1/admin/pending-sellers
```

## 🔧 Features Implemented

### ✅ Authentication & Security
- JWT-based authentication with role-based access control
- 2FA (mock OTP) for Seller & Customer login
- Seller approval system by admin
- Role-Based Access Control (RBAC) with multiple admin roles

### ✅ Core Functionality
- User management (Admin, Seller, Customer)
- Product management with approval workflow
- Category management
- Order management and tracking
- Shopping cart and wishlist
- File upload for seller documents (PDF, max 2MB)

### ✅ Payment & Delivery
- Stripe payment integration
- Razorpay payment integration
- Cash on Delivery (COD)
- Mock delivery service with order tracking
- Estimated Delivery Date (EDD) calculation

### ✅ Admin Features
- Dashboard with analytics
- Seller approval/rejection
- Product approval/rejection
- Role management with granular permissions
- User management

## 🏗️ Architecture

### Modules
- **Auth Module**: Authentication, 2FA, JWT
- **Admin Module**: Admin dashboard, RBAC, approvals
- **Products Module**: Product CRUD, approval workflow
- **Sellers Module**: Seller management, document upload
- **Orders Module**: Order processing, tracking
- **Payments Module**: Stripe/Razorpay integration
- **Delivery Module**: Mock delivery service, EDD
- **Upload Module**: File upload handling

### Database Schema
- **Users**: Authentication and profile data
- **Products**: Product information with approval status
- **Orders**: Order management and tracking
- **Payments**: Payment processing and history
- **AdminRoles**: Role-based access control
- **Documents**: Seller document storage

## 🔒 Security Features

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- 2FA with mock OTP system
- Role-based access control

### Authorization
- Guards for route protection
- Permission-based access control
- Admin role management
- Granular permissions system

### Data Protection
- Input validation with class-validator
- SQL injection prevention with Prisma
- File upload restrictions (PDF only, 2MB max)
- CORS configuration

## 🚀 Frontend Integration

The backend is designed to work with the provided Next.js frontend. Make sure to:

1. Update the frontend's API base URL to `http://localhost:3000/api/v1`
2. Ensure CORS is properly configured in the backend
3. Use the provided sample credentials for testing

## 🏭 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use production database credentials
3. Set strong JWT secrets
4. Configure production payment gateway keys
5. Set up proper email service
6. Use HTTPS for security
7. Configure proper file storage
8. Set up monitoring and logging

## 🐛 Troubleshooting

### Common Issues

1. **Database connection error**: Check your DATABASE_URL in .env
2. **JWT errors**: Ensure JWT_SECRET is set
3. **File upload issues**: Check uploads directory permissions
4. **Email not working**: Configure SMTP settings in .env
5. **Payment gateway errors**: Check API keys in .env
6. **CORS issues**: Verify CORS_ORIGIN setting

### Logs

Check the console output for detailed error messages and logs.

### Health Check

The API provides a health check endpoint:
```bash
curl http://localhost:3000/api/v1/health
```

## 📊 Monitoring

### Key Metrics to Monitor
- API response times
- Database connection pool
- Payment success rates
- File upload success rates
- Authentication failure rates

### Logging
- Request/response logging
- Error logging with stack traces
- Authentication attempts
- Payment processing logs
- File upload logs

## 🔄 API Versioning

The API uses versioning in the URL path:
- Current version: `/api/v1/`
- Future versions: `/api/v2/`, etc.

## 📝 API Documentation

Swagger documentation is available at:
- Development: `http://localhost:3000/api/v1/docs`
- Production: `https://your-domain.com/api/v1/docs`
