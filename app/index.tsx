import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../src/theme/theme';
import { loginSuccess } from '../src/store/slices/authSlice';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

      if (userStr && token) {
          const user = JSON.parse(userStr);
          dispatch(loginSuccess(user));
          
          setTimeout(() => {
            if (user.role === 'PATHOLOGY_PARTNER') {
              router.replace('/(partner)/home');
            } else {
              router.replace('/(tabs)');
            }
          }, 1500);
        } else {
          // No session, redirect to onboarding
          setTimeout(() => {
            router.replace('/onboarding');
          }, 2000);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setTimeout(() => {
          router.replace('/onboarding');
        }, 2000);
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#006D6F', // Solid Brand Color
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
  },
});
