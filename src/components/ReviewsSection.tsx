import React from 'react';
import { REVIEWS } from '../data/reviews';
import { Star, CheckCircle2 } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="yorumlar" className="py-20 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#1475bc] dark:text-[#38a3f5] uppercase tracking-wider">
            Müşteri Yorumları
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">
            Hizmetimizi Deneyimleyenler
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-zinc-500">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">4.9 / 5</span>
            <span>(1.800+ Değerlendirme)</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex text-amber-400 gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <div>
                    <div className="font-semibold text-xs text-zinc-900 dark:text-white flex items-center gap-1">
                      {review.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1475bc] dark:text-[#38a3f5]" />
                    </div>
                    <div className="text-[11px] text-zinc-400">{review.role}</div>
                  </div>
                </div>

                <span className="text-[10px] text-zinc-500 font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                  {review.service}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
