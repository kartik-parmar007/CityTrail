import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price');
  const [distance, setDistance] = useState<number>(0);
  const [fareInfo, setFareInfo] = useState<any>(null);

  useEffect(() => {
    loadCars();
    calculateDistance();
  }, []);

  useEffect(() => {
    filterAndSortCars();
  }, [cars, selectedType, sortBy]);

  const calculateDistance = async () => {
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
      setDistance(data.distance);
      setFareInfo(data.fare_breakdown);
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  const loadCars = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/cars`);
      const data = await response.json();
      setCars(data);
      setFilteredCars(data);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCars = () => {
    let filtered = cars;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((car) => car.type === selectedType);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'price') {
        return a.pricePerKm - b.pricePerKm;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    setFilteredCars(filtered);
  };

  const calculateFare = (car: Car) => {
    let fare = 0;
    if (params.tripType === 'oneway') {
      fare = distance * car.pricePerKm;
    } else if (params.tripType === 'roundtrip') {
      fare = distance * 2 * car.pricePerKm;
    } else {
      fare = car.pricePerKm * 40; // Local estimate
    }
    return fare + 300 + fare * 0.05; // Add driver allowance and taxes
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header & Search Context */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Select Ride</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {params.fromLocation || 'Pickup'} → {params.toLocation || 'Drop-off'} • Today, 10:00 AM
            </Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="options-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedType('all')}
          >
            <Ionicons name="sparkles-outline" size={18} color={selectedType === 'all' ? '#fff' : '#0f172a'} />
            <Text style={[styles.filterText, selectedType === 'all' && styles.filterTextActive]}>Recommended</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'sedan' && styles.filterChipActive]}
            onPress={() => setSelectedType('sedan')}
          >
            <Ionicons name="car-outline" size={18} color={selectedType === 'sedan' ? '#fff' : '#0f172a'} />
            <Text style={[styles.filterText, selectedType === 'sedan' && styles.filterTextActive]}>Sedan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'suv' && styles.filterChipActive]}
            onPress={() => setSelectedType('suv')}
          >
            <Ionicons name="people-outline" size={18} color={selectedType === 'suv' ? '#fff' : '#0f172a'} />
            <Text style={[styles.filterText, selectedType === 'suv' && styles.filterTextActive]}>SUV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'luxury' && styles.filterChipActive]}
            onPress={() => setSelectedType('luxury')}
          >
            <Ionicons name="star-outline" size={18} color={selectedType === 'luxury' ? '#fff' : '#0f172a'} />
            <Text style={[styles.filterText, selectedType === 'luxury' && styles.filterTextActive]}>Luxury</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.mainContent}>
        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>OFFER</Text>
            </View>
            <Text style={styles.promoTitle}>Get 15% off on your first outstation trip!</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Claim Now</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="car-outline" size={100} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#136dec" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.carsList}>
            {filteredCars.map((car) => {
              const estFare = calculateFare(car);
              return (
                <View key={car.id} style={styles.carCard}>
                  <View style={styles.carRow}>
                    {/* Image Section */}
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: car.image }} style={styles.carImage} resizeMode="cover" />
                      {car.type === 'sedan' && (
                        <View style={styles.ecoBadge}>
                          <Text style={styles.ecoBadgeText}>Eco</Text>
                        </View>
                      )}
                      {car.type === 'luxury' && (
                        <View style={[styles.ecoBadge, { backgroundColor: '#7e22ce' }]}>
                          <Text style={styles.ecoBadgeText}>VIP</Text>
                        </View>
                      )}
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoContainer}>
                      <View style={styles.infoHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.carName}>{car.name}</Text>
                          <Text style={styles.carSubtitle}>{car.type.toUpperCase()}</Text>
                        </View>
                        <View style={styles.priceColumn}>
                          <Text style={styles.priceValue}>${estFare.toFixed(0)}</Text>
                          <Text style={styles.priceLabel}>Total est.</Text>
                        </View>
                      </View>

                      {/* Features */}
                      <View style={styles.featuresRow}>
                        <View style={styles.featureChip}>
                          <Ionicons name="person-outline" size={14} color="#64748b" />
                          <Text style={styles.featureChipText}>{car.seating}</Text>
                        </View>
                        <View style={styles.featureChip}>
                          <Ionicons name="briefcase-outline" size={14} color="#64748b" />
                          <Text style={styles.featureChipText}>{car.luggage}</Text>
                        </View>
                        <View style={styles.featureChip}>
                          <Ionicons name="snow-outline" size={14} color="#64748b" />
                          <Text style={styles.featureChipText}>AC</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Action Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.footerInfo}>
                      <Ionicons name="flash-outline" size={16} color="#15803d" />
                      <Text style={styles.footerInfoText}>Instant Confirmation</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() =>
                        router.push({
                          pathname: '/booking',
                          params: {
                            carId: car.id,
                            tripType: params.tripType,
                            fromLocation: params.fromLocation,
                            toLocation: params.toLocation,
                          },
                        })
                      }
                    >
                      <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            {filteredCars.length === 0 && (
              <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>No cars found for the selected filters.</Text>
            )}
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 28,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  filtersContainer: {
    maxHeight: 40,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#136dec',
    borderColor: '#136dec',
    shadowColor: '#136dec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  promoBanner: {
    position: 'relative',
    backgroundColor: '#6366f1', // fallback
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#136dec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  promoContent: {
    zIndex: 10,
    alignItems: 'flex-start',
    gap: 12,
  },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    maxWidth: '70%',
  },
  promoButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  promoButtonText: {
    color: '#136dec',
    fontSize: 12,
    fontWeight: 'bold',
  },
  promoIcon: {
    position: 'absolute',
    right: -16,
    bottom: -32,
    zIndex: 1,
    transform: [{ rotate: '-10deg' }],
  },
  carsList: {
    gap: 16,
    paddingBottom: 40,
  },
  carCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  carRow: {
    flexDirection: 'row',
    gap: 16,
  },
  imageContainer: {
    width: 112,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  ecoBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#22c55e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ecoBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  carSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  priceLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureChipText: {
    fontSize: 12,
    color: '#64748b',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerInfoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803d',
  },
  bookButton: {
    backgroundColor: '#136dec',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#136dec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
