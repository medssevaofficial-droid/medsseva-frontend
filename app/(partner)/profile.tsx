import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../src/store';
import { logout } from '../../src/store/slices/authSlice';
import { apiService } from '../../src/services/api';
import { COLORS, SHADOWS } from '../../src/theme/theme';

interface PartnerProfile {
  labName: string;
  role: string;
  approvalStatus: string;
  rating: number;
  totalCollections: number;
  reviewCount?: number;
  branchName?: string;
}

export default function PartnerProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((s: RootState) => s.auth.user);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiService.getPartnerProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['user', 'token']);
          dispatch(logout());
          router.replace('/(auth)/account-type');
        }
      }
    ]);
  };

  const menuItems = [
    { icon: 'calendar-clock', label: 'Availability', subtitle: 'Manage your work hours', onPress: () => {} },
    { icon: 'file-document-outline', label: 'Documents', subtitle: 'Licenses and certificates', onPress: () => {} },
    { icon: 'map-marker-outline', label: 'My Branch', subtitle: profile?.branchName || 'Not assigned', onPress: () => {} },
    { icon: 'star-outline', label: 'Ratings', subtitle: 'View feedback and performance', value: profile?.rating?.toFixed(1), onPress: () => {} },
    { icon: 'headset', label: 'Support', subtitle: '24/7 Partner helpline', onPress: () => {} },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="plus-box-outline" size={20} color={COLORS.primary} />
          <Text style={styles.logoText}>MedsSeva</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={40} color={COLORS.primary} />
            </View>
            <View style={styles.editDot}>
              <MaterialCommunityIcons name="camera" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.partnerName}>{user?.name || 'Partner'}</Text>
          <View style={styles.idStatusRow}>
            <Text style={styles.partnerId}>ID: {user?.id?.slice(-5) || '00000'}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: profile?.approvalStatus === 'APPROVED' ? '#DCFCE7' : '#FEF9C3' }
            ]}>
              <Text style={[
                styles.statusBadgeText,
                { color: profile?.approvalStatus === 'APPROVED' ? '#059669' : '#B45309' }
              ]}>
                {profile?.approvalStatus === 'APPROVED' ? 'Active Partner' : profile?.approvalStatus}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
              <Text style={styles.statValue}>{profile?.rating?.toFixed(1) || '0.0'}/5</Text>
              <Text style={styles.statSub}>{profile?.reviewCount || 0} Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={16} color={COLORS.primary} />
              <Text style={styles.statValue}>{profile?.totalCollections?.toLocaleString() || '0'}</Text>
              <Text style={styles.statSub}>Total Collections</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconCircle}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.8}>
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEF2F2' }]}>
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Logout</Text>
            <Text style={styles.menuSubtitle}>Sign out of your account</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 2.4.1 Build 8801</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F8FAFC',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, ...SHADOWS.soft,
  },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#F0FDFA',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#CCFBF1',
  },
  editDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  partnerName: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  idStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  partnerId: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  statSub: { fontSize: 11, color: '#64748B', textAlign: 'center' },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, ...SHADOWS.soft,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FDFA',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  menuSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  menuValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  logoutCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 20, ...SHADOWS.soft,
  },
  versionText: { fontSize: 11, color: '#CBD5E1', textAlign: 'center' },
});