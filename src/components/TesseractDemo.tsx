import { useState, useRef, useEffect } from "react";
import { Upload, Zap, CheckCircle, AlertTriangle, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TesseractDemo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Listen for sample image uploads
    const handleSampleImage = (event: CustomEvent) => {
      const { file } = event.detail;
      if (file) {
        processFile(file);
      }
    };

    window.addEventListener('uploadSampleImage', handleSampleImage as EventListener);
    return () => {
      window.removeEventListener('uploadSampleImage', handleSampleImage as EventListener);
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      // Dynamic import to avoid build issues
      const Tesseract = await import('tesseract.js');
      
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data } = await worker.recognize(file);
      
      // Simple product info extraction for demo
      const extractedText = data.text;
      const confidence = Math.round(data.confidence);
      
      setResult({
        text: extractedText,
        confidence,
        wordCount: extractedText.split(/\s+/).length,
        processingTime: Date.now()
      });

      await worker.terminate();
      
    } catch (error) {
      console.error('OCR Error:', error);
      setResult({
        error: 'Failed to process image. Please try again.',
        confidence: 0
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  return (
    <Card className="p-8 lg:p-12 border-0 shadow-2xl bg-white">
      <div className="space-y-8">
        {/* Modern Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
            <Star className="h-5 w-5 text-green-600 fill-current animate-pulse" />
            <span className="font-bold text-green-800 text-lg">100% FREE FOREVER</span>
            <Star className="h-5 w-5 text-green-600 fill-current animate-pulse" />
          </div>
          
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent mb-3">
              Tesseract.js OCR Engine
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced browser-based OCR technology. No API keys, no server costs, complete privacy.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Star, title: "Free Forever", desc: "Zero costs", color: "text-yellow-600 bg-yellow-100" },
              { icon: Zap, title: "Lightning Fast", desc: "Real-time OCR", color: "text-blue-600 bg-blue-100" },
              { icon: CheckCircle, title: "Works Offline", desc: "No internet needed", color: "text-green-600 bg-green-100" },
              { icon: Upload, title: "Privacy First", desc: "Local processing", color: "text-purple-600 bg-purple-100" }
            ].map((feature, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Upload & Results Area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="p-8 border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center space-y-6">
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Uploaded for OCR" 
                      className="mx-auto max-h-40 rounded-xl object-contain shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">Image Ready</h4>
                    <p className="text-gray-600">
                      {isProcessing ? 'Processing with Tesseract.js...' : 'OCR processing complete'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                    <Upload className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">Upload Image</h4>
                    <p className="text-gray-600">
                      Drop a product label or any image with text
                    </p>
                  </div>
                </div>
              )}
              
              {isProcessing && (
                <div className="space-y-4">
                  <div className="relative">
                    <Progress value={progress} className="w-full h-3" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">{progress}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-600 animate-pulse">
                    Tesseract.js is analyzing your image...
                  </p>
                </div>
              )}
              
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="h-5 w-5 mr-2" />
                {previewUrl ? 'Upload New Image' : 'Choose Image to Scan'}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </Card>

          {/* Modern Results Section */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            {isProcessing ? (
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                  <div className="absolute inset-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900">AI Processing</h4>
                  <p className="text-gray-600 mt-1">
                    Tesseract.js is analyzing your image with advanced OCR
                  </p>
                </div>
                <div className="space-y-2">
                  <Progress value={progress} className="w-full h-4" />
                  <p className="text-lg font-semibold text-blue-600">{progress}% Complete</p>
                </div>
              </div>
            ) : result ? (
              result.error ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-red-900">Processing Failed</h4>
                    <p className="text-red-700 mt-1">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">OCR Complete</h4>
                        <p className="text-gray-600 text-sm">Text successfully extracted</p>
                      </div>
                    </div>
                    <Badge 
                      className={`px-4 py-2 text-sm font-bold ${
                        result.confidence >= 70 
                          ? "bg-green-100 text-green-800 border-green-200"
                          : result.confidence >= 50
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {result.confidence}% Confidence
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📝 Extracted Text
                      </label>
                      <div className="p-4 bg-white rounded-xl border border-gray-200 max-h-40 overflow-y-auto">
                        <p className="text-sm font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {result.text.slice(0, 500)}{result.text.length > 500 ? '...' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                        <p className="text-2xl font-bold text-blue-600">{result.wordCount}</p>
                        <p className="text-sm font-medium text-gray-600">Words Found</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                        <p className="text-2xl font-bold text-green-600">✓</p>
                        <p className="text-sm font-medium text-gray-600">Processing Complete</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Zap className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900">Ready to Process</h4>
                  <p className="text-gray-600">
                    Upload an image to see Tesseract.js in action
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          {[
            { icon: Star, title: "Free Forever", desc: "No API costs" },
            { icon: Zap, title: "Fast Processing", desc: "Browser-based" },
            { icon: CheckCircle, title: "Offline Ready", desc: "No internet needed" },
            { icon: Upload, title: "Privacy First", desc: "Local processing" }
          ].map((feature, index) => (
            <div key={index} className="text-center space-y-2">
              <feature.icon className="h-8 w-8 mx-auto text-green-600" />
              <div>
                <p className="font-semibold text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};