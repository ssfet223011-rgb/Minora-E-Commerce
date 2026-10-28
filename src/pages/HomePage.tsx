import React from 'react';
import { HeroSection } from '../components/store/HeroSection';
import { ShopByCategory } from '../components/store/ShopByCategory';
import { LatestProductsSection } from '../components/store/LatestProductsSection';
import { ValuePropsStrip } from '../components/store/ValuePropsStrip';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-2">
      <HeroSection />
      <ShopByCategory />
      <LatestProductsSection />
      <ValuePropsStrip />
    </div>
  );
};
