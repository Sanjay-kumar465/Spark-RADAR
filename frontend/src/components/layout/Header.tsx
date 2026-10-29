import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Check,
  Plus,
  LogOut,
  Building2,
  Shield,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { AttentionBadge, DocumentStatusBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import type { Workspace } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, workspace, setWorkspace, logout } = useAuth();

  const [isStyleGuideOpen, setIsStyleGuideOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);

  const [myWorkspaces, setMyWorkspaces] = useState<Workspace[]>([]);
  const [newWsName, setNewWsName] = useState('');
  const [newWsType, setNewWsType] = useState('travel_agency');
  const [newWsState, setNewWsState] = useState('TN');
  const [creatingWs, setCreatingWs] = useState(false);

  const wsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      api.getMyWorkspaces().then(setMyWorkspaces).catch(console.error);
    }
  }, [user, workspace]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchWorkspace = (ws: Workspace) => {
    setWorkspace(ws);
    setIsWorkspaceMenuOpen(false);
    window.location.reload();
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setCreatingWs(true);
    try {
      const created = await api.createWorkspace({
        name: newWsName.trim(),
        business_type: newWsType,
        state_jurisdiction: newWsState,
      });
      setWorkspace(created);
      setIsCreateWsOpen(false);
      setNewWsName('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace');
    } finally {
      setCreatingWs(false);
    }
  };

  const userRole = (workspace?.role || 'member').toUpperCase();

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-golden text-graphite-dark border-golden-dark';
      case 'ADMIN':
        return 'bg-sand-light text-graphite border-sand-dark';
      case 'MANAGER':
        return 'bg-stone text-charcoal border-black/40';
      default:
        return 'bg-ivory text-txt-secondary border-stone';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-stone shadow-subtle">
        {/* Left: Mobile Toggle & Workspace Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-txt-secondary hover:text-charcoal hover:bg-ivory rounded-lg lg:hidden"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Workspace Switcher */}
          <div className="relative" ref={wsDropdownRef}>
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-stone bg-ivory/50 hover:bg-ivory hover:border-golden/60 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-golden/15 border border-golden/30 flex items-center justify-center text-golden-dark shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-txt-primary leading-tight max-w-[160px] truncate">
                    {workspace?.name || 'My Transport Fleet'}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getRoleBadgeClass(
                      userRole
                    )}`}
                  >
                    {userRole}
                  </span>
                </div>
                <span className="text-[10px] text-txt-muted block leading-tight font-mono">
                  {workspace?.state_jurisdiction || 'TN'} •{' '}
                  {workspace?.business_type === 'goods_transport'
                    ? 'Goods Transport'
                    : workspace?.business_type === 'mixed_fleet'
                    ? 'Mixed Fleet'
                    : 'Tourist Transport'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-txt-muted" />
            </button>

            {/* Workspace Dropdown */}
            {isWorkspaceMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-stone shadow-elevated py-2 z-50">
                <div className="px-3 py-1.5 border-b border-stone mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">
                    Switch Transport Workspace
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-stone/40">
                  {myWorkspaces.map((ws) => {
                    const isCurrent = ws.id === workspace?.id;
                    return (
                      <button
                        key={ws.id}
                        onClick={() => handleSwitchWorkspace(ws)}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-ivory transition-colors ${
                          isCurrent ? 'bg-sand-light/50 font-semibold' : ''
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs text-txt-primary truncate">{ws.name}</p>
                          <p className="text-[10px] text-txt-muted font-mono">
                            {ws.state_jurisdiction} • {ws.business_type}
                          </p>
                        </div>
                        {isCurrent ? (
                          <Check className="w-4 h-4 text-golden-dark shrink-0" />
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-txt-muted border border-stone px-1 rounded">
                            {ws.role || 'member'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 px-2 border-t border-stone mt-1">
                  <button
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      setIsCreateWsOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-golden-dark hover:bg-golden-light/50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsStyleGuideOpen(true)}
            icon={<Sparkles className="w-4 h-4 text-golden" />}
            className="hidden md:flex text-xs"
          >
            Design Tokens
          </Button>

          {/* User Menu Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-ivory transition-colors border border-transparent hover:border-stone"
            >
              <div className="w-8 h-8 rounded-full bg-graphite text-golden border border-golden/40 flex items-center justify-center font-bold text-xs shadow-subtle">
                {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'SR'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-txt-muted hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-stone shadow-elevated py-2 z-50">
                <div className="px-3.5 py-2 border-b border-stone">
                  <p className="text-xs font-bold text-txt-primary truncate">
                    {user?.full_name || 'Fleet Operator'}
                  </p>
                  <p className="text-[11px] text-txt-secondary truncate">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-golden-dark">
                    <Shield className="w-3 h-3" />
                    <span>Role: {userRole}</span>
                  </div>
                </div>

                <div className="py-1">
                  <a
                    href="/settings"
                    className="block px-3.5 py-1.5 text-xs text-txt-primary hover:bg-ivory"
                  >
                    Workspace Settings
                  </a>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsStyleGuideOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-txt-primary hover:bg-ivory md:hidden"
                  >
                    Design Tokens Guide
                  </button>
                </div>

                <div className="border-t border-stone pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-racing hover:bg-racing-light/50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Create New Workspace Modal */}
      <Modal
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        title="Add Fleet Workspace"
        subtitle="Create an independent workspace for another transport business or regional branch"
        maxWidth="md"
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Business / Fleet Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Meenakshi Transport Chennai"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Fleet Category
              </label>
              <select
                value={newWsType}
                onChange={(e) => setNewWsType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
              >
                <option value="travel_agency">Tourist Transport / Cabs</option>
                <option value="goods_transport">Lorries & Goods Carriers</option>
                <option value="mixed_fleet">Mixed Commercial Fleet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                State Jurisdiction
              </label>
              <select
                value={newWsState}
                onChange={(e) => setNewWsState(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden font-mono"
              >
                <option value="TN">Tamil Nadu (TN)</option>
                <option value="KA">Karnataka (KA)</option>
                <option value="KL">Kerala (KL)</option>
                <option value="AP">Andhra Pradesh (AP)</option>
                <option value="MH">Maharashtra (MH)</option>
                <option value="DL">Delhi (DL)</option>
                <option value="OTHER">Other State / All India</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-stone flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateWsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={creatingWs}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>

      {/* Style Guide / Design System Modal */}
      <Modal
        isOpen={isStyleGuideOpen}
        onClose={() => setIsStyleGuideOpen(false)}
        title="Racing Sunset Brand Tokens"
        subtitle="Verification of approved brand colors, typography, badges, and responsive controls"
        maxWidth="xl"
      >
        <div className="space-y-6 text-xs">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2 font-heading">
              Racing Sunset Palette
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-lg bg-golden text-graphite-dark">
                <span className="font-bold block">Golden Hour</span>
                <span className="text-[10px] opacity-80">#E6B23C</span>
              </div>
              <div className="p-2.5 rounded-lg bg-sand text-graphite-dark">
                <span className="font-bold block">Sunlit Sand</span>
                <span className="text-[10px] opacity-80">#C7B394</span>
              </div>
              <div className="p-2.5 rounded-lg bg-steel text-white">
                <span className="font-bold block">Steel Gray</span>
                <span className="text-[10px] opacity-80">#000000</span>
              </div>
              <div className="p-2.5 rounded-lg bg-graphite text-white">
                <span className="font-bold block">Graphite Drive</span>
                <span className="text-[10px] opacity-80">#1F2226</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black text-white">
                <span className="font-bold block">Shadow Black</span>
                <span className="text-[10px] opacity-80">#000000</span>
              </div>
              <div className="p-2.5 rounded-lg bg-racing text-white">
                <span className="font-bold block">Racing Stripe</span>
                <span className="text-[10px] opacity-80">#B41E2D</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ivory border border-stone text-charcoal">
                <span className="font-bold block">Warm Ivory</span>
                <span className="text-[10px] text-txt-secondary">#F7F6F0</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-stone text-charcoal">
                <span className="font-bold block">White Surface</span>
                <span className="text-[10px] text-txt-secondary">#FFFFFF</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2 font-heading">
              Status Badges & Tokens
            </h4>
            <div className="flex flex-wrap gap-2 items-center">
              <AttentionBadge status="CRITICAL" />
              <AttentionBadge status="ATTENTION" />
              <AttentionBadge status="INCOMPLETE" />
              <AttentionBadge status="COMPLIANT" />
              <DocumentStatusBadge status="ACTIVE" label="Active Validity" />
              <DocumentStatusBadge status="DUE_SOON" label="Due Soon" />
              <DocumentStatusBadge status="EXPIRED" label="Expired" />
              <DocumentStatusBadge status="MISSING" label="Missing Doc" />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2 font-heading">
              Button Components
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary">Primary (Golden)</Button>
              <Button size="sm" variant="secondary">Secondary (Graphite)</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
              <Button size="sm" variant="danger">Danger (Racing)</Button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sand-light border border-sand/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-golden-dark shrink-0 mt-0.5" />
            <p className="text-[11px] text-graphite leading-relaxed">
              <strong>Strict Brand Compliance:</strong> Violet, purple, indigo, navy, and neon colors are strictly excluded. All icons use Lucide SVG vectors; no emojis are used anywhere.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
