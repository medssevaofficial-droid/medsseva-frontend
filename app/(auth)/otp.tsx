import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../src/theme/theme';
import { loginSuccess } from '../../src/store/slices/authSlice';
import { apiService } from '../../src/services/api';

const { width } = Dimensions.get('window');

export default function OTPScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleSendOtp = () => {
    if (mobileNumber.length !== 10) return;
    
    setIsSending(true);
    // Simulate OTP generation
    setTimeout(() => {
      setIsSending(false);
      setStep('otp');
    }, 1200);
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

const verifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) return;

    // Demo OTP — kept exactly as required
    if (otpValue !== '1234') {
      Alert.alert('Invalid OTP', 'Please enter the correct 4-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.checkMobile(mobileNumber);

      if (result.exists) {
        // Existing user: behaves exactly like a normal login, no extra details asked
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        await AsyncStorage.setItem('token', result.token);
        dispatch(loginSuccess(result.user));
        router.replace('/(tabs)');
      } else {
        // New user: go collect the minimum required profile details
        router.push({
          pathname: '/(auth)/register',
          params: { mobile: mobileNumber, fromOtp: '1' }
        });
      }
    } catch (error: any) {
      console.error('OTP verification / account check failed:', error);
      Alert.alert('Something went wrong', 'Unable to verify your account right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Navigation */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (step === 'otp') {
              setStep('mobile');
              setOtp(['', '', '', '']);
            } else {
              router.back();
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.cardWrapper}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons 
              name={step === 'mobile' ? "cellphone-text" : "shield-key-outline"} 
              size={36} 
              color={COLORS.primary} 
            />
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {step === 'mobile' ? "Login with OTP" : "Verify Identity"}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'mobile' 
                ? "Enter your mobile number to receive a secure 4-digit verification code." 
                : `We sent a 4-digit verification code to +91 ${mobileNumber}`}
            </Text>
          </View>

          {step === 'mobile' ? (
            <View style={styles.contentWrapper}>
              {/* Step 1: Mobile Input Form */}
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputBoxWrapper}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryText}>+91</Text>
                </View>
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Enter 10 digit number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={(text) => setMobileNumber(text.replace(/[^0-9]/g, ''))}
                />
                {mobileNumber.length === 10 && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" style={styles.checkIcon} />
                )}
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, mobileNumber.length !== 10 && styles.buttonDisabled]} 
                onPress={handleSendOtp}
                disabled={isSending || mobileNumber.length !== 10}
                activeOpacity={0.85}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Send Verification Code</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.contentWrapper}>
              {/* Step 2: OTP Entry Form */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                  />
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, (isLoading || otp.join('').length !== 4) && styles.buttonDisabled]} 
                onPress={verifyOtp}
                disabled={isLoading || otp.join('').length !== 4}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & Proceed</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleSendOtp} disabled={isSending}>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.editNumBtn} onPress={() => setStep('mobile')}>
                <Text style={styles.editNumText}>Edit Mobile Number</Text>
              </TouchableOpacity>
            </View>
          )}
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
  gradBlob1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(13, 148, 136, 0.06)',
    zIndex: -1,
  },
  gradBlob2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    zIndex: -1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    ...SHADOWS.soft,
    elevation: 2,
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.soft,
    elevation: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: '#0F172A',
    marginBottom: 10,
    fontWeight: '800',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  contentWrapper: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 58,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  countryCodeBox: {
    borderRightWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingRight: 12,
    marginRight: 14,
  },
  countryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  mobileInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
    letterSpacing: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: width > 360 ? 64 : 56,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.8,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    ...SHADOWS.soft,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...SHADOWS.glow,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#94A3B8',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
  editNumBtn: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  editNumText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
