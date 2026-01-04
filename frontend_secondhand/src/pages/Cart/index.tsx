import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartSelectBar from "./components/CartSelectBar";
import SellerGroup from "./components/SellerGroup";
import OrderSummary from "./components/OrderSummary";
import Recommendations from "./components/Recommendations";
import type { RecommendationItem, SellerCartGroup } from "./types";
import PageLayout from "@/components/layout/PageLayout";
import { cartService } from "@/services/cartService";
import { useCart } from "@/store/cart";
import axios from "@/config/axios";


const RECS: RecommendationItem[] = [
  {
    id: "r1",
    title: "Kính mát Rayban Aviator 80s",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCUkmChGDCyzZS3LCEfH9Fk3jTe__VHqhWg4nKpb_NTLpJsk0_ssSKO81tGe1OG05TgDEgAegXm-ZOIF28kmXbjVaHXnlv6UvvtjYSiZk2Yh-MA-XRjHUR_a1EAPNbRUXYxgzQ_WVtp_IWrm2AI-oW1WvV_CM3sOzlYKxmQssZsYIQ4E0pTKVyYjlMBzbB1BRKtfOL9FenQ9wxWzt1WQcoSzrdEXOY_pGMKo49KhMqIRmMvJBI_DGG7uy0ibErLucB38HJMNAiD1AS",
    price: 350000,
    oldPrice: 600000,
  },
  {
    id: "r2",
    title: "Đầu đĩa than Sony cũ",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFVOj33D7M7sJGE_yuP-LTzz2SCbY-tn0jkSs8PNZ55R0_mzEJDxRKpxPdAfdBuGbXZibEaIn329YGFxdm_6CLs62NDEZCtJRom9NXw8jo_hoa74ckrQTrLAWRYmH1GquwNtWZhsDcWmo58-IMBTkOcGlHHoDUZrwoX3T15Py-psthMOMssj-4vl6G6CQmjshoKrZ4CLiFGiuqDX9DDeviC6rFQsZbVvnO2bDWXJj-tZXglgCwgNX5A-ke9j1JPU4Y8eBZPVKiwXan",
    price: 2100000,
  },
  {
    id: "r3",
    title: "Combo 5 sách văn học cổ điển",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuANBgTjSgJmHRipY7Tuz82A6nWhPpyEbpPj4kL9FumvF4CXdq_Mwh10nn6tcRWZid5LSzkjZ8CUEquNXXVZMW7fgEoyli3GFQ628eXJHIyCHSwsQSy9-1krDHTOlBn-LC6jvoQLiRcEi2JayQLAp1zs8o7z0YrWavfrR0yPzDBYkYml2Z1kAyJpPbK1FCJM-0DCWPMZajFZscRBYEeyXd82nsCV0INHxMcyGBwURQa1-9k2BQho4mEH__x-S7DWWQXzFqhEjpZAIavP",
    price: 150000,
    oldPrice: 250000,
  },
  {
    id: "r4",
    title: "Giày Nike Air Max 97 (Size 42)",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDa3lr6WRLfOwpdGrtYsL3aU5HGEvIldGKgOV2dr-EWdLKdo-GoMh-oAORYjK3XENSb2cMu4Z_qnCS5ZIC89xxn3USyDj2jDlmiO0cHREPvOT5D-uH8ymjH3ltT_CJBNExjVS1eftiMwX6JiIS5ndRUiqWB0S_UDBvymmlkMNnHYEiZ0C-dx4z8UulVLMnlATyx5VKK2Fa5Puh5F075ZZLzipW-UkmuRtxJz-hZz0y5I1WQ3wwmfj7etWc6TJosJrfMEO4f2lXIhPrd",
    price: 950000,
    oldPrice: 3000000,
  },
  {
    id: "r5",
    title: "Đồng hồ Seiko 5 Automatic",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRTdA3GKcGcQjV8HX71os2mWqwOql1mJEg-9y7L2jlPMCjcw6Q13HPSGiKXV0nhPOqKPuAECT6uZYT4YhXs5f8OqSXcW3BuVaqrIHoOk55Q87JJGe3BphNqAsWdVVn579fAeBvgT5VMsBQpgoplsfayyV0SD84vnUzPyNkOTybqFHzUI1Vb1OCyr-ppZltqK7OKOTEq2suXZmW50EM_ITACZiTXWtUG0BPkbFjLSkVYP89aFEj1-lbbcSpbV04YXX9IE6Vmgdrd9El",
    price: 1800000,
  },
];

