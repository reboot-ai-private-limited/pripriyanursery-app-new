import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import ProductSection from '@/components/home/ProductSection';
import PlantsGallery from '@/components/home/PlantsGallery';
import { shopApi } from '@/services/api';

export default function DynamicProductSections() {
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await shopApi.get(`/categories?t=${Date.now()}`);
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const topCats = list.slice(0, 2).map((c: any) => ({
            name: c.name,
            slug: c.slug,
          }));
          setCategories(topCats);
        } else {
          setCategories([
            { name: 'Flowering Plants', slug: 'flowering-plants' },
            { name: 'Outdoor Plants', slug: 'outdoor-plants' },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch categories for DynamicProductSections:', err);
        setCategories([
          { name: 'Flowering Plants', slug: 'flowering-plants' },
          { name: 'Outdoor Plants', slug: 'outdoor-plants' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  const list = categories.length > 0 ? categories : [
    { name: 'Flowering Plants', slug: 'flowering-plants' },
    { name: 'Outdoor Plants', slug: 'outdoor-plants' },
  ];

  return (
    <View>
      {list.map((cat, idx) => (
        <View key={`${cat.slug}-${idx}`}>
          <ProductSection title={cat.name} categorySlug={cat.slug} />
          {idx === 0 && <PlantsGallery />}
        </View>
      ))}
    </View>
  );
}
