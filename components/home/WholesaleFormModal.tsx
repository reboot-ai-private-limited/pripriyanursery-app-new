import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { shopApi } from '@/services/api';
import axios from 'axios';

interface WholesaleFormModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WholesaleFormModal({ visible, onClose }: WholesaleFormModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    city: '',
    pinCode: '',
    quantity: '',
    products: '',
    requirements: ''
  });
  
  const [pinCodeState, setPinCodeState] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [pinCodeError, setPinCodeError] = useState('');

  const handlePinCodeChange = async (val: string) => {
    setFormData(prev => ({ ...prev, pinCode: val }));
    if (val.length === 6) {
      setPinCodeState('loading');
      try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${val}`);
        if (res.data && res.data[0] && res.data[0].Status === 'Success') {
          setPinCodeState('valid');
          setPinCodeError('');
        } else {
          setPinCodeState('invalid');
          setPinCodeError(t('wholesale.invalidPin', 'Invalid PIN Code'));
        }
      } catch (err) {
        setPinCodeState('invalid');
        setPinCodeError(t('wholesale.pinError', 'Error verifying PIN Code'));
      }
    } else {
      setPinCodeState('idle');
      setPinCodeError('');
    }
  };

  const isFormValid = 
    formData.fullName.trim() !== '' &&
    formData.mobile.trim().length >= 10 &&
    formData.city.trim() !== '' &&
    formData.pinCode.length === 6 &&
    pinCodeState === 'valid' &&
    Number(formData.quantity) >= 100 &&
    formData.products.trim() !== '';

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const res = await shopApi.post('/wholesale', {
        ...formData,
        quantity: Number(formData.quantity)
      });
      if (res.data?.success) {
        Alert.alert(t('wholesale.success', 'Success'), res.data.message || t('wholesale.successMsg', 'Request submitted successfully!'));
        setFormData({ fullName: '', mobile: '', city: '', pinCode: '', quantity: '', products: '', requirements: '' });
        setPinCodeState('idle');
        onClose();
      } else {
        Alert.alert(t('wholesale.error', 'Error'), res.data?.message || t('wholesale.failedMsg', 'Failed to submit request.'));
      }
    } catch (err: any) {
      Alert.alert(t('wholesale.error', 'Error'), err.response?.data?.message || t('wholesale.errorMsg', 'An error occurred while submitting.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom']}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('wholesale.title', 'Bulk Order Request')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <IconSymbol name="xmark" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
              <Text style={styles.subtitle}>
                {t('wholesale.subtitle', 'Minimum order quantity is 100 plants.')}
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('wholesale.fullName', 'Full Name')} *</Text>
                <TextInput style={styles.input} value={formData.fullName} onChangeText={t => setFormData(p => ({...p, fullName: t}))} placeholder="John Doe" placeholderTextColor="#9CA3AF" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('wholesale.mobile', 'Mobile Number')} *</Text>
                <TextInput style={styles.input} value={formData.mobile} onChangeText={t => setFormData(p => ({...p, mobile: t}))} placeholder="9876543210" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" maxLength={10} />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>{t('wholesale.pinCode', 'PIN Code')} *</Text>
                  <TextInput style={[styles.input, pinCodeState === 'invalid' && styles.inputError]} value={formData.pinCode} onChangeText={handlePinCodeChange} placeholder="700001" placeholderTextColor="#9CA3AF" keyboardType="number-pad" maxLength={6} />
                  {pinCodeState === 'loading' && <Text style={styles.hintText}>{t('wholesale.verifying', 'Verifying...')}</Text>}
                  {pinCodeState === 'valid' && <Text style={styles.successText}>{t('wholesale.validPin', 'Valid PIN Code')}</Text>}
                  {pinCodeState === 'invalid' && <Text style={styles.errorText}>{pinCodeError}</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t('wholesale.city', 'City')} *</Text>
                  <TextInput style={styles.input} value={formData.city} onChangeText={t => setFormData(p => ({...p, city: t}))} placeholder="Kolkata" placeholderTextColor="#9CA3AF" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('wholesale.quantity', 'Approx. Quantity')} *</Text>
                <TextInput style={styles.input} value={formData.quantity} onChangeText={t => setFormData(p => ({...p, quantity: t}))} placeholder="e.g. 100" placeholderTextColor="#9CA3AF" keyboardType="number-pad" />
                {!!formData.quantity && Number(formData.quantity) < 100 && (
                  <Text style={styles.errorText}>{t('wholesale.minQtyError', 'Minimum quantity is 100')}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('wholesale.products', 'Interested Products')} *</Text>
                <TextInput style={styles.input} value={formData.products} onChangeText={t => setFormData(p => ({...p, products: t}))} placeholder="e.g. Mango, Guava plants" placeholderTextColor="#9CA3AF" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('wholesale.requirements', 'Additional Requirements (Optional)')}</Text>
                <TextInput style={[styles.input, styles.textArea]} value={formData.requirements} onChangeText={t => setFormData(p => ({...p, requirements: t}))} placeholder="Any specific requirements..." placeholderTextColor="#9CA3AF" multiline numberOfLines={3} textAlignVertical="top" />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.submitBtn, (!isFormValid || loading) && styles.submitBtnDisabled]} 
                onPress={handleSubmit} 
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('common.submit', 'Submit')}</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 18, fontWeight: '700', color: BrandColors.dark },
  closeBtn: { padding: 4 },
  scrollArea: { padding: 20 },
  scrollContent: { paddingBottom: 40 },
  subtitle: { fontSize: 14, color: '#4B5563', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#F9FAFB', fontSize: 14, color: '#1F2937' },
  inputError: { borderColor: '#EF4444' },
  textArea: { height: 80, paddingTop: 10 },
  hintText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  successText: { fontSize: 12, color: '#10B981', marginTop: 4 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFF' },
  submitBtn: { backgroundColor: BrandColors.primary, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
