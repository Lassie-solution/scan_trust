import { Check, X, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  brand: string;
  recommendation: "recommended" | "not-recommended" | "warning";
  score?: number;
  reasons?: string[];
  image?: string;
}

export const ProductCard = ({ 
  name, 
  brand, 
  recommendation, 
  score, 
  reasons = [], 
  image 
}: ProductCardProps) => {
  const getRecommendationConfig = () => {
    switch (recommendation) {
      case "recommended":
        return {
          icon: Check,
          badge: "Recommended",
          color: "success",
          bgColor: "bg-success-soft",
          borderColor: "border-success/20",
          shadowColor: "shadow-success"
        };
      case "warning":
        return {
          icon: AlertTriangle,
          badge: "Caution",
          color: "warning",
          bgColor: "bg-warning-soft",
          borderColor: "border-warning/20",
          shadowColor: "shadow-lg"
        };
      case "not-recommended":
        return {
          icon: X,
          badge: "Not Recommended",
          color: "danger",
          bgColor: "bg-danger-soft",
          borderColor: "border-danger/20",
          shadowColor: "shadow-danger"
        };
    }
  };

  const config = getRecommendationConfig();
  const Icon = config.icon;

  return (
    <Card className={cn(
      "p-6 border-2 transition-smooth hover:scale-105",
      config.borderColor,
      config.shadowColor
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center",
          config.bgColor
        )}>
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Icon className={cn("h-8 w-8", `text-${config.color}`)} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <p className="text-sm text-muted-foreground">{brand}</p>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                "whitespace-nowrap",
                recommendation === "recommended" && "bg-success text-success-foreground",
                recommendation === "warning" && "bg-warning text-warning-foreground",
                recommendation === "not-recommended" && "bg-danger text-danger-foreground"
              )}
            >
              {config.badge}
            </Badge>
          </div>
          
          {score && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Score:</span>
                <span className={cn(
                  "text-sm font-bold",
                  recommendation === "recommended" && "text-success",
                  recommendation === "warning" && "text-warning",
                  recommendation === "not-recommended" && "text-danger"
                )}>
                  {score}/100
                </span>
              </div>
            </div>
          )}
          
          {reasons.length > 0 && (
            <div className="space-y-1">
              {reasons.slice(0, 2).map((reason, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {reason}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};