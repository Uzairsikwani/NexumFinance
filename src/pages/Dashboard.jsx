import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  Bell,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import KYCGate from '../components/common/KYCGate';
import PortfolioSummary from '../components/portfolio/PortfolioSummary';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import TransactionHistory from '../components/transactions/TransactionHistory';
import SecurityBadge from '../components/common/SecurityBadge';
import MarketNews from '../components/common/MarketNews';

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
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

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.filter({ user_email: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const kycProfile = kycProfiles[0];
  const portfolio = portfolios[0];
  const isKYCApproved = kycProfile?.kyc_status === 'approved';

  // Create portfolio if doesn't exist
  const createPortfolioMutation = useMutation({
    mutationFn: (data) => base44.entities.Portfolio.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  useEffect(() => {
    // Create portfolio as soon as KYC is approved and no portfolio exists yet
    if (user?.email && portfolios.length === 0 && isKYCApproved && !createPortfolioMutation.isPending && !createPortfolioMutation.isSuccess) {
      createPortfolioMutation.mutate({
        user_email: user.email,
        total_invested_inr: 0,
        current_value_inr: 0,
        inr_balance: 0,
        usdt_balance: 0,
        crypto_holdings: [],
        stock_holdings: [],
        risk_exposure_percentage: 0
      });
    }
  }, [user?.email, portfolios.length, isKYCApproved]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">NEXUM</h1>
              <p className="text-xs text-slate-500">Invest with clarity.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <SecurityBadge variant="monitored" size="sm" />
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5 text-slate-600" />
            </Button>
            <Link to={createPageUrl('Settings')}>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome & KYC Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Investor'}
            </h2>
            <p className="text-slate-600">
              {isKYCApproved 
                ? 'Your portfolio at a glance' 
                : 'Complete KYC to start investing'}
            </p>
          </div>
          
          {!isKYCApproved && (
            <Link to={createPageUrl('KYCOnboarding')}>
              <Button className="bg-slate-900 hover:bg-slate-800">
                Complete KYC
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* KYC Gate */}
        <KYCGate 
          kycStatus={kycProfile?.kyc_status} 
          kycPercentage={kycProfile?.kyc_completion_percentage}
          featureName="portfolio management"
        >
          {/* Portfolio Summary */}
          <PortfolioSummary portfolio={portfolio} isLoading={!portfolio} />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to={createPageUrl('TradeDesk')} className="block">
              <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                <Wallet className="w-6 h-6 text-violet-600 mb-3" />
                <h3 className="font-medium text-slate-900">TradeDesk</h3>
                <p className="text-sm text-slate-500">Buy, sell & exchange</p>
              </div>
            </Link>
            
            <Link to={createPageUrl('CryptoSolve')} className="block">
              <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                <TrendingUp className="w-6 h-6 text-amber-600 mb-3" />
                <h3 className="font-medium text-slate-900">CryptoSolve</h3>
                <p className="text-sm text-slate-500">Crypto investing</p>
              </div>
            </Link>
            
            <Link to={createPageUrl('StockSolve')} className="block">
              <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                <Shield className="w-6 h-6 text-blue-600 mb-3" />
                <h3 className="font-medium text-slate-900">StockSolve</h3>
                <p className="text-sm text-slate-500">Stock investing</p>
              </div>
            </Link>
          </div>

          {/* Holdings & Transactions */}
          <Tabs defaultValue="holdings" className="w-full">
            <TabsList>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="holdings" className="mt-4">
              <HoldingsTable 
                cryptoHoldings={portfolio?.crypto_holdings || []}
                stockHoldings={portfolio?.stock_holdings || []}
              />
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-4">
              <TransactionHistory 
                transactions={transactions}
                isLoading={txLoading}
              />
            </TabsContent>
          </Tabs>
        </KYCGate>

        {/* Market News */}
        <MarketNews />

        {/* Security Notice */}
        <div className="p-4 bg-slate-100 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-700">
                <strong>Security Reminder:</strong> We never ask for your password via email or phone. 
                Enable 2FA for additional security. For large withdrawals, additional verification may be required.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
