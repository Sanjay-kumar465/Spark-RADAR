import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  Truck,
  CalendarClock,
  Users,
  Settings,
  Building2,
  ChevronRight,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../branding/Logo';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, workspace, logout } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', to: '/vehicles', icon: Truck },
    { name: 'Renewals', to: '/renewals', icon: CalendarClock },
    { name: 'Drivers', to: '/drivers', icon: Users },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-graphite border-r border-black/20 text-white transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/20 bg-black/40">
          <NavLink to="/dashboard" onClick={onCloseMobile}>
            <Logo size="sm" variant="light" />
          </NavLink>
        </div>

        {/* Current Workspace Card */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-black/70 border border-black/25">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-golden/15 text-golden shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate font-heading">
                {workspace?.name || 'Active Fleet'}
              </p>
              <p className="text-[10px] text-sand truncate uppercase tracking-wider mt-0.5">
                {workspace?.business_type || 'Commercial Fleet'} • {workspace?.state_jurisdiction || 'TN'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation (Exact 5 areas) */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto dark-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={cn(
                  'relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors select-none',
                  isActive
                    ? 'text-graphite-dark font-bold'
                    : 'text-sand hover:text-white hover:bg-graphite-light'
                )}
              >
                {/* Smooth Animated Active Pill Background in Golden Hour */}
                {isActive && (
                  <motion.div
                    layoutId={shouldReduceMotion ? undefined : 'activeNavIndicator'}
                    className="absolute inset-0 bg-golden rounded-lg shadow-subtle -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <Icon className={cn('w-4 h-4 shrink-0 relative z-10', isActive ? 'text-graphite-dark' : 'text-sand')} />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-graphite-dark shrink-0 relative z-10" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Compliance System Status Pill */}
        <div className="px-3 pb-3">
          <div className="p-2.5 rounded-lg bg-black/60 border border-black/20 flex items-center gap-2 text-sand">
            <ShieldCheck className="w-4 h-4 text-golden shrink-0" />
            <span className="text-[11px] font-medium leading-tight text-sand">
              Motor Vehicles Act Matrix Ready
            </span>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-black/20 bg-black/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-golden/20 border border-golden/40 flex items-center justify-center text-golden font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate leading-none">
                  {user?.full_name || 'Fleet Operator'}
                </p>
                <span className="text-[10px] text-sand capitalize mt-0.5 block leading-none">
                  {workspace?.role || 'Manager'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <NavLink
                to="/"
                title="Public Site"
                className="p-1.5 text-sand hover:text-white rounded-lg hover:bg-graphite transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </NavLink>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-sand hover:text-racing rounded-lg hover:bg-graphite transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
