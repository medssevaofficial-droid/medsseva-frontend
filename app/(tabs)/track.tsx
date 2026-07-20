import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { View as RNView } from 'react-native';

let MapView: any, Marker: any, Polyline: any;
MapView = ({ children, style }: any) => <RNView style={style}><Text>Map Placeholder</Text>{children}</RNView>;
Marker = ({ children }: any) => <RNView>{children}</RNView>;
Polyline = () => <RNView />;
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, TYPOGRAPHY } from '../../src/theme/theme';

const MOCK_LOCATION = {
  latitude: 28.4595,
  longitude: 77.0266,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const TECH_LOCATION = {
  latitude: 28.4700,
  longitude: 77.0300,
};

const HOME_LOCATION = {
  latitude: 28.4500,
  longitude: 77.0200,
};

export default function TrackScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <TouchableOpacity style={styles.helpButton}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      {Platform.OS === 'web' ? (
        <View style={styles.webMapFallback}>
          <MaterialCommunityIcons name="map-marker-radius" size={60} color={COLORS.primary} />
          <Text style={styles.webMapText}>Map view is not supported on web preview.</Text>
          <Text style={styles.webMapSubText}>Please use an iOS or Android device.</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={MOCK_LOCATION}
        >
          {/* Technician Marker */}
          <Marker coordinate={TECH_LOCATION} title="Technician" description="Rajesh is on the way">
            <View style={styles.techMarker}>
              <MaterialCommunityIcons name="motorbike" size={24} color="#fff" />
            </View>
          </Marker>

          {/* Home Marker */}
          <Marker coordinate={HOME_LOCATION} title="Home" description="Your address">
            <View style={styles.homeMarker}>
              <MaterialCommunityIcons name="home" size={20} color="#fff" />
            </View>
          </Marker>

          {/* Route Line */}
          <Polyline
            coordinates={[TECH_LOCATION, HOME_LOCATION]}
            strokeColor={COLORS.primary}
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        </MapView>
      )}

      {/* ETA and Tech Details Card */}
      <View style={styles.bottomSheet}>
        <View style={styles.etaContainer}>
          <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={styles.etaBadge}>
            <MaterialCommunityIcons name="clock-fast" size={20} color={COLORS.primary} />
            <Text style={styles.etaText}>Arriving in 15 mins</Text>
          </LinearGradient>
          <Text style={styles.bookingId}>Booking ID: BKG-102934</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.techProfileRow}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={50} color={COLORS.textSecondary} />
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>4.9</Text>
              <MaterialCommunityIcons name="star" size={10} color="#fff" />
            </View>
          </View>
          
          <View style={styles.techInfo}>
            <Text style={styles.techName}>Rajesh Kumar</Text>
            <Text style={styles.techRole}>Certified Phlebotomist</Text>
            <Text style={styles.tempText}>Temp: 98.4°F • Vaccinated</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="message-processing" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: COLORS.success }]}>
              <MaterialCommunityIcons name="phone" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.preparationBox}>
          <MaterialCommunityIcons name="information" size={20} color="#D97706" />
          <Text style={styles.prepText}>
            Reminder: Please ensure 10-12 hours of fasting before the sample collection.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  webMapText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
    marginTop: 16,
  },
  webMapSubText: {
    ...TYPOGRAPHY.body,
    color: '#64748B',
    marginTop: 8,
  },
  techMarker: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  homeMarker: {
    backgroundColor: COLORS.textDark,
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  etaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  etaText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bookingId: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  techProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 2,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
  },
  techRole: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    marginBottom: 4,
  },
  tempText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  preparationBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7', // Amber 50
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  prepText: {
    ...TYPOGRAPHY.caption,
    color: '#D97706',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});
