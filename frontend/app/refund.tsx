import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function RefundPolicyScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.gradient}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Refund & Cancellation Policy</Text>
                    <Text style={styles.date}>Effective Date: February 27, 2026</Text>

                    <View style={styles.section}>
                        <Text style={styles.heading}>1. Cancellations by Client</Text>
                        <Text style={styles.text}>
                            • Up to 24 hours before project commencement: 100% refund of the advance amount.
                        </Text>
                        <Text style={styles.text}>
                            • After project kickoff but before milestone 1: 50% refund minus a nominal processing fee for resources booked.
                        </Text>
                        <Text style={styles.text}>
                            • After milestone 1 delivery: No refund will be permitted.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>2. Cancellation by CityTrail</Text>
                        <Text style={styles.text}>
                            In the rare scenario that CityTrail is unable to fulfill a confirmed contract due to an unavoidable resource constraint or unforeseen circumstances, the client will be issued an immediate and 100% refund.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>3. Processing of Refunds</Text>
                        <Text style={styles.text}>
                            Any approved refunds will be credited back to the original mode of payment (i.e., credit card, debit card, or UPI) within 5 to 7 business days.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>4. Deposit Refund</Text>
                        <Text style={styles.text}>
                            Security or retainer deposits (if collected) will be refunded within 3-5 working days after the successful completion of the project and sign-off, pending no out-of-scope deliveries requested.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.heading}>5. Contact</Text>
                        <Text style={styles.text}>
                            For any queries regarding your cancellation or refund, please reach out directly to support@citytrail.site.
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
    title: { fontSize: 30, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
    date: { fontSize: 14, color: '#64748b', marginBottom: 32 },
    section: { marginBottom: 24 },
    heading: { fontSize: 20, fontWeight: '600', color: '#136dec', marginBottom: 12 },
    text: { fontSize: 16, color: '#334155', lineHeight: 24, marginBottom: 8 },
    footer: { height: 40 }
});
