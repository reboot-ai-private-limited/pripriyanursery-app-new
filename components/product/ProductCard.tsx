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

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartQty, setCartQty] = useState(0);

  const title = product.title || 'Exotic Nursery Plant';
  const price = product.price || 0;
  const mrp = product.mrp || price;
  const discount = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const stock = product.stock !== undefined ? product.stock : (product.stocks || 0);
  
  const imgSource = product.image || product.imageUrl || 'https://via.placeholder.com/400x400.png?text=No+Image';

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
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
      onPress={onPress}
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
          onPress={toggleWishlist}
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
          <Text style={styles.price}>₹{price}</Text>
          {mrp > price && (
            <>
              <Text style={styles.mrp}>₹{mrp}</Text>
              <Text style={styles.discount}>{discount}% OFF</Text>
            </>
          )}
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          {stock <= 0 ? (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          ) : cartQty > 0 ? (
            <View style={styles.stepperContainer}>
              <TouchableOpacity onPress={decrementQty} style={styles.stepperBtn}>
                <Text style={styles.stepperSymbol}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{cartQty}</Text>
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
              <Text style={styles.addToCartText}>Add to Cart</Text>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: BrandColors.surface,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 6,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.dark,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: BrandColors.primary,
  },
  mrp: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.red,
  },
  actionsRow: {
    width: '100%',
  },
  addToCartBtn: {
    width: '100%',
    backgroundColor: BrandColors.lightGreen,
    borderRadius: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addToCartText: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  stepperContainer: {
    width: '100%',
    backgroundColor: BrandColors.lightGreen,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#C1E8CC',
  },
  stepperBtn: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperSymbol: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.primary,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: BrandColors.dark,
  },
  outOfStockBadge: {
    width: '100%',
    backgroundColor: BrandColors.lightRed,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  outOfStockText: {
    fontSize: 11,
    fontWeight: '800',
    color: BrandColors.red,
  },
});
