import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { shopApi } from '@/services/api';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    try {
      setLoading(true);
      await shopApi.post('/auth/login/send-otp', { phone });
      setStep(2);
      Alert.alert('Success', 'OTP sent successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'OTP must be 6 digits');
      return;
    }
    try {
      setLoading(true);
      const res = await shopApi.post('/auth/login/verify', { phone, otp });
      if (res.data?.success && res.data?.data) {
        const { accessToken, user } = res.data.data;
        await login(accessToken, user);
        router.back();
      } else {
        throw new Error('Invalid response');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <IconSymbol name="xmark" size={24} color={BrandColors.dark} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{step === 1 ? 'Login to Pri Priya' : 'Verify OTP'}</Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Enter your phone number to receive a one-time password.' 
              : `We sent a 6-digit code to ${phone}.`}
          </Text>

          {step === 1 ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(val) => setPhone(val.replace(/\D/g, ''))}
                maxLength={10}
              />
              <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                value={otp}
                onChangeText={(val) => setOtp(val.replace(/\D/g, ''))}
                maxLength={6}
              />
              <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
              </TouchableOpacity>
              
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 12 }}>
                <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                  <Text style={styles.backBtnText}>Resend OTP</Text>
                </TouchableOpacity>
                <Text style={{ color: '#D1D5DB' }}>|</Text>
                <TouchableOpacity onPress={() => setStep(1)} disabled={loading}>
                  <Text style={styles.backBtnText}>Change Number</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20
  },
  content: { padding: 24, flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: BrandColors.dark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 22 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    color: BrandColors.dark
  },
  button: {
    backgroundColor: BrandColors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backBtn: { padding: 12, alignItems: 'center' },
  backBtnText: { color: BrandColors.primary, fontSize: 14, fontWeight: '600' }
});
