import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Shield, 
  Info,
  Sparkles,
  AlertTriangle,
  Bitcoin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import KYCGate from '../components/common/KYCGate';
import StrategyCard from '../components/strategies/StrategyCard';
import StrategyActivation from '../components/strategies/StrategyActivation';
import SecurityBadge from '../components/common/SecurityBadge';
import CryptoAnalyzer from '../components/analysis/CryptoAnalyzer';
import { USDT_INR_RATE } from '@/lib/marketPrices';

const cryptoStrategies = [
  {
    id: 'crypto-conservative',
    name: 'Stable Growth',
    description: 'Focus on established cryptocurrencies with lower volatility',
    riskLevel: 'low',
    allocation: [
      { asset: 'Bitcoin (BTC)', percentage: 50 },
      { asset: 'Ethereum (ETH)', percentage: 30 },
      { asset: 'Stablecoins (USDT)', percentage: 20 },
    ],
    riskExplanation: 'This strategy focuses on established assets but crypto markets are inherently volatile. Even "stable" coins can experience significant price swings.',
    worstDrawdown: '-35% during major market corrections (2022 example)'
  },
  {
    id: 'crypto-balanced',
    name: 'Balanced Crypto',
    description: 'Mix of established and emerging cryptocurrencies',
    riskLevel: 'medium',
    allocation: [
      { asset: 'Bitcoin (BTC)', percentage: 40 },
      { asset: 'Ethereum (ETH)', percentage: 25 },
      { asset: 'Alt-coins (Top 20)', percentage: 25 },
      { asset: 'Stablecoins', percentage: 10 },
    ],
    riskExplanation: 'Includes alt-coins which can be more volatile than BTC/ETH. Higher potential for both gains and losses.',
    worstDrawdown: '-55% during bear markets (historical data)'
  },
  {
    id: 'crypto-growth',
    name: 'Growth Focus',
    description: 'Higher exposure to emerging crypto assets',
    riskLevel: 'high',
    allocation: [
      { asset: 'Bitcoin (BTC)', percentage: 30 },
      { asset: 'Ethereum (ETH)', percentage: 20 },
      { asset: 'Alt-coins', percentage: 40 },
      { asset: 'DeFi Tokens', percentage: 10 },
    ],
    riskExplanation: 'High volatility exposure. Alt-coins and DeFi tokens can lose 70-90% of value in downturns. Only for users comfortable with significant risk.',
    worstDrawdown: '-75% or more in severe market downturns'
  }
];

export default function CryptoSolve() {
  const queryClient = useQueryClient();
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showActivationDialog, setShowActivationDialog] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: kycProfiles = [] } = useQuery({
    queryKey: ['kyc-profile'],
    queryFn: () => base44.entities.KYCProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const kycProfile = kycProfiles[0];
  const portfolio = portfolios[0];

  const handleSelectStrategy = (strategy) => {
    setSelectedStrategy(strategy);
    setShowActivationDialog(true);
  };

  const handleActivationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CryptoSolve</h1>
                <p className="text-slate-600">Risk-aware crypto investing with guided decisions.</p>
              </div>
            </div>
          </div>
          <SecurityBadge variant="verified" />
        </div>

        <KYCGate 
          kycStatus={kycProfile?.kyc_status} 
          kycPercentage={kycProfile?.kyc_completion_percentage}
          featureName="CryptoSolve strategies"
        >
          <div className="space-y-6">
            {/* USDT Balance Indicator */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-sm">₮</span>
                  </div>
                  <div>
                    <p className="text-sm text-amber-700">USDT Balance</p>
                    <p className="text-xl font-bold text-amber-900">
                      {(portfolio?.usdt_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                    </p>
                  </div>
                </div>
                {(portfolio?.usdt_balance || 0) === 0 ? (
                  <Link to={createPageUrl('TradeDesk')}>
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      Buy USDT
                    </Button>
                  </Link>
                ) : (
                  <span className="text-xs text-amber-600">1 USDT = ₹{USDT_INR_RATE}</span>
                )}
              </div>
              {(portfolio?.usdt_balance || 0) === 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  Crypto strategies are purchased with USDT. Convert INR → USDT in TradeDesk first.
                </p>
              )}
            </div>

            {/* Crypto Analyzer - FUNCTIONAL */}
            <CryptoAnalyzer />

            {/* Important Disclaimer */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <AlertTitle className="text-amber-800">Important Disclaimer</AlertTitle>
              <AlertDescription className="text-amber-700 mt-2">
                <ul className="list-disc pl-4 space-y-1">
                  <li>AI does NOT predict prices or guarantee profits</li>
                  <li>These are suggestions based on risk classification, not recommendations</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>You are solely responsible for your investment decisions</li>
                  <li>Every trade requires your explicit approval</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>How CryptoSolve Works</CardTitle>
                    <CardDescription>AI-assisted decisions, you stay in control</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mb-3">1</div>
                    <h4 className="font-medium text-slate-900 mb-1">AI Analyzes Assets</h4>
                    <p className="text-sm text-slate-600">Classifies by volatility, liquidity, and historical data</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mb-3">2</div>
                    <h4 className="font-medium text-slate-900 mb-1">You Review Strategy</h4>
                    <p className="text-sm text-slate-600">See complete risk disclosure and asset allocation</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mb-3">3</div>
                    <h4 className="font-medium text-slate-900 mb-1">You Approve Execution</h4>
                    <p className="text-sm text-slate-600">Each trade requires your explicit confirmation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Cards */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Choose Your Strategy</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {cryptoStrategies.map((strategy) => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    onSelect={handleSelectStrategy}
                  />
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>No P2P Trading:</strong> All crypto transactions are processed through our centralized exchange. 
                Visit TradeDesk to buy or sell crypto assets securely.
              </AlertDescription>
            </Alert>
          </div>
        </KYCGate>

        {/* Strategy Activation Dialog */}
        <StrategyActivation
          open={showActivationDialog}
          onOpenChange={setShowActivationDialog}
          strategy={selectedStrategy}
          assetType="Crypto"
          user={user}
          portfolio={portfolio}
          onSuccess={handleActivationSuccess}
        />
      </div>
    </div>
  );
}
