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
                        <Text style={styles.heading}>2. Services and Payments</Text>
                        <Text style={styles.text}>
                            Users must request services securely through the app or website. The final cost shown during consultation is an estimate based on the project scope. Any extra hours or out-of-scope requirements will be billed subsequently at the end of the project at predefined rates.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>3. Project Scope and Delays</Text>
                        <Text style={styles.text}>
                            Projects must be reviewed in the condition they were delivered. Customers are fully liable for any delays in providing necessary credentials, approvals, or assets incurred during their project timeline.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>4. Eligibility</Text>
                        <Text style={styles.text}>
                            Clients must represent an officially registered business entity or be over 18 years of age to legally engage our services.
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
