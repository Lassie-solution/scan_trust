import { ScanInterface } from "@/components/ScanInterface";
import { ProductCard } from "@/components/ProductCard";
import { OCRDemo } from "@/components/OCRDemo";
import { TesseractDemo } from "@/components/TesseractDemo";
import { SampleProductGenerator } from "@/components/SampleProductGenerator";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, CheckCircle, Code, Github, Image as ImageIcon } from "lucide-react";
import heroImage from "@/assets/hero-scan.jpg";

const Index = () => {
  const sampleProducts = [
    {
      name: "Organic Almond Butter",
      brand: "Nature's Best",
      recommendation: "recommended" as const,
      score: 92,
      reasons: ["High protein content", "No added sugars", "Organic ingredients"]
    },
    {
      name: "Energy Drink Max",
      brand: "PowerCorp",
      recommendation: "not-recommended" as const,
      score: 23,
      reasons: ["High caffeine content", "Artificial colors", "Added sugars"]
    },
    {
      name: "Greek Yogurt",
      brand: "Fresh Valley",
      recommendation: "warning" as const,
      score: 68,
      reasons: ["High protein but contains added sugars", "Good probiotics"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Mobile-First Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 mx-auto">
          {/* Logo - Mobile Optimized */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Scan className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                ScanTrust
              </h1>
              <p className="text-xs text-gray-500 -mt-1 hidden sm:block">Free OCR Scanner</p>
            </div>
          </div>
          
          {/* Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs px-2 py-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></div>
              Live
            </Badge>
            <Button variant="outline" size="sm" className="hidden sm:flex text-sm">
              <Github className="h-4 w-4 mr-1" />
              Code
            </Button>
          </div>
        </div>
      </header>

      {/* Clean Hero Section - OCR Focused */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* OCR Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium">Free OCR Technology</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Scan & Extract Product Information
                <span className="block text-emerald-600 mt-2">Instantly & Free</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Upload product images and extract text, ingredients, nutrition facts instantly. 
                No API keys, no costs, works completely offline.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex-1 sm:flex-none"
              >
                <Scan className="h-5 w-5 mr-2" />
                Start Scanning
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-300 hover:bg-gray-50 flex-1 sm:flex-none"
              >
                <Code className="h-5 w-5 mr-2" />
                View Code
              </Button>
            </div>

            {/* Key Features - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
              {[
                { icon: CheckCircle, text: "100% Free", desc: "Zero costs forever", color: "text-emerald-600" },
                { icon: CheckCircle, text: "Privacy First", desc: "Local processing only", color: "text-blue-600" },
                { icon: CheckCircle, text: "Works Offline", desc: "No internet required", color: "text-purple-600" }
              ].map((feature, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <feature.icon className={`h-6 w-6 mx-auto mb-2 ${feature.color}`} />
                  <p className="font-semibold text-gray-900 text-sm">{feature.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Scan Interface Demo */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                <Scan className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Interactive Demo</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Try It Right Now
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience instant product scanning with barcode lookup or image OCR processing
              </p>
            </div>
            <ScanInterface />
          </div>
        </div>
      </section>

      {/* Sample Results */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-foreground">Sample Results</h2>
            <p className="text-muted-foreground">
              See how our AI analyzes products and provides recommendations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {sampleProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Modern Sample Product Images */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
                <ImageIcon className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Sample Images</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Perfect Test Images
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                High-quality generated product labels designed to showcase OCR capabilities
              </p>
            </div>
            <SampleProductGenerator />
          </div>
        </div>
      </section>

      {/* Free Tesseract Demo */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50" data-section="ocr-demo">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <TesseractDemo />
          </div>
        </div>
      </section>

      {/* Advanced OCR Demo */}
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <OCRDemo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <FeatureGrid />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Ready to Build Your Scanning App?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Get started with our complete CV/OCR solution for product analysis and health recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                <Code className="h-5 w-5 mr-2" />
                View Documentation
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Github className="h-5 w-5 mr-2" />
                GitHub Repository
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Scan className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  ScanTrust
                </h3>
                <p className="text-gray-600">Free OCR & Product Scanner</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Works Offline</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500">
              Built with React, TypeScript, Tailwind CSS & Tesseract.js
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
