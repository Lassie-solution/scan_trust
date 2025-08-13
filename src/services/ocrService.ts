import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: Array<{
    vertices: Array<{ x: number; y: number }>;
    text: string;
  }>;
}

export interface ProductData {
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

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initializeWorker(): Promise<void> {
    if (this.isInitialized && this.worker) return;

    try {
      this.worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
          }
        }
      });
      
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,()%-: /&',
        tessedit_pageseg_mode: '6', // Uniform block of text
        preserve_interword_spaces: '1',
      });
      
      this.isInitialized = true;
      console.log('Tesseract OCR worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Tesseract worker:', error);
      this.isInitialized = false;
    }
  }

  async extractTextFromImage(imageFile: File): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initializeWorker();
    }

    if (!this.worker) {
      return this.fallbackOCR();
    }

    try {
      console.log('Starting OCR processing...');
      const { data } = await this.worker.recognize(imageFile);
      
      const confidence = Math.round(data.confidence || 0);
      const text = data.text || '';
      
      console.log(`OCR completed with ${confidence}% confidence`);
      console.log('Extracted text:', text.substring(0, 200) + '...');

      // Extract bounding boxes from words
      const boundingBoxes = data.words?.map(word => ({
        vertices: [
          { x: word.bbox.x0, y: word.bbox.y0 },
          { x: word.bbox.x1, y: word.bbox.y0 },
          { x: word.bbox.x1, y: word.bbox.y1 },
          { x: word.bbox.x0, y: word.bbox.y1 }
        ],
        text: word.text
      })) || [];

      return {
        text,
        confidence,
        boundingBoxes
      };
    } catch (error) {
      console.error('Tesseract OCR error:', error);
      return this.fallbackOCR();
    }
  }

  private fallbackOCR(): OCRResult {
    return {
      text: 'OCR processing failed. Please try with a clearer image.',
      confidence: 0,
      boundingBoxes: []
    };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('OCR worker terminated');
    }
  }

  extractProductData(ocrResult: OCRResult): ProductData {
    const text = ocrResult.text.toLowerCase();
    const lines = ocrResult.text.split('\n').map(line => line.trim()).filter(Boolean);
    
    return {
      productName: this.extractProductName(lines),
      brand: this.extractBrand(lines),
      ingredients: this.extractIngredients(text, lines),
      nutritionFacts: this.extractNutritionFacts(text, lines),
      allergens: this.extractAllergens(text),
      expiryDate: this.extractExpiryDate(text),
      weight: this.extractWeight(text),
      confidence: ocrResult.confidence
    };
  }

  private extractProductName(lines: string[]): string | undefined {
    const productNamePatterns = [
      /^[A-Z\s]+(?:CEREAL|GRANOLA|YOGURT|MILK|BREAD|PASTA|SAUCE|JUICE|WATER|CHIPS|COOKIES|CRACKERS)/i,
      /^[A-Z][a-z\s]+(?:\s+[A-Z][a-z]+)*$/
    ];

    for (const line of lines.slice(0, 5)) {
      for (const pattern of productNamePatterns) {
        if (pattern.test(line) && line.length > 3 && line.length < 50) {
          return line.trim();
        }
      }
    }

    return lines[0]?.length > 3 && lines[0]?.length < 50 ? lines[0] : undefined;
  }

  private extractBrand(lines: string[]): string | undefined {
    const brandPatterns = [
      /^[A-Z]+['S]*\s*$/,
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/
    ];

    for (const line of lines.slice(0, 3)) {
      for (const pattern of brandPatterns) {
        if (pattern.test(line) && line.length > 2 && line.length < 30) {
          return line.trim();
        }
      }
    }

    return undefined;
  }

  private extractIngredients(text: string, lines: string[]): string[] {
    const ingredientsStart = text.search(/ingredients[:]/i);
    if (ingredientsStart === -1) return [];

    const ingredientsText = text.substring(ingredientsStart);
    const ingredientsEnd = ingredientsText.search(/\.(.*nutrition|allergen|net\s+weight|best\s+before)/i);
    const relevantText = ingredientsEnd > 0 
      ? ingredientsText.substring(0, ingredientsEnd)
      : ingredientsText.substring(0, 300);

    const cleanText = relevantText
      .replace(/ingredients[:]\s*/i, '')
      .replace(/\([^)]*\)/g, '')
      .trim();

    return cleanText
      .split(/[,;]/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 2 && ingredient.length < 50)
      .slice(0, 20);
  }

  private extractNutritionFacts(text: string, lines: string[]): ProductData['nutritionFacts'] {
    const nutrition: ProductData['nutritionFacts'] = {};

    const patterns = {
      calories: /(?:calories|energy)[:]*\s*(\d+(?:\.\d+)?)\s*(?:kcal|cal)?/i,
      protein: /protein[:]*\s*(\d+(?:\.\d+)?)\s*g/i,
      fat: /(?:total\s+)?fat[:]*\s*(\d+(?:\.\d+)?)\s*g/i,
      carbohydrates: /(?:total\s+)?carbohydrate[s]?[:]*\s*(\d+(?:\.\d+)?)\s*g/i,
      sugar: /sugar[s]?[:]*\s*(\d+(?:\.\d+)?)\s*g/i,
      fiber: /(?:dietary\s+)?fiber[:]*\s*(\d+(?:\.\d+)?)\s*g/i,
      sodium: /sodium[:]*\s*(\d+(?:\.\d+)?)\s*(?:mg|g)/i
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        nutrition[key as keyof typeof nutrition] = match[1] + (key === 'calories' ? ' kcal' : 
          key === 'sodium' ? ' mg' : ' g');
      }
    });

    return nutrition;
  }

  private extractAllergens(text: string): string[] {
    const allergenSection = text.match(/(?:contains|allergens?)[:]\s*([^.]+)/i);
    if (!allergenSection) return [];

    const commonAllergens = [
      'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 
      'wheat', 'soybeans', 'sesame', 'gluten', 'soy'
    ];

    const allergenText = allergenSection[1].toLowerCase();
    return commonAllergens.filter(allergen => 
      allergenText.includes(allergen)
    );
  }

  private extractExpiryDate(text: string): string | undefined {
    const datePatterns = [
      /(?:best\s+before|use\s+by|exp(?:iry)?|expires?)[:]*\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(?:best\s+before|use\s+by|exp(?:iry)?|expires?)[:]*\s*(\d{1,2}\s+\w{3}\s+\d{2,4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  private extractWeight(text: string): string | undefined {
    const weightPatterns = [
      /(?:net\s+weight|net\s+wt|weight)[:]*\s*(\d+(?:\.\d+)?\s*(?:g|kg|oz|lb|ml|l))/i,
      /(\d+(?:\.\d+)?\s*(?:g|kg|oz|lb|ml|l))\s*(?:net|total)?/i
    ];

    for (const pattern of weightPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  async processProductImage(imageFile: File, confidenceThreshold: number = 50): Promise<ProductData | null> {
    try {
      console.log('Processing product image with Tesseract OCR...');
      const ocrResult = await this.extractTextFromImage(imageFile);
      
      if (ocrResult.confidence < confidenceThreshold) {
        console.log(`OCR confidence ${ocrResult.confidence}% below threshold ${confidenceThreshold}%`);
        return null;
      }

      const productData = this.extractProductData(ocrResult);
      
      if (!productData.productName && productData.ingredients.length === 0) {
        console.log('No meaningful product data extracted');
        return null;
      }

      console.log('Successfully extracted product data:', productData);
      return productData;
    } catch (error) {
      console.error('Error processing product image:', error);
      return null;
    }
  }

  createSampleProductData(): ProductData {
    return {
      productName: "Sample Product",
      brand: "Demo Brand", 
      ingredients: ["Water", "Sugar", "Natural Flavors"],
      nutritionFacts: {
        calories: "150 kcal",
        protein: "2g",
        sugar: "15g"
      },
      allergens: [],
      confidence: 85
    };
  }
}

export const ocrService = new OCRService();