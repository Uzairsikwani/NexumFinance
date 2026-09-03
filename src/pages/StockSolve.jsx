import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Shield, 
  Info,
  Sparkles,
  AlertTriangle,
  Building2
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
import StockAnalyzer from '../components/analysis/StockAnalyzer';

const stockStrategies = [
  {
    id: 'stock-conservative',
    name: 'Blue Chip Focus',
    description: 'Large-cap, stable companies with dividend history',
    riskLevel: 'low',
    allocation: [
      { asset: 'Nifty 50 ETFs', percentage: 50 },
      { asset: 'Banking & Finance', percentage: 25 },
      { asset: 'FMCG', percentage: 25 },
    ],
    riskExplanation: 'Focused on established companies but stock markets can decline during economic downturns.',
    worstDrawdown: '-25% during market corrections (2020 example)'
  },
  {
    id: 'stock-balanced',
    name: 'Diversified Growth',
    description: 'Mix of large and mid-cap stocks across sectors',
    riskLevel: 'medium',
    allocation: [
      { asset: 'Large Cap', percentage: 40 },
      { asset: 'Mid Cap', percentage: 30 },
      { asset: 'Sector ETFs', percentage: 20 },
      { asset: 'Debt Funds', percentage: 10 },
    ],
    riskExplanation: 'Mid-caps can be more volatile. Sector concentration adds risk.',
    worstDrawdown: '-35% during market corrections'
  },
  {
    id: 'stock-aggressive',
    name: 'High Growth',
    description: 'Focus on growth sectors and mid/small caps',
    riskLevel: 'high',
    allocation: [
      { asset: 'Mid Cap', percentage: 35 },
      { asset: 'Small Cap', percentage: 25 },
      { asset: 'Technology', percentage: 25 },
      { asset: 'Large Cap', percentage: 15 },
    ],
    riskExplanation: 'Small and mid-caps have higher volatility. Technology sector can be cyclical.',
    worstDrawdown: '-50% or more in severe downturns'
  }
];

export default function StockSolve() {
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
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">StockSolve</h1>
                <p className="text-slate-600">Long-term stock investing made clear and structured.</p>
              </div>
            </div>
          </div>
          <SecurityBadge variant="verified" />
        </div>

        <KYCGate 
          kycStatus={kycProfile?.kyc_status} 
          kycPercentage={kycProfile?.kyc_completion_percentage}
          featureName="StockSolve strategies"
        >
          <div className="space-y-6">
            {/* Stock Analyzer - FUNCTIONAL */}
            <StockAnalyzer />

            {/* Important Notice */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Long-term investing only.</strong> StockSolve is designed for structured, long-term wealth building. 
                No intraday trading, scalping, or leverage is supported.
              </AlertDescription>
            </Alert>

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
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>How StockSolve Works</CardTitle>
                    <CardDescription>AI-assisted decisions for long-term growth</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mb-3">1</div>
                    <h4 className="font-medium text-slate-900 mb-1">Portfolio Analysis</h4>
                    <p className="text-sm text-slate-600">AI evaluates allocation and risk exposure</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mb-3">2</div>
                    <h4 className="font-medium text-slate-900 mb-1">Rebalancing Suggestions</h4>
                    <p className="text-sm text-slate-600">Get clear recommendations with full disclosure</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mb-3">3</div>
                    <h4 className="font-medium text-slate-900 mb-1">You Decide</h4>
                    <p className="text-sm text-slate-600">Every action requires your explicit approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Cards */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Choose Your Strategy</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {stockStrategies.map((strategy) => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    onSelect={handleSelectStrategy}
                  />
                ))}
              </div>
            </div>

            {/* What StockSolve Does NOT Do */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What StockSolve Does NOT Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm text-red-700 font-medium">Intraday Trading</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm text-red-700 font-medium">Scalping</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm text-red-700 font-medium">Leverage</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm text-red-700 font-medium">F&O Trading</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </KYCGate>

        {/* Strategy Activation Dialog */}
        <StrategyActivation
          open={showActivationDialog}
          onOpenChange={setShowActivationDialog}
          strategy={selectedStrategy}
          assetType="Stock"
          user={user}
          portfolio={portfolio}
          onSuccess={handleActivationSuccess}
        />
      </div>
    </div>
  );
}
