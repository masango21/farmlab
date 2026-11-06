import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ScrollView, Text, View, Pressable, Image } from 'react-native';

import { crops, type Crop } from '../../data/farmData';
import { farmApi } from '../../lib/farmApi';

export default function CropCatalogScreen() {
  const { data: cropList = crops } = useQuery({
    queryKey: ['crops'],
    queryFn: farmApi.getCrops,
    staleTime: 60_000,
  });

  const grouped: Record<string, Crop[]> = cropList.reduce((acc, crop) => {
    acc[crop.category] = acc[crop.category] ?? [];
    acc[crop.category].push(crop);
    return acc;
  }, {} as Record<string, Crop[]>);

  return (
    <ScrollView className="flex-1 bg-[#f7f9f5]" showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-28 pt-10">
        <Text className="text-sm font-medium uppercase tracking-[1.5px] text-[#5d6f62]">Crop catalogue</Text>
        <Text className="mt-2 text-3xl font-bold text-[#174b32]">Explore farming options</Text>

        <View className="mt-5 gap-5">
          {Object.entries(grouped).map(([category, items]) => (
            <View key={category} className="rounded-[26px] bg-white p-4 shadow-soft">
              <Text className="text-lg font-semibold text-[#174b32]">{category}</Text>
              <View className="mt-3 gap-3">
                {items.map((crop) => (
                  <Link key={crop.slug} href={{ pathname: '/crops/[slug]', params: { slug: crop.slug } }} asChild>
                    <Pressable className="flex-row overflow-hidden rounded-[18px] bg-[#f3f9f5]">
                      <Image source={{ uri: crop.image }} className="h-20 w-20" resizeMode="cover" />
                      <View className="flex-1 justify-center px-4 py-3">
                        <Text className="text-base font-semibold text-[#174b32]">{crop.name}</Text>
                        <Text className="mt-1 text-xs text-[#607164]">{crop.scientificName}</Text>
                        <Text className="mt-2 text-xs font-medium text-[#236b45]">{crop.estimatedDuration}</Text>
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
