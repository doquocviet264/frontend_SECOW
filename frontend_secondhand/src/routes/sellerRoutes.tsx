import SellerDashboard from "@/pages/SellerDashboard";
import SellerProductsPage from "@/pages/SellerDashboard/ProductsManagement";
import SellerOrderManagement from "@/pages/SellerDashboard/OrderManagement";

export const sellerRoutes = [
  {
    path: "/seller",
    element: <SellerDashboard />,
  },
  {
    path: "/seller/products",
    element: <SellerProductsPage />,
  },
  {
    path: "/seller/orders",
    element: <SellerOrderManagement />,
  },
] as const;