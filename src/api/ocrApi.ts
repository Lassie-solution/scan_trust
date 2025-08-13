import { ProductData, ocrService } from '@/services/ocrService';
import { ProcessingResult, ConfidenceManager } from '@/services/confidenceManager';
import { DataExtractor } from '@/utils/dataExtraction';

export interface UploadResponse {
  success: boolean;
  uploadId: string;
  message: string;
}

export interface OCRProcessResponse {
  success: boolean;
  result: ProcessingResult;
  uploadId: string;
  processingTime: number;
}

export interface BarcodeResponse {
  success: boolean;
  found: boolean;
  productData?: {
    name: string;
    brand: string;
    upc: string;
    manufacturer: string;
    category: string;
    ingredients?: string[];
    nutritionFacts?: any;
  };
  message: string;
}

class OCRApi {
  private confidenceManager: ConfidenceManager;

  constructor() {
    this.confidenceManager = new ConfidenceManager();
  }

  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      // Simulate upload - in local processing, we just validate the file
      const uploadId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          uploadId: '',
          message: 'Invalid file type. Please upload an image.'
        };
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return {
          success: false,
          uploadId: '',
          message: 'File too large. Please upload an image under 10MB.'
        };
      }

      return {
        success: true,
        uploadId,
        message: 'Image ready for processing'
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        uploadId: '',
        message: 'Failed to prepare image for processing'
      };
    }
  }

  async processImage(
    uploadId: string,
    options?: {
      confidenceThreshold?: number;
      enablePreprocessing?: boolean;
      enableFallback?: boolean;
    }
  ): Promise<OCRProcessResponse> {
    try {
      const response: AxiosResponse<OCRProcessResponse> = await axios.post(
        `${this.baseURL}/process/${uploadId}`,
        {
          confidenceThreshold: options?.confidenceThreshold || 70,
          enablePreprocessing: options?.enablePreprocessing ?? true,
          enableFallback: options?.enableFallback ?? true,
          timestamp: Date.now()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Image processing error:', error);
      return {
        success: false,
        result: {
          success: false,
          confidence: 0,
          requiresManualEntry: true,
          suggestions: [],
          errors: [this.getErrorMessage(error)],
          warnings: [],
          retryable: true
        },
        uploadId,
        processingTime: 0
      };
    }
  }

  async processImageDirect(
    file: File,
    options?: {
      confidenceThreshold?: number;
      enablePreprocessing?: boolean;
      enableFallback?: boolean;
    }
  ): Promise<OCRProcessResponse> {
    const startTime = Date.now();
    
    try {
      const uploadResponse = await this.uploadImage(file);
      
      if (!uploadResponse.success) {
        return {
          success: false,
          result: {
            success: false,
            confidence: 0,
            requiresManualEntry: true,
            suggestions: [],
            errors: [uploadResponse.message],
            warnings: [],
            retryable: true
          },
          uploadId: '',
          processingTime: Date.now() - startTime
        };
      }

      // Process with Tesseract OCR locally
      const confidenceThreshold = options?.confidenceThreshold || 50;
      console.log('Starting local OCR processing...');
      
      const productData = await ocrService.processProductImage(file, confidenceThreshold);
      
      let result: ProcessingResult;
      
      if (productData) {
        // Format and validate the data
        const formattedData = DataExtractor.formatProductData(productData);
        const validation = DataExtractor.validateProductData(formattedData);
        
        result = this.confidenceManager.evaluateResult(formattedData, formattedData.confidence);
        result.data = formattedData;
        
        if (!validation.isValid) {
          result.errors.push(...validation.errors);
          result.warnings.push(...validation.warnings);
        }
      } else {
        result = {
          success: false,
          confidence: 0,
          requiresManualEntry: true,
          suggestions: [
            'Try taking a clearer photo with better lighting',
            'Ensure the product label is fully visible',
            'Hold the camera steady and focus on the text',
            'Consider manual entry if OCR continues to fail'
          ],
          errors: ['Failed to extract readable text from image'],
          warnings: [],
          retryable: true
        };
      }

      return {
        success: result.success,
        result,
        uploadId: uploadResponse.uploadId,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('Direct processing error:', error);
      return {
        success: false,
        result: {
          success: false,
          confidence: 0,
          requiresManualEntry: true,
          suggestions: ['Please try again with a different image'],
          errors: [error instanceof Error ? error.message : 'Unknown processing error'],
          warnings: [],
          retryable: true
        },
        uploadId: '',
        processingTime: Date.now() - startTime
      };
    }
  }

  async lookupBarcode(barcode: string): Promise<BarcodeResponse> {
    try {
      // For demo purposes, simulate barcode lookup with sample data
      // In production, you would call a barcode API service like Open Food Facts
      console.log(`Looking up barcode: ${barcode}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample barcode database for demo
      const sampleProducts: Record<string, any> = {
        '123456789012': {
          name: 'Organic Granola Cereal',
          brand: 'Nature\'s Best',
          upc: '123456789012',
          manufacturer: 'Nature\'s Best Foods',
          category: 'Breakfast Cereals',
          ingredients: ['Organic oats', 'Honey', 'Almonds', 'Dried cranberries'],
          nutritionFacts: {
            calories: '150 per serving',
            protein: '4g',
            fiber: '3g',
            sugar: '8g'
          }
        },
        '987654321098': {
          name: 'Greek Yogurt Plain',
          brand: 'Farm Fresh',
          upc: '987654321098',
          manufacturer: 'Farm Fresh Dairy',
          category: 'Dairy Products',
          ingredients: ['Cultured pasteurized grade A milk', 'Live active cultures'],
          nutritionFacts: {
            calories: '100 per serving',
            protein: '15g',
            fat: '0g',
            sugar: '6g'
          }
        }
      };

      const productData = sampleProducts[barcode];
      
      if (productData) {
        return {
          success: true,
          found: true,
          productData,
          message: 'Product found successfully'
        };
      } else {
        return {
          success: true,
          found: false,
          message: 'Product not found in database'
        };
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      return {
        success: false,
        found: false,
        message: 'Failed to lookup barcode'
      };
    }
  }

  async submitManualEntry(productData: Partial<ProductData>): Promise<OCRProcessResponse> {
    const startTime = Date.now();
    
    try {
      console.log('Processing manual entry:', productData);
      
      // Validate the manual entry
      const validation = this.confidenceManager.validateManualEntry(productData);
      
      if (!validation.isValid) {
        return {
          success: false,
          result: {
            success: false,
            confidence: 0,
            requiresManualEntry: false,
            suggestions: [],
            errors: validation.errors,
            warnings: validation.warnings,
            retryable: false
          },
          uploadId: `manual_${Date.now()}`,
          processingTime: Date.now() - startTime
        };
      }

      // Create a complete ProductData object
      const completeData: ProductData = {
        productName: productData.productName || '',
        brand: productData.brand || '',
        ingredients: productData.ingredients || [],
        nutritionFacts: productData.nutritionFacts || {},
        allergens: productData.allergens || [],
        expiryDate: productData.expiryDate || '',
        weight: productData.weight || '',
        confidence: 100 // Manual entry gets 100% confidence
      };

      // Format and generate recommendations
      const formattedData = DataExtractor.formatProductData(completeData);
      const result: ProcessingResult = {
        success: true,
        data: formattedData,
        confidence: 100,
        requiresManualEntry: false,
        suggestions: [],
        errors: [],
        warnings: validation.warnings,
        retryable: false
      };

      return {
        success: true,
        result,
        uploadId: `manual_${Date.now()}`,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('Manual entry error:', error);
      return {
        success: false,
        result: {
          success: false,
          confidence: 0,
          requiresManualEntry: false,
          suggestions: [],
          errors: [error instanceof Error ? error.message : 'Manual entry processing failed'],
          warnings: [],
          retryable: false
        },
        uploadId: `manual_${Date.now()}`,
        processingTime: Date.now() - startTime
      };
    }
  }

  async getProcessingStatus(uploadId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/status/${uploadId}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Status check error:', error);
      return {
        status: 'failed',
        message: this.getErrorMessage(error)
      };
    }
  }

  async retryProcessing(uploadId: string): Promise<OCRProcessResponse> {
    try {
      const response: AxiosResponse<OCRProcessResponse> = await axios.post(
        `${this.baseURL}/retry/${uploadId}`,
        { timestamp: Date.now() },
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Retry processing error:', error);
      return {
        success: false,
        result: {
          success: false,
          confidence: 0,
          requiresManualEntry: true,
          suggestions: [],
          errors: [this.getErrorMessage(error)],
          warnings: [],
          retryable: false
        },
        uploadId,
        processingTime: 0
      };
    }
  }

  // Utility method for cleanup
  async cleanup(): Promise<void> {
    try {
      await ocrService.terminate();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

export const ocrApi = new OCRApi();

export const useOCRProcessing = () => {
  const processImage = async (
    file: File,
    options?: Parameters<typeof ocrApi.processImageDirect>[1]
  ) => {
    return await ocrApi.processImageDirect(file, options);
  };

  const lookupBarcode = async (barcode: string) => {
    return await ocrApi.lookupBarcode(barcode);
  };

  const submitManualEntry = async (data: Partial<ProductData>) => {
    return await ocrApi.submitManualEntry(data);
  };

  return {
    processImage,
    lookupBarcode,
    submitManualEntry
  };
};