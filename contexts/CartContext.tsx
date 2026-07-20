import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/services/api';
import i18n from '@/services/i18n';

export interface CartItem {
  id: string; // unique string like `${product._id}-${variantIndex}`
  product: Product;
  variantIndex?: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, variantIndex?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemQty: (productId: string, variantIndex?: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
      setCart(items);
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const getCartItemId = (productId: string, variantIndex?: number) => {
    return variantIndex !== undefined ? `${productId}-${variantIndex}` : productId;
  };

  const addToCart = (product: Product, quantity: number, variantIndex?: number) => {
    const pId = product._id || product.id;
    if (!pId) return;
    
    const itemId = getCartItemId(pId, variantIndex);
    
    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === itemId);
      
      let updated;
      if (existingItemIndex >= 0) {
        updated = [...prev];
        updated[existingItemIndex].quantity += quantity;
      } else {
        updated = [...prev, { id: itemId, product, variantIndex, quantity }];
      }
      
      saveCart(updated);
      showToast(i18n.t('cart.added', { defaultValue: 'Added to cart!' }));
      return updated;
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== cartItemId);
      saveCart(updated);
      showToast(i18n.t('cart.removed', { defaultValue: 'Removed from cart' }));
      return updated;
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) {
        const updated = prev.filter(item => item.id !== cartItemId);
        saveCart(updated);
        return updated;
      }
      const updated = prev.map(item => item.id === cartItemId ? { ...item, quantity } : item);
      saveCart(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const getCartItemQty = (productId: string, variantIndex?: number) => {
    const itemId = getCartItemId(productId, variantIndex);
    const item = cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartItemQty }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
