import React, { useState } from 'react';
import { ArrowUpRight, Shield, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WithdrawDialog({ open, onOpenChange, onConfirm, isLoading, availableBalance = 0 }) {
  const [amount, setAmount] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const handleConfirm = () => {
    if (acknowledged && parseFloat(amount) > 0 && parseFloat(amount) <= availableBalance) {
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

  const parsedAmount = parseFloat(amount) || 0;
  const isLargeWithdrawal = parsedAmount > 100000;
  const isValid = acknowledged && parsedAmount > 0 && parsedAmount <= availableBalance;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-amber-600" />
            </div>
            <DialogTitle className="text-xl">Withdraw INR</DialogTitle>
          </div>
          <DialogDescription>
            Withdraw funds to your linked bank account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="withdraw-amount">Amount (INR)</Label>
              <span className="text-sm text-slate-500">
                Available: ₹{availableBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={availableBalance}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAmount(availableBalance.toString())}
              className="w-full"
            >
              Withdraw Full Balance
            </Button>
          </div>

          {isLargeWithdrawal && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Withdrawals above ₹1,00,000 require manual verification and may take 24-48 hours.
              </AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Standard withdrawals are processed within 24 hours to your registered bank account.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox 
              id="withdraw-acknowledge" 
              checked={acknowledged}
              onCheckedChange={setAcknowledged}
            />
            <Label htmlFor="withdraw-acknowledge" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
              I confirm this withdrawal request and understand processing times may vary.
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
            className="bg-slate-900 hover:bg-slate-800"
          >
            {isLoading ? 'Processing...' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Withdraw ₹{parsedAmount.toLocaleString('en-IN')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
