import { useQuery } from '@tanstack/react-query';
import { Image, Text, View } from 'react-native';

import {
  AppHeader,
  PrimaryButton,
  ScreenContainer,
  SectionHeader,
  StatCard,
} from '../../components/designSystem';
import { crops } from '../../data/farmData';
import { farmApi } from '../../lib/farmApi';

export default function FarmScreen() {
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: farmApi.getDashboard,
    staleTime: 60_000,
  });
  const { data: cropList = crops } = useQuery({
    queryKey: ['crops'],
    queryFn: farmApi.getCrops,
    staleTime: 60_000,
  });

  const currentDashboard = dashboard ?? {};

  return (
    <ScreenContainer>
      <AppHeader title={currentDashboard.farmName ?? 'My Farm'} subtitle="Farm overview" />

      <View className="mb-6 rounded-[30px] bg-[#174B32] p-5 shadow-sm">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[13px] text-[#DDEEE2]">Land area</Text>
            <Text className="mt-2 text-[28px] font-bold text-white">{currentDashboard.totalArea ?? '—'}</Text>
          </View>
          <View className="rounded-full bg-white/12 px-3 py-2">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.4px] text-[#E8F4E9]">{currentDashboard.healthScore ?? '—'}</Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-[13px] text-[#DDEEE2]">Crops</Text>
            <Text className="mt-2 text-[22px] font-bold text-white">{currentDashboard.activeCrops ?? '—'}</Text>
          </View>
          <View>
            <Text className="text-[13px] text-[#DDEEE2]">Productivity</Text>
            <Text className="mt-2 text-[22px] font-bold text-white">{currentDashboard.estimatedProductivity ?? '—'}</Text>
          </View>
          <View>
            <Text className="text-[13px] text-[#DDEEE2]">Simulations</Text>
            <Text className="mt-2 text-[22px] font-bold text-white">{currentDashboard.activeSimulations ?? '—'}</Text>
          </View>
        </View>
      </View>

      <View className="mb-6 flex-row flex-wrap justify-between">
        <StatCard label="Land area" value={currentDashboard.totalArea ?? '—'} trend="From your farm" />
        <StatCard label="Health score" value={currentDashboard.healthScore ?? '—'} trend="No score recorded" />
      </View>

      <SectionHeader title="Crop reference" subtitle="Agriculture library" action={<PrimaryButton title="Plan" compact onPress={() => undefined} />} />
      <View className="mb-6">
        {cropList.slice(0, 4).map((crop) => (
          <View key={crop.slug} className="mb-3 flex-row overflow-hidden rounded-[24px] bg-white shadow-sm">
            <Image source={{ uri: crop.image }} className="h-20 w-20" resizeMode="cover" />
            <View className="flex-1 justify-center px-4 py-3">
              <Text className="text-[16px] font-bold text-[#174B32]">{crop.name}</Text>
              <Text className="mt-1 text-[13px] text-[#5D6F62]">{crop.growingSeason}</Text>
              <Text className="mt-2 text-[11px] font-semibold uppercase tracking-[1.3px] text-[#236B45]">{crop.estimatedDuration}</Text>
            </View>
          </View>
        ))}
      </View>

      <SectionHeader title="Farm records" subtitle="Your account" />
      <Text className="rounded-[24px] bg-white p-4 text-[14px] text-[#5D6F62]">
        Farm field records are not available yet.
      </Text>
    </ScreenContainer>
  );
}
