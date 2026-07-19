import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import ProductCard from '@/components/product/ProductCard';
import { shopApi, Product, mapProduct } from '@/services/api';
import { BrandColors } from '@/constants/theme';

import { useTranslation } from 'react-i18next';

export default function FreshProduceSection() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await shopApi.get('/products?limit=10&isPublished=true');
        const rawData = res.data?.data || {};
        const rawList = Array.isArray(rawData) ? rawData : (rawData.products || res.data?.products || []);
        
        if (Array.isArray(rawList)) {
          setProducts(rawList.map(mapProduct));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch fresh produce:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [t]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.freshProduceTitle')}</Text>
        <Text style={styles.subtitle}>{t('home.freshProduceDesc')}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      ) : products.length > 0 ? (
        <View style={styles.grid}>
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products available.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});
