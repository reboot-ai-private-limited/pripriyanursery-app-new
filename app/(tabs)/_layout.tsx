import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { BrandColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const HomeIcon = ({ color }: { color: string }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Path d="M3 10.5L12 3L21 10.5V20A1 1 0 0 1 20 21H15V14H9V21H4A1 1 0 0 1 3 20V10.5Z" fill={color} />
  </Svg>
);

const CategoriesIcon = ({ color }: { color: string }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="2" fill={color}/>
    <Rect x="14" y="3" width="7" height="7" rx="2" fill={color}/>
    <Rect x="3" y="14" width="7" height="7" rx="2" fill={color}/>
    <Path d="M15 20C17.8 20 20 17.8 20 15V14H19C16.2 14 14 16.2 14 19V20H15Z" fill={color}/>
  </Svg>
);

const WishlistIcon = ({ color }: { color: string }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Path d="M12 21L10.55 19.68C5.4 15.02 2 11.95 2 8.25C2 5.25 4.42 3 7.25 3C8.95 3 10.58 3.81 11.5 5.08C12.42 3.81 14.05 3 15.75 3C18.58 3 21 5.25 21 8.25C21 11.95 17.6 15.02 12.45 19.68L12 21Z" fill={color}/>
  </Svg>
);

const CartIcon = ({ color }: { color: string }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Path d="M2 4H5L7 14H18L21 7H7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="9" cy="20" r="1.8" fill={color}/>
    <Circle cx="18" cy="20" r="1.8" fill={color}/>
  </Svg>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t, i18n } = useTranslation();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const insets = useSafeAreaInsets();
  const wishlistCount = wishlist.length;
  const cartCount = cart.length;

  return (
    <Tabs
      key={i18n.language}
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.75)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#76E45A', '#4BC957', '#35AF44', '#2A9740']}
            locations={[0, 0.3, 0.65, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.home', {defaultValue: 'Home'}),
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="category"
        options={{
          title: t('common.categories', {defaultValue: 'Categories'}),
          tabBarIcon: ({ color }) => <CategoriesIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('common.wishlist', {defaultValue: 'Wishlist'}),
          tabBarIcon: ({ color }) => <WishlistIcon color={color} />,
          tabBarBadge: wishlistCount > 0 ? wishlistCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FFFFFF', color: '#35AF44', fontSize: 10, minWidth: 16, height: 16, lineHeight: 16 },
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: t('common.cart', {defaultValue: 'Cart'}),
          tabBarIcon: ({ color }) => <CartIcon color={color} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FFFFFF', color: '#35AF44', fontSize: 10, minWidth: 16, height: 16, lineHeight: 16 },
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
