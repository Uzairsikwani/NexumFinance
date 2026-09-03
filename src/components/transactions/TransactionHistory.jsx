import React from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import moment from 'moment';

const typeConfig = {
  deposit:       { label: 'Deposit',       icon: ArrowDownLeft,   color: 'text-emerald-600', bg: 'bg-emerald-100', sign: '+', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  withdrawal:    { label: 'Withdrawal',    icon: ArrowUpRight,    color: 'text-red-600',     bg: 'bg-red-100',     sign: '-', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  buy_crypto:    { label: 'Buy Crypto',    icon: TrendingUp,      color: 'text-amber-600',   bg: 'bg-amber-100',   sign: '-', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  sell_crypto:   { label: 'Sell Crypto',   icon: TrendingDown,    color: 'text-amber-600',   bg: 'bg-amber-100',   sign: '+', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  buy_stock:     { label: 'Buy Stock',     icon: TrendingUp,      color: 'text-blue-600',    bg: 'bg-blue-100',    sign: '-', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  sell_stock:    { label: 'Sell Stock',    icon: TrendingDown,    color: 'text-blue-600',    bg: 'bg-blue-100',    sign: '+', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  inr_to_usdt:   { label: 'INR → USDT',   icon: ArrowLeftRight,  color: 'text-violet-600',  bg: 'bg-violet-100',  sign: '',  badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  usdt_to_inr:   { label: 'USDT → INR',   icon: ArrowLeftRight,  color: 'text-violet-600',  bg: 'bg-violet-100',  sign: '',  badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const statusClass = {
  completed:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:        'bg-amber-50 text-amber-700 border-amber-200',
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  processing:     'bg-blue-50 text-blue-700 border-blue-200',
  failed:         'bg-red-50 text-red-700 border-red-200',
  cancelled:      'bg-slate-50 text-slate-600 border-slate-200',
};

export default function TransactionHistory({ transactions = [], isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-3 bg-slate-200 rounded w-20" />
              </div>
              <div className="h-5 bg-slate-200 rounded w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No transactions yet</p>
          <p className="text-slate-400 text-sm mt-1">Deposit funds and start investing to see your history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const cfg = typeConfig[tx.transaction_type] || typeConfig.deposit;
            const Icon = cfg.icon;
            const amount = tx.total_amount_inr || 0;
            const sClass = statusClass[tx.status] || statusClass.pending;

            return (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 text-sm">{cfg.label}</p>
                    {tx.asset && <span className="text-slate-400 text-xs font-mono">{tx.asset}</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {moment(tx.created_date).fromNow()}
                    {tx.notes && ` · ${tx.notes}`}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`font-semibold text-sm ${cfg.sign === '+' ? 'text-emerald-600' : cfg.sign === '-' ? 'text-slate-900' : 'text-slate-700'}`}>
                    {cfg.sign}₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <Badge variant="outline" className={`text-xs mt-1 ${sClass}`}>
                    {tx.status === 'pending_review' ? 'Under Review' : tx.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
