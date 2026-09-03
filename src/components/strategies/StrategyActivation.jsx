import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CRYPTO_PRICES, STOCK_PRICES, USDT_INR_RATE, mergeHoldings, calculatePortfolioMetrics } from '@/lib/marketPrices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  Wallet,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StrategyActivation({ 
  open, 
  onOpenChange, 
  strategy, 
  assetType = 'Stock',
  user,
  portfolio,
  onSuccess 
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState('amount'); // amount, risk, executing, success
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionResult, setExecutionResult] = useState(null);

  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: (data) => base44.entities.Portfolio.update(portfolio?.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const isCrypto = assetType === 'Crypto';
  const availableBalance = isCrypto ? (portfolio?.usdt_balance || 0) : (portfolio?.inr_balance || 0);
  const minAmount = isCrypto ? 10 : 1000;
  const currencyLabel = isCrypto ? 'USDT' : '₹';
  const amount = parseFloat(investmentAmount) || 0;
  const isValidAmount = amount >= minAmount && amount <= availableBalance;

  const handleClose = () => {
    setStep('amount');
    setInvestmentAmount('');
    setAcknowledged(false);
    setUnderstood(false);
    setExecutionProgress(0);
    setExecutionResult(null);
    onOpenChange(false);
  };

  const handleProceedToRisk = () => {
    if (isValidAmount) {
      setStep('risk');
    }
  };

  const executeStrategy = async () => {
    setStep('executing');
    setExecutionProgress(0);

    // Simulate AI analyzing and executing trades
    const trades = [];
    const totalAmount = amount; // USDT for crypto, INR for stocks

    for (let i = 0; i < strategy.allocation.length; i++) {
      const allocation = strategy.allocation[i];
      const allocatedAmount = (totalAmount * allocation.percentage) / 100;
      
      // Progress update
      setExecutionProgress(((i + 1) / strategy.allocation.length) * 80);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simulate AI decision
      const aiDecision = await simulateAITrade(allocation.asset, allocatedAmount, assetType);
      trades.push({
        asset: allocation.asset,
        allocatedAmount,
        ...aiDecision
      });
    }

    // Save transactions
    setExecutionProgress(90);
    for (const trade of trades) {
      const totalAmountINR = isCrypto ? trade.allocatedAmount * USDT_INR_RATE : trade.allocatedAmount;
      await createTransactionMutation.mutateAsync({
        user_email: user.email,
        transaction_type: assetType === 'Stock' ? 'buy_stock' : 'buy_crypto',
        asset: trade.asset,
        quantity: trade.quantity,
        price_per_unit: trade.price,
        total_amount_inr: totalAmountINR,
        exchange_rate: isCrypto ? USDT_INR_RATE : undefined,
        status: 'completed',
        risk_acknowledged: true,
        notes: `AI Strategy: ${strategy.name} - ${trade.action}`
      });
    }

    // Build new holdings — use extracted ticker symbol so live-price lookup works
    const priceMap = assetType === 'Stock' ? STOCK_PRICES : CRYPTO_PRICES;
    const newHoldings = trades.map(t => {
      const symbol = extractSymbol(t.asset);
      const marketData = priceMap[symbol];
      return {
        asset: symbol,
        symbol: symbol,
        name: marketData?.name || t.asset,
        quantity: t.quantity,
        avg_buy_price: t.price,
        current_price: t.price
      };
    });

    // Merge new holdings into existing (average buy price on duplicates)
    const updatedCrypto = isCrypto ? mergeHoldings(portfolio?.crypto_holdings || [], newHoldings) : (portfolio?.crypto_holdings || []);
    const updatedStocks = !isCrypto ? mergeHoldings(portfolio?.stock_holdings || [], newHoldings) : (portfolio?.stock_holdings || []);
    const remainingINR = (portfolio?.inr_balance || 0) - (isCrypto ? 0 : totalAmount);
    const remainingUSDT = (portfolio?.usdt_balance || 0) - (isCrypto ? totalAmount : 0);
    const investedAdd = isCrypto ? totalAmount * USDT_INR_RATE : totalAmount;

    // Use shared metrics calculator for consistency
    const postTradePortfolio = {
      ...portfolio,
      crypto_holdings: updatedCrypto,
      stock_holdings: updatedStocks,
      inr_balance: remainingINR,
      usdt_balance: remainingUSDT,
    };
    const metrics = calculatePortfolioMetrics(postTradePortfolio);

    if (assetType === 'Stock') {
      await updatePortfolioMutation.mutateAsync({
        inr_balance: remainingINR,
        stock_holdings: updatedStocks,
        total_invested_inr: (portfolio?.total_invested_inr || 0) + investedAdd,
        current_value_inr: metrics.totalValue,
        risk_exposure_percentage: metrics.riskExposure
      });
    } else {
      await updatePortfolioMutation.mutateAsync({
        usdt_balance: remainingUSDT,
        crypto_holdings: updatedCrypto,
        total_invested_inr: (portfolio?.total_invested_inr || 0) + investedAdd,
        current_value_inr: metrics.totalValue,
        risk_exposure_percentage: metrics.riskExposure
      });
    }

    setExecutionProgress(100);
    setExecutionResult({
      totalInvested: totalAmount,
      trades,
      strategy: strategy.name
    });
    setStep('success');
    onSuccess?.();
  };

  // Extract ticker symbol from human-readable asset name e.g. "Bitcoin (BTC)" → "BTC"
  const extractSymbol = (assetName) => {
    if (!assetName) return null;
    const match = assetName.match(/\(([A-Z]+)\)/);
    return match ? match[1] : assetName.toUpperCase().trim();
  };

  const simulateAITrade = async (asset, amount, type) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Look up real market price — extract symbol from names like "Bitcoin (BTC)"
    const priceMap = type === 'Stock' ? STOCK_PRICES : CRYPTO_PRICES;
    const symbol = extractSymbol(asset);
    const marketData = priceMap[symbol];
    const basePrice = marketData?.price_inr ?? (type === 'Stock' ? 1500 : 5000);

    // For crypto, amount is in USDT — convert to INR using the exchange rate
    const amountInINR = type === 'Crypto' ? amount * USDT_INR_RATE : amount;
    const quantity = amountInINR / basePrice;
    const actions = ['Buy at support level', 'Accumulate on dip', 'Entry at breakout', 'Scale-in position'];

    return {
      price: basePrice,
      quantity: Math.round(quantity * 10000000) / 10000000, // 7 decimal places for small coins
      action: actions[Math.floor(Math.random() * actions.length)],
      confidence: Math.floor(Math.random() * 20) + 70
    };
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (!strategy) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {/* Step 1: Investment Amount */}
        {step === 'amount' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <DialogTitle className="text-xl">Activate: {strategy.name}</DialogTitle>
              </div>
              <DialogDescription>
                Enter the amount you want to invest using this strategy.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Strategy</span>
                  <Badge className={getRiskColor(strategy.riskLevel)}>
                    {strategy.riskLevel} risk
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{strategy.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Investment Amount {isCrypto ? '(USDT)' : '(₹)'}</Label>
                  <span className="text-sm text-slate-500">
                    Available: {isCrypto ? `${availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` : `₹${availableBalance.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <Input
                  type="number"
                  placeholder={isCrypto ? 'Min 10 USDT' : 'Min ₹1,000'}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
                {amount > 0 && amount < minAmount && (
                  <p className="text-sm text-red-600">
                    Minimum investment is {isCrypto ? `${minAmount} USDT` : `₹${minAmount.toLocaleString('en-IN')}`}
                  </p>
                )}
                {amount > availableBalance && (
                  <p className="text-sm text-red-600">Insufficient balance</p>
                )}
              </div>

              {isValidAmount && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Allocation Preview</h4>
                  <div className="space-y-2">
                    {strategy.allocation.map((alloc, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-blue-700">{alloc.asset}</span>
                        <span className="font-medium text-blue-900">
                          {isCrypto
                            ? `${((amount * alloc.percentage) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                            : `₹${((amount * alloc.percentage) / 100).toLocaleString('en-IN')}`} ({alloc.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleProceedToRisk}
                disabled={!isValidAmount}
                className="bg-slate-900 hover:bg-slate-800"
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Risk Acknowledgement */}
        {step === 'risk' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <DialogTitle className="text-xl">Risk Acknowledgement</DialogTitle>
              </div>
              <DialogDescription>
                Please read and acknowledge before AI executes trades.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Worst Case Scenario:</strong> {strategy.worstDrawdown}
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <p className="text-sm text-slate-600">
                  <strong>You are investing:</strong> {isCrypto ? `${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT` : `₹${amount.toLocaleString('en-IN')}`}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Strategy:</strong> {strategy.name}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Risk Level:</strong> {strategy.riskLevel}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="acknowledge-risk" 
                    checked={acknowledged}
                    onCheckedChange={setAcknowledged}
                  />
                  <Label htmlFor="acknowledge-risk" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                    I understand AI does NOT predict prices or guarantee profits. Past performance does not guarantee future results.
                  </Label>
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="understand-risk" 
                    checked={understood}
                    onCheckedChange={setUnderstood}
                  />
                  <Label htmlFor="understand-risk" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                    I authorize AI to execute trades based on the selected strategy. I am solely responsible for my investment decisions.
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('amount')}>Back</Button>
              <Button 
                onClick={executeStrategy}
                disabled={!acknowledged || !understood}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start AI Trading
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Executing */}
        {step === 'executing' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
                <DialogTitle className="text-xl">AI Executing Trades</DialogTitle>
              </div>
              <DialogDescription>
                Please wait while AI analyzes and executes your trades...
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium">{Math.round(executionProgress)}%</span>
                </div>
                <Progress value={executionProgress} className="h-2" />
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-500">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm">
                  {executionProgress < 30 && 'Analyzing market conditions...'}
                  {executionProgress >= 30 && executionProgress < 60 && 'Calculating optimal entry points...'}
                  {executionProgress >= 60 && executionProgress < 90 && 'Executing trades...'}
                  {executionProgress >= 90 && 'Finalizing portfolio...'}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {step === 'success' && executionResult && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <DialogTitle className="text-xl">Strategy Activated!</DialogTitle>
              </div>
              <DialogDescription>
                AI has successfully executed your trades.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-700">Total Invested</span>
                  <span className="text-xl font-bold text-emerald-900">
                    {isCrypto
                      ? `${executionResult.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                      : `₹${executionResult.totalInvested.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <p className="text-sm text-emerald-600">Strategy: {executionResult.strategy}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-900">Executed Trades</h4>
                {executionResult.trades.map((trade, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{trade.asset}</p>
                      <p className="text-xs text-slate-500">{trade.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        {isCrypto
                          ? `${trade.allocatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                          : `₹${trade.allocatedAmount.toLocaleString('en-IN')}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {trade.quantity} units @ ₹{trade.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your holdings are now visible in TradeDesk. Monitor performance and adjust as needed.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Close
              </Button>
              <Button
                onClick={() => { handleClose(); navigate(createPageUrl('TradeDesk')); }}
                className="flex-1 bg-slate-900 hover:bg-slate-800"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View in TradeDesk
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
