import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);

  // Passenger State
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [rides, setRides] = useState([]);

  // Driver State
  const [travelDate, setTravelDate] = useState('2026-03-01');
  const [seats, setSeats] = useState('3');
  const [price, setPrice] = useState('500');

  // Admin State
  const [analytics, setAnalytics] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePass, setInvitePass] = useState('');

  useEffect(() => {
    if (user?.role === 'main_admin' || user?.role === 'sub_admin') {
      fetchAnalytics();
    } else if (user?.role === 'passenger') {
      fetchRides();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) {
      console.log('Error fetching analytics', err);
    }
  };

  const inviteSubAdmin = async () => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/admin/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, password: invitePass, phone: '0000000000' })
      });
      if (res.ok) {
        Alert.alert('Success', 'Sub-admin invited!');
        setInviteEmail(''); setInviteName(''); setInvitePass('');
      } else {
        Alert.alert('Error', 'Failed to invite sub-admin');
      }
    } catch (err) {
      Alert.alert('Error', 'Network Error');
    }
  };

  const fetchRides = async () => {
    setLoading(true);
    try {
      const url = new URL(`${EXPO_PUBLIC_BACKEND_URL}/api/reservations`);
      if (fromLoc) url.searchParams.append('from', fromLoc);
      if (toLoc) url.searchParams.append('to', toLoc);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) setRides(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const postRide = async () => {
    if (!fromLoc || !toLoc) {
      Alert.alert('Error', 'Enter both locations');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          from_location: fromLoc,
          to_location: toLoc,
          travel_date: travelDate,
          available_seats: seats,
          price_per_seat: price
        })
      });
      if (res.ok) {
        Alert.alert('Success', 'Ride properly posted!');
      } else {
        const d = await res.json();
        Alert.alert('Error', d.detail || 'Failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const joinRide = async (rideId: string) => {
    try {
      const res = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/reservations/${rideId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ seats_needed: 1 })
      });
      if (res.ok) {
        Alert.alert('Booked', 'You joined the ride successfully!');
        fetchRides();
      } else {
        const d = await res.json();
        Alert.alert('Error', d.detail || 'Could not join');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    }
  };

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
          <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0 }} src="https://www.openstreetmap.org/export/embed.html?bbox=72.8,19.0,72.9,19.1&amp;layer=mapnik"></iframe>
        </div>
      );
    }
    return (
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: `<iframe width="100%" height="100%" frameborder="0" style="border:0;" src="https://www.openstreetmap.org/export/embed.html?bbox=72.8,19.0,72.9,19.1&amp;layer=mapnik"></iframe>` }}
          style={{ flex: 1 }}
        />
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CityTrail - {user.role.toUpperCase()}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Admin Dashboard */}
        {(user.role === 'main_admin' || user.role === 'sub_admin') && (
          <View>
            <Text style={styles.sectionTitle}>Admin Dashboard</Text>
            {analytics ? (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{analytics.total_users}</Text>
                  <Text style={styles.statLabel}>Users</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{analytics.total_drivers}</Text>
                  <Text style={styles.statLabel}>Drivers</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{analytics.total_reservations}</Text>
                  <Text style={styles.statLabel}>Rides</Text>
                </View>
              </View>
            ) : <ActivityIndicator />}

            {user.role === 'main_admin' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Invite Sub-Admin</Text>
                <TextInput style={styles.input} placeholder="Name" value={inviteName} onChangeText={setInviteName} />
                <TextInput style={styles.input} placeholder="Email" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Password" value={invitePass} onChangeText={setInvitePass} secureTextEntry />
                <TouchableOpacity style={styles.btn} onPress={inviteSubAdmin}>
                  <Text style={styles.btnText}>Send Invite</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Driver Dashboard */}
        {user.role === 'driver' && (
          <View>
            <Text style={styles.sectionTitle}>Offer a Ride</Text>
            {renderMap()}
            <View style={styles.card}>
              <TextInput style={styles.input} placeholder="From City (e.g., Mumbai)" value={fromLoc} onChangeText={setFromLoc} />
              <TextInput style={styles.input} placeholder="To City (e.g., Pune)" value={toLoc} onChangeText={setToLoc} />
              <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={travelDate} onChangeText={setTravelDate} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Seats" value={seats} onChangeText={setSeats} keyboardType="numeric" />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Price/Seat" value={price} onChangeText={setPrice} keyboardType="numeric" />
              </View>
              <TouchableOpacity style={styles.btn} onPress={postRide} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Publish Ride</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Passenger Dashboard */}
        {user.role === 'passenger' && (
          <View>
            <Text style={styles.sectionTitle}>Find a Ride</Text>
            {renderMap()}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="From" value={fromLoc} onChangeText={setFromLoc} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="To" value={toLoc} onChangeText={setToLoc} />
              </View>
              <TouchableOpacity style={styles.btnOutline} onPress={fetchRides}>
                <Text style={styles.btnOutlineText}>Search Rides</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Available Rides</Text>
            {loading ? <ActivityIndicator /> : (
              rides.length > 0 ? rides.map((r: any) => (
                <View key={r.id} style={styles.rideCard}>
                  <Text style={styles.rideRoute}>{r.from_location} → {r.to_location}</Text>
                  <Text style={styles.rideInfo}>Date: {r.travel_date}</Text>
                  <Text style={styles.rideInfo}>Seats left: {r.available_seats} • Driver: {r.driver_name}</Text>
                  <View style={styles.rideFooter}>
                    <Text style={styles.price}>₹{r.price_per_seat}/seat</Text>
                    <TouchableOpacity style={styles.btnSmall} onPress={() => joinRide(r.id)}>
                      <Text style={styles.btnText}>Join Ride</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) : <Text style={{ textAlign: 'center', marginTop: 10 }}>No rides found. Try another route!</Text>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#1e293b' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: '#136dec', borderRadius: 8, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnOutline: { borderWidth: 1, borderColor: '#136dec', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnOutlineText: { color: '#136dec', fontWeight: 'bold', fontSize: 16 },
  btnSmall: { backgroundColor: '#136dec', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  statVal: { fontSize: 24, fontWeight: 'bold', color: '#136dec' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  rideCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  rideRoute: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  rideInfo: { fontSize: 14, color: '#475569', marginBottom: 4 },
  rideFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 12 },
  price: { fontSize: 18, fontWeight: '700', color: '#10b981' }
});
