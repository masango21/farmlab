import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ArrowRight, Droplets, Leaf, TrendingUp } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import {
  AppHeader,
  CropCard,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
  SectionHeader,
  StatCard,
} from '../../components/designSystem';
import { crops, quickActions, userProfile } from '../../data/farmData';
import { farmApi } from '../../lib/farmApi';

export default function HomeScreen() {
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const user = await farmApi.me();
      return user;
    },
    staleTime: 60_000,
  });

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', currentUser?.user?.role ?? 'guest'],
    queryFn: farmApi.getDashboard,
    staleTime: 60_000,
  });

  const { data: cropList = crops } = useQuery({
    queryKey: ['crops'],
    queryFn: farmApi.getCrops,
    staleTime: 60_000,
  });

  const featuredCrop = cropList[0] ?? crops[0];
  const displayName = currentUser?.user ? `${currentUser.user.firstName ?? ''} ${currentUser.user.lastName ?? ''}`.trim() || 'Farmer' : 'Welcome';
  const isTrainer = dashboard?.role === 'TRAINER';
  const primaryMetric = isTrainer
    ? { label: 'Learners with submissions', value: dashboard?.totalLearners === undefined ? '—' : String(dashboard.totalLearners) }
    : { label: 'Learning progress', value: dashboard?.learningProgress === undefined ? '—' : `${dashboard.learningProgress}%` };
  const dashboardStats = isTrainer
    ? [
        { label: 'Assignments', value: dashboard?.activeLearningAssignments, detail: 'Created by you' },
        { label: 'Pending assessments', value: dashboard?.pendingAssessments, detail: 'Awaiting review' },
        { label: 'Submissions received', value: dashboard?.completedAssignments, detail: 'On your assignments' },
        { label: 'Learner performance', value: dashboard?.learnerPerformance, detail: 'From recorded scores' },
      ]
    : [
        { label: 'Lessons completed', value: dashboard?.completedLessons, detail: 'Recorded progress' },
        { label: 'Active simulations', value: dashboard?.activeSimulations, detail: 'Your saved runs' },
        { label: 'Assessment score', value: dashboard?.assessmentScores, detail: 'Recorded results' },
        { label: 'Learning progress', value: dashboard?.learningProgress === undefined ? undefined : `${dashboard.learningProgress}%`, detail: 'Based on completed lessons' },
      ];
  const recentActivities = dashboard?.recentActivities ?? [];

  return (
    <ScreenContainer>
      <AppHeader
        title={displayName}
        subtitle="Welcome back"
        right={
          <Image source={{ uri: userProfile.avatar }} className="h-12 w-12 rounded-full" resizeMode="cover" />
        }
      />

      <View className="mb-6 overflow-hidden rounded-[30px] bg-[#174b32] shadow-sm">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80' }}
          className="h-52 w-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-[#174b32]/45" />
        <View className="absolute inset-x-0 bottom-0 p-5">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#E8F4E9]">{isTrainer ? 'Training overview' : 'Learning overview'}</Text>
          <Text className="mt-2 text-[28px] font-bold text-white">{isTrainer ? 'Your learners' : 'Your learning'}</Text>
          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-[14px] text-[#E8F4E9]">{primaryMetric.label}</Text>
              <Text className="mt-1 text-[28px] font-bold text-white">{primaryMetric.value}</Text>
            </View>
            <Link href="/farm" asChild>
              <Pressable className="rounded-full bg-white/12 px-4 py-2.5">
                <Text className="text-[14px] font-semibold text-white">View farm</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>

      <View className="mb-6 flex-row flex-wrap justify-between">
        {dashboardStats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value === undefined ? '—' : String(item.value)} trend={item.detail} />
        ))}
      </View>

      <View className="mb-6 rounded-[28px] bg-[#E8F4E9] p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[18px] font-bold text-[#174B32]">Quick actions</Text>
          <ArrowRight size={18} color="#236b45" />
        </View>
        <View className="flex-row flex-wrap">
          {quickActions.map((action) => {
            const href =
              action === 'Explore Crops'
                ? '/crops'
                : action === 'Start Simulation'
                  ? '/simulations'
                  : action === 'Learn Agriculture'
                    ? '/learn'
                    : action === 'Add Crop'
                      ? '/crops'
                      : '/farm';

            return (
              <Link key={action} href={href} asChild>
                <Pressable className="mb-2 mr-2 rounded-full bg-white px-3 py-2">
                  <Text className="text-[13px] font-semibold text-[#174B32]">{action}</Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>

      <SectionHeader title="Featured crop" subtitle="Field focus" />
      <Link href={{ pathname: '/crops/[slug]', params: { slug: featuredCrop.slug } }} asChild>
        <Pressable className="mb-6 overflow-hidden rounded-[28px] bg-white shadow-sm">
          <Image source={{ uri: featuredCrop.image }} className="h-40 w-full" resizeMode="cover" />
          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[18px] font-bold text-[#174B32]">{featuredCrop.name}</Text>
                <Text className="text-[13px] text-[#607164]">{featuredCrop.category}</Text>
              </View>
              <View className="rounded-full bg-[#E8F4E9] p-2.5">
                <Leaf size={17} color="#236B45" />
              </View>
            </View>
            <View className="mt-3 flex-row justify-between">
              <View className="flex-row items-center">
                <Droplets size={15} color="#236B45" />
                <Text className="ml-2 text-[13px] text-[#4F5F52]">{featuredCrop.waterRequirements}</Text>
              </View>
              <View className="flex-row items-center">
                <TrendingUp size={15} color="#236B45" />
                <Text className="ml-2 text-[13px] text-[#4F5F52]">{featuredCrop.estimatedDuration}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Link>

      <SectionHeader title="Crop library" subtitle="Monthly planting" action={<PrimaryButton title="Explore" compact onPress={() => undefined} />} />
      <View className="mb-6">
        {cropList.slice(0, 4).map((crop) => (
          <Link key={crop.slug} href={{ pathname: '/crops/[slug]', params: { slug: crop.slug } }} asChild>
            <CropCard crop={crop} />
          </Link>
        ))}
      </View>

      <SectionHeader title="Recent activity" subtitle="Your recorded progress" action={<SecondaryButton title="Sync" compact onPress={() => undefined} />} />
      <View className="mb-3">
        {recentActivities.length === 0 ? (
          <Text className="rounded-[22px] bg-white p-4 text-[14px] text-[#5D6F62]">No recorded activity yet.</Text>
        ) : recentActivities.map((activity) => (
          <View key={activity} className="mb-3 rounded-[22px] bg-white p-4 shadow-sm">
            <Text className="text-[16px] font-bold text-[#174B32]">{activity}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
