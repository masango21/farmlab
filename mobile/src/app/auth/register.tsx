import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { farmApi } from '../../lib/farmApi';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'LEARNER' | 'TRAINER'>('LEARNER');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Missing details', 'Please complete all fields before creating your account.');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Terms required', 'You must accept the terms and conditions before continuing.');
      return;
    }

    setLoading(true);
    const response = await farmApi.register({
      firstName,
      lastName,
      email,
      password,
      role,
      acceptTerms,
    });
    setLoading(false);

    if (!response.user) {
      Alert.alert('Could not create account', response.message || 'Please try again.');
      return;
    }

    Alert.alert('Account created', response.message || 'Your account has been created.');
    router.replace('/auth/sign-in');
  };

  return (
    <ScrollView className="flex-1 bg-[#F7F9F5]">
      <View className="px-5 pb-16 pt-14">
        <Text className="text-[32px] font-bold text-[#174B32]">Create account</Text>
        <Text className="mt-2 text-[15px] text-[#536861]">Set up your Digital Farm Lab profile and start learning.</Text>

        <View className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-[13px] font-semibold uppercase tracking-[1.2px] text-[#536861]">First name</Text>
              <TextInput value={firstName} onChangeText={setFirstName} className="mt-2 rounded-2xl border border-[#D3E1D7] bg-[#F9FBF9] px-4 py-3 text-[15px] text-[#174B32]" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-semibold uppercase tracking-[1.2px] text-[#536861]">Last name</Text>
              <TextInput value={lastName} onChangeText={setLastName} className="mt-2 rounded-2xl border border-[#D3E1D7] bg-[#F9FBF9] px-4 py-3 text-[15px] text-[#174B32]" />
            </View>
          </View>

          <Text className="mt-5 text-[13px] font-semibold uppercase tracking-[1.2px] text-[#536861]">Email address</Text>
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
            placeholder="At least 8 characters"
            secureTextEntry
            className="mt-2 rounded-2xl border border-[#D3E1D7] bg-[#F9FBF9] px-4 py-3 text-[15px] text-[#174B32]"
          />

          <Text className="mt-5 text-[13px] font-semibold uppercase tracking-[1.2px] text-[#536861]">Account type</Text>
          <View className="mt-2 flex-row gap-3">
            {(['LEARNER', 'TRAINER'] as const).map((option) => (
              <Pressable
                key={option}
                onPress={() => setRole(option)}
                className={`flex-1 rounded-2xl border px-4 py-3 ${role === option ? 'border-[#236B45] bg-[#E8F4E9]' : 'border-[#D3E1D7] bg-[#F9FBF9]'}`}
              >
                <Text className={`text-center text-[14px] font-semibold ${role === option ? 'text-[#174B32]' : 'text-[#536861]'}`}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setAcceptTerms((value) => !value)}
            className="mt-5 flex-row items-center"
          >
            <View className={`mr-3 h-5 w-5 items-center justify-center rounded-md border ${acceptTerms ? 'border-[#236B45] bg-[#236B45]' : 'border-[#D3E1D7] bg-transparent'}`}>
              {acceptTerms && <Text className="text-[12px] font-bold text-white">✓</Text>}
            </View>
            <Text className="flex-1 text-[14px] text-[#536861]">I agree to the terms and conditions.</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="mt-6 rounded-full bg-[#236B45] px-5 py-3.5"
          >
            <Text className="text-center text-[15px] font-bold text-white">{loading ? 'Creating account...' : 'Create account'}</Text>
          </Pressable>
        </View>

        <View className="mt-6 items-center">
          <Text className="text-[14px] text-[#536861]">Already have an account?</Text>
          <Link href="/auth/sign-in" asChild>
            <Pressable className="mt-2">
              <Text className="text-[14px] font-bold text-[#236B45]">Sign in here</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
