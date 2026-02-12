import React, { useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');
const RING = SW * 0.52;

/* ───────── floating particles ───────── */
function useParticles(count) {
    return useMemo(() => {
        const out = [];
        for (let i = 0; i < count; i++) {
            out.push({
                x: Math.random() * SW,
                y: Math.random() * SH,
                size: 2 + Math.random() * 3,
                opacity: 0.15 + Math.random() * 0.25,
                anim: new Animated.Value(0),
                duration: 3000 + Math.random() * 4000,
                delay: Math.random() * 2000,
            });
        }
        return out;
    }, []);
}

function Particles({ particles, masterOpacity }) {
    useEffect(() => {
        particles.forEach((p) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(p.delay),
                    Animated.timing(p.anim, { toValue: 1, duration: p.duration, useNativeDriver: true }),
                    Animated.timing(p.anim, { toValue: 0, duration: p.duration, useNativeDriver: true }),
                ])
            ).start();
        });
    }, []);

    return particles.map((p, i) => {
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
        const opacity = p.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.opacity, 0] });
        return (
            <Animated.View
                key={i}
                style={{
                    position: 'absolute',
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    borderRadius: p.size / 2,
                    backgroundColor: i % 3 === 0 ? '#4CAF50' : i % 3 === 1 ? '#00BCD4' : '#FFD600',
                    opacity: Animated.multiply(opacity, masterOpacity),
                    transform: [{ translateY }],
                }}
            />
        );
    });
}

