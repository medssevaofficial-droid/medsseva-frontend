import React, { useState } from 'react';
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

const JOURNEY_STEPS = [
  {
    icon: 'account-arrow-right-outline',
    color: '#3B82F6',
    bg: '#EFF6FF',
    title: 'Phlebotomist Arrives',
    desc: 'Your assigned phlebotomist arrives at the scheduled time. You will receive a live tracking link and an arrival notification.',
  },
  {
    icon: 'needle',
    color: '#F59E0B',
    bg: '#FFFBEB',
    title: 'Sample Collected from Home',
    desc: 'Sample is collected using single-use sterile equipment under hygienic conditions. The process typically takes under 10 minutes.',
  },
  {
    icon: 'truck-delivery-outline',
    color: '#10B981',
    bg: '#ECFDF5',
    title: 'Sample Delivered to Laboratory',
    desc: 'The collected sample is transported in a sealed, bio-safe container to our NABL-accredited partner laboratory.',
  },
  {
    icon: 'microscope',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    title: 'Laboratory Processing',
    desc: 'Trained lab technicians verify, barcode, process and analyze the sample using certified diagnostic equipment and standardized protocols.',
  },
  {
    icon: 'shield-check-outline',
    color: COLORS.primary,
    bg: '#E6F4F4',
    title: 'Quality Verification',
    desc: 'Every result undergoes an internal quality check by a senior technician before being cleared for report generation.',
  },
  {
    icon: 'file-document-edit-outline',
    color: '#EF4444',
    bg: '#FEF2F2',
    title: 'Report Generated',
    desc: 'A digital diagnostic report is prepared, reviewed, and digitally signed by a qualified pathologist.',
  },
  {
    icon: 'bell-check-outline',
    color: COLORS.success,
    bg: COLORS.successLight,
    title: 'Report Delivered',
    desc: 'Your report is available inside the MedsSeva app.',
  },
];

const TRUST_POINTS = [
  { icon: 'needle', label: 'Single-use sterile needles, discarded after each use' },
  { icon: 'certificate-outline', label: 'NABL-accredited laboratories only' },
  { icon: 'lock-check-outline', label: 'Tamper-proof, bio-safe sample containers' },
  { icon: 'map-marker-check-outline', label: 'GPS-tracked courier for every sample' },
];

export default function SampleJourneyScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sample Journey</Text>
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
            <Text style={styles.ctaBtnText}>Book a Test</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.summaryChip}>
          <MaterialCommunityIcons name="clock-fast" size={16} color={COLORS.primary} />
          <Text style={styles.summaryChipText}>
            Reports typically delivered within 24 hours of sample collection
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Step-by-Step Sample Lifecycle</Text>
        <Text style={styles.sectionHint}>Tap a step to read details</Text>

        <View style={styles.timelineCard}>
          {JOURNEY_STEPS.map((step, idx) => {
            const isOpen = expanded === idx;
            const isLast = idx === JOURNEY_STEPS.length - 1;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.75}
                onPress={() => setExpanded(isOpen ? null : idx)}
                style={styles.timelineRow}
              >
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineIconBox, { backgroundColor: step.bg }]}>
                    <MaterialCommunityIcons name={step.icon as any} size={20} color={step.color} />
                  </View>
                  {!isLast && <View style={styles.timelineConnector} />}
                </View>

                <View style={[styles.timelineRight, isLast && { paddingBottom: 0 }]}>
                  <View style={styles.timelineRowHeader}>
                    <View style={styles.timelineMetaRow}>
                      <View style={[styles.stepPill, { backgroundColor: step.bg }]}>
                        <Text style={[styles.stepPillText, { color: step.color }]}>Step {idx + 1}</Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.border}
                    />
                  </View>
                  <Text style={styles.timelineTitle}>{step.title}</Text>
                  {isOpen && (
                    <Text style={styles.timelineDesc}>{step.desc}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Safety & Quality Standards</Text>
        <View style={styles.trustCard}>
          {TRUST_POINTS.map((point, idx) => (
            <View key={idx} style={[styles.trustRow, idx < TRUST_POINTS.length - 1 && styles.trustRowBorder]}>
              <View style={styles.trustIconBox}>
                <MaterialCommunityIcons name={point.icon as any} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.trustText}>{point.label}</Text>
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
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryChipText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  sectionHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingTop: 20,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    ...SHADOWS.soft,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 44,
    marginRight: 12,
  },
  timelineIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  stepPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 6,
  },
  sectionLabel2: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  trustCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  trustRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trustIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
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