import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useData, useTheme, useAppNavigation } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';

const SLIDES = [
  {
    id: 1,
    icon: 'shield-checkmark',
    title: '100% Private',
    subtitle: 'DocuTrak is local-first. Your sensitive documents never leave your device unless you explicitly back them up.',
    color: '#34C759'
  },
  {
    id: 2,
    icon: 'notifications',
    title: 'Smart Alerts',
    subtitle: 'Never miss an expiry date. We automatically group alerts and remind you before critical documents expire.',
    color: '#FF9500'
  },
  {
    id: 3,
    icon: 'people',
    title: 'Organize by Entity',
    subtitle: 'Track passports for your family, licenses for your business, or warranties for your home—all neatly organized.',
    color: '#007AFF'
  }
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { state, commit } = useData();
  const navigate = useAppNavigation();
  const [step, setStep] = useState(0);

  async function handleNext() {
    if (step < SLIDES.length - 1) {
      setStep(s => s + 1);
    } else {
      await commit({
        ...state,
        profile: { ...state.profile, hasCompletedOnboarding: true }
      });
      // They just installed the app, no entities exist yet.
      // Force them to AddEntityScreen but reset the stack so back button goes to dashboard.
      navigate(ROUTES.DASHBOARD);
      setTimeout(() => navigate(ROUTES.ADD_ENTITY), 500);
    }
  }

  const slide = SLIDES[step];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.topSection}>
        <Text style={[styles.brand, { color: colors.primary }]}>DOCUTRAK</Text>
      </Animated.View>

      <Animated.View key={slide.id} entering={SlideInRight.duration(400).springify()} style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: `${slide.color}20` }]}>
          <Ionicons name={slide.icon} size={80} color={slide.color} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{slide.subtitle}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === step ? colors.primary : colors.borderHighlight }]} />
          ))}
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleNext}>
          <Text style={styles.btnText}>{step === SLIDES.length - 1 ? "Get Started" : "Next"}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { paddingHorizontal: 24, paddingTop: 60 },
  brand: { fontSize: 14, fontWeight: '900', letterSpacing: 4, textAlign: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconBox: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, lineHeight: 26, textAlign: 'center', fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingBottom: 50 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  btn: { flexDirection: 'row', backgroundColor: '#007AFF', paddingVertical: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '800' }
});
