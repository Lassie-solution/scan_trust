import { useEffect, useRef, useState } from 'react';
import { Download, Image as ImageIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductInfo {
  name: string;
  brand: string;
  ingredients: string[];
  nutrition: {
    [key: string]: string;
  };
  allergens: string[];
  weight: string;
  expiry: string;
}

const sampleProducts: ProductInfo[] = [
  {
    name: "ORGANIC GRANOLA CEREAL",
    brand: "Nature's Best",
    ingredients: [
      "Organic rolled oats", "Honey", "Almonds", "Dried cranberries",
      "Sunflower oil", "Cinnamon", "Sea salt", "Natural vanilla flavor"
    ],
    nutrition: {
      "Calories": "150",
      "Total Fat": "4g",
      "Sodium": "95mg", 
      "Total Carbs": "27g",
      "Fiber": "4g",
      "Sugars": "8g",
      "Protein": "4g"
    },
    allergens: ["Tree nuts", "May contain soy"],
    weight: "340g",
    expiry: "Best before: 15 MAR 2025"
  },
  {
    name: "GREEK YOGURT PLAIN",
    brand: "Farm Fresh Dairy",
    ingredients: [
      "Cultured pasteurized grade A milk", "Live active cultures",
      "(L. Bulgaricus, S. Thermophilus, L. Acidophilus)"
    ],
    nutrition: {
      "Calories": "100", 
      "Total Fat": "0g",
      "Sodium": "65mg",
      "Total Carbs": "6g",
      "Sugars": "6g", 
      "Protein": "18g",
      "Calcium": "20% DV"
    },
    allergens: ["Milk"],
    weight: "500ml",
    expiry: "Use by: 28 FEB 2025"
  },
  {
    name: "ENERGY BOOST DRINK",
    brand: "PowerMax",
    ingredients: [
      "Carbonated water", "Sugar", "Citric acid", "Natural flavors",
      "Caffeine", "Taurine", "B-vitamins", "Guarana extract",
      "Artificial colors (Red 40, Blue 1)"
    ],
    nutrition: {
      "Calories": "110",
      "Total Fat": "0g", 
      "Sodium": "200mg",
      "Total Carbs": "27g",
      "Sugars": "27g",
      "Caffeine": "80mg"
    },
    allergens: ["Contains caffeine", "Not recommended for children"],
    weight: "250ml",
    expiry: "Best before: 10 JUN 2025"
  },
  {
    name: "WHOLE GRAIN BREAD",
    brand: "Baker's Choice", 
    ingredients: [
      "Whole wheat flour", "Water", "Yeast", "Salt", "Sugar",
      "Sunflower seeds", "Flax seeds", "Oat bran", "Honey",
      "Wheat gluten", "Preservative (Calcium propionate)"
    ],
    nutrition: {
      "Calories": "80",
      "Total Fat": "1.5g",
      "Sodium": "160mg",
      "Total Carbs": "15g", 
      "Fiber": "2g",
      "Sugars": "2g",
      "Protein": "4g"
    },
    allergens: ["Wheat", "May contain sesame"],
    weight: "675g", 
    expiry: "Best before: 20 FEB 2025"
  },
  {
    name: "CHOCOLATE PROTEIN BAR",
    brand: "FitLife Nutrition",
    ingredients: [
      "Protein blend (whey isolate, casein)", "Dark chocolate",
      "Almonds", "Dates", "Coconut oil", "Natural cocoa",
      "Stevia extract", "Sea salt", "Natural vanilla"
    ],
    nutrition: {
      "Calories": "220",
      "Total Fat": "8g",
      "Sodium": "140mg",
      "Total Carbs": "12g",
      "Fiber": "4g", 
      "Sugars": "6g",
      "Protein": "20g"
    },
    allergens: ["Milk", "Tree nuts", "Manufactured in facility with peanuts"],
    weight: "60g",
    expiry: "Best before: 15 APR 2025"
  }
];

export const SampleProductGenerator = () => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  useEffect(() => {
    generateProductImages();
  }, []);

  const generateProductImages = () => {
    const images: string[] = [];
    
    sampleProducts.forEach((product, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 600;
      canvas.height = 800;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add border
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      let y = 50;
      const leftMargin = 30;
      const rightMargin = canvas.width - 30;

      // Brand name
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(product.brand, leftMargin, y);
      y += 40;

      // Product name  
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px Arial';
      const nameLines = wrapText(ctx, product.name, rightMargin - leftMargin, 32);
      nameLines.forEach(line => {
        ctx.fillText(line, leftMargin, y);
        y += 40;
      });
      y += 20;

      // Weight
      ctx.fillStyle = '#666666';
      ctx.font = '20px Arial';
      ctx.fillText(`Net Weight: ${product.weight}`, leftMargin, y);
      y += 40;

      // Ingredients
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('INGREDIENTS:', leftMargin, y);
      y += 25;

      ctx.font = '16px Arial';
      const ingredientText = product.ingredients.join(', ');
      const ingredientLines = wrapText(ctx, ingredientText, rightMargin - leftMargin, 16);
      ingredientLines.forEach(line => {
        ctx.fillText(line, leftMargin, y);
        y += 22;
      });
      y += 20;

      // Nutrition Facts
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('NUTRITION FACTS', leftMargin, y);
      y += 5;
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(rightMargin - 150, y);
      ctx.stroke();
      y += 20;

      ctx.font = '16px Arial';
      Object.entries(product.nutrition).forEach(([key, value]) => {
        ctx.fillText(`${key}`, leftMargin, y);
        ctx.fillText(value, rightMargin - 200, y);
        y += 22;
      });
      y += 20;

      // Allergens
      if (product.allergens.length > 0) {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('ALLERGEN INFORMATION:', leftMargin, y);
        y += 25;

        ctx.font = '15px Arial';
        product.allergens.forEach(allergen => {
          ctx.fillText(`• ${allergen}`, leftMargin, y);
          y += 20;
        });
        y += 15;
      }

      // Expiry date
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial';
      ctx.fillText(product.expiry, leftMargin, y);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      images.push(dataUrl);
    });

    setGeneratedImages(images);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const useImageForOCR = (dataUrl: string) => {
    // Convert data URL to blob and create a file
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'sample-product.png', { type: 'image/png' });
        
        // Trigger the OCR demo with this image
        const event = new CustomEvent('uploadSampleImage', { detail: { file } });
        window.dispatchEvent(event);
        
        // Scroll to OCR demo
        const ocrSection = document.querySelector('[data-section="ocr-demo"]');
        if (ocrSection) {
          ocrSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Sample Product Images</h3>
          <p className="text-muted-foreground">
            Generated product labels perfect for testing OCR functionality
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((product, index) => (
            <div key={index} className="space-y-4">
              <canvas
                ref={el => canvasRefs.current[index] = el}
                className="w-full h-auto border border-gray-200 rounded-lg shadow-sm"
                style={{ maxWidth: '300px', height: 'auto' }}
              />
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{product.name}</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {product.ingredients.length} ingredients
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(product.nutrition).length} nutrition facts
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadImage(generatedImages[index], `sample-${index + 1}.png`)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => useImageForOCR(generatedImages[index])}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Test OCR
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-2">
          <h4 className="font-semibold">How to Use These Images</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1. Click "Test OCR" to automatically upload to the OCR demo above</p>
            <p>2. Or click "Download" to save and upload manually</p>
            <p>3. Watch as Tesseract.js extracts product information in real-time!</p>
          </div>
        </div>
      </div>
    </Card>
  );
};