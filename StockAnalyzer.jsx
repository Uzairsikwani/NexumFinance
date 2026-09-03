import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { STOCK_PRICES } from '@/lib/marketPrices';

// Analysis metadata for known stocks — keys match STOCK_PRICES in marketPrices.js
const stockDatabase = {
  'RELIANCE':   { sector: 'Energy', pe: 28, beta: 1.1, dividend: 0.4, marketCap: 'Large' },
  'TCS':        { sector: 'IT', pe: 32, beta: 0.8, dividend: 1.2, marketCap: 'Large' },
  'HDFCBANK':   { sector: 'Banking', pe: 22, beta: 1.2, dividend: 1.5, marketCap: 'Large' },
  'INFY':       { sector: 'IT', pe: 28, beta: 0.9, dividend: 2.1, marketCap: 'Large' },
  'ICICIBANK':  { sector: 'Banking', pe: 20, beta: 1.3, dividend: 0.8, marketCap: 'Large' },
  'TATAMOTORS': { sector: 'Auto', pe: 35, beta: 1.6, dividend: 0.2, marketCap: 'Large' },
  'WIPRO':      { sector: 'IT', pe: 24, beta: 0.85, dividend: 0.5, marketCap: 'Large' },
  'SBIN':       { sector: 'Banking', pe: 18, beta: 1.15, dividend: 1.4, marketCap: 'Large' },
  'LT':         { sector: 'Infrastructure', pe: 34, beta: 1.25, dividend: 0.9, marketCap: 'Large' },
  'BAJFINANCE': { sector: 'Finance', pe: 40, beta: 1.35, dividend: 0.5, marketCap: 'Large' },
};

