import HeroSection from "./components/HeroSection";
import TrustIndicators from "./components/TrustIndicators";
import CategoryGrid from "./components/CategoryGrid";
import ProductSection from "./components/ProductSection";
import PromoBanners from "./components/PromoBanners";
import PageLayout from "@/components/layout/PageLayout";
import type { Category, Product } from "@/pages/Home/types";

const HERO_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC1jeNG2o6ecxLa6uNq7NQ_Ey2nz51U8DPTERs1fAx4406S26ekSGKyaCnm422axLpVII78BT8_bHFKCVuC3tG1OOPwWHBUldtCWYuqD5AQHbKasXZs1gRjaSxt4dTSedFsVeq-xGkwhXbo9RCEfx5O7te5hi9A0yUI5EK5vsHZr280xA0x1I5UCYOLhQ8j-nPO-71mHT57djKkECSbKvX7kcxTcu5pncwSEFaegQwvVKpiJmr8fQT6c9I9pjMdUur4Rb-40iIuf3i5';

const CATEGORIES: Category[] = [
  { name: "Thời trang", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtG54_zrrGhAcscxQKyPQbY0QtFY_pzdxGSVMMuaJhgHWHeSP8N3e4voMB3wLc3aTReeEa6fgtNlDj8NpkbiBrl_R7Tf97ebZOTAsZLgAXPyvVTH-TB2bQzkhN_t7xFQJwwqZduMvK_9l17cUd5AHVWm4qQcwnrF1mzi3vPBwKLQzmXDcZxP-oT5zbCD3Q0nTokG24uASU1Jf8yXmdBb9XWqFYBl2PVBt4f9IMX_m0uuIB5gJGJjFNBu1iwG7nwT3SA3QjdvgGwEj3" },
  { name: "Đồ điện tử", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAe3USCfcW4YBgnL9tDNVHC5W0dYxK-P-OQwyTsXTinU9k_yLIQGRJP5ACnLP0anM2guank-pvKf5jgwZXCk3lBhnuJc34ZRXhGfhc6SKmLRyC_aiSabS7DiVilrhNLFMmMkWEYXl-RUTJ4y4roQ-bouZryhkY_mzr3F6B1Hn7-SvTg-guvbvrxs9fevNWXzMIButFvKoV7CqKa6hEF_9jWEDO7ivjoyNqsB8P0xlgDYM35INwrUIq2ZBFXcuNQcFfLUXqrhhrxPTO6" },
  { name: "Nội thất", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_IHVhQaZiEn9s4L2nDsNsc9PcXOZhUY4OCCWvq9xKwk-jrWvaUQYDJpU7E0sO5-pN4xrAm9mxTzvuEby7XLU4N5wqJm5u01ggfq8ei9zP_ZHQmngMMIUQP-TVmrOgg-2J14bTZE1QW4aFJ8K6No-iSHuSM8ZpFIC9A7p3tgKTPMFXI29WMF_ZFH2M6WMTxyWYf9NPUosoFrXH9SmZAGfKrkLRWPTKFLQHuo4MO3eMJHpWUFgz9nxZV9SWsAwmnM0E-B3UjZsCMRyj" },
  { name: "Sách cũ", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2Rt9vIJUACmzmVJXmGIqclnflfoP3dRGK4oXN3ZXoDpay2o7fwnvM5xeCyTkLu2p00HpbN60UJU9dnMi4Ia-QOO-i4QmG29BMaEEKWBn10vkmTDQrc_VkBynm-t0RT_qmZ5CbKuQxuMhQAbvZUeJXR3S1UjCoiVrxKjbXUqNAz-TRWhH1M_r5mDhkTvTVLDGAHdRI6hZZnlaI2bEqGr-6DcWqyRq9jv257zte0OrjsT5Xx-YT-sp7kRZi6MX4HEdtjREpycxii7K8" },
  { name: "Xe cộ", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoWAakigotuJ2Rw-nvtC9wp9M8BU4gogcUFCHvGc8zNuTIQjXd0m4zZKgT-s10sze72IDnBEfHgbml0zrKnT1xdT19A2z2RKBSvjAhDMB-ztyfqyGZCpsVew3rZnJtLzPuiIkhezS9Yf9K6khOHlQUN5OVSxoNgtKJe3uNGevBm4PsuyNUx1qhi_07ks6YGO_cBChI89HAi9Y6HcWTkzL0WdloBHfAAX03xd0okNW8gwyaaoh2qb1CKUI76f5_LO8Kg-wXdXgxT7ES" },
  { name: "Mẹ & Bé", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWwWZW_FXbM72L1CfEZMikz0k9Cu86BZrS9bFlRnqER_QpJA_SHK67QqMluleyYXaKi3iTI1wdisZRBZVhfe4Aa6DX3EmsJFnOgeyAlGOeflsqdPwJuIQCuUtF6eGgIldGQ2gr8a9NKglyhxWr5J2J4HCyorXUD5UcbHWZJ3LXSWtCkbHSgVyqXW6RM0gGK2pZQOqsGbdJdcHj6H5dvhgHiYgp6cCR2ANmhYIG8xRtQluw-QwOSW36uHde_CPCxU_CJ7NjQtJX8O7e" },
];

const JUST_LISTED: Product[] = [
  { title: "Đồng hồ thông minh Smart Watch S8 cũ, còn bảo hành", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZmQvXZQaDHCmV6GRGaERp3mDFfjo-iFN3lCMVFjhDH1hGFYwBiGPdw0gXxfmyrIOa6aVXwfevdE9NPJdrsyT3fpgVYiRmGv6hdEG7FnyPw8UCWUMDdUQut-7P5qINYm3ibEwM0HD3KBy3ky76H-az9p2x4uMHPNZdY0VCg2pyITRCjatVhZ_ypW9_WKO3IcHr9wMX7OGEkbUay3wlci6JJmHB75mg3rF02htchDjIRQ47lVoDY-GdhnYh8F1bMjI2CgMLD8i95zr7", price: "850.000₫", location: "Hà Nội", timeAgo: "15 phút trước", badge: "Like New" },
  { title: "Giày Nike Air Max đỏ size 42, chính hãng", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5YGYtwzGn4dOkL0HPazI7uRZbsGFvT1S8BnP6xEejaf-dgyODBmxALo1FyVJj7rxuefgSusKUVRf3QYi0jtkO38n1e9TmW0DU6ugInVBFRu3Wadkk7gwrieP8Hn6gGQSDspfKOxqqjuihBn77vxOCLanzq5ASZL3tHPym9JXkMjhxQvygCsaHVZeZkdF1OUMXEBuUQXLsBrBo-9j5BTkBwEDR805AfW6c5tkAzBQgfU1YGplwtwHMn5hGnxF_vHbEcJExtDPL8nOW", price: "1.200.000₫", location: "TP. HCM", timeAgo: "1 giờ trước", badge: "95%" },
  { title: "Dell XPS 13 i7 Ram 16GB, máy văn phòng", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3B2b8CSzsWqnzOjwYHtKhVE2CNUnoK1K4FcfySB3n3uiH05x3I8yZGghURNomNRYKb9MHC5jLPvzlnd_t9fw5PM8nbfkwe1mwTwU6bFONTr9_7OebRPHqwj5wPcHPccCPqw2i2vhxwz-1O_RM9GJyTW9Tor2RJohYPKXXvsgF2XcPEy9xk_mIG9KTBNGOu53pIJCrBu3NngHPtiFCSJqJ1BuG3kzcYPlip4gEtUAx6BP0leWQTASoLBXnOLeGDJurgelv0xuvers7", price: "15.500.000₫", location: "Đà Nẵng", timeAgo: "3 giờ trước", badge: "90%" },
  { title: "Máy ảnh Film Canon AE-1 Program lens 50mm", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFWEeqsIv2KtVC-uz1HCM6t2JXa5MHZpeBVtRAwtIKjcipalsuJCOM4JaMVX-w1wd8DD7_NGK_mROrFvy8NmeFlbyo-avhGCxlG3J-twRYjYDY5JEyHmJIpESDPkNLYAcCVyl8to-G_L4lH4mdioO2CL-q3tA3X7gMm9n2tv-WcZR7aobwn3cN8eN2HOG49l0HPY_zCrI2ei_cHwJtbr93hSe4VWDZ-_gIn7REk6wJhMxS58pwjvmfhPyg4DtqeOAgONV7CwRbd7Z9", price: "3.200.000₫", location: "Hà Nội", timeAgo: "4 giờ trước", badge: "Sưu tầm" },
  { title: "Sofa vải nỉ màu xám, dùng 1 năm pass lại", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAERuEsTzTzPxiWtZfASNJtJZCShHxB7qOTi9X3tCxo49HuX18D-Chn1wWj49WeDGyYwDQ3s1ASmKLfbg62oAlX6Nu1CLQpU3VKu8uiR8cCTj2aPox42irPIslGtOmP5XzebqF7LHfR_rhcB-2i1JlIOReYXsLBWoL9-QbjGUald7pN4wXgKUWRG90wMwPq6ZiJNR741o0tdlH4fmBKIIg5c9DoFPRlswkpIRGcXqm0CU51w3Ms3KtIevnHt73Sg3kIZBJFFdeMits", price: "2.500.000₫", location: "TP. HCM", timeAgo: "5 giờ trước", badge: "80%" },
];

const BANNERS = [
  {
    title: "Thời trang 2hand",
    desc: "Săn hàng hiệu giá rẻ, phong cách vintage độc đáo.",
    cta: "Khám phá ngay",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDes2gyIE3OsEtt5XoSECALYdVvnuYMAJUqOAzkDxyqekTRhYbvLaDYU0jENshCog3Dqyis7ChT6Q1kWmHi89THgYVJZ-9M_9IaYyQy7i1CpevxbNpdm-gQObXPczEfP7aVKahFMDelgZx5IXIfq9-Xzb5Y4-smGj2kVihDxtQsjNQKkFhQbtZ1KmKt7zSGal1ZRv1MIREWv35FmlNJ-FZYhD0nwIFKmRCd0-ZdWgdYE5J5NmGfuQfXeraweSTz1TnhjD6_mNLod3yy",
  },
  {
    title: "Thanh lý Đồ công nghệ",
    desc: "Điện thoại, Laptop, Phụ kiện giá tốt mỗi ngày.",
    cta: "Xem ngay",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnPzpFzJg3HQwcJ_a6BWi4LOO-M-YNGZVW6Shwa4Van8vcVB1ipTrmUMacNFj4D8Lk7BLJiVnsFmzuTnBtkO7xErADDj7fLoRvU8GE3Q4m6v_6xs5BAGHL1iposoVPtrfZtAML78qoJi2Lpd_vCUyQvticSQcSuTkwRx3vrEQtsDhNLjPYslxz8tMv3Sp4ocJ9Fe8fTE71jYL_ulAXRAT3EVW4Dcd7oTJzRjC7oL5MQkkG4xYXWAILakTY3BRUckQdYQPDqSxeJl-F",
  },
];

const RECOMMENDED: Product[] = [
  { title: "Đàn Guitar Acoustic Yamaha F310 cũ", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgbRf6YLrrsa4OgyVieYxy_YdP0QGm9SxgxiCF2CaLlpGXU1EiUh2Z1D0t-G28fuL6q4iHwnwL9vDDCAO0DgQQIn-DgV15TFmtPZLpytOpiqX63iu_V-aAtCOSB965VZaGgXa-uNV0z5Txnmc4Gb_FBhkUC7UlsgR05p4L6BcMLONjKrzsc2rW2fCPmrAAV4eZBsuDGSx-FJVKRhTY6uVx8hVxeKRUPuAHzgKAADDaXADi2E8G2qOBxRK2QpXoP-bfjPwCb2PI_uKX", price: "1.800.000₫", location: "Đồng Nai", timeAgo: "1 ngày trước" },
  { title: "Áo thun Vintage Mỹ 2hand, size L, độ mới 98%", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGBrw6mMJYA757IeJ_CZ-LY3Of33PhBVTnSK6s0na_lzJWT2ruz5wnn0Z5hz0NGkt8ZaZNCbfiOtESlBNnz4JjPzKkKfZvyIoDgI2X3HCd93ihXMwTssLE3i8wThPn3bo4GInk_ibF6X41O_iaPJ1uCGme3yB4P9tPePkKfuZB--QViBhXvJVQ58yD2ZPyGRVg2nXKG_TIei7xDMI6D3v-S7aZZ0aGBzRJtvRR7nwSGi2nkWxEzwq3wJMkbxpAa3vGT9dGd03jl4sy", price: "150.000₫", location: "Hà Nội", timeAgo: "2 ngày trước", badge: "FreeShip" },
  { title: "Apple Watch Series 4 nhôm, fullbox", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaoOFLz1su0kHxwSiO_-9WaVI7lSg_9ezZjr9lqFGfsFEknbnPLax0u-4kJznvFYkc47azX7c_5JZm_BJWvOVjHhknqgStjh-81qAGIHEvF_106by1dnSgzmXB2Sa0s4U8aQOWKAghTB4y74qFX8ePg78xYYTCKgSRpL9xFRWQUxJQRPSRG-vNz564IDBef3T7rhwcat_msdiVv4Q60-5QHWEDSnW2UpeG_8xDHDtbhNjscGi-nJ2SWByyOeguea4a0G3zqTh7bGZ8", price: "2.900.000₫", location: "TP. HCM", timeAgo: "3 ngày trước" },
  { title: "Xe đạp địa hình Asama cũ, chạy tốt", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGHmC4ViiSxo2cqv3Hbx7bFuSh7qCU1J-57i4mPWo3uDCKZZpkYqYNueHhpiYN7gf02-PMH7_px-G_Xp7ePBAVCl41_8gDjHZpM16cwQL6q1w5U_pNb3I3bgOs3ezCn72qM-uZJ7jsF5E5ff0Pi0PgfbgoMR2nynXM0lkzbDmfKsDbgvlEg-Y4sZiD3jSjvELqiwFr0PKJ1C0SPtbZMEqOgRvKpxcfGjUW_tLWvcFTzzOss5nknUweFhJmR26CiJv_YRBoym_cPJGE", price: "1.100.000₫", location: "Cần Thơ", timeAgo: "5 ngày trước", badge: "Cũ" },
  { title: "Kính mát Rayban Aviator chính hãng, no box", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvxEnN5uX9M72zcYmnUdDJ07mueJzbwzIVqQtC-gseUNip3PxSGqfYRVaV9QD5xwLKOOF2ShihgS1vX_6HW62hzFYJeLeLpxvt4V7LLi_JNzGgKBKgCjHAd6yVp642hBviZxG7bef7ijFgbcsBdIdZ5YfnHTxttgqBmHPJcRs0S5INdPdyqizDFUIIiJsLMprlkLDeDcWbP8IQ-5jj3n5ptWNwuhBGJUfza_5Jjrqj86dj_2VaaDNS6slVidraJdF8_6Te4eiMspO2", price: "1.350.000₫", location: "Hải Phòng", timeAgo: "1 tuần trước" },
];

export default function HomePage() {
  return (
    <PageLayout>
      <HeroSection backgroundImage={HERO_BG} />
      <TrustIndicators />
      <CategoryGrid items={CATEGORIES} />

      <ProductSection
        title="Mới đăng bán"
        icon="new_releases"
        iconBgClassName="bg-[var(--color-primary)]"
        items={JUST_LISTED}
        showMoreButton
        moreButtonLabel="Xem thêm sản phẩm mới"
      />

      <PromoBanners items={BANNERS} />

      <ProductSection
        title="Gợi ý cho bạn"
        icon="local_fire_department"
        iconBgClassName="bg-red-500"
        items={RECOMMENDED}
      />
    </PageLayout>
  );
}
