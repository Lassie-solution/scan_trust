import { ProductData } from '@/services/ocrService';

export interface NutritionScore {
  overall: number;
  breakdown: {
    calories: number;
    protein: number;
    fat: number;
    sugar: number;
    sodium: number;
    fiber: number;
  };
}

export interface ProductRecommendation {
  recommendation: 'recommended' | 'not-recommended' | 'warning';
  score: number;
  reasons: string[];
  nutritionScore: NutritionScore;
  warnings: string[];
  healthBenefits: string[];
}

export class DataExtractor {
  private static readonly NUTRITION_TARGETS = {
    calories: { low: 100, medium: 200, high: 300 },
    protein: { low: 5, medium: 10, high: 20 },
    fat: { low: 3, medium: 10, high: 20 },
    sugar: { low: 5, medium: 15, high: 25 },
    sodium: { low: 140, medium: 400, high: 600 },
    fiber: { low: 3, medium: 6, high: 10 }
  };

  private static readonly HEALTHY_INGREDIENTS = [
    'organic', 'whole grain', 'quinoa', 'oats', 'brown rice',
    'almonds', 'walnuts', 'chia seeds', 'flax seeds', 'hemp seeds',
    'olive oil', 'coconut oil', 'avocado oil', 'greek yogurt',
    'probiotics', 'prebiotics', 'natural flavors', 'sea salt',
    'stevia', 'monk fruit', 'dates', 'honey'
  ];

  private static readonly UNHEALTHY_INGREDIENTS = [
    'high fructose corn syrup', 'trans fat', 'hydrogenated oil',
    'partially hydrogenated', 'artificial colors', 'artificial flavors',
    'monosodium glutamate', 'msg', 'sodium nitrate', 'sodium nitrite',
    'bha', 'bht', 'propyl gallate', 'potassium bromate',
    'artificial sweeteners', 'aspartame', 'sucralose', 'acesulfame potassium'
  ];

  private static readonly ALLERGEN_WARNINGS = [
    'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts',
    'wheat', 'soybeans', 'sesame', 'gluten', 'soy'
  ];

  static formatProductData(rawData: ProductData): ProductData {
    return {
      ...rawData,
      productName: this.formatProductName(rawData.productName),
      brand: this.formatBrand(rawData.brand),
      ingredients: this.formatIngredients(rawData.ingredients),
      nutritionFacts: this.formatNutritionFacts(rawData.nutritionFacts),
      allergens: this.formatAllergens(rawData.allergens),
      expiryDate: this.formatDate(rawData.expiryDate),
      weight: this.formatWeight(rawData.weight)
    };
  }

