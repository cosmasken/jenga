
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { Shield, Eye, FileCheck } from "lucide-react";

interface ZKVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultType: "emergency" | "vacation";
}

export const ZKVaultModal = ({ isOpen, onClose, vaultType }: ZKVaultModalProps) => {
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const vaultData = {
    emergency: {
      name: "Emergency Fund",
      color: "green",
      progress: "100%",
      proofHash: "0x7a8b9c2d...f3e1a5b8",
      lastProof: "2024-08-01 14:30 UTC"
    },
    vacation: {
      name: "Vacation Fund", 
      color: "blue",
      progress: "75%",
      proofHash: "0x4f2a8b9c...d7e5f3a1",
      lastProof: "2024-07-28 09:15 UTC"
    }
  };

  const vault = vaultData[vaultType];

  const handleGenerateProof = async () => {
    setIsGeneratingProof(true);
    
    // Mock ZK proof generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGeneratingProof(false);
    setShowProofModal(true);
  };

  const handleViewDetails = async () => {
    setIsViewingDetails(true);
    
    // Mock loading vault details
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsViewingDetails(false);
    setShowDetailsModal(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
              <Shield className={`w-5 h-5 text-${vault.color}-400`} />
              {vault.name} - ZK Vault
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className={`p-4 bg-${vault.color}-500/10 border border-${vault.color}-500/30 rounded-lg`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold text-${vault.color}-400 font-mono`}>VAULT STATUS</h3>
                <Badge variant="outline" className={`bg-${vault.color}-500/20 text-${vault.color}-400 border-${vault.color}-500/50 font-mono`}>
                  {vault.progress} Complete
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PROOF HASH:</span>
                  <span className={`text-${vault.color}-400`}>{vault.proofHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LAST PROOF:</span>
                  <span className="text-foreground">{vault.lastProof}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PRIVACY LEVEL:</span>
                  <span className="text-green-400">MAXIMUM</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleViewDetails}
                variant="outline" 
                className="cyber-button"
              >
                <Eye className="w-4 h-4 mr-2" />
                VIEW DETAILS
              </Button>
              <Button 
                onClick={handleGenerateProof}
                className={`cyber-button bg-${vault.color}-500 hover:bg-${vault.color}-600 text-white`}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                GENERATE PROOF
              </Button>
            </div>
            
            <Button variant="outline" onClick={onClose} className="w-full cyber-button">
              CLOSE
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isGeneratingProof}
        title="Generating ZK Proof..."
        description="Creating cryptographic proof without revealing balance"
      />

      <LoadingModal
        isOpen={isViewingDetails}
        title="Loading Vault Details..."
        description="Accessing encrypted vault information"
      />

      <Modal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        type="success"
        title="ZK Proof Generated! 🔐"
        description="Your savings proof is ready without revealing the amount"
      />

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        type="success"
        title="Vault Details Loaded! 📊"
        description="Your private vault information is now accessible"
      />
    </>
  );
};
