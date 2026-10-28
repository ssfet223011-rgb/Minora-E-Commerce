import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Lock,
  Layers,
  Package,
  ShoppingBag,
  Boxes,
  BarChart3,
  Crown,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { UserProfile, EditorPermission } from '../../types';

const PERMISSION_CONFIG: {
  key: EditorPermission;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    key: 'manage_products',
    label: 'Products & Variations',
    desc: 'Add, update, and remove products and package variants',
    icon: Package,
  },
  {
    key: 'manage_categories',
    label: 'Categories Management',
    desc: 'Add, edit, reorder, and activate/deactivate categories',
    icon: Layers,
  },
  {
    key: 'manage_orders',
    label: 'Order Processing',
    desc: 'View customer orders, verify bKash/Nagad payments, update shipping status',
    icon: ShoppingBag,
  },
  {
    key: 'manage_inventory',
    label: 'Inventory & Stock Control',
    desc: 'Adjust variant stock quantities and audit movements',
    icon: Boxes,
  },
  {
    key: 'view_reports',
    label: 'Dashboard Reports',
    desc: 'View sales metrics, revenue analytics, and performance KPIs',
    icon: BarChart3,
  },
];

export const AdminEditors: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const [editors, setEditors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEditor, setEditingEditor] = useState<UserProfile | null>(null);

  // Super Admin Change / Transfer State
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [superAdminName, setSuperAdminName] = useState(user?.full_name || 'Minora Super Admin');
  const [superAdminEmail, setSuperAdminEmail] = useState(user?.email || 'admin@minora.com');
  const [superAdminPhone, setSuperAdminPhone] = useState(user?.phone || '+880 1838 384488');
  const [copiedSql, setCopiedSql] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<EditorPermission[]>([
    'manage_products',
    'manage_categories',
    'manage_inventory',
  ]);
  const [status, setStatus] = useState<'active' | 'suspended'>('active');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEditors = async () => {
    setLoading(true);
    const list = await authService.getEditors();
    setEditors(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchEditors();
  }, []);

  const handleSaveSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminEmail.trim() || !superAdminName.trim()) {
      setErrorMessage('Super Admin name and email are required.');
      return;
    }

    const res = await authService.updateSuperAdmin({
      full_name: superAdminName.trim(),
      email: superAdminEmail.trim(),
      phone: superAdminPhone.trim(),
    });

    if (res.success) {
      setSuccessMessage(`Super Admin credentials updated to ${superAdminEmail}. Changes saved!`);
      setTimeout(() => setSuccessMessage(null), 3500);
      setIsSuperAdminModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Failed to update Super Admin.');
    }
  };

  const handleCopySql = () => {
    const sql = `SELECT public.assign_admin_role('${superAdminEmail}');`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 bg-red-50/70 border border-red-200 rounded-3xl text-center max-w-lg mx-auto space-y-4 my-12">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-chocolate">Restricted to Super Administrator</h2>
        <p className="text-xs text-chocolate/80 leading-relaxed">
          Only the Super Administrator has authority to create, configure, and assign individual authorities to Editor accounts.
        </p>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingEditor(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setSelectedPermissions(['manage_products', 'manage_categories', 'manage_inventory']);
    setStatus('active');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (editor: UserProfile) => {
    setEditingEditor(editor);
    setFullName(editor.full_name);
    setEmail(editor.email);
    setPhone(editor.phone || '');
    setSelectedPermissions(editor.permissions || ['manage_products', 'manage_categories', 'manage_inventory']);
    setStatus(editor.status);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const togglePermission = (perm: EditorPermission) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Full name and email are required.');
      return;
    }

    if (editingEditor) {
      // Update existing editor
      const res = await authService.updateEditor(editingEditor.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        status,
        permissions: selectedPermissions,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update editor.');
        return;
      }

      setSuccessMessage(`Editor "${fullName}" authorities updated successfully!`);
    } else {
      // Create new editor
      const res = await authService.createEditor({
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        permissions: selectedPermissions,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create editor.');
        return;
      }

      setSuccessMessage(`New Editor "${fullName}" registered and granted authorities!`);
    }

    setTimeout(() => setSuccessMessage(null), 3500);
    setIsModalOpen(false);
    await fetchEditors();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove Editor "${name}"? They will no longer have access to the admin panel.`)) {
      await authService.deleteEditor(id);
      setSuccessMessage(`Editor "${name}" removed.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchEditors();
    }
  };

  const handleToggleStatus = async (editor: UserProfile) => {
    const newStatus = editor.status === 'active' ? 'suspended' : 'active';
    await authService.updateEditor(editor.id, { status: newStatus });
    setSuccessMessage(`Editor "${editor.full_name}" is now ${newStatus}.`);
    setTimeout(() => setSuccessMessage(null), 3000);
    await fetchEditors();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-chocolate">Staff & Editor Management</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber/20 text-chocolate flex items-center gap-1 border border-amber/30">
              <ShieldCheck className="w-3 h-3 text-amber" /> Super Admin Authority
            </span>
          </div>
          <p className="text-xs text-chocolate/70 mt-1">
            Super Administrator exclusive: Setup editor accounts, define custom authorities, and control staff access.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Editor</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {/* Primary Super Administrator Profile Card */}
      <div className="bg-gradient-to-r from-chocolate to-chocolate-light text-cream rounded-3xl p-6 sm:p-7 border border-amber/30 shadow-warm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber text-chocolate flex items-center justify-center font-serif font-black text-2xl shadow-md border border-amber/40">
              <Crown className="w-8 h-8 text-chocolate" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-cream">
                  {user?.full_name || 'Minora Super Admin'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber text-chocolate">
                  Primary Super Admin
                </span>
              </div>
              <p className="text-xs text-honey/90 mt-0.5 font-mono">{user?.email || 'admin@minora.com'}</p>
              <p className="text-[11px] text-cream/60 mt-0.5">
                Master Ownership • Full Store Authority • Staff Permission Controller
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSuperAdminName(user?.full_name || 'Minora Super Admin');
                setSuperAdminEmail(user?.email || 'admin@minora.com');
                setSuperAdminPhone(user?.phone || '+880 1838 384488');
                setIsSuperAdminModalOpen(true);
              }}
              className="px-4 py-2 bg-amber hover:bg-honey text-chocolate font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change / Transfer Super Admin</span>
            </button>
          </div>
        </div>

        {/* Automatic Cloud Transfer Command Note */}
        <div className="p-3 bg-black/25 rounded-2xl border border-amber/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-honey flex-shrink-0" />
            <span className="text-cream/90 text-[11px]">
              <strong>Automatic Database Command:</strong> Run this in Supabase SQL editor to assign Super Admin role to any registered email:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 bg-black/40 rounded-lg text-honey font-mono text-[11px] border border-amber/20">
              SELECT public.assign_admin_role('{user?.email || 'your@email.com'}');
            </code>
            <button
              onClick={handleCopySql}
              className="p-1.5 bg-amber/20 hover:bg-amber/30 text-honey rounded-lg transition-colors cursor-pointer"
              title="Copy SQL command"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-amber/10 border border-amber/30 rounded-2xl flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
        <div className="text-xs text-chocolate/80 space-y-1">
          <strong className="text-chocolate block font-bold">Role & Permissions Hierarchy:</strong>
          <p>
            • <strong>Super Admin:</strong> Full unrestricted access to store, editors, payment gateways, brand settings, and all databases.
          </p>
          <p>
            • <strong>Editor:</strong> Can add, edit, and remove products/categories and process orders based on individual checkboxes assigned below. Cannot access Website Settings or modify other staff accounts.
          </p>
          <p>
            • <strong>Customer:</strong> Standard shopper account. Completely restricted from the admin portal.
          </p>
        </div>
      </div>

      {/* Editors List */}
      <div className="bg-white rounded-2xl border border-amber/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber border-t-transparent mx-auto" />
          </div>
        ) : editors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-amber/15 text-chocolate/70">
                <tr>
                  <th className="py-3 px-4 font-bold">Editor Name & Email</th>
                  <th className="py-3 px-4 font-bold">Phone</th>
                  <th className="py-3 px-4 font-bold">Granted Authorities</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber/10">
                {editors.map((ed) => {
                  const perms = ed.permissions || ['manage_products', 'manage_categories', 'manage_inventory'];
                  return (
                    <tr key={ed.id} className="hover:bg-cream/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-chocolate text-honey font-serif font-bold text-sm flex items-center justify-center border border-amber/20 flex-shrink-0">
                            {ed.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="font-semibold text-chocolate block text-sm">
                              {ed.full_name}
                            </strong>
                            <span className="font-mono text-[11px] text-chocolate/60">{ed.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-chocolate/70">
                        {ed.phone || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {PERMISSION_CONFIG.map((p) => {
                            const hasIt = perms.includes(p.key);
                            return (
                              <span
                                key={p.key}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  hasIt
                                    ? 'bg-amber/15 text-chocolate border border-amber/30'
                                    : 'bg-gray-100 text-gray-400 line-through opacity-60'
                                }`}
                              >
                                {p.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(ed)}
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            ed.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {ed.status === 'active' ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(ed)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber/10 hover:bg-amber/20 text-chocolate font-bold text-xs border border-amber/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Edit Editor Authorities"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber" />
                            <span>Edit Authorities</span>
                          </button>
                          <button
                            onClick={() => handleDelete(ed.id, ed.full_name)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 cursor-pointer"
                            title="Delete Editor Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-chocolate/60 space-y-3">
            <UserCheck className="w-8 h-8 text-amber/40 mx-auto" />
            <p>No editor accounts registered yet.</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-chocolate text-honey font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create First Editor</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-deep/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-amber/30 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber/15">
              <div>
                <h3 className="font-serif text-xl font-bold text-chocolate">
                  {editingEditor ? `Edit Authorities: ${editingEditor.full_name}` : 'Setup New Editor Account'}
                </h3>
                <p className="text-[11px] text-chocolate/60 mt-0.5">
                  Super Admin controls which areas this editor is authorized to modify.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-chocolate/60 hover:text-chocolate rounded-full hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditor} className="space-y-5 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-chocolate mb-1">Editor Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Arif Rahman"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-chocolate mb-1">Login Email Address</label>
                    <input
                      type="email"
                      required
                      disabled={Boolean(editingEditor)}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="editor@minora.com"
                      className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-chocolate mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-chocolate mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-medium"
                  >
                    <option value="active">Active (Granted Access)</option>
                    <option value="suspended">Suspended (Blocked from Logging In)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="pt-3 border-t border-amber/15 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-chocolate uppercase tracking-wider text-[11px]">
                    Assign Specific Authorities:
                  </label>
                  <span className="text-[10px] text-chocolate/60">
                    {selectedPermissions.length} of {PERMISSION_CONFIG.length} selected
                  </span>
                </div>

                <div className="space-y-2">
                  {PERMISSION_CONFIG.map((item) => {
                    const isChecked = selectedPermissions.includes(item.key);
                    const Icon = item.icon;
                    return (
                      <label
                        key={item.key}
                        onClick={() => togglePermission(item.key)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-amber/10 border-amber/40 shadow-xs'
                            : 'bg-white border-amber/15 hover:bg-cream-50 opacity-80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by container onClick
                          className="mt-0.5 w-4 h-4 accent-amber rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-amber" />
                            <strong className="text-chocolate font-bold text-xs">{item.label}</strong>
                          </div>
                          <p className="text-[10px] text-chocolate/70 mt-0.5">{item.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-amber/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chocolate text-honey font-bold rounded-xl shadow-xs hover:bg-chocolate-light cursor-pointer"
                >
                  {editingEditor ? 'Save Authorities' : 'Create Editor Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Change / Transfer Super Admin Modal */}
      {isSuperAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-deep/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-amber/30 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber/20 text-chocolate flex items-center justify-center font-bold">
                  <Crown className="w-5 h-5 text-amber" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-chocolate">
                    Super Admin Profile & Ownership
                  </h3>
                  <p className="text-[11px] text-chocolate/60">
                    Change primary Super Administrator credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSuperAdminModalOpen(false)}
                className="p-2 text-chocolate/60 hover:text-chocolate rounded-full hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSuperAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-chocolate mb-1">Super Admin Full Name</label>
                <input
                  type="text"
                  required
                  value={superAdminName}
                  onChange={(e) => setSuperAdminName(e.target.value)}
                  placeholder="e.g. Minora Super Admin"
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-chocolate mb-1">Super Admin Email Address</label>
                <input
                  type="email"
                  required
                  value={superAdminEmail}
                  onChange={(e) => setSuperAdminEmail(e.target.value)}
                  placeholder="admin@minora.com"
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono font-medium"
                />
                <p className="text-[10px] text-chocolate/60 mt-1">
                  This email will be granted full root privileges and master control over all editors and settings.
                </p>
              </div>

              <div>
                <label className="block font-bold text-chocolate mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={superAdminPhone}
                  onChange={(e) => setSuperAdminPhone(e.target.value)}
                  placeholder="+880 1XXXXXXXXX"
                  className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-mono"
                />
              </div>

              <div className="p-3 bg-amber/10 border border-amber/20 rounded-xl text-[11px] text-chocolate/80 space-y-1">
                <strong>💡 Automatic Database Role Assignment:</strong>
                <p>
                  To sync this email as admin in Supabase PostgreSQL, make sure to execute:
                </p>
                <code className="block p-1.5 bg-black/10 rounded font-mono text-[10px] text-chocolate">
                  SELECT public.assign_admin_role('{superAdminEmail}');
                </code>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber/15">
                <button
                  type="button"
                  onClick={() => setIsSuperAdminModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-xl font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chocolate text-honey font-bold rounded-xl shadow-xs hover:bg-chocolate-light cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-honey" />
                  <span>Update Super Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
