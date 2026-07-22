import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, StatusBar, Modal, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AccountDrawer from '@/components/AccountDrawer';

export default function StorefrontHeader() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentLang = (i18n.language || 'en').toUpperCase();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [accountDrawerVisible, setAccountDrawerVisible] = useState(false);

  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const selectLang = async (lang: 'EN' | 'BN' | 'HI') => {
    setIsGlobalLoading(true);
    const langCode = lang.toLowerCase();
    await AsyncStorage.setItem('userLang', langCode);
    i18n.changeLanguage(langCode);
    setLangModalVisible(false);
    
    // Simulate loading to reflect website's UX
    setTimeout(() => {
      setIsGlobalLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Brand & Icons Row */}
        <View style={styles.topRow}>
          <View style={styles.brandContainer}>
            <Image
              source={require('@/assets/images/logo.svg')}
              style={styles.logo}
              contentFit="contain"
              tintColor={BrandColors.primary}
            />
          </View>

          {/* Right Action Icons */}
          <View style={styles.rightActions}>
            {/* Language Switcher */}
            <TouchableOpacity
              style={styles.langBtn}
              onPress={() => setLangModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.langText}>{currentLang}</Text>
            </TouchableOpacity>

            {/* Hamburger Menu */}
            <TouchableOpacity 
              style={styles.loginBtn} 
              activeOpacity={0.7}
              onPress={() => setAccountDrawerVisible(true)}
            >
              <IconSymbol name="line.3.horizontal" size={24} color={BrandColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Row */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants, grafted fruit trees, pots..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            <TouchableOpacity 
              style={[styles.langOption, currentLang === 'EN' && styles.langOptionActive]} 
              onPress={() => selectLang('EN')}
            >
              <Text style={[styles.langOptionText, currentLang === 'EN' && styles.langOptionTextActive]}>English (EN)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.langOption, currentLang === 'BN' && styles.langOptionActive]} 
              onPress={() => selectLang('BN')}
            >
              <Text style={[styles.langOptionText, currentLang === 'BN' && styles.langOptionTextActive]}>Bengali (BN)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.langOption, currentLang === 'HI' && styles.langOptionActive]} 
              onPress={() => selectLang('HI')}
            >
              <Text style={[styles.langOptionText, currentLang === 'HI' && styles.langOptionTextActive]}>Hindi (HI)</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Global Loading Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isGlobalLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={styles.loadingTitle}>Changing language...</Text>
          <Text style={styles.loadingSubtitle}>Please wait a moment</Text>
        </View>
      </Modal>

      {/* Account Drawer */}
      <AccountDrawer 
        visible={accountDrawerVisible} 
        onClose={() => setAccountDrawerVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 170,
    height: 46,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  langText: {
    fontSize: 14,
    fontWeight: '800',
    color: BrandColors.primary,
  },
  loginBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.lightGreen,
    borderWidth: 1,
    borderColor: '#C1E8CC',
  },
  loginText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: BrandColors.dark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
    marginBottom: 20,
  },
  langOption: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
    alignItems: 'center',
  },
  langOptionActive: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.lightGreen,
  },
  langOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  langOptionTextActive: {
    color: BrandColors.primary,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.dark,
    marginTop: 16,
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  }
});
