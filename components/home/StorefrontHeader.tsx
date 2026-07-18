import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

export default function StorefrontHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLang, setActiveLang] = useState<'EN' | 'BN' | 'HI'>('EN');

  const cycleLang = () => {
    if (activeLang === 'EN') setActiveLang('BN');
    else if (activeLang === 'BN') setActiveLang('HI');
    else setActiveLang('EN');
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
              onPress={cycleLang}
              activeOpacity={0.7}
            >
              <Text style={styles.langText}>{activeLang}</Text>
            </TouchableOpacity>

            {/* Wishlist */}
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <IconSymbol name="heart" size={22} color={BrandColors.dark} />
            </TouchableOpacity>

            {/* Cart with Badge */}
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <IconSymbol name="cart.fill" size={22} color={BrandColors.primary} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
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
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BrandColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: BrandColors.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: BrandColors.dark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: BrandColors.dark,
    padding: 0,
  },
});
