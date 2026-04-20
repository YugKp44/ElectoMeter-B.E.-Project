import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
    Easing,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SPLASH_DURATION_MS = 2300;

export default function SplashScreen({ onFinish }) {
    const logoScale = useRef(new Animated.Value(0.72)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const ringRotate = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleY = useRef(new Animated.Value(16)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const progress = useRef(new Animated.Value(0)).current;
    const screenFade = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const rotating = Animated.loop(
            Animated.timing(ringRotate, {
                toValue: 1,
                duration: 6000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const pulsing = Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(glowPulse, {
                    toValue: 0,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        );

        rotating.start();
        pulsing.start();

        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 380,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 6,
                tension: 64,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(220),
                Animated.parallel([
                    Animated.timing(titleOpacity, {
                        toValue: 1,
                        duration: 420,
                        useNativeDriver: true,
                    }),
                    Animated.timing(titleY, {
                        toValue: 0,
                        duration: 420,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 380,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(progress, {
                toValue: 1,
                duration: 1700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        const timeout = setTimeout(() => {
            Animated.timing(screenFade, {
                toValue: 0,
                duration: 320,
                useNativeDriver: true,
            }).start(() => {
                rotating.stop();
                pulsing.stop();
                if (onFinish) {
                    onFinish();
                }
            });
        }, SPLASH_DURATION_MS);

        return () => {
            clearTimeout(timeout);
            rotating.stop();
            pulsing.stop();
        };
    }, []);

    const ringDeg = ringRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const glowScale = glowPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.08],
    });

    const glowOpacity = glowPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.18, 0.35],
    });

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Animated.View style={[styles.container, { opacity: screenFade }]}>
            <StatusBar barStyle="light-content" backgroundColor="#071224" translucent />
            <LinearGradient colors={['#071224', '#0E223A', '#103553']} style={styles.container}>
                <View style={styles.bgOrbTop} />
                <View style={styles.bgOrbBottom} />

                <View style={styles.centerWrap}>
                    <Animated.View
                        style={[
                            styles.glowRing,
                            {
                                opacity: glowOpacity,
                                transform: [{ scale: glowScale }],
                            },
                        ]}
                    />

                    <Animated.View style={[styles.outerRing, { transform: [{ rotate: ringDeg }] }]}>
                        <View style={styles.ringDotPrimary} />
                        <View style={styles.ringDotAccent} />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.logoFrame,
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }],
                            },
                        ]}
                    >
                        <Image source={require('../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
                    </Animated.View>

                    <Animated.View style={[styles.titleWrap, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
                        <Text style={styles.title}>
                            <Text style={styles.titleAccent}>Electo</Text>Meter
                        </Text>
                        <Text style={styles.subtitle}>Real-Time Smart Energy Intelligence</Text>
                    </Animated.View>

                    <Animated.View style={[styles.progressTrack, { opacity: subtitleOpacity }]}>
                        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                    </Animated.View>
                </View>

                <Animated.Text style={[styles.footerText, { opacity: subtitleOpacity }]}>B.E. PROJECT</Animated.Text>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    bgOrbTop: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        top: -80,
        right: -60,
        backgroundColor: 'rgba(0, 188, 212, 0.16)',
    },
    bgOrbBottom: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        bottom: -120,
        left: -100,
        backgroundColor: 'rgba(76, 175, 80, 0.14)',
    },
    glowRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#22D3EE',
    },
    outerRing: {
        width: 184,
        height: 184,
        borderRadius: 92,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringDotPrimary: {
        position: 'absolute',
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: '#4ADE80',
        top: -4,
        left: '50%',
        marginLeft: -4.5,
    },
    ringDotAccent: {
        position: 'absolute',
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#FACC15',
        bottom: 14,
        right: 14,
    },
    logoFrame: {
        position: 'absolute',
        width: 132,
        height: 132,
        borderRadius: 66,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    logoImage: {
        width: 88,
        height: 88,
    },
    titleWrap: {
        marginTop: 28,
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },
    titleAccent: {
        color: '#4ADE80',
    },
    subtitle: {
        marginTop: 8,
        fontSize: 12,
        letterSpacing: 1.6,
        color: 'rgba(255,255,255,0.84)',
        textTransform: 'uppercase',
    },
    progressTrack: {
        marginTop: 20,
        width: 180,
        height: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.22)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: '#4ADE80',
    },
    footerText: {
        position: 'absolute',
        bottom: 44,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.52)',
        fontSize: 11,
        letterSpacing: 4,
        fontWeight: '600',
    },
});
