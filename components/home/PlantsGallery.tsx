import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { shopApi, GalleryItem } from '@/services/api';
import { BrandColors } from '@/constants/theme';

import { useTranslation } from 'react-i18next';

export default function PlantsGallery() {
  const { t } = useTranslation();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await shopApi.get('/galleries');
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setGallery(list);
        } else {
          setGallery([]);
        }
      } catch (err) {
        console.error('Failed to fetch plants gallery:', err);
        setGallery([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [t]);

  const flatListRef = useRef<FlatList>(null);
  const currentIdxRef = useRef(0);
  
  const extendedGallery = gallery.length > 1 ? [...gallery, ...gallery, ...gallery] : gallery;

  useEffect(() => {
    if (gallery.length <= 1) return;
    
    currentIdxRef.current = gallery.length;
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: false });
    }, 100);

    const interval = setInterval(() => {
      currentIdxRef.current++;
      flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: true });
      
      if (currentIdxRef.current >= gallery.length * 2) {
        setTimeout(() => {
          if (currentIdxRef.current >= gallery.length * 2) {
            currentIdxRef.current -= gallery.length;
            flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: false });
          }
        }, 500);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [gallery.length]);

  if (loading) {
    return (
      <View style={[styles.section, styles.centered]}>
        <ActivityIndicator size="small" color={BrandColors.primary} />
      </View>
    );
  }

  if (gallery.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.photoGallery', { defaultValue: 'Photo Gallery' })}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={extendedGallery}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyExtractor={(item, idx) => `gallery-${idx}`}
        getItemLayout={(data, index) => ({ length: 254, offset: 254 * index, index })}
        renderItem={({ item, index: idx }) => {
          const imgSource = item.imageUrl || item.image || '';
          if (!imgSource) return null;
          return (
            <View style={styles.card}>
              <Image
                source={{ uri: imgSource }}
                style={styles.image}
                contentFit="cover"
                transition={250}
              />
              <View style={styles.overlay}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || 'Nursery Plant'}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 24,
    backgroundColor: BrandColors.surface,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    width: 240,
    aspectRatio: 3 / 4, // 3:4 portrait aspect ratio
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
