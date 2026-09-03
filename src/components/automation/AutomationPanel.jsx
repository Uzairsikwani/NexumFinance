import React, { useState } from 'react';
import { 
  Zap, 
  Lock, 
  Shield, 
  AlertTriangle, 
  Settings,
  CheckCircle2,
  Info,
  Sliders
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import EmergencyStop from '../common/EmergencyStop';
import RiskDisclosure from '../common/RiskDisclosure';

export default function AutomationPanel({ 
  settings, 
  isUnlocked = false, 
  onSave,
  onToggle,
  onEmergencyStop
}) {
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    maxCapital: settings?.max_capital_allocation_inr || 100000,
    maxLoss: settings?.max_loss_limit_percentage || 10,
  });
  const [pendingAction, setPendingAction] = useState(null);

  const handleToggleAutomation = (enabled) => {
    if (enabled) {
      setPendingAction('enable');
      setShowRiskDialog(true);
    } else {
      onToggle?.(false);
    }
  };

  const confirmAction = () => {
    if (pendingAction === 'enable') {
      onToggle?.(true);
    }
    setShowRiskDialog(false);
    setPendingAction(null);
  };

  if (!isUnlocked) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            Auto-Execution Mode Locked
          </h3>
          
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            This advanced feature is available after completing full KYC verification 
            and maintaining an account for a minimum period.
          </p>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-medium text-amber-800 mb-1">Why is this locked?</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Requires full KYC completion</li>
                  <li>• Requires minimum account age</li>
                  <li>• Designed for advanced users only</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Use AI-assisted mode to get strategy suggestions with manual approval.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Auto-Execution Mode</CardTitle>
                <CardDescription>Automated strategy execution with strict controls</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {settings?.automation_enabled ? 'Active' : 'Inactive'}
              </span>
              <Switch 
                checked={settings?.automation_enabled || false}
                onCheckedChange={handleToggleAutomation}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Emergency Stop - Always Visible */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-800">Emergency Controls</h4>
                <p className="text-sm text-red-600">Immediately halt all automated activities</p>
              </div>
              <EmergencyStop 
                onStop={onEmergencyStop}
                isActive={settings?.automation_enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" />
              <h3 className="font-medium text-slate-900">Automation Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxCapital">Maximum Capital Allocation</Label>
                  <span className="text-sm font-medium">₹{localSettings.maxCapital.toLocaleString('en-IN')}</span>
                </div>
                <Slider
                  id="maxCapital"
                  value={[localSettings.maxCapital]}
                  onValueChange={([val]) => setLocalSettings(prev => ({ ...prev, maxCapital: val }))}
                  min={10000}
                  max={1000000}
                  step={10000}
                />
                <p className="text-xs text-slate-500">
                  Maximum amount that can be used for automated trades
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxLoss">Maximum Loss Limit</Label>
                  <span className="text-sm font-medium">{localSettings.maxLoss}%</span>
                </div>
                <Slider
                  id="maxLoss"
                  value={[localSettings.maxLoss]}
                  onValueChange={([val]) => setLocalSettings(prev => ({ ...prev, maxLoss: val }))}
                  min={5}
                  max={50}
                  step={5}
                />
                <p className="text-xs text-slate-500">
                  Automation stops if portfolio drops by this percentage
                </p>
              </div>
            </div>

            <Button 
              onClick={() => onSave?.(localSettings)}
              className="w-full"
              variant="outline"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>

          <Separator />

          {/* Important Notices */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertTitle className="text-blue-800">How Auto-Execution Works</AlertTitle>
            <AlertDescription className="text-blue-700 mt-2 space-y-2">
              <p>• Executes only predefined strategies you have approved</p>
              <p>• No discretionary or predictive trading</p>
              <p>• Strictly follows your capital and loss limits</p>
              <p>• You can stop at any time using the Emergency Stop</p>
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">No Price Predictions</p>
                <p className="text-sm text-slate-600">
                  The automation system does NOT predict prices or guarantee profits. 
                  It only executes rule-based strategies within your defined limits.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RiskDisclosure
        open={showRiskDialog}
        onOpenChange={setShowRiskDialog}
        onConfirm={confirmAction}
        title="Enable Auto-Execution"
        riskLevel="high"
        assetName="automated trading"
        worstCaseScenario={`Your portfolio could lose up to ${localSettings.maxLoss}% before automation stops. In extreme market conditions, losses could be higher.`}
      />
    </>
  );
}
