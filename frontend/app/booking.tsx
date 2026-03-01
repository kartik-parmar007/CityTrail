import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fareInfo, setFareInfo] = useState<any>(null);

  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [passengers, setPassengers] = useState('1');

  useEffect(() => {
    loadCarDetails();
    calculateFare();
  }, []);

  const loadCarDetails = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/cars/${params.carId}`);
      const data = await response.json();
      setCar(data);
    } catch (error) {
      console.error('Error loading car:', error);
      Alert.alert('Error', 'Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  const calculateFare = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/locations/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_location: params.fromLocation,
          to_location: params.toLocation,
          trip_type: params.tripType,
        }),
      });
      const data = await response.json();
      setFareInfo(data);
    } catch (error) {
      console.error('Error calculating fare:', error);
    }
  };

  const handleBooking = async () => {
    if (!passengerName || !passengerPhone || !passengerEmail || !pickupDate || !passengers) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to continue');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          car_id: params.carId,
          trip_type: params.tripType,
          from_location: params.fromLocation,
          to_location: params.toLocation,
          pickup_date: pickupDate,
          passengers: parseInt(passengers),
          passenger_name: passengerName,
          passenger_phone: passengerPhone,
          passenger_email: passengerEmail,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create booking');
      }

      router.replace({
        pathname: '/booking-success',
        params: { bookingId: data.id },
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert('Booking Failed', error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const getTripTypeName = () => {
    if (params.tripType === 'oneway') return 'Web Development';
    if (params.tripType === 'roundtrip') return 'App Development';
    return 'SEO & Marketing';
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Summary</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Trip Itinerary */}
          <View style={styles.sectionCard}>
            <View style={styles.timelineContainer}>
              {/* Timeline Visual */}
              <View style={styles.timelineVisual}>
                <Ionicons name="radio-button-on-outline" size={20} color="#136dec" />
                <View style={styles.timelineLine} />
                <Ionicons name="location-outline" size={20} color="#136dec" />
              </View>
              {/* Timeline Content */}
              <View style={styles.timelineContentContainer}>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineCity}>{params.fromLocation}</Text>
                  <Text style={styles.timelineTime}>Pickup</Text>
                </View>
                <View style={[styles.timelineItem, { marginTop: 24 }]}>
                  <Text style={styles.timelineCity}>{params.toLocation}</Text>
                  <Text style={styles.timelineTime}>Drop-off</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Selected Car Details */}
          <View style={styles.carSectionCard}>
            <View style={styles.carInfoMain}>
              <View style={styles.carInfoLeft}>
                <Text style={styles.carName}>{car.name}</Text>
                <View style={styles.carBadge}>
                  <Text style={styles.carBadgeText}>{car.type}</Text>
                </View>
                <View style={styles.carFeaturesRow}>
                  <View style={styles.carFeature}>
                    <Ionicons name="person-outline" size={16} color="#64748b" />
                    <Text style={styles.carFeatureText}>{car.seating}</Text>
                  </View>
                  <View style={styles.carFeature}>
                    <Ionicons name="briefcase-outline" size={16} color="#64748b" />
                    <Text style={styles.carFeatureText}>{car.luggage}</Text>
                  </View>
                  <View style={styles.carFeature}>
                    <Ionicons name="snow-outline" size={16} color="#64748b" />
                    <Text style={styles.carFeatureText}>AC</Text>
                  </View>
                </View>
              </View>
              <View style={styles.carImageContainer}>
                <Image source={{ uri: car.image }} style={styles.carImage} resizeMode="cover" />
              </View>
            </View>
            <View style={styles.carSectionFooter}>
              <Text style={styles.tripTypeText}>{getTripTypeName()}</Text>
              <TouchableOpacity style={styles.changeCarBtn} onPress={() => router.back()}>
                <Text style={styles.changeCarText}>Change Package</Text>
                <Ionicons name="chevron-forward-outline" size={16} color="#136dec" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Passenger Details Form */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Passenger Details</Text>
          </View>
          <View style={styles.sectionCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter full name"
                  placeholderTextColor="#94a3b8"
                  value={passengerName}
                  onChangeText={setPassengerName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="phone-portrait-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94a3b8"
                  value={passengerPhone}
                  onChangeText={setPassengerPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter email"
                  placeholderTextColor="#94a3b8"
                  value={passengerEmail}
                  onChangeText={setPassengerEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Date</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                    value={pickupDate}
                    onChangeText={setPickupDate}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Passengers</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="people-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="1"
                    placeholderTextColor="#94a3b8"
                    value={passengers}
                    onChangeText={setPassengers}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Fare Breakdown */}
          {fareInfo && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Fare Breakdown</Text>
              </View>
              <View style={styles.sectionCard}>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Base Fare ({fareInfo.distance} km)</Text>
                  <Text style={styles.fareValue}>₹{fareInfo.fare_breakdown.base_fare}</Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Support Subscription</Text>
                  <Text style={styles.fareValue}>₹{fareInfo.fare_breakdown.driver_allowance}</Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>GST (5%)</Text>
                  <Text style={styles.fareValue}>₹{fareInfo.fare_breakdown.taxes}</Text>
                </View>
                <View style={styles.fareDivider} />
                <View style={styles.fareRowTotal}>
                  <Text style={styles.fareTotalLabel}>Total Payable</Text>
                  <Text style={styles.fareTotalValue}>₹{fareInfo.fare_breakdown.total}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={18} color="#136dec" />
                  <Text style={styles.infoText}>
                    Excludes third-party API and server hosting costs. These will be billed separately if required.
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Fixed Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarContent}>
            <View style={styles.bottomTotalContainer}>
              <Text style={styles.bottomTotalLabel}>TOTAL</Text>
              <Text style={styles.bottomTotalValue}>
                ₹{fareInfo ? fareInfo.fare_breakdown.total : '---'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleBooking}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  <Ionicons name="arrow-forward-outline" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineContainer: {
    flexDirection: 'row',
  },
  timelineVisual: {
    alignItems: 'center',
    paddingTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
    borderRadius: 2,
  },
  timelineContentContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  timelineItem: {
    flexDirection: 'column',
  },
  timelineCity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 20,
  },
  timelineTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  carSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  carInfoMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  carInfoLeft: {
    flex: 1,
    gap: 4,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  carBadge: {
    backgroundColor: 'rgba(19, 109, 236, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  carBadgeText: {
    color: '#136dec',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  carFeaturesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  carFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carFeatureText: {
    fontSize: 14,
    color: '#64748b',
  },
  carImageContainer: {
    width: 96,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carSectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  changeCarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeCarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#136dec',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 12,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 14,
    color: '#475569',
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  fareDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  fareRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  fareTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#136dec',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(19, 109, 236, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(19, 109, 236, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  bottomTotalContainer: {
    flexDirection: 'column',
  },
  bottomTotalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 1,
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#136dec',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
