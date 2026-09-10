import React, { useState } from 'react';
import {
  X,
  User,
  Check,
  Plus,
  Mail,
  Shield,
  Wrench,
  Users,
} from 'lucide-react';
import { UserProfile, SystemTier } from '../types';
import { TIER_DEFINITIONS } from '../services/tierService';

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
  const [tier, setTier] = useState<SystemTier>('control');
  const [org, setOrg] = useState('Petri Zero');

  if (!isOpen) return null;

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];
  const activeTierMeta = TIER_DEFINITIONS[activeUser.tier || 'superadmin'];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      email: email.trim(),
      role,
      tier,
      organization: org,
      canApproveGates: tier === 'superadmin' || (tier === 'control' && role !== 'viewer'),
      canDeploy: tier !== 'consumer',
      canEditRules: tier === 'superadmin',
    };

    onAddUser?.(newUser);
    onSelectUser(newUser.id);
    setName('');
    setEmail('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-2xl bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">Operator Profile & Access</h2>
              <p className="text-xs text-stone-500">Authenticated operator identity and RBAC role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Profile Card */}
        <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-semibold text-sm">
                {activeUser.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900 flex items-center space-x-2">
                  <span>{activeUser.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold flex items-center space-x-1 ${activeTierMeta.badgeStyle.bg} ${activeTierMeta.badgeStyle.text} ${activeTierMeta.badgeStyle.border}`}>
                    {activeUser.tier === 'superadmin' && <Shield className="w-3 h-3" />}
                    {activeUser.tier === 'control' && <Wrench className="w-3 h-3" />}
                    {activeUser.tier === 'consumer' && <Users className="w-3 h-3" />}
                    <span>{activeTierMeta.label.toUpperCase()}</span>
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center space-x-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{activeUser.email}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-600 font-medium capitalize">{activeUser.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-200/60 text-center text-xs">
            <div className="p-2 rounded-xl bg-white border border-stone-200/60">
              <div className="text-[10px] text-stone-400 font-mono">TIER</div>
              <div className={`font-semibold text-xs mt-0.5 capitalize ${activeTierMeta.badgeStyle.text}`}>
                {activeUser.tier || 'superadmin'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-stone-200/60">
              <div className="text-[10px] text-stone-400 font-mono">SAIF GOVERNANCE</div>
              <div className={`font-semibold text-xs mt-0.5 ${
                activeUser.tier === 'superadmin' ? 'text-purple-700' : activeUser.tier === 'control' ? 'text-stone-600' : 'text-stone-400'
              }`}>
                {activeUser.tier === 'superadmin' ? 'Full Root' : activeUser.tier === 'control' ? 'Read-Only' : 'Blocked'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-stone-200/60">
              <div className="text-[10px] text-stone-400 font-mono">NODE & CONTAINER</div>
              <div className={`font-semibold text-xs mt-0.5 ${
                activeUser.tier === 'consumer' ? 'text-stone-400' : 'text-emerald-700'
              }`}>
                {activeUser.tier === 'consumer' ? 'Disabled' : 'Enabled'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-stone-200/60">
              <div className="text-[10px] text-stone-400 font-mono">GATE APPROVAL</div>
              <div className={`font-semibold text-xs mt-0.5 ${
                activeUser.canApproveGates ? 'text-emerald-700' : 'text-stone-400'
              }`}>
                {activeUser.canApproveGates ? (activeUser.tier === 'superadmin' ? 'Unrestricted' : 'Stage 1-5') : 'None'}
              </div>
            </div>
          </div>
        </div>

        {/* Profiles List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Configured Identities ({users.length})</span>
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs font-medium text-stone-900 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Operator Identity</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {users.map((u) => {
              const isSelected = u.id === activeUserId;
              const uTierMeta = TIER_DEFINITIONS[u.tier || 'superadmin'];
              return (
                <div
                  key={u.id}
                  onClick={() => onSelectUser(u.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-stone-100 border-stone-400 font-semibold'
                      : 'bg-white hover:bg-stone-50 border-stone-200/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-semibold text-xs text-stone-700">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-stone-900 flex items-center space-x-2">
                        <span>{u.name}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${uTierMeta.badgeStyle.bg} ${uTierMeta.badgeStyle.text} ${uTierMeta.badgeStyle.border}`}>
                          {uTierMeta.label.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-sans px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 border border-stone-200 capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Identity Form */}
        {isAdding && (
          <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
            <div className="font-semibold text-stone-900">Register Additional Operator Identity</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name (e.g. Sarah Connor)"
                className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as SystemTier)}
                className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 font-semibold"
              >
                <option value="superadmin">🛡️ SuperAdmin</option>
                <option value="control">⚙️ Control</option>
                <option value="consumer">👥 Consumer</option>
              </select>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserProfile['role'])}
                className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900"
              >
                <option value="owner">Owner</option>
                <option value="lead_architect">Lead Architect</option>
                <option value="security_auditor">Security Auditor</option>
                <option value="senior_dev">Senior Dev</option>
                <option value="viewer">Viewer</option>
              </select>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Organization"
                className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl text-stone-600 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white font-medium border border-stone-900 hover:bg-black transition-colors"
              >
                Save Identity
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
