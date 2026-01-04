import { useState } from "react";
import { reviewService, type CreateReviewPayload } from "@/services/reviewService";

type Props = {
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ReviewModal({
  orderId,
  productId,
  productName,
  productImage,
  onClose,
  onSuccess,
}: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateReviewPayload = {
        orderId,
        productId,
        rating,
        comment: comment.trim() || undefined,
      };

      const response = await reviewService.createReview(payload);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Không thể tạo đánh giá");
      }
    } catch (err: any) {
      console.error("Error creating review:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Có lỗi xảy ra khi tạo đánh giá";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Đánh giá sản phẩm
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Product Info */}
        <div className="flex gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {productName}
            </h4>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Đánh giá của bạn
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <span
                    className={`material-symbols-outlined text-4xl ${
                      star <= rating
                        ? "text-amber-400 filled"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {rating === 5 && "Rất hài lòng"}
              {rating === 4 && "Hài lòng"}
              {rating === 3 && "Bình thường"}
              {rating === 2 && "Không hài lòng"}
              {rating === 1 && "Rất không hài lòng"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
            >
              Nhận xét (tùy chọn)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={5}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 ký tự
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

