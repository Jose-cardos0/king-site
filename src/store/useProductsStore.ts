import { create } from 'zustand';
import { listProducts, Product } from '@/services/products.service';
import { SEED_PRODUCTS } from '@/data/seedProducts';

interface ProductsState {
  products: Product[];
  loading: boolean;
  fetched: boolean;
  fetch: () => Promise<void>;
  setAll: (p: Product[]) => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  fetched: false,
  fetch: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const remote = await listProducts();
      if (remote.length > 0) {
        set({ products: remote, loading: false, fetched: true });
      } else {
        set({ products: SEED_PRODUCTS, loading: false, fetched: true });
      }
    } catch {
      set({ products: SEED_PRODUCTS, loading: false, fetched: true });
    }
  },
  setAll: (p) => set({ products: p }),
}));
