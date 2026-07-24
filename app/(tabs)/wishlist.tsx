import React from 'react';
import { View, Text, StyleSheet, FlatList, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/product/ProductCard';
import StorefrontHeader from '@/components/home/StorefrontHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 128;
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const { t } = useTranslation();
  const { wishlist } = useWishlist();

  return (
    <View style={styles.safeArea}>
      <StorefrontHeader scrollY={scrollY} />
      <View style={styles.container}>
        <Animated.FlatList
          data={wishlist}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          contentContainerStyle={[styles.listContainer, { paddingTop: headerHeight }]}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={<Breadcrumbs items={[{ label: t('wishlist.title', {defaultValue: 'My Wishlist'}) }]} />}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <IconSymbol name="heart.fill" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>{t('wishlist.emptyTitle', {defaultValue: 'Your wishlist is empty'})}</Text>
              <Text style={styles.emptyDesc}>{t('wishlist.emptyDesc', {defaultValue: 'Save products you love to buy later!'})}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: BrandColors.dark, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  listContainer: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' }
});
