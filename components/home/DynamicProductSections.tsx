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
        if (Array.isArray(list) && list.length > 0) {
          const topCats = list.slice(0, 4).map((c: any) => ({
            name: c.name,
            slug: c.slug,
          }));
          setCategories(topCats);
        } else {
          setCategories([
            { name: 'Flowering Plants', slug: 'flowering-plants' },
            { name: 'Outdoor Plants', slug: 'outdoor-plants' },
            { name: 'Indoor Plants', slug: 'indoor-plants' },
            { name: 'Fruits Plants', slug: 'fruits-plants' },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch categories for DynamicProductSections:', err);
        setCategories([
          { name: 'Flowering Plants', slug: 'flowering-plants' },
          { name: 'Outdoor Plants', slug: 'outdoor-plants' },
          { name: 'Indoor Plants', slug: 'indoor-plants' },
          { name: 'Fruits Plants', slug: 'fruits-plants' },
        ]);
      }
    };
    fetchCategories();
  }, [t]);

  const list = categories.length > 0 ? categories : [
    { name: 'Flowering Plants', slug: 'flowering-plants' },
    { name: 'Outdoor Plants', slug: 'outdoor-plants' },
    { name: 'Indoor Plants', slug: 'indoor-plants' },
    { name: 'Fruits Plants', slug: 'fruits-plants' },
  ];

  return (
    <View>
      {list.map((cat, idx) => (
        <View key={`${cat.slug}-${idx}`}>
          <ProductSection title={cat.name} categorySlug={cat.slug} />
          {idx === 0 && <PlantsGallery />}
          {idx === 2 && <VideoGallerySection />}
        </View>
      ))}
    </View>
  );
}
