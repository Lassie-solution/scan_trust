import { Scan, Brain, Shield, Zap, Database, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Scan,
    title: "Barcode Scanning",
    description: "Instant product recognition using camera or image upload",
    color: "text-primary"
  },
  {
    icon: Brain,
    title: "OCR Processing",
    description: "Extract product details from packaging using AI",
    color: "text-success"
  },
  {
    icon: Shield,
    title: "Health Analysis",
    description: "Get recommendations based on ingredients and nutrition",
    color: "text-warning"
  },
  {
    icon: Zap,
    title: "Real-time Results",
    description: "Fast processing with confidence scoring",
    color: "text-primary"
  },
  {
    icon: Database,
    title: "Structured Data",
    description: "Clean JSON output for easy integration",
    color: "text-success"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfect for mobile apps and responsive design",
    color: "text-warning"
  }
];

export const FeatureGrid = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Core Features</h3>
        <p className="text-muted-foreground">Everything you need for product scanning and analysis</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={index} 
              className="p-6 border border-border hover:border-primary/30 transition-smooth hover:shadow-card group"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-scan flex items-center justify-center group-hover:scale-110 transition-smooth`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};