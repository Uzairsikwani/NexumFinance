import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

import { CRYPTO_PRICES } from '@/lib/marketPrices';

// Extend shared prices with analyzer-specific metadata
const cryptoDatabase = Object.fromEntries(
  Object.entries(CRYPTO_PRICES).map(([symbol, data]) => {
    const meta = {
      BTC:  { volatility: 45, marketCap: 'Large',  liquidity: 'High',   age: 15 },
      ETH:  { volatility: 55, marketCap: 'Large',  liquidity: 'High',   age: 9  },
      BNB:  { volatility: 60, marketCap: 'Large',  liquidity: 'High',   age: 7  },
      SOL:  { volatility: 75, marketCap: 'Medium', liquidity: 'Medium', age: 6  },
      XRP:  { volatility: 65, marketCap: 'Large',  liquidity: 'High',   age: 12 },
      ADA:  { volatility: 70, marketCap: 'Medium', liquidity: 'Medium', age: 7  },
      DOGE: { volatility: 85, marketCap: 'Medium', liquidity: 'Medium', age: 11 },
      MATIC:{ volatility: 72, marketCap: 'Small',  liquidity: 'Medium', age: 5  },
      DOT:  { volatility: 68, marketCap: 'Medium', liquidity: 'Medium', age: 5  },
      AVAX: { volatility: 72, marketCap: 'Medium', liquidity: 'Medium', age: 5  },
      LINK: { volatility: 65, marketCap: 'Medium', liquidity: 'Medium', age: 7  },
      USDT: { volatility: 2,  marketCap: 'Large',  liquidity: 'High',   age: 10 },
    };
    return [symbol, { ...data, ...(meta[symbol] || { volatility: 80, marketCap: 'Unknown', liquidity: 'Low', age: 1 }) }];
  })
);

