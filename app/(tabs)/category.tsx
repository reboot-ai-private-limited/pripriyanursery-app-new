import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BrandColors } from '@/constants/theme';
import { shopApi, Category, Product, mapProduct } from '@/services/api';
import ProductCard from '@/components/product/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';
import StorefrontHeader from '@/components/home/StorefrontHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CategoryScreen() {
  const router = useRouter();
  const { category: categoryParam } = useLocalSearchParams<{ category: string }>();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let currentCategories = categories;
      if (currentCategories.length === 0) {
        const catRes = await shopApi.get('/categories');
        if (catRes.data?.data) {
          currentCategories = [{ _id: 'all', name: 'All Products', slug: 'all' } as Category, ...catRes.data.data];
          setCategories(currentCategories);
        }
      }

      let url = '/products?limit=100';
      if (selectedCategory && selectedCategory !== 'all') {
        const cat = currentCategories.find(c => c._id === selectedCategory);
        const slug = cat ? cat.slug : selectedCategory; 
        url = `/products/category/${slug}?limit=100`;
      }
      
      const prodRes = await shopApi.get(url).catch(() => ({ data: { data: {} } }));
      const rawData = prodRes.data?.data || {};
      const rawList = Array.isArray(rawData) ? rawData : (rawData.products || prodRes.data?.products || []);
      
      let prods = Array.isArray(rawList) 
        ? rawList.map(mapProduct)
        : [];
      
      if (sortBy === 'price-asc') prods.sort((a: Product, b: Product) => a.price - b.price);
      if (sortBy === 'price-desc') prods.sort((a: Product, b: Product) => b.price - a.price);

      setProducts(prods);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item._id;
    return (
      <TouchableOpacity 
        style={[styles.catCard, isSelected && styles.catCardSelected]}
        onPress={() => setSelectedCategory(item._id || '')}
        activeOpacity={0.8}
      >
        <View style={[styles.catImageContainer, isSelected && styles.catImageContainerSelected]}>
          {(item as any).coverImage?.url || item.imageUrl || item.image ? (
            <Image source={{ uri: ((item as any).coverImage?.url || item.imageUrl || item.image || '') as string }} style={styles.catImage} contentFit="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{item.name?.slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.catName, isSelected && styles.catNameSelected]} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const headerElement = (
    <View style={styles.topSection}>
      <Breadcrumbs items={[{ label: t('common.products', {defaultValue: 'Products'}) }]} />

      <View style={styles.categoriesWrapper}>
        <FlatList
          ref={flatListRef}
          data={categories}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catListContainer}
        />
      </View>

      <View style={styles.filterBar}>
        <Text style={styles.resultsText}>{products.length} {t('common.products', {defaultValue: 'Products'})}</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.filterBtnText}>Sort / Filter</Text>
          <IconSymbol name="line.3.horizontal.decrease.circle" size={18} color={BrandColors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StorefrontHeader />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        numColumns={2}
        contentContainerStyle={[styles.prodListContainer, products.length === 0 && { flexGrow: 1 }]}
        columnWrapperStyle={styles.prodRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={headerElement}
        ListEmptyComponent={() => (
          !loading && products.length === 0 ? (
            <View style={styles.center}>
              <IconSymbol name="leaf.fill" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          ) : null
        )}
      />

      {loading && (
        <View style={styles.fullPageLoader}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      )}

      <Modal visible={filterModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            
            {['popularity', 'price-asc', 'price-desc'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.modalOption, sortBy === option && styles.modalOptionSelected]}
                onPress={() => {
                  setSortBy(option);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, sortBy === option && styles.modalOptionTextSelected]}>
                  {option === 'popularity' ? 'Popularity' : option === 'price-asc' ? 'Price: Low to High' : 'Price: High to Low'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 4,
  },
  categoriesWrapper: {
    paddingVertical: 12,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.dark,
  },
  catListContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  catCard: {
    alignItems: 'center',
    width: 80,
  },
  catCardSelected: {},
  catImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 8,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  catImageContainerSelected: {
    backgroundColor: BrandColors.lightGreen,
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  catImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#C1E8CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34A853',
  },
  catName: {
    fontSize: 11,
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '500',
  },
  catNameSelected: {
    color: BrandColors.primary,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  fullPageLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  prodListContainer: {
    paddingBottom: 24,
  },
  prodRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: BrandColors.surface,
    borderRadius: 8,
    borderBottomWidth: 0,
    paddingHorizontal: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: BrandColors.primary,
    fontWeight: '700',
  },
  closeBtn: {
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
});
