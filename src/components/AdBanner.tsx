import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { isNative } from '../lib/native';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';

export const AdBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [adContent, setAdContent] = useState({ title: '', desc: '', cta: '' });
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setIsPremium(docSnap.data().isPremium || false);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (isPremium) {
      if (isNative) {
        AdMob.hideBanner().catch(console.error);
      }
      return;
    }

    if (isNative) {
      // Native AdMob Banner
      AdMob.showBanner({
        adId: 'ca-app-pub-3940256099942544/6300978111', // Test Ad Unit ID
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 70, // Offset for the bottom nav bar
        isTesting: true
      }).catch(console.error);

      // We don't need to render the web banner if native is showing
      setIsVisible(false);
      
      return () => {
        AdMob.hideBanner().catch(console.error);
      };
    } else {
      // Mock different ads for web
      const ads = [
        { title: "Blossom Premium", desc: "Unlock deeper insights and remove all ads.", cta: "Upgrade Now" },
        { title: "Flo Vitamins", desc: "Support your cycle with natural ingredients.", cta: "Shop Now" },
        { title: "Cozy Heating Pad", desc: "Relieve cramps instantly. 20% off today!", cta: "Buy Now" }
      ];
      setAdContent(ads[Math.floor(Math.random() * ads.length)]);
    }
  }, [isPremium]);

  if (!isVisible || isPremium || isNative) return null;

  return (
    <div className="w-full bg-[var(--color-bg-card)] border-t border-[var(--color-border-light)] p-3 relative flex items-center shadow-sm transition-colors duration-300 z-40">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)]"
      >
        <X className="w-3 h-3" />
      </button>
      
      <div className="flex flex-col flex-1 mr-4">
        <span className="text-[8px] uppercase tracking-wider text-[var(--color-text-muted)] mb-0.5 font-semibold">Advertisement</span>
        <h4 className="text-sm font-bold text-[var(--color-text-dark)] leading-tight">{adContent.title}</h4>
        <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{adContent.desc}</p>
      </div>
      
      <button className="bg-[var(--color-rose-primary)] text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[var(--color-rose-dark)] transition-colors">
        {adContent.cta}
      </button>
    </div>
  );
};
