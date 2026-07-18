import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { BrandColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      {/* Brand & Description */}
      <View style={styles.section}>
        <Image
          source={require('@/assets/images/logo.svg')}
          style={styles.logo}
          contentFit="contain"
          tintColor="#FFFFFF"
        />
        <Text style={styles.description}>
          <Text style={styles.boldText}>Pripriya</Text> offers a wide selection of indoor and outdoor plants, gardening tools, and expert advice.
        </Text>
      </View>

      {/* Follow Us */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Follow With Us</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialIcon} onPress={() => handleLink('https://facebook.com')}>
             <Text style={styles.socialText}>FB</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => handleLink('https://instagram.com')}>
             <Text style={styles.socialText}>IG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => handleLink('https://twitter.com')}>
             <Text style={styles.socialText}>X</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => handleLink('https://youtube.com')}>
             <Text style={styles.socialText}>YT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <TouchableOpacity style={styles.linkItem}><Text style={styles.linkText}>&gt; Terms & Conditions</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}><Text style={styles.linkText}>&gt; Privacy Policy</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}><Text style={styles.linkText}>&gt; Refund Policy</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}><Text style={styles.linkText}>&gt; Shipping Policy</Text></TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.contactItem}>
          <Text style={styles.contactText}>contact@pripriya.com</Text>
        </View>
        <View style={styles.contactItem}>
          <Text style={styles.contactText}>+91 9876543210</Text>
        </View>
      </View>

      {/* Copyright */}
      <View style={styles.copyrightBorder}>
        <Text style={styles.copyrightText}>
          © {currentYear} Pripriya. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B150F', // Dark color similar to web
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
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  linkItem: {
    marginBottom: 12,
  },
  linkText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  contactItem: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  copyrightBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  copyrightText: {
    color: '#6B7280',
    fontSize: 13,
  },
});
