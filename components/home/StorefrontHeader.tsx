import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, Modal, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function StorefrontHeader() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentLang = (i18n.language || 'en').toUpperCase();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const selectLang = async (lang: 'EN' | 'BN' | 'HI') => {
    const langCode = lang.toLowerCase();
    await AsyncStorage.setItem('userLang', langCode);
    i18n.changeLanguage(langCode);
    setLangModalVisible(false);
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

            {/* Account / Login */}
            <TouchableOpacity style={styles.loginBtn} activeOpacity={0.7}>
              <IconSymbol name="person.crop.circle.fill" size={16} color={BrandColors.primary} />
              <Text style={styles.loginText}>{t('common.login', {defaultValue: 'Login'})}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    width: 140,
    height: 38,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  langText: {
    fontSize: 11,
    fontWeight: '800',
    color: BrandColors.primary,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  }
});
