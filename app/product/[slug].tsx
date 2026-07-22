import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Share, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { shopApi } from '@/services/api';
import { BrandColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { getLabels, formatNumberByLang, translateAttribute } from '@/services/localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const lang = i18n.language || 'en';
  const labels = getLabels(lang);
  
  // Call hooks before any early returns!
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isVariantLoading, setIsVariantLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { addToCart, updateQuantity, removeFromCart, getCartItemQty } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const [offers, setOffers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

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

  useEffect(() => {
    shopApi.get(`/coupons/available?lang=${lang}`).then(res => setOffers(res.data?.data?.coupons || [])).catch(()=>{});
  }, [lang]);

  useEffect(() => {
    if (product?._id) {
      shopApi.get(`/reviews/product/${product._id}`).then(res => setReviews(res.data?.data || [])).catch(()=>{});
    }
  }, [product?._id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
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
  
  // Gather images safely
  let images: string[] = [];
  
  if (selectedVariant) {
    // 1. Put variant cover image first
    if (selectedVariant.coverImage) {
      const vCover = typeof selectedVariant.coverImage === 'string' ? selectedVariant.coverImage : selectedVariant.coverImage.url;
      if (vCover && typeof vCover === 'string' && !images.includes(vCover)) {
        images.push(vCover);
      }
    }
    // 2. Put variant gallery images next
    if (Array.isArray(selectedVariant.imagesArray)) {
      selectedVariant.imagesArray.forEach((img: any) => {
        const url = img?.url || img;
        if (url && typeof url === 'string' && !images.includes(url)) images.push(url);
      });
    }
  }

  // If still no images, fallback to product images
  if (images.length === 0) {
    // 1. Put product cover image first
    const mainImg = product.image || product.coverImage?.url || (typeof product.coverImage === 'string' ? product.coverImage : '') || product.imageUrl;
    if (mainImg && typeof mainImg === 'string' && !images.includes(mainImg)) {
      images.push(mainImg);
    }

    // 2. Put product gallery images next
    if (Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        const url = img?.url || img;
        if (url && typeof url === 'string' && !images.includes(url)) images.push(url);
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

  // Determine if this specific product is wishlisted
  const isWishlisted = product ? isInWishlist(product._id || product.id) : false;

  const handleToggleWishlist = () => {
    if (product) toggleWishlist(product);
  };

  const handleShare = async () => {
    try {
      const url = `https://pripriyanursery.com/product/${slug}`;
      await Share.share({
        message: `${title}\nCheck this out: ${url}`,
        url: url,
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  const productId = product?._id || product?.id;
  const cartItemId = selectedVariantIndex !== undefined ? `${productId}-${selectedVariantIndex}` : productId;
  const currentCartQty = getCartItemQty(productId, selectedVariantIndex);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1, selectedVariantIndex);
    }
  };
  
  const incrementQty = () => {
    updateQuantity(cartItemId, currentCartQty + 1);
  };
  
  const decrementQty = () => {
    if (currentCartQty > 1) {
      updateQuantity(cartItemId, currentCartQty - 1);
    } else {
      removeFromCart(cartItemId);
    }
  };

  const getOfferText = (offer: any, lang: string) => {
    const discountVal = offer.type === 'percentage' 
      ? `${formatNumberByLang(offer.value, lang)}%` 
      : `₹${formatNumberByLang(offer.value, lang)}`;
    const minVal = offer.minOrderValue > 0 ? `₹${formatNumberByLang(offer.minOrderValue, lang)}` : null;
    const maxVal = offer.maxDiscount > 0 ? `₹${formatNumberByLang(offer.maxDiscount, lang)}` : null;
    
    if (lang === 'bn') {
      let text = '';
      if (minVal) text += `সর্বনিম্ন ${minVal} অর্ডারে `;
      text += `${discountVal} ছাড় পেতে `;
      if (maxVal) text += `(সর্বোচ্চ ${maxVal} পর্যন্ত) `;
      text += `কুপন `;
      return { prefix: text, suffix: ` ব্যবহার করুন।` };
    } else if (lang === 'hi') {
      let text = '';
      if (minVal) text += `न्यूनतम ${minVal} के ऑर्डर पर `;
      text += `${discountVal} की छूट के लिए `;
      if (maxVal) text += `(अधिकतम ${maxVal} तक) `;
      text += `कूपन `;
      return { prefix: text, suffix: ` का उपयोग करें।` };
    } else {
      let text = `Use coupon `;
      let suffix = ` for ${discountVal} discount`;
      if (minVal) suffix += ` on minimum order of ${minVal}`;
      if (maxVal) suffix += ` (up to ${maxVal})`;
      suffix += `.`;
      return { prefix: text, suffix };
    }
  };

  const FEATURES = [
    { id: 1, title: labels.support24x7 || "24x7 Support", icon: "https://pripriyanursery.com/images/icons/24x7support.svg" },
    { id: 2, title: labels.easyReturn || "Easy Return", icon: "https://pripriyanursery.com/images/icons/easyreturn.svg" },
    { id: 3, title: labels.original100 || "100% Original", icon: "https://pripriyanursery.com/images/icons/originalproduct.svg" },
    { id: 4, title: labels.makeInIndia || "Make In India", icon: "https://pripriyanursery.com/images/icons/makeinindia.svg" },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {isVariantLoading && (
        <View style={styles.variantLoadingOverlay}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      )}
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
          <FontAwesome5 name="chevron-left" size={20} color={BrandColors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/cart')}>
          <IconSymbol name="cart" size={24} color={BrandColors.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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
              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => setIsImageViewerVisible(true)} 
                key={idx} 
                style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              >
                <Image source={{ uri: imgUrl }} style={styles.mainImage} contentFit="cover" transition={200} />
              </TouchableOpacity>
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

          <View style={styles.floatingIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleToggleWishlist}>
              <IconSymbol 
                name={isWishlisted ? 'heart.fill' : 'heart'} 
                size={22} 
                color={isWishlisted ? BrandColors.red : '#4B5563'} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <FontAwesome5 name="share-alt" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
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
            <Text style={[styles.stockText, isOutOfStock && styles.outOfStockTextBadge]}>
              {isOutOfStock ? labels.outOfStock : `${labels.inStock}: ${formatNumberByLang(stock, lang)}`}
            </Text>
          </View>
          
          {product?.effectiveTax && product.effectiveTax.length > 0 && (
            <View style={styles.taxRow}>
              <Text style={styles.taxText}>
                {(lang === 'bn' ? 'ট্যাক্স: ' : lang === 'hi' ? 'कर: ' : 'Tax: ')}
                {product.effectiveTax.map((t: any) => {
                  const nameLower = t.name.toLowerCase();
                  let translatedName = t.name;
                  if (nameLower === 'exempted') {
                    translatedName = lang === 'bn' ? 'ছাড়' : lang === 'hi' ? 'मुक्त' : 'Exempted';
                  }
                  return t.slab === 0 ? translatedName : `${formatNumberByLang(t.slab, lang)}% ${translatedName}`;
                }).join(' + ')}
              </Text>
            </View>
          )}

          {/* Variants Selector */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <View style={styles.variantsContainer}>
              <Text style={styles.sectionTitle}>{labels.chooseVariant || 'Choose Variant'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantsScroll}>
                {product.variants.map((v: any, idx: number) => {
                  const isActive = idx === selectedVariantIndex;
                  const vImg = v.coverImage?.url || images[0];
                  return (
                    <TouchableOpacity 
                      key={v._id || idx} 
                      style={[styles.variantCard, isActive && styles.variantCardActive]}
                      onPress={() => {
                        setIsVariantLoading(true);
                        setSelectedVariantIndex(idx);
                        setTimeout(() => {
                          setIsVariantLoading(false);
                          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                        }, 500);
                      }}
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

          {/* Available Offers */}
          {offers.length > 0 && (
            <View style={styles.offersContainer}>
              <View style={styles.offersHeader}>
                <IconSymbol name="tag.fill" size={18} color={BrandColors.primary} />
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{labels.availableOffers || "Available Offers"}</Text>
              </View>
              {offers.map((offer) => {
                const { prefix, suffix } = getOfferText(offer, lang);
                return (
                  <View key={offer._id || offer.code} style={styles.offerItem}>
                    <View style={styles.offerDot} />
                    <Text style={styles.offerText}>
                      {prefix}
                      <Text style={styles.offerCode}>{offer.code}</Text>
                      {suffix}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Trust Banner / Features */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trustBannerScroll}>
            {FEATURES.map((feat) => (
              <View key={feat.id} style={styles.trustItem}>
                <View style={styles.trustIconBox}>
                  <Image source={{ uri: feat.icon }} style={styles.trustIcon} contentFit="contain" />
                </View>
                <Text style={styles.trustText}>{feat.title}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Specifications */}
          {specs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.specifications || "Specifications"}</Text>
              <View style={styles.specsBox}>
                {(showMoreSpecs ? specs : specs.slice(0, 3)).map((spec: any, idx: number) => (
                  <View key={idx} style={[styles.specRow, idx === (showMoreSpecs ? specs.length - 1 : Math.min(specs.length, 3) - 1) && { borderBottomWidth: 0 }]}>
                    <Text style={styles.specLabel}>{spec.label || spec.key}</Text>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>
                ))}
              </View>
              {specs.length > 3 && (
                <TouchableOpacity onPress={() => setShowMoreSpecs(!showMoreSpecs)} style={styles.showMoreBtn}>
                  <Text style={styles.showMoreText}>{showMoreSpecs ? (labels.showLess || "Show Less") : (labels.showMore || "Show More")}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Description */}
          {cleanDesc ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{labels.description || "Description"}</Text>
              <Text style={styles.descriptionText} numberOfLines={showMoreDesc ? undefined : 3}>{cleanDesc}</Text>
              {cleanDesc.length > 100 && (
                <TouchableOpacity onPress={() => setShowMoreDesc(!showMoreDesc)} style={styles.showMoreBtn}>
                  <Text style={styles.showMoreText}>{showMoreDesc ? (labels.showLess || "Show Less") : (labels.showMore || "Show More")}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* Customer Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.customerReviews || "Customer Reviews"} ({reviews.length})</Text>
            {reviews.length > 0 ? (
              reviews.map((rev, idx) => (
                <View key={idx} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{rev.userName?.charAt(0) || 'U'}</Text>
                      </View>
                      <Text style={styles.reviewerName}>{rev.userName || 'User'}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>{rev.rating}</Text>
                      <IconSymbol name="star.fill" size={10} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={styles.reviewTitle}>{rev.title}</Text>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                  {rev.images && rev.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImagesScroll}>
                      {rev.images.map((img: any, iIdx: number) => (
                        <Image key={iIdx} source={{ uri: img.url || img }} style={styles.reviewImage} contentFit="cover" />
                      ))}
                    </ScrollView>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.noReviewsBox}>
                <Text style={styles.noReviewsText}>{labels.noReviewsYet || "No reviews yet"}</Text>
              </View>
            )}
          </View>
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
            {currentCartQty > 0 ? (
              <View style={styles.stepperBox}>
                <TouchableOpacity onPress={decrementQty} style={styles.stepBtn}><Text style={styles.stepText}>-</Text></TouchableOpacity>
                <Text style={styles.stepQty}>{formatNumberByLang(currentCartQty, lang)}</Text>
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

      {/* Fullscreen Image Viewer Modal */}
      <Modal visible={isImageViewerVisible} transparent={true} onRequestClose={() => setIsImageViewerVisible(false)}>
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity style={styles.imageViewerCloseBtn} onPress={() => setIsImageViewerVisible(false)}>
            <IconSymbol name="xmark" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: activeImageIndex * SCREEN_WIDTH, y: 0 }}
          >
            {images.map((imgUrl, idx) => (
              <View key={idx} style={{ width: SCREEN_WIDTH, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: imgUrl }} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }} contentFit="contain" />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  variantLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
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
  floatingIcons: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  taxRow: {
    marginBottom: 16,
  },
  taxText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
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
  stockText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.primary,
    backgroundColor: BrandColors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 4,
    overflow: 'hidden',
  },
  outOfStockTextBadge: {
    color: BrandColors.red,
    backgroundColor: BrandColors.lightRed,
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
  offersContainer: {
    marginBottom: 24,
  },
  offersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  offerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.primary,
    marginTop: 6,
  },
  offerText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  offerCode: {
    fontWeight: 'bold',
    color: BrandColors.primary,
    backgroundColor: 'rgba(21, 128, 61, 0.1)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  trustBannerScroll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 24,
    marginBottom: 12,
  },
  trustItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40) / 4,
  },
  trustIconBox: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  trustIcon: {
    width: 44,
    height: 44,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '600',
    color: BrandColors.dark,
    textAlign: 'center',
  },
  showMoreBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.primary,
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
    paddingHorizontal: 15,
    paddingVertical: 7,
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
    borderRadius: 14,
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
    borderRadius: 14,
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
    borderRadius: 14,
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
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  outOfStockText: {
    fontSize: 16,
    fontWeight: '800',
    color: BrandColors.red,
  },

  variantsContainer: {
    marginBottom: 12,
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
  },
  reviewCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.dark,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.dark,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  reviewImagesScroll: {
    marginTop: 12,
    flexDirection: 'row',
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  noReviewsBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  noReviewsText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  }
});
