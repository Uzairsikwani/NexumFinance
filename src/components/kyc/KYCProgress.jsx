import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: 'mobile', label: 'Mobile Verification' },
  { id: 'email', label: 'Email Verification' },
  { id: 'pan', label: 'PAN Verification' },
  { id: 'aadhaar', label: 'Identity Verification' },
  { id: 'selfie', label: 'Selfie & Liveness' },
  { id: 'risk', label: 'Risk Assessment' }
];

export default function KYCProgress({ currentStep, completedSteps = [], percentage = 0 }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">KYC Progress</span>
        <span className="text-sm text-slate-500">{percentage}% Complete</span>
      </div>
      
      <Progress value={percentage} className="h-2 mb-6" />
      
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrent ? 'bg-slate-100' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-emerald-100' 
                  : isCurrent 
                    ? 'bg-slate-900' 
                    : 'bg-slate-100'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isCompleted ? 'text-emerald-700' : isCurrent ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.label}
                </p>
              </div>
              
              {isCompleted && (
                <span className="text-xs text-emerald-600 font-medium">Verified</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
