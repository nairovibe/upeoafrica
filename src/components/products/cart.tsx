"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { formatMoney, type PriceCurrency } from "@/lib/constants";
import { cn } from "@/lib/utils";

const KEY = "upeo-product-cart";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  tierId: string | null;
  tierName: string | null;
  currency: PriceCurrency;
  amount: number;
  cover: string | null;
};

type CartValue = {
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
};

const CartContext = createContext<CartValue | null>(null);

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== "object") return false;
      const row = item as CartItem;
      return typeof row.productId === "string" && typeof row.title === "string" && typeof row.amount === "number";
    });
  } catch {
    return [];
  }
}

export function buyButtonClass(extra?: string) {
  return cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-brand-500 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-600",
    extra,
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartValue>(
    () => ({
      items,
      open,
      setOpen,
      add: (item) => {
        setItems((current) => [item, ...current.filter((row) => row.productId !== item.productId)]);
      },
      remove: (productId) => setItems((current) => current.filter((row) => row.productId !== productId)),
    }),
    [items, open],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartPanel />
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Cart is only available on product pages.");
  return value;
}

export function CartButton() {
  const { items, setOpen } = useCart();
  const count = items.length;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="inline-flex h-11 cursor-pointer items-center gap-2 border border-line bg-white px-3 text-sm font-medium text-ink-900 transition-colors duration-200 hover:border-brand-500 hover:text-brand-600"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden />
      Cart
      <span
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center px-1 text-xs font-semibold",
          count > 0 ? "bg-brand-500 text-white" : "bg-surface-2 text-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function CartPanel() {
  const { items, open, setOpen, remove } = useCart();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" aria-label="Close cart" className="absolute inset-0 cursor-pointer bg-ink-950/40" onClick={() => setOpen(false)} />
      <aside role="dialog" aria-label="Cart" className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-white">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink-900">Cart</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center text-ink-900 hover:text-brand-600"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <p className="text-sm text-body">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const name = item.tierName ? `${item.title} · ${item.tierName}` : item.title;
                return (
                  <li key={item.productId} className="border border-line p-4">
                    <div className="flex gap-3">
                      {item.cover ? (
                        <div className="h-16 w-20 shrink-0 overflow-hidden border border-line bg-surface-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.cover} alt="" className="h-full w-full object-contain" />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-900">{name}</p>
                        <p className="mt-1 font-display text-base font-semibold text-ink-900">{formatMoney(item.amount, item.currency)}</p>
                        <button
                          type="button"
                          onClick={() => remove(item.productId)}
                          className="mt-1 cursor-pointer text-sm text-muted hover:text-ink-900"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <Link href={`/products/${item.slug}#checkout`} onClick={() => setOpen(false)} className={buyButtonClass("mt-4 w-full")}>
                      Checkout
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
