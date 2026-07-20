/*eslint-disabled*/
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SHADOWS } from '../../src/theme/theme';
import { InputBox } from '../../src/components/InputBox';
import { loginSuccess } from '../../src/store/slices/authSlice';
import { apiService } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const registerSchema = yup.object().shape({
  name: yup.string().required('Full name is required').min(3, 'Name is too short'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  mobile: yup.string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
  // Password required only for standard signup; OTP-verified users skip it
  password: yup.string().when('$isFromOtp', {
    is: true,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
  }),
});

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

// Capture incoming params from OTP/WhatsApp flow securely
  const prefilledMobile = (params?.mobile as string) || '';
  const prefilledName = (params?.name as string) || '';
  const isFromOtp = params?.fromOtp === '1';

const { control: rawControl, handleSubmit, setValue } = useForm({
    resolver: yupResolver(registerSchema),
    context: { isFromOtp },
    defaultValues: {
      name: prefilledName,
      email: '',
      mobile: prefilledMobile,
      password: '',
    },
  });

  // InputBox is typed against a fixed field-values shape; the resolver's
  // context generic makes react-hook-form's inferred Control type stricter
  // than that shape expects. Widening here avoids a type clash with no
  // runtime effect — form behavior (validation, values) is unchanged.
  const control = rawControl as any;
  // Ensure reactive parameters trigger dynamic field pre-fills cleanly
  useEffect(() => {
    if (prefilledMobile) {
      setValue('mobile', prefilledMobile);
    }
    if (prefilledName) {
      setValue('name', prefilledName);
    }
  }, [prefilledMobile, prefilledName]);
 const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const response = await apiService.register({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        // OTP-verified users skip password entirely; standard signup still sends it
        ...(isFromOtp ? {} : { password: data.password }),
      });

      const userObj = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        mobile: response.user.mobile,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userObj));
      await AsyncStorage.setItem('token', response.token);

      dispatch(loginSuccess(userObj));
      
      router.replace('/(tabs)');
   } catch (error: any) {
      const errorMsg = error.response?.data?.error || '';
      const isMobileExists = errorMsg.includes('already registered');

      if (isMobileExists) {
        // Mobile already exists — auto login karo silently
        try {
          const loginResponse = await apiService.login({
            mobile: data.mobile,
            password: data.password,
          });

          const userObj = {
            id: loginResponse.user.id,
            name: loginResponse.user.name,
            email: loginResponse.user.email,
            mobile: loginResponse.user.mobile,
          };

          await AsyncStorage.setItem('user', JSON.stringify(userObj));
          await AsyncStorage.setItem('token', loginResponse.token);
          dispatch(loginSuccess(userObj));
          router.replace('/(tabs)');
        } catch (loginError: any) {
          Alert.alert('Account Exists', 'This mobile is already registered. Please login instead.', [
            { text: 'Go to Login', onPress: () => router.replace('/(auth)/login') },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }
      } else {
        Alert.alert('Registration Failed', errorMsg || 'Failed to register. Please try again.');
      }
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
        {/* Top Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backCircle} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color="#334155" />
          </TouchableOpacity>
          {prefilledMobile.length > 0 && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={14} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedBadgeText}>Number Verified</Text>
            </View>
          )}
        </View>

        {/* Header Text Info */}
        <View style={styles.introBlock}>
          <Text style={styles.mainTitle}>Create Account</Text>
          <Text style={styles.introSubtitle}>Complete your MedsSeva healthcare profile in 30 seconds.</Text>
        </View>

        {/* Premium Registration Card Wrapper */}
        <View style={styles.formCard}>
          <InputBox
            control={control}
            name="name"
            label="Your Full Name"
            placeholder="e.g. Amit Sharma"
            icon="account-circle-outline"
          />

          <View style={{ marginTop: 16 }}>
            <InputBox
              control={control}
              name="email"
              label="Primary Email Address"
              placeholder="example@email.com"
              icon="email-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={{ marginTop: 16 }}>
            {/* Mobile field is rendered with readOnly look if it came verified from OTP/WhatsApp */}
            <InputBox
              control={control}
              name="mobile"
              label="Mobile Contact"
              placeholder="Enter 10 digit number"
              icon="phone-check-outline"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

  {!isFromOtp && (
            <View style={{ marginTop: 16, marginBottom: 28 }}>
              <InputBox
                control={control}
                name="password"
                label="Create Account Password"
                placeholder="Choose at least 6 characters"
                icon="lock-open-outline"
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.registerBtn, isLoading && styles.btnDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.registerBtnText}>Confirm & Register</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Subtle Terms Note */}
        <Text style={styles.disclaimer}>
          By registering, you agree to MedsSeva Privacy Policies.
        </Text>

        {/* Sign In Alternate Route Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already verified member? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
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
  meshOverlayTop: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(13, 148, 136, 0.05)',
    zIndex: -1,
  },
  meshOverlayBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    zIndex: -1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backCircle: {
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedBadgeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  introBlock: {
    marginBottom: 32,
    paddingLeft: 4,
  },
  mainTitle: {
    ...TYPOGRAPHY.h1,
    color: '#0F172A',
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  introSubtitle: {
    ...TYPOGRAPHY.body,
    color: '#64748B',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.soft,
    elevation: 3,
  },
  registerBtn: {
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
  registerBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disclaimer: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
    lineHeight: 16,
    fontWeight: '500',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
