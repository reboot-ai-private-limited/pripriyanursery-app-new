import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';

export default function PolicyScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const renderPrivacyPolicy = () => (
    <>
      <Text style={styles.title}>{t('privacy.title', 'Privacy Policy')}</Text>
      <Text style={styles.intro}>{t('privacy.intro', 'Welcome to Pri Priya Nursery. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you visit or make a purchase from https://www.pripriyanursery.com.')}</Text>

      <Text style={styles.sectionTitle}>1. {t('privacy.section1Title', 'Information We Collect')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('privacy.section1Point1', 'Name, mobile number, email address')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section1Point2', 'Billing & shipping address')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section1Point3', 'Order details and purchase history')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section1Point4', 'Payment details (processed securely via Razorpay – we do not store card details)')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section1Point5', 'IP address, browser type, device information (for security & analytics)')}</Text>
      </View>

      <Text style={styles.sectionTitle}>2. {t('privacy.section2Title', 'How We Use Your Information')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('privacy.section2Point1', 'Process and deliver orders')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section2Point2', 'Communicate order updates')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section2Point3', 'Provide customer support')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section2Point4', 'Improve our website and services')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section2Point5', 'Comply with legal requirements')}</Text>
      </View>

      <Text style={styles.sectionTitle}>3. {t('privacy.section3Title', 'Payment Security')}</Text>
      <Text style={styles.paragraph}>{t('privacy.section3Content', 'All payments are processed through Razorpay, a secure and PCI-DSS compliant payment gateway. We do not store your card, UPI, or net banking details.')}</Text>

      <Text style={styles.sectionTitle}>4. {t('privacy.section4Title', 'Data Protection')}</Text>
      <Text style={styles.paragraph}>{t('privacy.section4Content', 'We take reasonable security measures to protect your personal information against unauthorized access, misuse, or disclosure.')}</Text>

      <Text style={styles.sectionTitle}>5. {t('privacy.section5Title', 'Third-Party Services')}</Text>
      <Text style={styles.paragraph}>{t('privacy.section5Intro', 'We may share limited data with:')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('privacy.section5Point1', 'Payment gateway (Razorpay)')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section5Point2', 'Delivery partners')}</Text>
        <Text style={styles.bulletItem}>• {t('privacy.section5Point3', 'Government authorities if legally required')}</Text>
      </View>

      <Text style={styles.sectionTitle}>6. {t('privacy.section6Title', 'Your Rights')}</Text>
      <Text style={styles.paragraph}>{t('privacy.section6Intro', 'You may request access, correction, or deletion of your personal data by contacting us:')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>📧 {t('privacy.email', 'Email: pripriyanursery@gmail.com')}</Text>
        <Text style={styles.bulletItem}>📞 {t('privacy.phone', 'Phone: +91 9679164875')}</Text>
      </View>
    </>
  );

  const renderRefundPolicy = () => (
    <>
      <Text style={styles.title}>{t('refund.title', 'Refund & Cancellation Policy')}</Text>
      <Text style={styles.lastUpdated}>{t('refund.lastUpdated', 'Last Updated: 07 December 2025')}</Text>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>⚠️ {t('refund.warning', 'Due to the nature of live plants, our refund policy is limited.')}</Text>
      </View>

      <Text style={styles.sectionTitle}>1. {t('refund.section1Title', 'Order Cancellation')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('refund.section1Point1', 'Orders can be cancelled within 24 hours of placing the order.')}</Text>
        <Text style={styles.bulletItem}>• {t('refund.section1Point2', 'Once dispatched, orders cannot be cancelled.')}</Text>
      </View>

      <Text style={styles.sectionTitle}>2. {t('refund.section2Title', 'Refund Eligibility')}</Text>
      <Text style={styles.paragraph}>{t('refund.section2Intro', 'Refunds are applicable only if:')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('refund.section2Point1', 'Wrong product delivered')}</Text>
        <Text style={styles.bulletItem}>• {t('refund.section2Point2', 'Product severely damaged during transit (photo/video proof required within 24 hours of delivery)')}</Text>
      </View>

      <Text style={styles.sectionTitle}>3. {t('refund.section3Title', 'Non-Refundable Items')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('refund.section3Point1', 'Live plants damaged due to improper care after delivery')}</Text>
        <Text style={styles.bulletItem}>• {t('refund.section3Point2', 'Delay caused by courier partners or natural conditions')}</Text>
        <Text style={styles.bulletItem}>• {t('refund.section3Point3', 'Change of mind after dispatch')}</Text>
      </View>

      <Text style={styles.sectionTitle}>4. {t('refund.section4Title', 'Refund Process')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('refund.section4Point1', 'Approved refunds will be processed to the original payment method via Razorpay')}</Text>
        <Text style={styles.bulletItem}>• {t('refund.section4Point2', 'Refund timeline: 5–7 working days')}</Text>
      </View>

      <Text style={styles.sectionTitle}>5. {t('refund.section5Title', 'Contact for Refund Issues')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>📧 {t('refund.email', 'Email: pripriyanursery@gmail.com')}</Text>
        <Text style={styles.bulletItem}>📞 {t('refund.phone', 'Phone: +91 9679164875')}</Text>
      </View>
    </>
  );

  const renderShippingPolicy = () => (
    <>
      <Text style={styles.title}>{t('shipping.title', 'Shipping Policy')}</Text>
      <Text style={styles.lastUpdated}>{t('shipping.lastUpdated', 'Last Updated: 07 December 2025')}</Text>

      <Text style={styles.sectionTitle}>1. {t('shipping.section1Title', 'Shipping Locations')}</Text>
      <Text style={styles.paragraph}>{t('shipping.section1Content', 'We ship across India, with special focus on North East India, Sikkim, Assam, Siliguri, and nearby regions.')}</Text>

      <Text style={styles.sectionTitle}>2. {t('shipping.section2Title', 'Shipping Time')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('shipping.section2Point1', 'Order processing time: 2–5 working days')}</Text>
        <Text style={styles.bulletItem}>• {t('shipping.section2Point2', 'Delivery time: 5–10 working days, depending on location')}</Text>
        <Text style={styles.bulletItem}>• {t('shipping.section2Point3', 'Delivery timelines may vary due to weather, plant safety, or logistics issues')}</Text>
      </View>

      <Text style={styles.sectionTitle}>3. {t('shipping.section3Title', 'Shipping Method')}</Text>
      <Text style={styles.paragraph}>{t('shipping.section3Content', 'Plants are carefully packed to ensure safety during transit. However, minor leaf damage may occur due to transportation.')}</Text>

      <Text style={styles.sectionTitle}>4. {t('shipping.section4Title', 'Shipping Charges')}</Text>
      <Text style={styles.paragraph}>{t('shipping.section4Content', 'Shipping charges (if applicable) are calculated at checkout or informed separately for bulk orders.')}</Text>

      <Text style={styles.sectionTitle}>5. {t('shipping.section5Title', 'Delivery Responsibility')}</Text>
      <Text style={styles.paragraph}>{t('shipping.section5Content', 'Once the order is handed over to the courier/logistics partner, delivery timelines depend on the carrier.')}</Text>
    </>
  );

  const renderTermsAndConditions = () => (
    <>
      <Text style={styles.title}>{t('terms.title', 'Terms & Conditions')}</Text>
      <Text style={styles.lastUpdated}>{t('terms.lastUpdated', 'Last Updated: 07 December 2025')}</Text>

      <Text style={styles.paragraph}>{t('terms.intro', 'By accessing or using Pri Priya Nursery, you agree to the following terms:')}</Text>

      <Text style={styles.sectionTitle}>1. {t('terms.section1Title', 'Nature of Business')}</Text>
      <Text style={styles.paragraph}>{t('terms.section1Content', 'Pri Priya Nursery is a nursery wholesaler, manufacturer & supplier dealing in live plants. Product availability may vary due to seasonal and climatic conditions.')}</Text>

      <Text style={styles.sectionTitle}>2. {t('terms.section2Title', 'Orders')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('terms.section2Point1', 'Orders are confirmed only after successful payment.')}</Text>
        <Text style={styles.bulletItem}>• {t('terms.section2Point2', 'Bulk / wholesale orders may require additional confirmation.')}</Text>
        <Text style={styles.bulletItem}>• {t('terms.section2Point3', 'Images shown are for reference; actual plant size & appearance may vary.')}</Text>
      </View>

      <Text style={styles.sectionTitle}>3. {t('terms.section3Title', 'Pricing')}</Text>
      <View style={styles.bulletList}>
        <Text style={styles.bulletItem}>• {t('terms.section3Point1', 'All prices are listed in INR.')}</Text>
        <Text style={styles.bulletItem}>• {t('terms.section3Point2', 'Prices may change without prior notice.')}</Text>
        <Text style={styles.bulletItem}>• {t('terms.section3Point3', 'Shipping charges (if applicable) are shown at checkout.')}</Text>
      </View>

      <Text style={styles.sectionTitle}>4. {t('terms.section4Title', 'User Responsibility')}</Text>
      <Text style={styles.paragraph}>{t('terms.section4Content', 'Customers must provide correct address and contact details. We are not responsible for delivery failure due to incorrect information.')}</Text>

      <Text style={styles.sectionTitle}>5. {t('terms.section5Title', 'Intellectual Property')}</Text>
      <Text style={styles.paragraph}>{t('terms.section5Content', 'All content on this website (text, images, logos) is the property of Pri Priya Nursery and may not be used without permission.')}</Text>

      <Text style={styles.sectionTitle}>6. {t('terms.section6Title', 'Governing Law')}</Text>
      <Text style={styles.paragraph}>{t('terms.section6Content', 'These terms are governed by the laws of India, with jurisdiction in Nadia, West Bengal.')}</Text>
    </>
  );

  const renderContent = () => {
    switch (type) {
      case 'privacy':
        return renderPrivacyPolicy();
      case 'refund':
        return renderRefundPolicy();
      case 'shipping':
        return renderShippingPolicy();
      case 'terms':
      default:
        return renderTermsAndConditions();
    }
  };

  const getPageTitle = () => {
    switch (type) {
      case 'privacy': return t('privacy.title', 'Privacy Policy');
      case 'refund': return t('refund.title', 'Refund & Cancellation Policy');
      case 'shipping': return t('shipping.title', 'Shipping Policy');
      case 'terms':
      default: return t('terms.title', 'Terms & Conditions');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome5 name="chevron-left" size={20} color={BrandColors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getPageTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: BrandColors.dark,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },
  intro: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BrandColors.dark,
    marginTop: 8,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 20,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 6,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
  },
});
