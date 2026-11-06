import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { SimulationCard } from '../../components/designSystem';

const SIMULATIONS = [
  {
    slug: 'irrigation',
    title: 'Irrigation Management',
    subtitle: 'Optimise water scheduling and understand soil-water-plant relationships.',
    duration: '15 – 20 min',
    difficulty: 'Beginner' as const,
    color: '#E3F2FD',
    emoji: '💧',
    category: 'Water',
  },
  {
    slug: 'drought',
    title: 'Drought Stress',
    subtitle: 'Simulate rainfall deficit and evaluate crop resilience strategies.',
    duration: '20 – 25 min',
    difficulty: 'Intermediate' as const,
    color: '#FFF3E0',
    emoji: '☀️',
    category: 'Climate',
  },
  {
    slug: 'fertilizer',
    title: 'Fertilizer Application',
    subtitle: 'Balance NPK inputs and understand Liebig's Law of the Minimum.',
    duration: '20 – 30 min',
    difficulty: 'Intermediate' as const,
    color: '#E8F5E9',
    emoji: '🌱',
    category: 'Nutrients',
  },
  {
    slug: 'pests',
    title: 'Pest & Disease Control',
    subtitle: 'Identify infestation levels and select effective control strategies.',
    duration: '20 – 25 min',
    difficulty: 'Intermediate' as const,
    color: '#FCE4EC',
    emoji: '🐛',
    category: 'Protection',
  },
  {
    slug: 'rotation',
    title: 'Crop Rotation Planning',
    subtitle: 'Plan multi-season rotations and analyse soil health benefits.',
    duration: '25 – 35 min',
    difficulty: 'Advanced' as const,
    color: '#F3E5F5',
    emoji: '🔄',
    category: 'Management',
  },
  {
    slug: 'climate',
    title: 'Climate Impact',
    subtitle: 'Model temperature and rainfall shifts and assess agricultural risk.',
    duration: '25 – 30 min',
    difficulty: 'Advanced' as const,
    color: '#E0F7FA',
    emoji: '🌡️',
    category: 'Climate',
  },
];

const CATEGORIES = ['All', 'Water', 'Climate', 'Nutrients', 'Protection', 'Management'];

export default function SimulationsScreen() {
  return (
    <ScrollView className="flex-1 bg-[#F7F9F5]" showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-28 pt-14">
        {/* Header */}
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#5D6F62]">Simulation Lab</Text>
        <Text className="mt-1 text-[28px] font-bold text-[#174B32]">Agricultural Scenarios</Text>
        <Text className="mt-2 text-[14px] text-[#607164]">
          Deterministic educational simulations based on documented agronomic principles.
        </Text>

        {/* Disclaimer */}
        <View className="mt-4 rounded-[18px] border border-[#E8B94F]/40 bg-[#FDF6E3] px-4 py-3">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.4px] text-[#A07B1A]">
            Educational Simulation
          </Text>
          <Text className="mt-1 text-[12px] text-[#705416]">
            Results are estimates for learning purposes only, not real agronomic predictions.
          </Text>
        </View>

        {/* Simulation Cards */}
        <Text className="mb-4 mt-6 text-[11px] font-semibold uppercase tracking-[1.8px] text-[#5D6F62]">
          Choose a scenario
        </Text>

        {SIMULATIONS.map((sim) => (
          <Link key={sim.slug} href={{ pathname: '/simulations/[slug]', params: { slug: sim.slug } }} asChild>
            <SimulationCard
              title={sim.title}
              subtitle={sim.subtitle}
              duration={sim.duration}
              difficulty={sim.difficulty}
              color={sim.color}
              icon={<Text style={{ fontSize: 36 }}>{sim.emoji}</Text>}
            />
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
