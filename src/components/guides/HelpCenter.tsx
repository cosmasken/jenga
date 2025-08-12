import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { X, HelpCircle, ExternalLink, BookOpen } from "lucide-react";

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqData = [
  {
    id: "what-is-sacco",
    question: "What is Sacco DeFi?",
    answer: "Sacco is a decentralized lending platform that allows you to deposit cBTC as collateral and borrow USDC. It operates as a cooperative where members participate in governance and earn rewards.",
    category: "basics",
  },
  {
    id: "how-to-join",
    question: "How do I join the Sacco cooperative?",
    answer: "To join, you need to pay a one-time membership fee of 0.01 cBTC. This gives you access to all platform features, governance voting, and member benefits.",
    category: "basics",
  },
  {
    id: "collateral-ratio",
    question: "What is a collateral ratio and why is it important?",
    answer: "Your collateral ratio is the percentage of your loan value covered by your cBTC deposits. You must maintain at least 150%, but we recommend 200% or higher to avoid liquidation risk.",
    category: "safety",
  },
  {
    id: "liquidation",
    question: "What happens if my collateral ratio falls too low?",
    answer: "If your ratio drops below 150%, your position may be liquidated to protect the platform. You'll receive warnings when approaching this threshold.",
    category: "safety",
  },
  {
    id: "interest-rates",
    question: "How are interest rates determined?",
    answer: "Interest rates are dynamic and based on supply and demand. Currently at 5.2% APR, rates may adjust based on platform utilization and governance decisions.",
    category: "borrowing",
  },
  {
    id: "governance",
    question: "How does governance work?",
    answer: "Members earn governance tokens (GOV) from deposits and participation. Use these tokens to vote on platform proposals, interest rate changes, and feature updates.",
    category: "governance",
  },
  {
    id: "fees",
    question: "What fees are involved?",
    answer: "There's a one-time 0.01 cBTC membership fee. No additional platform fees, but you'll pay standard Citrea gas fees for transactions.",
    category: "fees",
  },
  {
    id: "security",
    question: "How secure is the platform?",
    answer: "All smart contracts are audited and open-source. Your funds remain in your control, and the platform includes multiple safety mechanisms and monitoring systems.",
    category: "safety",
  },
];

const categories = [
  { id: "all", name: "All", color: "bg-neutral-600" },
  { id: "basics", name: "Basics", color: "bg-blue-600" },
  { id: "safety", name: "Safety", color: "bg-green-600" },
  { id: "borrowing", name: "Borrowing", color: "bg-purple-600" },
  { id: "governance", name: "Governance", color: "bg-bitcoin" },
  { id: "fees", name: "Fees", color: "bg-orange-600" },
];

export default function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-bitcoin" />
              <span>Help Center</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-help"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:border-bitcoin focus:outline-none transition-colors"
              data-testid="input-help-search"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className={`cursor-pointer transition-colors ${selectedCategory === category.id
                  ? `${category.color} text-white border-transparent`
                  : "border-neutral-600 text-neutral-400 hover:border-neutral-500"
                  }`}
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`filter-${category.id}`}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFAQs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-neutral-900/50 border border-neutral-800 rounded-lg px-4"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{faq.question}</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs border-neutral-600 text-neutral-400"
                    >
                      {categories.find(c => c.id === faq.category)?.name}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-neutral-300 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8 text-neutral-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4" />
              <p>No help topics found matching your search.</p>
            </div>
          )}

          {/* Additional Resources */}
          <div className="border-t border-neutral-800 pt-4 space-y-3">
            <h4 className="font-medium">Additional Resources</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                data-testid="button-documentation"
              >
                <span>📚 Full Documentation</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                data-testid="button-discord"
              >
                <span>💬 Join Discord Community</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                data-testid="button-support"
              >
                <span>🎧 Contact Support</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}