import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Shield, 
  Lock,
  Eye,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Key,
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

import SecurityBadge from '../components/common/SecurityBadge';

export default function Security() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: securityLogs = [], isLoading } = useQuery({
    queryKey: ['security-logs'],
    queryFn: () => base44.entities.SecurityLog.filter({ user_email: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const eventIcons = {
    login: Smartphone,
    logout: Key,
    password_change: Lock,
    device_added: Smartphone,
    large_withdrawal_attempt: AlertTriangle,
    kyc_update: CheckCircle2,
    automation_toggle: RefreshCw,
    emergency_stop: AlertTriangle
  };

  const statusColors = {
    success: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    blocked: 'bg-red-100 text-red-800',
    pending_review: 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Settings')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">NEXUM Security Center</h1>
            <p className="text-slate-600">Monitor and manage your account security</p>
          </div>
          <SecurityBadge variant="monitored" />
        </div>

        <div className="space-y-6">
          {/* Security Status Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-emerald-800">Protected</p>
                <p className="text-xs text-emerald-600">Account Status</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Lock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">Encrypted</p>
                <p className="text-xs text-slate-500">All Data</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">24/7</p>
                <p className="text-xs text-slate-500">Monitoring</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Server className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">Audited</p>
                <p className="text-xs text-slate-500">Infrastructure</p>
              </CardContent>
            </Card>
          </div>

          {/* Security Practices */}
          <Card>
            <CardHeader>
              <CardTitle>How We Protect Your Funds</CardTitle>
              <CardDescription>Our security measures and practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Segregated Funds</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        User funds are kept separate from operational accounts. 
                        Your money is never mixed with company funds.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Server className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Cold Storage</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        95% of crypto assets are stored in offline cold wallets, 
                        protected from online threats.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Multi-Layer Access</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Multiple approval layers for large transactions. 
                        Manual review for withdrawals above ₹1,00,000.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Session Management</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Automatic session timeouts after inactivity. 
                        Device-based login alerts for new access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Honest Transparency</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      We never claim to be "unhackable." Security is an ongoing process. 
                      We invest continuously in monitoring, audits, and improvements. 
                      Our goal is to minimize risk, not eliminate it entirely.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
              <CardDescription>Your account security events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : securityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No security events recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securityLogs.map((log) => {
                        const Icon = eventIcons[log.event_type] || Shield;
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {log.event_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  </p>
                                  {log.device_info && (
                                    <p className="text-xs text-slate-500">{log.device_info}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {format(new Date(log.created_date), 'dd MMM yyyy, hh:mm a')}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {log.location || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[log.status] || 'bg-slate-100 text-slate-800'}>
                                {log.status?.charAt(0).toUpperCase() + log.status?.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Suspicious Activity */}
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Report Suspicious Activity</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Notice something unusual? Contact our security team immediately. 
                    We never ask for your password via email or phone.
                  </p>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Contact Security Team
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
