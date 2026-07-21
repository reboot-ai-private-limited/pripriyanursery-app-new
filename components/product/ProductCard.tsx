import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { Product } from '@/services/api';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2;

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getLabels, formatNumberByLang } from '@/services/localization';
import { useWishlist } from '@/contexts/WishlistContext';

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const labels = getLabels(lang);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product._id || product.id);
  const [cartQty, setCartQty] = useState(0);

  const title = product.title || (product as any).name || 'Exotic Nursery Plant';
  const price = product.price || 0;
  const mrp = product.mrp || price;
  const discount = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const stock = product.stock !== undefined ? product.stock : (product.stocks || 0);
  
  const imgSource = product.image || (product as any).coverImage?.url || product.imageUrl || 'https://via.placeholder.com/400x400.png?text=No+Image';

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  const handleAddToCart = () => {
    setCartQty(1);
  };

  const incrementQty = () => {
    setCartQty(prev => prev + 1);
  };

  const decrementQty = () => {
    setCartQty(prev => Math.max(0, prev - 1));
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH }]}
      activeOpacity={0.9}
      onPress={onPress || (() => router.push(`/product/${product.slug}` as any))}
    >
      {/* Product Image Wrapper with Floating Wishlist Button */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imgSource }}
          style={styles.image}
          contentFit="cover"
          transition={250}
        />

        {/* Heart Wishlist Button - Solid opaque white background (#FFFFFF) */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={handleToggleWishlist}
          activeOpacity={0.1}
        >
          <IconSymbol
            name={isWishlisted ? 'heart.fill' : 'heart'}
            size={18}
            color={isWishlisted ? BrandColors.red : '#4B5563'}
          />
        </TouchableOpacity>
      </View>

      {/* Product Details */}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{formatNumberByLang(price, lang)}</Text>
          {mrp > price && (
            <>
              <Text style={styles.mrp}>₹{formatNumberByLang(mrp, lang)}</Text>
              <Text style={styles.discount}>{formatNumberByLang(discount, lang)}{labels.off}</Text>
            </>
          )}
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          {stock <= 0 ? (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>{labels.outOfStock}</Text>
            </View>
          ) : cartQty > 0 ? (
            <View style={styles.stepperContainer}>
              <TouchableOpacity onPress={decrementQty} style={styles.stepperBtn}>
                <Text style={styles.stepperSymbol}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{formatNumberByLang(cartQty, lang)}</Text>
              <TouchableOpacity onPress={incrementQty} style={styles.stepperBtn}>
                <Text style={styles.stepperSymbol}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <IconSymbol name="cart.fill" size={14} color={BrandColors.primary} />
              <Text style={styles.addToCartText}>{labels.addToCart}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  details: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    justifyContent: 'space-between',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  mrp: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
  },
  actionsRow: {
    width: '100%',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#E8F7EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  addToCartText: {
    color: BrandColors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  stepperContainer: {
    flex: 1,
    backgroundColor: '#E8F7EC',
    borderColor: '#c1e8cc',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperSymbol: {
    color: BrandColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  outOfStockBadge: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
