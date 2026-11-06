import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { farmApi } from '../../lib/farmApi';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Email required', 'Enter the email associated with your account.');
      return;
    }

    setLoading(true);
    const response = await farmApi.forgotPassword({ email });
    setLoading(false);

    Alert.alert('Password reset', response.message || 'Check your inbox for reset instructions.');
  };

  return (
    <ScrollView className="flex-1 bg-[#F7F9F5]">
      <View className="px-5 pb-16 pt-14">
        <Text className="text-[32px] font-bold text-[#174B32]">Reset password</Text>
        <Text className="mt-2 text-[15px] text-[#536861]">We will send a reset link to your email address.</Text>

        <View className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
          <Text className="text-[13px] font-semibold uppercase tracking-[1.2px] text-[#536861]">Email address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="mt-2 rounded-2xl border border-[#D3E1D7] bg-[#F9FBF9] px-4 py-3 text-[15px] text-[#174B32]"
          />

          <Pressable onPress={handleSubmit} disabled={loading} className="mt-6 rounded-full bg-[#236B45] px-5 py-3.5">
            <Text className="text-center text-[15px] font-bold text-white">{loading ? 'Sending...' : 'Send reset link'}</Text>
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
