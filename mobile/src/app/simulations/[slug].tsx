import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

// Router screen: /simulations/[slug] → delegates to the correct simulation
// Each simulation is in its own file for clarity and maintainability.
// This file just redirects based on slug.
export { default } from './irrigation';

// NOTE: Expo Router does NOT support dynamic re-export from [slug].tsx directly.
// Each simulation has its own route file: /simulations/irrigation.tsx etc.
// The [slug].tsx is kept as a fallback for backward compatibility.
export const unstable_settings = {
  initialRouteName: 'irrigation',
};
