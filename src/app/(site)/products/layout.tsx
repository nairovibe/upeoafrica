import { CartProvider } from "@/components/products/cart";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
