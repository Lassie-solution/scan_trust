export interface EnvironmentConfig {
  // Google Cloud Configuration
  googleCloud: {
    projectId?: string;
    credentials?: string;
  };
  
  // API Configuration
  api: {
    baseUrl: string;
    apiKey?: string;
  };
  
  // Alternative OCR Services
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };
  
  azure?: {
    endpoint?: string;
    key?: string;
  };
  
  // Application Settings
  processing: {
    confidenceThreshold: number;
    maxImageSize: number;
    supportedFormats: string[];
    enablePreprocessing: boolean;
    enableFallback: boolean;
    maxRetries: number;
  };
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): EnvironmentConfig {
    const isProduction = import.meta.env.PROD;
    const isDevelopment = import.meta.env.DEV;

    return {
      googleCloud: {
        projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || 
                   (isDevelopment ? process.env.GOOGLE_CLOUD_PROJECT_ID : undefined),
        credentials: import.meta.env.VITE_GOOGLE_CLOUD_CREDENTIALS || 
                    (isDevelopment ? process.env.GOOGLE_CLOUD_CREDENTIALS : undefined),
      },
      
      api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
        apiKey: import.meta.env.VITE_API_KEY,
      },
      
      aws: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || 
                    (isDevelopment ? process.env.AWS_ACCESS_KEY_ID : undefined),
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || 
                        (isDevelopment ? process.env.AWS_SECRET_ACCESS_KEY : undefined),
        region: import.meta.env.VITE_AWS_REGION || 
               (isDevelopment ? process.env.AWS_REGION : undefined) || 'us-east-1',
      },
      
      azure: {
        endpoint: import.meta.env.VITE_AZURE_COMPUTER_VISION_ENDPOINT || 
                 (isDevelopment ? process.env.AZURE_COMPUTER_VISION_ENDPOINT : undefined),
        key: import.meta.env.VITE_AZURE_COMPUTER_VISION_KEY || 
            (isDevelopment ? process.env.AZURE_COMPUTER_VISION_KEY : undefined),
      },
      
      processing: {
        confidenceThreshold: parseInt(
          import.meta.env.VITE_CONFIDENCE_THRESHOLD || '70'
        ),
        maxImageSize: parseInt(
          import.meta.env.VITE_MAX_IMAGE_SIZE || '5242880' // 5MB
        ),
        supportedFormats: (
          import.meta.env.VITE_SUPPORTED_FORMATS || 'jpeg,jpg,png,webp'
        ).split(','),
        enablePreprocessing: 
          (import.meta.env.VITE_ENABLE_PREPROCESSING || 'true') === 'true',
        enableFallback: 
          (import.meta.env.VITE_ENABLE_FALLBACK || 'true') === 'true',
        maxRetries: parseInt(
          import.meta.env.VITE_MAX_RETRIES || '2'
        ),
      },
    };
  }

  private validateConfig(): void {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!this.config.api.baseUrl) {
      errors.push('API base URL is required');
    }

    if (!this.config.googleCloud.projectId && 
        !this.config.aws?.accessKeyId && 
        !this.config.azure?.endpoint) {
      warnings.push('No OCR service configured - OCR functionality will be limited');
    }

    if (this.config.googleCloud.projectId && !this.config.googleCloud.credentials) {
      warnings.push('Google Cloud project ID provided but credentials missing');
    }

    if (this.config.processing.confidenceThreshold < 0 || 
        this.config.processing.confidenceThreshold > 100) {
      warnings.push('Confidence threshold should be between 0 and 100');
    }

    if (this.config.processing.maxImageSize < 100000) {
      warnings.push('Max image size seems too small (less than 100KB)');
    }

    if (warnings.length > 0) {
      console.warn('Configuration warnings:', warnings);
    }

    if (errors.length > 0) {
      console.error('Configuration errors:', errors);
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<EnvironmentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.validateConfig();
  }

  isGoogleCloudConfigured(): boolean {
    return !!(this.config.googleCloud.projectId && this.config.googleCloud.credentials);
  }

  isAWSConfigured(): boolean {
    return !!(this.config.aws?.accessKeyId && this.config.aws?.secretAccessKey);
  }

  isAzureConfigured(): boolean {
    return !!(this.config.azure?.endpoint && this.config.azure?.key);
  }

  hasOCRService(): boolean {
    return this.isGoogleCloudConfigured() || this.isAWSConfigured() || this.isAzureConfigured();
  }

  getAvailableOCRServices(): string[] {
    const services: string[] = [];
    
    if (this.isGoogleCloudConfigured()) services.push('Google Vision');
    if (this.isAWSConfigured()) services.push('AWS Textract');
    if (this.isAzureConfigured()) services.push('Azure Computer Vision');
    
    return services;
  }

  validateImageFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (file.size > this.config.processing.maxImageSize) {
      errors.push(`Image size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum ${(this.config.processing.maxImageSize / 1024 / 1024).toFixed(1)}MB`);
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.config.processing.supportedFormats.includes(fileExtension)) {
      errors.push(`Unsupported file format. Supported formats: ${this.config.processing.supportedFormats.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getProcessingDefaults() {
    return {
      confidenceThreshold: this.config.processing.confidenceThreshold,
      enablePreprocessing: this.config.processing.enablePreprocessing,
      enableFallback: this.config.processing.enableFallback,
      maxRetries: this.config.processing.maxRetries,
    };
  }

  isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  isProduction(): boolean {
    return import.meta.env.PROD;
  }

  getEnvironmentInfo(): {
    mode: string;
    hasOCRService: boolean;
    availableServices: string[];
    apiConfigured: boolean;
  } {
    return {
      mode: import.meta.env.MODE,
      hasOCRService: this.hasOCRService(),
      availableServices: this.getAvailableOCRServices(),
      apiConfigured: !!this.config.api.apiKey,
    };
  }
}

export const environmentService = new EnvironmentService();
export default environmentService;