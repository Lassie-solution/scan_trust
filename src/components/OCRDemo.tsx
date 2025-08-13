import { useState, useRef } from "react";
import { FileText, Zap, CheckCircle, Upload, AlertTriangle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOCRProcessing } from "@/api/ocrApi";
import { ProductData } from "@/services/ocrService";
import { ProcessingResult } from "@/services/confidenceManager";

interface OCRState {
  isProcessing: boolean;
  result: ProcessingResult | null;
  uploadedFile: File | null;
  previewUrl: string | null;
}

export const OCRDemo = () => {
  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    result: null,
    uploadedFile: null,
    previewUrl: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processImage } = useOCRProcessing();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      uploadedFile: file,
      previewUrl,
      result: null
    }));

    await processImageFile(file);
  };

  const processImageFile = async (file: File) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const response = await processImage(file, {
        confidenceThreshold: 60,
        enablePreprocessing: true,
        enableFallback: true
      });

      setState(prev => ({
        ...prev,
        result: response.result,
        isProcessing: false
      }));
    } catch (error) {
      console.error('OCR processing failed:', error);
      setState(prev => ({
        ...prev,
        result: {
          success: false,
          confidence: 0,
          requiresManualEntry: true,
          suggestions: ['Please try again with a clearer image'],
          errors: ['Processing failed'],
          warnings: [],
          retryable: true
        },
        isProcessing: false
      }));
    }
  };

  const handleRetry = () => {
    if (state.uploadedFile) {
      processImageFile(state.uploadedFile);
    }
  };

  const renderExtractedData = (data: ProductData) => (
    <Card className="p-6 bg-gradient-scan border border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Extracted Data
          </h4>
          <Badge 
            variant="secondary" 
            className={
              state.result!.confidence >= 80 
                ? "bg-success text-success-foreground"
                : state.result!.confidence >= 60
                ? "bg-warning text-warning-foreground"
                : "bg-destructive text-destructive-foreground"
            }
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {state.result!.confidence}% Confidence
          </Badge>
        </div>

        <div className="space-y-3">
          {data.productName && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Product Name
              </label>
              <p className="font-medium">{data.productName}</p>
            </div>
          )}

          {data.brand && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Brand
              </label>
              <p className="font-medium">{data.brand}</p>
            </div>
          )}

          {data.ingredients.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Key Ingredients
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.ingredients.slice(0, 3).map((ingredient, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {ingredient}
                  </Badge>
                ))}
                {data.ingredients.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{data.ingredients.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {Object.keys(data.nutritionFacts).length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nutrition Facts
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {Object.entries(data.nutritionFacts).map(([key, value]) => 
                  value && (
                    <div key={key} className="text-xs">
                      <span className="font-medium capitalize">{key}: {value}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {data.allergens.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Allergens
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.allergens.map((allergen, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.weight && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Weight
              </label>
              <p className="font-medium">{data.weight}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">OCR Text Extraction</h3>
        <p className="text-muted-foreground">Advanced image processing to extract product information</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Image */}
        <Card className="p-6 border-2 border-dashed border-muted-foreground/30">
          <div className="text-center space-y-4">
            {state.previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={state.previewUrl} 
                  alt="Uploaded product" 
                  className="mx-auto max-h-32 rounded-lg object-contain"
                />
                <div>
                  <h4 className="font-semibold">Processing Image...</h4>
                  <p className="text-sm text-muted-foreground">
                    {state.uploadedFile?.name}
                  </p>
                </div>
                {state.isProcessing && (
                  <Progress value={75} className="w-full" />
                )}
              </div>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">Product Image</h4>
                  <p className="text-sm text-muted-foreground">Upload a package photo</p>
                </div>
              </>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={state.isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {state.previewUrl ? 'Change Image' : 'Upload Image'}
              </Button>
              
              {state.result?.retryable && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRetry}
                  disabled={state.isProcessing}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </Card>

        {/* Results */}
        {state.isProcessing ? (
          <Card className="p-6 border border-muted-foreground/20">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 animate-spin">
                <RefreshCw className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Processing Image</h4>
                <p className="text-sm text-muted-foreground">
                  Extracting text and analyzing content...
                </p>
              </div>
              <Progress value={75} className="w-full" />
            </div>
          </Card>
        ) : state.result ? (
          <>
            {state.result.success && state.result.data && renderExtractedData(state.result.data)}
            
            {!state.result.success && (
              <Card className="p-6 border border-destructive/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h4 className="font-semibold text-destructive">Processing Failed</h4>
                  </div>
                  
                  {state.result.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                  
                  {state.result.suggestions.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Suggestions:</h5>
                      <ul className="text-sm space-y-1">
                        {state.result.suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            {state.result.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {state.result.warnings.map((warning, index) => (
                      <div key={index}>{warning}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <Card className="p-6 border-2 border-dashed border-muted-foreground/30">
            <div className="text-center space-y-4 text-muted-foreground">
              <Zap className="mx-auto h-12 w-12" />
              <p>Upload an image to see OCR results</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};