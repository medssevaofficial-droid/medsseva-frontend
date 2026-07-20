import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, TextInput, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showError } from '../../src/store/toastStore';
import { apiService } from '../../src/services/api';
import { COLORS } from '../../src/theme/theme';

const { width } = Dimensions.get('window');
const PRIMARY = COLORS.primary;

type Step = 'mobile' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
          if (prev <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const handleSendOtp = async () => {
    if (mobile.length !== 10) return;
    setIsSending(true);
    try {
      const result = await apiService.checkMobile(mobile);
      if (!result.exists) {
        showError('This mobile number is not registered.');
        setIsSending(false);
        return;
      }
      await apiService.sendOtp(mobile);
      setStep('otp');
    } catch {
      showError('Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) return;
    setOtpError('');
    setIsLoading(true);
    try {
      await apiService.verifyOtp(mobile, otpValue);
      setStep('reset');
    } catch (error: any) {
      setOtpError(error.response?.data?.error || 'Incorrect code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await apiService.resetPassword(mobile, newPassword);
      setStep('done');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const maskedNumber = mobile.length === 10 ? `+91 ••••••${mobile.slice(-4)}` : `+91 ${mobile}`;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F0F3" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step === 'otp') { setStep('mobile'); setOtp(['', '', '', '']); }
            else if (step === 'reset') { setStep('otp'); }
            else { router.back(); }
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#334155" />
        </TouchableOpacity>

        <View style={styles.card}>
          {step === 'mobile' && (
            <>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="lock-reset" size={30} color={PRIMARY} />
              </View>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>Enter your registered mobile number. We'll send a verification code.</Text>

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
                  value={mobile}
                  onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
                />
                {mobile.length === 10 && <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (mobile.length !== 10 || isSending) && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={isSending || mobile.length !== 10}
                activeOpacity={0.85}
              >
                {isSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.createRow}>
                <Text style={styles.createText}>Don't have an account? </Text>
                <Text style={styles.createLink}>Create Account</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'otp' && (
            <>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="message-check-outline" size={30} color={PRIMARY} />
              </View>
              <Text style={styles.title}>Enter OTP</Text>
              <Text style={styles.subtitleOtp}>
                Enter the 4-digit code sent to{'\n'}
                <Text style={styles.maskedNum}>{maskedNumber} </Text>
                <Text style={styles.changeLink} onPress={() => { setStep('mobile'); setOtp(['', '', '', '']); }}>Change</Text>
              </Text>

              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
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
                  <TouchableOpacity onPress={() => { setOtp(['', '', '', '']); handleSendOtp(); }}>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.countdownText}>{countdown}s</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (isLoading || otp.join('').length !== 4) && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading || otp.join('').length !== 4}
                activeOpacity={0.85}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify OTP</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 'reset' && (
            <>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="lock-outline" size={30} color={PRIMARY} />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Create a new password for your account.</Text>

              <Text style={styles.fieldLabel}>New Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <MaterialCommunityIcons name={showNew ? 'eye-outline' : 'eye-off-outline'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <MaterialCommunityIcons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Update Password</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 'done' && (
            <>
              <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7', borderColor: '#A7F3D0' }]}>
                <MaterialCommunityIcons name="check-circle-outline" size={30} color="#10B981" />
              </View>
              <Text style={styles.title}>Password Updated</Text>
              <Text style={styles.subtitle}>Your password has been reset successfully. You can now login with your new password.</Text>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Back to Login</Text>
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
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 40 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20,
    elevation: 2,
  },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#F0FDFA', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#CCFBF1', marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  subtitleOtp: { fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 32, textAlign: 'center' },
  maskedNum: { color: '#0F172A', fontWeight: '600' },
  changeLink: { color: PRIMARY, fontWeight: '700', fontSize: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6, alignSelf: 'flex-start' },
  mobileInputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0',
    height: 56, paddingHorizontal: 14, marginBottom: 24, width: '100%',
  },
  countryCode: { borderRightWidth: 1.5, borderColor: '#E2E8F0', paddingRight: 12, marginRight: 12 },
  countryCodeText: { fontSize: 15, fontWeight: '700', color: '#475569' },
  mobileInput: { flex: 1, fontSize: 15, color: '#0F172A', fontWeight: '600', letterSpacing: 1 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 14, height: 50, marginBottom: 16, width: '100%',
  },
  input: { flex: 1, fontSize: 14, color: '#0F172A' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4, width: '100%' },
  otpBox: {
    width: (width - 48 - 48 - 24) / 4, height: 60, borderRadius: 14,
    backgroundColor: '#F1F5F9', textAlign: 'center', fontSize: 24,
    fontWeight: '700', color: '#0F172A', elevation: 2,
  },
  otpBoxFilled: { backgroundColor: '#E6F4F3', borderWidth: 1.5, borderColor: PRIMARY },
  resendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  resendText: { fontSize: 13, color: '#64748B' },
  resendLink: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  countdownText: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  otpError: { fontSize: 13, color: '#EF4444', marginBottom: 12, alignSelf: 'flex-start' },
  primaryBtn: {
    backgroundColor: PRIMARY, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 16,
    elevation: 2,
  },
  btnDisabled: { opacity: 0.55, backgroundColor: '#94A3B8' },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  createRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  createText: { fontSize: 13, color: '#64748B' },
  createLink: { fontSize: 13, fontWeight: '700', color: PRIMARY },
});