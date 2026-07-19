import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

import { useTranslation } from 'react-i18next';

export default function FeatureSection() {
  const { t } = useTranslation();
  
  const FEATURES = [
    { id: '1', title: t('home.features.shippingTitle'), description: t('home.features.shippingDesc'), iconName: 'paperplane.fill' },
    { id: '2', title: t('home.features.qualityTitle'), description: t('home.features.qualityDesc'), iconName: 'checkmark.shield.fill' },
    { id: '3', title: t('home.features.originalTitle'), description: t('home.features.originalDesc'), iconName: 'leaf.fill' },
    { id: '4', title: t('home.features.supportTitle'), description: t('home.features.supportDesc'), iconName: 'message.fill' },
    { id: '5', title: t('home.features.tipsTitle'), description: t('home.features.tipsDesc'), iconName: 'sun.max.fill' },
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
            <View style={styles.iconCircle}>
              <IconSymbol name={item.iconName as any} size={22} color={BrandColors.primary} />
            </View>
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
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BrandColors.border,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: BrandColors.dark,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
