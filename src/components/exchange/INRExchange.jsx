import React, { useState } from 'react';
import { ArrowDownUp, Info, Clock, Shield, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RiskDisclosure from '../common/RiskDisclosure';
import { USDT_INR_RATE } from '@/lib/marketPrices';

export default function INRExchange({ inrBalance = 0, usdtBalance = 0, onExchange }) {
  const [mode, setMode] = useState('buy'); // buy = INR to USDT, sell = USDT to INR
  const [amount, setAmount] = useState('');
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Live exchange rate from centralized price source
  const exchangeRate = USDT_INR_RATE;
  const fee = 0.5; // 0.5%

  const calculateOutput = () => {
    const inputAmount = parseFloat(amount) || 0;
    const feeAmount = inputAmount * (fee / 100);
    
    if (mode === 'buy') {
      // INR to USDT
      const usdtAmount = (inputAmount - feeAmount) / exchangeRate;
      return { output: usdtAmount.toFixed(4), fee: feeAmount.toFixed(2), currency: 'USDT' };
    } else {
      // USDT to INR
      const inrAmount = (inputAmount * exchangeRate) - (inputAmount * exchangeRate * (fee / 100));
      return { output: inrAmount.toFixed(2), fee: (inputAmount * exchangeRate * (fee / 100)).toFixed(2), currency: 'INR' };
    }
  };

  const { output, fee: feeAmount, currency } = calculateOutput();

  const handleExchange = () => {
    setShowRiskDialog(true);
  };

  const confirmExchange = async () => {
    setIsLoading(true);
    setShowRiskDialog(false);
    
    try {
      await onExchange?.({
        mode,
        inputAmount: parseFloat(amount),
        outputAmount: parseFloat(output),
        exchangeRate,
        fee: parseFloat(feeAmount)
      });
      
      setAmount('');
    } catch (error) {
      console.error('Exchange failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxAmount = mode === 'buy' ? inrBalance : usdtBalance;
  const inputCurrency = mode === 'buy' ? 'INR' : 'USDT';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>NEXUM Exchange</CardTitle>
              <CardDescription>
                INR ↔ USDT with transparent rates
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4" />
              <span>No P2P</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy USDT</TabsTrigger>
              <TabsTrigger value="sell">Sell USDT</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="p-4 bg-slate-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Current Rate</span>
              <span className="font-medium">1 USDT = ₹{exchangeRate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Platform Fee</span>
              <span className="font-medium">{fee}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Settlement Time</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-medium">Instant</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>You {mode === 'buy' ? 'Pay' : 'Sell'}</Label>
                <span className="text-sm text-slate-500">
                  Balance: {mode === 'buy' ? `₹${inrBalance.toLocaleString('en-IN')}` : `${usdtBalance} USDT`}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-20 text-lg h-14"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setAmount(maxAmount.toString())}
                    className="h-7 text-xs"
                  >
                    MAX
                  </Button>
                  <span className="font-medium text-slate-600">{inputCurrency}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <ArrowDownUp className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>You {mode === 'buy' ? 'Receive' : 'Get'}</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={output}
                  readOnly
                  className="pr-16 text-lg h-14 bg-slate-50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-slate-600">
                  {currency}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Fee: ₹{feeAmount}
              </p>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This is a centralized exchange. No buyer/seller matching. Your transaction settles directly with the platform.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleExchange}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount || isLoading}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800"
          >
            {isLoading ? 'Processing...' : `Exchange ${inputCurrency} for ${currency}`}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            By proceeding, you agree to our exchange terms. Transactions are final and cannot be reversed.
          </p>
        </CardContent>
      </Card>

      <RiskDisclosure
        open={showRiskDialog}
        onOpenChange={setShowRiskDialog}
        onConfirm={confirmExchange}
        title="Confirm Exchange"
        riskLevel="low"
        assetName="this currency exchange"
        worstCaseScenario="Exchange rates may fluctuate. The rate at execution may differ slightly from the displayed rate."
      />
    </>
  );
}
