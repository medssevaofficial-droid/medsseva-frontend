import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="family" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="info" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
