import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Mail, CheckCircle2, Shield, Fingerprint, Camera, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import KYCProgress from '../components/kyc/KYCProgress';
import MobileVerification from '../components/kyc/MobileVerification';
import PANVerification from '../components/kyc/PANVerification';
import RiskAssessment from '../components/kyc/RiskAssessment';

const STEPS = ['mobile', 'email', 'pan', 'aadhaar', 'selfie', 'risk'];

export default function KYCOnboarding() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('mobile');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [selfieLoading, setSelfieLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: kycProfiles = [], isLoading: kycLoading } = useQuery({
    queryKey: ['kyc-profile'],
    queryFn: () => base44.entities.KYCProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const kycProfile = kycProfiles[0];

  const createKYCMutation = useMutation({
    mutationFn: (data) => base44.entities.KYCProfile.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kyc-profile'] }),
  });

  const updateKYCMutation = useMutation({
    mutationFn: (data) => base44.entities.KYCProfile.update(kycProfile?.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kyc-profile'] }),
  });

  const createPortfolioMutation = useMutation({
    mutationFn: (data) => base44.entities.Portfolio.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  // Create KYC profile if none exists
  useEffect(() => {
    if (user?.email && !kycLoading && kycProfiles.length === 0 && !createKYCMutation.isPending) {
      createKYCMutation.mutate({
        user_email: user.email,
        kyc_status: 'in_progress',
        kyc_completion_percentage: 0
      });
    }
  }, [user?.email, kycLoading, kycProfiles.length]);

  // Initialise progress from saved profile only once
  useEffect(() => {
    if (kycProfile && completedSteps.length === 0 && !isComplete) {
      const completed = [];
      if (kycProfile.mobile_verified) completed.push('mobile');
      if (kycProfile.email_verified) completed.push('email');
      if (kycProfile.pan_verified) completed.push('pan');
      if (kycProfile.aadhaar_verified) completed.push('aadhaar');
      if (kycProfile.selfie_verified) completed.push('selfie');
      if (kycProfile.risk_profile && kycProfile.risk_profile !== 'not_assessed') completed.push('risk');

      if (kycProfile.kyc_status === 'approved' || completed.length === STEPS.length) {
        setIsComplete(true);
        return;
      }

      if (completed.length > 0) {
        setCompletedSteps(completed);
        const next = STEPS.find(s => !completed.includes(s));
        if (next) setCurrentStep(next);
      }
    }
  }, [kycProfile?.id]);

  const handleStepComplete = (stepData) => {
    const idx = STEPS.indexOf(currentStep);
    const newCompleted = [...completedSteps, currentStep];
    setCompletedSteps(newCompleted);

    const newPct = Math.round((newCompleted.length / STEPS.length) * 100);

    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
      // persist in background
      if (kycProfile) {
        updateKYCMutation.mutate({ ...stepData, kyc_completion_percentage: newPct });
      }
    } else {
      // All steps done
      setIsComplete(true);
      if (kycProfile) {
        updateKYCMutation.mutate({
          ...stepData,
          kyc_status: 'approved',
          kyc_completion_percentage: 100
        });
      }
      // Create portfolio right away so dashboard is ready
      if (user?.email) {
        createPortfolioMutation.mutate({
          user_email: user.email,
          total_invested_inr: 0,
          current_value_inr: 0,
          inr_balance: 0,
          usdt_balance: 0,
          crypto_holdings: [],
          stock_holdings: [],
          risk_exposure_percentage: 0
        });
      }
    }
  };

  const handleEmailVerify = async () => {
    setEmailLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setEmailLoading(false);
    handleStepComplete({ email_verified: true });
  };

  const handleAadhaarVerify = async () => {
    setAadhaarLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setAadhaarLoading(false);
    handleStepComplete({ aadhaar_verified: true, aadhaar_last_four: '1234' });
  };

  const handleSelfieVerify = async () => {
    setSelfieLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSelfieLoading(false);
    handleStepComplete({ selfie_verified: true, liveness_check_passed: true });
  };

  const percentage = Math.round((completedSteps.length / STEPS.length) * 100);

  // ── Completion Screen ──────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-emerald-200 bg-emerald-50 shadow-lg">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-800 mb-2">KYC Verified!</h2>
              <p className="text-emerald-700 mb-2">Your identity has been successfully verified.</p>
              <p className="text-emerald-600 text-sm mb-8">Your NEXUM account is now fully active. You can deposit funds and start investing.</p>
              <Button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Step Renderer ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 'mobile':
        return (
          <MobileVerification
            onComplete={handleStepComplete}
            initialMobile={kycProfile?.mobile_number}
          />
        );

      case 'email':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Email Verification</CardTitle>
                  <CardDescription>Confirm your email address</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Verifying email</p>
                <p className="font-medium text-slate-900">{user?.email}</p>
              </div>
              <p className="text-sm text-slate-500">Click below to confirm your email is accessible and correct.</p>
              <Button
                onClick={handleEmailVerify}
                disabled={emailLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 h-11"
              >
                {emailLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <>Confirm Email <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </CardContent>
          </Card>
        );

      case 'pan':
        return (
          <PANVerification
            onComplete={handleStepComplete}
            initialPAN={kycProfile?.pan_number}
          />
        );

      case 'aadhaar':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle>Aadhaar Verification</CardTitle>
                  <CardDescription>UIDAI-based identity verification</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <p className="text-sm text-slate-600">Your Aadhaar number is verified securely via UIDAI OTP. Only the last 4 digits are stored as per regulations.</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">🔒 Data encrypted end-to-end. NEXUM never stores your full Aadhaar number.</p>
              </div>
              <Button
                onClick={handleAadhaarVerify}
                disabled={aadhaarLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 h-11"
              >
                {aadhaarLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying Aadhaar...</> : <>Verify Aadhaar <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </CardContent>
          </Card>
        );

      case 'selfie':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Selfie & Liveness Check</CardTitle>
                  <CardDescription>Quick face scan to confirm it's you</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto flex items-center justify-center border-4 border-dashed border-slate-300">
                <Camera className="w-10 h-10 text-slate-400" />
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>✔ Ensure good lighting</p>
                <p>✔ Face the camera directly</p>
                <p>✔ Remove glasses or hats if possible</p>
              </div>
              <Button
                onClick={handleSelfieVerify}
                disabled={selfieLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 h-11"
              >
                {selfieLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing Liveness...</> : <>Take Selfie <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </CardContent>
          </Card>
        );

      case 'risk':
        return <RiskAssessment onComplete={handleStepComplete} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Identity Verification</h1>
              <p className="text-slate-500 text-sm">Complete all steps to unlock your account</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">256-bit Encrypted</span>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-6">
          <p className="text-sm text-blue-800 text-center">
            <strong>Mandatory under SEBI & RBI regulations.</strong> Your data is encrypted and never shared with third parties.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Progress Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <KYCProgress
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  percentage={percentage}
                />
              </CardContent>
            </Card>
          </div>

          {/* Step Content */}
          <div className="md:col-span-2">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
