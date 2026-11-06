import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

// ─── Colour Tokens ─────────────────────────────────────────────────────────────
export const colors = {
  primary: '#236B45',
  darkGreen: '#174B32',
  lightGreen: '#E8F4E9',
  background: '#F7F9F5',
  white: '#FFFFFF',
  earthBrown: '#98734B',
  accent: '#E8B94F',
  muted: '#607164',
  softText: '#5D6F62',
  border: '#DCE8DF',
  error: '#E8503A',
  info: '#2B7FDE',
  warning: '#E8B94F',
};

// ─── Layout Containers ─────────────────────────────────────────────────────────
export function ScreenContainer({
  children,
  extraPadding = 0,
}: {
  children: ReactNode;
  extraPadding?: number;
}) {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F9F5]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 + extraPadding }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── App Header ────────────────────────────────────────────────────────────────
export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View className="mb-6 flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        {subtitle ? (
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#5D6F62]">{subtitle}</Text>
        ) : null}
        <Text className="mt-1 text-[28px] font-bold leading-[34px] text-[#174B32]">{title}</Text>
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
    </View>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View className="mb-4 mt-6 flex-row items-end justify-between">
      <View className="flex-1 pr-2">
        {subtitle ? (
          <Text className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#5D6F62]">{subtitle}</Text>
        ) : null}
        <Text className="mt-1 text-[22px] font-bold leading-[28px] text-[#174B32]">{title}</Text>
      </View>
      {action ? <View className="ml-3">{action}</View> : null}
    </View>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  trend,
  accent,
}: {
  label: string;
  value: string;
  trend: string;
  accent?: string;
}) {
  return (
    <View className="mb-3 w-[48%] rounded-[24px] border border-[#E5EEE8] bg-white p-4 shadow-sm">
      <Text className="text-[12px] font-medium text-[#5D6F62]">{label}</Text>
      <Text className="mt-2 text-[24px] font-bold text-[#174B32]">{value}</Text>
      <Text className="mt-2 text-[11px] font-semibold" style={{ color: accent ?? '#236B45' }}>
        {trend}
      </Text>
    </View>
  );
}

// ─── Buttons ───────────────────────────────────────────────────────────────────
export function PrimaryButton({
  title,
  onPress,
  compact = false,
  disabled = false,
}: {
  title: string;
  onPress?: () => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={compact ? 'rounded-full bg-[#236B45] px-4 py-3' : 'rounded-full bg-[#236B45] px-5 py-3.5'}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Text className="text-center text-[14px] font-semibold text-white">{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  compact = false,
}: {
  title: string;
  onPress?: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={
        compact
          ? 'rounded-full border border-[#CFE0D5] bg-white px-4 py-3'
          : 'rounded-full border border-[#CFE0D5] bg-white px-5 py-3.5'
      }
    >
      <Text className="text-center text-[14px] font-semibold text-[#174B32]">{title}</Text>
    </Pressable>
  );
}

export function AccentButton({
  title,
  onPress,
  compact = false,
}: {
  title: string;
  onPress?: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={compact ? 'rounded-full bg-[#E8B94F] px-4 py-3' : 'rounded-full bg-[#E8B94F] px-5 py-3.5'}
    >
      <Text className="text-center text-[14px] font-semibold text-[#174B32]">{title}</Text>
    </Pressable>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#EEF4F0] py-3">
      <Text className="text-[13px] text-[#5D6F62]">{label}</Text>
      <Text className="text-[13px] font-semibold text-[#174B32]">{value}</Text>
    </View>
  );
}

// ─── Tab Chip ──────────────────────────────────────────────────────────────────
export function TabChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 rounded-full px-4 py-2 ${active ? 'bg-[#236B45]' : 'border border-[#CFE0D5] bg-white'}`}
    >
      <Text className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-[#174B32]'}`}>{label}</Text>
    </Pressable>
  );
}

