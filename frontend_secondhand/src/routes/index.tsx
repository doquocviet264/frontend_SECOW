import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "@/pages/Home";
import AboutPage from "@/pages/About";
import ProductPage from "@/pages/Products";
import ProductDetailPage from "@/pages/ProductDetail";
import CartPage from "@/pages/Cart";
import CheckoutPage from "@/pages/Checkout";  
import ProfilePage from "@/pages/Profile";
import OrderDetailPage from "@/pages/OrderDetail";
import SellerProfilePage from "@/pages/SellerProfile";
import WishlistPage from "@/pages/Wishlist";
import BecomeSellerPage from "@/pages/Become-Seller";
import SignInPage from "@/pages/Auth/SignIn";
import SignUpPage from "@/pages/Auth/SignUp";
import ForgotPasswordPage from "@/pages/Auth/ForgotPassword";
import ResetPasswordPage from "@/pages/Auth/ResetPassword";
import SellerDashboardPage from "@/pages/SellerDashboard";
import AdminDashboardPage from "@/pages/AdminDashboard";
import SellerProductsPage from "@/pages/SellerDashboard/Products";
type Role = "guest" | "user" | "seller" | "admin";

function useAuth() {
  // TODO: thay bằng auth thật
  const isLoggedIn = true;
  const role: Role = "admin";

  return { isLoggedIn, role };
}

function RequireAuth({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: Role[];
}) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (!allow.includes(role))
    return <div>Bạn không có quyền truy cập</div>;

  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/seller-profile/:id" element={<SellerProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/become-seller" element={<BecomeSellerPage />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        {/* USER */}
        <Route
          path="/user/dashboard"
        />



        {/* SELLER */}
        <Route
          path="/seller" element = {<SellerDashboardPage />}
        />
        <Route
          path="/seller/products" element = {<SellerProductsPage />}
        />


        {/* ADMIN */}
        <Route
          path="/admin" element={<AdminDashboardPage />}
        //   element={
        //     <RequireAuth allow={["admin"]}>
        //       <AdminDashboard />
        //     </RequireAuth>
        //   }
        />

        {/* 404 */}
        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}
