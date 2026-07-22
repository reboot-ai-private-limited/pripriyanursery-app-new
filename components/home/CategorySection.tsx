import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { shopApi, Category } from '@/services/api';
import { BrandColors } from '@/constants/theme';

import { useTranslation } from 'react-i18next';

export default function CategorySection() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await shopApi.get(`/categories?t=${Date.now()}`);
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setCategories(list);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [t]);

  const flatListRef = useRef<FlatList>(null);
  const currentIdxRef = useRef(0);
  
  const extendedCategories = categories.length > 1 ? [...categories, ...categories, ...categories] : categories;

  useEffect(() => {
    if (categories.length <= 1) return;
    
    currentIdxRef.current = categories.length;
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: false });
    }, 100);

    const interval = setInterval(() => {
      currentIdxRef.current++;
      flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: true });
      
      if (currentIdxRef.current >= categories.length * 2) {
        setTimeout(() => {
          if (currentIdxRef.current >= categories.length * 2) {
            currentIdxRef.current -= categories.length;
            flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: false });
          }
        }, 500);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [categories.length]);

  if (loading) {
    return (
      <View style={[styles.section, styles.centered]}>
        <ActivityIndicator size="small" color={BrandColors.primary} />
      </View>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('common.categories')}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={extendedCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyExtractor={(item, idx) => `cat-${idx}`}
        getItemLayout={(data, index) => ({ length: 126, offset: 126 * index, index })}
        renderItem={({ item, index: idx }) => {
          const imgSource = item.imageUrl || item.image || '';
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
            >
              <View style={styles.imageContainer}>
                {imgSource ? (
                  <Image
                    source={{ uri: imgSource }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Text style={styles.noImageText}>{item.name?.slice(0, 2).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 22,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.dark,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    alignItems: 'center',
    width: 110,
  },
  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: BrandColors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.primary,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.dark,
    textAlign: 'center',
  },
});
