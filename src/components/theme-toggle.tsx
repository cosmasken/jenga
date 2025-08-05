import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="border-bitcoin/20 hover:border-bitcoin/40 hover:bg-bitcoin/5 dark:border-bitcoin/30 dark:hover:border-bitcoin/50 dark:hover:bg-bitcoin/10 transition-all duration-200"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-bitcoin" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-bitcoin" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="border-bitcoin/20 dark:border-bitcoin/30"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="hover:bg-bitcoin/5 dark:hover:bg-bitcoin/10 cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4 text-bitcoin" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="hover:bg-bitcoin/5 dark:hover:bg-bitcoin/10 cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4 text-bitcoin" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="hover:bg-bitcoin/5 dark:hover:bg-bitcoin/10 cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4 text-bitcoin opacity-50" />
          <Moon className="mr-2 h-4 w-4 text-bitcoin opacity-50 -ml-6" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
