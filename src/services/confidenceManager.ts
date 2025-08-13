import { ProductData } from './ocrService';
import { DataExtractor } from '@/utils/dataExtraction';

export interface ConfidenceThresholds {
  minimum: number;
  acceptable: number;
  good: number;
  excellent: number;
}

export interface FallbackOptions {
  enableManualEntry: boolean;
  enableRetry: boolean;
  maxRetries: number;
  suggestImageImprovement: boolean;
  providePartialResults: boolean;
}

export interface ProcessingResult {
  success: boolean;
  data?: ProductData;
  confidence: number;
  requiresManualEntry: boolean;
  suggestions: string[];
  errors: string[];
  warnings: string[];
  retryable: boolean;
}

export class ConfidenceManager {
  private static readonly DEFAULT_THRESHOLDS: ConfidenceThresholds = {
    minimum: 30,
    acceptable: 60,
    good: 80,
    excellent: 95
  };

  private static readonly DEFAULT_FALLBACK_OPTIONS: FallbackOptions = {
    enableManualEntry: true,
    enableRetry: true,
    maxRetries: 2,
    suggestImageImprovement: true,
    providePartialResults: true
  };

  private thresholds: ConfidenceThresholds;
  private fallbackOptions: FallbackOptions;

  constructor(
    thresholds?: Partial<ConfidenceThresholds>,
    fallbackOptions?: Partial<FallbackOptions>
  ) {
    this.thresholds = { ...ConfidenceManager.DEFAULT_THRESHOLDS, ...thresholds };
    this.fallbackOptions = { ...ConfidenceManager.DEFAULT_FALLBACK_OPTIONS, ...fallbackOptions };
  }

  evaluateResult(
    data: ProductData | null,
    rawConfidence: number,
    retryCount: number = 0
  ): ProcessingResult {
    const suggestions: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresManualEntry = false;
    let retryable = false;

    if (!data) {
      errors.push('No data extracted from image');
      requiresManualEntry = this.fallbackOptions.enableManualEntry;
      retryable = this.shouldRetry(retryCount);
      
      if (retryable) {
        suggestions.push(...this.getImageImprovementSuggestions());
      }

      return {
        success: false,
        confidence: 0,
        requiresManualEntry,
        suggestions,
        errors,
        warnings,
        retryable
      };
    }

    const validation = DataExtractor.validateProductData(data);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);

    const adjustedConfidence = this.calculateAdjustedConfidence(data, rawConfidence);
    const confidenceLevel = this.getConfidenceLevel(adjustedConfidence);

    if (adjustedConfidence < this.thresholds.minimum) {
      errors.push('Confidence too low for reliable results');
      requiresManualEntry = this.fallbackOptions.enableManualEntry;
      retryable = this.shouldRetry(retryCount);
    } else if (adjustedConfidence < this.thresholds.acceptable) {
      warnings.push('Low confidence results - manual verification recommended');
      requiresManualEntry = this.fallbackOptions.enableManualEntry;
      retryable = this.shouldRetry(retryCount);
    } else if (adjustedConfidence < this.thresholds.good) {
      warnings.push('Moderate confidence - some details may be inaccurate');
    }

    if (this.fallbackOptions.suggestImageImprovement && adjustedConfidence < this.thresholds.good) {
      suggestions.push(...this.getImageImprovementSuggestions());
    }

    suggestions.push(...this.getDataCompletionSuggestions(data));

    const success = validation.isValid && adjustedConfidence >= this.thresholds.minimum;

