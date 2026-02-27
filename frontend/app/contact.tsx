import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ContactUsScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.gradient}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Contact Us</Text>

                    <View style={styles.section}>
                        <Text style={styles.text}>
                            We'd love to hear from you. For any inquiries, feedback, or support requests regarding your CityTrail car rentals, please reach out to us using the information below.
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.heading}>Registered Office</Text>
                        <Text style={styles.text}>CityTrail Rentals</Text>
                        <Text style={styles.text}>123 Main Street, Sector 15</Text>
                        <Text style={styles.text}>City Center, Maharashtra, India 400001</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.heading}>Customer Support</Text>
                        <Text style={styles.text}>Email: support@citytrail.site</Text>
                        <Text style={styles.text}>Phone: +91 98765 43210</Text>
                        <Text style={styles.text}>Hours: Monday - Saturday, 9:00 AM to 6:00 PM IST</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.heading}>Grievance Officer</Text>
                        <Text style={styles.text}>Name: CityTrail Support Team</Text>
                        <Text style={styles.text}>Email: legal@citytrail.site</Text>
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
    title: { fontSize: 32, fontWeight: 'bold', color: '#0f172a', marginBottom: 24 },
    section: { marginBottom: 24 },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    heading: { fontSize: 18, fontWeight: '600', color: '#136dec', marginBottom: 12 },
    text: { fontSize: 16, color: '#334155', lineHeight: 24, marginBottom: 4 },
    footer: { height: 40 }
});
