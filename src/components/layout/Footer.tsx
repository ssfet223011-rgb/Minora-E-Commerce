import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Building2, Truck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { FacebookIcon, InstagramIcon, YoutubeIcon, TwitterIcon } from '../common/SocialIcons';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-chocolate text-cream border-t-2 border-amber/30 pt-12 pb-6 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 pb-12 border-b border-amber/15">
          {/* Brand info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={settings.logoUrl || '/assets/minora-logo.png'}
                alt={settings.brandName || 'MINORA'}
                className="h-12 w-auto object-contain filter brightness-110"
              />
            </Link>
            <p className="text-sm text-cream/80 leading-relaxed max-w-sm">
              Nature’s goodness in every bite. Premium dry fruits, nuts and healthy snacks for a better you. Pure, authentic, and naturally nourishing.
            </p>
            <div className="flex items-center gap-3 pt-2 text-cream/90">
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-cream/10 hover:bg-honey hover:text-chocolate flex items-center justify-center transition-all"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-cream/10 hover:bg-honey hover:text-chocolate flex items-center justify-center transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-cream/10 hover:bg-honey hover:text-chocolate flex items-center justify-center transition-all"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-cream/10 hover:bg-honey hover:text-chocolate flex items-center justify-center transition-all"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-cream tracking-wide">Contact Us</h3>
            <ul className="space-y-3 text-sm text-cream/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-honey mt-0.5 flex-shrink-0" />
                <span>{settings.contactAddress || '123 Green Road, Chittagong, Bangladesh'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-honey flex-shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-honey transition-colors">
                  {settings.contactPhone || '+880 1838 384488'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-honey flex-shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-honey transition-colors">
                  {settings.contactEmail || 'info@minora.com'}
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Options (matching the mockup design) */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-cream tracking-wide">Payment Options</h3>
            <div className="space-y-2.5">
              {/* Bank Transfer */}
              <div className="flex items-center gap-3 p-2 bg-cream/5 rounded-lg border border-amber/15 text-xs text-cream/90">
                <div className="p-1.5 rounded bg-amber/20 text-honey">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block font-semibold text-cream">Manual Bank Transfer</strong>
                  <span className="text-[11px] text-cream/70">A/C: {settings.paymentSettings?.bank_transfer?.accountNumber || '1502938472910'}</span>
                </div>
              </div>

              {/* bKash, Nagad, Rocket grid */}
              <div className="grid grid-cols-3 gap-2">
                {/* bKash */}
                <div className="p-2 bg-pink-900/30 border border-pink-500/30 rounded-lg text-center">
                  <span className="block text-xs font-bold text-pink-300">bKash</span>
                  <span className="text-[9px] text-cream/70 block mt-0.5">Send Money</span>
                  <span className="text-[9px] text-honey font-mono">{settings.paymentSettings?.bkash?.accountNumber || '01838838488'}</span>
                </div>

                {/* Nagad */}
                <div className="p-2 bg-orange-900/30 border border-orange-500/30 rounded-lg text-center">
                  <span className="block text-xs font-bold text-orange-300">Nagad</span>
                  <span className="text-[9px] text-cream/70 block mt-0.5">Send Money</span>
                  <span className="text-[9px] text-honey font-mono">{settings.paymentSettings?.nagad?.accountNumber || '01838838488'}</span>
                </div>

                {/* Rocket */}
                <div className="p-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-center">
                  <span className="block text-xs font-bold text-purple-300">Rocket</span>
                  <span className="text-[9px] text-cream/70 block mt-0.5">Send Money</span>
                  <span className="text-[9px] text-honey font-mono">{settings.paymentSettings?.rocket?.accountNumber || '01838838488'}</span>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div className="flex items-center gap-3 p-2 bg-cream/5 rounded-lg border border-amber/15 text-xs text-cream/90">
                <div className="p-1.5 rounded bg-amber/20 text-honey">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block font-semibold text-cream">Cash on Delivery</strong>
                  <span className="text-[11px] text-cream/70">Pay conveniently at your doorstep</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & policies bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-cream/60 gap-4">
          <p>© 2026 {settings.brandName || 'MINORA'}. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-cream/70">
            <Link to="/terms" className="hover:text-honey transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-honey transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/shipping-policy" className="hover:text-honey transition-colors">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
