import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
  rightAccessory?: React.ReactNode;
}

export default function Breadcrumbs({ items, rightAccessory }: BreadcrumbsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.item}>
          <IconSymbol name="house.fill" size={12} color="#6B7280" />
          <Text style={styles.linkText}>{t('common.home', { defaultValue: 'Home' })}</Text>
        </TouchableOpacity>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <IconSymbol name="chevron.right" size={10} color="#9CA3AF" />
          {item.href ? (
            <Link href={item.href as any} asChild>
              <TouchableOpacity style={styles.item}>
                <Text style={styles.linkText}>{item.label}</Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <Text style={styles.currentText}>{item.label}</Text>
          )}
        </React.Fragment>
      ))}
      </View>
      {rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  accessory: {
    marginLeft: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  currentText: {
    fontSize: 13,
    color: BrandColors.primary,
    fontWeight: '600',
  },
});
