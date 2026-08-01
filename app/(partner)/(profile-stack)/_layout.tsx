import { Stack, useRouter, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../src/theme/theme';

export default function ProfileStackLayout() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const onBack = () => {
      router.replace('/(partner)/profile');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

const backButton = () => (
    <TouchableOpacity
      onPress={() => router.replace('/(partner)/profile')}
      style={{ marginLeft: 4 }}
    >
      <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );

  const commonOptions = {
    headerLeft: backButton,
    headerBackVisible: false,
  };

  return (
    <Stack>
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
     <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="availability" options={{ headerShown: false }} />
     <Stack.Screen name="my-branch" options={{ headerShown: false }} />
      <Stack.Screen name="ratings" options={{ headerShown: false }} />
      <Stack.Screen name="legal" options={{ headerShown: false }} />
    </Stack>
  );
}