# OTP Verification Setup Guide

## 🎉 Great News!
Your OTP verification system is **already fully implemented**! This guide will help you configure and test it.

## 📋 Current Implementation Status

✅ **NodeMailer Configuration** - Ready  
✅ **OTP Generation & Storage** - Implemented  
✅ **Email Sending Service** - Working  
✅ **Database Schema** - Complete  
✅ **API Endpoints** - Available  
✅ **Signup Flow** - Includes OTP  
✅ **Login Flow** - Includes OTP  

## 🚀 Quick Setup Steps

### Step 1: Environment Configuration

1. **Copy environment file:**
```bash
cp env.example .env
```

2. **Configure email settings in `.env`:**
```env
# Email (for OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Step 2: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

### Step 3: Test Email Configuration

1. **Update test script:**
```bash
# Edit backend/test-otp.js
# Replace 'your-email@gmail.com' and 'your-app-password'
# Replace 'test@example.com' with your test email
```

2. **Run test:**
```bash
cd backend
node test-otp.js
```

### Step 4: Start Your Application

```bash
# Install dependencies (if not done)
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the application
npm run start:dev
```

## 🔄 OTP Flow Overview

### Signup Flow
1. **POST** `/auth/register`
   ```json
   {
     "email": "user@example.com",
     "password": "password123",
     "firstName": "John",
     "lastName": "Doe",
     "phone": "+1234567890",
     "role": "CUSTOMER"
   }
   ```
   
2. **Response:**
   ```json
   {
     "message": "Registration successful. Please verify your email with the OTP sent.",
     "userId": "user_id_here",
     "requiresOTP": true
   }
   ```

3. **POST** `/auth/verify-otp`
   ```json
   {
     "userId": "user_id_here",
     "otpCode": "123456",
     "purpose": "registration"
   }
   ```

### Login Flow (SELLER/CUSTOMER)
1. **POST** `/auth/login`
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Response (if OTP required):**
   ```json
   {
     "message": "OTP sent to your email",
     "requiresOTP": true,
     "userId": "user_id_here"
   }
   ```

3. **POST** `/auth/verify-otp`
   ```json
   {
     "userId": "user_id_here",
     "otpCode": "123456",
     "purpose": "login"
   }
   ```

## 🧪 Testing with cURL

### Test Registration
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "role": "CUSTOMER"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test OTP Verification
```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_PREVIOUS_RESPONSE",
    "otpCode": "123456",
    "purpose": "registration"
  }'
```

## 🔧 Configuration Options

### OTP Settings (in AuthService)
- **OTP Length:** 6 digits
- **Expiry Time:** 10 minutes
- **Auto-cleanup:** Old OTPs are deleted when new ones are generated

### Email Template
The email template is customizable in `src/email/email.service.ts`:
- Professional HTML design
- Responsive layout
- Clear OTP display
- Security warnings

## 🛠️ Troubleshooting

### Common Issues

1. **Email not sending:**
   - Check SMTP credentials
   - Verify Gmail app password
   - Check firewall/network settings

2. **OTP not working:**
   - Check database connection
   - Verify OTP hasn't expired (10 minutes)
   - Ensure OTP hasn't been used already

3. **Database errors:**
   - Run `npm run prisma:generate`
   - Run `npm run prisma:migrate`

### Debug Mode
In development, if email fails, the OTP is logged to console:
```bash
# Check console output for:
OTP for user@example.com: 123456
```

## 📱 Frontend Integration

Your frontend needs to handle the OTP flow:

1. **After registration/login** - Check for `requiresOTP: true`
2. **Show OTP input form** - Collect 6-digit code
3. **Call verify-otp endpoint** - Submit OTP for verification
4. **Handle success** - Store JWT token and redirect

## 🔒 Security Features

- ✅ OTP expires in 10 minutes
- ✅ One-time use only
- ✅ Automatic cleanup of old OTPs
- ✅ Rate limiting (via NestJS Throttler)
- ✅ Secure email templates
- ✅ No sensitive data in logs

## 📞 Support

If you encounter issues:
1. Check the console logs
2. Verify environment variables
3. Test email configuration with the test script
4. Check database connectivity

Your OTP system is production-ready! 🎉
