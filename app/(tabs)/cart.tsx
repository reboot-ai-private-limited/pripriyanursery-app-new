import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import StorefrontHeader from '@/components/home/StorefrontHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CartScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <StorefrontHeader />
      <Breadcrumbs items={[{ label: t('cart.title', {defaultValue: 'Cart'}) }]} />
      <View style={styles.center}>
        <IconSymbol name="cart.fill" size={64} color="#E5E7EB" />
        <Text style={styles.emptyTitle}>{t('cart.emptyTitle', {defaultValue: 'Your cart is empty!'})}</Text>
        <Text style={styles.emptyDesc}>{t('cart.emptyDesc', {defaultValue: 'Add items to it now.'})}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: BrandColors.dark, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center' }
});
