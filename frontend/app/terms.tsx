import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function TermsAndConditionsScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.gradient}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Terms & Conditions</Text>
                    <Text style={styles.date}>Effective Date: February 27, 2026</Text>

                    <View style={styles.section}>
                        <Text style={styles.heading}>1. Acceptance of Terms</Text>
                        <Text style={styles.text}>
                            By accessing or using the CityTrail framework and related mobile application, you agree to comply with and be bound by these Terms and Conditions.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>2. Booking and Payments</Text>
                        <Text style={styles.text}>
                            Users must complete bookings securely through the app. The final fare shown during booking is an estimate based on the distance. Any extra kilometers driven or extra time utilized will be billed subsequently at the end of the trip at the predefined rates.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>3. Vehicle Condition and Fines</Text>
                        <Text style={styles.text}>
                            Vehicles must be returned in the condition they were provided. Customers are fully liable for any traffic violations, intentional damages, or speeding fines incurred during their rental period.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>4. Eligibility</Text>
                        <Text style={styles.text}>
                            Drivers must possess a valid driver's license in India and be over 21 years of age for self-drive bookings.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>5. Limitation of Liability</Text>
                        <Text style={styles.text}>
                            In no event shall CityTrail be liable for any indirect, incidental, special, consequential, or punitive damages arising from your access to or use of the application.
                        </Text>
                    </View>

                    <View style={styles.footer} />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    gradient: { flex: 1 },
    scrollView: { flex: 1 },
    content: { padding: 24 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
    date: { fontSize: 14, color: '#64748b', marginBottom: 32 },
    section: { marginBottom: 24 },
    heading: { fontSize: 20, fontWeight: '600', color: '#136dec', marginBottom: 12 },
    text: { fontSize: 16, color: '#334155', lineHeight: 24 },
    footer: { height: 40 }
});