export default function CryptoAnalyzer({ onTradeAdd }) {
  const [cryptoName, setCryptoName] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [riskAppetite, setRiskAppetite] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const analyzeCrypto = async () => {
    setError('');
    setAnalysisResult(null);

    // Validation
    if (!cryptoName.trim()) {
      setError('Please enter a crypto name or symbol');
      return;
    }
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      setError('Please enter a valid investment amount');
      return;
    }
    if (!riskAppetite) {
      setError('Please select your risk appetite');
      return;
    }

    setIsAnalyzing(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const symbol = cryptoName.toUpperCase().trim();
    const amount = parseFloat(investmentAmount);
    const cryptoData = cryptoDatabase[symbol];

    let result;
    if (cryptoData) {
      result = generateDetailedAnalysis(symbol, cryptoData, amount, riskAppetite);
    } else {
      result = generateGenericAnalysis(symbol, amount, riskAppetite);
    }

    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const generateDetailedAnalysis = (symbol, data, amount, appetite) => {
    // Calculate volatility score (0-100)
    const volatilityScore = data.volatility;
    
    // Risk warning based on volatility and user appetite
    let riskWarning, suggestedAllocation;
    
    if (appetite === 'low') {
      if (volatilityScore > 50) {
        riskWarning = 'HIGH RISK WARNING: This crypto is too volatile for your risk profile. Consider more stable options like BTC or stablecoins.';
        suggestedAllocation = Math.max(5, 30 - volatilityScore / 3);
      } else {
        riskWarning = 'Moderate fit for your risk profile. Still expect significant price swings.';
        suggestedAllocation = 40;
      }
    } else if (appetite === 'medium') {
      if (volatilityScore > 70) {
        riskWarning = 'This asset has high volatility. Expect 30-50% price swings. Allocate cautiously.';
        suggestedAllocation = Math.max(10, 50 - volatilityScore / 2);
      } else {
        riskWarning = 'Reasonable fit for your risk profile. Monitor regularly.';
        suggestedAllocation = 60;
      }
    } else {
      riskWarning = volatilityScore > 80 
        ? 'Extreme volatility. High potential for both gains and losses. Only invest what you can afford to lose completely.'
        : 'Acceptable risk level for aggressive investors. Diversify to manage exposure.';
      suggestedAllocation = Math.min(80, 100 - volatilityScore / 2);
    }

    // Calculate risk level
    const riskLevel = volatilityScore < 30 ? 'Low' : volatilityScore < 60 ? 'Medium' : 'High';

    const suggestedAmt = Math.round(amount * suggestedAllocation / 100);
    const unitsYouGet = data.price_inr > 0 ? (suggestedAmt / data.price_inr) : 0;

    return {
      symbol,
      cryptoName: data.name,
      investmentAmount: amount,
      riskAppetite: appetite,
      isKnownCrypto: true,
      price_usd: data.price_usd,
      price_inr: data.price_inr,
      unitsYouGet,
      volatilityScore,
      riskLevel,
      riskWarning,
      suggestedAllocation: Math.round(suggestedAllocation),
      marketCap: data.marketCap,
      liquidity: data.liquidity,
      projectAge: data.age,
      suggestedAmount: suggestedAmt,
      metrics: {
        dailySwing: `±${Math.round(volatilityScore / 10)}%`,
        monthlyVolatility: `±${Math.round(volatilityScore / 2)}%`,
        yearlyRange: `±${volatilityScore * 2}%`
      },
      timestamp: new Date().toISOString()
    };
  };

  const generateGenericAnalysis = (symbol, amount, appetite) => {
    // High risk for unknown cryptos
    const volatilityScore = 85;
    const riskWarning = 'CAUTION: Unknown cryptocurrency. Limited data available. Extremely high risk. Only invest what you can afford to lose completely.';
    const suggestedAllocation = appetite === 'high' ? 20 : appetite === 'medium' ? 10 : 5;

    return {
      symbol,
      cryptoName: symbol,
      investmentAmount: amount,
      riskAppetite: appetite,
      isKnownCrypto: false,
      volatilityScore,
      riskLevel: 'High',
      riskWarning,
      suggestedAllocation,
      suggestedAmount: Math.round(amount * suggestedAllocation / 100),
      metrics: {
        dailySwing: '±10%+',
        monthlyVolatility: '±50%+',
        yearlyRange: '±200%+'
      },
      timestamp: new Date().toISOString()
    };
  };

  const getVolatilityColor = (score) => {
    if (score < 30) return 'bg-emerald-500';
    if (score < 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleAddToPortfolio = () => {
    if (analysisResult && onTradeAdd) {
      onTradeAdd({
        assetType: 'Crypto',
        assetName: analysisResult.symbol,
        buyPrice: analysisResult.suggestedAmount / 0.1, // Simulated price
        quantity: 0.1,
        totalInvested: analysisResult.suggestedAmount
      });
    }
  };

  // Top coins for the live ticker
  const topCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'DOT'];

  return (
    <div className="space-y-6">
      {/* Live Price Ticker */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <p className="text-xs text-slate-400 mb-3 font-medium">INDICATIVE PRICES</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {topCoins.map(symbol => {
              const coin = cryptoDatabase[symbol];
              if (!coin) return null;
              return (
                <div key={symbol} className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setCryptoName(symbol)}>
                  <p className="text-xs font-bold text-slate-500">{symbol}</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {coin.price_inr >= 100 ? `₹${coin.price_inr.toLocaleString('en-IN')}` : `₹${coin.price_inr}`}
                  </p>
                  <p className="text-xs text-slate-400">${coin.price_usd >= 1 ? coin.price_usd.toLocaleString('en-US') : coin.price_usd}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-2">Tap any coin to auto-fill. Prices sourced from Coinbase, CoinGecko, Yahoo Finance.</p>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Crypto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crypto-name">Crypto Name / Symbol</Label>
              <Input
                id="crypto-name"
                placeholder="e.g., BTC, ETH, SOL"
                value={cryptoName}
                onChange={(e) => setCryptoName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crypto-amount">Investment Amount (₹)</Label>
              <Input
                id="crypto-amount"
                type="number"
                placeholder="Enter amount"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-appetite">Risk Appetite</Label>
              <Select value={riskAppetite} onValueChange={setRiskAppetite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Prefer stability</SelectItem>
                  <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                  <SelectItem value="high">High - Comfortable with volatility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={analyzeCrypto} 
            disabled={isAnalyzing}
            className="w-full md:w-auto bg-amber-600 hover:bg-amber-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Crypto'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysisResult && (
        <Card className="border-2 border-amber-200">
          <CardHeader className="bg-amber-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                Analysis Complete - {analysisResult.cryptoName} ({analysisResult.symbol})
              </CardTitle>
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                Simulated Analysis
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Volatility Score */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-slate-600" />
                  <span className="font-medium">Volatility Score</span>
                </div>
                <span className="text-2xl font-bold">{analysisResult.volatilityScore}/100</span>
              </div>
              <Progress 
                value={analysisResult.volatilityScore} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Risk Level</p>
                <Badge className={`${getRiskColor(analysisResult.riskLevel)} text-base px-3 py-1`}>
                  {analysisResult.riskLevel}
                </Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Suggested Allocation</p>
                <p className="text-2xl font-bold text-slate-900">{analysisResult.suggestedAllocation}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Daily Swing</p>
                <p className="text-lg font-bold text-slate-900">{analysisResult.metrics.dailySwing}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Monthly Volatility</p>
                <p className="text-lg font-bold text-slate-900">{analysisResult.metrics.monthlyVolatility}</p>
              </div>
            </div>

            {/* Suggested Investment */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="font-medium text-emerald-800 mb-2">Suggested Investment</h4>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-emerald-600">Your Budget</p>
                  <p className="text-xl font-bold text-emerald-900">₹{analysisResult.investmentAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-emerald-400">→</div>
                <div>
                  <p className="text-sm text-emerald-600">Suggested for {analysisResult.symbol}</p>
                  <p className="text-xl font-bold text-emerald-900">₹{analysisResult.suggestedAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-emerald-400">→</div>
                <div>
                  <p className="text-sm text-emerald-600">Remaining for diversification</p>
                  <p className="text-xl font-bold text-emerald-900">₹{(analysisResult.investmentAmount - analysisResult.suggestedAmount).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Live Price + Units */}
            {analysisResult.isKnownCrypto && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 text-white rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Indicative Price</p>
                  <p className="text-2xl font-bold">₹{analysisResult.price_inr?.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-slate-400">${analysisResult.price_usd?.toLocaleString('en-US')}</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Units you'd get for ₹{analysisResult.suggestedAmount?.toLocaleString('en-IN')}</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analysisResult.unitsYouGet < 0.001
                      ? analysisResult.unitsYouGet.toFixed(8)
                      : analysisResult.unitsYouGet < 1
                      ? analysisResult.unitsYouGet.toFixed(4)
                      : analysisResult.unitsYouGet.toFixed(2)} {analysisResult.symbol}
                  </p>
                </div>
              </div>
            )}
            {analysisResult.isKnownCrypto && (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Market Cap</p>
                  <p className="font-medium">{analysisResult.marketCap}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Liquidity</p>
                  <p className="font-medium">{analysisResult.liquidity}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Project Age</p>
                  <p className="font-medium">{analysisResult.projectAge} years</p>
                </div>
              </div>
            )}

            {/* Risk Warning */}
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                {analysisResult.riskWarning}
              </AlertDescription>
            </Alert>

            {/* Action Button */}
            {onTradeAdd && analysisResult.suggestedAllocation > 10 && (
              <Button 
                onClick={handleAddToPortfolio}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                Add ₹{analysisResult.suggestedAmount.toLocaleString('en-IN')} to Portfolio
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
