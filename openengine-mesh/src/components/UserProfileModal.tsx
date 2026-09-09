import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Check,
  Building2,
  Plus,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  activeUserId: string;
  onSelectUser: (userId: string) => void;
  onAddUser?: (user: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSelectUser,
  onAddUser,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('senior_dev');
  const [org, setOrg] = useState('The Open Engine Co.');

  if (!isOpen) return null;

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: UserProfile = {
      id: `usr-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim(),
      role,
      organization: org,
      canApproveGates: role === 'owner' || role === 'lead_architect' || role === 'security_auditor',
      canDeploy: role !== 'viewer',
      canEditRules: role === 'owner' || role === 'lead_architect',
    };

    onAddUser?.(newUser);
    onSelectUser(newUser.id);
    setName('');
    setEmail('');
    setIsAdding(false);
  };

  const getRoleBadge = (r: UserProfile['role']) => {
    switch (r) {
      case 'owner':
        return { label: 'Owner', color: 'bg-[#E0F7F6] text-stone-900 border-zinc-700/60' };
      case 'lead_architect':
        return { label: 'Lead Architect', color: 'bg-indigo-950/60 text-indigo-200 border-indigo-500/30' };
      case 'security_auditor':
        return { label: 'Security Auditor', color: 'bg-emerald-950/60 text-emerald-200 border-emerald-500/30' };
      case 'senior_dev':
        return { label: 'Senior Dev', color: 'bg-stone-100 text-stone-700 border-zinc-700/40' };
      case 'viewer':
        return { label: 'Viewer', color: 'bg-stone-100/60 text-stone-500 border-zinc-800' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white/95 border border-stone-200 rounded-3xl w-full max-w-xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden text-stone-800 font-sans">
        {/* Modal Header */}
        <div className="border-b border-stone-200 px-6 py-5 flex items-center justify-between bg-stone-50">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-stone-900">
                Switch User & Identity
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                Multi-tenant role-based identity and gate signoff credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-white/[0.04] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Active User Card */}
          <div className="bg-gradient-to-b from-[#141414] to-[#0e0e0e] border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-sm font-mono font-bold text-stone-900">
                {activeUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-stone-900">{activeUser.name}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${getRoleBadge(activeUser.role).color}`}>
                    {getRoleBadge(activeUser.role).label}
                  </span>
                </div>
                <div className="text-xs text-stone-500 font-mono mt-0.5 flex items-center space-x-1.5">
                  <span>{activeUser.email}</span>
                  <span>·</span>
                  <span className="flex items-center space-x-1 text-stone-500">
                    <Building2 className="w-3 h-3" />
                    <span>{activeUser.organization}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-medium">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Permissions Matrix for Active User */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
              <Shield className="w-3 h-3 text-stone-500" />
              <span>Assigned Security & Execution Rights</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/40 border border-stone-200 flex flex-col space-y-1">
                <span className="text-stone-500 text-[10px]">Gate Signoffs</span>
                <span className={activeUser.canApproveGates ? 'text-emerald-400 flex items-center space-x-1' : 'text-stone-400'}>
                  {activeUser.canApproveGates ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{activeUser.canApproveGates ? 'Authorized' : 'Restricted'}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-stone-200 flex flex-col space-y-1">
                <span className="text-stone-500 text-[10px]">Deploy Pipeline</span>
                <span className={activeUser.canDeploy ? 'text-emerald-400 flex items-center space-x-1' : 'text-stone-400'}>
                  {activeUser.canDeploy ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{activeUser.canDeploy ? 'Authorized' : 'Restricted'}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-stone-200 flex flex-col space-y-1">
                <span className="text-stone-500 text-[10px]">Rule Synthesis</span>
                <span className={activeUser.canEditRules ? 'text-emerald-400 flex items-center space-x-1' : 'text-stone-400'}>
                  {activeUser.canEditRules ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{activeUser.canEditRules ? 'Full Access' : 'Read-Only'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* User List */}
          {!isAdding ? (
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Available Personas & Accounts ({users.length})
              </div>

              <div className="space-y-2">
                {users.map((user) => {
                  const isCur = user.id === activeUserId;
                  const badge = getRoleBadge(user.role);

                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user.id);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isCur
                          ? 'border-white/[0.18] bg-stone-100 text-white shadow-md'
                          : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-white/[0.1] hover:bg-stone-100/40 hover:text-stone-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold border ${
                          isCur ? 'bg-stone-100 border-[#0ABAB5] text-white' : 'bg-black/60 border-stone-200 text-stone-500'
                        }`}>
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-stone-800">{user.name}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                            {user.email} · {user.organization}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isCur ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-transparent group-hover:text-stone-500 transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-stone-200 hover:border-white/[0.16] hover:bg-white/[0.02] text-xs font-mono text-stone-500 hover:text-stone-800 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Enterprise Identity</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3.5 pt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                New Enterprise Identity
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-stone-500">Full Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Satoshi Nakamoto"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#0ABAB5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-stone-500">Enterprise Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="satoshi@the-open-engine.org"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#0ABAB5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-stone-500">Role & Authority</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#0ABAB5]"
                >
                  <option value="owner">Owner (Unrestricted Root)</option>
                  <option value="lead_architect">Lead Architect (Gate Approvals & Rules)</option>
                  <option value="security_auditor">Security Auditor (Gate Reviews & Penetration)</option>
                  <option value="senior_dev">Senior Developer (Dispatch & Verification)</option>
                  <option value="viewer">Viewer (Read-Only Observer)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-stone-500">Organization Tenant</label>
                <input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="The Open Engine Co."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#0ABAB5]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-stone-500 hover:text-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0ABAB5] hover:bg-[#099E99] text-white shadow-md text-xs font-mono font-bold transition-all"
                >
                  Save & Switch
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs font-mono text-stone-500">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stone-500" />
            <span>Encrypted zero-knowledge credential cache</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-zinc-700 border border-stone-200 text-stone-800 text-xs font-mono transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