/* ───────── main component ───────── */
export default function SplashScreen({ onFinish }) {
    const particles = useParticles(20);

    // animation drivers
    const glow = useRef(new Animated.Value(0)).current;
    const outerRing = useRef(new Animated.Value(0)).current;
    const innerRing = useRef(new Animated.Value(0)).current;
    const ticks = useRef(new Animated.Value(0)).current;
    const needleRot = useRef(new Animated.Value(0)).current;
    const bolt = useRef(new Animated.Value(0)).current;
    const titleAnim = useRef(new Animated.Value(0)).current;
    const subAnim = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;
    const fade = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const t = (v, dur, d = 0) =>
            Animated.timing(v, { toValue: 1, duration: dur, delay: d, useNativeDriver: true });
        const s = (v, f = 6, te = 50) =>
            Animated.spring(v, { toValue: 1, friction: f, tension: te, useNativeDriver: true });

        Animated.sequence([
            // 1  glow
            t(glow, 500),
            // 2  outer ring
            Animated.parallel([s(outerRing, 7, 40)]),
            // 3  inner ring + ticks stagger
            Animated.parallel([s(innerRing, 7, 50), t(ticks, 500)]),
            // 4  needle sweeps
            Animated.timing(needleRot, { toValue: 1, duration: 800, useNativeDriver: true }),
            // 5  bolt pops
            Animated.spring(bolt, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
            // 6  title
            Animated.parallel([t(titleAnim, 500)]),
            // 7  subtitle
            t(subAnim, 400),
            // 8  pulse
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
                    Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
                ]),
                { iterations: 2 }
            ),
            Animated.delay(200),
            // 9  fade out
            Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => onFinish && onFinish());
    }, []);

    /* interpolations */
    const outerScale = outerRing.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
    const innerScale = innerRing.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
    const needleDeg = needleRot.interpolate({ inputRange: [0, 1], outputRange: ['-135deg', '45deg'] });
    const boltScale = bolt.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const titleY = titleAnim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] });
    const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

    return (
        <Animated.View style={[styles.fill, { opacity: fade }]}>
            <StatusBar barStyle="light-content" backgroundColor="#060b14" translucent />
            <LinearGradient colors={['#060b14', '#0c1829', '#0f2235']} style={styles.fill}>

                {/* floating particles */}
                <Particles particles={particles} masterOpacity={glow} />

                {/* ── centre stack ── */}
                <View style={styles.centre}>

                    {/* animated pulse wrapper */}
                    <Animated.View style={[styles.iconBox, { transform: [{ scale: pulse }] }]}>

                        {/* L1: soft glow */}
                        <Animated.View
                            style={[
                                styles.glow,
                                { opacity: glow, transform: [{ scale: glowScale }] },
                            ]}
                        />
                        <Animated.View style={[styles.glowInner, { opacity: glow }]} />

                        {/* L2: outer ring */}
                        <Animated.View style={[styles.svgCentre, { opacity: outerRing, transform: [{ scale: outerScale }] }]}>
                            <Svg width={RING} height={RING} viewBox="0 0 200 200">
                                <Circle cx="100" cy="100" r="92" stroke="#4CAF50" strokeWidth="2.5" fill="none" opacity={0.3} />
                                <Circle cx="100" cy="100" r="88" stroke="#4CAF50" strokeWidth="1" fill="none" opacity={0.15} />
                            </Svg>
                        </Animated.View>

                        {/* L3: inner ring */}
                        <Animated.View style={[styles.svgCentre, { opacity: innerRing, transform: [{ scale: innerScale }] }]}>
                            <Svg width={RING} height={RING} viewBox="0 0 200 200">
                                <Circle cx="100" cy="100" r="78" stroke="#00BCD4" strokeWidth="1.5" fill="none" opacity={0.45} />
                            </Svg>
                        </Animated.View>

                        {/* L4: tick marks */}
                        <Animated.View style={[styles.svgCentre, { opacity: ticks }]}>
                            <Svg width={RING} height={RING} viewBox="0 0 200 200">
                                {Array.from({ length: 13 }).map((_, i) => {
                                    const a = (-135 + i * (270 / 12)) * (Math.PI / 180);
                                    const color = i < 7 ? '#4CAF50' : i < 10 ? '#FFC107' : '#FF5252';
                                    const inner = i % 3 === 0 ? 64 : 68;
                                    return (
                                        <Line
                                            key={i}
                                            x1={100 + inner * Math.cos(a)}
                                            y1={100 + inner * Math.sin(a)}
                                            x2={100 + 76 * Math.cos(a)}
                                            y2={100 + 76 * Math.sin(a)}
                                            stroke={color}
                                            strokeWidth={i % 3 === 0 ? '3' : '1.5'}
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                                {/* small value labels */}
                                {[0, 6, 12].map((i) => {
                                    const a = (-135 + i * (270 / 12)) * (Math.PI / 180);
                                    const label = i === 0 ? '0' : i === 6 ? '50' : '100';
                                    return (
                                        <Svg key={`l${i}`}>
                                            {/* We use a text-less approach — just longer ticks for major marks */}
                                        </Svg>
                                    );
                                })}
                            </Svg>
                        </Animated.View>

                        {/* L5: needle */}
                        <Animated.View
                            style={[
                                styles.svgCentre,
                                { opacity: needleRot, transform: [{ rotate: needleDeg }] },
                            ]}
                        >
                            <Svg width={RING} height={RING} viewBox="0 0 200 200">
                                {/* needle shadow */}
                                <Line x1="100" y1="100" x2="100" y2="28" stroke="rgba(255,82,82,0.3)" strokeWidth="5" strokeLinecap="round" />
                                {/* needle */}
                                <Line x1="100" y1="100" x2="100" y2="30" stroke="#FF5252" strokeWidth="2.5" strokeLinecap="round" />
                                {/* hub */}
                                <Circle cx="100" cy="100" r="6" fill="#1a1a2e" stroke="#FF5252" strokeWidth="2" />
                                <Circle cx="100" cy="100" r="2.5" fill="#fff" />
                            </Svg>
                        </Animated.View>

                        {/* L6: lightning bolt */}
                        <Animated.View style={[styles.svgCentre, { opacity: bolt, transform: [{ scale: boltScale }] }]}>
                            <Svg width={RING * 0.28} height={RING * 0.36} viewBox="0 0 44 56">
                                {/* glow behind bolt */}
                                <Path d="M26 0 L10 24 L19 24 L14 56 L36 22 L25 22 Z" fill="#FFD600" opacity={0.3} />
                                {/* bolt body */}
                                <Path d="M25 2 L11 24 L20 24 L15 53 L34 23 L26 23 Z" fill="#FFD600" />
                                {/* bolt highlight */}
                                <Path d="M24 5 L14 24 L21 24 L17 47 L32 24 L27 24 Z" fill="#FFEB3B" />
                            </Svg>
                        </Animated.View>
                    </Animated.View>

                    {/* ── text ── */}
                    <Animated.View style={[styles.textBox, { opacity: titleAnim, transform: [{ translateY: titleY }] }]}>
                        <Text style={styles.title}>
                            <Text style={styles.titleAccent}>Electo</Text>Meter
                        </Text>
                        <View style={styles.line} />
                    </Animated.View>

                    <Animated.Text style={[styles.sub, { opacity: subAnim }]}>
                        Smart Energy Monitoring
                    </Animated.Text>
                </View>

                {/* ── bottom ── */}
                <Animated.View style={[styles.bottom, { opacity: subAnim }]}>
                    <View style={styles.dots}>
                        {['#4CAF50', '#00BCD4', '#FFD600'].map((c) => (
                            <View key={c} style={[styles.dot, { backgroundColor: c }]} />
                        ))}
                    </View>
                    <Text style={styles.brand}>B.E. PROJECT</Text>
                </Animated.View>
            </LinearGradient>
        </Animated.View>
    );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
    fill: { flex: 1, ...StyleSheet.absoluteFillObject, zIndex: 999 },
    centre: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* icon container */
    iconBox: {
        width: RING,
        height: RING,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 44,
    },
    svgCentre: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },

    /* glow layers */
    glow: {
        position: 'absolute',
        width: RING * 1.45,
        height: RING * 1.45,
        borderRadius: RING * 0.725,
        backgroundColor: 'rgba(76,175,80,0.05)',
    },
    glowInner: {
        position: 'absolute',
        width: RING * 1.15,
        height: RING * 1.15,
        borderRadius: RING * 0.575,
        backgroundColor: 'rgba(0,188,212,0.04)',
    },

    /* text */
    textBox: { alignItems: 'center', marginBottom: 14 },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 2,
    },
    titleAccent: {
        color: '#4CAF50',
    },
    line: {
        width: 40,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#4CAF50',
        marginTop: 12,
    },
    sub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: 5,
        textTransform: 'uppercase',
        fontWeight: '300',
    },

    /* bottom */
    bottom: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
    dots: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    dot: { width: 5, height: 5, borderRadius: 2.5 },
    brand: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: 6,
        fontWeight: '300',
    },
});
