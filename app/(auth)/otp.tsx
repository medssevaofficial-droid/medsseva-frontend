import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Dimensions
} from 'react-native';
import { showError } from '../../src/store/toastStore';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../../src/theme/theme';
import { loginSuccess } from '../../src/store/slices/authSlice';
import { apiService } from '../../src/services/api';

const { width } = Dimensions.get('window');
const PRIMARY = COLORS.primary;

export default function OTPScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(30);
const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 'otp') {
      setCountdown(30);
      setCanResend(false);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const maskedNumber = mobileNumber.length === 10
    ? `+91 ••••••${mobileNumber.slice(-3)}`
    : `+91 ${mobileNumber}`;

  const handleSendOtp = () => {
    if (mobileNumber.length !== 10) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep('otp');
    }, 1200);
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(['', '', '', '']);
    handleSendOtp();
  };

  const verifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) return;
if (otpValue !== '1234') {
      setOtpError('Incorrect code. Please try again.');
      return;
    }
    setOtpError('');
    setIsLoading(true);
    try {
      const result = await apiService.checkMobile(mobileNumber);
      router.push({
        pathname: '/(auth)/register',
        params: { mobile: mobileNumber, fromOtp: '1' }
      });
    } catch (error: any) {
      console.error('OTP verification / account check failed:', error);
      showError('Unable to verify your account right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.backBtn}
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
            <MaterialCommunityIcons name="arrow-left" size={22} color="#1E293B" />
          </TouchableOpacity>

          {step === 'mobile' ? (
            <>
              <Text style={styles.title}>Login with OTP</Text>
              <Text style={styles.subtitle}>
                Enter your mobile number to receive a secure 4-digit verification code.
              </Text>

              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <View style={styles.mobileInputWrap}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
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
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, mobileNumber.length !== 10 && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={isSending || mobileNumber.length !== 10}
                activeOpacity={0.85}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Send Verification Code</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Verify Mobile Number</Text>
              <Text style={styles.subtitleOtp}>
                We've sent a 4-digit verification code to{'\n'}
                <Text style={styles.maskedNum}>{maskedNumber} </Text>
                <Text style={styles.changeLink} onPress={() => { setStep('mobile'); setOtp(['', '', '', '']); }}>
                  Change Number
                </Text>
              </Text>

              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                  />
                ))}
              </View>

           {otpError ? <Text style={styles.otpError}>{otpError}</Text> : null}

              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                {canResend ? (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.countdownText}>{countdown}s</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (isLoading || otp.join('').length !== 4) && styles.btnDisabled]}
                onPress={verifyOtp}
                disabled={isLoading || otp.join('').length !== 4}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>

             
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F0F3' },
scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
  },
  backBtn: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 28,
  },
  subtitleOtp: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 32,
  },
  maskedNum: {
    color: '#0F172A',
    fontWeight: '600',
  },
  changeLink: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  mobileInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 56,
    paddingHorizontal: 14,
    marginBottom: 28,
  },
  countryCode: {
    borderRightWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingRight: 12,
    marginRight: 12,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  mobileInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    letterSpacing: 1,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  otpBox: {
    width: (width - 40 - 48 - 24) / 4,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  otpBoxFilled: {
    backgroundColor: '#E6F4F3',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  resendText: { fontSize: 13, color: '#64748B' },
  resendLink: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  countdownText: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  primaryBtn: {
    backgroundColor: PRIMARY,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    elevation: 3,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnDisabled: { opacity: 0.5, backgroundColor: '#94A3B8', shadowOpacity: 0 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  supportRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  supportText: { fontSize: 13, color: '#64748B' },
supportLink: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  otpError: { fontSize: 13, color: '#EF4444', marginBottom: 12, marginLeft: 4 },
});