import { useMemo, useState } from "react";
import CartHeader from "./components/CartHeader";
import CartSelectBar from "./components/CartSelectBar";
import SellerGroup from "./components/SellerGroup";
import OrderSummary from "./components/OrderSummary";
import Recommendations from "./components/Recommendations";
import type { RecommendationItem, SellerCartGroup } from "./types";
import PageLayout from "@/components/layout/PageLayout";
const MOCK_GROUPS: SellerCartGroup[] = [
  {
    id: "s1",
    name: "VintageStoreVN",
    verified: true,
    checked: true,
    items: [
      {
        id: "i1",
        title: "Áo khoác Denim Vintage thập niên 90 - Size L",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDC5wJxZd7ra7CXVUFrsjcMO2wDekukamtDpAD5vtzO5_I0YafBUUhoFPxscY4KQETejOulVtelfg1X-tmhPUl7Qe4OloAy6eZI5tGListuyqmgF3eA8Lg3tksOH6_cxqRJgHNcdXY8l_wy-x4jx8oyaODTuaKWMxC52lUhD5rsCHJ1-jMJy7TY33soOOKh_AQfcPj8zzFwCSAfvtpsr5vKp6ePE8acKPIui2_Y684af7VDIXdRrShbk38hX7_vf98DxbW2_J18cb5X",
        oldPrice: 450000,
        price: 250000,
        color: "Xanh nhạt",
        size: "Size L",
        stock: 1,
        quantity: 1,
        checked: true,
        conditionTag: { label: "Like New", tone: "green" },
      },
      {
        id: "i2",
        title: "Túi đeo chéo da thật Handmade",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA7aLdE3kxoGqf7idfmuuaRDMTv2c4KShRyMBbK_yUK57XSBdyXcC7X-omyODyb9sTvUbmR8SKfPyUFggTM6kZQ7l-wg0q3jVVSpTOCrRkj8ZTjiEQ2-awnrtYLYrh0Rb6HuhQyHNn9g7RCgthGANvwMeTx8DLbbSXTiPTfu-oyf24bWjOmNgMzHPOEPgxBWCqWW3-b9_ECVYi7J6MsWpoqtzOT2MujwJ5xYf4TxifQZTUbP3sjuCOIP_omH-EWCE6cHI8z0eMOotXl",
        oldPrice: 800000,
        price: 450000,
        color: "Nâu bò",
        stock: 1,
        quantity: 1,
        checked: true,
        conditionTag: { label: "Good Cond", tone: "yellow" },
      },
    ],
  },
  {
    id: "s2",
    name: "RetroHolic",
    verified: false,
    checked: true,
    items: [
      {
        id: "i3",
        title: "Máy ảnh Film Canon AE-1 (Body only)",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCf6l8cmtnPuk_2S_yrHquwxrPKIUOONdydoEEsQLeipPw-HsqV1t-tnqZgXz4XUkoivdt4oE5SCe3Ek2S4EK38fV0tUSi4VewWh6Hlg_lRq5xJ9HC8bT2xBOoMoR0n6uqkfFQSTh6bolihnPt5Qtua4gpJ7jfUbgQYtS7n-Xy-WrUH4rbA9SUBtbT69_T0t3ALpN30Vx3LbNPPURwz2xGWt_EtdvBdFbTQ0l9P6nkzEQ9mGzy6L4fmVpVPJ6lRpAO0wQTe-_OJrzwo",
        oldPrice: 1500000,
        price: 1200000,
        color: "Bạc/Đen",
        stock: 1,
        quantity: 1,
        checked: true,
        conditionTag: { label: "Slight Defect", tone: "red" },
      },
    ],
  },
];

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
  const [groups, setGroups] = useState<SellerCartGroup[]>(MOCK_GROUPS);

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

  const inc = (itemId: string) => {
    const next = groups.map((g) => ({
      ...g,
      items: g.items.map((it) => {
        if (it.id !== itemId) return it;
        if (it.quantity >= it.stock) return it;
        return { ...it, quantity: it.quantity + 1 };
      }),
    }));
    setGroups(next);
  };

  const dec = (itemId: string) => {
    const next = groups.map((g) => ({
      ...g,
      items: g.items.map((it) => {
        if (it.id !== itemId) return it;
        if (it.quantity <= 1) return it;
        return { ...it, quantity: it.quantity - 1 };
      }),
    }));
    setGroups(next);
  };

  const deleteSelected = () => {
    const next = groups
      .map((g) => ({ ...g, items: g.items.filter((it) => !it.checked) }))
      .filter((g) => g.items.length > 0);
    setGroups(syncSellerChecked(next));
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
              />
            ))}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <OrderSummary subtotal={subtotal} discount={discount} totalItems={totalItemsSelected} />
          </div>
        </div>

        <Recommendations items={RECS} />
      </div>
    </PageLayout>
  );
}
