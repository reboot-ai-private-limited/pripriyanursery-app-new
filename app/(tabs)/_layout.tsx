import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const insets = useSafeAreaInsets();
  const wishlistCount = wishlist.length;
  const cartCount = cart.length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#D1D5DB',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: BrandColors.primary,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.home', {defaultValue: 'Home'}),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="category"
        options={{
          title: t('common.categories', {defaultValue: 'Categories'}),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('common.wishlist', {defaultValue: 'Wishlist'}),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="heart.fill" color={color} />,
          tabBarBadge: wishlistCount > 0 ? wishlistCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FFFFFF', color: BrandColors.primary, fontSize: 10, minWidth: 16, height: 16, lineHeight: 16 },
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: t('common.cart', {defaultValue: 'Cart'}),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="cart.fill" color={color} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FFFFFF', color: BrandColors.primary, fontSize: 10, minWidth: 16, height: 16, lineHeight: 16 },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
