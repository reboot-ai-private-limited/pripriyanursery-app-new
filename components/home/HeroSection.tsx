import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { shopApi, Banner } from '@/services/api';
import { BrandColors } from '@/constants/theme';

import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HeroSection() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

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
      }
    };
    fetchBanners();
  }, [t]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIdx = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
        return nextIdx;
      });
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
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item, idx) => item._id || item.id || idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
      />

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 20, 6],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index.toString()}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor: BrandColors.primary },
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
