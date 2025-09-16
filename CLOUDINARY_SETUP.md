# Cloudinary Setup Guide

## 1. Create Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your Cloudinary Credentials

1. After logging in, go to your **Dashboard**
2. You'll see your **Cloud Name**, **API Key**, and **API Secret**
3. Copy these values

## 3. Update Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_FOLDER=ecommerce_products
```

**Replace the placeholder values with your actual Cloudinary credentials.**

## 4. Example .env File

```env
# Database - Using SQLite for development
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# 2FA
TWO_FACTOR_SECRET="your-2fa-secret-key"

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=2097152

# Email (for OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="dheerajmande@gmail.com"
SMTP_PASS="wlfmjvsfkekhifmq"

# Payment Gateways
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# App Configuration
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3001"

# CORS
CORS_ORIGIN="http://localhost:3001"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_FOLDER=ecommerce_products
```

## 5. Test the Setup

After updating your `.env` file:

1. Restart your backend server
2. Try creating a product with images
3. Check your Cloudinary dashboard to see uploaded images

## 6. Features Included

✅ **Automatic Image Optimization**
- Images are automatically resized to 800x600
- Quality is optimized for web
- Format is automatically converted to the best format

✅ **Multiple Image Support**
- Upload up to 5 images per product
- Images are stored in organized folders

✅ **Image Management**
- Automatic cleanup when products are deleted
- Easy image replacement

✅ **Secure Storage**
- All images are stored securely on Cloudinary
- HTTPS URLs for all images

## 7. API Endpoints

### Create Product with Images
```
POST /api/v1/products/with-images
Content-Type: multipart/form-data

Form data:
- name: string
- description: string
- price: number
- stock: number
- categoryId: string
- status: string
- images: File[] (up to 5 files)
```

### Update Product with Images
```
PATCH /api/v1/products/:id/with-images
Content-Type: multipart/form-data

Form data:
- name: string (optional)
- description: string (optional)
- price: number (optional)
- stock: number (optional)
- categoryId: string (optional)
- status: string (optional)
- images: File[] (optional, up to 5 files)
```

## 8. Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**
   - Double-check your Cloudinary credentials in `.env`
   - Make sure there are no extra spaces or quotes

2. **"Upload failed" error**
   - Check your internet connection
   - Verify your Cloudinary account is active
   - Check file size (max 5MB per image)

3. **Images not displaying**
   - Check browser console for errors
   - Verify the image URLs are accessible
   - Make sure CORS is properly configured

### Support:
- Cloudinary Documentation: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- Free tier includes: 25 GB storage, 25 GB bandwidth per month