export default function StockAnalyzer({ onTradeAdd }) {
  const [stockName, setStockName] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const analyzeStock = async () => {
    setError('');
    setAnalysisResult(null);

    // Validation
    if (!stockName.trim()) {
      setError('Please enter a stock name or ticker symbol');
      return;
    }
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      setError('Please enter a valid investment amount');
      return;
    }
    if (!timeHorizon) {
      setError('Please select a time horizon');
      return;
    }

    setIsAnalyzing(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const ticker = stockName.toUpperCase().trim();
    const amount = parseFloat(investmentAmount);
    const stockData = stockDatabase[ticker];

    let result;
    if (stockData) {
      // Known stock - detailed analysis
      result = generateDetailedAnalysis(ticker, stockData, amount, timeHorizon);
    } else {
      // Unknown stock - generic analysis based on input
      result = generateGenericAnalysis(ticker, amount, timeHorizon);
    }

    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const generateDetailedAnalysis = (ticker, data, amount, horizon) => {
    let riskLevel, expectedReturnMin, expectedReturnMax, recommendation;
    
    // Calculate risk based on beta and PE
    const riskScore = (data.beta * 40) + (data.pe > 30 ? 30 : data.pe > 20 ? 20 : 10);
    
    if (riskScore < 50) {
      riskLevel = 'Low';
    } else if (riskScore < 70) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'High';
    }

    // Calculate expected returns based on time horizon
    const baseReturn = 12; // Average market return
    const horizonMultiplier = horizon === 'short' ? 0.5 : horizon === 'mid' ? 1 : 1.5;
    const sectorBonus = data.sector === 'IT' ? 3 : data.sector === 'Banking' ? 2 : 0;
    
    expectedReturnMin = Math.round((baseReturn - 8 + sectorBonus) * horizonMultiplier);
    expectedReturnMax = Math.round((baseReturn + 10 + sectorBonus) * horizonMultiplier);

    // Generate recommendation
    if (data.pe < 25 && data.beta < 1.2 && horizon !== 'short') {
      recommendation = 'Buy';
    } else if (data.pe > 35 || (data.beta > 1.4 && horizon === 'short')) {
      recommendation = 'Avoid';
    } else {
      recommendation = 'Hold';
    }

    const livePrice = STOCK_PRICES[ticker]?.price_inr ?? 0;

    return {
      ticker,
      stockName: ticker,
      investmentAmount: amount,
      timeHorizon: horizon,
      isKnownStock: true,
      sector: data.sector,
      marketCap: data.marketCap,
      peRatio: data.pe,
      beta: data.beta,
      dividendYield: data.dividend,
      livePrice,
      riskLevel,
      expectedReturnMin,
      expectedReturnMax,
      recommendation,
      projectedValue: {
        min: Math.round(amount * (1 + expectedReturnMin / 100)),
        max: Math.round(amount * (1 + expectedReturnMax / 100))
      },
      riskFactors: generateRiskFactors(data, horizon),
      timestamp: new Date().toISOString()
    };
  };

  const generateGenericAnalysis = (ticker, amount, horizon) => {
    // Random but consistent analysis for unknown stocks
    const hash = ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const riskScore = (hash % 60) + 20;
    
    const riskLevel = riskScore < 40 ? 'Low' : riskScore < 60 ? 'Medium' : 'High';
    const expectedReturnMin = horizon === 'short' ? -5 : horizon === 'mid' ? 5 : 8;
    const expectedReturnMax = horizon === 'short' ? 15 : horizon === 'mid' ? 25 : 40;
    const recommendation = riskScore < 50 ? 'Hold' : 'Avoid';

    return {
      ticker,
      stockName: ticker,
      investmentAmount: amount,
      timeHorizon: horizon,
      isKnownStock: false,
      riskLevel,
      expectedReturnMin,
      expectedReturnMax,
      recommendation,
      projectedValue: {
        min: Math.round(amount * (1 + expectedReturnMin / 100)),
        max: Math.round(amount * (1 + expectedReturnMax / 100))
      },
      riskFactors: [
        'Unknown stock - limited data available',
        'Higher uncertainty in projections',
        'Recommend additional research before investing'
      ],
      timestamp: new Date().toISOString()
    };
  };

  const generateRiskFactors = (data, horizon) => {
    const factors = [];
    if (data.beta > 1.2) factors.push('High volatility stock - price swings expected');
    if (data.pe > 30) factors.push('Premium valuation - may be overpriced');
    if (horizon === 'short') factors.push('Short-term investing increases risk');
    if (data.dividend < 0.5) factors.push('Low dividend yield - growth dependent');
    if (factors.length === 0) factors.push('Relatively stable fundamentals');
    return factors;
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getRecommendationIcon = (rec) => {
    switch (rec) {
      case 'Buy': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'Hold': return <Minus className="w-5 h-5 text-amber-600" />;
      case 'Avoid': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'Buy': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Hold': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Avoid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleAddToPortfolio = () => {
    if (analysisResult && onTradeAdd) {
      const price = analysisResult.livePrice || (STOCK_PRICES[analysisResult.ticker]?.price_inr ?? 0);
      const quantity = price > 0 ? analysisResult.investmentAmount / price : 0;
      onTradeAdd({
        assetType: 'Stock',
        assetName: analysisResult.ticker,
        buyPrice: price,
        quantity,
        totalInvested: analysisResult.investmentAmount
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock-name">Stock Name / Ticker</Label>
              <Input
                id="stock-name"
                placeholder="e.g., RELIANCE, TCS, INFY"
                value={stockName}
                onChange={(e) => setStockName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment-amount">Investment Amount (₹)</Label>
              <Input
                id="investment-amount"
                type="number"
                placeholder="Enter amount"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-horizon">Time Horizon</Label>
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short Term (0-1 year)</SelectItem>
                  <SelectItem value="mid">Mid Term (1-3 years)</SelectItem>
                  <SelectItem value="long">Long Term (3+ years)</SelectItem>
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
            onClick={analyzeStock} 
            disabled={isAnalyzing}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Stock'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysisResult && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Analysis Complete - {analysisResult.ticker}
              </CardTitle>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Simulated Analysis
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Risk Level</p>
                <Badge className={`${getRiskColor(analysisResult.riskLevel)} text-base px-3 py-1`}>
                  {analysisResult.riskLevel}
                </Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Expected Return</p>
                <p className="text-lg font-bold text-slate-900">
                  {analysisResult.expectedReturnMin}% - {analysisResult.expectedReturnMax}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Recommendation</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getRecommendationColor(analysisResult.recommendation)}`}>
                  {getRecommendationIcon(analysisResult.recommendation)}
                  <span className="font-bold">{analysisResult.recommendation}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500 mb-1">Time Horizon</p>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {analysisResult.timeHorizon} Term
                </p>
              </div>
            </div>

            {/* Projected Value */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="font-medium text-emerald-800 mb-2">Projected Portfolio Value</h4>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-emerald-600">Investment</p>
                  <p className="text-xl font-bold text-emerald-900">₹{analysisResult.investmentAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-emerald-400">→</div>
                <div>
                  <p className="text-sm text-emerald-600">Projected Range</p>
                  <p className="text-xl font-bold text-emerald-900">
                    ₹{analysisResult.projectedValue.min.toLocaleString('en-IN')} - ₹{analysisResult.projectedValue.max.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Details (if known) */}
            {analysisResult.isKnownStock && (
              <>
                {/* Live Price */}
                {analysisResult.livePrice > 0 && (
                  <div className="p-4 bg-slate-900 text-white rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Indicative Price</p>
                    <p className="text-2xl font-bold">₹{analysisResult.livePrice.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-slate-400">
                      {analysisResult.investmentAmount > 0 && analysisResult.livePrice > 0
                        ? `${(analysisResult.investmentAmount / analysisResult.livePrice).toFixed(4)} shares for ₹${analysisResult.investmentAmount.toLocaleString('en-IN')}`
                        : analysisResult.ticker}
                    </p>
                  </div>
                )}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Sector</p>
                    <p className="font-medium">{analysisResult.sector}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">P/E Ratio</p>
                    <p className="font-medium">{analysisResult.peRatio}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Beta</p>
                    <p className="font-medium">{analysisResult.beta}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Dividend Yield</p>
                    <p className="font-medium">{analysisResult.dividendYield}%</p>
                  </div>
                </div>
              </>
            )}

            {/* Risk Factors */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-medium text-amber-800">Risk Factors</h4>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.riskFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-amber-700">{factor}</li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            {onTradeAdd && analysisResult.recommendation === 'Buy' && (
              <Button 
                onClick={handleAddToPortfolio}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Add to Portfolio
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
