import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../src/theme/theme';

export default function PartnerPendingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="clock-outline" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Registration Submitted</Text>
        <Text style={styles.subtitle}>
          Your partner profile has been submitted successfully. Our admin team will review your details and approve your account shortly.
        </Text>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#0369A1" />
          <Text style={styles.infoText}>
            You will be notified once your account is approved. You can then log in and start accepting bookings.
          </Text>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/(auth)/partner-login')}>
          <Text style={styles.loginBtnText}>Go to Partner Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(auth)/welcome')}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F8FAFC',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', ...SHADOWS.soft, width: '100%',
  },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#F0FDFA',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#CCFBF1', marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  infoBox: {
    flexDirection: 'row', backgroundColor: '#F0F9FF', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#BAE6FD',
    alignItems: 'flex-start', gap: 10, marginBottom: 28, width: '100%',
  },
  infoText: { fontSize: 13, color: '#0369A1', lineHeight: 20, flex: 1 },
  loginBtn: {
    backgroundColor: COLORS.primary, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 12,
  },
  loginBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  homeBtn: {
    height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    width: '100%', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  homeBtnText: { fontSize: 15, fontWeight: '700', color: '#475569' },
});