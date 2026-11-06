import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { farmApi } from '../../lib/farmApi';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Missing token', 'The reset token is missing or invalid.');
      return;
    }

    if (!password) {
      Alert.alert('Password required', 'Please enter a new password.');
      return;
    }

    setLoading(true);
    const response = await farmApi.resetPassword({ token, password });
    setLoading(false);

    Alert.alert('Password updated', response.message || 'Your password has been reset successfully.');
  };

  return (
    <ScrollView className="flex-1 bg-[#F7F9F5]">
      <View className="px-5 pb-16 pt-14">
        <Text className="text-[32px] font-bold text-[#174B32]">Set new password</Text>
        <Text className="mt-2 text-[15px] text-[#536861]">Choose a strong password for your Digital Farm Lab account.</Text>

        <View className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
          <Text className="text-[13px] font-semibold uppercase tracking-[1.2px] text-[#536861]">New password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            className="mt-2 rounded-2xl border border-[#D3E1D7] bg-[#F9FBF9] px-4 py-3 text-[15px] text-[#174B32]"
          />

          <Pressable onPress={handleSubmit} disabled={loading} className="mt-6 rounded-full bg-[#236B45] px-5 py-3.5">
            <Text className="text-center text-[15px] font-bold text-white">{loading ? 'Updating...' : 'Update password'}</Text>
          </Pressable>
        </View>

        <View className="mt-8 items-center">
          <Link href="/auth/sign-in" asChild>
            <Pressable>
              <Text className="text-[14px] font-bold text-[#236B45]">Back to sign in</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
