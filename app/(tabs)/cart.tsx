import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

export default function CartScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('cart.title', {defaultValue: 'Cart'})}</Text>
      </View>
      <View style={styles.center}>
        <IconSymbol name="cart.fill" size={64} color="#E5E7EB" />
        <Text style={styles.emptyTitle}>{t('cart.emptyTitle', {defaultValue: 'Your cart is empty!'})}</Text>
        <Text style={styles.emptyDesc}>{t('cart.emptyDesc', {defaultValue: 'Add items to it now.'})}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingBottom: 20, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: BrandColors.dark, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center' }
});
