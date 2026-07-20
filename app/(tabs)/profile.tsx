import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, TYPOGRAPHY } from '../../src/theme/theme';
import { logout } from '../../src/store/slices/authSlice';
import { fetchFamilyMembers } from '../../src/store/slices/familySlice';
import { RootState, AppDispatch } from '../../src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const members = useSelector((state: RootState) => state.family.members);
  
const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

  useEffect(() => {
    dispatch(fetchFamilyMembers());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    } catch (e) {
      console.error('Failed to remove user session from AsyncStorage', e);
    }
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  const renderSettingItem = (icon: string, title: string, subtitle?: string, rightComponent?: React.ReactNode, onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconContainer}>
        <MaterialCommunityIcons name={icon as any} size={24} color={COLORS.textSecondary} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Profile Section */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <TouchableOpacity 
          style={styles.profileHeaderRow} 
          activeOpacity={0.85}
          onPress={() => router.push('/profile/edit')}
        >
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={40} color={COLORS.primary} />
            <View style={styles.editAvatarButton}>
              <MaterialCommunityIcons name="camera-outline" size={12} color="#fff" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'John Doe'}</Text>
            <Text style={styles.profilePhone}>+91 {user?.mobile || '9876543210'}</Text>
            <View style={styles.uhidBadge}>
              <Text style={styles.uhidText}>{user?.uhid ? `UHID: ${user.uhid}` : 'Generating UHID...'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Family Members Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <TouchableOpacity onPress={() => router.push('/profile/family')}>
              <Text style={styles.addText}>+ Add New</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {members.map((member) => (
              <View key={member.id} style={styles.familyCard}>
                <MaterialCommunityIcons 
                  name={member.relation === 'Wife' || member.relation === 'Daughter' || member.relation === 'Mother' ? "face-woman" : member.relation === 'Son' ? "human-child" : "account"} 
                  size={30} 
                  color={COLORS.primary} 
                />
                <Text style={styles.familyName} numberOfLines={1}>{member.name}</Text>
                <Text style={styles.familyRelation}>{member.relation}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addFamilyCard} onPress={() => router.push('/profile/family')}>
              <MaterialCommunityIcons name="plus" size={30} color="#94A3B8" />
              <Text style={styles.addFamilyText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            'map-marker-outline', 
            'Saved Addresses', 
            'Manage home and office locations', 
            undefined, 
            () => router.push('/profile/addresses')
          )}
          {renderSettingItem(
            'history', 
            'Booking History', 
            'View past and upcoming tests', 
            undefined, 
            () => router.push('/(tabs)/bookings')
          )}
          {renderSettingItem(
            'credit-card-outline', 
            'Payment Methods', 
            'Manage saved cards and UPI', 
            undefined, 
            () => router.push('/profile/payment')
          )}
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            'bell-outline', 
            'Push Notifications', 
            'Get test updates and offers',
            <Switch 
              value={isNotificationsEnabled} 
              onValueChange={setIsNotificationsEnabled}
              trackColor={{ false: '#E2E8F0', true: COLORS.success }}
              thumbColor="#fff"
            />,
            () => setIsNotificationsEnabled(!isNotificationsEnabled)
          )}
        </View>

        {/* Support & Legal */}
        <Text style={styles.sectionLabel}>Support & Legal</Text>
        <View style={styles.settingsGroup}>
   {renderSettingItem(
            'help-circle-outline',
            'Help Center',
            'FAQs and Contact Support',
            undefined,
            () => router.push('/support/chat')
          )}
          {renderSettingItem(
            'phone-outline', 
            'Contact Us', 
            'Noida diagnostics center coordinates', 
            undefined, 
            () => router.push('/profile/contact')
          )}
          {renderSettingItem(
            'shield-check-outline', 
            'Privacy Policy', 
            undefined, 
            undefined, 
            () => router.push({ pathname: '/profile/info', params: { type: 'privacy', title: 'Privacy Policy' } })
          )}
          {renderSettingItem(
            'file-document-outline', 
            'Terms of Service', 
            undefined, 
            undefined, 
            () => router.push({ pathname: '/profile/info', params: { type: 'terms', title: 'Terms of Service' } })
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>App Version 1.0.0 (Build 42)</Text>
      </ScrollView>
   
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.textDark,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...TYPOGRAPHY.h2,
    color: '#fff',
    marginBottom: 4,
  },
  profilePhone: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  uhidBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  uhidText: {
    ...TYPOGRAPHY.caption,
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    marginTop: -10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
  },
  addText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  horizontalScroll: {
    marginHorizontal: -5,
  },
  familyCard: {
    backgroundColor: '#F0F9FF',
    width: 90,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  addFamilyCard: {
    backgroundColor: '#F1F5F9',
    width: 90,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  familyName: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textDark,
    marginTop: 8,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  familyRelation: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 10,
  },
  addFamilyText: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: 'bold',
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  settingTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textDark,
  },
  settingSubtitle: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.danger,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
  },
});
