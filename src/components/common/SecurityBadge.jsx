import React from 'react';
import { Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SecurityBadge({ variant = 'default', size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const variants = {
    default: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: Shield,
      label: 'Secured'
    },
    verified: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: CheckCircle2,
      label: 'Verified'
    },
    encrypted: {
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      text: 'text-slate-700',
      icon: Lock,
      label: 'Encrypted'
    },
    monitored: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
      icon: Eye,
      label: 'Monitored'
    }
  };

  const v = variants[variant];
  const Icon = v.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`inline-flex items-center rounded-full border ${v.bg} ${v.border} ${v.text} ${sizeClasses[size]}`}>
            <Icon className={iconSizes[size]} />
            <span className="font-medium">{v.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">
            {variant === 'default' && 'Your funds are protected with industry-standard security measures.'}
            {variant === 'verified' && 'This information has been verified through our compliance process.'}
            {variant === 'encrypted' && 'All data is encrypted using AES-256 encryption.'}
            {variant === 'monitored' && '24/7 monitoring for suspicious activities.'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
