import React from 'react';
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import SecurityBadge from '../common/SecurityBadge';
import { calculatePortfolioMetrics, USDT_INR_RATE } from '@/lib/marketPrices';

export default function PortfolioSummary({ portfolio, isLoading }) {
  if (isLoading || !portfolio) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 rounded animate-pulse mb-3 w-24" />
              <div className="h-7 bg-slate-200 rounded animate-pulse w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Use shared calculation for consistency across all components
  const { cryptoValue, stockValue, holdingsValue, totalValue, riskExposure } = calculatePortfolioMetrics(portfolio);
  const inrBalance = portfolio.inr_balance || 0;
  const usdtValue = (portfolio.usdt_balance || 0) * USDT_INR_RATE;

  // Total invested = all actual buy transactions (tracked via total_invested_inr)
  const totalInvested = portfolio.total_invested_inr || 0;
  // Current portfolio value = all assets + cash
  const currentValue = totalValue;

  // P&L is unrealised gain/loss on invested capital only
  const holdingsInvested = totalInvested; // amount put into assets
  const pnl = holdingsInvested > 0 ? holdingsValue - holdingsInvested : 0;
  const pnlPct = holdingsInvested > 0 ? (pnl / holdingsInvested) * 100 : 0;
  const isProfit = pnl >= 0;

  const totalAssets = (portfolio.crypto_holdings?.length || 0) + (portfolio.stock_holdings?.length || 0);

  return (
    <div className="space-y-4">
      {/* Main value card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
              <p className="text-4xl font-bold tracking-tight">
                ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              {holdingsInvested > 0 && (
                <div className={`flex items-center gap-2 mt-2 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">
                    {isProfit ? '+' : ''}₹{Math.abs(pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    &nbsp;({isProfit ? '+' : ''}{pnlPct.toFixed(2)}%)
                  </span>
                  <span className="text-slate-400 text-sm">unrealised</span>
                </div>
              )}
            </div>
            <SecurityBadge variant="encrypted" size="sm" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700">
            <div>
              <p className="text-slate-400 text-xs">Cash (INR)</p>
              <p className="text-white font-semibold">₹{inrBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Holdings</p>
              <p className="text-white font-semibold">₹{(cryptoValue + stockValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">USDT</p>
              <p className="text-white font-semibold">{(portfolio.usdt_balance || 0).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Invested in Assets</p>
            <p className="text-lg font-bold text-slate-900">
              ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Assets Held</p>
            <p className="text-lg font-bold text-slate-900">{totalAssets}</p>
            <p className="text-xs text-slate-400">
              {portfolio.crypto_holdings?.length || 0} crypto · {portfolio.stock_holdings?.length || 0} stocks
            </p>
          </CardContent>
        </Card>

        <Card className={riskExposure > 70 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Risk Exposure</p>
            <div className="flex items-center gap-1">
              {riskExposure > 70 && <AlertTriangle className="w-4 h-4 text-red-500" />}
              <p className={`text-lg font-bold ${riskExposure > 70 ? 'text-red-600' : 'text-slate-900'}`}>
                {riskExposure}%
              </p>
            </div>
            <p className="text-xs text-slate-400">in volatile assets</p>
          </CardContent>
        </Card>

        <Card className={isProfit ? 'border-emerald-200 bg-emerald-50' : pnl < 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Unrealised P&L</p>
            <p className={`text-lg font-bold ${isProfit ? 'text-emerald-600' : pnl < 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {holdingsInvested > 0 ? `${isProfit ? '+' : ''}${pnlPct.toFixed(1)}%` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-slate-400 text-center">
        ⚠ Crypto & stock prices are indicative. Values update when you refresh. Past performance does not guarantee future results.
      </p>
    </div>
  );
}
