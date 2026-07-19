import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandColors } from '@/constants/theme';
import { shopApi } from '@/services/api';

interface Category {
  _id: string;
  name: string;
  desc: string;
  coverImage?: { url: string };
  icon?: { url: string };
}

export default function CategoryScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await shopApi.get('/categories');
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/products?category=${item._id}` as any)}
    >
      <View style={styles.imageContainer}>
        {item.coverImage?.url ? (
          <Image source={{ uri: item.coverImage.url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>{item.desc || 'Explore products in this category'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Categories</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
