import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData, useTheme, useAppNavigation } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import GlassScreen from '../components/glass/GlassScreen';
import GlassSurface from '../components/glass/GlassSurface';
import GlassButton from '../components/glass/GlassButton';

const SLIDES = [
  {
    id: 1,
    icon: 'shield-checkmark',
    title: 'Private by default',
    subtitle: 'Your sensitive document records stay on this device unless you choose to back them up.',
    color: '#34C759'
  },
  {
    id: 2,
    icon: 'notifications',
    title: 'Expiry clarity',
    subtitle: 'DocuTrak groups upcoming deadlines so the next action is easy to spot.',
    color: '#FF9500'
  },
  {
    id: 3,
    icon: 'people',
    title: 'Organized around people and things',
    subtitle: 'Track passports, licenses, registrations, warranties, and more by entity.',
    color: '#4F7CFF'
  }
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { state, commit } = useData();
  const navigate = useAppNavigation();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(34)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(34);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();
  }, [step]);

  async function handleNext() {
    if (step < SLIDES.length - 1) {
      setStep(s => s + 1);
    } else {
      await commit({
        ...state,
        profile: { ...state.profile, hasCompletedOnboarding: true }
      });
      navigate(ROUTES.DASHBOARD);
      setTimeout(() => navigate(ROUTES.ADD_ENTITY), 500);
    }
  }

  const slide = SLIDES[step];

  return (
    <GlassScreen>
      <View style={styles.topSection}>
        <Text style={[styles.brand, { color: colors.primary }]}>DOCUTRAK</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <GlassSurface strong style={styles.heroGlass} contentStyle={styles.heroContent}>
          <View style={[styles.iconBox, { backgroundColor: `${slide.color}22` }]}>
            <Ionicons name={slide.icon} size={78} color={slide.color} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{slide.subtitle}</Text>
        </GlassSurface>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === step ? colors.primary : colors.borderHighlight, width: i === step ? 22 : 8 }]} />
          ))}
        </View>
        <GlassButton
          icon="arrow-forward"
          label={step === SLIDES.length - 1 ? "Get Started" : "Next"}
          variant="primary"
          onPress={handleNext}
          contentStyle={styles.nextButton}
        />
      </View>
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  topSection: { paddingHorizontal: 24, paddingTop: 60 },
  brand: { fontSize: 14, fontWeight: '900', letterSpacing: 4, textAlign: 'center' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  heroGlass: { borderRadius: 34 },
  heroContent: { alignItems: 'center', paddingHorizontal: 28, paddingVertical: 42 },
  iconBox: { width: 148, height: 148, borderRadius: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 34 },
  title: { fontSize: 31, fontWeight: '900', textAlign: 'center', marginBottom: 14 },
  subtitle: { fontSize: 16, lineHeight: 25, textAlign: 'center', fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingBottom: 50 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 28, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  nextButton: { minHeight: 58 },
});
