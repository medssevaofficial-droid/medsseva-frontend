import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform, StatusBar, TextInput,
} from 'react-native';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import { showError } from '../../src/store/toastStore';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginStart, loginSuccess } from '../../src/store/slices/authSlice';
import { apiService } from '../../src/services/api';

import { COLORS } from '../../src/theme/theme';
const PRIMARY = COLORS.primary;

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
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control: rawControl, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { mobile: '', password: '' },
  });
  const control = rawControl as any;

const onSubmit = async (data: any) => {
    setIsLoading(true);
    setServerError(null);
    dispatch(loginStart());
    try {
      const response = await apiService.login({ mobile: data.mobile, password: data.password });
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

      const { registerFcmToken } = await import('../../src/services/notificationService');
      registerFcmToken().catch(console.warn);

      if (response.user.role === 'PATHOLOGY_PARTNER') {
        router.replace('/(partner)/home');
      } else {
        router.replace('/(tabs)');
      }
 } catch (error: any) {
      console.error('Login Error:', error);
      const errData = error.response?.data;
      if (errData?.requiresEmailVerification) {
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email: errData.email },
        });
        return;
      }
   const errorMsg = errData?.error || 'Failed to login. Please try again.';
      setServerError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F0F3" />
      <ScreenWrapper
        backgroundColor="#E8F0F3"
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/account-type')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#334155" />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="account-outline" size={32} color={PRIMARY} />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Securely access your healthcare dashboard.</Text>

          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputWrap, errors.mobile && styles.inputWrapError]}>
                <MaterialCommunityIcons name="phone-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10 digit number"
                  placeholderTextColor="#94A3B8"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            )}
          />
          {errors.mobile && <Text style={styles.errorText}>{errors.mobile.message}</Text>}

          <Text style={styles.fieldLabel}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputWrap, errors.password && styles.inputWrapError]}>
                <MaterialCommunityIcons name="lock-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            )}
          />
       {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          {serverError && (
            <View style={styles.serverErrorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          )}

          <View style={styles.forgotRow}>
            <TouchableOpacity onPress={() => router.push('/(auth)/otp')}>
              <Text style={styles.otpLink}>Login with OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>

        
        </View>

       
      <Text style={[styles.copyright, { marginTop: 24 }]}>© {new Date().getFullYear()} MedsSeva Healthcare. All rights reserved.</Text>
   <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/legal/LegalWebView', params: { type: 'terms' } })}>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.footerSep}> · </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/legal/LegalWebView', params: { type: 'privacy' } })}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
 </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F0F3' },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#F0FDFA', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#CCFBF1', marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 28 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6, alignSelf: 'flex-start' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 14, height: 50, marginBottom: 16, width: '100%',
  },
  inputWrapError: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#0F172A' },
errorText: { fontSize: 12, color: '#EF4444', marginTop: -12, marginBottom: 10, alignSelf: 'flex-start' },
  serverErrorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#FECACA', width: '100%', marginBottom: 16,
  },
  serverErrorText: { fontSize: 13, color: '#EF4444', fontWeight: '600', flex: 1 },
  forgotRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', width: '100%', marginBottom: 24,
  },
  otpLink: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  forgotText: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  loginBtn: {
    backgroundColor: PRIMARY, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 20,
    elevation: 2,
  },
  btnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  registerRow: { flexDirection: 'row', marginBottom: 20 },
  registerText: { fontSize: 13, color: '#64748B' },
  registerLink: { fontSize: 13, fontWeight: '800', color: PRIMARY },
  secureLabel: { fontSize: 10, color: '#94A3B8', letterSpacing: 1.5 },
  brandName: { fontSize: 13, fontWeight: '800', color: PRIMARY, textAlign: 'center', letterSpacing: 3, marginTop: 28, marginBottom: 6 },
  copyright: { fontSize: 12, color: '#7A9AAA', textAlign: 'center', marginBottom: 8 },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerLink: { fontSize: 13, color: '#5A7080' },
  footerSep: { fontSize: 13, color: '#94A3B8', marginHorizontal: 4 },
});