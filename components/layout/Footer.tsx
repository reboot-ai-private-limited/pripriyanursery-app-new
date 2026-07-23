import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { BrandColors } from '@/constants/theme';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { shopApi } from '@/services/api';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await shopApi.get(`/categories`);
        if (res.data?.data) {
          setCategories(res.data.data.slice(0, 5)); // Just take first 5 for the footer to match "Category 1"
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, [t]);

  const handleLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      {/* ================= Section 1: Brand, Follow Us, Payment Methods ================= */}
      <View style={styles.section}>
        <Image
          source={require('../../assets/images/logo.svg')}
          style={styles.logo}
          contentFit="contain"
          tintColor="#FFFFFF"
        />
        <Text style={styles.description}>
          <Text style={styles.boldText}>Pri Priya Nursery</Text> {t('footer.description', {defaultValue: 'offers a wide selection of indoor and outdoor plants, gardening tools, and expert advice.'})}
        </Text>

        {/* Follow Us */}
        <Text style={styles.sectionTitle}>{t('footer.followUs')}</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity onPress={() => handleLink('https://facebook.com')}>
            <FontAwesome5 name="facebook" size={24} color="rgba(255,255,255,0.6)" style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLink('https://instagram.com')}>
            <FontAwesome5 name="instagram" size={24} color="rgba(255,255,255,0.6)" style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLink('https://google.com')}>
            <FontAwesome5 name="google" size={24} color="rgba(255,255,255,0.6)" style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLink('https://twitter.com')}>
            <FontAwesome5 name="twitter" size={24} color="rgba(255,255,255,0.6)" style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLink('https://youtube.com')}>
            <FontAwesome5 name="youtube" size={24} color="rgba(255,255,255,0.6)" style={styles.socialIcon} />
          </TouchableOpacity>
        </View>

        {/* We Accepted */}
        <Text style={styles.sectionTitle}>{t('footer.weAccepted')}</Text>
        <View style={styles.paymentRow}>
          <View style={styles.paymentBox}>
            <Image source={require('../../assets/icons/visa.svg')} style={styles.paymentImg} contentFit="contain" />
          </View>
          <View style={styles.paymentBox}>
            <Image source={require('../../assets/icons/mastercrd.svg')} style={styles.paymentImg} contentFit="contain" />
          </View>
          <View style={styles.paymentBox}>
            <Image source={require('../../assets/icons/rupay.svg')} style={styles.paymentImg} contentFit="contain" />
          </View>
          <View style={styles.paymentBox}>
            <Image source={require('../../assets/icons/upi.svg')} style={styles.paymentImg} contentFit="contain" />
          </View>
        </View>
      </View>

      {/* ================= Section 2: Categories ================= */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.categories')}</Text>
          {categories.map((cat, idx) => (
            <TouchableOpacity 
              key={cat._id || idx.toString()} 
              style={styles.linkItem}
              onPress={() => router.push(`/products?category=${cat._id}` as any)}
            >
              <Text style={styles.linkText}><Text style={styles.chevron}>&gt;</Text>  {cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ================= Section 3: Quick Links ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('footer.quickLinks')}</Text>
        <TouchableOpacity style={styles.linkItem}><Text style={styles.linkText}><Text style={styles.chevron}>&gt;</Text>  {t('footer.quickLinksList.terms')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}><Text style={styles.linkText}><Text style={styles.chevron}>&gt;</Text>  {t('footer.quickLinksList.privacy')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}><Text style={styles.linkText}><Text style={styles.chevron}>&gt;</Text>  {t('footer.quickLinksList.refund')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}><Text style={styles.linkText}><Text style={styles.chevron}>&gt;</Text>  {t('footer.quickLinksList.shipping')}</Text></TouchableOpacity>
      </View>

      {/* ================= Section 4: Contact Info ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('footer.contactInfo', {defaultValue: 'Contact Information'})}</Text>
        
        <View style={styles.contactItem}>
          <FontAwesome5 name="map-marker-alt" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={styles.contactText}>{t('footer.address', {defaultValue: 'Simulpukur, Gangadhar shishu niketan, Simulpukur, Ukrah, Nadia, West Bengal, 741257'})}</Text>
        </View>
        
        <View style={styles.contactItem}>
          <FontAwesome5 name="envelope" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={styles.contactText}>pripriyanursery@gmail.com</Text>
        </View>
        
        <View style={styles.contactItem}>
          <FontAwesome5 name="phone-alt" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={styles.contactText}>+91 75868 91753</Text>
        </View>

        <View style={styles.contactItem}>
          <FontAwesome5 name="whatsapp" size={18} color="rgba(255,255,255,0.6)" />
          <Text style={styles.contactText}>+91 75868 91753</Text>
        </View>
      </View>

      {/* ================= Copyright ================= */}
      <View style={styles.copyrightBorder}>
        <Text style={styles.copyrightText}>
          {t('footer.copyright', {defaultValue: `© ${currentYear} Pri Priya Nursery. All Rights Reserved.`})}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B150F',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderTopWidth: 6,
    borderTopColor: BrandColors.primary,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  logo: {
    height: 48,
    width: 160,
    marginBottom: 16,
  },
  description: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  socialIcon: {
    marginRight: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentBox: {
    width: 60,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  paymentImg: {
    width: '100%',
    height: '100%',
  },
  linkItem: {
    marginBottom: 12,
  },
  linkText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  chevron: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
  },
  contactItem: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  contactText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  copyrightBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 24,
    marginTop: 10,
    alignItems: 'center',
  },
  copyrightText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});