export default function CartPage() {
  const [groups, setGroups] = useState<SellerCartGroup[]>([]);
  const { cartCount, refreshCart } = useCart();
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await cartService.getCart();
      const apiItems = res?.data?.cart?.items || [];
      if (apiItems.length === 0) {
        setGroups([]);
        return;
      }
      // Fetch seller info for each product to group by seller
      const uniqueProductIds = Array.from(new Set(apiItems.map((i) => i.product?.id).filter(Boolean))) as string[];
      const productMap = new Map<string, { sellerId: string; sellerName: string }>();
      await Promise.all(
        uniqueProductIds.map(async (pid) => {
          try {
            const res = await axios.get(`/v1/products/${pid}`);
            const prod = res.data?.data?.product || res.data?.data || res.data;
            const sellerId = prod?.sellerId || prod?.seller?._id || "";
            const sellerName = prod?.sellerName || prod?.seller?.storeName || "Người bán";
            if (sellerId) productMap.set(pid, { sellerId, sellerName });
          } catch {
            // ignore individual failures
          }
        })
      );

      const sellerIdToGroup: Record<string, SellerCartGroup> = {};
      for (const it of apiItems) {
        const pid = it.product?.id || "";
        const sellerInfo = pid ? productMap.get(pid) : undefined;
        const sellerId = sellerInfo?.sellerId || "unknown";
        const sellerName = sellerInfo?.sellerName || "Người bán";

        if (!sellerIdToGroup[sellerId]) {
          sellerIdToGroup[sellerId] = {
            id: sellerId,
            name: sellerName,
            verified: false,
            checked: false,
            items: [],
          };
        }

        sellerIdToGroup[sellerId].items.push({
          id: it.id,
          productId: it.product?.id || "",
          title: it.product?.title || "Sản phẩm",
          imageUrl: it.product?.image || "",
          price: it.product?.price || 0,
          stock: it.product?.stock || 0,
          quantity: it.quantity || 1,
          checked: false,
        });
      }

      setGroups(Object.values(sellerIdToGroup));
    } catch {
      setGroups([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, [cartCount]);

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const totalCount = allItems.length;

  const allChecked = totalCount > 0 && allItems.every((i) => i.checked);

  const selectedItems = allItems.filter((i) => i.checked);
  const totalItemsSelected = selectedItems.reduce((s, i) => s + i.quantity, 0);

  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = 0;

  const syncSellerChecked = (next: SellerCartGroup[]) =>
    next.map((g) => ({
      ...g,
      checked: g.items.length > 0 && g.items.every((it) => it.checked),
    }));

  const toggleAll = () => {
    const nextChecked = !allChecked;
    const next = groups.map((g) => ({
      ...g,
      checked: nextChecked,
      items: g.items.map((it) => ({ ...it, checked: nextChecked })),
    }));
    setGroups(next);
  };

  const toggleSeller = (sellerId: string) => {
    const next = groups.map((g) => {
      if (g.id !== sellerId) return g;
      const nextChecked = !g.checked;
      return { ...g, checked: nextChecked, items: g.items.map((it) => ({ ...it, checked: nextChecked })) };
    });
    setGroups(syncSellerChecked(next));
  };

  const toggleItem = (itemId: string) => {
    const next = groups.map((g) => ({
      ...g,
      items: g.items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it)),
    }));
    setGroups(syncSellerChecked(next));
  };

  const inc = async (itemId: string) => {
    const current = groups.flatMap((g) => g.items).find((it) => it.id === itemId);
    if (!current) return;
    const nextQty = Math.min(current.quantity + 1, current.stock);
    if (nextQty === current.quantity) return;
    await cartService.updateItemQuantity(itemId, nextQty);
    await loadCart();
  };

  const dec = async (itemId: string) => {
    const current = groups.flatMap((g) => g.items).find((it) => it.id === itemId);
    if (!current) return;
    const nextQty = Math.max(current.quantity - 1, 1);
    if (nextQty === current.quantity) return;
    await cartService.updateItemQuantity(itemId, nextQty);
    await loadCart();
  };

  const deleteSelected = async () => {
    const selectedIds = groups.flatMap((g) => g.items.filter((it) => it.checked).map((it) => it.id));
    if (selectedIds.length === 0) return;
    try {
      await cartService.removeItems(selectedIds);
    } finally {
      await refreshCart();
      await loadCart();
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await cartService.removeItem(itemId);
    } finally {
      await refreshCart();
      await loadCart();
    }
  };

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-10 py-6">
        <div className="flex flex-wrap justify-between gap-3 pb-6 border-b border-[#e7f3eb] dark:border-white/10 mb-6">
        <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-text-main dark:text-white tracking-tight text-3xl font-bold leading-tight">
            Giỏ hàng <span className="text-primary">({totalCount})</span>
            </h1>
            <p className="text-text-secondary dark:text-slate-400 text-sm font-normal leading-normal">
            Kiểm tra lại các món đồ second-hand cực chất bạn đã chọn.
            </p>
        </div>
        </div>
        {totalCount === 0 ? (
          <div className="w-full py-14 text-center">
            <div className="mx-auto max-w-xl border border-primary/40 rounded-lg p-6">
              <p className="text-text-secondary dark:text-slate-400 text-base">
                Giỏ hàng đang trống
              </p>
              <p className="text-text-main dark:text-white text-base font-semibold mt-1">
                ẤN MUA NGAY ĐỂ NHẬN NHIỀU ƯU ĐÃI!
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex h-10 px-5 items-center justify-center rounded-md bg-primary text-black font-medium hover:opacity-90 transition"
              >
                Mua hàng
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <CartSelectBar total={totalCount} allChecked={allChecked} onToggleAll={toggleAll} onDeleteSelected={deleteSelected} />

              {groups.map((g) => (
                <SellerGroup
                  key={g.id}
                  group={g}
                  onToggleSeller={toggleSeller}
                  onToggleItem={toggleItem}
                  onInc={inc}
                  onDec={dec}
                  onRemove={removeItem}
                  onChat={(sellerId, sellerName) => {
                    navigate(`/chat?with=${sellerId}&name=${encodeURIComponent(sellerName)}`);
                  }}
                  onOpenProduct={(pid) => navigate(`/products/${pid}`)}
                />
              ))}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                totalItems={totalItemsSelected}
                disabled={totalItemsSelected === 0}
                disabledNote="Vui lòng chọn ít nhất 1 sản phẩm trước khi thanh toán."
                onCheckout={() => {
                  const selectedIds = selectedItems.map((i) => i.id);
                  sessionStorage.setItem("checkoutSelectedItemIds", JSON.stringify(selectedIds));
                  navigate("/checkout");
                }}
              />
            </div>
          </div>
        )}

        <Recommendations items={RECS} />
      </div>
    </PageLayout>
  );
}
