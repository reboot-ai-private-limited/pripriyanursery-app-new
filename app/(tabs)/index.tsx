import React, { useRef } from 'react';
import { StyleSheet, ScrollView, View, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StorefrontHeader from '@/components/home/StorefrontHeader';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FreshProduceSection from '@/components/home/FreshProduceSection';
import DynamicProductSections from '@/components/home/DynamicProductSections';
import FeatureSection from '@/components/home/FeatureSection';
import Footer from '@/components/layout/Footer';
import { BrandColors } from '@/constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  // Header total static height = 8 (pt) + 58 (topRow) + 50 (search) + 12 (pb) = 128
  const headerHeight = insets.top + 128;
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      {/* Sticky Top Storefront Header */}
      <StorefrontHeader scrollY={scrollY} />

      {/* Main Homepage Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* 1. Hero Sliders Carousel */}
        <HeroSection />

        {/* 2. Categories Horizontal Slider */}
        <CategorySection />

        {/* 3. Fresh Produce Product Grid */}
        <FreshProduceSection />

        {/* 4. Dynamic Product Sections (Best Sellers / Categories + Galleries) */}
        <DynamicProductSections />

        {/* 5. Why Choose Us Trust Badges */}
        <FeatureSection />
        
        {/* Footer */}
        <Footer />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: BrandColors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
});
