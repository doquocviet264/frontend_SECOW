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
import SellerProductsPage from "@/pages/SellerDashboard/ProductsManagement";
import CategoryManagementPage from "@/pages/AdminDashboard/CategoryManagement";
import ProductApprovalPage from "@/pages/AdminDashboard/ProductApproval";
import StoreApprovalPage from "@/pages/AdminDashboard/StoreApproval";
import { authService } from "@/services/authService";
import type { AuthUser } from "@/types/auth";

type Role = "guest" | "user" | "seller" | "admin";

function useAuth() {
  const user = authService.getCurrentUser() as AuthUser | null;
  const isLoggedIn = authService.isAuthenticated();
  const role: Role = user?.role === "admin" ? "admin" : user?.role === "seller" ? "seller" : user ? "user" : "guest";

  return { isLoggedIn, role, user };
}

function RequireAuth({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: Role[];
}) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) return <Navigate to="/auth/signin" replace />;
  
  if (!allow.includes(role)) {
    // Nếu user đã đăng nhập nhưng không phải seller và cố truy cập trang seller
    // thì điều hướng đến trang đăng ký bán hàng
    if (allow.includes("seller") && role === "user") {
      return <Navigate to="/become-seller" replace />;
    }
    // Các trường hợp khác hiển thị thông báo lỗi
    return <div>Bạn không có quyền truy cập</div>;
  }

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
        <Route
          path="/cart"
          element={
            <RequireAuth allow={["user", "seller", "admin"]}>
              <CartPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth allow={["user", "seller", "admin"]}>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth allow={["user", "seller", "admin"]}>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/seller-profile/:id" element={<SellerProfilePage />} />
        <Route
          path="/wishlist"
          element={
            <RequireAuth allow={["user", "seller", "admin"]}>
              <WishlistPage />
            </RequireAuth>
          }
        />
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
          path="/seller"
          element={
            <RequireAuth allow={["seller", "admin"]}>
              <SellerDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/seller/dashboard"
          element={
            <RequireAuth allow={["seller", "admin"]}>
              <SellerDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/seller/products"
          element={
            <RequireAuth allow={["seller", "admin"]}>
              <SellerProductsPage />
            </RequireAuth>
          }
        />


        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <RequireAuth allow={["admin"]}>
              <AdminDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireAuth allow={["admin"]}>
              <CategoryManagementPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products-approval"
          element={
            <RequireAuth allow={["admin"]}>
              <ProductApprovalPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/stores-approval"
          element={
            <RequireAuth allow={["admin"]}>
              <StoreApprovalPage />
            </RequireAuth>
          }
        />


        {/* 404 */}
        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}
