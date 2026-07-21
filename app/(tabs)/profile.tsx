import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import { COLORS, TYPOGRAPHY } from '../../src/theme/theme';
import { fetchFamilyMembers } from '../../src/store/slices/familySlice';
import { RootState, AppDispatch } from '../../src/store';
import { performLogout } from '../../src/utils/logout';
import { ConfirmSheet } from '../../src/components/ConfirmSheet';
import { updateProfile } from '../../src/store/slices/authSlice';
import { apiService } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const members = useSelector((state: RootState) => state.family.members);

  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);
  const [showLogoutSheet, setShowLogoutSheet] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const uploadLockRef = useRef(false);

  useEffect(() => {
    dispatch(fetchFamilyMembers());
  }, [dispatch]);

  const handleLogout = () => {
    setShowLogoutSheet(true);
  };

  const handleAvatarPress = async () => {
    if (uploadLockRef.current || isUploadingAvatar) return;

    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (libraryStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile image.');
      return;
    }

    Alert.alert(
      'Update Profile Photo',
      'Choose how you would like to update your photo.',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(cameraStatus),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async (cameraStatus: string) => {
    if (cameraStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await processAndUpload(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await processAndUpload(result.assets[0]);
    }
  };

  const processAndUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (uploadLockRef.current) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const uri = asset.uri;
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const fileSize = asset.fileSize ?? 0;

    if (!allowedTypes.includes(mimeType)) {
      Toast.show({ type: 'error', text1: 'Invalid file type', text2: 'Only JPG, PNG, and WEBP images are supported.' });
      return;
    }

    if (fileSize > 5 * 1024 * 1024) {
      Toast.show({ type: 'error', text1: 'File too large', text2: 'Please choose an image smaller than 5MB.' });
      return;
    }

    const ext = mimeType.split('/')[1] ?? 'jpg';
    const fileName = `avatar_${Date.now()}.${ext}`;

    uploadLockRef.current = true;
    setIsUploadingAvatar(true);

   try {
      const response = await apiService.uploadAvatar(uri, mimeType, fileName);
      dispatch(updateProfile({ avatarUrl: response.avatarUrl }));
      const userRaw = await AsyncStorage.getItem('user');
      if (userRaw) {
        const stored = JSON.parse(userRaw);
        await AsyncStorage.setItem('user', JSON.stringify({ ...stored, avatarUrl: response.avatarUrl }));
      }
      Toast.show({ type: 'success', text1: 'Profile image updated successfully.' });
    } catch (error: any) {
      const message = error?.response?.data?.error ?? 'Failed to upload profile image. Please try again.';
      Toast.show({ type: 'error', text1: 'Upload failed', text2: message });
    } finally {
      setIsUploadingAvatar(false);
      uploadLockRef.current = false;
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    rightComponent?: React.ReactNode,
    onPress?: () => void
  ) => (
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
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <TouchableOpacity
          style={styles.profileHeaderRow}
          activeOpacity={0.85}
          onPress={() => router.push('/profile/edit')}
        >
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
            disabled={isUploadingAvatar}
            activeOpacity={0.8}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <MaterialCommunityIcons name="account" size={40} color={COLORS.primary} />
            )}

            {isUploadingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <View style={styles.editAvatarButton}>
                <MaterialCommunityIcons name="camera-outline" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? ''}</Text>
            <Text style={styles.profilePhone}>{user?.mobile ? `+91 ${user.mobile}` : ''}</Text>
            <View style={styles.uhidBadge}>
              <Text style={styles.uhidText}>{user?.uhid ? `UHID: ${user.uhid}` : 'Generating UHID...'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
                  name={
                    member.relation === 'Wife' || member.relation === 'Daughter' || member.relation === 'Mother'
                      ? 'face-woman'
                      : member.relation === 'Son'
                      ? 'human-child'
                      : 'account'
                  }
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

        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem('map-marker-outline', 'Saved Addresses', 'Manage home and office locations', undefined, () => router.push('/profile/addresses'))}
          {renderSettingItem('history', 'Booking History', 'View past and upcoming tests', undefined, () => router.push('/(tabs)/bookings'))}
          {renderSettingItem('credit-card-outline', 'Payment Methods', 'Manage saved cards and UPI', undefined, () => router.push('/profile/payment'))}
        </View>

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

        <Text style={styles.sectionLabel}>Support & Legal</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem('help-circle-outline', 'Help Center', 'FAQs and Contact Support', undefined, () => router.push('/support/chat'))}
          {renderSettingItem('phone-outline', 'Contact Us', 'Noida diagnostics center coordinates', undefined, () => router.push('/profile/contact'))}
          {renderSettingItem('shield-check-outline', 'Privacy Policy', undefined, undefined, () => Linking.openURL('https://medsseva-app.onrender.com/privacy'))}
          {renderSettingItem('file-document-outline', 'Terms of Service', undefined, undefined, () => Linking.openURL('https://medsseva-app.onrender.com/terms'))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.0 (Build 42)</Text>
      </ScrollView>

      <ConfirmSheet
        visible={showLogoutSheet}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        confirmDestructive
        onConfirm={() => { setShowLogoutSheet(false); performLogout(); }}
        onCancel={() => setShowLogoutSheet(false)}
      />
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
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