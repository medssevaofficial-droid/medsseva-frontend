import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import { showError, showInfo } from '../../src/store/toastStore';
import { ConfirmSheet } from '../../src/components/ConfirmSheet';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { Home, Building2, Clock3 } from 'lucide-react-native';
import { RootState, AppDispatch } from '../../src/store';
import { setAddress, setAddressId, setBranch, setCollectionMode } from '../../src/store/slices/bookingSlice';
import { fetchAddressesThunk, removeAddressThunk } from '../../src/store/slices/addressSlice';
import { apiService } from '../../src/services/api';
import { useQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../src/theme/theme';

export default function AddressScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
 const addresses = useSelector((state: RootState) => state.address.addresses);
  const user = useSelector((state: RootState) => state.auth.user);
  const [addressesLoading, setAddressesLoading] = useState(true);
  
const [selectedId, setSelectedId] = useState<string | null>(addresses.length > 0 ? addresses[0].id : null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const collectionMode = useSelector((state: RootState) => state.booking.collectionMode);
const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await apiService.getBranches({ isActive: true, labVisit: true });
      return res.data || [];
    },
    enabled: collectionMode === 'lab',
  });

  React.useEffect(() => {
    if (addresses.length > 0 && !selectedId) {
      const defaultAddr = addresses.find(a => a.type.toLowerCase() === 'home') || addresses[0];
      setSelectedId(defaultAddr.id);
    }
  }, [addresses]);

useFocusEffect(
    React.useCallback(() => {
      if (user?.mobile) {
        setAddressesLoading(true);
        dispatch(fetchAddressesThunk(user.mobile)).finally(() => {
          setAddressesLoading(false);
        });
      } else {
        setAddressesLoading(false);
      }
    }, [dispatch, user?.mobile])
  );
const handleContinue = () => {
    if (collectionMode === 'lab') {
      if (!selectedBranchId) {
       showInfo('Please select a lab branch to continue.');
        return;
      }
     const branch = branches.find((b: any) => b.id === selectedBranchId);
      console.log('[BRANCH DEBUG] dispatching setBranch with:', { id: selectedBranchId, name: branch?.name });
      dispatch(setBranch({ id: selectedBranchId, name: branch?.name || 'Lab Branch' }));
      dispatch(setAddressId(null));
      router.push('/checkout/slot');
      return;
    }
    if (!selectedId) return;
    const selected = addresses.find(a => a.id === selectedId);
    if (selected) {
      dispatch(setAddress(selected.address));
      dispatch(setAddressId(selected.id));
      router.push('/checkout/slot');
    }
  };
const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(removeAddressThunk(deleteTarget));
    if (selectedId === deleteTarget) {
      setSelectedId(null);
    }
    setDeleteTarget(null);
  };

  const handleCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
     showInfo("Please enable location services in your device settings to fetch the current address.");
        setLoadingLocation(false);
        return;
      }

      // Fetch Coordinates
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse Geocoding
      const geocodes = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocodes && geocodes.length > 0) {
        const geo = geocodes[0];
        router.push({
          pathname: '/checkout/add-address',
          params: {
            lat: String(location.coords.latitude),
            lng: String(location.coords.longitude),
            city: geo.city || geo.subregion || '',
            state: geo.region || '',
            pincode: geo.postalCode || '',
            area: geo.district || geo.subregion || '',
            street: geo.street || geo.name || '',
          }
        } as any);
      } else {
        router.push({
          pathname: '/checkout/add-address',
          params: {
            lat: String(location.coords.latitude),
            lng: String(location.coords.longitude),
          }
        } as any);
      }
    } catch (error) {
      console.warn(error);
     showError("Could not fetch your device location. Please enter it manually.");
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
  <View style={styles.container}>
      <ConfirmSheet
        visible={deleteTarget !== null}
        title="Delete Address"
        message="Are you sure you want to permanently delete this saved location?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmDestructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Address</Text>
        <View style={{ width: 24 }} />
      </View>

    <ScreenWrapper
        bottomButton={
          <TouchableOpacity
            style={[styles.continueBtn, (collectionMode === 'lab' ? !selectedBranchId : !selectedId) && styles.continueBtnDisabled]}
            disabled={collectionMode === 'lab' ? !selectedBranchId : !selectedId}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>Continue to Slot Selection</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={styles.scrollContent}
      >
        
        <TouchableOpacity 
          style={styles.addAddressCard} 
          onPress={() => router.push('/checkout/add-address')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.addAddressText}>Add New Address</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.currentLocationCard, loadingLocation && { opacity: 0.6 }]} 
          onPress={handleCurrentLocation}
          disabled={loadingLocation}
          activeOpacity={0.7}
        >
          {loadingLocation ? (
            <ActivityIndicator color={COLORS.accent} size={22} style={{ marginRight: 4 }} />
          ) : (
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.accent} />
          )}
          <View style={styles.currentLocationTextCol}>
            <Text style={styles.currentLocationTitle}>
              {loadingLocation ? "Accessing GPS..." : "Use Current Location"}
            </Text>
            <Text style={styles.currentLocationSub}>
              {loadingLocation ? "Detecting your device coordinates..." : "Enable GPS to fetch address"}
            </Text>
          </View>
        </TouchableOpacity>

       {/* Collection Mode Toggle */}
        <View style={{ flexDirection: 'row', marginBottom: 20, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: collectionMode === 'home' ? COLORS.primary : COLORS.surface }}
            onPress={() => dispatch(setCollectionMode('home'))}
          >
          <View style={{ flexDirection: 'row', alignItems: 'center'}}>
  <Home
    size={16}
    color={collectionMode === 'home' ? COLORS.textLight : COLORS.textSecondary}
  />
  <Text
    style={{
      color: collectionMode === 'home' ? COLORS.textLight : COLORS.textSecondary,
      fontWeight: 'bold',
      fontSize: 13,
    }}
  >
    Home Collection
  </Text>
