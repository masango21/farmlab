import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';

import {
  InsightCard,
  MetricRow,
  OptionPicker,
  ParamSlider,
  PrimaryButton,
  RiskBadge,
  ScoreRing,
} from '../../components/designSystem';
import {
  type IrrigationInput,
  type SimulationResult,
  runIrrigationSimulation,
} from '../../lib/simulationEngine';

const CROP_OPTIONS = ['maize', 'tomatoes', 'wheat', 'soybeans'] as const;
const CROP_LABELS: Record<string, string> = {
  maize: 'Maize',
  tomatoes: 'Tomatoes',
  wheat: 'Wheat',
  soybeans: 'Soybeans',
};
const SOIL_OPTIONS = ['sandy', 'loam', 'clay'] as const;
const SOIL_LABELS: Record<string, string> = { sandy: 'Sandy', loam: 'Loam', clay: 'Clay' };

function SimpleBarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = 110;
  const barW = 48;
  const gap = 24;
  const chartW = data.length * (barW + gap);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={chartW} height={chartH + 40} style={{ overflow: 'visible' }}>
        {data.map((d, i) => {
          const barH = Math.max(4, (d.value / maxVal) * chartH);
          const x = i * (barW + gap) + 4;
          const y = chartH - barH;
          return (
            <Svg key={d.label}>
              <Rect x={x} y={y} width={barW} height={barH} fill={d.color} rx={8} />
              <SvgText
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#174B32"
              >
                {typeof d.value === 'number' ? d.value.toFixed(1) : d.value}
              </SvgText>
              <SvgText
                x={x + barW / 2}
                y={chartH + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#607164"
              >
                {d.label}
              </SvgText>
            </Svg>
          );
        })}
      </Svg>
    </ScrollView>
  );
}

export default function IrrigationSimulation() {
  const [inputs, setInputs] = useState<IrrigationInput>({
    irrigationLevel: 80,
    frequencyDays: 3,
    cropType: 'maize',
    soilType: 'loam',
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [ran, setRan] = useState(false);

  const run = () => {
    const r = runIrrigationSimulation(inputs);
    setResult(r);
    setRan(true);
  };

  const reset = () => {
    setResult(null);
    setRan(false);
  };

  return (
    <ScrollView className="flex-1 bg-[#F7F9F5]" showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-28 pt-14">
        {/* Back */}
        <Pressable onPress={() => router.back()} className="mb-5 self-start">
          <Text className="text-[14px] font-semibold text-[#236B45]">← Back</Text>
        </Pressable>

        {/* Header */}
        <View className="mb-1 flex-row items-center">
          <Text className="mr-2 text-[32px]">💧</Text>
          <View>
            <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#5D6F62]">Simulation</Text>
            <Text className="text-[22px] font-bold text-[#174B32]">Irrigation Management</Text>
          </View>
        </View>
        <Text className="mt-2 text-[13px] text-[#607164]">
          Adjust water inputs and understand their effect on yield. Assumptions: FAO crop water
          requirements; optimal maize demand ≈ 90% of field capacity.
        </Text>

        {!ran ? (
          <>
            {/* Parameters */}
            <View className="mt-6 rounded-[24px] bg-white p-5 shadow-sm">
              <Text className="mb-4 text-[14px] font-bold text-[#174B32]">Set Parameters</Text>

              <OptionPicker
                label="Crop Type"
                options={[...CROP_OPTIONS]}
                value={inputs.cropType}
                onChange={(v) => setInputs((p) => ({ ...p, cropType: v }))}
                labels={CROP_LABELS as never}
              />

              <OptionPicker
                label="Soil Type"
                options={[...SOIL_OPTIONS]}
                value={inputs.soilType}
                onChange={(v) => setInputs((p) => ({ ...p, soilType: v }))}
                labels={SOIL_LABELS as never}
              />

              <ParamSlider
                label="Irrigation Level"
                value={inputs.irrigationLevel}
                min={0}
                max={150}
                step={5}
                unit="%"
                onChange={(v) => setInputs((p) => ({ ...p, irrigationLevel: v }))}
                note="% of crop optimal water requirement (100% = full ETc)"
              />

              <ParamSlider
                label="Irrigation Frequency"
                value={inputs.frequencyDays}
                min={1}
                max={14}
                step={1}
                unit=" days"
                onChange={(v) => setInputs((p) => ({ ...p, frequencyDays: v }))}
                note="Days between irrigation events"
              />
            </View>

            <View className="mt-4">
              <PrimaryButton title="Run Simulation" onPress={run} />
            </View>
          </>
        ) : (
          result && (
            <>
              {/* Score */}
              <View className="mt-6 flex-row items-center justify-between rounded-[24px] bg-white p-5 shadow-sm">
                <View className="flex-1 pr-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#5D6F62]">
                    Simulation Score
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#174B32]">{result.recommendation}</Text>
                  <View className="mt-3">
                    <RiskBadge level={result.riskLevel} />
                  </View>
                </View>
                <ScoreRing score={result.score} />
              </View>

              {/* Chart */}
              <View className="mt-4 rounded-[24px] bg-white p-5 shadow-sm">
                <Text className="mb-4 text-[14px] font-bold text-[#174B32]">Results Overview</Text>
                <SimpleBarChart data={result.chartData} />
              </View>

              {/* Metrics */}
              <View className="mt-4 rounded-[24px] bg-white p-5 shadow-sm">
                <Text className="mb-4 text-[14px] font-bold text-[#174B32]">Detailed Metrics</Text>
                {Object.entries(result.metrics).map(([k, v]) => (
                  <MetricRow key={k} label={k} value={String(v)} />
                ))}
              </View>

              {/* Insights */}
              <View className="mt-4">
                <InsightCard insights={result.insights} />
              </View>

              <View className="mt-4 gap-3">
                <PrimaryButton title="Try Different Parameters" onPress={reset} />
              </View>
            </>
          )
        )}
      </View>
    </ScrollView>
  );
}
