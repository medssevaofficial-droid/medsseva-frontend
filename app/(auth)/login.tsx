import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, TYPOGRAPHY, SHADOWS } from '../../src/theme/theme';
import { InputBox } from '../../src/components/InputBox';
import { loginStart, loginSuccess } from '../../src/store/slices/authSlice';
import { apiService } from '../../src/services/api';

const loginSchema = yup.object().shape({
  mobile: yup.string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  




  const { control: rawControl, handleSubmit } = useForm({

    resolver: yupResolver(loginSchema),
defaultValues: {
      mobile: '',
      password: '',
    },
  });

  const control = rawControl as any;

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const response = await apiService.login({
        mobile: data.mobile,
        password: data.password
      });

      const userObj = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        mobile: response.user.mobile,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userObj));
      await AsyncStorage.setItem('token', response.token);

    const fullUserObj = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        mobile: response.user.mobile,
        role: response.user.role,
        partner: response.user.partner,
      };

      await AsyncStorage.setItem('user', JSON.stringify(fullUserObj));
      await AsyncStorage.setItem('token', response.token);
      dispatch(loginSuccess(fullUserObj));

      if (response.user.role === 'PATHOLOGY_PARTNER') {
        router.replace('/(partner)/home');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to login. Please try again.';
      Alert.alert("Login Failed", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Top Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity 
            style={styles.backBtnWrapper} 
           onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/account-type')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Header Branding Container */}
        <View style={styles.headerBlock}>
          <Text style={styles.heroTitle}>Welcome Back</Text>
          <Text style={styles.heroSubtitle}>Please enter details or select faster login below.</Text>
        </View>

        {/* Frosted Premium Credentials Card Form */}
        <View style={styles.authCard}>
          <InputBox
            control={control}
            name="mobile"
            label="Registered Mobile"
            placeholder="Enter 10 digit number"
            icon="phone-outline"
            keyboardType="numeric"
            maxLength={10}
          />

          <View style={{ marginTop: 16 }}>
            <InputBox
              control={control}
              name="password"
              label="Secret Password"
              placeholder="Enter your password"
              icon="lock-outline"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.forgotBtn}
            onPress={() => router.push('/(auth)/forgot-password')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotBtnText}>Forgot Security Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitBtn, isLoading && styles.btnDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Sign In Securely</Text>
                <MaterialCommunityIcons name="shield-check" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Visual Divider Section */}
          <View style={styles.dividerStack}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerCapsule}>
              <Text style={styles.dividerCapsuleText}>OR QUICK AUTH</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Premium Quick Alternate Providers */}
          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={[styles.actionChipBtn, styles.otpChipBtn]}
              onPress={() => router.push('/(auth)/otp')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="message-lock-outline" size={20} color="#0891B2" />
              <Text style={styles.otpChipBtnText}>Login with OTP</Text>
            </TouchableOpacity>

    
          </View>
        </View>

        {/* Footer Register Callouts */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Need a MedsSeva healthcare profile? </Text>
         <TouchableOpacity onPress={() => router.push('/(auth)/account-type')}>
            <Text style={styles.footerActionText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

   
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  glowSphereLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(13, 148, 136, 0.07)',
    zIndex: -1,
  },
  glowSphereRight: {
    position: 'absolute',
    top: 200,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    zIndex: -1,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
  },
  backBtnWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.soft,
    elevation: 2,
  },

  headerBlock: {
    marginBottom: 32,
    paddingLeft: 4,
  },
  heroTitle: {
    ...TYPOGRAPHY.h1,
    color: '#0F172A',
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: '#64748B',
    lineHeight: 22,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.soft,
    elevation: 3,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 14,
    marginBottom: 28,
  },
  forgotBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    ...SHADOWS.glow,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dividerStack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1.2,
    backgroundColor: '#E2E8F0',
  },
  dividerCapsule: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  dividerCapsuleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  buttonGrid: {
    width: '100%',
  },
  actionChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  otpChipBtn: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  otpChipBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0369A1',
    marginLeft: 10,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },

});
