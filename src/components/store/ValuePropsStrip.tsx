import React from 'react';
import { Leaf, Truck, ShieldCheck, Headphones } from 'lucide-react';

export const ValuePropsStrip: React.FC = () => {
  return (
    <section className="bg-cream-200 py-8 border-y border-amber/15 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Prop 1 */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-full bg-amber text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-chocolate">100% Natural Ingredients</h4>
              <p className="text-xs text-chocolate/70">Pure, organic & chemical-free</p>
            </div>
          </div>

          {/* Prop 2 */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-full bg-amber text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-chocolate">Fast & Reliable Delivery</h4>
              <p className="text-xs text-chocolate/70">Across all 64 districts in Bangladesh</p>
            </div>
          </div>

          {/* Prop 3 */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-full bg-amber text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-chocolate">Secure Payment</h4>
              <p className="text-xs text-chocolate/70">bKash, Nagad, Bank & Cash on Delivery</p>
            </div>
          </div>

          {/* Prop 4 */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-full bg-amber text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-chocolate">24/7 Customer Support</h4>
              <p className="text-xs text-chocolate/70">Dedicated assistance for your orders</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
