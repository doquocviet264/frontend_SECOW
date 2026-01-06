import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SellerLayout from "../components/SellerLayout";
import { reviewService, type Review } from "@/services/reviewService";
import { storeService } from "@/services/storeService";
import { useDebounce } from "@/components/hooks/useDebounce";

export default function ReviewsManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const filterRating = searchParams.get("rating") ? parseInt(searchParams.get("rating")!) : null;

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await storeService.getMyStore();
        if (response.success && response.data?.store) {
          const id = typeof response.data.store.seller === 'string' 
            ? response.data.store.seller 
            : response.data.store.seller._id;
          setSellerId(id);
        }
      } catch (error) {
        console.error("Error fetching store:", error);
      }
    };

    fetchStore();
  }, []);

  useEffect(() => {
    if (filterRating !== null) {
      setSelectedRating(filterRating);
    } else {
      setSelectedRating(null);
    }
  }, [filterRating]);

  const fetchReviews = async () => {
    if (!sellerId) return;

    setIsLoading(true);
    try {
      // Fetch all reviews for rating distribution (limit to 1000 for performance)
      const allReviewsRes = await reviewService.getSellerReviews(sellerId, {
        page: 1,
        limit: 1000,
      });

      if (allReviewsRes.success && allReviewsRes.data) {
        const allReviews = allReviewsRes.data.reviews || [];
        
        // Calculate rating distribution from all reviews
        const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        allReviews.forEach((review: Review) => {
          if (review.rating >= 1 && review.rating <= 5) {
            distribution[review.rating as keyof typeof distribution]++;
          }
        });
        setRatingDistribution(distribution);
        setAverageRating(allReviewsRes.data.averageRating || 0);
        setTotalReviews(allReviewsRes.data.totalReviews || 0);

        // Filter reviews by rating if selected
        let filteredReviews = allReviews;
        if (selectedRating !== null) {
          filteredReviews = allReviews.filter(review => review.rating === selectedRating);
        }

        // Paginate filtered reviews
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

        setReviews(paginatedReviews);
        setPagination({
          page: currentPage,
          limit: 10,
          total: filteredReviews.length,
          totalPages: Math.ceil(filteredReviews.length / 10),
        });
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error(error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sellerId, currentPage, selectedRating]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleRatingFilter = (rating: number | null) => {
    const params = new URLSearchParams(searchParams);
    if (rating !== null) {
      params.set("rating", rating.toString());
    } else {
      params.delete("rating");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100);
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Quản lý đánh giá</h1>
            <p className="text-sm text-gray-500">Xem và quản lý tất cả đánh giá của shop</p>
          </div>
        </div>

        {/* Rating Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Đánh giá trung bình</h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-black text-emerald-600">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-symbols-outlined text-2xl ${
                        star <= Math.round(averageRating)
                          ? "text-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Dựa trên {totalReviews} đánh giá
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Phân bố đánh giá</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                const percentage = getRatingPercentage(rating);
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 min-w-[80px]">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{rating}</span>
                      <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[60px] text-right">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Lọc theo:</span>
            <button
              onClick={() => handleRatingFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                selectedRating === null
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingFilter(rating)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  selectedRating === rating
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {rating} sao
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-500">Đang tải...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">
                rate_review
              </span>
              <p className="text-gray-500 font-medium">
                {selectedRating !== null 
                  ? `Không có đánh giá ${selectedRating} sao nào`
                  : "Chưa có đánh giá nào"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Customer Avatar */}
                      <div className="flex-shrink-0">
                        {typeof review.customer === "object" && review.customer.avatar ? (
                          <img
                            src={review.customer.avatar}
                            alt={review.customer.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {typeof review.customer === "object" 
                                ? review.customer.name.charAt(0).toUpperCase()
                                : "U"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {typeof review.customer === "object" 
                                  ? review.customer.name 
                                  : "Khách hàng"}
                              </h4>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`material-symbols-outlined text-sm ${
                                      star <= review.rating
                                        ? "text-amber-400"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  >
                                    star
                                  </span>
                                ))}
                              </div>
                            </div>
                            {typeof review.product === "object" && review.product && (
                              <p className="text-sm text-gray-500 mb-2">
                                Đánh giá cho: <span className="font-medium">{review.product.title}</span>
                              </p>
                            )}
                            {review.comment && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                {review.comment}
                              </p>
                            )}
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {review.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Review image ${idx + 1}`}
                                    className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => window.open(img, '_blank')}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Hiển thị {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} trong tổng số {pagination.total} đánh giá
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}

