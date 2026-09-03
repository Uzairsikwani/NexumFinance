import React, { useState } from 'react';
import { ArrowDownLeft, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DepositDialog({ open, onOpenChange, onConfirm, isLoading }) {
  const [amount, setAmount] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const handleConfirm = () => {
    if (acknowledged && parseFloat(amount) >= 500) {
      onConfirm(parseFloat(amount));
      setAmount('');
      setAcknowledged(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setAcknowledged(false);
    onOpenChange(false);
  };

  const isValid = acknowledged && parseFloat(amount) >= 500 && parseFloat(amount) <= 1000000;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl">Deposit INR</DialogTitle>
          </div>
          <DialogDescription>
            Add funds to your NEXUM wallet securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (INR)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={500}
              max={1000000}
            />
            <p className="text-xs text-slate-500">
              Min: ₹500 | Max: ₹10,00,000 per transaction
            </p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                Your funds are held in segregated accounts and protected by industry-standard security.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox 
              id="deposit-acknowledge" 
              checked={acknowledged}
              onCheckedChange={setAcknowledged}
            />
            <Label htmlFor="deposit-acknowledge" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
              I understand that deposits are processed instantly and withdrawal may take up to 24 hours for verification.
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? 'Processing...' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Deposit ₹{parseFloat(amount || 0).toLocaleString('en-IN')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