  private static formatProductName(name?: string): string | undefined {
    if (!name) return undefined;
    
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static formatBrand(brand?: string): string | undefined {
    if (!brand) return undefined;
    
    return brand
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  private static formatIngredients(ingredients: string[]): string[] {
    return ingredients
      .map(ingredient => ingredient.toLowerCase().trim())
      .filter(ingredient => ingredient.length > 1)
      .map(ingredient => {
        ingredient = ingredient.replace(/[,.;:()[\]{}]/g, '').trim();
        return ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
      })
      .filter(Boolean);
  }

  private static formatNutritionFacts(facts: ProductData['nutritionFacts']): ProductData['nutritionFacts'] {
    const formatted: ProductData['nutritionFacts'] = {};
    
    Object.entries(facts).forEach(([key, value]) => {
      if (value) {
        const cleanValue = value.toString().trim();
        const numericValue = parseFloat(cleanValue);
        
        if (!isNaN(numericValue)) {
          switch (key) {
            case 'calories':
              formatted[key] = `${Math.round(numericValue)} kcal`;
              break;
            case 'sodium':
              formatted[key] = numericValue < 1000 
                ? `${Math.round(numericValue)} mg`
                : `${(numericValue / 1000).toFixed(1)} g`;
              break;
            default:
              formatted[key as keyof typeof formatted] = `${numericValue} g`;
          }
        } else {
          formatted[key as keyof typeof formatted] = cleanValue;
        }
      }
    });
    
    return formatted;
  }

  private static formatAllergens(allergens: string[]): string[] {
    return allergens
      .map(allergen => allergen.toLowerCase().trim())
      .filter(allergen => this.ALLERGEN_WARNINGS.includes(allergen))
      .map(allergen => allergen.charAt(0).toUpperCase() + allergen.slice(1));
  }

  private static formatDate(date?: string): string | undefined {
    if (!date) return undefined;
    
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return date;
      }
      
      return parsedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  }

  private static formatWeight(weight?: string): string | undefined {
    if (!weight) return undefined;
    
    return weight.replace(/\s+/g, ' ').trim();
  }

  static generateRecommendation(productData: ProductData): ProductRecommendation {
    const nutritionScore = this.calculateNutritionScore(productData);
    const ingredientAnalysis = this.analyzeIngredients(productData.ingredients);
    const allergenAnalysis = this.analyzeAllergens(productData.allergens);
    
    const overallScore = this.calculateOverallScore(
      nutritionScore, 
      ingredientAnalysis, 
      allergenAnalysis,
      productData.confidence
    );

    const reasons = this.generateReasons(nutritionScore, ingredientAnalysis, allergenAnalysis);
    const warnings = this.generateWarnings(productData);
    const healthBenefits = this.generateHealthBenefits(ingredientAnalysis, nutritionScore);

    let recommendation: 'recommended' | 'not-recommended' | 'warning';
    
    if (overallScore >= 70) {
      recommendation = 'recommended';
    } else if (overallScore >= 40) {
      recommendation = 'warning';
    } else {
      recommendation = 'not-recommended';
    }

    return {
      recommendation,
      score: overallScore,
      reasons,
      nutritionScore,
      warnings,
      healthBenefits
    };
  }

  private static calculateNutritionScore(productData: ProductData): NutritionScore {
    const { nutritionFacts } = productData;
    
    const scores = {
      calories: this.scoreNutrient('calories', this.extractNumericValue(nutritionFacts.calories)),
      protein: this.scoreNutrient('protein', this.extractNumericValue(nutritionFacts.protein)),
      fat: this.scoreNutrient('fat', this.extractNumericValue(nutritionFacts.fat)),
      sugar: this.scoreNutrient('sugar', this.extractNumericValue(nutritionFacts.sugar)),
      sodium: this.scoreNutrient('sodium', this.extractNumericValue(nutritionFacts.sodium)),
      fiber: this.scoreNutrient('fiber', this.extractNumericValue(nutritionFacts.fiber))
    };

    const validScores = Object.values(scores).filter(score => score > 0);
    const overall = validScores.length > 0 
      ? Math.round(validScores.reduce((a, b) => a + b) / validScores.length)
      : 50;

    return {
      overall,
      breakdown: scores
    };
  }

  private static extractNumericValue(value?: string): number {
    if (!value) return 0;
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private static scoreNutrient(nutrient: string, value: number): number {
    if (value === 0) return 0;
    
    const targets = this.NUTRITION_TARGETS[nutrient as keyof typeof this.NUTRITION_TARGETS];
    
    switch (nutrient) {
      case 'protein':
      case 'fiber':
        if (value >= targets.high) return 90;
        if (value >= targets.medium) return 75;
        if (value >= targets.low) return 60;
        return 40;
        
      case 'sugar':
      case 'sodium':
        if (value <= targets.low) return 90;
        if (value <= targets.medium) return 70;
        if (value <= targets.high) return 50;
        return 20;
        
      case 'calories':
        if (value <= targets.medium) return 80;
        if (value <= targets.high) return 60;
        return 40;
        
      case 'fat':
        if (value <= targets.low) return 85;
        if (value <= targets.medium) return 70;
        if (value <= targets.high) return 50;
        return 30;
        
      default:
        return 50;
    }
  }

  private static analyzeIngredients(ingredients: string[]): {
    healthyScore: number;
    healthyIngredients: string[];
    unhealthyIngredients: string[];
  } {
    const ingredientText = ingredients.join(' ').toLowerCase();
    
    const healthyIngredients = this.HEALTHY_INGREDIENTS.filter(ingredient =>
      ingredientText.includes(ingredient)
    );
    
    const unhealthyIngredients = this.UNHEALTHY_INGREDIENTS.filter(ingredient =>
      ingredientText.includes(ingredient)
    );

    const healthyCount = healthyIngredients.length;
    const unhealthyCount = unhealthyIngredients.length;
    
    let healthyScore = 50;
    healthyScore += healthyCount * 10;
    healthyScore -= unhealthyCount * 15;
    
    return {
      healthyScore: Math.max(0, Math.min(100, healthyScore)),
      healthyIngredients,
      unhealthyIngredients
    };
  }

  private static analyzeAllergens(allergens: string[]): {
    allergenScore: number;
    commonAllergens: string[];
  } {
    const allergenScore = allergens.length > 0 ? Math.max(30, 80 - allergens.length * 10) : 80;
    
    return {
      allergenScore,
      commonAllergens: allergens
    };
  }

  private static calculateOverallScore(
    nutritionScore: NutritionScore,
    ingredientAnalysis: ReturnType<typeof this.analyzeIngredients>,
    allergenAnalysis: ReturnType<typeof this.analyzeAllergens>,
    confidence: number
  ): number {
    const weights = {
      nutrition: 0.4,
      ingredients: 0.4,
      allergens: 0.1,
      confidence: 0.1
    };

    const weightedScore = 
      (nutritionScore.overall * weights.nutrition) +
      (ingredientAnalysis.healthyScore * weights.ingredients) +
      (allergenAnalysis.allergenScore * weights.allergens) +
      (confidence * weights.confidence);

    return Math.round(Math.max(0, Math.min(100, weightedScore)));
  }

  private static generateReasons(
    nutritionScore: NutritionScore,
    ingredientAnalysis: ReturnType<typeof this.analyzeIngredients>,
    allergenAnalysis: ReturnType<typeof this.analyzeAllergens>
  ): string[] {
    const reasons: string[] = [];

    if (nutritionScore.breakdown.protein >= 70) {
      reasons.push('High protein content');
    }
    
    if (nutritionScore.breakdown.fiber >= 70) {
      reasons.push('Good source of fiber');
    }

    if (nutritionScore.breakdown.sugar >= 70) {
      reasons.push('Low sugar content');
    }

    if (nutritionScore.breakdown.sodium >= 70) {
      reasons.push('Low sodium content');
    }

    if (ingredientAnalysis.healthyIngredients.length > 0) {
      reasons.push('Contains beneficial ingredients');
    }

    if (ingredientAnalysis.unhealthyIngredients.length > 0) {
      reasons.push('Contains artificial additives');
    }

    if (allergenAnalysis.commonAllergens.length > 0) {
      reasons.push(`Contains allergens: ${allergenAnalysis.commonAllergens.join(', ')}`);
    }

    return reasons.slice(0, 4);
  }

  private static generateWarnings(productData: ProductData): string[] {
    const warnings: string[] = [];

    if (productData.allergens.length > 0) {
      warnings.push(`Contains allergens: ${productData.allergens.join(', ')}`);
    }

    const sugarValue = this.extractNumericValue(productData.nutritionFacts.sugar);
    if (sugarValue > 15) {
      warnings.push('High sugar content');
    }

    const sodiumValue = this.extractNumericValue(productData.nutritionFacts.sodium);
    if (sodiumValue > 400) {
      warnings.push('High sodium content');
    }

    const ingredientText = productData.ingredients.join(' ').toLowerCase();
    const hasArtificial = this.UNHEALTHY_INGREDIENTS.some(ingredient =>
      ingredientText.includes(ingredient)
    );
    
    if (hasArtificial) {
      warnings.push('Contains artificial ingredients');
    }

    return warnings;
  }

  private static generateHealthBenefits(
    ingredientAnalysis: ReturnType<typeof this.analyzeIngredients>,
    nutritionScore: NutritionScore
  ): string[] {
    const benefits: string[] = [];

    if (ingredientAnalysis.healthyIngredients.includes('organic')) {
      benefits.push('Organic ingredients');
    }

    if (ingredientAnalysis.healthyIngredients.includes('whole grain')) {
      benefits.push('Whole grain benefits');
    }

    if (ingredientAnalysis.healthyIngredients.includes('probiotics')) {
      benefits.push('Supports digestive health');
    }

    if (nutritionScore.breakdown.protein >= 70) {
      benefits.push('Supports muscle health');
    }

    if (nutritionScore.breakdown.fiber >= 70) {
      benefits.push('Supports digestive health');
    }

    return benefits;
  }

  static validateProductData(data: ProductData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.productName && data.ingredients.length === 0) {
      errors.push('No product information extracted');
    }

    if (data.confidence < 50) {
      warnings.push('Low confidence in extracted data');
    }

    if (data.ingredients.length === 0) {
      warnings.push('No ingredients found');
    }

    if (Object.keys(data.nutritionFacts).length === 0) {
      warnings.push('No nutrition facts found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}