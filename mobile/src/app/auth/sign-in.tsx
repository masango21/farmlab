import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { farmApi, saveAuthToken } from '../../lib/farmApi';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing details', 'Please enter your email address and password.');
      return;
    }

    setLoading(true);
    const response = await farmApi.login({ email, password });
    setLoading(false);

    if (!response.token) {
      Alert.alert('Unable to sign in', response.message || 'Please check your credentials and try again.');
      return;
    }

    await saveAuthToken(response.token);
    router.replace('/(tabs)');
  };

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Email required', 'Enter your email address first.');
      return;
    }

    setLoading(true);
    const response = await farmApi.resendVerification({ email });
    setLoading(false);
    Alert.alert('Verification email', response.message || 'Unable to resend the verification email.');
  };

  return (
    <ScrollView className="flex-1 bg-[#F7F9F5]">
      <View className="px-5 pb-16 pt-14">
        <Text className="text-[32px] font-bold text-[#174B32]">Welcome back</Text>
        <Text className="mt-2 text-[15px] text-[#536861]">Sign in to continue with your farm and learning dashboard.</Text>

        <View className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
          <Text className="text-[18px] font-bold text-[#174B32]">Sign in</Text>

          <Text className="mt-6 text-[13px] font-semibold uppercase tracking-[1.2px] text-[#536861]">Email address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="mt-2 rounded-2xl border border-[#D3E1D7] bg-[#F9FBF9] px-4 py-3 text-[15px] text-[#174B32]"
          />

          <Text className="mt-5 text-[13px] font-semibold uppercase tracking-[1.2px] text-[#536861]">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            className="mt-2 rounded-2xl border border-[#D3E1D7] bg-[#F9FBF9] px-4 py-3 text-[15px] text-[#174B32]"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="mt-6 rounded-full bg-[#236B45] px-5 py-3.5"
          >
            <Text className="text-center text-[15px] font-bold text-white">{loading ? 'Signing in...' : 'Sign in'}</Text>
          </Pressable>

          <Link href="/auth/forgot-password" asChild>
            <Pressable className="mt-4 self-center">
              <Text className="text-[14px] font-semibold text-[#236B45]">Forgot your password?</Text>
            </Pressable>
          </Link>
          <Pressable onPress={handleResendVerification} disabled={loading} className="mt-4 self-center">
            <Text className="text-[14px] font-semibold text-[#236B45]">Resend verification email</Text>
          </Pressable>
        </View>

        <View className="mt-8 rounded-[26px] bg-[#E8F4E9] p-5">
          <Text className="text-[15px] text-[#174B32]">New to Digital Farm Lab?</Text>
          <Link href="/auth/register" asChild>
            <Pressable className="mt-3 rounded-full border border-[#236B45] bg-white px-5 py-3">
              <Text className="text-center text-[14px] font-bold text-[#174B32]">Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
