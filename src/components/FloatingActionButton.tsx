import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OnboardingModal from "./modals/OnboardingModal";

export default function FloatingActionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-bitcoin text-black rounded-full shadow-lg hover:bg-bitcoin/90 transform hover:scale-110 transition-all duration-200 z-40"
        data-testid="fab-onboarding"
      >
        <Plus className="w-6 h-6" />
      </Button>
      
      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
