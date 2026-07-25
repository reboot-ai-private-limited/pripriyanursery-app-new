import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';
import { BrandColors } from '@/constants/theme';
import { shopApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [saving, setSaving] = useState(false);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [serviceabilityLoading, setServiceabilityLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === false) {
      Alert.alert('Please Login', 'You need to be logged in to manage addresses', [
        { text: 'Login', onPress: () => router.push('/login') },
        { text: 'Cancel', onPress: () => router.back(), style: 'cancel' }
      ]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    const checkPincode = async () => {
      if (formData.postalCode.length === 6 && /^\d+$/.test(formData.postalCode)) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.postalCode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({ ...prev, city: postOffice.District, state: postOffice.State }));
          } else {
            Alert.alert('Error', 'Invalid PIN Code');
          }
        } catch (err) {
          console.error(err);
        }

        try {
          setServiceabilityLoading(true);
          const pickup_postcode = "741257";
          const res = await shopApi.get(`/courier/serviceability?pickup_postcode=${pickup_postcode}&delivery_postcode=${formData.postalCode}`);
          
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
      } else if (formData.postalCode.length < 6) {
        setIsServiceable(null);
      }
    };

    if (formData.postalCode.length === 6) {
      checkPincode();
    }
  }, [formData.postalCode]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await shopApi.get('/addresses');
      if (res.data?.data) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    if (formData.phone.length !== 10) {
      Alert.alert('Error', 'Mobile Number must be 10 digits');
      return;
    }
    
    if (formData.postalCode.length !== 6) {
      Alert.alert('Error', 'PIN Code must be 6 digits');
      return;
    }

    if (isServiceable === false) {
      Alert.alert('Error', 'Delivery is not available to this PIN code');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await shopApi.patch(`/addresses/${editingId}`, formData);
      } else {
        await shopApi.post('/addresses', formData);
      }
      setModalVisible(false);
      resetForm();
      fetchAddresses();
    } catch (err: any) {
      console.error('Failed to save address', err.response?.data);
      Alert.alert('Error', err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await shopApi.delete(`/addresses/${id}`);
            fetchAddresses();
          } catch (err) {
            console.error('Failed to delete address', err);
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await shopApi.patch(`/addresses/${id}/default`);
      fetchAddresses();
    } catch (err) {
      console.error('Failed to set default address', err);
    }
  };

  const openEditModal = (addr: Address) => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
    setEditingId(addr._id);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Address }) => (
    <View style={styles.card}>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>{t('common.default', 'Default')}</Text>
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      
      <Text style={styles.addressText}>{item.addressLine1}</Text>
      {!!item.addressLine2 && <Text style={styles.addressText}>{item.addressLine2}</Text>}
      <Text style={styles.addressText}>{`${item.city}, ${item.state} ${item.postalCode}`}</Text>
      <Text style={styles.addressText}>{item.country}</Text>

      <View style={styles.actions}>
        {!item.isDefault && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(item._id)}>
            <Text style={styles.actionText}>{t('common.setDefault', 'Set as Default')}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.actionGroup}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEditModal(item)}>
            <IconSymbol name="pencil" size={16} color={BrandColors.primary} />
            <Text style={[styles.actionText, { color: BrandColors.primary, marginLeft: 4 }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item._id)}>
            <IconSymbol name="trash" size={16} color={BrandColors.red} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={BrandColors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('address.manageAddress', 'My Addresses')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="location" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('checkout.noAddresses', 'No addresses found')}</Text>
            </View>
          }
        />
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>{t('address.addAddress', 'Add New Address')}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1, backgroundColor: '#FFF' }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? t('common.edit', 'Edit Address') : t('address.addAddress', 'Add New Address')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <IconSymbol name="xmark" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('address.name', 'Full Name')} *</Text>
                <TextInput style={styles.input} value={formData.fullName} onChangeText={t => setFormData({...formData, fullName: t})} placeholder={t('address.name', 'Full Name')} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('account.mobileNumber', 'Phone Number')} *</Text>
                <TextInput style={styles.input} value={formData.phone} onChangeText={t => setFormData({...formData, phone: t})} placeholder={t('address.tenDigits', '10 digits')} keyboardType="phone-pad" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('address.areaStreet', 'Address Line 1')} *</Text>
                <TextInput style={styles.input} value={formData.addressLine1} onChangeText={t => setFormData({...formData, addressLine1: t})} placeholder={t('address.areaStreet', 'Address Line 1')} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('address.areaStreet', 'Address Line 2')} 2</Text>
                <TextInput style={styles.input} value={formData.addressLine2} onChangeText={t => setFormData({...formData, addressLine2: t})} placeholder={t('address.localityOptional', 'Locality (Optional)')} />
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>{t('address.city', 'City')} *</Text>
                  <TextInput style={styles.input} value={formData.city} onChangeText={t => setFormData({...formData, city: t})} placeholder={t('address.city', 'City')} />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>{t('address.pinCode', 'Postal Code')} *</Text>
                  <TextInput style={styles.input} value={formData.postalCode} onChangeText={t => setFormData({...formData, postalCode: t.replace(/\D/g, '').slice(0,6)})} placeholder={t('address.pinCode', 'PIN Code')} keyboardType="numeric" />
                  {serviceabilityLoading && (
                    <Text style={{ fontSize: 11, color: BrandColors.primary, marginTop: 4 }}>Checking...</Text>
                  )}
                  {!serviceabilityLoading && isServiceable === true && (
                    <Text style={{ fontSize: 11, color: BrandColors.primary, marginTop: 4 }}>Delivery Available</Text>
                  )}
                  {!serviceabilityLoading && isServiceable === false && (
                    <Text style={{ fontSize: 11, color: BrandColors.red, marginTop: 4 }}>Not Serviceable</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('address.state', 'State')} *</Text>
                <TextInput style={styles.input} value={formData.state} onChangeText={t => setFormData({...formData, state: t})} placeholder={t('address.state', 'State')} />
              </View>

              {(() => {
                const isFormValid = formData.fullName && formData.phone.length === 10 && formData.addressLine1 && formData.city && formData.state && formData.postalCode.length === 6 && isServiceable;
                const isDisabled = saving || serviceabilityLoading || !isFormValid;
                return (
                  <TouchableOpacity 
                    style={[styles.saveBtn, isDisabled && { opacity: 0.5, backgroundColor: '#9CA3AF' }]} 
                    onPress={handleSave}
                    disabled={isDisabled}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.saveBtnText}>{t('checkout.saveAddress', 'Save Address')}</Text>
                    )}
                  </TouchableOpacity>
                );
              })()}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 20, fontWeight: '700', color: BrandColors.dark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  defaultBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: BrandColors.lightGreen, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  defaultText: { color: BrandColors.primary, fontSize: 12, fontWeight: '700' },
  cardHeader: { marginBottom: 12, paddingRight: 60 },
  name: { fontSize: 16, fontWeight: '700', color: BrandColors.dark, marginBottom: 4 },
  phone: { fontSize: 14, color: '#4B5563' },
  addressText: { fontSize: 14, color: '#6B7280', marginBottom: 4, lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionGroup: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  editBtn: { backgroundColor: BrandColors.lightGreen, marginRight: 8 },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#9CA3AF' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  addBtn: { backgroundColor: BrandColors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 },
  addBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: BrandColors.dark },
  closeBtn: { padding: 8 },
  formContainer: { padding: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 16, color: BrandColors.dark },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: BrandColors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
