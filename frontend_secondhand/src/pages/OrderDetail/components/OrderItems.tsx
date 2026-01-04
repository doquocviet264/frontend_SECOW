import { useState } from "react";
import type { OrderDetail } from "../types";
import ReviewModal from "./ReviewModal";

type Props = {
  items: OrderDetail["items"];
  orderId: string;
  reviewInfo?: OrderDetail["reviewInfo"];
  onReviewSuccess?: () => void;
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = src && src !== "/placeholder-product.jpg" && !imageError;
  
  return (
    <div className="w-24 h-24 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center">
      {hasValidImage ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover" 
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="material-symbols-outlined text-gray-400 text-3xl">image</span>
      )}
    </div>
  );
}

export default function OrderItems({ items, orderId, reviewInfo, onReviewSuccess }: Props) {
  const [reviewingProduct, setReviewingProduct] = useState<{
    productId: string;
    productName: string;
    productImage?: string;
  } | null>(null);

  const isProductReviewed = (productId: string) => {
    return reviewInfo?.reviewedProducts?.includes(productId) || false;
  };

  const canReview = reviewInfo?.canReview || false;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg dark:text-white">Sản phẩm</h3>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
            {items.length} sản phẩm
          </span>
        </div>

        <div className="space-y-6">
          {items.map((item) => {
            const isReviewed = isProductReviewed(item.id);
            const showReviewButton = canReview && !isReviewed;

            return (
              <div key={item.id} className="flex gap-4">
                <ProductImage src={item.imageUrl || ""} alt={item.name} />

                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2">
                      {item.name}
                    </h4>
                    
                    {(item.variant || (item.tags && item.tags.length > 0)) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Variant Badge */}
                        {item.variant && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-gray-600">
                            {item.variant}
                          </span>
                        )}
                        {/* Extra Tags like "Do moi 95%" */}
                        {item.tags?.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                    <div className="text-right">
                      {item.originalPrice && (
                        <div className="text-xs text-gray-400 line-through mb-0.5">
                          {formatVND(item.originalPrice)}
                        </div>
                      )}
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatVND(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Review Button */}
                  {showReviewButton && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() =>
                          setReviewingProduct({
                            productId: item.id,
                            productName: item.name,
                            productImage: item.imageUrl,
                          })
                        }
                        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">star</span>
                        <span>Đánh giá sản phẩm</span>
                      </button>
                    </div>
                  )}

                  {/* Reviewed Badge */}
                  {isReviewed && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span className="text-sm font-semibold">Đã đánh giá</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      {reviewingProduct && (
        <ReviewModal
          orderId={orderId}
          productId={reviewingProduct.productId}
          productName={reviewingProduct.productName}
          productImage={reviewingProduct.productImage}
          onClose={() => setReviewingProduct(null)}
          onSuccess={() => {
            if (onReviewSuccess) {
              onReviewSuccess();
            }
            setReviewingProduct(null);
          }}
        />
      )}
    </>
  );
}