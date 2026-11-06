import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { farmApi } from '../../lib/farmApi';

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [status, setStatus] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('A valid verification token is required.');
        return;
      }

      const response = await farmApi.verifyEmail({ token });
      setStatus(response.message || 'Verification completed.');
      if (response.message?.toLowerCase().includes('success')) {
        Alert.alert('Email verified', response.message);
      }
    };

    verify();
  }, [token]);

  return (
    <ScrollView className="flex-1 bg-[#F7F9F5]">
      <View className="px-5 pb-16 pt-14">
        <Text className="text-[32px] font-bold text-[#174B32]">Verify email</Text>
        <View className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
          <Text className="text-[15px] text-[#536861]">{status}</Text>

          <Link href="/auth/sign-in" asChild>
            <Pressable className="mt-6 rounded-full bg-[#236B45] px-5 py-3.5">
              <Text className="text-center text-[15px] font-bold text-white">Continue to sign in</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
