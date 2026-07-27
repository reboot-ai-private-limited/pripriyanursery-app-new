import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, StatusBar, Modal, Pressable, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AccountDrawer from '@/components/AccountDrawer';

export default function StorefrontHeader({ scrollY }: { scrollY?: Animated.Value }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search animation
  const searchBarHeight = 50;
  const clampedScrollY = scrollY ? scrollY.interpolate({ inputRange: [0, 10000], outputRange: [0, 10000], extrapolateLeft: 'clamp' }) : new Animated.Value(0);
  const diffClamp = scrollY ? Animated.diffClamp(clampedScrollY, 0, searchBarHeight) : new Animated.Value(0);
  
  const searchHeight = diffClamp.interpolate({
    inputRange: [0, searchBarHeight],
    outputRange: [searchBarHeight, 0],
    extrapolate: 'clamp',
  });
  
  const searchOpacity = diffClamp.interpolate({
    inputRange: [0, searchBarHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/category?category=all&search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
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
    <SafeAreaView style={[styles.safeArea, !!scrollY && styles.safeAreaAbsolute]} edges={['top']}>
      <View style={styles.container}>
        {/* Top Brand & Icons Row */}
        <View style={styles.topRow}>
          <View style={styles.brandContainer}>
            <Image
              source={require('@/assets/images/logo.svg')}
              style={styles.logo}
              contentFit="contain"
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
        <Animated.View style={{ height: searchHeight, opacity: searchOpacity, overflow: 'hidden' }}>
          <View style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plants, grafted fruit trees, pots..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </Animated.View>
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
  safeAreaAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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
  },
  loginText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 15,
    color: BrandColors.dark,
    padding: 0,
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

