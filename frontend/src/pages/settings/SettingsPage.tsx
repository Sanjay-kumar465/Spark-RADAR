import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import {
  Building2,
  Users,
  Save,
  CheckCircle2,
  UserPlus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useGSAP, gsap, isReducedMotion } from '../../animations/gsap';

export const SettingsPage: React.FC = () => {
  const { workspace, refreshWorkspace } = useAuth();

  const [name, setName] = useState(workspace?.name || '');
  const [businessType, setBusinessType] = useState(workspace?.business_type || 'travel_agency');
  const [stateJurisdiction, setStateJurisdiction] = useState(workspace?.state_jurisdiction || 'MH');
  const [thresholds, setThresholds] = useState(workspace?.warning_threshold_days || '30,15,7,1');
  const [contactEmail, setContactEmail] = useState(workspace?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(workspace?.contact_phone || '');

  const [members, setMembers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Invite member modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviting, setInviting] = useState(false);

  const currentUserRole = (workspace?.role || 'staff').toLowerCase();
  const canManageSettings = currentUserRole === 'owner' || currentUserRole === 'admin';

  const loadMembers = () => {
    api.getWorkspaceMembers().then(setMembers).catch(console.error);
  };

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setBusinessType(workspace.business_type);
      setStateJurisdiction(workspace.state_jurisdiction);
      setThresholds(workspace.warning_threshold_days || '30,15,7,1');
      setContactEmail(workspace.contact_email || '');
      setContactPhone(workspace.contact_phone || '');
    }
    loadMembers();
  }, [workspace]);

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion()) return;
      gsap.fromTo(
        '.settings-card',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
      );
    },
    { scope: containerRef }
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSettings) {
      alert('Only workspace owners and administrators can modify settings.');
      return;
    }
    setSaving(true);
    setMessage(null);

    try {
      await api.updateWorkspace({
        name,
        business_type: businessType,
        state_jurisdiction: stateJurisdiction,
        warning_threshold_days: thresholds,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      });
      await refreshWorkspace();
      setMessage('Workspace settings saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError(null);
    setInviting(true);

    try {
      await api.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole,
        full_name: inviteFullName.trim() || undefined,
        temporary_password: invitePassword.trim() || undefined,
      });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteFullName('');
      setInvitePassword('');
      loadMembers();
      setMessage(`Successfully invited ${inviteEmail} as ${inviteRole}.`);
    } catch (err: any) {
      setMemberError(err.message || 'Failed to invite member.');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await api.updateMemberRole(memberId, newRole);
      loadMembers();
      setMessage('Member role updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update member role.');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    try {
      await api.removeMember(memberId);
      loadMembers();
      setMessage(`Member ${memberName} removed.`);
    } catch (err: any) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-golden text-graphite-dark text-white border-golden-dark';
      case 'admin':
        return 'bg-sand-light text-golden-dark border-sand/40';
      case 'manager':
        return 'bg-stone text-txt-primary border-stone-dark';
      case 'staff':
      default:
        return 'bg-ivory text-txt-secondary border-stone';
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-txt-primary tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-txt-secondary mt-1">
          Manage transport business profile, jurisdiction rules, warning triggers, and team roles.
        </p>
      </div>

      {!canManageSettings && (
        <div className="p-3.5 rounded-xl bg-golden-light border border-golden/40 text-golden-dark text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            You are logged in as <strong>{currentUserRole.toUpperCase()}</strong>. You have read-only access to workspace settings and member records.
          </span>
        </div>
      )}

      {message && (
        <div className="p-3 rounded-lg bg-sand-light border border-sand/40 text-golden-dark text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-golden-dark shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Workspace Information Form */}
      <form onSubmit={handleSave} className="settings-card bg-white rounded-2xl border border-stone shadow-card p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone">
          <Building2 className="w-5 h-5 text-golden-dark" />
          <h2 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
            Transport Business Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Fleet Business Name
            </label>
            <input
              type="text"
              required
              disabled={!canManageSettings}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden disabled:bg-ivory disabled:text-txt-muted"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Operation Type
            </label>
            <select
              value={businessType}
              disabled={!canManageSettings}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden disabled:bg-ivory disabled:text-txt-muted"
            >
              <option value="travel_agency">Travel Agency / Tourist Transport</option>
              <option value="goods_transport">Goods Transport / Lorry Fleet</option>
              <option value="mixed_fleet">Mixed Commercial Fleet</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Home State RTO
            </label>
            <input
              type="text"
              disabled={!canManageSettings}
              value={stateJurisdiction}
              onChange={(e) => setStateJurisdiction(e.target.value)}
              className="w-full px-3.5 py-2 text-sm uppercase font-mono bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden disabled:bg-ivory disabled:text-txt-muted"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Operations Email
            </label>
            <input
              type="email"
              disabled={!canManageSettings}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden disabled:bg-ivory disabled:text-txt-muted"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Dispatch Phone
            </label>
            <input
              type="tel"
              disabled={!canManageSettings}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden disabled:bg-ivory disabled:text-txt-muted"
            />
          </div>
        </div>

        {/* Warning Thresholds */}
        <div className="pt-4 border-t border-stone space-y-2">
          <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider">
            Statutory Expiry Warning Thresholds (Days)
          </label>
          <input
            type="text"
            disabled={!canManageSettings}
            value={thresholds}
            onChange={(e) => setThresholds(e.target.value)}
            placeholder="30, 15, 7, 1"
            className="w-full max-w-xs px-3.5 py-2 text-sm font-mono bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden disabled:bg-ivory disabled:text-txt-muted"
          />
          <p className="text-[11px] text-txt-secondary">
            Comma-separated days before expiry when documents transition to 'Attention Due Soon' status.
          </p>
        </div>

        {canManageSettings && (
          <div className="flex justify-end pt-3">
            <Button type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
          </div>
        )}
      </form>

      {/* Team Members & Role Management */}
      <div className="settings-card bg-white rounded-2xl border border-stone shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-golden-dark" />
            <div>
              <h2 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
                Workspace Members & Roles
              </h2>
              <p className="text-[11px] text-txt-secondary">
                Enforces role-based permissions: Owner, Admin, Manager, and Staff
              </p>
            </div>
          </div>

          {canManageSettings && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsInviteOpen(true)}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Invite Member
            </Button>
          )}
        </div>

        <div className="divide-y divide-surface-stone">
          {members.map((m) => {
            const isOwner = m.role.toLowerCase() === 'owner';
            return (
              <div key={m.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-txt-primary">{m.full_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${getRoleBadge(
                        m.role
                      )}`}
                    >
                      {m.role}
                    </span>
                  </div>
                  <span className="text-txt-secondary font-mono text-[11px]">{m.email}</span>
                </div>

                {canManageSettings && !isOwner && (
                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                      className="px-2.5 py-1 text-xs bg-white border border-stone rounded-lg focus:outline-none focus:ring-1 focus:ring-golden capitalize"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>

                    <button
                      onClick={() => handleRemoveMember(m.id, m.full_name)}
                      className="p-1.5 text-txt-muted hover:text-racing hover:bg-racing-light rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Workspace Member"
        subtitle="Grant operational access to fleet managers, dispatchers, or staff"
        maxWidth="md"
      >
        <form onSubmit={handleInviteMember} className="space-y-4 text-xs">
          {memberError && (
            <div className="p-3 rounded-lg bg-racing-light border border-racing/30 text-racing-dark text-xs font-medium">
              {memberError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Member Email *
            </label>
            <input
              type="email"
              required
              placeholder="teammate@company.in"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sunil Patil"
              value={inviteFullName}
              onChange={(e) => setInviteFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Role & Permissions *
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            >
              <option value="admin">Admin — Full management, member invitations, archive records</option>
              <option value="manager">Manager — Add/edit vehicles, documents, drivers, and tasks</option>
              <option value="staff">Staff — Read-only fleet access; complete assigned tasks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
              Initial Password (Optional)
            </label>
            <input
              type="password"
              placeholder="Leave blank for default (SparkRadar@2026)"
              value={invitePassword}
              onChange={(e) => setInvitePassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-stone">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={inviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
