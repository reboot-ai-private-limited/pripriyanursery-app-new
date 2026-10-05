import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import ProductSection from '@/components/home/ProductSection';
import PlantsGallery from '@/components/home/PlantsGallery';
import VideoGallerySection from '@/components/home/VideoGallerySection';
import { shopApi } from '@/services/api';

import { useTranslation } from 'react-i18next';

export default function DynamicProductSections() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await shopApi.get(`/categories?t=${Date.now()}`);
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setCategories(
            list.slice(0, 4).map((c: any) => ({
              name: c.name,
              slug: c.slug,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch categories for DynamicProductSections:', err);
      }
    };
    fetchCategories();
  }, [t]);

  // Render nothing until the real categories are known. Previously this fell back to
  // hardcoded slugs (fruits-plants, outdoor-plants, ...) that don't exist on the server,
  // so every page load fired product requests that failed with "Category not found".
  if (categories.length === 0) return null;

  return (
    <View>
      {categories.map((cat, idx) => (
        <View key={`${cat.slug}-${idx}`}>
          <ProductSection title={cat.name} categorySlug={cat.slug} />
          {idx === 0 && <PlantsGallery />}
          {idx === 2 && <VideoGallerySection />}
        </View>
      ))}
    </View>
  );
}