// ─── Crop Card ─────────────────────────────────────────────────────────────────
export function CropCard({
  crop,
  onPress,
}: {
  crop: {
    slug: string;
    name: string;
    category: string;
    image: string;
    estimatedDuration: string;
    scientificName: string;
    waterRequirements: string;
  };
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="mb-3 overflow-hidden rounded-[24px] border border-[#E6EEE8] bg-white">
      <View className="h-28 w-full overflow-hidden bg-[#DDEEDF]">
        <View className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-2 py-1">
          <Text className="text-[10px] font-semibold uppercase tracking-[1.2px] text-[#174B32]">{crop.category}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between p-3">
        <View className="flex-1 pr-3">
          <Text className="text-[16px] font-bold text-[#174B32]">{crop.name}</Text>
          <Text className="mt-1 text-[12px] italic text-[#607164]">{crop.scientificName}</Text>
          <Text className="mt-2 text-[11px] font-semibold text-[#236B45]">{crop.estimatedDuration}</Text>
        </View>
        <View className="rounded-full bg-[#E8F4E9] px-2 py-1.5">
          <Text className="text-[10px] font-semibold uppercase tracking-[1.1px] text-[#236B45]">View</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Farm Card ─────────────────────────────────────────────────────────────────
export function FarmCard({
  title,
  subtitle,
  actionLabel,
  icon,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <View className="rounded-[24px] bg-white p-4 shadow-sm">
      {icon ? <View className="mb-3">{icon}</View> : null}
      <Text className="text-[16px] font-bold text-[#174B32]">{title}</Text>
      <Text className="mt-2 text-[13px] text-[#5D6F62]">{subtitle}</Text>
      {actionLabel ? (
        <Text className="mt-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#236B45]">{actionLabel}</Text>
      ) : null}
    </View>
  );
}

// ─── Simulation Card ───────────────────────────────────────────────────────────
export function SimulationCard({
  title,
  subtitle,
  duration,
  difficulty,
  onPress,
  icon,
  color = '#E8F4E9',
}: {
  title: string;
  subtitle: string;
  duration: string;
  difficulty: string;
  image?: string;
  onPress?: () => void;
  icon?: ReactNode;
  color?: string;
}) {
  const difficultyColor =
    difficulty === 'Beginner' ? '#236B45' : difficulty === 'Intermediate' ? '#E8B94F' : '#E8503A';

  return (
    <Pressable onPress={onPress} className="mb-4 overflow-hidden rounded-[26px] border border-[#E7EFE9] bg-white">
      <View className="h-20 w-full items-center justify-center" style={{ backgroundColor: color }}>
        {icon}
      </View>
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 pr-2 text-[18px] font-bold text-[#174B32]">{title}</Text>
          <View className="rounded-full px-2 py-1" style={{ backgroundColor: difficultyColor + '22' }}>
            <Text className="text-[10px] font-bold" style={{ color: difficultyColor }}>
              {difficulty}
            </Text>
          </View>
        </View>
        <Text className="mt-2 text-[13px] text-[#5D6F62]">{subtitle}</Text>
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.3px] text-[#236B45]">{duration}</Text>
          <View className="rounded-full bg-[#E8F4E9] px-3 py-2">
            <Text className="text-[12px] font-semibold text-[#236B45]">Start →</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Lesson Card ───────────────────────────────────────────────────────────────
export function LessonCard({
  title,
  duration,
  progress,
  tag,
}: {
  title: string;
  duration: string;
  progress: number;
  tag: string;
}) {
  return (
    <View className="mb-3 rounded-[24px] bg-white p-4 shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[14px] font-semibold uppercase tracking-[1.3px] text-[#236B45]">{tag}</Text>
        <Text className="text-[12px] text-[#5D6F62]">{duration}</Text>
      </View>
      <Text className="text-[16px] font-bold text-[#174B32]">{title}</Text>
      <View className="mt-3 h-2 rounded-full bg-[#E6EFE9]">
        <View className="h-2 rounded-full bg-[#236B45]" style={{ width: `${progress}%` }} />
      </View>
      <Text className="mt-2 text-[12px] font-medium text-[#5D6F62]">{progress}% complete</Text>
    </View>
  );
}

// ─── Progress Card ─────────────────────────────────────────────────────────────
export function ProgressCard({
  title,
  detail,
  status,
}: {
  title: string;
  detail: string;
  status: string;
}) {
  const statusColor =
    status === 'Healthy' || status === 'Strong' || status === 'On track' || status === 'Ready'
      ? '#236B45'
      : status === 'Action needed' || status === 'Monitor'
        ? '#E8B94F'
        : '#5D6F62';

  return (
    <View className="mb-3 rounded-[20px] bg-white p-4 shadow-sm">
      <Text className="text-[15px] font-bold text-[#174B32]">{title}</Text>
      <Text className="mt-2 text-[13px] text-[#5D6F62]">{detail}</Text>
      <View className="mt-3 self-start rounded-full px-3 py-1" style={{ backgroundColor: statusColor + '18' }}>
        <Text className="text-[11px] font-semibold uppercase tracking-[1.6px]" style={{ color: statusColor }}>
          {status}
        </Text>
      </View>
    </View>
  );
}

// ─── Sensor Card ───────────────────────────────────────────────────────────────
export function SensorCard({
  label,
  value,
  unit,
  status,
  icon,
}: {
  label: string;
  value: number | string;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  icon?: ReactNode;
}) {
  const statusColor =
    status === 'optimal' ? '#236B45' : status === 'warning' ? '#E8B94F' : '#E8503A';
  const statusBg =
    status === 'optimal' ? '#E8F4E9' : status === 'warning' ? '#FDF6E3' : '#FEF0EE';

  return (
    <View className="mb-3 w-[48%] rounded-[22px] border border-[#E5EEE8] bg-white p-3 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        {icon}
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: statusBg }}>
          <Text className="text-[9px] font-bold uppercase tracking-[1px]" style={{ color: statusColor }}>
            {status}
          </Text>
        </View>
      </View>
      <Text className="text-[22px] font-bold text-[#174B32]">
        {value}
        <Text className="text-[13px] font-normal text-[#5D6F62]"> {unit}</Text>
      </Text>
      <Text className="mt-1 text-[11px] text-[#5D6F62]">{label}</Text>
    </View>
  );
}

// ─── Achievement Badge ─────────────────────────────────────────────────────────
export function BadgeCard({
  title,
  description,
  unlocked,
  icon,
}: {
  title: string;
  description: string;
  unlocked: boolean;
  icon?: ReactNode;
}) {
  return (
    <View
      className="mb-3 flex-row items-center rounded-[22px] p-4"
      style={{ backgroundColor: unlocked ? '#E8F4E9' : '#F3F5F3', opacity: unlocked ? 1 : 0.6 }}
    >
      <View
        className="mr-4 h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: unlocked ? '#236B45' : '#B4C4BA' }}
      >
        {icon ?? <Text className="text-[20px]">{unlocked ? '🏆' : '🔒'}</Text>}
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-bold text-[#174B32]">{title}</Text>
        <Text className="mt-1 text-[12px] text-[#5D6F62]">{description}</Text>
      </View>
    </View>
  );
}

// ─── Risk Badge ────────────────────────────────────────────────────────────────
export function RiskBadge({ level }: { level: string }) {
  const color =
    level === 'Low'
      ? '#236B45'
      : level === 'Moderate'
        ? '#E8B94F'
        : level === 'High'
          ? '#E8503A'
          : '#8B1A0F';
  const bg = color + '20';

  return (
    <View className="self-start rounded-full px-3 py-1" style={{ backgroundColor: bg }}>
      <Text className="text-[11px] font-bold uppercase tracking-[1.4px]" style={{ color }}>
        {level} risk
      </Text>
    </View>
  );
}

// ─── Metric Row ────────────────────────────────────────────────────────────────
export function MetricRow({ label, value, bar, barColor }: {
  label: string;
  value: string;
  bar?: number;
  barColor?: string;
}) {
  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[13px] text-[#5D6F62]">{label}</Text>
        <Text className="text-[13px] font-semibold text-[#174B32]">{value}</Text>
      </View>
      {bar !== undefined && (
        <View className="h-2 rounded-full bg-[#E6EFE9]">
          <View
            className="h-2 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, bar))}%`, backgroundColor: barColor ?? '#236B45' }}
          />
        </View>
      )}
    </View>
  );
}

// ─── Parameter Slider ──────────────────────────────────────────────────────────
// Since react-native-reanimated Slider needs a separate library,
// we implement a custom touch-based slider.
import { GestureResponderEvent, LayoutChangeEvent, useCallback, useRef, useState } from 'react';

export function ParamSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  color = '#236B45',
  note,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  color?: string;
  note?: string;
}) {
  const trackWidth = useRef(0);
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  }, []);

  const updateValue = useCallback(
    (e: GestureResponderEvent) => {
      if (!trackWidth.current) return;
      const rawPct = e.nativeEvent.locationX / trackWidth.current;
      const clamped = Math.max(0, Math.min(1, rawPct));
      const raw = clamped * (max - min) + min;
      const stepped = Math.round(raw / step) * step;
      onChange(Math.max(min, Math.min(max, stepped)));
    },
    [max, min, onChange, step],
  );

  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-[#174B32]">{label}</Text>
        <Text className="text-[14px] font-bold" style={{ color }}>
          {value}
          {unit}
        </Text>
      </View>
      <View
        className="h-6 justify-center"
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={updateValue}
        onResponderMove={updateValue}
      >
        <View className="h-2 rounded-full" style={{ backgroundColor: '#E6EFE9' }}>
          <View className="h-2 rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
        </View>
        <View
          className="absolute h-5 w-5 rounded-full border-2 border-white shadow-sm"
          style={{
            backgroundColor: color,
            left: `${pct * 100}%`,
            marginLeft: -10,
            top: 2,
          }}
        />
      </View>
      <View className="mt-1 flex-row justify-between">
        <Text className="text-[10px] text-[#9BA8A0]">
          {min}
          {unit}
        </Text>
        <Text className="text-[10px] text-[#9BA8A0]">
          {max}
          {unit}
        </Text>
      </View>
      {note ? <Text className="mt-1 text-[11px] text-[#607164]">{note}</Text> : null}
    </View>
  );
}

