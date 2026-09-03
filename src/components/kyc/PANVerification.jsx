import React, { useState } from 'react';
import { CreditCard, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PANVerification({ onComplete, initialPAN }) {
  const [pan, setPan] = useState(initialPAN || '');
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [error, setError] = useState('');

  const validatePAN = (value) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(value.toUpperCase());
  };

  const handleVerify = async () => {
    if (!validatePAN(pan)) {
      setError('Please enter a valid PAN number (e.g., ABCDE1234F)');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate PAN verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulated response
    const mockName = 'RAHUL KUMAR SHARMA';
    setVerifiedName(mockName);
    setVerified(true);
    setIsLoading(false);
  };

  const handleConfirm = () => {
    onComplete({
      pan_number: pan.toUpperCase(),
      pan_verified: true,
      pan_name: verifiedName
    });
  };

  if (verified) {
    return (
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-emerald-800">PAN Verified</CardTitle>
              <CardDescription>Your PAN details have been verified</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">PAN Number</span>
              <span className="text-sm font-mono font-medium">{pan.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Name as per PAN</span>
              <span className="text-sm font-medium">{verifiedName}</span>
            </div>
          </div>
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Please confirm that the above details are correct. This cannot be changed later.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setVerified(false);
                setPan('');
              }}
              className="flex-1"
            >
              Change PAN
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              Confirm & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <CardTitle>PAN Verification</CardTitle>
            <CardDescription>
              Your PAN is required for tax compliance and regulatory purposes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pan">PAN Number</Label>
          <Input
            id="pan"
            type="text"
            placeholder="ABCDE1234F"
            value={pan}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
              setPan(val);
              setError('');
            }}
            className="font-mono uppercase"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        <Button 
          onClick={handleVerify} 
          disabled={isLoading || pan.length !== 10}
          className="w-full bg-slate-900 hover:bg-slate-800"
        >
          {isLoading ? 'Verifying...' : 'Verify PAN'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        <p className="text-xs text-slate-500 text-center">
          PAN verification is mandatory under SEBI and RBI guidelines
        </p>
      </CardContent>
    </Card>
  );
}
