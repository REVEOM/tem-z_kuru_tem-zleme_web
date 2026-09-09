import React, { useState } from 'react';
import { FAQS } from '../data/faqs';
import { ChevronDown } from 'lucide-react';
import { useSettings } from '../context/useSettings';

export const FaqSection: React.FC = () => {
  const { settings } = useSettings();
  const [openId, setOpenId] = useState<string | null>('f-1');

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="sss" className="py-20 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#1475bc] dark:text-[#38a3f5] uppercase tracking-wider">
            Sıkça Sorulan Sorular
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">
            Aklınıza Takılan Sorular
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2.5">
            Teslimat süresi, temizlik aşamaları ve kapıdan servis hizmetimiz hakkında merak edilenler.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-white text-sm hover:text-[#1475bc] dark:hover:text-[#38a3f5] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#1475bc] dark:text-[#38a3f5]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/60 dark:border-zinc-800 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          Başka bir sorunuz varsa bize{' '}
          <a
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 dark:text-white font-semibold underline"
          >
            WhatsApp hattımızdan
          </a>{' '}
          ulaşabilirsiniz.
        </div>

      </div>
    </section>
  );
};
