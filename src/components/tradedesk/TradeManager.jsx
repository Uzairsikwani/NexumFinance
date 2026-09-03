import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp, Bitcoin, Building2, Wallet, CheckCircle2, XCircle, RefreshCw, ArrowDownLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CRYPTO_PRICES, STOCK_PRICES, USDT_INR_RATE, getLivePrice, mergeHoldings, calculatePortfolioMetrics } from '@/lib/marketPrices';

export default function TradeManager({ user, portfolio, onDepositClick }) {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTrade, setNewTrade] = useState({
    assetType: '',
    assetName: '',
    buyPrice: '',
    quantity: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updatePortfolioMutation = useMutation({
    mutationFn: (data) => base44.entities.Portfolio.update(portfolio?.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const cryptoHoldings = portfolio?.crypto_holdings || [];
  const stockHoldings = portfolio?.stock_holdings || [];
  const allHoldings = [
    ...cryptoHoldings.map(h => ({ ...h, type: 'Crypto' })),
    ...stockHoldings.map(h => ({ ...h, type: 'Stock' }))
  ];

  const isCrypto = newTrade.assetType === 'Crypto';
  const inrBalance = portfolio?.inr_balance || 0;
  const usdtBalance = portfolio?.usdt_balance || 0;

  const calculateTotalInvested = () => {
    const cryptoTotal = cryptoHoldings.reduce((sum, h) => sum + (h.quantity * h.avg_buy_price), 0);
    const stockTotal = stockHoldings.reduce((sum, h) => sum + (h.quantity * h.avg_buy_price), 0);
    return cryptoTotal + stockTotal;
  };

  const calculateCurrentValue = () => {
    const cryptoTotal = cryptoHoldings.reduce((sum, h) => sum + (h.quantity * getLivePrice(h, 'crypto')), 0);
    const stockTotal = stockHoldings.reduce((sum, h) => sum + (h.quantity * getLivePrice(h, 'stock')), 0);
    return cryptoTotal + stockTotal;
  };

  const handleAddTrade = async () => {
    setError('');
    setSuccessMessage('');

    if (!newTrade.assetType) {
      setError('Please select asset type');
      return;
    }
    if (!newTrade.assetName.trim()) {
      setError('Please enter asset name');
      return;
    }
    if (!newTrade.buyPrice || parseFloat(newTrade.buyPrice) <= 0) {
      setError('Please enter a valid buy price');
      return;
    }
    if (!newTrade.quantity || parseFloat(newTrade.quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    const pricePerUnitINR = parseFloat(newTrade.buyPrice);
    const qty = parseFloat(newTrade.quantity);
    const totalCostINR = pricePerUnitINR * qty;

    // Crypto: deduct from USDT balance (convert INR cost to USDT)
    // Stock: deduct from INR balance
    if (isCrypto) {
      const totalCostUSDT = totalCostINR / USDT_INR_RATE;
      if (totalCostUSDT > usdtBalance) {
        setError(`Insufficient USDT balance. Available: ${usdtBalance.toFixed(2)} USDT (need ${totalCostUSDT.toFixed(2)} USDT)`);
        return;
      }
    } else {
      if (totalCostINR > inrBalance) {
        setError(`Insufficient INR balance. Available: ₹${inrBalance.toLocaleString('en-IN')}`);
        return;
      }
    }

    setIsLoading(true);

    const symbol = newTrade.assetName.toUpperCase().trim();
    const priceMap = isCrypto ? CRYPTO_PRICES : STOCK_PRICES;
    const livePrice = priceMap[symbol]?.price_inr ?? pricePerUnitINR;

    const holding = {
      asset: symbol,
      symbol: symbol,
      name: priceMap[symbol]?.name || symbol,
      quantity: qty,
      avg_buy_price: pricePerUnitINR,
      current_price: livePrice,
    };

    await createTransactionMutation.mutateAsync({
      user_email: user.email,
      transaction_type: isCrypto ? 'buy_crypto' : 'buy_stock',
      asset: symbol,
      quantity: qty,
      price_per_unit: pricePerUnitINR,
      total_amount_inr: totalCostINR,
      exchange_rate: isCrypto ? USDT_INR_RATE : undefined,
      status: 'completed',
      risk_acknowledged: true,
      notes: 'Manual trade from TradeDesk'
    });

    // Build the post-trade portfolio snapshot for accurate metrics
    const newCryptoHoldings = isCrypto ? mergeHoldings(cryptoHoldings, [holding]) : cryptoHoldings;
    const newStockHoldings = isCrypto ? stockHoldings : mergeHoldings(stockHoldings, [holding]);
    const newINR = isCrypto ? inrBalance : inrBalance - totalCostINR;
    const newUSDT = isCrypto ? usdtBalance - (totalCostINR / USDT_INR_RATE) : usdtBalance;
    const postTradePortfolio = {
      ...portfolio,
      crypto_holdings: newCryptoHoldings,
      stock_holdings: newStockHoldings,
      inr_balance: newINR,
      usdt_balance: newUSDT,
    };
    const metrics = calculatePortfolioMetrics(postTradePortfolio);

    await updatePortfolioMutation.mutateAsync({
      usdt_balance: newUSDT,
      inr_balance: newINR,
      crypto_holdings: newCryptoHoldings,
      stock_holdings: newStockHoldings,
      total_invested_inr: (portfolio?.total_invested_inr || 0) + totalCostINR,
      current_value_inr: metrics.totalValue,
      risk_exposure_percentage: metrics.riskExposure,
    });

    setNewTrade({ assetType: '', assetName: '', buyPrice: '', quantity: '' });
    setShowAddDialog(false);
    setSuccessMessage(`Successfully bought ${symbol}!`);
    setIsLoading(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSellHolding = async (holding, type) => {
    setIsLoading(true);
    const livePrice = getLivePrice(holding, type === 'Crypto' ? 'crypto' : 'stock');
    const sellValueINR = holding.quantity * livePrice;

    await createTransactionMutation.mutateAsync({
      user_email: user.email,
      transaction_type: type === 'Stock' ? 'sell_stock' : 'sell_crypto',
      asset: holding.asset || holding.symbol || holding.name,
      quantity: holding.quantity,
      price_per_unit: livePrice,
      total_amount_inr: sellValueINR,
      exchange_rate: type === 'Crypto' ? USDT_INR_RATE : undefined,
      status: 'completed',
      risk_acknowledged: true,
    });

    // Remove the sold holding and recalculate all portfolio metrics
    const isStockType = type === 'Stock';
    const updatedCrypto = isStockType ? cryptoHoldings : cryptoHoldings.filter(h =>
      (h.asset || h.symbol)?.toUpperCase() !== (holding.asset || holding.symbol)?.toUpperCase()
    );
    const updatedStocks = isStockType ? stockHoldings.filter(h =>
      (h.asset || h.symbol)?.toUpperCase() !== (holding.asset || holding.symbol)?.toUpperCase()
    ) : stockHoldings;
    const newINR = isStockType ? inrBalance + sellValueINR : inrBalance;
    const newUSDT = isStockType ? usdtBalance : usdtBalance + (sellValueINR / USDT_INR_RATE);

    // Reduce total_invested_inr by the original cost of the sold holding
    const soldCost = holding.quantity * holding.avg_buy_price;
    const newTotalInvested = Math.max(0, (portfolio?.total_invested_inr || 0) - soldCost);

    const postSellPortfolio = {
      ...portfolio,
      crypto_holdings: updatedCrypto,
      stock_holdings: updatedStocks,
      inr_balance: newINR,
      usdt_balance: newUSDT,
    };
    const metrics = calculatePortfolioMetrics(postSellPortfolio);

    await updatePortfolioMutation.mutateAsync({
      inr_balance: newINR,
      usdt_balance: newUSDT,
      crypto_holdings: updatedCrypto,
      stock_holdings: updatedStocks,
      total_invested_inr: newTotalInvested,
      current_value_inr: metrics.totalValue,
      risk_exposure_percentage: metrics.riskExposure,
    });

    const proceeds = type === 'Crypto'
      ? `${(sellValueINR / USDT_INR_RATE).toFixed(2)} USDT`
      : `₹${sellValueINR.toLocaleString('en-IN')}`;
    setSuccessMessage(`Sold ${holding.asset || holding.symbol || holding.name} for ${proceeds}`);
    setIsLoading(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const totalInvested = calculateTotalInvested();
  const currentValue = calculateCurrentValue();
  const pnl = currentValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm">Holdings Value</p>
            <p className="text-2xl font-bold">₹{currentValue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-400 mt-1">{allHoldings.length} assets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm">Total Invested</p>
            <p className="text-2xl font-bold text-slate-900">₹{totalInvested.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        
        <Card className={pnl >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-6">
            <p className={`text-sm ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>P&L</p>
            <p className={`text-2xl font-bold ${pnl >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString('en-IN')}
            </p>
            <p className={`text-xs ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Balance */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Available for Trading</p>
              <p className="text-xl font-bold text-slate-900">
                ₹{inrBalance.toLocaleString('en-IN')}
                <span className="text-amber-600 ml-3">{usdtBalance.toFixed(2)} USDT</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {successMessage && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Deposit Prompt when both balances are zero */}
      {inrBalance === 0 && usdtBalance === 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Wallet className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 flex items-center justify-between">
            <span>You need to deposit INR before you can buy assets.</span>
            <Button size="sm" onClick={onDepositClick} className="bg-amber-600 hover:bg-amber-700 ml-4">
              <ArrowDownLeft className="w-4 h-4 mr-1" />
              Deposit Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Add Trade Button & Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" />
            Buy Asset
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy New Asset</DialogTitle>
            <DialogDescription>
              Enter the details of your purchase.{' '}
              {isCrypto
                ? 'USDT will be deducted from your crypto balance.'
                : 'INR will be deducted from your cash balance.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">
                {isCrypto ? 'USDT Balance' : 'INR Balance'}
              </p>
              <p className="text-lg font-bold text-slate-900">
                {isCrypto
                  ? `${usdtBalance.toFixed(2)} USDT`
                  : `₹${inrBalance.toLocaleString('en-IN')}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Asset Type</Label>
              <Select 
                value={newTrade.assetType} 
                onValueChange={(value) => setNewTrade({...newTrade, assetType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stock">Stock</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Asset Name / Symbol</Label>
              <Input
                placeholder="e.g., RELIANCE, BTC"
                value={newTrade.assetName}
                onChange={(e) => setNewTrade({...newTrade, assetName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price per Unit (₹)</Label>
                <Input
                  type="number"
                  placeholder="Price"
                  value={newTrade.buyPrice}
                  onChange={(e) => setNewTrade({...newTrade, buyPrice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="Units"
                  value={newTrade.quantity}
                  onChange={(e) => setNewTrade({...newTrade, quantity: e.target.value})}
                />
              </div>
            </div>

            {newTrade.buyPrice && newTrade.quantity && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">Total Cost</p>
                <p className="text-lg font-bold text-blue-900">
                  ₹{(parseFloat(newTrade.buyPrice || 0) * parseFloat(newTrade.quantity || 0)).toLocaleString('en-IN')}
                  {isCrypto && (
                    <span className="text-sm font-normal text-blue-600 ml-2">
                      ({(parseFloat(newTrade.buyPrice || 0) * parseFloat(newTrade.quantity || 0) / USDT_INR_RATE).toFixed(2)} USDT)
                    </span>
                  )}
                </p>
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddTrade} 
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {allHoldings.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No holdings yet. Buy assets to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Avg Price</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allHoldings.map((holding, idx) => {
                  const livePrice = getLivePrice(holding, holding.type === 'Crypto' ? 'crypto' : 'stock');
                  const invested = holding.quantity * holding.avg_buy_price;
                  const current = holding.quantity * livePrice;
                  const holdingPnl = current - invested;
                  const holdingPnlPercent = invested > 0 ? (holdingPnl / invested) * 100 : 0;
                  
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            holding.type === 'Crypto' ? 'bg-amber-100' : 'bg-blue-100'
                          }`}>
                            {holding.type === 'Crypto' ? (
                              <Bitcoin className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Building2 className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <span className="font-medium">{holding.asset || holding.symbol || holding.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          holding.type === 'Stock' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }>
                          {holding.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{holding.quantity}</TableCell>
                      <TableCell className="text-right">₹{holding.avg_buy_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">₹{livePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-medium">₹{current.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">
                        <span className={holdingPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {holdingPnl >= 0 ? '+' : ''}{holdingPnlPercent.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSellHolding(holding, holding.type)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Sell
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Cards */}
      {allHoldings.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-slate-500">Stock Holdings</p>
              </div>
              <p className="text-xl font-bold text-blue-600">
                ₹{stockHoldings.reduce((sum, h) => sum + (h.quantity * getLivePrice(h, 'stock')), 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400">{stockHoldings.length} assets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bitcoin className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-slate-500">Crypto Holdings</p>
              </div>
              <p className="text-xl font-bold text-amber-600">
                ₹{cryptoHoldings.reduce((sum, h) => sum + (h.quantity * getLivePrice(h, 'crypto')), 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400">{cryptoHoldings.length} assets</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
