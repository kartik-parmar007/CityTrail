import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Car {
  id: string;
  type: string;
  name: string;
  image: string;
  seating: number;
  luggage: number;
  pricePerKm: number;
  features: string[];
  rating: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [tripType, setTripType] = useState('oneway');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/cars`);
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!fromLocation || !toLocation) {
      alert('Please enter both locations');
      return;
    }
    router.push({
      pathname: '/search',
      params: {
        tripType,
        fromLocation,
        toLocation,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CityTrail</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#0f172a" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>
            Where do you want{'\n'}
            <Text style={styles.heroTextHighlight}>to go today?</Text>
          </Text>

          {/* Trip Type Toggle */}
          <View style={styles.tripTypeTabs}>
            <TouchableOpacity
              style={[styles.tripTypeTab, tripType === 'oneway' && styles.tripTypeTabActive]}
              onPress={() => setTripType('oneway')}
            >
              <Text style={[styles.tripTypeText, tripType === 'oneway' && styles.tripTypeTextActive]}>One Way</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tripTypeTab, tripType === 'roundtrip' && styles.tripTypeTabActive]}
              onPress={() => setTripType('roundtrip')}
            >
              <Text style={[styles.tripTypeText, tripType === 'roundtrip' && styles.tripTypeTextActive]}>Roundtrip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tripTypeTab, tripType === 'local' && styles.tripTypeTabActive]}
              onPress={() => setTripType('local')}
            >
              <Text style={[styles.tripTypeText, tripType === 'local' && styles.tripTypeTextActive]}>Local</Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputsContainer}>
            {/* Pickup */}
            <View style={styles.inputWrapper}>
              <Ionicons name="locate-outline" size={20} color="#136dec" style={styles.inputIcon} />
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Pickup Location</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Current Location"
                  placeholderTextColor="#94a3b8"
                  value={fromLocation}
                  onChangeText={setFromLocation}
                />
              </View>
            </View>

            {/* Drop-off */}
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Drop-off Location</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter destination"
                  placeholderTextColor="#94a3b8"
                  value={toLocation}
                  onChangeText={setToLocation}
                />
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Ionicons name="calendar-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <View style={styles.inputTextContainer}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Select Date"
                    placeholderTextColor="#94a3b8"
                    value="Today, 24 Oct"
                    editable={false}
                  />
                </View>
              </View>
              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                <Ionicons name="time-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <View style={styles.inputTextContainer}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Select Time"
                    placeholderTextColor="#94a3b8"
                    value="10:00 AM"
                    editable={false}
                  />
                </View>
              </View>
            </View>

            {/* Search Button */}
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search Cars</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Deals */}
        <View style={styles.dealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Deals</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#136dec" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsList}>
              {cars.map((car) => (
                <View key={car.id} style={styles.carCard}>
                  <View style={styles.carCardHeader}>
                    <View>
                      <Text style={styles.carName}>{car.name}</Text>
                      <Text style={styles.carFeatures}>{car.type} • Automatic</Text>
                    </View>
                    {car.type === 'sedan' && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>BEST VALUE</Text>
                      </View>
                    )}
                    {car.type === 'luxury' && (
                      <View style={[styles.badgeContainer, { backgroundColor: '#f3e8ff' }]}>
                        <Text style={[styles.badgeText, { color: '#7e22ce' }]}>PREMIUM</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.carImageContainer}>
                    <Image source={{ uri: car.image }} style={styles.carImage} resizeMode="cover" />
                  </View>

                  <View style={styles.carCardFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceValue}>₹{car.pricePerKm}</Text>
                      <Text style={styles.priceUnit}>/km</Text>
                    </View>
                    <TouchableOpacity style={styles.arrowButton}>
                      <Ionicons name="arrow-forward-outline" size={18} color="#0f172a" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {cars.length === 0 && !loading && (
                <Text style={{ color: '#64748b' }}>No cars available at the moment.</Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Recent Searches */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <View style={styles.recentSearchesContainer}>
            {[
              { from: 'Mumbai Airport', to: 'Pune', when: 'Today, 2 pax' },
              { from: 'Delhi', to: 'Gurgaon', when: 'Yesterday, 1 pax' }
            ].map((search, index) => (
              <TouchableOpacity key={index} style={styles.recentSearchCard}>
                <View style={styles.recentSearchLeft}>
                  <View style={styles.historyIconContainer}>
                    <Ionicons name="time-outline" size={20} color="#475569" />
                  </View>
                  <View>
                    <Text style={styles.recentSearchRoute}>
                      {search.from} <Text style={{ color: '#94a3b8' }}>→</Text> {search.to}
                    </Text>
                    <Text style={styles.recentSearchWhen}>{search.when}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={24} color="#136dec" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  heroSection: {
    padding: 16,
  },
  heroText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 36,
    marginBottom: 24,
  },
  heroTextHighlight: {
    color: '#136dec',
  },
  tripTypeTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    height: 48,
  },
  tripTypeTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tripTypeTabActive: {
    backgroundColor: '#136dec',
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tripTypeTextActive: {
    color: '#ffffff',
  },
  inputsContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputTextContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 2,
  },
  textInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    padding: 0,
    margin: 0,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  searchButton: {
    backgroundColor: '#136dec',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dealsSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#136dec',
  },
  dealsList: {
    paddingRight: 16,
  },
  carCard: {
    width: 240,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  carCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  carName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  carFeatures: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  badgeContainer: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#15803d',
  },
  carImageContainer: {
    height: 112,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#136dec',
  },
  priceUnit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 2,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  recentSearchesContainer: {
    gap: 12,
    marginTop: 12,
  },
  recentSearchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  recentSearchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentSearchRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  recentSearchWhen: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  }
});
