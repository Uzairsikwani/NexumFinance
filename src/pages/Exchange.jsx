import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft,
  Shield,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import KYCGate from '../components/common/KYCGate';
import INRExchange from '../components/exchange/INRExchange';
import DepositDialog from '../components/exchange/DepositDialog';
import WithdrawDialog from '../components/exchange/WithdrawDialog';
import SecurityBadge from '../components/common/SecurityBadge';

export default function Exchange() {
  const queryClient = useQueryClient();
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const updatePortfolioMutation = useMutation({
    mutationFn: (data) => base44.entities.Portfolio.update(portfolio?.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const handleDeposit = async (amount) => {
    setIsLoading(true);
    
    await createTransactionMutation.mutateAsync({
      user_email: user.email,
      transaction_type: 'deposit',
      total_amount_inr: amount,
      status: 'completed',
      risk_acknowledged: true
    });

    await updatePortfolioMutation.mutateAsync({
      inr_balance: (portfolio?.inr_balance || 0) + amount,
      total_invested_inr: (portfolio?.total_invested_inr || 0) + amount
    });

    setShowDepositDialog(false);
    setIsLoading(false);
  };

  const handleWithdraw = async (amount) => {
    setIsLoading(true);
    
    const status = amount > 100000 ? 'pending_review' : 'completed';
    
    await createTransactionMutation.mutateAsync({
      user_email: user.email,
      transaction_type: 'withdrawal',
      total_amount_inr: amount,
      status: status,
      risk_acknowledged: true,
      notes: amount > 100000 ? 'Large withdrawal - manual review required' : ''
    });

    await updatePortfolioMutation.mutateAsync({
      inr_balance: (portfolio?.inr_balance || 0) - amount
    });

    setShowWithdrawDialog(false);
    setIsLoading(false);
  };

  const handleExchange = async (exchangeData) => {
    await createTransactionMutation.mutateAsync({
      user_email: user.email,
      transaction_type: exchangeData.mode === 'buy' ? 'inr_to_usdt' : 'usdt_to_inr',
      total_amount_inr: exchangeData.inputAmount,
      exchange_rate: exchangeData.exchangeRate,
      fees_inr: exchangeData.fee,
      status: 'completed',
      risk_acknowledged: true
    });

    if (exchangeData.mode === 'buy') {
      await updatePortfolioMutation.mutateAsync({
        inr_balance: (portfolio?.inr_balance || 0) - exchangeData.inputAmount,
        usdt_balance: (portfolio?.usdt_balance || 0) + exchangeData.outputAmount
      });
    } else {
      await updatePortfolioMutation.mutateAsync({
        usdt_balance: (portfolio?.usdt_balance || 0) - exchangeData.inputAmount,
        inr_balance: (portfolio?.inr_balance || 0) + exchangeData.outputAmount
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">TradeDesk</h1>
                <p className="text-slate-600">Simple and secure buying and selling without P2P risk.</p>
              </div>
            </div>
          </div>
          <SecurityBadge variant="encrypted" />
        </div>

        <KYCGate 
          kycStatus={kycProfile?.kyc_status} 
          kycPercentage={kycProfile?.kyc_completion_percentage}
          featureName="fund management"
        >
          <div className="space-y-6">
            {/* Balances */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">INR Balance</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ₹{(portfolio?.inr_balance || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowDepositDialog(true)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      Deposit
                    </Button>
                    <Button 
                      onClick={() => setShowWithdrawDialog(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 font-bold">₮</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">USDT Balance</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {(portfolio?.usdt_balance || 0).toFixed(2)} USDT
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">
                    ≈ ₹{((portfolio?.usdt_balance || 0) * 83.5).toLocaleString('en-IN')} INR
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Security Notice */}
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Your funds are held in segregated accounts. We maintain cold storage for majority of crypto assets 
                with limited hot wallet exposure for operational needs.
              </AlertDescription>
            </Alert>

            {/* INR to USDT Exchange */}
            <INRExchange 
              inrBalance={portfolio?.inr_balance || 0}
              usdtBalance={portfolio?.usdt_balance || 0}
              onExchange={handleExchange}
            />
          </div>
        </KYCGate>

        {/* Deposit Dialog */}
        <DepositDialog
          open={showDepositDialog}
          onOpenChange={setShowDepositDialog}
          onConfirm={handleDeposit}
          isLoading={isLoading}
        />

        {/* Withdraw Dialog */}
        <WithdrawDialog
          open={showWithdrawDialog}
          onOpenChange={setShowWithdrawDialog}
          onConfirm={handleWithdraw}
          isLoading={isLoading}
          availableBalance={portfolio?.inr_balance || 0}
        />
      </div>
    </div>
  );
}
