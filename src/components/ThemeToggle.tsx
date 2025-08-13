import { Moon, Sun, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("gold");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycleTheme}
      className="border-border/40 bg-background/80 backdrop-blur-sm hover:bg-accent relative"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 gold:-rotate-180 gold:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 gold:rotate-180 gold:scale-0" />
      <Crown className="absolute h-4 w-4 rotate-180 scale-0 transition-all gold:rotate-0 gold:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};