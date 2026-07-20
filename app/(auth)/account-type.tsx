import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../src/theme/theme';

export default function AccountTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'user' | 'partner' | null>(null);

  const handleContinue = () => {
    if (selected === 'user') router.push('/(auth)/register');
    else if (selected === 'partner') router.push('/(auth)/partner-register');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

    <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/onboarding')}>
        <MaterialCommunityIcons name="chevron-left" size={26} color="#334155" />
      </TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Choose how you want to use MedsSeva.</Text>

      {/* User Card */}
      <TouchableOpacity
        style={[styles.card, selected === 'user' && styles.cardSelected]}
        onPress={() => setSelected('user')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, selected === 'user' && styles.iconCircleSelected]}>
            <MaterialCommunityIcons name="account-outline" size={28} color={selected === 'user' ? '#fff' : COLORS.primary} />
          </View>
          <Text style={[styles.cardTitle, selected === 'user' && styles.cardTitleSelected]}>User</Text>
          {selected === 'user' && (
            <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.primary} style={styles.checkIcon} />
          )}
        </View>
        <View style={styles.featureList}>
          {['Book Diagnostic Tests', 'Book Home Collection', 'Track Bookings', 'Download Reports', 'Book Health Packages'].map(f => (
            <View key={f} style={styles.featureRow}>
              <MaterialCommunityIcons name="check" size={14} color={COLORS.primary} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.cardBtn, selected === 'user' ? styles.cardBtnActive : styles.cardBtnInactive]}
          onPress={() => { setSelected('user'); router.push('/(auth)/register'); }}
        >
          <Text style={[styles.cardBtnText, selected === 'user' && styles.cardBtnTextActive]}>Continue as User</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Partner Card */}
      <TouchableOpacity
        style={[styles.card, selected === 'partner' && styles.cardSelected]}
        onPress={() => setSelected('partner')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, selected === 'partner' && styles.iconCircleSelected]}>
            <MaterialCommunityIcons name="microscope" size={28} color={selected === 'partner' ? '#fff' : COLORS.primary} />
          </View>
          <Text style={[styles.cardTitle, selected === 'partner' && styles.cardTitleSelected]}>Pathology Partner</Text>
          {selected === 'partner' && (
            <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.primary} style={styles.checkIcon} />
          )}
        </View>
        <View style={styles.featureList}>
          {['Accept Home Collection Requests', 'Manage Assigned Bookings', 'Update Collection Status', 'Earn with MedsSeva'].map(f => (
            <View key={f} style={styles.featureRow}>
              <MaterialCommunityIcons name="check" size={14} color={COLORS.primary} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.cardBtn, selected === 'partner' ? styles.cardBtnActive : styles.cardBtnInactive]}
          onPress={() => { setSelected('partner'); router.push('/(auth)/partner-register'); }}
        >
          <Text style={[styles.cardBtnText, selected === 'partner' && styles.cardBtnTextActive]}>Continue as Partner</Text>
        </TouchableOpacity>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 40 },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 28, ...SHADOWS.soft,
  },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 28 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    borderWidth: 2, borderColor: '#E2E8F0', marginBottom: 16, ...SHADOWS.soft,
  },
  cardSelected: { borderColor: COLORS.primary, backgroundColor: '#F0FDFA' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F0FDFA', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#CCFBF1', marginRight: 12,
  },
  iconCircleSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', flex: 1 },
  cardTitleSelected: { color: COLORS.primary },
  checkIcon: { marginLeft: 'auto' },
  featureList: { marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureText: { fontSize: 13, color: '#475569', marginLeft: 8 },
  cardBtn: {
    height: 46, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBtnActive: { backgroundColor: COLORS.primary },
  cardBtnInactive: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  cardBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  cardBtnTextActive: { color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#64748B' },
  footerLink: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});