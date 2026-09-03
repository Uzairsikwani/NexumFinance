import React from 'react';
import { Shield, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function KYCGate({ kycStatus, kycPercentage = 0, children, featureName = "this feature" }) {
  if (kycStatus === 'approved') return <>{children}</>;

  const isInProgress = kycPercentage > 0;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-10 text-center max-w-lg mx-auto">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${isInProgress ? 'bg-blue-100' : 'bg-slate-100'}`}>
          {isInProgress
            ? <Shield className="w-8 h-8 text-blue-600" />
            : <Lock className="w-8 h-8 text-slate-500" />
          }
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {isInProgress ? 'Finish Verifying Your Identity' : 'Verify Your Identity to Continue'}
        </h3>

        <p className="text-slate-500 text-sm mb-5">
          {isInProgress
            ? `You're ${kycPercentage}% done. Complete the remaining steps to unlock ${featureName}.`
            : `KYC is required by SEBI & RBI to protect your funds and unlock ${featureName}.`
          }
        </p>

        {isInProgress && (
          <div className="mb-5 text-left">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Verification progress</span>
              <span>{kycPercentage}%</span>
            </div>
            <Progress value={kycPercentage} className="h-2" />
          </div>
        )}

        <Link to={createPageUrl('KYCOnboarding')}>
          <Button className="bg-slate-900 hover:bg-slate-800 h-11 px-8">
            {isInProgress ? 'Continue Verification' : 'Start Verification'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 256-bit encrypted</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> SEBI compliant</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Data stays private</span>
        </div>
      </CardContent>
    </Card>
  );
}
