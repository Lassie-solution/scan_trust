# OCR Product Scanner Setup Guide

This guide explains how to set up and use the **FREE** OCR (Optical Character Recognition) system for extracting product information from images using **Tesseract.js**.

## Features

✅ **FREE Browser-based OCR** - Tesseract.js runs entirely in your browser - no API keys needed!  
✅ **Image Preprocessing** - Automatic image enhancement and optimization  
✅ **Structured Data Extraction** - Extract product names, brands, ingredients, nutrition facts  
✅ **Confidence Scoring** - AI-powered confidence assessment with fallback logic  
✅ **Multiple Input Methods** - Upload images or enter barcodes manually  
✅ **Real-time Processing** - Live feedback with processing status and suggestions  
✅ **Offline Capable** - Works without internet connection once loaded  
✅ **No API Costs** - Completely free to use with unlimited processing  

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm run dev
```

That's it! **No API keys or cloud setup required!**

### 3. API Configuration

Set up your backend API:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_KEY=your-api-key-here
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

## Configuration Options

### Processing Settings

```env
# Minimum confidence score to accept results (0-100)
VITE_CONFIDENCE_THRESHOLD=70

# Maximum image file size in bytes (5MB default)
VITE_MAX_IMAGE_SIZE=5242880

# Supported image formats
VITE_SUPPORTED_FORMATS=jpeg,jpg,png,webp

# Enable image preprocessing (recommended)
VITE_ENABLE_PREPROCESSING=true

# Enable fallback mode for low confidence results
VITE_ENABLE_FALLBACK=true

# Maximum retry attempts
VITE_MAX_RETRIES=2
```

## Alternative OCR Services

### AWS Textract (Optional)

```env
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

### Azure Computer Vision (Optional)

```env
AZURE_COMPUTER_VISION_ENDPOINT=https://your-region.cognitiveservices.azure.com/
AZURE_COMPUTER_VISION_KEY=your-azure-key
```

## Usage Guide

### 1. Image Upload OCR

1. Click "Upload Image" in the scan interface
2. Select a clear photo of the product package
3. Wait for processing to complete
4. Review extracted data and confidence score

### 2. Barcode Lookup

1. Click "Enter Barcode" 
2. Enter the UPC/EAN barcode number
3. System will lookup product in database
4. If not found, fallback to image OCR

### 3. Best Practices for Image Capture

**✅ Good Images:**
- Well-lit, clear photos
- Straight-on angle (not tilted)
- Full product label visible
- No shadows or reflections
- Clean packaging surface

**❌ Avoid:**
- Blurry or out-of-focus images
- Extreme angles or distortion
- Poor lighting or shadows
- Cropped or partial labels
- Damaged or dirty packaging

## API Structure

### OCR Processing Flow

```
Image Upload → Preprocessing → OCR Extraction → Data Structuring → Confidence Assessment → Result
```

### Key Components

**OCR Service** (`src/services/ocrService.ts`)
- Google Vision API integration
- Text extraction and processing
- Structured data mapping

**Image Processing** (`src/utils/imageProcessing.ts`)
- Image preprocessing and enhancement
- Format conversion and optimization
- Quality improvement algorithms

**Data Extraction** (`src/utils/dataExtraction.ts`)
- Product information parsing
- Nutrition facts extraction
- Health recommendation scoring

**Confidence Manager** (`src/services/confidenceManager.ts`)
- Confidence scoring algorithms
- Fallback logic and suggestions
- Manual entry templates

### Extracted Data Format

```typescript
interface ProductData {
  productName?: string;
  brand?: string;
  ingredients: string[];
  nutritionFacts: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
    sugar?: string;
    fiber?: string;
    sodium?: string;
  };
  allergens: string[];
  expiryDate?: string;
  weight?: string;
  confidence: number;
}
```

## Backend API Endpoints

You'll need to implement these endpoints in your backend:

### Image Processing
```
POST /api/upload
POST /api/process/:uploadId
POST /api/retry/:uploadId
GET /api/status/:uploadId
```

### Product Lookup
```
GET /api/barcode/:barcode
```

### Manual Entry
```
POST /api/manual-entry
```

## Troubleshooting

### Common Issues

**1. OCR Service Unavailable**
- Check Google Cloud credentials
- Verify project ID and API enabled
- Ensure service account has proper permissions

**2. Low Confidence Results**
- Take clearer, well-lit photos
- Ensure product label is fully visible
- Try preprocessing enhancement
- Consider manual entry for complex products

**3. API Connection Issues**
- Check API base URL configuration
- Verify API key authentication
- Ensure backend service is running

### Debug Mode

Set environment to development for detailed logging:
```env
NODE_ENV=development
```

## Performance Optimization

### Image Preprocessing
- Images are automatically resized to optimize processing time
- Quality enhancement improves OCR accuracy
- Text region detection focuses processing on relevant areas

### Caching Strategy
- Implement result caching for repeated scans
- Cache barcode lookups to reduce API calls
- Store preprocessed images temporarily

### Error Handling
- Graceful fallback to manual entry
- Retry logic for transient failures
- User-friendly error messages with suggestions

## Security Considerations

### API Keys
- Never expose API keys in frontend code
- Use environment variables for sensitive data
- Implement proper backend authentication

### Image Handling
- Validate file types and sizes
- Sanitize uploaded content
- Implement rate limiting for OCR requests

### Data Privacy
- Don't store sensitive product images
- Implement data retention policies
- Ensure GDPR compliance for user data

## Cost Management

### Google Vision API
- Monitor API usage in Google Cloud Console
- Set up billing alerts and quotas
- Optimize image sizes to reduce processing costs

### Optimization Tips
- Preprocess images to improve first-pass accuracy
- Implement confidence thresholds to avoid unnecessary retries
- Cache frequently scanned products

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review console logs for error details
3. Verify environment configuration
4. Test with sample images in good conditions

## Example Implementation

See `src/components/OCRDemo.tsx` for a complete implementation example showing:
- File upload handling
- Processing state management
- Result display and error handling
- Retry logic and user feedback