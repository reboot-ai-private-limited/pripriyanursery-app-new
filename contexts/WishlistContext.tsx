import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToastAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/services/api';
import i18n from '@/services/i18n';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    loadWishlist();
  }, []);

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
    setWishlist(prev => {
      const pId = product._id || product.id;
      const exists = prev.find(p => (p._id || p.id) === pId);
      if (exists) return prev;
      const updated = [...prev, product];
      saveWishlist(updated);
      showToast(i18n.t('wishlist.added', { defaultValue: 'Added to wishlist!' }));
      return updated;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => {
      const updated = prev.filter(p => (p._id || p.id) !== productId);
      saveWishlist(updated);
      showToast(i18n.t('wishlist.removed', { defaultValue: 'Removed from wishlist' }));
      return updated;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => (p._id || p.id) === productId);
  };

  const toggleWishlist = (product: Product) => {
    const pId = product._id || product.id;
    if (isInWishlist(pId)) {
      removeFromWishlist(pId);
    } else {
      addToWishlist(product);
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
