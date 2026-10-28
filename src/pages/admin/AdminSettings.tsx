import React, { useState } from 'react';
import { Save, CheckCircle, Smartphone, Building2, Truck, ShieldCheck, Globe } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SiteSettings, PaymentMethod } from '../../types';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentChange = (
    method: PaymentMethod,
    field: 'accountNumber' | 'instructions' | 'accountType' | 'enabled',
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      paymentSettings: {
        ...prev.paymentSettings,
        [method]: {
          ...prev.paymentSettings[method],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-amber/15">
        <div>
          <h1 className="text-2xl font-serif font-bold text-chocolate">Storefront Configuration & Settings</h1>
          <p className="text-xs text-chocolate/70 mt-1">
            Update company info, manual payment recipient numbers, delivery charges, and policy documents.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Settings saved and applied live to storefront!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand & Contact */}
        <div className="bg-white p-6 rounded-2xl border border-amber/20 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-chocolate flex items-center gap-2 pb-3 border-b border-amber/15">
            <Globe className="w-4 h-4 text-amber" />
            <span>Brand & Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-chocolate mb-1">Brand Name</label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-chocolate mb-1">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-chocolate mb-1">Contact Phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-chocolate mb-1">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-chocolate mb-1">Office Address</label>
              <input
                type="text"
                value={form.contactAddress}
                onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
                className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Delivery Fees */}
        <div className="bg-white p-6 rounded-2xl border border-amber/20 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-chocolate flex items-center gap-2 pb-3 border-b border-amber/15">
            <Truck className="w-4 h-4 text-amber" />
            <span>Delivery Fees & Shipping Thresholds</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-chocolate mb-1">Inside City Delivery (৳)</label>
              <input
                type="number"
                min={0}
                value={form.deliveryFees.insideCity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deliveryFees: { ...form.deliveryFees, insideCity: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-bold font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-chocolate mb-1">Nationwide Delivery (৳)</label>
              <input
                type="number"
                min={0}
                value={form.deliveryFees.outsideCity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deliveryFees: { ...form.deliveryFees, outsideCity: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-bold font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-chocolate mb-1">Free Delivery Threshold (৳)</label>
              <input
                type="number"
                min={0}
                value={form.deliveryFees.freeDeliveryThreshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deliveryFees: { ...form.deliveryFees, freeDeliveryThreshold: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl font-bold font-mono text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Manual Payment Methods Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-amber/20 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-chocolate flex items-center gap-2 pb-3 border-b border-amber/15">
            <Smartphone className="w-4 h-4 text-amber" />
            <span>Manual Payment Methods & Accounts</span>
          </h2>

          {/* bKash */}
          <div className="p-4 bg-cream/30 rounded-xl border border-amber/20 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <strong className="font-bold text-pink-700">bKash Account Configuration</strong>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={form.paymentSettings.bkash.enabled}
                  onChange={(e) => handlePaymentChange('bkash', 'enabled', e.target.checked)}
                  className="accent-chocolate"
                />
                <span>Active</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-chocolate mb-1">Recipient Number</label>
                <input
                  type="text"
                  value={form.paymentSettings.bkash.accountNumber}
                  onChange={(e) => handlePaymentChange('bkash', 'accountNumber', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber/20 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-chocolate mb-1">Instructions for Customer</label>
                <input
                  type="text"
                  value={form.paymentSettings.bkash.instructions}
                  onChange={(e) => handlePaymentChange('bkash', 'instructions', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber/20 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Nagad */}
          <div className="p-4 bg-cream/30 rounded-xl border border-amber/20 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <strong className="font-bold text-orange-700">Nagad Account Configuration</strong>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={form.paymentSettings.nagad.enabled}
                  onChange={(e) => handlePaymentChange('nagad', 'enabled', e.target.checked)}
                  className="accent-chocolate"
                />
                <span>Active</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-chocolate mb-1">Recipient Number</label>
                <input
                  type="text"
                  value={form.paymentSettings.nagad.accountNumber}
                  onChange={(e) => handlePaymentChange('nagad', 'accountNumber', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber/20 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-chocolate mb-1">Instructions for Customer</label>
                <input
                  type="text"
                  value={form.paymentSettings.nagad.instructions}
                  onChange={(e) => handlePaymentChange('nagad', 'instructions', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber/20 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Rocket */}
          <div className="p-4 bg-cream/30 rounded-xl border border-amber/20 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <strong className="font-bold text-purple-700">Rocket Account Configuration</strong>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={form.paymentSettings.rocket.enabled}
                  onChange={(e) => handlePaymentChange('rocket', 'enabled', e.target.checked)}
                  className="accent-chocolate"
                />
                <span>Active</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-chocolate mb-1">Recipient Number</label>
                <input
                  type="text"
                  value={form.paymentSettings.rocket.accountNumber}
                  onChange={(e) => handlePaymentChange('rocket', 'accountNumber', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber/20 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-chocolate mb-1">Instructions for Customer</label>
                <input
                  type="text"
                  value={form.paymentSettings.rocket.instructions}
                  onChange={(e) => handlePaymentChange('rocket', 'instructions', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber/20 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="p-4 bg-cream/30 rounded-xl border border-amber/20 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <strong className="font-bold text-chocolate">City Bank Account Details</strong>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={form.paymentSettings.bank_transfer.enabled}
                  onChange={(e) => handlePaymentChange('bank_transfer', 'enabled', e.target.checked)}
                  className="accent-chocolate"
                />
                <span>Active</span>
              </label>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block font-bold text-chocolate mb-1">Bank Account & Branch Info</label>
                <input
                  type="text"
                  value={form.paymentSettings.bank_transfer.accountNumber}
                  onChange={(e) => handlePaymentChange('bank_transfer', 'accountNumber', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber/20 rounded-lg font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-right">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl text-xs shadow-warm transition-all flex items-center gap-2 ml-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
