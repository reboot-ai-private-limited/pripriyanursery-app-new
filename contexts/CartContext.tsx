import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, shopApi } from '@/services/api';
import i18n_service from '@/services/i18n';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

export interface CartItem {
  id: string; // unique string like `${product._id}-${variantIndex}`
  product: Product;
  variantIndex?: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
  addToCart: (product: Product, quantity: number, variantIndex?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemQty: (productId: string, variantIndex?: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      syncCartWithApi();
    } else {
      loadCart();
    }
  }, [isAuthenticated, i18n.language]);

  const syncCartWithApi = async () => {
    try {
      const res = await shopApi.get('/cart');
      if (res.data?.data?.items) {
        const apiCart = res.data.data.items.map((item: any) => {
          const variant = item.variantId;
          if (!variant) return null;
          const productObj = {
            ...variant,
            ...(variant.productId || {}),
            id: variant.productId?._id || variant._id,
            _id: variant.productId?._id || variant._id,
            variantId: variant._id,
            image: variant.coverImage?.url || variant.productId?.coverImage?.url,
            imagesArray: variant.imagesArray,
            effectiveTax: variant.effectiveTax || variant.productId?.effectiveTax
          };
          return {
            id: variant._id,
            product: productObj,
            quantity: item.quantity,
          };
        }).filter(Boolean);
        setCart(apiCart);
        AsyncStorage.setItem('cart', JSON.stringify(apiCart));
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error('Failed to sync cart with API:', e);
      loadCart();
    }
  };

  const pushCartToApi = async (cartItems: CartItem[]) => {
    if (!isAuthenticated) return;
    try {
      const payload = cartItems.map(item => {
        let vId = item.product.variantId || item.product.defaultVariantId || item.product._id || item.product.id;
        if (item.variantIndex !== undefined && item.product.variants && item.product.variants[item.variantIndex]) {
          vId = item.product.variants[item.variantIndex]._id;
        }
        return { variantId: vId, quantity: item.quantity };
      }).filter(i => i.variantId);
      
      await shopApi.put('/cart/sync', { items: payload });
    } catch (e) {
      console.error('Failed to push cart to API:', e);
    }
  };

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
    
    // We use the variant ID as the cart item ID to perfectly match the backend
    let itemId = product.variantId || product.defaultVariantId || pId;
    if (variantIndex !== undefined && product.variants && product.variants[variantIndex]) {
      itemId = product.variants[variantIndex]._id;
    }
    
    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === itemId);
      
      let updated;
      if (existingItemIndex >= 0) {
        updated = [...prev];
        updated[existingItemIndex].quantity += quantity;
      } else {
        updated = [...prev, { id: itemId as string, product, variantIndex, quantity }];
      }
      
      saveCart(updated);
      pushCartToApi(updated);
      showToast(i18n.t('cart.added', { defaultValue: 'Added to cart!' }));
      return updated;
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== cartItemId && 
        item.product._id !== cartItemId && 
        item.product.id !== cartItemId &&
        item.product.variantId !== cartItemId &&
        item.product.defaultVariantId !== cartItemId
      );
      saveCart(updated);
      pushCartToApi(updated);
      showToast(i18n.t('cart.removed', { defaultValue: 'Removed from cart' }));
      return updated;
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCart(prev => {
      let updated;
      if (quantity <= 0) {
        updated = prev.filter(item => item.id !== cartItemId && 
          item.product._id !== cartItemId && 
          item.product.id !== cartItemId &&
          item.product.variantId !== cartItemId &&
          item.product.defaultVariantId !== cartItemId
        );
      } else {
        updated = prev.map(item => 
          (item.id === cartItemId || item.product._id === cartItemId || item.product.variantId === cartItemId || item.product.defaultVariantId === cartItemId) 
            ? { ...item, quantity } 
            : item
        );
      }
      saveCart(updated);
      pushCartToApi(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
    if (isAuthenticated) {
      shopApi.delete('/cart').catch(() => {});
    }
  };

  const getCartItemQty = (productId: string, variantIndex?: number) => {
    const item = cart.find(i => 
      i.id === productId || 
      i.product._id === productId || 
      i.product.id === productId || 
      i.product.variantId === productId || 
      i.product.defaultVariantId === productId
    );
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider value={{ cart, buyNowItem, setBuyNowItem, addToCart, removeFromCart, updateQuantity, clearCart, getCartItemQty }}>
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
