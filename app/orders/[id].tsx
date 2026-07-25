import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { shopApi } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { formatNumberByLang } from '@/services/localization';
export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await shopApi.get(`/orders/me/${id}`);
      if (res.data?.data?.order) {
        setOrder(res.data.data.order);
      } else {
        setError(t('orders.orderNotFound', 'Order not found'));
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError(t('orders.failedLoadDetails', 'Failed to load order details'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (cancelReason.trim().length < 5) {
      setCancelError("Cancellation reason must be at least 5 characters long.");
      return;
    }
    
    try {
      setIsCancelling(true);
      setCancelError("");
      await shopApi.patch(`/orders/me/${order._id}/cancel`, { reason: cancelReason.trim() });
      
      fetchOrder();
      setCancelModalOpen(false);
      setCancelReason("");
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      setCancelError(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);
    return formatNumberByLang(formatted, i18n.language);
  };

  const formatOrderId = (order: any): string => {
    if (order.orderId) return order.orderId;
    if (!order._id) return '';
    const dateStr = new Date(order.createdAt || Date.now()).toISOString().split('T')[0].replace(/-/g, '');
    return `PP${dateStr}${order._id.toString().slice(-4).toUpperCase()}`;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = new Date(dateString).toLocaleDateString('en-IN', options);
    return formatNumberByLang(dateStr, i18n.language);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={styles.loadingText}>{t('orders.loadingDetails', 'Loading order details...')}</Text>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backToOrdersBtn} onPress={() => router.back()}>
          <Text style={styles.backToOrdersBtnText}>{t('orders.goBackToOrders', 'Go back to orders')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={BrandColors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('orders.orderId', 'Order ID:')} {formatNumberByLang(formatOrderId(order), i18n.language)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('orders.orderStatus', 'Order Status')}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusIconBox, 
              order.orderStatus === 'delivered' ? { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' } : 
              order.orderStatus === 'cancelled' ? { backgroundColor: '#FEE2E2', borderColor: '#FECACA' } : 
              order.orderStatus === 'shipped' ? { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' } : 
              { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }
            ]}>
              <IconSymbol 
                name={
                  order.orderStatus === 'delivered' ? 'checkmark.circle.fill' : 
                  order.orderStatus === 'cancelled' ? 'xmark' : 
                  order.orderStatus === 'shipped' ? 'paperplane.fill' : 
                  'play.fill'
                } 
                size={24} 
                color={
                  order.orderStatus === 'delivered' ? '#2A8C44' : 
                  order.orderStatus === 'cancelled' ? '#EF4444' : 
                  order.orderStatus === 'shipped' ? '#3B82F6' : 
                  '#F59E0B'
                } 
              />
            </View>
            <View style={styles.statusTextCol}>
              <Text style={styles.statusMainText}>
                {order.orderStatus === 'cancelled' ? t('orders.cancelled', 'Cancelled') : 
                 order.orderStatus === 'delivered' ? t('orders.delivered', 'Delivered') : 
                 order.orderStatus === 'shipped' ? t('orders.shipped', 'Shipped') :
                 order.orderStatus === 'processing' ? t('orders.processing', 'Processing') :
                 order.orderStatus.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.statusSubText}>{t('orders.placedOn', 'Placed on')} {formatDate(order.createdAt)}</Text>
            </View>
          </View>
          
          {order.orderStatus === 'processing' && (
            <View style={styles.cancelSection}>
              <Text style={styles.cancelWarning}>{t('orders.cancelWarningText', 'Changed your mind? You can cancel your order before it gets shipped.')}</Text>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => {
                  setCancelModalOpen(true);
                  setCancelReason("");
                  setCancelError("");
                }}
              >
                <Text style={styles.cancelBtnText}>{t('orders.cancelOrder', 'Cancel Order')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Timeline Card */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('orders.trackingTimeline', 'Tracking Timeline')}</Text>
            <View style={styles.timelineContainer}>
              <View style={styles.timelineLine} />
              {[...order.statusHistory].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((hist: any, idx: number) => (
                <View key={idx} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, idx === 0 ? styles.timelineDotActive : styles.timelineDotInactive]} />
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStatus, idx === 0 ? styles.timelineStatusActive : styles.timelineStatusInactive]}>
                      {hist.status}
                    </Text>
                    {!!hist.comment && <Text style={styles.timelineComment}>{hist.comment}</Text>}
                    <Text style={styles.timelineDate}>{formatNumberByLang(new Date(hist.timestamp).toLocaleString('en-IN'), i18n.language)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Items Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('orders.itemsInOrder', 'Items in your order')}</Text>
          {order.items.map((item: any, idx: number) => {
            const title = item.translations?.title?.[i18n.language] || item.snapshot?.title;
            const isCancelled = item.itemStatus === 'cancelled';
            return (
              <View key={idx} style={[styles.itemRow, idx !== order.items.length - 1 && styles.itemBorder, isCancelled && { opacity: 0.6 }]}>
                <Image source={{ uri: item.snapshot?.coverImage || 'https://via.placeholder.com/100' }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{title}</Text>
                  {isCancelled && (
                    <View style={styles.cancelledBadge}>
                      <Text style={styles.cancelledBadgeText}>{t('orders.cancelled', 'Cancelled')}</Text>
                    </View>
                  )}
                  <Text style={styles.itemQtyPrice}>{t('orders.qty', 'Qty:')} {formatNumberByLang(item.quantity, i18n.language)}  ✕  {formatPrice(item.price)} {t('orders.each', 'each')}</Text>
                  {!!item.snapshot?.sku && <Text style={styles.itemSku}>SKU: {item.snapshot.sku}</Text>}
                </View>
                <View style={styles.itemTotalCol}>
                  <Text style={[styles.itemTotalText, isCancelled && { textDecorationLine: 'line-through', color: '#9CA3AF' }]}>
                    {formatPrice(item.itemTotal)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('orders.orderSummary', 'Order Summary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('orders.subtotal', 'Subtotal')}</Text>
            <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('orders.tax', 'Tax')}</Text>
            <Text style={styles.summaryValue}>{formatPrice(order.taxTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('orders.shipping', 'Shipping')}</Text>
            <Text style={styles.summaryValue}>{formatPrice(order.shippingFee)}</Text>
          </View>
          {order.discountTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('orders.discount', 'Discount')}</Text>
              <Text style={[styles.summaryValue, { color: BrandColors.primary }]}>-{formatPrice(order.discountTotal)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('orders.total', 'Total')}</Text>
            <Text style={styles.totalValue}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>

        {/* Delivery & Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('orders.deliveryAndPayment', 'Delivery & Payment')}</Text>
          
          <Text style={styles.sectionSubTitle}>{t('orders.paymentMethod', 'Payment Method')}</Text>
          <View style={styles.paymentMethodRow}>
            <View style={styles.cardIconBox}><Text style={styles.cardIconText}>{t('orders.card', 'CARD')}</Text></View>
            <Text style={styles.paymentMethodText}>
              {order.paymentMethod === 'cod' ? t('orders.cod', 'Cash on Delivery') : t('orders.onlinePayment', 'Online Payment')}
            </Text>
          </View>

          <Text style={[styles.sectionSubTitle, { marginTop: 16 }]}>{t('orders.deliveryAddress', 'Delivery Address')}</Text>
          {order.shippingAddress ? (
            <View style={styles.addressBox}>
              <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
              <Text style={styles.addressText}>{order.shippingAddress.addressLine1}</Text>
              {!!order.shippingAddress.addressLine2 && <Text style={styles.addressText}>{order.shippingAddress.addressLine2}</Text>}
              <Text style={styles.addressText}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</Text>
              <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
              <Text style={styles.addressPhone}>Phone: {order.shippingAddress.phone}</Text>
            </View>
          ) : (
            <Text style={styles.addressText}>{t('orders.noAddressProvided', 'No address provided')}</Text>
          )}
        </View>

      </ScrollView>

      {/* Cancel Order Modal */}
      <Modal visible={cancelModalOpen} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderBox}>
              <Text style={styles.modalTitle}>{t('orders.cancelOrder', 'Cancel Order')}</Text>
              <Text style={styles.modalSubtitle}>{t('orders.cancelModalDesc', "We're sorry to see you cancel. Please provide a reason to help us improve our service.")}</Text>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={styles.cancelInput}
                multiline
                numberOfLines={4}
                value={cancelReason}
                onChangeText={(t) => { setCancelReason(t); setCancelError(""); }}
                placeholder={t('orders.typeReason', 'Type your reason here...')}
                textAlignVertical="top"
              />
              {!!cancelError && <Text style={styles.errorText}>{cancelError}</Text>}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setCancelModalOpen(false)} disabled={isCancelling}>
                <Text style={styles.modalBtnCancelText}>{t('orders.goBack', 'Go Back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleCancelOrder} disabled={isCancelling}>
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>{t('orders.confirmCancel', 'Confirm Cancellation')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  errorText: {
    color: BrandColors.red,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  backToOrdersBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backToOrdersBtnText: {
    color: BrandColors.primary,
    fontWeight: '500',
  },
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
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 16,
    color: '#4B5563',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.dark,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusTextCol: {
    flex: 1,
  },
  statusMainText: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
    marginBottom: 4,
  },
  statusSubText: {
    fontSize: 13,
    color: '#6B7280',
  },
  cancelSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelWarning: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    marginRight: 12,
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 8,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    marginTop: 2,
    zIndex: 10,
    backgroundColor: '#FFF',
  },
  timelineDotActive: {
    borderColor: BrandColors.primary,
    transform: [{ scale: 1.2 }],
  },
  timelineDotInactive: {
    borderColor: '#9CA3AF',
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineStatusActive: {
    color: BrandColors.dark,
  },
  timelineStatusInactive: {
    color: '#4B5563',
  },
  timelineComment: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.dark,
    marginBottom: 4,
  },
  cancelledBadge: {
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  cancelledBadgeText: {
    color: '#B91C1C',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemQtyPrice: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemSku: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  itemTotalCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotalText: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.dark,
  },
  reviewBtn: {
    marginTop: 12,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  reviewBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.dark,
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.dark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
  },
  sectionSubTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBox: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  cardIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.dark,
  },
  addressBox: {
    marginTop: 4,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.dark,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  addressPhone: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeaderBox: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  modalBody: {
    padding: 16,
  },
  cancelInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    height: 100,
    fontSize: 14,
    color: BrandColors.dark,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    padding: 16,
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  modalBtnConfirm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: BrandColors.red,
    justifyContent: 'center',
  },
  modalBtnConfirmText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
});
