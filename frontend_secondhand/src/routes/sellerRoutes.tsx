import SellerDashboard from "@/pages/SellerDashboard";
import SellerProductsPage from "@/pages/SellerDashboard/ProductsManagement";

export const sellerRoutes = [
  {
    path: "/seller",
    element: <SellerDashboard />,
  },
  {
    path: "/seller/products",
    element: <SellerProductsPage />,
  },
] as const;