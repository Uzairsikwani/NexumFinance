import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Shield, 
  Info,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import KYCGate from '../components/common/KYCGate';
import AutomationPanel from '../components/automation/AutomationPanel';
import SecurityBadge from '../components/common/SecurityBadge';

export default function Automation() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: kycProfiles = [] } = useQuery({
    queryKey: ['kyc-profile'],
    queryFn: () => base44.entities.KYCProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: automationSettings = [] } = useQuery({
    queryKey: ['automation-settings'],
    queryFn: () => base44.entities.AutomationSettings.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const kycProfile = kycProfiles[0];
  const settings = automationSettings[0];

  // Check if automation should be unlocked
  // In production: check account age, trading history, etc.
  const isUnlocked = kycProfile?.kyc_status === 'approved';

  const createSettingsMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomationSettings.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-settings'] }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomationSettings.update(settings?.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-settings'] }),
  });

  // Initialize settings if needed
  React.useEffect(() => {
    if (user?.email && !settings && isUnlocked) {
      createSettingsMutation.mutate({
        user_email: user.email,
        automation_enabled: false,
        automation_unlocked: true,
        max_capital_allocation_inr: 100000,
        max_loss_limit_percentage: 10,
        emergency_stop_triggered: false,
        active_strategies: []
      });
    }
  }, [user, settings, isUnlocked]);

  const handleToggle = async (enabled) => {
    if (settings) {
      await updateSettingsMutation.mutateAsync({
        automation_enabled: enabled,
        ...(enabled ? { risk_acknowledgement_date: new Date().toISOString() } : {})
      });
    }
  };

  const handleSaveSettings = async (newSettings) => {
    if (settings) {
      await updateSettingsMutation.mutateAsync({
        max_capital_allocation_inr: newSettings.maxCapital,
        max_loss_limit_percentage: newSettings.maxLoss
      });
    }
  };

  const handleEmergencyStop = async () => {
    if (settings) {
      await updateSettingsMutation.mutateAsync({
        automation_enabled: false,
        emergency_stop_triggered: true,
        active_strategies: []
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
            <h1 className="text-2xl font-bold text-slate-900">NEXUM Automation</h1>
            <p className="text-slate-600">Advanced automated execution with strict controls</p>
          </div>
          <SecurityBadge variant="encrypted" />
        </div>

        <KYCGate 
          kycStatus={kycProfile?.kyc_status} 
          kycPercentage={kycProfile?.kyc_completion_percentage}
          featureName="automation features"
        >
          <div className="space-y-6">
            {/* Important Warnings */}
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertTitle className="text-red-800">High Risk Feature</AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                Auto-execution involves significant risk. Only enable if you fully understand the implications. 
                We strongly recommend starting with AI-assisted mode first.
              </AlertDescription>
            </Alert>

            {/* Comparison: Assist vs Auto */}
            <Card>
              <CardHeader>
                <CardTitle>Assist Mode vs Auto-Execution</CardTitle>
                <CardDescription>Understand the difference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-semibold text-emerald-800">AI-Assisted Mode</h4>
                      <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <ul className="space-y-2 text-sm text-emerald-700">
                      <li>✓ AI suggests strategies and trades</li>
                      <li>✓ You review and approve each action</li>
                      <li>✓ Full control over every transaction</li>
                      <li>✓ Learn while you invest</li>
                      <li>✓ No unexpected trades</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-800">Auto-Execution Mode</h4>
                      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Advanced</span>
                    </div>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li>⚡ Trades execute automatically</li>
                      <li>⚡ Based on predefined rules only</li>
                      <li>⚡ Strict capital and loss limits</li>
                      <li>⚡ Emergency stop always available</li>
                      <li>⚠️ Higher risk of unexpected losses</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What Auto-Execution Does NOT Do */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle>What Auto-Execution Does NOT Do</CardTitle>
                    <CardDescription>Clear boundaries</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-red-600">✗</span> Does NOT predict prices
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-red-600">✗</span> Does NOT guarantee profits
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-red-600">✗</span> Does NOT make discretionary decisions
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-red-600">✗</span> Does NOT trade beyond your limits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Automation Panel */}
            <AutomationPanel
              settings={settings}
              isUnlocked={isUnlocked}
              onSave={handleSaveSettings}
              onToggle={handleToggle}
              onEmergencyStop={handleEmergencyStop}
            />

            {/* Security Measures */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Security Measures</CardTitle>
                    <CardDescription>Your protection is our priority</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900">Strict Capital Limits</p>
                      <p className="text-sm text-slate-600">Automation cannot exceed your defined maximum</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900">Loss Circuit Breaker</p>
                      <p className="text-sm text-slate-600">Automatically stops if losses exceed threshold</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900">Emergency Stop</p>
                      <p className="text-sm text-slate-600">One-click halt for all automated activities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-slate-900">Audit Trail</p>
                      <p className="text-sm text-slate-600">Complete history of all automated actions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </KYCGate>
      </div>
    </div>
  );
}