    return {
      success,
      data: success || this.fallbackOptions.providePartialResults ? data : undefined,
      confidence: adjustedConfidence,
      requiresManualEntry,
      suggestions,
      errors,
      warnings,
      retryable
    };
  }

  private calculateAdjustedConfidence(data: ProductData, rawConfidence: number): number {
    let adjustedConfidence = rawConfidence;

    if (data.productName) {
      adjustedConfidence += 5;
    }

    if (data.brand) {
      adjustedConfidence += 3;
    }

    if (data.ingredients.length > 0) {
      adjustedConfidence += Math.min(data.ingredients.length * 2, 15);
    }

    const nutritionFactsCount = Object.keys(data.nutritionFacts).length;
    if (nutritionFactsCount > 0) {
      adjustedConfidence += Math.min(nutritionFactsCount * 3, 20);
    }

    if (data.allergens.length > 0) {
      adjustedConfidence += 2;
    }

    if (data.weight) {
      adjustedConfidence += 3;
    }

    if (data.expiryDate) {
      adjustedConfidence += 3;
    }

    const productNameQuality = this.assessTextQuality(data.productName || '');
    const brandQuality = this.assessTextQuality(data.brand || '');
    const avgIngredientQuality = data.ingredients.length > 0
      ? data.ingredients.reduce((sum, ing) => sum + this.assessTextQuality(ing), 0) / data.ingredients.length
      : 0;

    const qualityAdjustment = (productNameQuality + brandQuality + avgIngredientQuality) / 3;
    adjustedConfidence += qualityAdjustment * 10;

    return Math.max(0, Math.min(100, Math.round(adjustedConfidence)));
  }

  private assessTextQuality(text: string): number {
    if (!text) return 0;

    let quality = 0.5;

    if (text.length >= 3 && text.length <= 50) {
      quality += 0.2;
    }

    if (/^[A-Za-z\s\-'&.]+$/.test(text)) {
      quality += 0.3;
    }

    if (text.match(/[A-Z]/)) {
      quality += 0.1;
    }

    if (!text.match(/\d{3,}/)) {
      quality += 0.1;
    }

    return Math.max(0, Math.min(1, quality));
  }

  private getConfidenceLevel(confidence: number): string {
    if (confidence >= this.thresholds.excellent) return 'excellent';
    if (confidence >= this.thresholds.good) return 'good';
    if (confidence >= this.thresholds.acceptable) return 'acceptable';
    if (confidence >= this.thresholds.minimum) return 'low';
    return 'insufficient';
  }

  private shouldRetry(retryCount: number): boolean {
    return this.fallbackOptions.enableRetry && retryCount < this.fallbackOptions.maxRetries;
  }

  private getImageImprovementSuggestions(): string[] {
    return [
      'Ensure good lighting when taking the photo',
      'Hold the camera steady and focus clearly',
      'Capture the entire label in the frame',
      'Avoid shadows and reflections on the packaging',
      'Take the photo straight-on (not at an angle)',
      'Make sure text is clearly visible and readable',
      'Clean the packaging surface before scanning',
      'Use the back of the package for ingredient information'
    ];
  }

  private getDataCompletionSuggestions(data: ProductData): string[] {
    const suggestions: string[] = [];

    if (!data.productName) {
      suggestions.push('Product name not detected - check the front of the package');
    }

    if (!data.brand) {
      suggestions.push('Brand name not found - look for manufacturer information');
    }

    if (data.ingredients.length === 0) {
      suggestions.push('Ingredients list not found - check the back or side of the package');
    }

    if (Object.keys(data.nutritionFacts).length === 0) {
      suggestions.push('Nutrition facts not detected - look for nutrition label');
    }

    if (!data.weight) {
      suggestions.push('Product weight/size not found - check package for net weight');
    }

    if (data.ingredients.length > 0 && data.ingredients.length < 3) {
      suggestions.push('Incomplete ingredients list - ensure full ingredients panel is visible');
    }

    return suggestions;
  }

  createManualEntryTemplate(partialData?: ProductData): Partial<ProductData> {
    const template: Partial<ProductData> = {
      productName: partialData?.productName || '',
      brand: partialData?.brand || '',
      ingredients: partialData?.ingredients || [],
      nutritionFacts: {
        calories: partialData?.nutritionFacts.calories || '',
        protein: partialData?.nutritionFacts.protein || '',
        fat: partialData?.nutritionFacts.fat || '',
        carbohydrates: partialData?.nutritionFacts.carbohydrates || '',
        sugar: partialData?.nutritionFacts.sugar || '',
        fiber: partialData?.nutritionFacts.fiber || '',
        sodium: partialData?.nutritionFacts.sodium || ''
      },
      allergens: partialData?.allergens || [],
      weight: partialData?.weight || '',
      expiryDate: partialData?.expiryDate || '',
      confidence: 100
    };

    return template;
  }

  validateManualEntry(data: Partial<ProductData>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.productName || data.productName.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!data.brand || data.brand.trim().length === 0) {
      warnings.push('Brand name is recommended for better analysis');
    }

    if (!data.ingredients || data.ingredients.length === 0) {
      warnings.push('Ingredients list is recommended for health analysis');
    }

    if (!data.nutritionFacts || Object.keys(data.nutritionFacts).length === 0) {
      warnings.push('Nutrition facts are recommended for complete analysis');
    }

    const hasNutritionData = data.nutritionFacts && 
      Object.values(data.nutritionFacts).some(value => value && value.trim().length > 0);
    
    if (!hasNutritionData && (!data.ingredients || data.ingredients.length === 0)) {
      errors.push('Either nutrition facts or ingredients list is required');
    }

    if (data.ingredients && data.ingredients.some(ing => ing.trim().length === 0)) {
      warnings.push('Some ingredient entries are empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  getThresholds(): ConfidenceThresholds {
    return { ...this.thresholds };
  }

  updateThresholds(newThresholds: Partial<ConfidenceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  getFallbackOptions(): FallbackOptions {
    return { ...this.fallbackOptions };
  }

  updateFallbackOptions(newOptions: Partial<FallbackOptions>): void {
    this.fallbackOptions = { ...this.fallbackOptions, ...newOptions };
  }
}