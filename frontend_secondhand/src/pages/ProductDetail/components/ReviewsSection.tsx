import type { Review } from "../types";

type Props = {
  reviews: Review[];
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <span key={i} className="material-symbols-outlined text-[16px]">
            {filled ? "star" : "star"}
          </span>
        );
      })}
    </div>
  );
}

export default function ReviewsSection({ reviews }: Props) {
  return (
    <div className="mt-12 lg:mt-16 max-w-4xl border-t border-border-color dark:border-white/10 pt-10">
      <h3 className="text-xl font-bold text-text-main dark:text-white mb-6">
        Đánh giá từ người mua khác ({reviews.length})
      </h3>

      <div className="space-y-6">
        {reviews.map((r) => (
          <div key={r.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {r.name.trim().slice(0, 1).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-text-main dark:text-white">{r.name}</span>
                <span className="text-xs text-gray-400">{r.timeAgo}</span>
              </div>

              <Stars value={r.rating} />

              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{r.content}</p>

              {r.images?.length ? (
                <div className="flex gap-2 mt-3">
                  {r.images.slice(0, 3).map((img) => (
                    <img key={img} src={img} alt="review" className="w-16 h-16 rounded object-cover" />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="mt-6 text-primary font-semibold text-sm hover:underline">
        Xem tất cả đánh giá
      </button>
    </div>
  );
}
