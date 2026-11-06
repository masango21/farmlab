import { AppHeader, LessonCard, PrimaryButton, ScreenContainer, SectionHeader } from '../../components/designSystem';
import { learningModules } from '../../data/farmData';

export default function LearnScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Agricultural knowledge" subtitle="Learn" />

      <SectionHeader title="Current modules" subtitle="Learning path" action={<PrimaryButton title="Continue" compact onPress={() => undefined} />} />

      <LessonCard title={learningModules[0]?.title ?? 'Soil health basics'} duration={learningModules[0]?.duration ?? '18 min'} progress={learningModules[0]?.progress ?? 72} tag="Foundation" />
      <LessonCard title={learningModules[1]?.title ?? 'Irrigation planning'} duration={learningModules[1]?.duration ?? '22 min'} progress={learningModules[1]?.progress ?? 46} tag="Management" />
      <LessonCard title={learningModules[2]?.title ?? 'Crop nutrition cycle'} duration={learningModules[2]?.duration ?? '30 min'} progress={learningModules[2]?.progress ?? 58} tag="Field science" />

      <SectionHeader title="Recommended next" subtitle="Short courses" />
      {learningModules.slice(0, 3).map((module) => (
        <LessonCard key={module.title} title={module.title} duration={module.duration} progress={module.progress} tag={module.duration.includes('min') ? 'Quick lesson' : 'Course'} />
      ))}
    </ScreenContainer>
  );
}
