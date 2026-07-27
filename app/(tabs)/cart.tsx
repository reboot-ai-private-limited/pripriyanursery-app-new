import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BrandColors } from "@/constants/theme";
import { useTranslation } from "react-i18next";
import StorefrontHeader from "@/components/home/StorefrontHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import { formatNumberByLang } from "@/services/localization";
import { router } from "expo-router";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 128;
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const { cart, updateQuantity, removeFromCart } = useCart();

  const getProductPrice = (product: any) => {
    return product.price || product.displayPrice || 0;
  };

  const getProductMrp = (product: any) => {
    return product.mrp || product.displayMrp || getProductPrice(product);
  };

  // Calculate Subtotal (price x qty)
  const subtotal = cart.reduce(
    (sum, item) => sum + getProductPrice(item.product) * item.quantity,
    0,
  );
  const totalMrp = cart.reduce(
    (sum, item) => sum + getProductMrp(item.product) * item.quantity,
    0,
  );
  const discount = totalMrp - subtotal;

  // Calculate Tax (if isTaxInclude is false)
  let totalTax = 0;
  cart.forEach((item) => {
    const product = item.product;
    if (
      product.effectiveTax &&
      product.effectiveTax.length > 0
    ) {
      const price = getProductPrice(product);
      let itemTax = 0;
      product.effectiveTax.forEach((tax: any) => {
        if (tax.slab > 0) {
          itemTax += price * (tax.slab / 100);
        }
      });
      totalTax += itemTax * item.quantity;
    }
  });

  const grandTotal = subtotal + totalTax;

  return (
    <View style={styles.container}>
      <StorefrontHeader scrollY={scrollY} />

      {cart.length === 0 ? (
        <View style={[styles.center, { paddingTop: headerHeight }]}>
          <View style={{ width: '100%', position: 'absolute', top: headerHeight }}>
            <Breadcrumbs items={[{ label: t("cart.title", { defaultValue: "Cart" }) }]} />
          </View>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <IconSymbol name="cart.fill" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>
              {t("cart.emptyTitle", { defaultValue: "Your cart is empty!" })}
            </Text>
            <Text style={styles.emptyDesc}>
              {t("cart.emptyDesc", { defaultValue: "Add items to it now." })}
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => router.push("/")}
            >
              <Text style={styles.shopNowText}>
                {t("cart.shopNow", { defaultValue: "Shop Now" })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Animated.ScrollView
            style={styles.scrollContent}
            contentContainerStyle={[styles.scrollPadding, { paddingTop: headerHeight }]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            <View style={{ marginHorizontal: -16, marginBottom: 16 }}>
              <Breadcrumbs
                items={[{ label: t("cart.title", { defaultValue: "Cart" }) }]}
              />
            </View>
            <Text style={styles.sectionTitle}>
              {t("cart.items", { defaultValue: "Cart Items" })} ({formatNumberByLang(cart.length, lang)})
            </Text>

            <View style={styles.itemsList}>
              {cart.map((item) => {
                const img =
                  item.product.image ||
                  item.product.coverImage?.url ||
                  item.product.imageUrl ||
                  "https://via.placeholder.com/150";
                const price = getProductPrice(item.product);
                return (
                  <View key={item.id} style={styles.cartItem}>
                    <TouchableOpacity onPress={() => router.push(`/product/${item.product.slug || item.product.id}`)}>
                      <Image source={{ uri: img }} style={styles.itemImg} />
                    </TouchableOpacity>
                    <View style={styles.itemInfo}>
                      <View>
                        <TouchableOpacity onPress={() => router.push(`/product/${item.product.slug || item.product.id}`)}>
                          <Text style={styles.itemTitle} numberOfLines={2}>
                            {item.product.title}
                          </Text>
                        </TouchableOpacity>

                        {/* Render Specifications / Attributes */}
                        {(() => {
                          let attrs = item.product.attributes;
                          if (item.variantIndex !== undefined && item.product.variants && item.product.variants[item.variantIndex]) {
                            attrs = item.product.variants[item.variantIndex].attributes || attrs;
                          } else if (!attrs && item.product.variants && item.product.variants.length > 0) {
                            const defVar = item.product.variants.find((v: any) => v._id === item.product.defaultVariantId) || item.product.variants[0];
                            attrs = defVar.attributes || attrs;
                          }

                          const hasAttrs = attrs && typeof attrs === 'object' && Object.keys(attrs).length > 0;
                          const specs = item.product.specs;
                          const hasSpecs = Array.isArray(specs) && specs.length > 0;

                          return (
                            <View style={styles.itemSpecsContainer}>
                              {hasAttrs && Object.entries(attrs!).map(([key, val]) => (
                                <Text key={key} style={styles.itemSpecText}>{key}: {String(val)}</Text>
                              ))}
                              
                              {hasSpecs && specs.slice(0, 2).map((spec: any, idx: number) => (
                                <Text key={`spec-${idx}`} style={styles.itemSpecText}>{spec.key || spec.label}: {spec.value}</Text>
                              ))}
                            </View>
                          );
                        })()}
                      </View>

                      <Text style={styles.itemPrice}>
                        ₹{formatNumberByLang(price, lang)}
                      </Text>

                      <View style={styles.qtyControls}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <IconSymbol name="minus" size={16} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{formatNumberByLang(item.quantity, lang)}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <IconSymbol name="plus" size={16} color="#374151" />
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                          onPress={() => removeFromCart(item.id)}
                          style={styles.removeBtn}
                        >
                          <IconSymbol
                            name="trash.fill"
                            size={18}
                            color={BrandColors.red}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>
                {t("cart.orderSummary", { defaultValue: "Order Summary" })}
              </Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t("cart.subtotal", { defaultValue: "Subtotal" })}
                </Text>
                <Text style={styles.summaryValue}>
                  ₹{formatNumberByLang(subtotal, lang)}
                </Text>
              </View>

              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {t("cart.discount", { defaultValue: "Discount" })}
                  </Text>
                  <Text style={[styles.summaryValue, { color: "#10B981" }]}>
                    - ₹{formatNumberByLang(discount, lang)}
                  </Text>
                </View>
              )}

              {totalTax > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {t("cart.tax", { defaultValue: "Estimated Tax" })}
                  </Text>
                  <Text style={styles.summaryValue}>
                    ₹{formatNumberByLang(Math.round(totalTax), lang)}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>
                  {t("cart.total", { defaultValue: "Total" })}
                </Text>
                <Text style={styles.totalValue}>
                  ₹{formatNumberByLang(Math.round(grandTotal), lang)}
                </Text>
              </View>
            </View>
          </Animated.ScrollView>

          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomBarTotalLabel}>
                {t("cart.total", { defaultValue: "Total" })}
              </Text>
              <Text style={styles.bottomBarTotalValue}>
                ₹{formatNumberByLang(Math.round(grandTotal), lang)}
              </Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
              <Text style={styles.checkoutBtnText}>
                {t("cart.checkout", { defaultValue: "Proceed to Checkout" })}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BrandColors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  scrollContent: { flex: 1 },
  scrollPadding: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BrandColors.dark,
    marginBottom: 12,
  },
  itemsList: { gap: 12, marginBottom: 24 },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: BrandColors.dark,
    marginBottom: 4,
  },
  itemSpecsContainer: { marginBottom: 6 },
  itemSpecText: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: BrandColors.primary },
  qtyControls: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "600",
    marginHorizontal: 12,
    color: BrandColors.dark,
  },
  removeBtn: { padding: 4 },
  summaryBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.dark,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 14, color: "#4B5563" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: BrandColors.dark },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: BrandColors.dark },
  totalValue: { fontSize: 18, fontWeight: "700", color: BrandColors.primary },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 10,
    paddingHorizontal:15,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  bottomBarTotalLabel: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  bottomBarTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: BrandColors.dark,
    marginTop: 2,
  },
  checkoutBtn: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  checkoutBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
