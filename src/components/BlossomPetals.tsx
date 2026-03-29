import React from 'react';

export const BlossomPetals: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="petal w-4 h-4 left-[10%]" style={{ animationDelay: '0s', animationDuration: '12s' }}></div>
      <div className="petal w-3 h-3 left-[30%]" style={{ animationDelay: '2s', animationDuration: '15s' }}></div>
      <div className="petal w-5 h-5 left-[50%]" style={{ animationDelay: '5s', animationDuration: '10s' }}></div>
      <div className="petal w-3 h-3 left-[70%]" style={{ animationDelay: '1s', animationDuration: '18s' }}></div>
      <div className="petal w-4 h-4 left-[90%]" style={{ animationDelay: '7s', animationDuration: '14s' }}></div>
      <div className="petal w-2 h-2 left-[20%]" style={{ animationDelay: '4s', animationDuration: '11s' }}></div>
      <div className="petal w-6 h-6 left-[80%]" style={{ animationDelay: '8s', animationDuration: '16s' }}></div>
    </div>
  );
};
