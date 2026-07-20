import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, DeviceEventEmitter, ActivityIndicator } from 'react-native';
import { showInfo } from '../../src/store/toastStore';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { COLORS, TYPOGRAPHY, SHADOWS } from '../../src/theme/theme';
import { apiService } from '../../src/services/api';
import { RootState } from '../../src/store';

const MOCK_BOOKINGS = [
  {
    id: 'BKG-102934',
    testName: 'Complete Health Package',
    date: '12 May 2026',
    time: '08:00 AM - 09:00 AM',
    status: 'Upcoming',
    patient: 'John Doe',
    homeCollection: true,
  },
  {
    id: 'BKG-098122',
    testName: 'Advanced Lipid Profile',
    date: '02 Apr 2026',
    time: '07:30 AM - 08:30 AM',
    status: 'Completed',
    patient: 'John Doe',
    homeCollection: true,
  },
  {
    id: 'BKG-087233',
    testName: 'Thyroid Care Profile',
    date: '15 Mar 2026',
    time: '09:00 AM - 10:00 AM',
    status: 'Cancelled',
    patient: 'Sarah Doe',
    homeCollection: false,
  }
];

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');


const user = useSelector((state: RootState) => state.auth.user);
  
  const { data: rawBookings = [], isLoading, refetch } = useQuery({
    queryKey: ['bookings', user?.mobile],
    queryFn: () => apiService.getBookings(user?.mobile || ''),
    enabled: !!user?.mobile,
  });

useEffect(() => {
    const sub = DeviceEventEmitter.addListener('bookingCreated', () => {
      refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  const bookings = React.useMemo(() => {
    return rawBookings.map((b: any) => {
      const testNames = b.tests?.map((t: any) => t.test?.name).join(', ') || 'Diagnostic Test';
      
     const scheduledDate = b.scheduledDate ? new Date(b.scheduledDate) : null;
    const isPast = scheduledDate ? scheduledDate < new Date() : false;

   let mappedStatus = 'Upcoming';
    if (b.status === 'COMPLETED') mappedStatus = 'Completed';
    else if (b.status === 'CANCELLED') mappedStatus = 'Cancelled';
    else if (b.status === 'PENDING' && isPast) mappedStatus = 'Completed';
    else if (b.status === 'WAITING_FOR_PARTNER') mappedStatus = 'Upcoming';
      
      const slotDate = b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : 'TBD';

      return {
        id: b.id.substring(0, 8).toUpperCase(),
        realId: b.id,
        rawStatus: b.status,
        testName: testNames,
        date: slotDate,
        time: b.scheduledSlot || 'Morning Slot',
        status: mappedStatus,
        patient: b.patientName || user?.name || 'Self',
        homeCollection: b.address?.type !== 'CENTER',
      };
    });
  }, [rawBookings, user]);

const filteredBookings = bookings.filter((b: any) =>
    activeTab === 'upcoming'
      ? b.status === 'Upcoming'
      : b.status === 'Completed' || b.status === 'Cancelled'
  );
  const renderBookingCard = ({ item }: { item: typeof MOCK_BOOKINGS[0] }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <View style={[
            styles.statusBadge,
            item.status === 'Upcoming' ? styles.statusUpcoming : 
            item.status === 'Completed' ? styles.statusCompleted : styles.statusCancelled
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'Upcoming' ? styles.statusTextUpcoming : 
              item.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextCancelled
            ]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.bookingId}>#{item.id}</Text>
        </View>
      </View>

      <Text style={styles.testName}>{item.testName}</Text>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar-month-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="account-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.patient}</Text>
        </View>
        {item.homeCollection && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="home-plus-outline" size={16} color={COLORS.success} />
            <Text style={[styles.detailText, { color: COLORS.success }]}>Home Sample</Text>
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        {item.status === 'Upcoming' ? (
          <>
            <TouchableOpacity 
              style={styles.actionButtonSecondary} 
              onPress={() => DeviceEventEmitter.emit('openGlobalScheduler')}
            >
              <Text style={styles.actionButtonTextSecondary}>Reschedule</Text>
            </TouchableOpacity>
        {item.homeCollection ? (
              <TouchableOpacity
                style={[
                  styles.actionButtonPrimary,
                  (item as any).rawStatus === 'WAITING_FOR_PARTNER' && { backgroundColor: '#94A3B8' }
                ]}
                onPress={() => {
                  if ((item as any).rawStatus !== 'WAITING_FOR_PARTNER') {
                    router.push(`/tracking/${(item as any).realId}` as any);
                  }
                }}
              >
                <Text style={styles.actionButtonTextPrimary}>
                  {(item as any).rawStatus === 'WAITING_FOR_PARTNER' ? 'Searching...' : 'Track Tech'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButtonPrimary, { backgroundColor: COLORS.success }]} 
              onPress={() => showInfo("Please visit MedsSeva Hub - Central Plaza at your chosen time window. No home collection tracking is required.")}
              >
                <Text style={styles.actionButtonTextPrimary}>Lab Info</Text>
              </TouchableOpacity>
            )}
          </>
        ) : item.status === 'Completed' ? (
          <>
            <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => router.push('/search')}>
              <Text style={styles.actionButtonTextSecondary}>Rebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonPrimary} onPress={() => router.push('/(tabs)/reports')}>
              <Text style={styles.actionButtonTextPrimary}>View Report</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => router.push('/search')}>
            <Text style={styles.actionButtonTextSecondary}>Book Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.helpButton} onPress={() => router.push('/support/chat')}>
          <MaterialCommunityIcons name="headset" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past Bookings</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {isLoading && bookings.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textSecondary, fontSize: 13 }}>Loading Bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
              <Text style={styles.emptySubtitle}>You don't have any {activeTab} diagnostic appointments.</Text>
              <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/search')}>
                <Text style={styles.browseButtonText}>Book a Test</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textLight,
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.accent,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  cardHeader: {
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingId: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusUpcoming: {
    backgroundColor: '#E0F2FE',
  },
  statusCompleted: {
    backgroundColor: COLORS.successLight,
  },
  statusCancelled: {
    backgroundColor: COLORS.dangerLight,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  statusTextUpcoming: {
    color: '#0284C7',
  },
  statusTextCompleted: {
    color: COLORS.success,
  },
  statusTextCancelled: {
    color: COLORS.danger,
  },
  testName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginTop: 8,
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  actionButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: COLORS.accent, // Pink primary
  },
  actionButtonTextSecondary: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
  actionButtonTextPrimary: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  browseButtonText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
});
