import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Booking {
  id: string;
  car: {
    name: string;
    type: string;
    image: string;
  };
  trip_type: string;
  from_location: string;
  to_location: string;
  pickup_date: string;
  total_fare: number;
  status: string;
}

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.pickup_date);
    const today = new Date();
    if (activeTab === 'upcoming') {
      return bookingDate >= today || booking.status === 'pending';
    } else {
      return bookingDate < today && booking.status !== 'pending';
    }
  });

  const getMonthStr = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'short' });
  };

  const getDayStr = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate().toString().padStart(2, '0');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color="#136dec" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="filter-outline" size={24} color="#0f172a" />
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
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#136dec']} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No {activeTab} bookings</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.browseButtonText}>Browse Cars</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                {/* Image Section */}
                <ImageBackground
                  source={{ uri: booking.car?.image || 'https://via.placeholder.com/400x200?text=Route+Image' }}
                  style={styles.cardHeaderImage}
                  imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                >
                  <View style={styles.imageOverlay} />
                  <View style={styles.imageContent}>
                    <View style={styles.imageContentLeft}>
                      {booking.status === 'confirmed' && (
                        <View style={styles.statusBadgeConfirmed}>
                          <Text style={styles.statusBadgeTextConfirmed}>Confirmed</Text>
                        </View>
                      )}
                      {booking.status === 'pending' && (
                        <View style={styles.statusBadgePending}>
                          <Text style={styles.statusBadgeTextPending}>PENDING</Text>
                        </View>
                      )}
                      {booking.status === 'cancelled' && (
                        <View style={styles.statusBadgeCancelled}>
                          <Text style={styles.statusBadgeTextCancelled}>Cancelled</Text>
                        </View>
                      )}
                      <Text style={styles.routeText} numberOfLines={1}>
                        {booking.from_location.split(',')[0]} to {booking.to_location.split(',')[0]}
                      </Text>
                    </View>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateMonth}>{getMonthStr(booking.pickup_date)}</Text>
                      <Text style={styles.dateDay}>{getDayStr(booking.pickup_date)}</Text>
                    </View>
                  </View>
                </ImageBackground>

                {/* Details Section */}
                <View style={styles.cardDetails}>
                  <View style={styles.detailsTopRow}>
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>BOOKING ID</Text>
                      <Text style={styles.detailValue}>#RDX-{booking.id.slice(-4).toUpperCase()}</Text>
                    </View>
                    <View style={[styles.detailColumn, { alignItems: 'flex-end' }]}>
                      <Text style={styles.detailLabel}>VEHICLE</Text>
                      <View style={styles.vehicleInfo}>
                        <Ionicons name="car-outline" size={16} color="#0f172a" />
                        <Text style={styles.detailValue}>{booking.car?.name || 'Assigned soon'}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.detailsTopRow, { marginTop: 8 }]}>
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>FARE</Text>
                      <Text style={[styles.detailValue, { color: '#15803d' }]}>₹{booking.total_fare}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.primaryActionButton}>
                      <Text style={styles.primaryActionText}>View Details</Text>
                    </TouchableOpacity>
                    {booking.status !== 'cancelled' && (
                      <TouchableOpacity style={styles.secondaryActionButton}>
                        <Text style={styles.secondaryActionText}>Manage</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={24} color="#136dec" />
              <View style={styles.infoBannerTextContainer}>
                <Text style={styles.infoBannerTitle}>Need Help?</Text>
                <Text style={styles.infoBannerSubtitle}>
                  Contact our 24/7 support for any issues with your upcoming bookings.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#136dec',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  activeTabText: {
    color: '#136dec',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#136dec',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingsList: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeaderImage: {
    height: 128,
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  imageContentLeft: {
    flex: 1,
    marginRight: 16,
  },
  statusBadgeConfirmed: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusBadgeTextConfirmed: {
    color: '#dcfce7',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusBadgeTextPending: {
    color: '#fef3c7',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeCancelled: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusBadgeTextCancelled: {
    color: '#fee2e2',
    fontSize: 12,
    fontWeight: '600',
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 50,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardDetails: {
    padding: 16,
  },
  detailsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailColumn: {
    flexDirection: 'column',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: '#136dec',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(19, 109, 236, 0.1)',
    borderColor: 'rgba(19, 109, 236, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoBannerTextContainer: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  infoBannerSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
});
