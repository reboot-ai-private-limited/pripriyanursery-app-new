import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { shopApi, Category } from '@/services/api';
import { BrandColors } from '@/constants/theme';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

// card width (110) + gap (16)
const ITEM_SIZE = 126;
// time between automatic one-card advances (was 3500)
const AUTO_SCROLL_MS = 1500;

export default function CategorySection({ onLoaded }: { onLoaded?: () => void }) {
  const router = useRouter();
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
        onLoaded?.();
      }
    };
    fetchCategories();
  }, [t]);

  const flatListRef = useRef<FlatList>(null);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const lastTouchRef = useRef(0);

  const extendedCategories = categories.length > 1 ? [...categories, ...categories, ...categories] : categories;

  // Three identical copies are rendered; keep the real scroll offset inside the middle
  // copy by silently jumping one copy's width (the content looks identical there).
  const normalizeOffset = () => {
    const setWidth = categories.length * ITEM_SIZE;
    let o = offsetRef.current;
    if (o < setWidth) o += setWidth;
    else if (o >= setWidth * 2) o -= setWidth;
    else return;
    offsetRef.current = o;
    flatListRef.current?.scrollToOffset({ offset: o, animated: false });
  };

  useEffect(() => {
    if (categories.length <= 1) return;

    const setWidth = categories.length * ITEM_SIZE;
    offsetRef.current = setWidth;
    const initTimer = setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: setWidth, animated: false });
    }, 100);

    let wrapTimer: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      // Don't fight the user: skip while dragging or shortly after they let go.
      if (draggingRef.current || Date.now() - lastTouchRef.current < 2500) return;

      // Advance from where the list actually is, not from a stale counter.
      const next = (Math.round(offsetRef.current / ITEM_SIZE) + 1) * ITEM_SIZE;
      flatListRef.current?.scrollToOffset({ offset: next, animated: true });

      // Wrap only once the animation has finished, so the jump never interrupts it.
      wrapTimer = setTimeout(() => {
        if (!draggingRef.current) normalizeOffset();
      }, 600);
    }, AUTO_SCROLL_MS);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(wrapTimer);
      clearInterval(interval);
    };
  }, [categories.length]);

  if (loading) {
    return null;
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
        getItemLayout={(data, index) => ({ length: ITEM_SIZE, offset: ITEM_SIZE * index, index })}
        // Keep every card mounted: the list is short, and unmounting/remounting cards when
        // the offset jumps is what made images reload and blink.
        initialNumToRender={extendedCategories.length}
        windowSize={21}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          offsetRef.current = e.nativeEvent.contentOffset.x;
        }}
        onScrollBeginDrag={() => {
          draggingRef.current = true;
          lastTouchRef.current = Date.now();
        }}
        onScrollEndDrag={() => {
          draggingRef.current = false;
          lastTouchRef.current = Date.now();
        }}
        onMomentumScrollEnd={() => {
          lastTouchRef.current = Date.now();
          if (categories.length > 1) normalizeOffset();
        }}
        renderItem={({ item, index: idx }) => {
          const imgSource = item.imageUrl || item.image || '';
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/category?category=${item.slug || item._id || item.id}`)}
            >
              <View style={styles.imageContainer}>
                {imgSource ? (
                  <Image
                    source={{ uri: imgSource }}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={0}
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
