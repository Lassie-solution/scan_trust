import { useState, useRef } from "react";
import { Camera, Scan, Upload, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOCRProcessing } from "@/api/ocrApi";

interface ScanResult {
  type: 'barcode' | 'image';
  processing: boolean;
  result?: any;
  error?: string;
}

export const ScanInterface = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processImage, lookupBarcode } = useOCRProcessing();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanResult({ type: 'image', processing: true });

    try {
      const response = await processImage(file, {
        confidenceThreshold: 70,
        enablePreprocessing: true,
        enableFallback: true
      });

      setScanResult({
        type: 'image',
        processing: false,
        result: response.result
      });

      if (response.result.success && response.result.data) {
        showResults(response.result.data, 'image');
      } else {
        setScanResult({
          type: 'image',
          processing: false,
          error: 'Failed to extract product information from image'
        });
      }
    } catch (error) {
      setScanResult({
        type: 'image',
        processing: false,
        error: 'Failed to process image. Please try again.'
      });
    }
  };

  const handleBarcodeSubmit = async () => {
    if (!barcodeInput.trim()) return;

    setScanResult({ type: 'barcode', processing: true });
    setShowBarcodeDialog(false);

    try {
      const response = await lookupBarcode(barcodeInput.trim());

      if (response.success && response.found && response.productData) {
        setScanResult({
          type: 'barcode',
          processing: false,
          result: response.productData
        });
        showResults(response.productData, 'barcode');
      } else {
        setScanResult({
          type: 'barcode',
          processing: false,
          error: 'Product not found in database. Please try uploading an image instead.'
        });
      }
    } catch (error) {
      setScanResult({
        type: 'barcode',
        processing: false,
        error: 'Failed to lookup barcode. Please try again.'
      });
    }

    setBarcodeInput('');
  };

  const showResults = (data: any, scanType: string) => {
    const resultMessage = scanType === 'barcode' 
      ? `Found product: ${data.name || data.productName}`
      : `Extracted from image: ${data.productName || 'Product detected'}`;
    
    alert(resultMessage);
  };

  const resetScan = () => {
    setScanResult(null);
    setBarcodeInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="p-6 sm:p-8 border border-gray-200 shadow-lg bg-white">
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Clean Scan Icon */}
          <div className="relative mx-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Scan className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            {/* Simple Status Ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-200 animate-pulse"></div>
            
            {/* Status Dot */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-3 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Scan Product Label
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
              {scanResult?.processing 
                ? 'Processing your request...' 
                : 'Enter barcode or upload image to extract product information'
              }
            </p>
          </div>
          
          {/* Mobile-First Action Buttons */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 max-w-sm mx-auto">
            <Button 
              size="lg"
              className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setShowBarcodeDialog(true)}
              disabled={scanResult?.processing}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Enter Barcode
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:flex-1 border-gray-300 hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanResult?.processing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>

          {/* Clear Button */}
          {scanResult && !scanResult.processing && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetScan}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              Clear Results
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </Card>

      {/* Modern Error State */}
      {scanResult?.error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Processing Failed</h4>
              <p className="text-red-700">{scanResult.error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Modern Processing State */}
      {scanResult?.processing && (
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-2 bg-blue-600 rounded-full flex items-center justify-center">
                <Scan className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">
                {scanResult.type === 'barcode' ? 'Looking up product...' : 'Processing image...'}
              </h4>
              <p className="text-gray-600 mt-1">
                {scanResult.type === 'barcode' 
                  ? 'Searching product database' 
                  : 'Extracting text with OCR technology'
                }
              </p>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Barcode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="barcode">Barcode Number</Label>
              <Input
                id="barcode"
                placeholder="Enter UPC/EAN barcode (e.g., 1234567890123)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleBarcodeSubmit}
                disabled={!barcodeInput.trim()}
                className="flex-1"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Look Up Product
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowBarcodeDialog(false)}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the barcode number found on the product package. If not found, try uploading an image instead.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};