import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { shopApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { formatNumberByLang } from '@/services/localization';
import RazorpayCheckout from 'react-native-razorpay';
import { FontAwesome5 } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const { isAuthenticated, token } = useAuth();
  const { cart: globalCart, buyNowItem, setBuyNowItem, updateQuantity, removeFromCart, clearCart } = useCart();
  const cart = buyNowItem ? [buyNowItem] : globalCart;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [successData, setSuccessData] = useState<{ visible: boolean; orderId: string } | null>(null);
  const insets = useSafeAreaInsets();

  // Address
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [serviceabilityLoading, setServiceabilityLoading] = useState(false);

  useEffect(() => {
    const checkPincode = async () => {
      const postalCode = newAddress.postalCode;
      if (postalCode.length === 6 && /^\d+$/.test(postalCode)) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            setNewAddress(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
          }
        } catch (err) {
          console.error(err);
        }

        try {
          setServiceabilityLoading(true);
          const pickup_postcode = "741257"; 
          const res = await shopApi.get(`/courier/serviceability?pickup_postcode=${pickup_postcode}&delivery_postcode=${postalCode}`);
          
          if (res.data?.status === 404 || !res.data) {
            setIsServiceable(false);
          } else {
            setIsServiceable(true);
          }
        } catch (error: any) {
          setIsServiceable(false);
        } finally {
          setServiceabilityLoading(false);
        }
      } else if (postalCode.length < 6) {
        setIsServiceable(null);
      }
    };

    checkPincode();
  }, [newAddress.postalCode]);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated || !token) {
      Alert.alert('Login Required', 'You must be logged in to checkout.', [
        { text: 'Login', onPress: () => router.replace('/login') },
        { text: 'Cancel', onPress: () => router.back(), style: 'cancel' }
      ]);
    } else {
      fetchAddresses();
      fetchCoupons();
    }
    
    return () => {
      // Clear buy now item when leaving checkout screen
      setBuyNowItem(null);
    };
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await shopApi.get('/addresses');
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await shopApi.get(`/coupons/available?lang=${lang}`);
      setAvailableCoupons(res.data?.data?.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  const getProductPrice = (product: any) => product.price || product.displayPrice || 0;
  const getProductMrp = (product: any) => product.mrp || product.displayMrp || getProductPrice(product);

  const totalMRP = cart.reduce((sum, item) => sum + getProductMrp(item.product) * item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + getProductPrice(item.product) * item.quantity, 0);
  const totalDiscount = totalMRP - totalPrice;
  const deliveryCharge = 0;

  // 1. Calculate coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      couponDiscount = totalPrice * (appliedCoupon.value / 100);
      if (appliedCoupon.maxDiscount > 0 && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      couponDiscount = Math.min(appliedCoupon.value, totalPrice);
    }
    couponDiscount = Math.round(couponDiscount);
  }

  // 2. Apportion discount and calculate tax
  let totalTax = 0;
  cart.forEach((item) => {
    const itemSubtotal = getProductPrice(item.product) * item.quantity;
    
    let apportionedDiscount = 0;
    if (couponDiscount > 0 && totalPrice > 0) {
      const weight = itemSubtotal / totalPrice;
      apportionedDiscount = Math.round(couponDiscount * weight);
    }
    
    const effectiveSubtotal = itemSubtotal - apportionedDiscount;
    
    let itemTax = 0;
    const effectiveTax = item.product.effectiveTax;
    if (effectiveTax && effectiveTax.length > 0) {
      effectiveTax.forEach((tax: any) => {
        itemTax += Math.round(effectiveSubtotal * (tax.slab / 100));
      });
    }
    totalTax += itemTax;
  });

  const finalTotal = Math.max(0, totalPrice - couponDiscount + totalTax + deliveryCharge);

  const handleApplyCoupon = async (codeToApply?: string) => {
    setCouponError(null);
    const code = codeToApply || couponCode;
    if (!code) {
      setCouponError(t('checkout.enterCouponCode', 'Please enter a coupon code'));
      return;
    }
    
    setLoading(true);
    if (codeToApply) setCouponCode(codeToApply);

    try {
      const res = await shopApi.get(`/coupons/validate?code=${code}&subtotal=${totalPrice}`);
      const data = res.data?.data;
      
      if (data?.valid) {
        setAppliedCoupon(data.coupon);
        setCouponError(null);
        Alert.alert('Success', t('checkout.couponSuccess', 'Coupon applied successfully!'));
      } else {
        setAppliedCoupon(null);
        let errStr = data?.error || t('checkout.invalidCoupon', 'Invalid coupon code');
        if (errStr.toLowerCase().includes('already used')) errStr = t('checkout.couponAlreadyUsed', 'You have already used this coupon');
        setCouponError(errStr);
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      let errStr = error.response?.data?.message || t('checkout.couponFailed', 'Failed to apply coupon');
      if (errStr.toLowerCase().includes('already used')) errStr = t('checkout.couponAlreadyUsed', 'You have already used this coupon');
      setCouponError(errStr);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSaveAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      Alert.alert('Required Fields', 'Please fill all required fields');
      return;
    }
    if (isServiceable === false) {
      Alert.alert('Delivery Unavailable', 'Cannot save address as delivery is not available to this PIN code.');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await shopApi.post('/addresses', {
        ...newAddress,
        isDefault: addresses.length === 0,
      });
      const savedAddress = res.data?.data || res.data;
      
      // Update local state
      const updatedAddresses = [...addresses, savedAddress];
      setAddresses(updatedAddresses);
      setSelectedAddress(savedAddress);
      setShowAddressForm(false);
      setNewAddress({
        fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India',
      });
      // Alert.alert('Success', 'Address saved successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', t('checkout.selectAddress', 'Please select a delivery address'));
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Cart Empty', t('checkout.emptyCart', 'Your cart is empty'));
      return;
    }

    setPlacingOrder(true);
    try {
      const orderItems = cart.map((item) => {
        const variant = item.product.variants?.[item.variantIndex || 0];
        const variantId = variant?._id || variant?.id || item.product.variantId || item.product.defaultVariantId || item.product._id || item.product.id;
        return {
          variantId,
          quantity: item.quantity,
        };
      });

      const shippingAddress = {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
      };

      // 1. Create Order
      const orderRes = await shopApi.post('/orders', {
        items: orderItems,
        shippingAddress,
        appliedCoupon: appliedCoupon?.code,
        isCartCheckout: !buyNowItem,
      });
      const orderData = orderRes.data?.data;
      const orderId = orderData?.orderId;
      const customOrderId = orderData?.customOrderId || orderId;
      if (!orderId) throw new Error(t('checkout.failedCreateOrder', 'Failed to create order'));

      // 2. Online Payment (Razorpay)
      const initRes = await shopApi.post('/payments/initiate', { orderId });
      const transactionData = initRes.data?.data;
      if (!transactionData?.gatewayOrderId) {
        throw new Error(t('checkout.failedInitiatePayment', 'Failed to initiate payment gateway'));
      }

      const options = {
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: 'Pripriya Nursery',
        description: 'Order Payment',
        order_id: transactionData.gatewayOrderId,
        prefill: {
          name: selectedAddress.fullName,
          contact: selectedAddress.phone,
        },
        theme: { color: '#36a35b' },
      };

      try {
        if (!RazorpayCheckout || !RazorpayCheckout.open) {
          if (__DEV__) {
            Alert.alert(
              'Test Mode (Expo Go)',
              'Razorpay is not available in Expo Go. Would you like to simulate a successful payment to test the order flow?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Simulate Success', 
                  onPress: () => {
                    if (!buyNowItem) clearCart();
                    setSuccessData({ visible: true, orderId: customOrderId });
                  } 
                }
              ]
            );
            return;
          } else {
            throw new Error('Razorpay native module is missing. Please build a custom dev client to process payments.');
          }
        }
        
        const response = await RazorpayCheckout.open(options);
        
        // Verify payment
        const verifyRes = await shopApi.post('/payments/verify', {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        if (!buyNowItem) clearCart();
        setSuccessData({ visible: true, orderId: customOrderId });
      } catch (err: any) {
        console.log('Razorpay Error:', err);
        Alert.alert('Payment Failed', 'Payment failed, please try again later.');
      }

    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || error.message || t('checkout.failedPlaceOrder', 'Failed to place order'));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!mounted || isAuthenticated === false) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome5 name="chevron-left" size={20} color={BrandColors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('checkout.title', 'Checkout')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 12 }}>
        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{t('checkout.deliveryAddress', 'Delivery Address')}</Text>
            <TouchableOpacity onPress={() => setShowAddressForm(!showAddressForm)}>
              <Text style={styles.addAddressText}>{showAddressForm ? 'Cancel' : '+ ' + t('checkout.addNewAddress', 'Add New Address')}</Text>
            </TouchableOpacity>
          </View>

          {showAddressForm ? (
            <View style={styles.addressForm}>
              <TextInput style={styles.formInput} placeholder="Full Name *" placeholderTextColor="#9CA3AF" value={newAddress.fullName} onChangeText={(t) => setNewAddress({...newAddress, fullName: t})} />
              <TextInput style={styles.formInput} placeholder="Phone Number *" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={newAddress.phone} onChangeText={(t) => setNewAddress({...newAddress, phone: t})} />
              <TextInput style={styles.formInput} placeholder="Address Line 1 *" placeholderTextColor="#9CA3AF" value={newAddress.addressLine1} onChangeText={(t) => setNewAddress({...newAddress, addressLine1: t})} />
              <TextInput style={styles.formInput} placeholder="Address Line 2 (Optional)" placeholderTextColor="#9CA3AF" value={newAddress.addressLine2} onChangeText={(t) => setNewAddress({...newAddress, addressLine2: t})} />
              <TextInput style={styles.formInput} placeholder="Postal Code *" placeholderTextColor="#9CA3AF" keyboardType="number-pad" maxLength={6} value={newAddress.postalCode} onChangeText={(t) => setNewAddress({...newAddress, postalCode: t})} />
              
              {serviceabilityLoading && <Text style={styles.serviceabilityTextChecking}>Checking delivery availability...</Text>}
              {isServiceable === false && <Text style={styles.serviceabilityTextError}>Delivery not available to this PIN code</Text>}
              {isServiceable === true && <Text style={styles.serviceabilityTextSuccess}>Delivery available!</Text>}
              
              <View style={styles.formRow}>
                <TextInput style={[styles.formInput, {flex: 1, marginRight: 8}]} placeholder="City *" placeholderTextColor="#9CA3AF" value={newAddress.city} onChangeText={(t) => setNewAddress({...newAddress, city: t})} />
                <TextInput style={[styles.formInput, {flex: 1}]} placeholder="State *" placeholderTextColor="#9CA3AF" value={newAddress.state} onChangeText={(t) => setNewAddress({...newAddress, state: t})} />
              </View>
              {(() => {
                const isFormValid = newAddress.fullName.trim() !== '' &&
                                    newAddress.phone.trim() !== '' &&
                                    newAddress.addressLine1.trim() !== '' &&
                                    newAddress.city.trim() !== '' &&
                                    newAddress.state.trim() !== '' &&
                                    newAddress.postalCode.length === 6 &&
                                    isServiceable === true;
                
                return (
                  <TouchableOpacity 
                    style={[styles.saveAddressBtn, (!isFormValid || savingAddress) && {opacity: 0.5}]} 
                    onPress={handleSaveAddress} 
                    disabled={!isFormValid || savingAddress}
                  >
                    {savingAddress ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveAddressBtnText}>Save Address</Text>}
                  </TouchableOpacity>
                );
              })()}
            </View>
          ) : loadingAddresses ? (
            <ActivityIndicator size="small" color={BrandColors.primary} />
          ) : addresses.length === 0 ? (
            <View style={styles.noAddressBox}>
              <Text style={styles.noAddressText}>{t('checkout.noAddresses', 'You have no saved addresses.')}</Text>
              <TouchableOpacity style={styles.addAddressBtn} onPress={() => setShowAddressForm(true)}>
                <Text style={styles.addAddressBtnText}>{t('checkout.addNewAddress', 'Add New Address')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressList}>
              {(addresses.length > 1 && !showAllAddresses ? [selectedAddress || addresses[0]] : addresses).map((addr) => (
                <TouchableOpacity
                  key={addr._id}
                  style={[
                    styles.addressCard,
                    selectedAddress?._id === addr._id && styles.selectedAddressCard,
                  ]}
                  onPress={() => setSelectedAddress(addr)}
                >
                  <View style={styles.addressRow}>
                    <Text style={styles.addressName}>{addr.fullName}</Text>
                    {selectedAddress?._id === addr._id && (
                      <IconSymbol name="checkmark.circle.fill" size={20} color={BrandColors.primary} />
                    )}
                  </View>
                  <Text style={styles.addressText}>
                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state}, {addr.postalCode}
                  </Text>
                  <Text style={styles.addressPhone}>{addr.phone}</Text>
                </TouchableOpacity>
              ))}
              
              {addresses.length > 1 && !showAllAddresses && (
                <TouchableOpacity onPress={() => setShowAllAddresses(true)} style={styles.showMoreAddrBtn}>
                  <Text style={styles.showMoreAddrText}>{t('checkout.selectAnotherAddress', 'Select another address')}</Text>
                </TouchableOpacity>
              )}
              {addresses.length > 1 && showAllAddresses && (
                <TouchableOpacity onPress={() => setShowAllAddresses(false)} style={styles.showMoreAddrBtn}>
                  <Text style={styles.showMoreAddrText}>{t('checkout.hideAddresses', 'Hide')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Ordered Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.orderedProducts', 'Ordered Products')}</Text>
          <View style={styles.productList}>
            {cart.map((item) => {
              const product = item.product;
              const img = product.image || product.coverImage?.url || product.imageUrl || 'https://via.placeholder.com/150';
              const price = getProductPrice(product);
              
              return (
                <View key={item.id} style={styles.cartItem}>
                  <TouchableOpacity onPress={() => router.push(`/product/${product.slug || product.id}`)}>
                    <Image source={{ uri: img }} style={styles.itemImg} />
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={() => router.push(`/product/${product.slug || product.id}`)}>
                          <Text style={styles.itemTitle} numberOfLines={2}>{product.title}</Text>
                        </TouchableOpacity>
                        
                        {/* Render Specifications / Attributes */}
                        {(() => {
                          let attrs = product.attributes;
                          if (item.variantIndex !== undefined && product.variants && product.variants[item.variantIndex]) {
                            attrs = product.variants[item.variantIndex].attributes || attrs;
                          } else if (!attrs && product.variants && product.variants.length > 0) {
                            const defVar = product.variants.find((v: any) => v._id === product.defaultVariantId) || product.variants[0];
                            attrs = defVar.attributes || attrs;
                          }

                          const hasAttrs = attrs && typeof attrs === 'object' && Object.keys(attrs).length > 0;
                          const specs = product.specs;
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
                      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                        <IconSymbol name="trash" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.itemBottomRow}>
                      <Text style={styles.itemPrice}>₹{formatNumberByLang(price, lang)}</Text>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}>
                          <IconSymbol name="minus" size={14} color="#4B5563" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{formatNumberByLang(item.quantity, lang)}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                          <IconSymbol name="plus" size={14} color="#4B5563" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.paymentMethod', 'Payment Method')}</Text>
          <View style={styles.paymentCard}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={BrandColors.primary} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>{t('checkout.onlinePayment', 'Online Payment')}</Text>
              <Text style={styles.paymentDesc}>{t('checkout.paymentOptions', 'Credit Card, UPI, Wallets, NetBanking via Razorpay')}</Text>
            </View>
          </View>
        </View>

        {/* Coupons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('cart.couponTitle', 'Apply Coupon')}</Text>
          
          {!appliedCoupon ? (
            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder={t('cart.couponPlaceholder', 'Enter coupon code')}
                placeholderTextColor="#9CA3AF"
                value={couponCode}
                onChangeText={(text) => {
                  setCouponCode(text);
                  setCouponError(null);
                }}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={styles.applyBtn} 
                onPress={() => handleApplyCoupon()}
                disabled={loading || !couponCode}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.applyBtnText}>{t('common.apply', 'Apply')}</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.appliedCouponCard}>
              <View>
                <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                <Text style={styles.appliedCouponText}>{t('checkout.couponSuccess', 'Coupon applied successfully')}</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={styles.removeCouponText}>{t('checkout.remove', 'Remove')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {couponError && <Text style={styles.couponErrorText}>{couponError}</Text>}

          {!appliedCoupon && availableCoupons.length > 0 && (
            <View style={styles.availableCouponsList}>
              <Text style={styles.availableCouponsTitle}>{t('checkout.availableCoupons', 'Available Coupons')}</Text>
              {availableCoupons.map((coupon) => {
                const isApplicable = !coupon.minPurchase || totalPrice >= coupon.minPurchase;
                return (
                  <TouchableOpacity 
                    key={coupon.code}
                    style={[styles.couponCard, !isApplicable && styles.disabledCouponCard]}
                    onPress={() => isApplicable && handleApplyCoupon(coupon.code)}
                    disabled={!isApplicable}
                  >
                    <View style={styles.couponCardLeft}>
                      <Text style={[styles.couponCardCode, !isApplicable && { color: '#6B7280' }]}>{coupon.code}</Text>
                      <Text style={styles.couponCardDesc}>
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        {coupon.type === 'percentage' && coupon.maxDiscount > 0 ? ` (Up to ₹${coupon.maxDiscount})` : ''}
                      </Text>
                      {coupon.minPurchase > 0 && (
                        <Text style={styles.couponCardMin}>Min order: ₹{coupon.minPurchase}</Text>
                      )}
                    </View>
                    <View style={styles.couponCardRight}>
                      <Text style={[styles.couponCardApply, !isApplicable && { color: '#9CA3AF' }]}>
                        {t('common.apply', 'Apply')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={styles.sectionTitle}>{t('cart.orderSummary', 'Order Summary')}</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.price', 'Price')} ({formatNumberByLang(cart.length, lang)} {t('cart.items', 'items')})</Text>
            <Text style={styles.summaryValue}>₹{formatNumberByLang(totalMRP, lang)}</Text>
          </View>
          
          {totalDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.discount', 'Discount')}</Text>
              <Text style={[styles.summaryValue, { color: BrandColors.primary }]}>-₹{formatNumberByLang(totalDiscount, lang)}</Text>
            </View>
          )}

          {couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.couponDiscount', 'Coupon Discount')}</Text>
              <Text style={[styles.summaryValue, { color: BrandColors.primary }]}>-₹{formatNumberByLang(couponDiscount, lang)}</Text>
            </View>
          )}

          {totalTax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.tax', 'Estimated Tax')}</Text>
              <Text style={styles.summaryValue}>+₹{formatNumberByLang(totalTax, lang)}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.deliveryCharge', 'Delivery Charge')}</Text>
            <Text style={styles.summaryValue}>₹0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t('cart.totalAmount', 'Total Amount')}</Text>
            <Text style={styles.totalValue}>₹{formatNumberByLang(finalTotal, lang)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View>
          <Text style={styles.bottomBarTotalLabel}>{t('cart.totalAmount', 'Total Amount')}</Text>
          <Text style={styles.bottomBarTotalValue}>₹{formatNumberByLang(finalTotal, lang)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.placeOrderBtn, (cart.length === 0 || placingOrder) && { opacity: 0.7 }]} 
          onPress={handlePlaceOrder}
          disabled={cart.length === 0 || placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" size={18} color="#FFF" />
              <Text style={styles.placeOrderBtnText}>{t('common.placeOrder', 'Place Order')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Success Modal */}
      <Modal visible={!!successData?.visible} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFF', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>
            <View style={{ marginBottom: 24 }}>
              <IconSymbol name="checkmark.circle.fill" size={80} color="#22C55E" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: BrandColors.dark, marginBottom: 12, textAlign: 'center' }}>
              Payment Successful!
            </Text>
            {!!successData?.orderId && (
              <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D1FAE5', marginBottom: 24 }}>
                <Text style={{ color: '#065F46', fontSize: 16, fontWeight: '700' }}>Order ID: {successData.orderId}</Text>
              </View>
            )}
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
              Thank you for your order! Your payment has been securely processed and your order is now confirmed. We will notify you once it ships.
            </Text>
            
            <View style={{ width: '100%', gap: 12 }}>
              <TouchableOpacity 
                style={{ backgroundColor: BrandColors.primary, width: '100%', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onPress={() => {
                  setSuccessData(null);
                  router.replace('/orders');
                }}
              >
                <FontAwesome5 name="shopping-bag" size={20} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>View My Orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ backgroundColor: '#F3F4F6', width: '100%', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                  setSuccessData(null);
                  router.replace('/(tabs)');
                }}
              >
                <Text style={{ color: BrandColors.dark, fontSize: 16, fontWeight: '700' }}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: BrandColors.dark },
  content: { flex: 1 },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: BrandColors.dark, marginBottom: 12 },
  addAddressText: { fontSize: 14, fontWeight: '600', color: BrandColors.primary },
  noAddressBox: { padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  noAddressText: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  addAddressBtn: { backgroundColor: BrandColors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  addAddressBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  addressForm: { marginTop: 8 },
  formInput: { height: 44, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#F9FAFB', marginBottom: 12, fontSize: 14 },
  formRow: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceabilityTextChecking: { fontSize: 12, color: '#6B7280', marginBottom: 8, marginTop: -4, paddingHorizontal: 4 },
  serviceabilityTextError: { fontSize: 12, color: '#EF4444', marginBottom: 8, marginTop: -4, paddingHorizontal: 4 },
  serviceabilityTextSuccess: { fontSize: 12, color: '#10B981', marginBottom: 8, marginTop: -4, paddingHorizontal: 4 },
  saveAddressBtn: { backgroundColor: BrandColors.primary, height: 44, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  saveAddressBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  addressList: { gap: 12 },
  addressCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10 },
  selectedAddressCard: { borderColor: BrandColors.primary, backgroundColor: '#F0FDF4' },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  addressName: { fontSize: 14, fontWeight: '700', color: BrandColors.dark },
  addressText: { fontSize: 13, color: '#4B5563', marginBottom: 4 },
  addressPhone: { fontSize: 13, fontWeight: '600', color: '#374151' },
  showMoreAddrBtn: { marginTop: 8, paddingVertical: 8, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 6 },
  showMoreAddrText: { fontSize: 13, fontWeight: '600', color: BrandColors.primary },
  productList: { gap: 16 },
  cartItem: { flexDirection: 'row', gap: 12 },
  itemImg: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#F3F4F6' },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { fontSize: 14, fontWeight: '600', color: BrandColors.dark, marginRight: 8 },
  itemSpecsContainer: { marginTop: 4, marginBottom: 2 },
  itemSpecText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  removeBtn: { padding: 4 },
  itemBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: BrandColors.dark },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qtyText: { fontSize: 13, fontWeight: '600', color: BrandColors.dark, minWidth: 20, textAlign: 'center' },
  paymentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: BrandColors.primary },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: 14, fontWeight: '700', color: BrandColors.dark, marginBottom: 2 },
  paymentDesc: { fontSize: 12, color: '#4B5563' },
  couponInputRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, height: 44, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#F9FAFB', fontSize: 14, textTransform: 'uppercase' },
  applyBtn: { height: 44, paddingHorizontal: 20, backgroundColor: BrandColors.secondary, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: BrandColors.dark, fontSize: 14, fontWeight: '600' },
  couponErrorText: { color: '#EF4444', fontSize: 12, marginTop: 6, fontWeight: '500' },
  appliedCouponCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0' },
  appliedCouponCode: { fontSize: 14, fontWeight: '700', color: '#166534', marginBottom: 2 },
  appliedCouponText: { fontSize: 12, color: '#15803D' },
  removeCouponText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
  availableCouponsList: { marginTop: 16, gap: 8 },
  availableCouponsTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 },
  couponCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, borderStyle: 'dashed', backgroundColor: '#F9FAFB' },
  disabledCouponCard: { backgroundColor: '#F3F4F6', opacity: 0.6 },
  couponCardLeft: { flex: 1 },
  couponCardCode: { fontSize: 14, fontWeight: '700', color: BrandColors.primary, marginBottom: 2 },
  couponCardDesc: { fontSize: 12, color: '#4B5563' },
  couponCardMin: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  couponCardRight: { marginLeft: 12 },
  couponCardApply: { fontSize: 12, fontWeight: '600', color: BrandColors.primary, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF', borderRadius: 4, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: '#4B5563' },
  summaryValue: { fontSize: 14, fontWeight: '500', color: BrandColors.dark },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: BrandColors.dark },
  totalValue: { fontSize: 18, fontWeight: '700', color: BrandColors.dark },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10,
  },
  bottomBarTotalLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  bottomBarTotalValue: { fontSize: 18, fontWeight: '700', color: BrandColors.dark },
  placeOrderBtn: {
    backgroundColor: BrandColors.primary, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  placeOrderBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
