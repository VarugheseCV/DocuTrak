import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import HeroBanner from './HeroBanner';
import StatsRow from './StatsRow';
import QuickActions from './QuickActions';
import AdSlot from './AdSlot';

export default function DashboardHeader({ summary, alertDays }) {
  const { totalUrgent, nextExpiry, expired, expiringSoon, totalEntities } = summary;

  return (
    <Animated.View entering={FadeIn.duration(400)}>
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
