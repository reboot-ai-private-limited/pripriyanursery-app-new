import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/product/ProductCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  const { t } = useTranslation();
  const { wishlist } = useWishlist();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>{t('wishlist.title', {defaultValue: 'My Wishlist'})}</Text>
        </View>
        
        {wishlist.length === 0 ? (
          <View style={styles.center}>
            <IconSymbol name="heart.fill" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>{t('wishlist.emptyTitle', {defaultValue: 'Your wishlist is empty'})}</Text>
            <Text style={styles.emptyDesc}>{t('wishlist.emptyDesc', {defaultValue: 'Save products you love to buy later!'})}</Text>
          </View>
        ) : (
          <FlatList
            data={wishlist}
            keyExtractor={(item) => item._id || item.id}
            renderItem={({ item }) => <ProductCard product={item} />}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingBottom: 20, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: BrandColors.dark, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  listContainer: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' }
});
