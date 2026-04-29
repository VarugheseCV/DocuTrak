import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import HeroBanner from './HeroBanner';
import StatsRow from './StatsRow';
import QuickActions from './QuickActions';
import AdSlot from './AdSlot';

export default function DashboardHeader({ summary, alertDays }) {
  const { totalUrgent, nextExpiry, expired, expiringSoon, totalEntities } = summary;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <HeroBanner 
        totalUrgent={totalUrgent} 
        nextExpiry={nextExpiry} 
        alertDays={alertDays} 
        expiredCount={expired.length} 
        expiringSoonCount={expiringSoon.length} 
      />
      <StatsRow 
        totalEntities={totalEntities} 
        expiringSoonCount={expiringSoon.length} 
        expiredCount={expired.length} 
      />
      <QuickActions />
      <AdSlot />
    </Animated.View>
  );
}
