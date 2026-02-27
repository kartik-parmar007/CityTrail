import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyPolicyScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#000000', '#1a1a2e']} style={styles.gradient}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <Text style={styles.date}>Effective Date: February 19, 2026</Text>

                    <View style={styles.section}>
                        <Text style={styles.heading}>1. Introduction</Text>
                        <Text style={styles.text}>
                            Welcome to CityTrail ("we," "our," or "us"). We value your privacy and are committed to protecting your personal information.
                            This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>2. Information We Collect</Text>
                        <Text style={styles.text}>
                            Currently, our app collects only the information necessary for user authentication:
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>• Name (if provided)</Text>
                            <Text style={styles.listItem}>• Email address</Text>
                            <Text style={styles.listItem}>• Password (stored securely)</Text>
                            <Text style={styles.listItem}>• Basic account information</Text>
                        </View>
                        <Text style={styles.text}>
                            We do not collect location data, payment details, or any sensitive personal information without your explicit consent.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>3. How We Use Your Information</Text>
                        <Text style={styles.text}>
                            We use the collected information only to:
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>• Create and manage user accounts</Text>
                            <Text style={styles.listItem}>• Authenticate users</Text>
                            <Text style={styles.listItem}>• Provide access to app features</Text>
                            <Text style={styles.listItem}>• Improve app functionality</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>4. Data Storage and Security</Text>
                        <Text style={styles.text}>
                            We implement reasonable security measures to protect your information.
                            User authentication data is stored securely and is not shared with third parties.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>5. Data Sharing</Text>
                        <Text style={styles.text}>
                            We do not sell, trade, or rent users' personal information to others.
                            We may share information only if required by law or to comply with legal obligations.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>6. Third-Party Services</Text>
                        <Text style={styles.text}>
                            Currently, our app does not use third-party advertising or analytics services.
                            If we integrate third-party services in the future, this Privacy Policy will be updated accordingly.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>7. Children's Privacy</Text>
                        <Text style={styles.text}>
                            Our app is not directed toward children under 13 years of age.
                            We do not knowingly collect personal information from children.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>8. Changes to This Policy</Text>
                        <Text style={styles.text}>
                            We may update this Privacy Policy from time to time.
                            Changes will be reflected by updating the "Effective Date" at the top of this page.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>9. Contact Us</Text>
                        <Text style={styles.text}>
                            If you have any questions about this Privacy Policy, you may contact us at:
                        </Text>
                        <Text style={[styles.text, styles.email]}>support@citytrail.site</Text>
                    </View>

                    <View style={styles.footer} />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#999',
        marginBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    heading: {
        fontSize: 20,
        fontWeight: '600',
        color: '#3498db',
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        color: '#ccc',
        lineHeight: 24,
    },
    list: {
        marginTop: 8,
        paddingLeft: 8,
    },
    listItem: {
        fontSize: 16,
        color: '#ccc',
        lineHeight: 24,
        marginBottom: 4,
    },
    email: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 8,
    },
    footer: {
        height: 40,
    }
});
