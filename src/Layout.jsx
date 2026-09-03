import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Zap, 
  Settings,
  Shield
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  // Pages that should have full-width layout without navigation
  const fullWidthPages = ['KYCOnboarding'];
  const isFullWidth = fullWidthPages.includes(currentPageName);

  if (isFullWidth) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Home', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'TradeDesk', icon: Wallet, page: 'TradeDesk' },
    { name: 'Crypto', icon: TrendingUp, page: 'CryptoSolve' },
    { name: 'Stocks', icon: Shield, page: 'StockSolve' },
    { name: 'Settings', icon: Settings, page: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-slate-900' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : ''}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          main {
            padding-bottom: 5rem;
          }
        }
      `}</style>
    </div>
  );
}
