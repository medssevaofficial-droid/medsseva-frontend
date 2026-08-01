import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../src/theme/theme';
import ScreenWrapper from '../src/components/ScreenWrapper';

const FEATURES = [
  {
    icon: 'account-check-outline',
    color: '#3B82F6',
    bg: '#EFF6FF',
    title: 'Certified Phlebotomists',
    desc: 'Background-verified, trained professionals handle every collection.',
  },
  {
    icon: 'shield-check-outline',
    color: COLORS.success,
    bg: COLORS.successLight,
    title: 'Safe & Hygienic Collection',
    desc: 'Single-use sterile equipment. Strict hygiene protocols at all times.',
  },
  {
    icon: 'certificate-outline',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    title: 'NABL Partner Laboratories',
    desc: 'Samples processed exclusively at accredited, quality-certified labs.',
  },
  {
    icon: 'map-marker-path',
    color: COLORS.primary,
    bg: '#E6F4F4',
    title: 'Live Booking Tracking',
    desc: 'Track your phlebotomist in real-time from assignment to arrival.',
  },
  {
    icon: 'package-variant-closed',
    color: '#F59E0B',
    bg: COLORS.warningLight,
    title: 'Secure Sample Handling',
    desc: 'Tamper-proof, bio-safe containers used for all sample transport.',
  },
  {
    icon: 'file-document-check-outline',
    color: '#10B981',
    bg: '#ECFDF5',
    title: 'Digital Reports',
    desc: 'Reports available in the app',
  },
  {
    icon: 'clock-time-four-outline',
    color: '#EF4444',
    bg: COLORS.dangerLight,
    title: 'Flexible Slots',
    desc: 'Early morning to evening slots. Book up to 7 days in advance.',
  },
  {
    icon: 'home-check-outline',
    color: COLORS.primary,
    bg: '#E6F4F4',
    title: 'Home Collection Available',
    desc: 'Available across all serviceable cities with doorstep convenience.',
  },
];

const BOOKING_STEPS = [
  { step: '1', label: 'Browse & Select Test' },
  { step: '2', label: 'Select Address' },
  { step: '3', label: 'Choose Date & Time Slot' },
  { step: '4', label: 'Fill Patient Details' },
  { step: '5', label: 'Proceed to Payment' },
  { step: '6', label: 'Booking Confirmed' },
];

export default function HomeCollectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home Collection</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScreenWrapper
        scrollable
        backgroundColor={COLORS.background}
        contentContainerStyle={styles.scrollContent}
        bottomButton={
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/search')}
          >
            <MaterialCommunityIcons name="flask-outline" size={20} color={COLORS.textLight} />
            <Text style={styles.ctaBtnText}>Book Home Collection</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.heroBanner}>
          <View style={styles.heroBannerLeft}>
            <Text style={styles.heroBannerTitle}>Doorstep Diagnostics</Text>
            <Text style={styles.heroBannerDesc}>
              Book a test from home. Our certified phlebotomist arrives at your chosen time slot.
            </Text>
          </View>
          <View style={styles.heroBannerIconWrap}>
            <MaterialCommunityIcons name="home-heart" size={40} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>How Booking Works</Text>
        <View style={styles.stepsCard}>
          {BOOKING_STEPS.map((item, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{item.step}</Text>
                </View>
                {idx < BOOKING_STEPS.length - 1 && <View style={styles.stepConnector} />}
              </View>
              <Text style={[styles.stepLabel, idx === BOOKING_STEPS.length - 1 && { color: COLORS.success, fontWeight: '700' }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>What We Offer</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((f, idx) => (
            <View key={idx} style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: f.bg }]}>
                <MaterialCommunityIcons name={f.icon as any} size={22} color={f.color} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textLight,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  heroBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    ...SHADOWS.soft,
  },
  heroBannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  heroBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  heroBannerDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  heroBannerIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    ...SHADOWS.soft,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepLeft: {
    alignItems: 'center',
    width: 28,
    marginRight: 14,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '800',
  },
  stepConnector: {
    width: 2,
    height: 28,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    paddingTop: 5,
    flex: 1,
    paddingBottom: 28,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featureCard: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
    lineHeight: 18,
  },
  featureDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 30,
    gap: 10,
  },
  ctaBtnText: {
    color: COLORS.textLight,
    fontSize: 15,
    fontWeight: '800',
  },
});