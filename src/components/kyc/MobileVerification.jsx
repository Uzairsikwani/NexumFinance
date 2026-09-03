import React, { useState } from 'react';
import { Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function MobileVerification({ onComplete, initialMobile }) {
  const [step, setStep] = useState('input'); // input, otp, success
  const [mobile, setMobile] = useState(initialMobile || '');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    setError('');
    
    // Simulate OTP send
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('success');
    
    setTimeout(() => {
      onComplete({ mobile_number: mobile, mobile_verified: true });
    }, 1000);
  };

  if (step === 'success') {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-emerald-800 mb-2">Mobile Verified</h3>
          <p className="text-emerald-600">+91 {mobile}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <CardTitle>Mobile Verification</CardTitle>
            <CardDescription>
              {step === 'input' 
                ? 'Enter your mobile number to receive OTP' 
                : 'Enter the OTP sent to your mobile'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === 'input' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
                  +91
                </div>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobile(val);
                    setError('');
                  }}
                  className="flex-1"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            
            <Button 
              onClick={handleSendOTP} 
              disabled={isLoading || mobile.length !== 10}
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <p className="text-sm text-slate-500 mb-4">
                OTP sent to +91 {mobile}
              </p>
              
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
            </div>
            
            <Button 
              onClick={handleVerifyOTP} 
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            
            <Button 
              variant="link" 
              onClick={() => setStep('input')}
              className="w-full"
            >
              Change mobile number
            </Button>
          </>
        )}
        
        <p className="text-xs text-slate-500 text-center">
          By continuing, you agree to receive SMS notifications from us
        </p>
      </CardContent>
    </Card>
  );
}
