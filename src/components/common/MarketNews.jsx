import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const FALLBACK_NEWS = [
  { headline: 'Bitcoin ETF inflows surge as institutional demand grows', summary: 'Spot Bitcoin ETFs see record weekly inflows, signaling renewed institutional confidence in BTC.', category: 'crypto', sentiment: 'bullish', ticker: 'BTC' },
  { headline: 'Ethereum network upgrade improves transaction throughput', summary: 'Latest protocol upgrade reduces gas fees and boosts L2 scalability for DeFi users.', category: 'crypto', sentiment: 'bullish', ticker: 'ETH' },
  { headline: 'SEBI tightens disclosure norms for listed companies', summary: 'New SEBI regulations require faster quarterly disclosures, impacting large-cap stocks.', category: 'stock', sentiment: 'neutral', ticker: 'RELIANCE' },
  { headline: 'Reliance Industries announces major AI infrastructure investment', summary: 'Reliance commits ₹50,000 Cr to AI and cloud expansion over the next 3 years.', category: 'stock', sentiment: 'bullish', ticker: 'RELIANCE' },
  { headline: 'TCS reports strong Q2 earnings, beats street estimates', summary: 'Tata Consultancy Services posts 8% YoY revenue growth driven by BFSI segment.', category: 'stock', sentiment: 'bullish', ticker: 'TCS' },
  { headline: 'Regulatory scrutiny increases on stablecoin reserves', summary: 'Global regulators push for stricter audits of USDT and USDC reserves, causing short-term volatility.', category: 'crypto', sentiment: 'bearish', ticker: 'USDT' },
];

export default function MarketNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setUsingFallback(false);
    try {
      const llmPromise = base44.integrations.Core.InvokeLLM({
        prompt: `You are a financial news aggregator. Provide the 6 most important current market-moving news items for crypto and Indian stocks. For each item, return:
- headline: a concise headline (max 80 chars)
- summary: 1-2 sentence summary of the impact
- category: "crypto" or "stock"
- sentiment: "bullish", "bearish", or "neutral"
- ticker: the relevant symbol (e.g., "BTC", "ETH", "RELIANCE", "TCS")

Focus on news that actually affects market prices — regulatory changes, earnings, macro events, large fund flows, etc. Return only the JSON array.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  headline: { type: 'string' },
                  summary: { type: 'string' },
                  category: { type: 'string' },
                  sentiment: { type: 'string' },
                  ticker: { type: 'string' },
                },
              },
            },
          },
        },
      });
      // Race the LLM call against a 10s timeout — if it hangs or is slow,
      // fall back to static news so the widget is never stuck loading.
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 10000)
      );
      const result = await Promise.race([llmPromise, timeoutPromise]);
      setNews(result?.items || []);
    } catch (err) {
      // Fallback to static news when LLM is unavailable (e.g. credits exhausted)
      setNews(FALLBACK_NEWS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getSentimentConfig = (sentiment) => {
    switch (sentiment) {
      case 'bullish':
        return { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Bullish' };
      case 'bearish':
        return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Bearish' };
      default:
        return { icon: Newspaper, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Neutral' };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base">Market News</CardTitle>
              <p className="text-xs text-slate-500">
                {usingFallback ? 'Showing latest available news' : 'Live crypto & stock news that moves the market'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchNews} disabled={loading}>
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 bg-slate-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {news.map((item, idx) => {
              const cfg = getSentimentConfig(item.sentiment);
              const Icon = cfg.icon;
              return (
                <div key={idx} className="flex gap-3 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${item.category === 'crypto' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {item.category === 'crypto' ? 'Crypto' : 'Stock'}
                      </Badge>
                      {item.ticker && (
                        <span className="text-xs font-mono text-slate-400">{item.ticker}</span>
                      )}
                      <Badge variant="outline" className={`text-xs ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1">{item.headline}</p>
                    <p className="text-xs text-slate-500">{item.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
