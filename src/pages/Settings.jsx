import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Shield, 
  User,
  Bell,
  Smartphone,
  Lock,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import SecurityBadge from '../components/common/SecurityBadge';

export default function Settings() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: kycProfiles = [] } = useQuery({
    queryKey: ['kyc-profile'],
    queryFn: () => base44.entities.KYCProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const kycProfile = kycProfiles[0];
  const isKYCApproved = kycProfile?.kyc_status === 'approved';

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600">Manage your account and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <CardTitle>{user?.full_name || 'User'}</CardTitle>
                    <CardDescription>{user?.email}</CardDescription>
                  </div>
                </div>
                {isKYCApproved ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
            </CardHeader>
            {!isKYCApproved && (
              <CardContent className="pt-0">
                <Link to={createPageUrl('KYCOnboarding')}>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800">
                    Complete KYC Verification
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Login Alerts</p>
                    <p className="text-sm text-slate-500">Get notified of new device logins</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Large Withdrawal Alerts</p>
                    <p className="text-sm text-slate-500">Confirm withdrawals above ₹50,000</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Fund Security Info */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg text-emerald-800">Fund Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-emerald-800">Cold Storage</p>
                  <p className="text-xs text-emerald-600">95% of crypto assets</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-emerald-800">Insurance</p>
                  <p className="text-xs text-emerald-600">Covered up to ₹1Cr</p>
                </div>
              </div>
              
              <p className="text-sm text-emerald-700">
                Your funds are held in segregated accounts. We maintain continuous monitoring, 
                regular security audits, and multi-layer access controls. We never claim to be 
                "unhackable" - security is an ongoing process.
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Transaction Updates</p>
                  <p className="text-sm text-slate-500">Email & push notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Price Alerts</p>
                  <p className="text-sm text-slate-500">Significant price movements</p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Monthly Reports</p>
                  <p className="text-sm text-slate-500">Portfolio summary emails</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Legal & Support */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-lg">Legal & Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-700">Terms of Service</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-700">Privacy Policy</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-700">Risk Disclosure</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700">Help & Support</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button 
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>

          {/* Version Info */}
          <p className="text-center text-xs text-slate-400">
            NEXUM v1.0.0 • Regulated by SEBI & RBI
          </p>
        </div>
      </div>
    </div>
  );
}
