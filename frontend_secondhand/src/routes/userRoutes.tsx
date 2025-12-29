import HomePage from "@/pages/Home";
import CartPage from "@/pages/Cart";

export const userRoutes = [
  { path: "/", element: <HomePage /> },
  { path: "/cart", element: <CartPage /> }
] as const;
