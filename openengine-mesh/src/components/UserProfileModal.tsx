import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Check,
  Plus,
  Mail,
  Shield,
  Wrench,
  Users,
  Edit3,
  Save,
  Key,
  Network,
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
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSelectUser,
  onAddUser,
  onUpdateUser,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserProfile['role']>('owner');
  const [editOrg, setEditOrg] = useState('');
  const [editCanApprove, setEditCanApprove] = useState(true);

  // New Identity State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('senior_dev');
  const [tier, setTier] = useState<SystemTier>('control');
  const [org, setOrg] = useState('Petri Zero');

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  useEffect(() => {
    if (activeUser) {
      setEditName(activeUser.name);
      setEditEmail(activeUser.email);
      setEditRole(activeUser.role);
      setEditOrg(activeUser.organization);
      setEditCanApprove(activeUser.canApproveGates);
    }
  }, [activeUser, isOpen]);

  if (!isOpen) return null;

  const activeTierMeta = TIER_DEFINITIONS[activeUser.tier || 'superadmin'];

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;

    const updated: UserProfile = {
      ...activeUser,
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole,
      organization: editOrg.trim() || 'Petri Zero Platform',
      canApproveGates: editCanApprove,
    };

    onUpdateUser?.(updated);
    setIsEditing(false);
  };

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

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* In-Place Profile Editing Form */}
          {isEditing && (
            <form onSubmit={handleSaveEdit} className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-semibold text-stone-900 flex items-center justify-between border-b border-stone-100 pb-2">
                <span>Edit SuperAdmin Operator Details</span>
                <span className="text-[10px] font-mono text-stone-400">ID: {activeUser.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-500 uppercase">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 text-xs"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-500 uppercase">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserProfile['role'])}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 text-xs"
                  >
                    <option value="owner">Platform Owner</option>
                    <option value="lead_architect">Lead Architect</option>
                    <option value="security_auditor">Security Auditor</option>
                    <option value="senior_dev">Senior Dev</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-500 uppercase">Organization</label>
                  <input
                    type="text"
                    value={editOrg}
                    onChange={(e) => setEditOrg(e.target.value)}
                    placeholder="Organization"
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-500 uppercase">Gate Approval</label>
                  <div className="flex items-center h-8">
                    <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCanApprove}
                        onChange={(e) => setEditCanApprove(e.target.checked)}
                        className="rounded border-stone-300 text-stone-900 focus:ring-0"
                      />
                      <span>Unrestricted</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg text-stone-600 hover:bg-stone-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-3.5 py-1 rounded-lg bg-stone-900 text-white font-medium text-xs hover:bg-black transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Petri Server & Tailscale Mesh Authority Integration */}
          <div className="p-3 rounded-xl bg-white border border-stone-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-700">
              <span className="flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Petri Server Authority Token:</span>
              </span>
              <span className="font-mono text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                petri_root_sec_{activeUser.id}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium text-stone-700 pt-1 border-t border-stone-100">
              <span className="flex items-center space-x-1.5">
                <Network className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tailscale Mesh Node:</span>
              </span>
              <span className="font-mono text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                po.taildf505d.ts.net (100.81.151.110)
              </span>
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
