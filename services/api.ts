import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'http://192.168.1.11:5000/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const shopApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

import i18n from './i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';

shopApi.interceptors.request.use(async (config) => {
  const lang = i18n.language || 'en';
  if (config.headers) {
    config.headers['Accept-Language'] = lang;
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {}
  }
  config.params = { ...config.params, lang };
  return config;
});

export interface Banner {
  _id?: string;
  id?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  image?: string;
  title?: string;
  link?: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  imageUrl?: string;
  image?: string;
  slug: string;
}

export interface Product {
  id: string;
  _id?: string;
  title: string;
  desc?: string;
  brand?: string;
  categoryName?: string;
  image: string;
  imageUrl?: string;
  price: number;
  mrp: number;
  discount: number;
  stock?: number;
  stocks?: number;
  slug: string;
  variantId?: string | number;
  categoryId?: string;
  isTaxInclude?: boolean;
  effectiveTax?: any[];
  coverImage?: any;
  defaultVariantId?: string;
  variants?: any[];
  productId?: string;
  attributes?: Record<string, any>;
  specs?: any[];
}

export interface GalleryItem {
  _id?: string;
  id?: string;
  title?: string;
  imageUrl?: string;
  image?: string;
}

export interface VideoItem {
  _id?: string;
  id?: string | number;
  title?: string;
  thumbnailUrl?: string;
  image?: string;
  videoUrl?: string;
}

/**
 * Reusable helper to map backend product data to mobile Product interface
 * exactly matching pripriyanursery-frontend/lib/services/product.ts
 */
export function mapProduct(prod: any): Product {
  const price = prod.displayPrice || prod.price || 0;
  const mrp = prod.displayMrp || prod.mrp || price;
  const discount =
    prod.displayDiscount !== undefined
      ? prod.displayDiscount
      : prod.discount !== undefined
      ? prod.discount
      : mrp > price
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  const image =
    prod.coverImage?.url ||
    prod.imageUrl ||
    prod.image ||
    '';

  return {
    ...prod,
    id: prod._id || prod.id || String(Math.random()),
    _id: prod._id || prod.id,
    title: prod.title || 'Untitled Plant',
    desc: prod.desc || '',
    brand: typeof prod.brandId === 'object' ? prod.brandId?.name || 'Generic' : 'Generic',
    categoryName: typeof prod.categoryId === 'object' ? prod.categoryId?.name || 'General' : 'General',
    image,
    price,
    mrp,
    discount,
    stock: prod.stocks !== undefined ? prod.stocks : prod.stock !== undefined ? prod.stock : 0,
    slug: prod.default_slug || prod.slug || prod._id || prod.id || '',
    variantId: prod.defaultVariantId || prod.variantId || prod._id || prod.id || '',
    categoryId: typeof prod.categoryId === 'object' ? prod.categoryId?._id : prod.categoryId,
  };
}
