import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  ActivityIndicator, 
  ScrollView, 
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { BrandColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { shopApi } from '@/services/api';

export default function ProfileScreen() {
  const { user, login, token, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Profile Edit States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Delete Account States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    
    // Fetch latest user data to ensure email and details are perfectly synced
    if (isAuthenticated) {
      shopApi.get('/users/me').then((res) => {
        const data = res.data?.data || res.data;
        if (data) {
          setName(data.name || '');
          setEmail(data.email || '');
          if (token) {
            login(token, data); // update context silently with correct object
          }
        }
      }).catch(() => {});
    }
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <IconSymbol name="person.crop.circle.fill.badge.xmark" size={64} color="#9CA3AF" />
          <Text style={styles.title}>Not Logged In</Text>
          <Text style={styles.subtitle}>Please login to view your profile</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/login')}>
            <Text style={styles.primaryBtnText}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await shopApi.patch('/users/me', { name, email });
      if (token && user) {
        await login(token, { ...user, name, email });
      }
      setIsEditingName(false);
      setIsEditingEmail(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        }
      }
    ]);
  };

  const handleRequestDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      await shopApi.post('/users/me/delete-request');
      setDeleteOtpSent(true);
      Alert.alert('OTP Sent', 'An OTP has been sent to your mobile number.');
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteOtp.length !== 6) {
      setDeleteError('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setIsDeleting(true);
      setDeleteError('');
      await shopApi.delete('/users/me/delete', { data: { otp: deleteOtp } });
      Alert.alert('Success', 'Account successfully deleted');
      setDeleteModalOpen(false);
      await logout();
      router.replace('/');
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputRow, isEditingName && styles.inputRowActive]}>
              <TextInput
                style={styles.input}
                value={name}
                editable={isEditingName}
                onChangeText={setName}
                placeholder="Your Full Name"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                style={styles.editIconBtn} 
                onPress={() => setIsEditingName(!isEditingName)}
              >
                <IconSymbol name="pencil" size={20} color={isEditingName ? BrandColors.primary : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputRow, { opacity: 0.8 }]}>
              <TextInput
                style={styles.input}
                value={user?.phone || 'No phone number'}
                editable={false}
              />
              <View style={styles.editIconBtn}>
                <IconSymbol name="checkmark.shield.fill" size={20} color={BrandColors.primary} />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputRow, isEditingEmail && styles.inputRowActive]}>
              <TextInput
                style={styles.input}
                value={email}
                editable={isEditingEmail}
                onChangeText={setEmail}
                placeholder="Your Email Address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.editIconBtn} 
                onPress={() => setIsEditingEmail(!isEditingEmail)}
              >
                <IconSymbol name="pencil" size={20} color={isEditingEmail ? BrandColors.primary : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} 
            onPress={handleSaveProfile}
            disabled={isSaving || (!isEditingName && !isEditingEmail)}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Delete Account Button */}
        <View style={styles.dangerZone}>
          <TouchableOpacity 
            style={styles.deleteAccountBtn} 
            onPress={() => {
              setDeleteError('');
              setDeleteOtpSent(false);
              setDeleteOtp('');
              setDeleteModalOpen(true);
            }}
          >
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <TouchableOpacity onPress={() => setDeleteModalOpen(false)}>
                <IconSymbol name="xmark" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalWarning}>
              Are you sure you want to delete your account? This action cannot be undone and you will lose all your data, orders, and wishlist.
            </Text>

            {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}

            {!deleteOtpSent ? (
              <TouchableOpacity 
                style={styles.requestOtpBtn} 
                onPress={handleRequestDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.requestOtpText}>Send OTP to Mobile</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter 6-digit OTP sent to your phone</Text>
                <TextInput
                  style={styles.otpInput}
                  value={deleteOtp}
                  onChangeText={setDeleteOtp}
                  keyboardType="numeric"
                  maxLength={6}
                  placeholder="------"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
                <TouchableOpacity 
                  style={styles.confirmDeleteBtn} 
                  onPress={handleConfirmDelete}
                  disabled={isDeleting || deleteOtp.length !== 6}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmDeleteText}>Confirm Deletion</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: BrandColors.dark, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: BrandColors.dark, marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24 },
  primaryBtn: { backgroundColor: BrandColors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  card: { 
    backgroundColor: '#FFF', 
    padding: 24, 
    borderRadius: 16, 
    shadowColor: '#000', 
    shadowOffset: {width:0, height:2}, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputRowActive: {
    backgroundColor: '#FFFFFF',
    borderColor: BrandColors.primary,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: BrandColors.dark,
  },
  editIconBtn: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: BrandColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  dangerZone: {
    alignItems: 'flex-start',
  },
  deleteAccountBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteAccountText: {
    color: BrandColors.red,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.dark,
  },
  modalWarning: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  errorText: {
    color: BrandColors.red,
    fontSize: 14,
    marginBottom: 16,
  },
  requestOtpBtn: {
    backgroundColor: BrandColors.red,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestOtpText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  otpSection: {
    marginTop: 8,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.dark,
    marginBottom: 8,
  },
  otpInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    letterSpacing: 8,
    color: BrandColors.dark,
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmDeleteBtn: {
    backgroundColor: BrandColors.red,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmDeleteText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
