import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { shopApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatNumberByLang } from '@/services/localization';

export default function OrdersScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState<{ orderId: string; itemId?: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false) {
      Alert.alert('Please Login', 'You need to be logged in to view your orders.', [
        { text: 'Login', onPress: () => router.push('/login') },
        { text: 'Cancel', onPress: () => router.back(), style: 'cancel' }
      ]);
    } else if (isAuthenticated === true) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await shopApi.get('/orders/me');
      if (res.data?.data?.orders) {
        setOrders(res.data.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOpen) return;
    if (cancelReason.trim().length < 5) {
      setCancelError("Cancellation reason must be at least 5 characters long.");
      return;
    }
    
    try {
      setIsCancelling(true);
      setCancelError("");
      
      const { orderId, itemId } = cancelModalOpen;
      if (itemId) {
        await shopApi.patch(`/orders/me/${orderId}/items/${itemId}/cancel`, { reason: cancelReason.trim() });
      } else {
        await shopApi.patch(`/orders/me/${orderId}/cancel`, { reason: cancelReason.trim() });
      }
      
      fetchOrders();
      setCancelModalOpen(null);
      setCancelReason("");
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      setCancelError(error.response?.data?.message || "Failed to cancel order. It might already be shipped.");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return BrandColors.primary;
      case 'cancelled': return BrandColors.red;
      default: return '#F59E0B'; // amber
    }
  };

  const renderOrderItem = (order: any, item: any, idx: number) => {
    const title = item.translations?.title?.[i18n.language] || item.snapshot?.title;
    const isCancelled = item.itemStatus === 'cancelled' || order.orderStatus === 'cancelled';
    
    return (
      <View key={idx} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemStatus, { color: getStatusColor(isCancelled ? 'cancelled' : order.orderStatus) }]}>
            {isCancelled ? t('orders.cancelled', 'Cancelled') : 
             order.orderStatus === 'delivered' ? t('orders.delivered', 'Delivered') : 
             order.orderStatus === 'shipped' ? t('orders.shipped', 'Shipped') :
             order.orderStatus === 'processing' ? t('orders.processing', 'Processing') :
             order.orderStatus.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.itemContent}>
          <Image 
            source={{ uri: item.snapshot?.coverImage || 'https://via.placeholder.com/150' }} 
            style={styles.itemImage} 
            resizeMode="cover"
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.itemMeta}>
              {t('orders.qty', 'Qty:')} {formatNumberByLang(item.quantity, i18n.language)} | {formatPrice(item.price)} {t('orders.each', 'each')}
            </Text>

            <View style={styles.itemActions}>
              <TouchableOpacity 
                style={styles.viewItemBtn}
                onPress={() => router.push(`/product/${item.slug || item.productId}` as any)}
              >
                <Text style={styles.viewItemBtnText}>{t('orders.viewItem', 'View Item')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.viewDetailsBtn}
                onPress={() => router.push(`/orders/${order._id}` as any)}
              >
                <Text style={styles.viewDetailsBtnText}>{t('orders.viewDetails', 'View Details')}</Text>
              </TouchableOpacity>
            </View>

            {order.orderStatus === 'processing' && item.itemStatus !== 'cancelled' && (
              <TouchableOpacity 
                style={styles.cancelItemBtn}
                onPress={() => {
                  setCancelModalOpen({ orderId: order._id, itemId: item._id || item.variantId });
                  setCancelReason("");
                  setCancelError("");
                }}
              >
                <Text style={styles.cancelItemBtnText}>{t('orders.cancelItem', 'Cancel Item')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderOrder = ({ item: order }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderRow}>
          <View style={styles.orderHeaderCol}>
            <Text style={styles.orderHeaderLabel}>{t('orders.orderPlaced', 'Order Placed')}</Text>
            <Text style={styles.orderHeaderValue}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.orderHeaderCol}>
            <Text style={styles.orderHeaderLabel}>{t('orders.totalAmount', 'Total Amount')}</Text>
            <Text style={styles.orderHeaderValue}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>
        <View style={[styles.orderHeaderRow, { marginTop: 8 }]}>
          <Text style={styles.orderIdLabel}>
            {t('orders.orderId', 'Order ID:')} <Text style={styles.orderIdValue}>{formatNumberByLang(formatOrderId(order), i18n.language)}</Text>
          </Text>
        </View>
      </View>
      
      <View style={styles.orderItemsList}>
        {order.items.map((item: any, idx: number) => renderOrderItem(order, item, idx))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={BrandColors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('orders.title', 'Your Orders')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="cube.box" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>{t('orders.noOrders', 'No orders found')}</Text>
          <Text style={styles.emptyDesc}>{t('orders.noOrdersDesc', "Looks like you haven't placed any orders yet.")}</Text>
          <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopNowBtnText}>{t('common.shopNow', 'Start Shopping')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Cancel Modal */}
      <Modal visible={!!cancelModalOpen} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderBox}>
              <Text style={styles.modalTitle}>{t('orders.cancelOrder', 'Cancel Order')}</Text>
              <Text style={styles.modalSubtitle}>{t('orders.cancelReasonDesc', 'Please provide a reason for cancelling this order.')}</Text>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={styles.cancelInput}
                multiline
                numberOfLines={4}
                value={cancelReason}
                onChangeText={(t) => { setCancelReason(t); setCancelError(""); }}
                placeholder={t('orders.cancelReasonPlaceholder', 'I changed my mind...')}
                textAlignVertical="top"
              />
              {!!cancelError && <Text style={styles.errorText}>{cancelError}</Text>}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setCancelModalOpen(null)} disabled={isCancelling}>
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
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    backgroundColor: '#FCFBF8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderHeaderCol: {
    flexDirection: 'column',
  },
  orderHeaderLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderHeaderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.dark,
  },
  orderIdLabel: {
    fontSize: 13,
    color: '#4B5563',
  },
  orderIdValue: {
    fontWeight: '700',
    color: BrandColors.dark,
  },
  orderItemsList: {
    padding: 0,
  },
  itemCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.dark,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewItemBtn: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewItemBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetailsBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewDetailsBtnText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelItemBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  cancelItemBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
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
  errorText: {
    color: BrandColors.red,
    fontSize: 12,
    marginTop: 8,
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
