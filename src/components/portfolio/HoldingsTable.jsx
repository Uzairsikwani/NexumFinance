import React from 'react';
import { TrendingUp, TrendingDown, Bitcoin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLivePrice } from '@/lib/marketPrices';

export default function HoldingsTable({ cryptoHoldings = [], stockHoldings = [] }) {
  const formatQuantity = (qty) => {
    if (!qty) return '0';
    if (qty >= 1) return qty.toLocaleString('en-IN', { maximumFractionDigits: 4 });
    return qty.toFixed(7).replace(/\.?0+$/, '');
  };

  const calculatePnL = (holding, type) => {
    const livePrice = getLivePrice(holding, type);
    const invested = holding.quantity * holding.avg_buy_price;
    const current = holding.quantity * livePrice;
    const pnl = current - invested;
    const pnlPercentage = invested > 0 ? ((pnl / invested) * 100) : 0;
    return { pnl, pnlPercentage, isProfit: pnl >= 0, livePrice };
  };

  const renderHoldingRow = (holding, type, idx) => {
    const { pnl, pnlPercentage, isProfit, livePrice } = calculatePnL(holding, type);
    const currentValue = holding.quantity * livePrice;
    
    return (
      <TableRow key={(holding.asset || holding.symbol || '') + '-' + idx}>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              type === 'crypto' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              {type === 'crypto' ? (
                <Bitcoin className="w-5 h-5 text-amber-600" />
              ) : (
                <Building2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900">{holding.asset || holding.symbol}</p>
              <p className="text-sm text-slate-500">{holding.name || holding.asset}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <p className="font-medium">{formatQuantity(holding.quantity)}</p>
          <p className="text-sm text-slate-500">units</p>
        </TableCell>
        <TableCell className="text-right">
          <p className="font-medium">₹{holding.avg_buy_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-slate-500">avg. buy</p>
        </TableCell>
        <TableCell className="text-right">
          <p className="font-medium">₹{livePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-slate-500">live price</p>
        </TableCell>
        <TableCell className="text-right">
          <p className="font-semibold">₹{currentValue.toLocaleString('en-IN')}</p>
        </TableCell>
        <TableCell className="text-right">
          <div className={`flex items-center justify-end gap-1 ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
            {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-medium">
              {isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%
            </span>
          </div>
          <p className={`text-sm ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
            {isProfit ? '+' : ''}₹{pnl.toLocaleString('en-IN')}
          </p>
        </TableCell>
      </TableRow>
    );
  };

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
        type === 'crypto' ? 'bg-amber-100' : 'bg-blue-100'
      }`}>
        {type === 'crypto' ? (
          <Bitcoin className="w-8 h-8 text-amber-600" />
        ) : (
          <Building2 className="w-8 h-8 text-blue-600" />
        )}
      </div>
      <h3 className="font-medium text-slate-900 mb-1">No {type === 'crypto' ? 'Crypto' : 'Stock'} Holdings</h3>
      <p className="text-sm text-slate-500">Start investing to see your holdings here</p>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Your Holdings</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All Holdings
              <Badge variant="secondary" className="ml-2">
                {cryptoHoldings.length + stockHoldings.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="crypto">
              Crypto
              <Badge variant="secondary" className="ml-2">{cryptoHoldings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="stocks">
              Stocks
              <Badge variant="secondary" className="ml-2">{stockHoldings.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {cryptoHoldings.length === 0 && stockHoldings.length === 0 ? (
              <EmptyState type="all" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cryptoHoldings.map((h, i) => renderHoldingRow(h, 'crypto', i))}
                    {stockHoldings.map((h, i) => renderHoldingRow(h, 'stock', i + cryptoHoldings.length))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="crypto">
            {cryptoHoldings.length === 0 ? (
              <EmptyState type="crypto" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cryptoHoldings.map((h, i) => renderHoldingRow(h, 'crypto', i))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stocks">
            {stockHoldings.length === 0 ? (
              <EmptyState type="stock" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockHoldings.map((h, i) => renderHoldingRow(h, 'stock', i))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
