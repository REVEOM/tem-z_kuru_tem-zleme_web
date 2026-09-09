import React from 'react';

interface MobileAppCategoriesProps {
  onSelectCategory: (category: string) => void;
  onTriggerFoam: () => void;
}

export const MobileAppCategories: React.FC<MobileAppCategoriesProps> = ({
  onSelectCategory,
  onTriggerFoam
}) => {
  const categories = [
    { id: 'foam', label: 'Köpürt!', icon: '🫧', isAction: true, badge: 'Özel' },
    { id: 'erkek', label: 'Kuru Temizleme', icon: '🧺', isAction: false },
    { id: 'utu', label: 'Buharlı Ütü', icon: '👔', isAction: false },
    { id: 'ev', label: 'Ev & Tekstil', icon: '🛏️', isAction: false },
    { id: 'deri', label: 'Deri & Lostra', icon: '👞', isAction: false },
    { id: 'tadilat', label: 'Terzi & Tadilat', icon: '🧵', isAction: false },
  ];

  return (
    <div className="lg:hidden px-3 pt-3 pb-2 overflow-x-auto scrollbar-none bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80">
      <div className="flex items-center gap-3 w-max">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              if (cat.isAction) {
                onTriggerFoam();
              } else {
                onSelectCategory(cat.id);
              }
            }}
            className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group active:scale-95 transition-transform"
          >
            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition-colors ${
              cat.isAction
                ? 'bg-gradient-to-tr from-[#1475bc] to-[#2995e6] text-white shadow-[#1475bc]/30 ring-2 ring-[#1475bc]/40 animate-pulse'
                : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-700/80 group-hover:border-zinc-400'
            }`}>
              <span>{cat.icon}</span>
              {cat.badge && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[8px] font-extrabold uppercase">
                  {cat.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 text-center whitespace-nowrap max-w-[64px] truncate">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
