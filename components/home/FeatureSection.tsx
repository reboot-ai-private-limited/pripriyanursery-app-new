import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { BrandColors } from '@/constants/theme';

interface Feature {
  id: string;
  title: string;
  description: string;
  imageSource: any;
}

import { useTranslation } from 'react-i18next';

export default function FeatureSection() {
  const { t } = useTranslation();
  
  const FEATURES = [
    { id: '1', title: t('home.features.shippingTitle'), description: t('home.features.shippingDesc'), imageSource: require('@/assets/icons/free-shipping.svg') },
    { id: '2', title: t('home.features.qualityTitle'), description: t('home.features.qualityDesc'), imageSource: require('@/assets/icons/quality-tested.svg') },
    { id: '3', title: t('home.features.originalTitle'), description: t('home.features.originalDesc'), imageSource: require('@/assets/icons/originalproduct.svg') },
    { id: '4', title: t('home.features.supportTitle'), description: t('home.features.supportDesc'), imageSource: require('@/assets/icons/whatsapp-support.svg') },
    { id: '5', title: t('home.features.tipsTitle'), description: t('home.features.tipsDesc'), imageSource: require('@/assets/icons/fresh-plants.svg') },
  ];

  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FEATURES.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={item.imageSource} style={styles.featureIcon} contentFit="contain" />
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: BrandColors.dark,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'center',
  },
});
