import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutUsScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.gradient}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    <Text style={styles.title}>About Us</Text>

                    <View style={styles.section}>
                        <Text style={styles.heading}>Who We Are</Text>
                        <Text style={styles.text}>
                            Welcome to CityTrail. We are an innovative mobility and car rental platform dedicated to making your travel seamless, affordable, and comfortable. Based in India, we connect you with a wide array of reliable rental vehicles suited for any occasion.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>Our Mission</Text>
                        <Text style={styles.text}>
                            Our mission is to empower individuals to explore their cities and beyond with independence and ease. We believe mobility should never be a limitation, but an experience driven by convenience, transparent pricing, and excellent service.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>What We Offer</Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>• Self-Drive Car Rentals</Text>
                            <Text style={styles.listItem}>• Chauffeur-Driven Vehicles</Text>
                            <Text style={styles.listItem}>• One-Way and Round-Trip options</Text>
                            <Text style={styles.listItem}>• 24/7 Roadside Assistance</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>Contact Details</Text>
                        <Text style={styles.text}>Company: CityTrail Rentals</Text>
                        <Text style={styles.text}>Email: support@citytrail.site</Text>
                        <Text style={styles.text}>Operating Address: 123 Main Street, Sector 15, City Center, India 400001</Text>
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
    heading: { fontSize: 20, fontWeight: '600', color: '#136dec', marginBottom: 12 },
    text: { fontSize: 16, color: '#334155', lineHeight: 24, marginBottom: 4 },
    list: { marginTop: 8, paddingLeft: 8 },
    listItem: { fontSize: 16, color: '#334155', lineHeight: 24, marginBottom: 8 },
    footer: { height: 40 }
});
