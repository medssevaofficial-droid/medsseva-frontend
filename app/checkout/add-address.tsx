import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { searchIndianCities, NominatimCity } from '../../src/services/geoService';
import { RootState } from '../../src/store';
import { addAddress } from '../../src/store/slices/addressSlice';
import { apiService } from '../../src/services/api';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../src/theme/theme';
import { showSuccess, showError, showInfo } from '../../src/store/toastStore';

export default function AddAddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [flatNo, setFlatNo] = useState('');
  const [area, setArea] = useState((params.area as string) || '');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState((params.pincode as string) || '');
  const [city, setCity] = useState((params.city as string) || '');
  const [state, setState] = useState((params.state as string) || '');
  const [name, setName] = useState(user?.name || 'John Doe');
  const [phone, setPhone] = useState(user?.mobile || '+91 9876543210');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
const [isLocating, setIsLocating] = useState(false);
  const [areaSuggestions, setAreaSuggestions] = useState<NominatimCity[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<NominatimCity[]>([]);
  const [areaSearchTimer, setAreaSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [citySearchTimer, setCitySearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

const handleAreaChange = (text: string) => {
    setArea(text);
    setAreaSuggestions([]);
    if (areaSearchTimer) clearTimeout(areaSearchTimer);
    if (text.trim().length < 2) return;
    const timer = setTimeout(async () => {
      const results = await searchIndianCities(text);
      setAreaSuggestions(results);
    }, 400);
    setAreaSearchTimer(timer);
  };

  const handleCityChange = (text: string) => {
    setCity(text);
    setCitySuggestions([]);
    if (citySearchTimer) clearTimeout(citySearchTimer);
    if (text.trim().length < 2) return;
    const timer = setTimeout(async () => {
      const results = await searchIndianCities(text);
      setCitySuggestions(results);
    }, 400);
    setCitySearchTimer(timer);
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError('Location permission denied. Please enable it in settings.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const geocodes = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geocodes && geocodes.length > 0) {
        const geo = geocodes[0];
        setArea(geo.district || geo.street || geo.subregion || '');
        setCity(geo.city || geo.subregion || '');
        setState(geo.region || '');
        setPincode(geo.postalCode || '');
        showSuccess('Location detected successfully!');
      }
    } catch (e) {
      showError('Failed to detect location. Please try manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!flatNo || !area || !city || !pincode) {
showInfo("Please fill in all mandatory address fields.");
      return;
    }

    const fullAddressString = `${flatNo}, ${landmark ? landmark + ', ' : ''}${area}, ${city}, ${state} - ${pincode}`;

    const newAddr = {
      id: Date.now().toString(),
      type: addressType,
      name: name.trim(),
      phone: phone.trim(),
      address: fullAddressString,
      flatNo: flatNo.trim(),
      landmark: landmark.trim(),
      area: area.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
     latitude: 0,
      longitude: 0,
    };

try {
      const saved = await apiService.addAddress({
        mobile: user?.mobile || '9999999999',
        type: addressType,
        line1: `${flatNo}, ${area}`,
        line2: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault: true
      });
      console.log('[ADD-ADDRESS DEBUG] Backend saved ID:', saved.id);
      dispatch(addAddress({ ...newAddr, id: saved.id }));
    showSuccess("Address added to your account successfully!");
      router.back();
    } catch (error) {
      console.error('Failed to add address to backend:', error);
  showError("Failed to save address. Please try again.");
    }
  };

const saveButton = (
    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
      <Text style={styles.saveBtnText}>Save & Add Address</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Address</Text>
        <View style={{ width: 24 }} />
      </View>

<View style={styles.locationButtonsRow}>
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={handleDetectLocation}
          disabled={isLocating}
        >
          <View style={styles.locationBtnIconWrap}>
            {isLocating ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationBtnText}>
              {isLocating ? 'Detecting location...' : 'Detect Current Location'}
            </Text>
            <Text style={styles.locationBtnSub}>Uses GPS for precise address fill</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.locationDivider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerOrPill}>
            <Text style={styles.dividerText}>OR</Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.manualCard}>
          <View style={styles.manualCardLeft}>
            <View style={styles.manualIconWrap}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color="#64748B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.manualCardTitle}>Enter Address Manually</Text>
              <Text style={styles.manualCardSub}>Fill your address details without using GPS</Text>
            </View>
          </View>
          <View style={styles.manualBadge}>
            <Text style={styles.manualBadgeText}>Below</Text>
          </View>
        </View>
      </View>
  <ScreenWrapper
        bottomButton={saveButton}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="map-marker-radius" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Address Details</Text>
        </View>

        <Text style={styles.label}>HOUSE NO. / BUILDING / APARTMENT *</Text>
        <TextInput
          style={styles.input}
          value={flatNo}
          onChangeText={setFlatNo}
          placeholder="e.g. Flat 302, Tower A, Grand Arch"
          placeholderTextColor="#94A3B8"
        />

    <Text style={styles.label}>ROAD / AREA / COLONY *</Text>
        <TextInput
          style={styles.input}
          value={area}
          onChangeText={handleAreaChange}
          placeholder="e.g. Sector 56, Golf Course Extension"
          placeholderTextColor="#94A3B8"
        />
        {areaSuggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {areaSuggestions.map((item, idx) => (
              <TouchableOpacity
                key={`area-${idx}`}
                style={styles.suggestionRow}
                onPress={() => { setArea(item.name); setAreaSuggestions([]); }}
              >
                <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.primary} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.suggestionName}>{item.name}</Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>{item.displayName}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.rowInput}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>PINCODE *</Text>
            <TextInput
              style={styles.input}
              value={pincode}
              onChangeText={setPincode}
              placeholder="122001"
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>CITY *</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={handleCityChange}
              placeholder="Gurgaon"
              placeholderTextColor="#94A3B8"
            />
            {citySuggestions.length > 0 && (
              <View style={styles.suggestionBox}>
                {citySuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={`city-${idx}`}
                    style={styles.suggestionRow}
                    onPress={() => { setCity(item.name); setCitySuggestions([]); }}
                  >
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.primary} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionSub} numberOfLines={1}>{item.displayName}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <Text style={styles.label}>LANDMARK (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          value={landmark}
          onChangeText={setLandmark}
          placeholder="e.g. Near Apex Hospital"
          placeholderTextColor="#94A3B8"
        />

        {/* Address Type Picker */}
        <Text style={styles.label}>SAVE ADDRESS AS</Text>
        <View style={styles.typeSelectorRow}>
          {(['Home', 'Work', 'Other'] as const).map((type) => {
            const isActive = addressType === type;
            const iconName = type === 'Home' ? 'home-outline' : type === 'Work' ? 'briefcase-outline' : 'map-marker-outline';
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, isActive && styles.typeChipActive]}
                onPress={() => setAddressType(type)}
              >
                <MaterialCommunityIcons 
                  name={iconName} 
                  size={18} 
                  color={isActive ? COLORS.textLight : '#64748B'} 
                />
                <Text style={[styles.typeChipText, isActive && styles.typeChipTextActive]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <MaterialCommunityIcons name="account-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Contact Details</Text>
        </View>

        <Text style={styles.label}>RECEIVER'S NAME *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>CONTACT NUMBER *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 9999999999"
          keyboardType="phone-pad"
          placeholderTextColor="#94A3B8"
        />

<View style={{ height: 20 }} />
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: COLORS.background,
    display: 'flex',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textLight,
  },
locationButtonsRow: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
    gap: 12,
  },
  locationBtnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  locationBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  locationBtnSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  locationDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 0,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerOrPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  manualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  manualCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  manualIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  manualCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  manualCardSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  manualBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  manualBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textDark,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textDark,
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: '#64748B',
    marginLeft: 6,
  },
  typeChipTextActive: {
    color: COLORS.textLight,
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
 saveBtnText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  suggestionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    marginBottom: 8,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  suggestionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});