</View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: collectionMode === 'lab' ? COLORS.primary : COLORS.surface }}
            onPress={() => dispatch(setCollectionMode('lab'))}
          >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
  <Building2
    size={16}
    color={collectionMode === 'lab' ? COLORS.textLight : COLORS.textSecondary}
  />
  <Text
    style={{
      color: collectionMode === 'lab' ? COLORS.textLight : COLORS.textSecondary,
      fontWeight: 'bold',
      fontSize: 13,
    }}
  >
    Visit Lab
  </Text>
</View>
          </TouchableOpacity>
        </View>

        {collectionMode === 'lab' ? (
          <>
            <Text style={styles.sectionTitle}>Select Lab Branch</Text>
            {branchesLoading ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : branches.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="hospital-building" size={48} color={COLORS.border} />
                <Text style={styles.emptyText}>No branches available.</Text>
              </View>
            ) : (
              branches.map((branch: any) => (
                <TouchableOpacity
                  key={branch.id}
                  style={[styles.addressCard, selectedBranchId === branch.id && styles.addressCardSelected]}
                  onPress={() => setSelectedBranchId(branch.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.addressHeaderRow}>
                    <View style={styles.leftHeaderCol}>
                      <MaterialCommunityIcons name="hospital-building" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.nameText}>{branch.name}</Text>
                    </View>
                    <View style={styles.radioContainer}>
                      {selectedBranchId === branch.id
                        ? <MaterialCommunityIcons name="radiobox-marked" size={22} color={COLORS.primary} />
                        : <MaterialCommunityIcons name="radiobox-blank" size={22} color="#CBD5E1" />}
                    </View>
                  </View>
                  <Text style={styles.addressText}>{branch.line1}, {branch.city}, {branch.state} - {branch.pincode}</Text>
                  {branch.hours && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
  <Clock3 size={14} color={COLORS.primary} />
  <Text style={[styles.phoneText, { color: COLORS.primary }]}>
    {branch.hours}
  </Text>
</View>}
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
        <>
    <Text style={styles.sectionTitle}>Saved Addresses</Text>

        {addressesLoading ? (
          <>
            {[1, 2].map((i) => (
              <View key={i} style={[styles.addressCard, styles.skeletonCard]}>
                <View style={styles.skeletonRow}>
                  <View style={[styles.skeletonBox, { width: 120, height: 14, borderRadius: 7 }]} />
                  <View style={[styles.skeletonBox, { width: 40, height: 14, borderRadius: 7 }]} />
                </View>
                <View style={[styles.skeletonBox, { width: '100%', height: 12, borderRadius: 6, marginTop: 10 }]} />
                <View style={[styles.skeletonBox, { width: '70%', height: 12, borderRadius: 6, marginTop: 8 }]} />
                <View style={[styles.skeletonBox, { width: 100, height: 12, borderRadius: 6, marginTop: 12 }]} />
              </View>
            ))}
          </>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No saved addresses yet.</Text>
            <Text style={styles.emptySub}>Add one using the buttons above to continue.</Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <TouchableOpacity 
              key={addr.id} 
              style={[
                styles.addressCard,
                selectedId === addr.id && styles.addressCardSelected
              ]}
              onPress={() => setSelectedId(addr.id)}
              activeOpacity={0.8}
            >
              <View style={styles.addressHeaderRow}>
                <View style={styles.leftHeaderCol}>
                  <Text style={styles.nameText}>{addr.name}</Text>
                  <View style={[styles.typeBadge, selectedId === addr.id && styles.typeBadgeActive]}>
                    <MaterialCommunityIcons 
                      name={
                        addr.type === 'Home' ? 'home-outline' : 
                        addr.type === 'Work' ? 'briefcase-outline' : 
                        'map-marker-outline'
                      } 
                      size={11} 
                      color={selectedId === addr.id ? COLORS.primary : '#64748B'} 
                    />
                    <Text style={[styles.typeText, selectedId === addr.id && styles.typeTextActive]}>{addr.type.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity 
                    onPress={() => handleDelete(addr.id)} 
                    style={{ padding: 4, marginRight: 8 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                  <View style={styles.radioContainer}>
                    {selectedId === addr.id ? (
                      <MaterialCommunityIcons name="radiobox-marked" size={22} color={COLORS.primary} />
                    ) : (
                      <MaterialCommunityIcons name="radiobox-blank" size={22} color="#CBD5E1" />
                    )}
                  </View>
                </View>
              </View>
              
              <Text style={styles.addressText}>{addr.address}</Text>
              <View style={styles.phoneRow}>
                <MaterialCommunityIcons name="phone-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.phoneText}>{addr.phone}</Text>
              </View>
            </TouchableOpacity>
          ))
   )}
        </>
        )}

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
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textLight,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  addAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
    elevation: 2,
  },
  addAddressText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
    elevation: 2,
  },
  currentLocationTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  currentLocationTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
  currentLocationSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 128, 128, 0.02)',
    borderWidth: 1.5,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftHeaderCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 12,
  },
  typeBadgeActive: {
    backgroundColor: 'rgba(0, 128, 128, 0.08)',
  },
  typeText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  typeTextActive: {
    color: COLORS.primary,
  },
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  nameText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textDark,
    marginTop: 12,
    fontWeight: 'bold',
  },
emptySub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  skeletonCard: {
    opacity: 1,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  skeletonBox: {
    backgroundColor: '#E2E8F0',
  },

  continueBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  continueBtnText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textLight,
    fontWeight: 'bold',
  }
});
