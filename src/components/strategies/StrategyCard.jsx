import React from 'react';
import { TrendingUp, Shield, AlertTriangle, PieChart, ArrowRight, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

export default function StrategyCard({ 
  strategy, 
  onSelect,
  showDetails = false
}) {
  const riskColors = {
    low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' }
  };

  const colors = riskColors[strategy.riskLevel] || riskColors.medium;

  return (
    <Card className={`transition-all hover:shadow-lg ${showDetails ? colors.bg : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
              <PieChart className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{strategy.name}</CardTitle>
              <CardDescription>{strategy.description}</CardDescription>
            </div>
          </div>
          <Badge className={colors.badge}>
            {strategy.riskLevel.charAt(0).toUpperCase() + strategy.riskLevel.slice(1)} Risk
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Asset Allocation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-slate-900">Asset Mix</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">How your investment is distributed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {strategy.allocation?.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.asset}</span>
                <span className="font-medium">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>

        {/* Risk Information */}
        <div className={`p-4 rounded-lg ${colors.bg} ${colors.border} border`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
            <div>
              <h4 className={`font-medium ${colors.text} mb-1`}>Risk Disclosure</h4>
              <p className="text-sm text-slate-600">{strategy.riskExplanation}</p>
            </div>
          </div>
        </div>

        {/* Historical Worst Case */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-900">Historical Data</span>
          </div>
          <p className="text-sm text-slate-600">
            <strong>Worst historical drawdown:</strong> {strategy.worstDrawdown}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Past performance does not guarantee future results
          </p>
        </div>

        {/* Important Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            AI assists with strategy suggestions only. It does NOT predict prices or guarantee profits. 
            All investments require your explicit approval.
          </p>
        </div>

        <Button 
          onClick={() => onSelect?.(strategy)}
          className="w-full bg-slate-900 hover:bg-slate-800"
        >
          Select This Strategy
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
