import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Pressable, TextInput, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../theme/theme';
import * as Location from 'expo-location';
import { searchIndianCities, NominatimCity } from '../services/geoService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
  currentLocation?: string;
}

export function LocationPickerModal({ visible, onClose, onSelect, currentLocation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<NominatimCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const cities = await searchIndianCities(searchQuery);
      setResults(cities);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setResults([]);
    }
  }, [visible]);

  const handleUseLiveLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      const reverse = await Location.reverseGeocodeAsync(location.coords);
      const city = reverse[0]?.city || reverse[0]?.subregion || `${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}`;
      onSelect(city);
      onClose();
    } catch (e) {
      console.warn('Failed to get location:', e);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectCity = (name: string) => {
    Keyboard.dismiss();
    onSelect(name);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.dismissArea} onPress={onClose} />

        <View style={styles.sheetContent}>
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={22} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search for your city..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#94A3B8"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleUseLiveLocation}
            disabled={isLocating}
            style={styles.liveBtnContainer}
          >
            <LinearGradient
              colors={['rgba(0, 109, 111, 0.06)', 'rgba(20, 184, 166, 0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.liveBtn}
            >
              <View style={styles.gpsCircle}>
                {isLocating ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.liveTitle}>
                  {isLocating ? 'Acquiring location...' : 'Use Current Location'}
                </Text>
                <Text style={styles.liveSub}>Enable GPS for precise diagnostic routing</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>

          {searchQuery.trim().length < 2 ? (
            <View style={styles.hintBox}>
              <MaterialCommunityIcons name="map-search-outline" size={32} color="#CBD5E1" />
              <Text style={styles.hintText}>Type at least 2 characters to search</Text>
            </View>
          ) : isSearching ? (
            <View style={styles.hintBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.hintText}>Searching...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              keyboardShouldPersistTaps="handled"
            >
              {results.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No results for "{searchQuery.trim()}"</Text>
                </View>
              ) : (
                results.map((city, idx) => (
                  <TouchableOpacity
                    key={`${city.latitude}-${city.longitude}-${idx}`}
                    style={styles.resultRow}
                    onPress={() => handleSelectCity(city.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultIcon}>
                      <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName} numberOfLines={1}>{city.name}</Text>
                      <Text style={styles.resultDisplay} numberOfLines={1}>{city.displayName}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    ...SHADOWS.soft,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  liveBtnContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,109,111,0.12)',
  },
  gpsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    ...SHADOWS.soft,
  },
  liveTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  liveSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  hintBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  hintText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  resultsList: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  resultIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  resultDisplay: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    fontSize: 13,
  },
});