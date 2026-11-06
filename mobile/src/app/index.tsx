import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { getCurrentUser } from '../lib/farmApi';

const cropHighlights = [
  { name: 'Maize', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
  { name: 'Wheat', image: 'https://images.unsplash.com/photo-1464226184884-fa52ac9fcf5b?auto=format&fit=crop&w=900&q=80' },
  { name: 'Tomatoes', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80' },
  { name: 'Soybeans', image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80' },
];

const steps = [
  'Learn agricultural concepts.',
  'Select a crop.',
  'Configure farm conditions.',
  'Run an experiment.',
  'Analyse results.',
  'Improve decisions.',
];

const featureCards = [
  'Interactive simulations',
  'Crop management guidance',
  'Practical exercises',
  'Learning assessments',
];

export default function WelcomeScreen() {
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const user = await getCurrentUser();
      if (!isMounted) {
        return;
      }

      if (user) {
        router.replace('/(tabs)');
        return;
      }

      setCheckingSession(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (checkingSession) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-[#F7F9F5]" showsVerticalScrollIndicator={false}>
      <View className="pb-14">
        <View className="px-5 pt-12">
          <View className="mb-8 flex-row items-center justify-between">
            <Text className="text-[28px] font-bold text-[#174B32]">Digital Farm Lab</Text>
            <Link href="/auth/sign-in" asChild>
              <Pressable className="rounded-full border border-[#CFE0D5] bg-white px-4 py-2">
                <Text className="text-[13px] font-semibold text-[#174B32]">Sign In</Text>
              </Pressable>
            </Link>
          </View>

          <View className="overflow-hidden rounded-[30px] bg-[#174B32] shadow-sm">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80' }}
              className="h-72 w-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-[#174B32]/40" />
            <View className="absolute inset-x-0 bottom-0 p-6">
              <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#E8F4E9]">Agricultural learning platform</Text>
              <Text className="mt-2 text-[30px] font-bold text-white">Learn Agriculture. Experiment. Grow.</Text>
              <Text className="mt-3 text-[15px] text-[#E8F4E9]">
                Explore agricultural science through interactive simulations. Understand how irrigation, soil,
                nutrients, temperature and environmental conditions influence crop productivity.
              </Text>
              <View className="mt-5 flex-row gap-3">
                <Link href="/auth/register" asChild>
                  <Pressable className="rounded-full bg-[#E8B94F] px-5 py-3">
                    <Text className="text-[14px] font-bold text-[#174B32]">Get Started</Text>
                  </Pressable>
                </Link>
                <Link href="/auth/sign-in" asChild>
                  <Pressable className="rounded-full border border-white/70 bg-white/8 px-5 py-3">
                    <Text className="text-[14px] font-bold text-white">Sign In</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 pt-8">
          <Text className="text-[24px] font-bold text-[#174B32]">About Digital Farm Lab</Text>
          <Text className="mt-3 text-[15px] leading-6 text-[#536861]">
            Digital Farm Lab helps learners and trainers interact with real agricultural science concepts through
            crop selection, field analysis and evidence-based decision making. Our platform combines guided lessons,
            practical simulations and measurable learning outcomes for a modern agricultural education experience.
          </Text>

          <View className="mt-8 rounded-[28px] bg-[#E8F4E9] p-5">
            <Text className="text-[22px] font-bold text-[#174B32]">How It Works</Text>
            <View className="mt-4 gap-3">
              {steps.map((step, index) => (
                <View key={step} className="flex-row items-start">
                  <View className="mt-1 mr-3 h-7 w-7 items-center justify-center rounded-full bg-[#236B45]">
                    <Text className="text-[12px] font-bold text-white">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-[15px] text-[#3B5449]">{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-8">
            <Text className="text-[24px] font-bold text-[#174B32]">Explore Our Crops</Text>
            <View className="mt-4 flex-row flex-wrap justify-between">
              {cropHighlights.map((crop) => (
                <View key={crop.name} className="mb-4 w-[48%] overflow-hidden rounded-[24px] bg-white shadow-sm">
                  <Image source={{ uri: crop.image }} className="h-28 w-full" resizeMode="cover" />
                  <Text className="p-3 text-[15px] font-semibold text-[#174B32]">{crop.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
            <Text className="text-[22px] font-bold text-[#174B32]">Learning Features</Text>
            <View className="mt-4 flex-row flex-wrap">
              {featureCards.map((feature) => (
                <View key={feature} className="mb-2 mr-2 rounded-full bg-[#E8F4E9] px-3 py-2">
                  <Text className="text-[13px] font-semibold text-[#174B32]">{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-8 flex-row gap-4">
            <View className="flex-1 rounded-[24px] bg-white p-5 shadow-sm">
              <Text className="text-[20px] font-bold text-[#174B32]">For Learners</Text>
              <Text className="mt-2 text-[14px] text-[#536861]">
                Access lessons, run simulations, track progress and build practical agricultural insight.
              </Text>
            </View>
            <View className="flex-1 rounded-[24px] bg-white p-5 shadow-sm">
              <Text className="text-[20px] font-bold text-[#174B32]">For Trainers</Text>
              <Text className="mt-2 text-[14px] text-[#536861]">
                Create assignments, review experiments and guide learner improvement using real data.
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-10 border-t border-[#D9E6DC] bg-[#F0F5F1] px-5 py-6">
          <Text className="text-[18px] font-bold text-[#174B32]">Digital Farm Lab</Text>
          <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
            <Text className="text-[14px] text-[#536861]">About</Text>
            <Text className="text-[14px] text-[#536861]">Contact</Text>
            <Text className="text-[14px] text-[#536861]">Privacy Policy</Text>
            <Text className="text-[14px] text-[#536861]">Terms and Conditions</Text>
            <Text className="text-[14px] text-[#536861]">Help and Support</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
