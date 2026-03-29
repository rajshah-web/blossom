import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const InlineAd: React.FC = () => {
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
    const ads = [
      { title: "Blossom Premium", desc: "Unlock deeper insights and remove all ads.", cta: "Upgrade Now" },
      { title: "Flo Vitamins", desc: "Support your cycle with natural ingredients.", cta: "Shop Now" },
      { title: "Cozy Heating Pad", desc: "Relieve cramps instantly. 20% off today!", cta: "Buy Now" }
    ];
    setAdContent(ads[Math.floor(Math.random() * ads.length)]);
  }, []);

  if (isPremium) return null;

  return (
    <div className="bg-[var(--color-bg-chip)] p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 text-center space-y-2 border border-[var(--color-border-light)] shadow-sm">
      <div className="absolute top-2 right-2 bg-black/10 dark:bg-white/20 text-[var(--color-text-dark)] text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">Ad</div>
      <h4 className="text-md font-bold text-[var(--color-text-dark)] mt-2">{adContent.title}</h4>
      <p className="text-sm text-[var(--color-text-muted)]">{adContent.desc}</p>
      <button className="mt-2 bg-[var(--color-rose-primary)] text-white text-xs font-medium px-5 py-2 rounded-full hover:bg-[var(--color-rose-dark)] transition-colors shadow-sm">
        {adContent.cta}
      </button>
    </div>
  );
};
