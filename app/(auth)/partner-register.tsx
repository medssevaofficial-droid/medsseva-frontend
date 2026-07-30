import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../src/theme/theme';
import { showError, showInfo } from '../../src/store/toastStore';
import { apiService } from '../../src/services/api';
import * as Location from 'expo-location';
const PARTNER_ROLES = ['Phlebotomist', 'Lab Technician', 'Lab Assistant', 'Sample Collector'];

export default function PartnerRegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [serverError, setServerError] = useState<string | null>(null);
const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleAutoDetectLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
       showError('Location permission is required to auto-detect your address.');
        return;
      }
      const coords = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        const parts = [g.name, g.street, g.district, g.city, g.region, g.postalCode, g.country];
        const fullAddress = parts.filter(Boolean).join(', ');
        updateField('address', fullAddress);
        if (g.city) updateField('city', g.city);
      }
    } catch (error) {
     showError('Could not fetch location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: '', confirmPassword: '',
    labName: '', role: '', city: '', branch: '', address: '',
  });

  const updateField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

const otpRefs = React.useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (val: string, i: number) => {
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 3) {
      otpRefs.current[i + 1]?.focus();
    }
    if (!val && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

const validateAndSendOtp = () => {
    setServerError(null);
    if (!form.name || !form.mobile || !form.password || !form.labName || !form.role) {
      setServerError('Please fill all required fields.');
      return;
    }
    if (form.mobile.length !== 10) {
      setServerError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setServerError('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setServerError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }
    setOtpStep(true);
  };
  const handleVerifyAndSubmit = async () => {
    const otpVal = otp.join('');
    if (otpVal !== '1234') {
     showError('Use 1234 for now.');
      return;
    }
    setIsLoading(true);
    try {
      await apiService.registerPartner({
        name: form.name, email: form.email || undefined,
        mobile: form.mobile, password: form.password,
        labName: form.labName, role: form.role,
        city: form.city || undefined, branch: form.branch || undefined,
        address: form.address || undefined,
      });
    router.replace('/(auth)/partner-pending');
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

if (otpStep) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ScreenWrapper
          backgroundColor="#F8FAFC"
          contentContainerStyle={styles.content}
          disableKeyboardDismiss
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => setOtpStep(false)}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#334155" />
          </TouchableOpacity>

          <View style={styles.centerBlock}>
            <View style={styles.shieldCircle}>
              <MaterialCommunityIcons name="shield-check" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.otpTitle}>Enter OTP</Text>
            <Text style={styles.otpSubtitle}>
              Enter the 4-digit verification code sent to your registered mobile number.
            </Text>
         <View style={styles.otpRow}>
              {otp.map((d, i) => (
                <TextInput
                  key={i}
                 ref={ref => { otpRefs.current[i] = ref; }}
                  style={[styles.otpBox, d ? styles.otpBoxFilled : null]}
                  maxLength={1} keyboardType="number-pad"
                  value={d} onChangeText={v => handleOtpChange(v, i)}
                  autoFocus={i === 0}
                />
              ))}
            </View>
            <Text style={styles.otpHint}>This code will expire in 5 minutes</Text>
           <TouchableOpacity
              style={[styles.submitBtn, { width: '100%', marginTop: 8 }, isLoading && { opacity: 0.6 }]}
              onPress={handleVerifyAndSubmit} disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>Verify & Continue</Text>
              }
            </TouchableOpacity>
          </View>
</ScreenWrapper>
      </View>
    );
  }
