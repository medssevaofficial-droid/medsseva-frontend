import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="availability" options={{ title: 'Availability' }} />
      <Stack.Screen name="my-branch" options={{ title: 'My Branch' }} />
      <Stack.Screen name="ratings" options={{ title: 'Ratings' }} />
      <Stack.Screen name="legal" options={{ title: 'Legal' }} />
    </Stack>
  );
}