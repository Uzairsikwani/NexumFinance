import React, { useState } from 'react';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function RiskDisclosure({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title = "Risk Acknowledgement",
  riskLevel = "medium",
  assetName = "this asset",
  worstCaseScenario = "You could lose a significant portion of your investment",
  customDisclosures = []
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const riskColors = {
    low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' }
  };

  const colors = riskColors[riskLevel] || riskColors.medium;

  const handleConfirm = () => {
    if (acknowledged && understood) {
      onConfirm();
      setAcknowledged(false);
      setUnderstood(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
              <AlertTriangle className={`w-5 h-5 ${colors.icon}`} />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Please read and acknowledge the following before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className={`p-4 rounded-lg ${colors.bg} ${colors.border} border`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-4 h-4 ${colors.icon}`} />
              <span className={`font-medium ${colors.text}`}>
                Risk Level: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Investing in {assetName} involves risk. Past performance does not guarantee future results.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-900 mb-2">Worst Case Scenario</h4>
            <p className="text-sm text-slate-600">{worstCaseScenario}</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="acknowledge" 
                checked={acknowledged}
                onCheckedChange={setAcknowledged}
              />
              <Label htmlFor="acknowledge" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                I acknowledge that this platform does NOT predict prices or guarantee profits. 
                AI assistance is for decision support only.
              </Label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox 
                id="understand" 
                checked={understood}
                onCheckedChange={setUnderstood}
              />
              <Label htmlFor="understand" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                I understand the risk and approve this action. I am solely responsible for my investment decisions.
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!acknowledged || !understood}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            I Confirm & Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
