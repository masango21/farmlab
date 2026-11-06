import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';

import { crops } from '../../data/farmData';
import { farmApi } from '../../lib/farmApi';

export default function CropDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const cropSlug = typeof slug === 'string' ? slug : '';

  const { data } = useQuery({
    queryKey: ['crop', cropSlug],
    queryFn: () => farmApi.getCrop(cropSlug),
    enabled: !!cropSlug,
    staleTime: 60_000,
  });
  const crop = data ?? crops[0];

  return (
    <ScrollView className="flex-1 bg-[#f7f9f5]" showsVerticalScrollIndicator={false}>
      <View className="pb-10">
        <Image source={{ uri: crop.image }} className="h-72 w-full" resizeMode="cover" />

        <View className="-mt-8 rounded-t-[30px] bg-[#f7f9f5] px-5 pt-6">
          <Text className="text-sm font-medium uppercase tracking-[1.4px] text-[#5d6f62]">{crop.category}</Text>
          <Text className="mt-2 text-3xl font-bold text-[#174b32]">{crop.name}</Text>
          <Text className="mt-2 text-base italic text-[#576b5d]">{crop.scientificName}</Text>

          <View className="mt-5 rounded-[24px] bg-white p-4 shadow-soft">
            <Text className="text-base text-[#4d6257]">{crop.description}</Text>
          </View>

          <View className="mt-5 gap-4">
            {[
              ['Climate', crop.climate],
              ['Soil', crop.soilRequirements],
              ['Ideal pH', crop.idealPh],
              ['Water needs', crop.waterRequirements],
              ['Temperature', crop.temperature],
              ['Growing season', crop.growingSeason],
              ['Planting', crop.plantingInstructions],
              ['Fertilizer', crop.fertilizerRequirements],
              ['Pests', crop.commonPests.join(', ')],
              ['Diseases', crop.commonDiseases.join(', ')],
              ['Harvest', crop.harvestingInfo],
              ['Duration', crop.estimatedDuration],
            ].map(([label, value]) => (
              <View key={String(label)} className="rounded-[20px] bg-white p-4 shadow-soft">
                <Text className="text-sm font-semibold uppercase tracking-[1.2px] text-[#236b45]">{label}</Text>
                <Text className="mt-2 text-sm text-[#42584b]">{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
