import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { BrandColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.avatar}>
          <IconSymbol name="person.crop.circle.fill" size={64} color={BrandColors.primary} />
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userPhone}>{user?.phone || 'No phone number'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email provided'}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="cube.box" size={20} color={BrandColors.dark} />
          <Text style={styles.menuText}>My Orders</Text>
          <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="location" size={20} color={BrandColors.dark} />
          <Text style={styles.menuText}>My Addresses</Text>
          <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <IconSymbol name="arrow.right.square" size={20} color={BrandColors.red} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
  card: { backgroundColor: '#FFF', margin: 16, padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatar: { marginBottom: 12 },
  userName: { fontSize: 22, fontWeight: '700', color: BrandColors.dark, marginBottom: 4 },
  userPhone: { fontSize: 16, color: '#4B5563', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#9CA3AF' },
  menu: { backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuText: { flex: 1, fontSize: 16, color: BrandColors.dark, marginLeft: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, padding: 16, backgroundColor: '#FEF2F2', borderRadius: 12, marginTop: 24 },
  logoutText: { fontSize: 16, fontWeight: '700', color: BrandColors.red, marginLeft: 8 }
});
