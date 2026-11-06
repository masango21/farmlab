import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert, Image, Pressable, Text, View } from 'react-native';

import { AppHeader, ProgressCard, ScreenContainer, SectionHeader } from '../../components/designSystem';
import { userProfile } from '../../data/farmData';
import { farmApi } from '../../lib/farmApi';

export default function ProfileScreen() {
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: farmApi.me,
    staleTime: 60_000,
  });

  const user = currentUser?.user;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Digital Farmer';
  const role = user?.role ?? 'LEARNER';

  const handleLogout = async () => {
    const result = await farmApi.logout();
    Alert.alert('Session', result.message || 'Logged out successfully.');
    router.replace('/auth/sign-in');
  };

  return (
    <ScreenContainer>
      <AppHeader title="Farmer profile" subtitle="Profile" />

      <View className="mb-6 items-center rounded-[30px] bg-white p-5 shadow-sm">
        <Image source={{ uri: userProfile.avatar }} className="h-24 w-24 rounded-full" resizeMode="cover" />
        <Text className="mt-4 text-[28px] font-bold text-[#174B32]">{fullName}</Text>
        <Text className="mt-1 text-[14px] text-[#5D6F62]">{role}</Text>
        <Text className="mt-2 text-[13px] font-semibold text-[#236B45]">{user?.email ?? userProfile.location}</Text>
        <Pressable onPress={handleLogout} className="mt-4 rounded-full bg-[#174B32] px-5 py-2.5">
          <Text className="text-[14px] font-bold text-white">Log out</Text>
        </Pressable>
      </View>

      <SectionHeader title="Achievements" subtitle="Milestones" />
      <View className="mb-4 rounded-[26px] bg-[#E8F4E9] p-4">
        {['Completed 12 agriculture modules', 'Optimized 3 seasonal plans', 'Maintained 86% farm health score'].map((item) => (
          <View key={item} className="mb-3 flex-row items-start">
            <View className="mt-1 h-2.5 w-2.5 rounded-full bg-[#236B45]" />
            <Text className="ml-3 flex-1 text-[14px] text-[#384C3F]">{item}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Role dashboard" subtitle="Trainer view" />
      <ProgressCard title="Field coaching" detail="3 student groups completed irrigation planning revisions this week." status="Action needed" />
      <ProgressCard title="Farm review" detail="Average field risk remains below the alert threshold after the latest soil checks." status="Healthy" />

      <SectionHeader title="Progress" subtitle="Performance" />
      <ProgressCard title="Soil health review" detail="Improved pH balance and nutrient retention this week." status="On track" />
      <ProgressCard title="Irrigation efficiency" detail="Water usage is 12% below seasonal target." status="Strong" />
      <ProgressCard title="Season plan" detail="Upcoming planting window aligned with the climate model." status="Ready" />
    </ScreenContainer>
  );
}
