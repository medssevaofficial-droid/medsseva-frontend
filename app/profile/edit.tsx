import React, { useState, useEffect } from 'react';
import { 
View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Platform, 
  Modal, 
  Dimensions,
  FlatList,
  StatusBar,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { RootState } from '../../src/store';
import { updateProfile } from '../../src/store/slices/authSlice';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../src/theme/theme';
import { showSuccess, showError, showInfo } from '../../src/store/toastStore';

const { width } = Dimensions.get('window');

// List of Month Names for the Calendar picker
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Dynamic Tab state
  const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);

  // Form States - Personal Details
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.mobile || '');
  const [altPhone, setAltPhone] = useState(user?.altMobile || '');
  const [dob, setDob] = useState(user?.dob || 'Select Date');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>((user?.gender as any) || 'Male');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Form States - Location details
  const [fullAddress, setFullAddress] = useState(user?.fullAddress || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Noida');

  // Custom Calendar Modal States
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [currYear, setCurrYear] = useState(new Date().getFullYear() - 25); // Default to ~25 years ago
  const [currMonth, setCurrMonth] = useState(0); // January default

  // Generate Year items for calendar scrolling (1950 to current year)
  const yearsList: number[] = [];
  for (let y = new Date().getFullYear(); y >= 1950; y--) {
    yearsList.push(y);
  }

  // Simple Custom Javascript calendar Grid calculator
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysArray = Array.from({ length: getDaysInMonth(currYear, currMonth) }, (_, i) => i + 1);

  const handleSelectDay = (day: number) => {
    const formattedDate = `${day < 10 ? '0' + day : day}/${currMonth + 1 < 10 ? '0' + (currMonth + 1) : currMonth + 1}/${currYear}`;
    setDob(formattedDate);
    setIsCalendarVisible(false);
  };

  const fetchPincodeDetails = async (pin: string) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setCity(postOffice.District || postOffice.Block);
      }
    } catch (error) {
      console.log('Error fetching pincode', error);
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
    showInfo("Please allow access to your photos to change your profile picture.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setAvatarUrl(pickerResult.assets[0].uri);
    }
  };

  const handleSave = () => {
    // Validations
if (!name.trim()) {
      showError("Please provide your full name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
     showError("Please enter a valid email address.");
      return;
    }

    if (altPhone && !/^[0-9]{10}$/.test(altPhone)) {
      showError("Alternative Mobile number must be exactly 10 digits.");
      return;
    }

    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
    showError("Pincode must be exactly 6 digits.");
      return;
    }

    // Dispatch updated model to global Redux Slice
    dispatch(updateProfile({
      name: name.trim(),
      email: email.trim(),
      altMobile: altPhone.trim(),
      dob: dob !== 'Select Date' ? dob : undefined,
      gender,
      fullAddress: fullAddress.trim(),
      pincode: pincode.trim(),
      city: city.trim(),
      avatar: avatarUrl || undefined,
    }));

showSuccess("Your personal profile and location details have been synchronized!");
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* 1. Custom Premium Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtnTop} activeOpacity={0.8}>
          <Text style={styles.saveTextTop}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* 2. High-End Sliding Segmented Tab Pills */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabSegmentContainer}>
          <TouchableOpacity 
            style={[styles.tabSegmentBtn, activeTab === 'personal' && styles.tabSegmentBtnActive]}
            onPress={() => setActiveTab('personal')}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons 
              name="account-circle" 
              size={18} 
              color={activeTab === 'personal' ? '#FFFFFF' : '#64748B'} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabBtnText, activeTab === 'personal' && styles.tabBtnTextActive]}>Personal Info</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabSegmentBtn, activeTab === 'address' && styles.tabSegmentBtnActive]}
            onPress={() => setActiveTab('address')}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons 
              name="map-marker-radius" 
              size={18} 
              color={activeTab === 'address' ? '#FFFFFF' : '#64748B'} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabBtnText, activeTab === 'address' && styles.tabBtnTextActive]}>Address & Pin</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {activeTab === 'personal' ? (
          /* ------------------- TAB A: PERSONAL DETAILS ------------------- */
          <View style={styles.formSection}>
            
            {/* Avatar Frame */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarFrame}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                ) : (
                  <MaterialCommunityIcons name="account" size={56} color={COLORS.primary} />
                )}
                <TouchableOpacity style={styles.camBadge} onPress={handleImagePick}>
                  <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarCaption} onPress={handleImagePick}>Edit Photo</Text>
            </View>

            {/* Inputs Card */}
            <View style={styles.cardContainer}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="user@email.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.inputLabel}>VERIFIED MOBILE NUMBER</Text>
              <View style={[styles.inputRow, styles.lockedRow]}>
                <MaterialCommunityIcons name="phone-check" size={20} color="#059669" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: '#64748B' }]}
                  value={phone}
                  editable={false}
                />
                <MaterialCommunityIcons name="lock" size={16} color="#94A3B8" style={{ marginRight: 12 }} />
              </View>
              <Text style={styles.lockNotice}>Primary contact locked after OTP verification.</Text>

          
              <Text style={styles.inputLabel}>DATE OF BIRTH (DOB)</Text>
              <TouchableOpacity 
                style={styles.inputRow} 
                onPress={() => setIsCalendarVisible(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <Text style={[styles.input, styles.dateText, dob === 'Select Date' && styles.placeholderDate]}>
                  {dob}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#64748B" style={{ marginRight: 12 }} />
              </TouchableOpacity>

        
              <Text style={styles.inputLabel}>ALTERNATIVE MOBILE (OPTIONAL)</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="cellphone" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={altPhone}
                  onChangeText={(txt) => setAltPhone(txt.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 10 digit secondary mobile"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.gridBlock}>
                <View style={{ flex: 1.3, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>GENDER</Text>
                  <View style={styles.selectionRow}>
                    {(['Male', 'Female'] as const).map((g) => {
                      const isSel = gender === g;
                      return (
                        <TouchableOpacity 
                          key={g} 
                          style={[styles.chip, isSel && styles.chipActive]}
                          onPress={() => setGender(g)}
                        >
                          <Text style={[styles.chipText, isSel && styles.chipTextActive]}>{g}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>BLOOD GROUP</Text>
               <TouchableOpacity style={styles.bloodPicker} onPress={() => showInfo("Blood group picker coming soon.")}>
                    <Text style={styles.bloodVal}>{bloodGroup}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
        
          <View style={styles.formSection}>
            <View style={styles.cardContainer}>
              
            
              <Text style={styles.inputLabel}>FULL RESIDENTIAL ADDRESS</Text>
              <View style={[styles.inputRow, styles.textAreaRow]}>
                <MaterialCommunityIcons name="home-city-outline" size={20} color="#64748B" style={[styles.inputIcon, { marginTop: 14 }]} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={fullAddress}
                  onChangeText={setFullAddress}
                  placeholder="Enter flat no, building, street name, area"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

             
              <Text style={styles.inputLabel}>PINCODE</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={pincode}
                  onChangeText={(txt) => {
                    const pin = txt.replace(/[^0-9]/g, '');
                    setPincode(pin);
                    if (pin.length === 6) {
                      fetchPincodeDetails(pin);
                    }
                  }}
                  placeholder="e.g. 201301"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {pincode.length === 6 && (
                  <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" style={{ marginRight: 12 }} />
                )}
              </View>

              <Text style={styles.inputLabel}>NEAREST LANDMARK</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="compass-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="e.g. Opp Metro Station"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.inputLabel}>CITY / DISTRICT</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="city" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter your city/district"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>
        )}

     
        <TouchableOpacity style={styles.primaryUpdateBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.primaryUpdateBtnText}>Save Changes & Sync</Text>
          <MaterialCommunityIcons name="sync" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

    
      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarSheet}>
            
          
            <View style={styles.calSheetHeader}>
              <Text style={styles.calSheetHeadline}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                <MaterialCommunityIcons name="close-circle" size={26} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerSelectorsRow}>
             
              <View style={styles.pickerDropdownWrapper}>
                <Text style={styles.pickerLabel}>MONTH</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsHScroll}>
                  {MONTHS.map((m, idx) => (
                    <TouchableOpacity 
                      key={m} 
                      style={[styles.monthPill, currMonth === idx && styles.monthPillActive]}
                      onPress={() => setCurrMonth(idx)}
                    >
                      <Text style={[styles.monthPillText, currMonth === idx && styles.monthPillTextActive]}>{m.substring(0, 3)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerSelectorsRow}>
             
              <View style={{ width: '100%' }}>
                <Text style={styles.pickerLabel}>YEAR: {currYear}</Text>
                <FlatList
                  data={yearsList}
                  keyExtractor={(item) => item.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.yearsHScroll}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[styles.yearPill, currYear === item && styles.yearPillActive]}
                      onPress={() => setCurrYear(item)}
                    >
                      <Text style={[styles.yearPillText, currYear === item && styles.yearPillTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

          
            <Text style={[styles.pickerLabel, { marginTop: 20, marginBottom: 12 }]}>SELECT DAY IN {MONTHS[currMonth].toUpperCase()}</Text>
            <View style={styles.daysMatrix}>
              {daysArray.map((d) => (
                <TouchableOpacity 
                  key={d} 
                  style={styles.dayCell}
                  onPress={() => handleSelectDay(d)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayCellText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  saveBtnTop: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  saveTextTop: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tabsWrapper: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  tabSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
  },
  tabSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabSegmentBtnActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.soft,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    width: '100%',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarFrame: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    ...SHADOWS.soft,
    elevation: 3,
    position: 'relative',
  },
  camBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 8,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.soft,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    height: 52,
  },
  lockedRow: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  textAreaRow: {
    height: 90,
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginLeft: 14,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  dateText: {
    lineHeight: 50, // Ensures centered vertical text in Touchable mode
  },
  placeholderDate: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  textArea: {
    paddingTop: 14,
    paddingRight: 14,
  },
  lockNotice: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 5,
    fontStyle: 'italic',
    paddingLeft: 4,
  },
  gridBlock: {
    flexDirection: 'row',
    marginTop: 8,
  },
  selectionRow: {
    flexDirection: 'row',
    height: 48,
  },
  chip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  bloodPicker: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  bloodVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  primaryUpdateBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    ...SHADOWS.glow,
    elevation: 4,
  },
  primaryUpdateBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  calendarSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
  },
  calSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calSheetHeadline: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  pickerSelectorsRow: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pickerDropdownWrapper: {
    width: '100%',
  },
  monthsHScroll: {
    paddingRight: 20,
  },
  monthPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  monthPillActive: {
    backgroundColor: COLORS.primary,
  },
  monthPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  monthPillTextActive: {
    color: '#FFFFFF',
  },
  yearsHScroll: {
    paddingRight: 20,
  },
  yearPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  yearPillActive: {
    backgroundColor: COLORS.primary,
  },
  yearPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  yearPillTextActive: {
    color: '#FFFFFF',
  },
  daysMatrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  dayCell: {
    width: (width - 56) / 7, // Auto columns evenly
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 32,
  },
});
