import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { shopApi } from '@/services/api';
import { BrandColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { getLabels, formatNumberByLang, translateAttribute } from '@/services/localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = i18n.language || 'en';
  const labels = getLabels(lang);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cartQty, setCartQty] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await shopApi.get(`/products/${slug}`);
        if (res.data?.data) {
          setProduct(res.data.data);
          setSelectedVariantIndex(0); // Reset variant on load
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, lang]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={BrandColors.red} />
        <Text style={styles.errorText}>Product Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedVariant = Array.isArray(product.variants) && product.variants.length > selectedVariantIndex
    ? product.variants[selectedVariantIndex]
    : null;

  const title = selectedVariant?.title || selectedVariant?.name || product.title || product.name || 'Nursery Plant';
  const price = selectedVariant?.price || product.displayPrice || product.price || 0;
  const mrp = selectedVariant?.mrp || product.displayMrp || product.mrp || price;
  const rawDiscount = selectedVariant?.discount?.value || product.displayDiscount;
  const discount = rawDiscount !== undefined ? rawDiscount : (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  
  const stock = selectedVariant?.stocks !== undefined 
    ? selectedVariant.stocks 
    : (selectedVariant?.stock !== undefined ? selectedVariant.stock : (product.stocks || product.stock || 0));
  const isOutOfStock = stock <= 0;

  // Gather images
  let images: string[] = [];
  if (selectedVariant?.imagesArray?.length > 0) {
    selectedVariant.imagesArray.forEach((img: any) => images.push(img.url || img));
  } else if (selectedVariant?.coverImage?.url) {
    images.push(selectedVariant.coverImage.url);
  } else {
    if (product.coverImage?.url) images.push(product.coverImage.url);
    if (Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        const url = img.url || img;
        if (url && !images.includes(url)) images.push(url);
      });
    }
  }
  if (images.length === 0) {
    images.push('https://via.placeholder.com/600x600.png?text=No+Image');
  }

  // Specifications
  let specs = Array.isArray(product.specs) ? [...product.specs] : [];
  if (selectedVariant?.attributes && typeof selectedVariant.attributes === 'object') {
    Object.entries(selectedVariant.attributes).forEach(([key, value]) => {
      specs.push({ label: translateAttribute(key, lang), value: String(value) });
    });
  }

  // Strip HTML from desc
  const cleanDesc = product.desc ? product.desc.replace(/<[^>]+>/g, '').trim() : '';

  const handleAddToCart = () => setCartQty(1);
  const incrementQty = () => setCartQty(prev => prev + 1);
  const decrementQty = () => setCartQty(prev => Math.max(0, prev - 1));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={BrandColors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <IconSymbol name="cart" size={24} color={BrandColors.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(idx);
            }}
          >
            {images.map((imgUrl, idx) => (
              <View key={idx} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}>
                <Image source={{ uri: imgUrl }} style={styles.mainImage} contentFit="cover" transition={200} />
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, idx) => (
                <View key={idx} style={[styles.dot, activeImageIndex === idx && styles.activeDot]} />
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.wishlistBtn}>
            <IconSymbol name="heart" size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productTitle}>{title}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{formatNumberByLang(price, lang)}</Text>
            {mrp > price && (
              <>
                <Text style={styles.mrp}>₹{formatNumberByLang(mrp, lang)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{formatNumberByLang(discount, lang)}{labels.off}</Text>
                </View>
              </>
            )}
          </View>
          
          <Text style={[styles.stockText, isOutOfStock && styles.outOfStockTextBadge]}>
            {isOutOfStock ? labels.outOfStock : `${labels.inStock}: ${formatNumberByLang(stock, lang)}`}
          </Text>

          {/* Variants Selector */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <View style={styles.variantsContainer}>
              <Text style={styles.sectionTitle}>{labels.variants || 'Variants'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantsScroll}>
                {product.variants.map((v: any, idx: number) => {
                  const isActive = idx === selectedVariantIndex;
                  const vImg = v.coverImage?.url || images[0];
                  return (
                    <TouchableOpacity 
                      key={v._id || idx} 
                      style={[styles.variantCard, isActive && styles.variantCardActive]}
                      onPress={() => setSelectedVariantIndex(idx)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: vImg }} style={styles.variantImage} />
                      <Text style={[styles.variantText, isActive && styles.variantTextActive]} numberOfLines={2}>
                        {v.title || v.name || `Variant ${idx + 1}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Features highlight */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <FontAwesome5 name="shipping-fast" size={14} color={BrandColors.primary} />
              <Text style={styles.featureText}>{t('home.features.shippingTitle', {defaultValue: 'Free Shipping'})}</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome5 name="seedling" size={14} color={BrandColors.primary} />
              <Text style={styles.featureText}>{t('home.features.originalTitle', {defaultValue: '100% Original'})}</Text>
            </View>
          </View>

          {/* Description */}
          {cleanDesc ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{cleanDesc}</Text>
            </View>
          ) : null}

          {/* Specifications */}
          {specs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <View style={styles.specsBox}>
                {specs.map((spec: any, idx: number) => (
                  <View key={idx} style={[styles.specRow, idx === specs.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={styles.specLabel}>{spec.label || spec.key}</Text>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {isOutOfStock ? (
          <View style={styles.outOfStockBtn}>
            <Text style={styles.outOfStockText}>{labels.outOfStock}</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            {cartQty > 0 ? (
              <View style={styles.stepperBox}>
                <TouchableOpacity onPress={decrementQty} style={styles.stepBtn}><Text style={styles.stepText}>-</Text></TouchableOpacity>
                <Text style={styles.stepQty}>{formatNumberByLang(cartQty, lang)}</Text>
                <TouchableOpacity onPress={incrementQty} style={styles.stepBtn}><Text style={styles.stepText}>+</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
                <IconSymbol name="cart.fill" size={18} color={BrandColors.primary} />
                <Text style={styles.addBtnText}>{labels.addToCart}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.buyBtn}>
              <Text style={styles.buyBtnText}>{labels.buyNow}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.dark,
    marginTop: 16,
    marginBottom: 24,
  },
  backBtn: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.dark,
    paddingHorizontal: 12,
  },
  scrollArea: {
    flex: 1,
  },
  galleryContainer: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  activeDot: {
    width: 16,
    backgroundColor: BrandColors.primary,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  infoContainer: {
    padding: 20,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.dark,
    marginBottom: 12,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: BrandColors.primary,
  },
  mrp: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: BrandColors.lightRed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '800',
    color: BrandColors.red,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.dark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  specsBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  specLabel: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  specValue: {
    flex: 1.5,
    padding: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: BrandColors.dark,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addBtn: {
    flex: 1,
    backgroundColor: BrandColors.lightGreen,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: BrandColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    paddingVertical: 14,
  },
  buyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepperBox: {
    flex: 1,
    backgroundColor: BrandColors.lightGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  stepBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 22,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  stepQty: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.dark,
  },
  outOfStockBtn: {
    backgroundColor: BrandColors.lightRed,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  outOfStockText: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.red,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.primary,
    marginBottom: 16,
    marginTop: -8,
  },
  outOfStockTextBadge: {
    color: BrandColors.red,
  },
  variantsContainer: {
    marginBottom: 24,
  },
  variantsScroll: {
    gap: 12,
  },
  variantCard: {
    width: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 6,
  },
  variantCardActive: {
    borderColor: BrandColors.primary,
    borderWidth: 2,
  },
  variantImage: {
    width: '100%',
    height: 70,
    backgroundColor: '#F3F4F6',
  },
  variantText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    color: '#4B5563',
    fontWeight: '500',
  },
  variantTextActive: {
    color: BrandColors.primary,
    fontWeight: '700',
  }
});
