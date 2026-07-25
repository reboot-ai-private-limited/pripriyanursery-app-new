import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { shopApi, Banner } from '@/services/api';
import { BrandColors } from '@/constants/theme';

import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HeroSection({ onLoaded }: { onLoaded?: () => void }) {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const currentIdxRef = useRef(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await shopApi.get('/banners?section=hero');
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setBanners(list);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error('Failed to fetch hero banners:', err);
        setBanners([]);
      } finally {
        setLoading(false);
        onLoaded?.();
      }
    };
    fetchBanners();
  }, [t]);

  const extendedBanners = banners.length > 1 ? [...banners, ...banners, ...banners] : banners;

  useEffect(() => {
    if (banners.length <= 1) return;
    
    currentIdxRef.current = banners.length;
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: false });
    }, 100);

    const interval = setInterval(() => {
      currentIdxRef.current++;
      flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: true });
      setActiveIndex(currentIdxRef.current % banners.length);
      
      if (currentIdxRef.current >= banners.length * 2) {
        setTimeout(() => {
          if (currentIdxRef.current >= banners.length * 2) {
            currentIdxRef.current -= banners.length;
            flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: false });
          }
        }, 500);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const renderItem = ({ item }: { item: Banner }) => {
    const imgSource = item.mobileImageUrl || item.desktopImageUrl || item.image || '';
    return (
      <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
        {imgSource ? (
          <Image
            source={{ uri: imgSource }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Text style={styles.noImageText}>{item.title || 'Hero Banner'}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return null;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={extendedBanners}
        renderItem={renderItem}
        keyExtractor={(item, idx) => `banner-${idx}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          currentIdxRef.current = index;
          if (index >= banners.length * 2) {
             currentIdxRef.current = index - banners.length;
             flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: false });
          } else if (index < banners.length) {
             currentIdxRef.current = index + banners.length;
             flatListRef.current?.scrollToIndex({ index: currentIdxRef.current, animated: false });
          }
          setActiveIndex(currentIdxRef.current % banners.length);
        }}
        getItemLayout={(data, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
      />

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => {
            const isActive = activeIndex === index;
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: isActive ? 20 : 6,
                    opacity: isActive ? 1 : 0.4,
                    backgroundColor: isActive ? BrandColors.primary : '#D1D5DB',
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: BrandColors.surface,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContainer: {
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
