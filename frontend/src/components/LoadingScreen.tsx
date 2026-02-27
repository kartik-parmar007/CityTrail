import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const LoadingScreen = () => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.7);

    useEffect(() => {
        // Pulse animation for the logo
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Ghostly opacity fade
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(0.7, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, animatedStyle]}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
            <Text style={styles.brandText}>CityTrail</Text>
            <View style={styles.loaderContainer}>
                <Animated.View style={styles.loaderBarContainer} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: width * 0.4,
        height: width * 0.4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    brandText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 20,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    loaderContainer: {
        marginTop: 40,
        width: width * 0.4,
        height: 4,
        backgroundColor: '#f1f5f9',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loaderBarContainer: {
        height: '100%',
        backgroundColor: '#136dec',
        width: '100%',
    }
});

export default LoadingScreen;
