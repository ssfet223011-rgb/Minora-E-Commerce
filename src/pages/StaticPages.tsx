import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, ShieldCheck, Heart, Leaf } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-dark font-bold">Our Philosophy</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-chocolate mt-1">
            MINORA – Pure • Natural • Healthy
          </h1>
          <p className="text-sm text-chocolate/70 mt-2">
            Committed to bringing the purest gifts of nature straight to your family's table.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-amber/20 shadow-warm space-y-8 text-sm leading-relaxed text-chocolate/80">
          <div className="flex items-center gap-4 p-4 bg-cream/50 rounded-2xl border border-amber/15">
            <Leaf className="w-8 h-8 text-amber flex-shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-chocolate text-base">From Earth to Everyday Nourishment</h3>
              <p className="text-xs text-chocolate/70">
                Pure foods cultivate true vitality. We never process, heat, or bleach our harvest.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-chocolate">The MINORA Story</h2>
            <p>
              MINORA was founded on a simple yet uncompromising standard: food should nourish, not harm. In an era where dry fruits and snacks are often treated with synthetic sulfur dioxide, artificial preservatives, and industrial glucose syrups, MINORA stands as a sanctuary of authentic purity.
            </p>
            <p>
              We partner directly with sustainable, ethical growers from the almond orchards of California to the ancient date palms of Medina and the wild mangrove blossoms of the Sundarbans. Each batch of nuts and seeds is hand-sorted and sealed under airtight hygiene controls.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-amber/15">
            <div className="p-4 bg-cream/40 rounded-xl text-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-amber mx-auto" />
              <h4 className="font-serif font-bold text-chocolate">100% Unadulterated</h4>
              <p className="text-xs text-chocolate/60">No added sugars, artificial colors, or chemicals.</p>
            </div>
            <div className="p-4 bg-cream/40 rounded-xl text-center space-y-2">
              <Heart className="w-6 h-6 text-amber mx-auto" />
              <h4 className="font-serif font-bold text-chocolate">Nutrient Dense</h4>
              <p className="text-xs text-chocolate/60">Rich in vital micronutrients, minerals, and enzymes.</p>
            </div>
            <div className="p-4 bg-cream/40 rounded-xl text-center space-y-2">
              <Leaf className="w-6 h-6 text-amber mx-auto" />
              <h4 className="font-serif font-bold text-chocolate">Ethically Sourced</h4>
              <p className="text-xs text-chocolate/60">Fair pricing for farmers and sustainable harvesting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setMsg('');
  };

  return (
    <div className="py-12 bg-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-amber-dark font-bold">Get In Touch</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-chocolate mt-1">Contact MINORA</h1>
          <p className="text-sm text-chocolate/70 mt-2">
            We are here to answer your questions regarding our natural products, orders, or corporate gifts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info Card */}
          <div className="bg-chocolate text-cream rounded-3xl p-8 border border-amber/20 shadow-warm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-cream">Customer Care</h2>
            <p className="text-sm text-cream/80 leading-relaxed">
              Our support team is available Saturday through Thursday, 9:00 AM to 9:00 PM.
            </p>

            <ul className="space-y-4 text-sm text-cream/90 pt-4 border-t border-amber/15">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-honey flex-shrink-0 mt-0.5" />
                <span>{settings.contactAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-honey flex-shrink-0" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-honey flex-shrink-0" />
                <span>{settings.contactEmail}</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-8 border border-amber/20 shadow-warm">
            {submitted ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-chocolate">Message Received!</h3>
                <p className="text-xs text-chocolate/70">
                  Thank you for reaching out. A MINORA customer specialist will reply within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-cream text-chocolate text-xs font-bold rounded-full hover:bg-cream-300 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-chocolate mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="How can we assist you today?"
                    className="w-full px-3 py-2 bg-cream-50 border border-amber/20 rounded-xl text-xs text-chocolate focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-chocolate hover:bg-chocolate-light text-honey font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const { settings } = useSettings();
  return (
    <div className="py-12 bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-amber/20 shadow-warm space-y-6 text-sm text-chocolate/80 leading-relaxed">
          <h1 className="font-serif text-3xl font-bold text-chocolate pb-4 border-b border-amber/15">
            Terms & Conditions
          </h1>
          <p>{settings.policies?.terms}</p>
          <h3 className="font-serif text-lg font-bold text-chocolate pt-2">1. Orders & Pricing</h3>
          <p>
            All products are subject to seasonal availability. MINORA reserves the right to cancel or amend orders where pricing errors or inventory constraints occur.
          </p>
          <h3 className="font-serif text-lg font-bold text-chocolate pt-2">2. Payment Verification</h3>
          <p>
            Manual mobile payments (bKash, Nagad, Rocket, Bank Transfer) must be verified against actual bank records before dispatch. Orders with unverifiable references may be held or cancelled.
          </p>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  const { settings } = useSettings();
  return (
    <div className="py-12 bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-amber/20 shadow-warm space-y-6 text-sm text-chocolate/80 leading-relaxed">
          <h1 className="font-serif text-3xl font-bold text-chocolate pb-4 border-b border-amber/15">
            Privacy Policy
          </h1>
          <p>{settings.policies?.privacy}</p>
          <h3 className="font-serif text-lg font-bold text-chocolate pt-2">Information We Collect</h3>
          <p>
            We collect recipient names, delivery addresses, phone numbers, and payment verification references exclusively for order fulfillment and customer service. We do not sell or disclose customer data.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => {
  const { settings } = useSettings();
  return (
    <div className="py-12 bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-amber/20 shadow-warm space-y-6 text-sm text-chocolate/80 leading-relaxed">
          <h1 className="font-serif text-3xl font-bold text-chocolate pb-4 border-b border-amber/15">
            Shipping & Return Policy
          </h1>
          <p>{settings.policies?.shipping}</p>
          <h3 className="font-serif text-lg font-bold text-chocolate pt-2">Returns & Exchanges</h3>
          <p>{settings.policies?.refund}</p>
        </div>
      </div>
    </div>
  );
};
