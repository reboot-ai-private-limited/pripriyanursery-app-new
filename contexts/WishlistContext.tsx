import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, shopApi } from '@/services/api';
import i18n from '@/services/i18n';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      syncWishlistWithApi();
    } else {
      loadWishlist();
    }
  }, [isAuthenticated]);

  const syncWishlistWithApi = async () => {
    try {
      const res = await shopApi.get('/wishlist');
      if (res.data?.data?.variantIds) {
        const apiItems = res.data.data.variantIds.map((item: any) => ({
          ...item,
          id: item._id,
        }));
        setWishlist(apiItems);
        saveWishlist(apiItems);
      }
    } catch (e) {
      console.error('Failed to sync wishlist with API:', e);
      loadWishlist();
    }
  };

  const loadWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    }
  };

  const saveWishlist = async (items: Product[]) => {
    try {
      await AsyncStorage.setItem('wishlist', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const addToWishlist = (product: Product) => {
    const idToCheck = product.variantId || product.defaultVariantId || product._id || product.id;
    setWishlist(prev => {
      // Avoid duplicates
      if (prev.some(p => 
        p._id === idToCheck || p.id === idToCheck || 
        p.variantId === idToCheck || p.defaultVariantId === idToCheck || 
        p.productId === idToCheck || p.productId === product._id
      )) {
        return prev;
      }
      
      const updated = [...prev, product];
      saveWishlist(updated);
      showToast(i18n.t('wishlist.added', { defaultValue: 'Added to wishlist!' }));
      return updated;
    });
  };

  const removeFromWishlist = (idToRemove: string) => {
    setWishlist(prev => {
      const updated = prev.filter(p => 
        p._id !== idToRemove && 
        p.id !== idToRemove && 
        p.variantId !== idToRemove && 
        p.defaultVariantId !== idToRemove && 
        p.productId !== idToRemove
      );
      saveWishlist(updated);
      showToast(i18n.t('wishlist.removed', { defaultValue: 'Removed from wishlist' }));
      return updated;
    });
  };

  const isInWishlist = (idToCheck: string) => {
    if (!idToCheck) return false;
    return wishlist.some(p => 
      p._id === idToCheck || 
      p.id === idToCheck || 
      p.variantId === idToCheck || 
      p.defaultVariantId === idToCheck || 
      p.productId === idToCheck
    );
  };

  const toggleWishlist = async (product: Product) => {
    // The backend expects the variant ID to toggle.
    const apiVariantId = product.variantId || product.defaultVariantId || product._id || product.id;
    const productObjectId = product._id || product.id;

    if (isInWishlist(apiVariantId as string) || isInWishlist(productObjectId as string)) {
      // Pass both to ensure it gets removed whether it was stored as a Product or Variant
      removeFromWishlist(apiVariantId as string);
      if (apiVariantId !== productObjectId) {
        removeFromWishlist(productObjectId as string);
      }
    } else {
      addToWishlist(product);
    }

    if (isAuthenticated) {
      try {
        await shopApi.patch(`/wishlist/toggle/${apiVariantId}`);
      } catch (e) {
        console.error('Failed to toggle wishlist on API:', e);
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
