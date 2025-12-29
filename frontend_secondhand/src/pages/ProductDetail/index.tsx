
import ProductGallery from "./components/ProductGallery";
import ProductInfoCard from "./components/ProductInfoCard";
import SellerCard from "./components/SellerCard";
import ProductTabs from "./components/ProductTabs";
import ReviewsSection from "./components/ReviewsSection";
import type { ProductDetail, Review } from "./types";
import PageLayout from "@/components/layout/PageLayout";


const MOCK_PRODUCT: ProductDetail = {
  id: "p1",
  title: "Máy ảnh Film Canon AE-1 Program + Lens 50mm",
  price: 3500000,
  oldPrice: 4000000,
  conditionLabel: "Khá",
  isApproved: true,
  location: "TP. Hồ Chí Minh",
  postedAgo: "2 giờ trước",
  images: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCozrBP1RrT2Qb4UYlUc9vfRDEC-ExQWZgB-hQD8D7gejkcync_sxC4RPy5RLLdTjda71s6zPS9Ovq2huRTKAP5RBMYAu5cbRH4AyHOLs2CSPWbEGrFlXkuR9DG7017_XYTbeIJ-opiD0sOPjyGC1p-RqRongXMJXNtaALu12_Re0f-1FtnTCYCCgYyCP02O6JF8c-YvCgFDVYLhAiDFtYRQLZNbCj0RAkQk3B1L7Er8XC-_JrntM1rjm6lddFZnJB7cxtCvhcGfVL1",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDcCnahVHGQVa3JcgoRHRj4NdwOSaRY98VOqpMxBtb3weJxy6kLXcnKYdpKvxcJUG0NDn5UfbqWObkBiPaJRzRGR7HWVu9Ho9lybLtNfcDypujiI0-Tn8bOB2WLifHgabC4OKfwfLGYNjVwiFT-_2_wJZ9TukHgDcHJ4RXFM9wh2wfUTkrUJqR7ZP5TVuPsx-5lxecGzVK2sMr9trhhBwA1H3eIMf6pD8B4w3Z8MGBhviM34eeWO7CsJq_39YWQTfynNlaoc8wMCDPi",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAxSWMZWGRGuwOMIEEQRy-m_1TU6-pEoCnmK58dtAO22y6giAeVRtzPqoC7bXyRCKjLSURHCHJ-9gdxJyZhkbk7G1OjGhLspdbsZUqZCci-3m2e__L_4-hBGK3uyGA2q1lk-fMYfuzhL5ipp8YDgYQym1JjqkHu3CoTwqBsjILSgZAm81a4-gCYYKRhezYD5QrJdDuVGxALo3rJjYtjq_I5anzIXjRXjNVHrFuJf5amDXp1v1s7ByzWkR0mB80VzBlsj8zZRRakCk8m",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCvcq9Hk_fTv2VoTgjydJFGeMyiA8dgu_jiEajL3fR3wcrwmrXnxxFyn0jKFBCwDvGgAfgz1Hl7XBQUhAztbx1HDMmF-O-ZvYVvKKm0g0LKUSXaypV_Sw-Q55mVqb6F9awyDaWXFGO4DqfIDPlYs54W1DkrQ4kFnJ6anJGkC49GcFwZAivrbXxzjRIwPGxNv_a-2LzJiO0dhjaZi-LQZsZld042UaeoH4tO_9PCADHBIv0H4d40OvDwFA2JV1jQ-p-QIgi945TX7TGc",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCTF9R59cLhyOraKrSO75-UgSikQaJD_edkho2vTJoeKe9CONY707fA05epwtFBV79CwUcoCVyVWwTB3JBWpRbNC3QP5ngTqT4qfTHlnBR76AmFQOcJ1jkx8amtlVsZBswasYQA0gyHpPQ1X8MA1HBqtBRUYmlia-v7kXfY4GQ8jZ7HPJWmgxgqxxdISl2wERbYjC33cQL1XnZ37X2JXiLh0bHmuFUKBQiKfVKyTF8gZqQxVSTDy2lH_TxBqU2hMKUK6Es-ctdgRqOE",
  ],
  defects: [
    "Có vết xước dăm nhỏ ở đáy máy do đặt để (xem ảnh 4).",
    "Nút chụp hoạt động tốt nhưng tiếng lên phim hơi khô, cần tra dầu.",
    "Kính ngắm có vài hạt bụi nhỏ, không ảnh hưởng chất lượng ảnh.",
  ],
  description: [
    "Cần pass lại em Canon AE-1 Program màu bạc huyền thoại. Máy ngoại hình còn khá đẹp so với tuổi đời, da dẻ nguyên sần không bong tróc.",
    "Combo bao gồm: Body Canon AE-1 Program • Lens Canon FD 50mm f/1.8 • Dây đeo • Pin mới thay.",
    "Phù hợp cho các bạn mới tập chơi film hoặc sưu tầm. Mua bán tại nhà cho yên tâm.",
  ],
  specs: [
    { label: "Thương hiệu", value: "Canon" },
    { label: "Dòng máy", value: "AE-1 Program" },
    { label: "Lens", value: "FD 50mm f/1.8" },
    { label: "Tình trạng", value: "Qua sử dụng" },
    { label: "Bảo hành", value: "Test tại chỗ" },
  ],
  returnPolicy: ["Hoàn tiền trong 3 ngày nếu sản phẩm sai mô tả.", "Không hỗ trợ đổi trả nếu người mua tự làm hư.", "Ưu tiên giao dịch tại nhà để kiểm tra."],
  seller: {
    id: "s1",
    name: "Nguyễn Văn A",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbk_0kd5QSw0OipUft1e68LPZ96eVw4YxDVxmuct7YFOFVPSeM9M_F35rg0Uc8i7bGZ-OdhRxauBjy9A5KJEhmr7o--fGKsBAvhY8ak09E_Y1X-JKDPiPQuevUqUajsKSv3pH7GMxBQVW1mltLsEGT_1UAeitjGCJOCjtQQSNKzKvwF6SlUO1HBRuwJJvPlTTXu5RbqRDe4sY8qlnHsdHc1Wpud_5rBgFaYmPqJSnX8vrpREM8csq38r1xeFUe7pIoTe79yOnuhEcL",
    rating: 4.8,
    totalReviews: 128,
    responseRate: 98,
    joinedYears: 2,
    isOnline: true,
  },
};

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Trần Văn B",
    timeAgo: "1 tuần trước",
    rating: 5,
    content: "Người bán nhiệt tình, đóng gói rất kỹ. Máy đẹp như mô tả, chụp nét căng.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyU6Jtkgtz6eK-UBJ6WnzrcRWse6O5u2OFvfnAh8PRE3KdUPkTVtnvZcxofTbHrzsvqLUeWO6ISFNumpNxcgCYq_lOcJRgzWCQLLwegnnqJkbzzrQI7Y5R0VDHm_2F6MkLMlATKJczM5YQJm6XX3anOOj3t4YmZvIkBaW3Suzuqi0A7p7iUVjaTJWaJIJZvFdj-wXINQXloIP2VJ_4znXgpeWv_-gGnykm9ADqfF5MG0Bf2U1wjac726eCgypABR7R9tLPCqmD7o4b",
    ],
  },
  { id: "r2", name: "Lê Thị C", timeAgo: "1 tháng trước", rating: 4, content: "Sản phẩm ổn, giao hàng hơi chậm một chút nhưng shop hỗ trợ tốt." },
];

export default function ProductDetailPage() {
  const product = MOCK_PRODUCT;

  return (
    <PageLayout>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} />

            <div className="mt-4 p-5 rounded-xl border border-amber-200/60 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700/30">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 mt-0.5">warning</span>
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1 uppercase tracking-wider">
                    Tình trạng thực tế (Lưu ý)
                  </h3>
                  <ul className="list-disc list-inside text-sm text-amber-900/80 dark:text-amber-200/80 space-y-1">
                    {product.defects.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <ProductTabs description={product.description} specs={product.specs} returnPolicy={product.returnPolicy} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              <ProductInfoCard
                isApproved={product.isApproved}
                conditionLabel={product.conditionLabel}
                title={product.title}
                postedAgo={product.postedAgo}
                location={product.location}
                price={product.price}
                oldPrice={product.oldPrice}
                stock={1}
              />
              <SellerCard seller={product.seller} />
            </div>
          </div>
        </div>

        <ReviewsSection reviews={MOCK_REVIEWS} />
      </main>
    </PageLayout>
  );
}