// ─── Option Picker ─────────────────────────────────────────────────────────────
export function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
  labels,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Record<T, string>;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-[13px] font-semibold text-[#174B32]">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          {options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              className="mr-2 rounded-full px-4 py-2"
              style={{ backgroundColor: value === opt ? '#236B45' : '#F0F4F1' }}
            >
              <Text
                className="text-[12px] font-semibold"
                style={{ color: value === opt ? '#fff' : '#174B32' }}
              >
                {labels ? labels[opt] : opt}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Score Ring ─────────────────────────────────────────────────────────────────
export function ScoreRing({
  score,
  size = 90,
  label = 'Score',
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color = score >= 75 ? '#236B45' : score >= 50 ? '#E8B94F' : '#E8503A';

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6EFE9" strokeWidth={6} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2},${size / 2}`}
        />
        <SvgText
          x={size / 2}
          y={size / 2 + 2}
          textAnchor="middle"
          fill={color}
          fontSize="18"
          fontWeight="bold"
        >
          {score}
        </SvgText>
      </Svg>
      <Text className="mt-1 text-[11px] font-medium text-[#5D6F62]">{label}</Text>
    </View>
  );
}

// ─── Insight Card ───────────────────────────────────────────────────────────────
export function InsightCard({
  insights,
}: {
  insights: string[];
}) {
  return (
    <View className="rounded-[22px] bg-[#E8F4E9] p-4">
      <Text className="mb-3 text-[11px] font-semibold uppercase tracking-[1.8px] text-[#236B45]">Key Insights</Text>
      {insights.map((insight, i) => (
        <View key={i} className="mb-2 flex-row items-start">
          <View className="mr-3 mt-1.5 h-2 w-2 rounded-full bg-[#236B45]" />
          <Text className="flex-1 text-[13px] text-[#2D4D38]">{insight}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Loading / Empty / Error States ───────────────────────────────────────────
export function LoadingState({ message = 'Loading farm data...' }: { message?: string }) {
  return (
    <View className="rounded-[24px] bg-[#E8F4E9] p-4">
      <Text className="text-[14px] font-medium text-[#174B32]">{message}</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View className="rounded-[24px] border border-dashed border-[#C4D8C9] bg-[#F8FBF8] p-5">
      <Text className="text-[16px] font-bold text-[#174B32]">{title}</Text>
      <Text className="mt-2 text-[13px] text-[#5D6F62]">{message}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View className="rounded-[24px] border border-[#F3D7D7] bg-[#FFF6F4] p-4">
      <Text className="text-[14px] font-semibold text-[#9B3A2E]">{message}</Text>
    </View>
  );
}

// ─── Farm Zone Tile ────────────────────────────────────────────────────────────
export function FarmZoneTile({
  title,
  subtitle,
  status,
  onPress,
  icon,
  color = '#E8F4E9',
}: {
  title: string;
  subtitle: string;
  status: string;
  onPress?: () => void;
  icon?: ReactNode;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} className="mb-3 overflow-hidden rounded-[22px] bg-white shadow-sm">
      <View className="h-14 items-center justify-center" style={{ backgroundColor: color }}>
        {icon}
      </View>
      <View className="p-3">
        <Text className="text-[14px] font-bold text-[#174B32]">{title}</Text>
        <Text className="mt-0.5 text-[12px] text-[#5D6F62]">{subtitle}</Text>
        <View className="mt-2 self-start rounded-full bg-[#E8F4E9] px-2 py-0.5">
          <Text className="text-[10px] font-semibold text-[#236B45]">{status}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Metric Grid ───────────────────────────────────────────────────────────────
export function MetricsGrid({ items }: { items: { label: string; value: string; bar?: number }[] }) {
  return (
    <View className="rounded-[22px] bg-white p-4 shadow-sm">
      {items.map((item) => (
        <MetricRow key={item.label} label={item.label} value={item.value} bar={item.bar} />
      ))}
    </View>
  );
}
