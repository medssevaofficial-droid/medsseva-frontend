import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string; // Unified ID for both test and package
  itemType: 'test' | 'package';
  name: string;
  price: number;
  discountedPrice: number;
  homeCollection: boolean;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalDiscount: number;
  finalAmount: number;
  homeCollectionCharge: number;
}

const initialState: CartState = {
  items: [],
  totalPrice: 0,
  totalDiscount: 0,
  finalAmount: 0,
  homeCollectionCharge: 150, // Fixed charge for home collection
};

const calculateTotals = (state: CartState) => {
  let price = 0;
  let final = 0;
  let hasHomeCollection = false;

  state.items.forEach(item => {
    price += item.price * item.quantity;
    final += item.discountedPrice * item.quantity;
    if (item.homeCollection) hasHomeCollection = true;
  });

  const gst = Math.round(final * 0.18); // 18% GST
  const collectionCharge = (hasHomeCollection && state.items.length > 0) ? state.homeCollectionCharge : 0;

  state.totalPrice = price;
  state.totalDiscount = price - final;
  state.finalAmount = final + collectionCharge + gst;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id && item.itemType === action.payload.itemType);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push(action.payload);
      }
      calculateTotals(state);
    },
    removeFromCart: (state, action: PayloadAction<{ id: string; itemType: 'test' | 'package' }>) => {
      state.items = state.items.filter(item => !(item.id === action.payload.id && item.itemType === action.payload.itemType));
      calculateTotals(state);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; itemType: 'test' | 'package'; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id && item.itemType === action.payload.itemType);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      } else if (item && action.payload.quantity === 0) {
        state.items = state.items.filter(i => !(i.id === action.payload.id && i.itemType === action.payload.itemType));
      }
      calculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      calculateTotals(state);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