return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScreenWrapper
        backgroundColor="#F8FAFC"
        contentContainerStyle={styles.content}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#334155" />
          </TouchableOpacity>
      
        </View>

        <Text style={styles.pageTitle}>Partner Registration</Text>
        <Text style={styles.pageSubtitle}>Join MedsSeva as a verified Pathology Partner.</Text>

        {/* Personal Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Enter your full name' },
            { key: 'email', label: 'Email Address', placeholder: 'Enter your email address', keyboardType: 'email-address' },
            { key: 'mobile', label: 'Phone Number', placeholder: 'Enter your mobile number', keyboardType: 'phone-pad', maxLength: 10 },
            { key: 'password', label: 'Password', placeholder: 'Enter your password', secure: true },
            { key: 'confirmPassword', label: 'Confirm Password', placeholder: 'Re-enter your password', secure: true },
          ].map(field => (
            <View key={field.key} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#94A3B8"
                secureTextEntry={field.secure}
                keyboardType={(field.keyboardType as any) || 'default'}
                maxLength={field.maxLength}
                value={(form as any)[field.key]}
                onChangeText={v => updateField(field.key, v)}
              />
            </View>
          ))}
        </View>

        {/* Lab Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="flask-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Lab Details</Text>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Lab Name</Text>
            <TextInput
              style={styles.input} placeholder="Enter your lab name"
              placeholderTextColor="#94A3B8" value={form.labName}
              onChangeText={v => updateField('labName', v)}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Role</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowRoleDropdown(!showRoleDropdown)}>
              <Text style={form.role ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                {form.role || 'Select your role'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#94A3B8" />
            </TouchableOpacity>
            {showRoleDropdown && (
              <View style={styles.dropdownList}>
                {PARTNER_ROLES.map(r => (
                  <TouchableOpacity key={r} style={styles.dropdownItem}
                    onPress={() => { updateField('role', r); setShowRoleDropdown(false); }}>
                    <Text style={styles.dropdownItemText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>City</Text>
            <TextInput
              style={styles.input} placeholder="Select your city"
              placeholderTextColor="#94A3B8" value={form.city}
              onChangeText={v => updateField('city', v)}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Branch</Text>
            <TextInput
              style={styles.input} placeholder="Select your branch"
              placeholderTextColor="#94A3B8" value={form.branch}
              onChangeText={v => updateField('branch', v)}
            />
          </View>
        </View>

{/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Address</Text>
          </View>

          <TouchableOpacity
            style={styles.autoDetectBtn}
            onPress={handleAutoDetectLocation}
            disabled={locationLoading}
            activeOpacity={0.8}
          >
            {locationLoading
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <MaterialCommunityIcons name="crosshairs-gps" size={18} color={COLORS.primary} />
            }
            <Text style={styles.autoDetectText}>
              {locationLoading ? 'Detecting...' : 'Auto Detect Location'}
            </Text>
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Full Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your complete address"
              placeholderTextColor="#94A3B8"
              multiline numberOfLines={3} value={form.address}
              onChangeText={v => updateField('address', v)}
            />
          </View>
        </View>

<TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreedToTerms(prev => !prev)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && (
              <MaterialCommunityIcons name="check" size={14} color="#fff" />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the{' '}
            <Text
              style={styles.checkboxLink}
              onPress={() => router.push({ pathname: '/legal/LegalWebView', params: { type: 'terms' } })}
            >
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text
              style={styles.checkboxLink}
              onPress={() => router.push({ pathname: '/legal/LegalWebView', params: { type: 'privacy' } })}
            >
              Privacy Policy
            </Text>
          </Text>
        </TouchableOpacity>
  {serverError && (
            <View style={styles.serverErrorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          )}

      <TouchableOpacity style={styles.submitBtn} onPress={validateAndSendOtp}>
          <Text style={styles.submitBtnText}>Continue</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <View style={styles.signInRow}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/partner-login')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
</ScreenWrapper>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', ...SHADOWS.soft,
  },

 
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 24 },
  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, ...SHADOWS.soft,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1,
    borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#0F172A',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1,
    borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 12,
  },
  dropdownPlaceholder: { fontSize: 14, color: '#94A3B8' },
  dropdownSelected: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  dropdownList: {
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1,
    borderColor: '#E2E8F0', marginTop: 4, ...SHADOWS.soft,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 14, color: '#334155' },
checkboxRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginBottom: 20, paddingHorizontal: 2,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2,
    borderColor: '#CBD5E1', backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },
  checkboxLink: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  submitBtn: {
    backgroundColor: COLORS.primary, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row', ...SHADOWS.soft,
  },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  centerBlock: { alignItems: 'center', paddingTop: 40 },
  shieldCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0FDFA',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#CCFBF1', marginBottom: 24,
  },
  otpTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  otpSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 },
  otpRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  otpBox: {
    width: 60, height: 60, borderRadius: 14, borderWidth: 2, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC', textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#0F172A',
  },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: '#F0FDFA' },
otpHint: { fontSize: 12, color: '#94A3B8', marginBottom: 32 },
  serverErrorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#FECACA', width: '100%', marginBottom: 16,
  },
  serverErrorText: { fontSize: 13, color: '#EF4444', fontWeight: '600', flex: 1 },
  signInRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  signInText: { fontSize: 14, color: '#64748B' },
signInLink: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  autoDetectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0FDFA', borderRadius: 10, borderWidth: 1,
    borderColor: '#CCFBF1', paddingVertical: 12, marginBottom: 12, gap: 8,
  },
  autoDetectText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
});