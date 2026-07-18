import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { shopApi, Category } from '@/services/api';
import { BrandColors } from '@/constants/theme';

export default function CategorySection() {
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
  }, []);

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
        <Text style={styles.sectionTitle}>Shop by Categories</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((item, idx) => {
          const imgSource = item.imageUrl || item.image || '';
          return (
            <TouchableOpacity
              key={item._id || item.id || idx.toString()}
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
        })}
      </ScrollView>
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
    width: 102,
  },
  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: BrandColors.surface,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
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
