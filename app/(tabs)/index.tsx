import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import StorefrontHeader from '@/components/home/StorefrontHeader';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FreshProduceSection from '@/components/home/FreshProduceSection';
import DynamicProductSections from '@/components/home/DynamicProductSections';
import VideoGallerySection from '@/components/home/VideoGallerySection';
import FeatureSection from '@/components/home/FeatureSection';
import Footer from '@/components/layout/Footer';
import { BrandColors } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Sticky Top Storefront Header */}
      <StorefrontHeader />

      {/* Main Homepage Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Sliders Carousel */}
        <HeroSection />

        {/* 2. Categories Horizontal Slider */}
        <CategorySection />

        {/* 3. Fresh Produce Product Grid */}
        <FreshProduceSection />

        {/* 4. Dynamic Product Sections (Best Sellers / Categories + Photo Gallery) */}
        <DynamicProductSections />

        {/* 5. Video Showcase Gallery */}
        <VideoGallerySection />

        {/* 6. Why Choose Us Trust Badges */}
        <FeatureSection />
        
        {/* Footer */}
        <Footer />
      </ScrollView>
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
    paddingBottom: 40,
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
