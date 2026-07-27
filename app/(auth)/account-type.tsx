import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform, Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../src/theme/theme';

const PRIMARY = COLORS.primary;

export default function AccountTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'user' | 'partner'>('user');

  const handleContinue = () => {
    if (selected === 'user') router.push('/(auth)/login');
    else router.push('/(auth)/partner-login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F0F3" />

      <Text style={styles.title}>Continue as</Text>
      <Text style={styles.subtitle}>Select your profile to experience tailored{'\n'}healthcare services.</Text>

      <TouchableOpacity
        style={[styles.card, selected === 'user' && styles.cardSelected]}
        onPress={() => setSelected('user')}
        activeOpacity={0.9}
      >
        <View style={styles.cardTopRow}>
          <View style={[styles.iconBox, selected === 'user' && styles.iconBoxSelected]}>
            <MaterialCommunityIcons name="account" size={26} color={selected === 'user' ? '#fff' : '#64748B'} />
          </View>
          <View style={[styles.radio, selected === 'user' && styles.radioSelected]}>
            {selected === 'user' && <View style={styles.radioDot} />}
          </View>
        </View>
        <Text style={[styles.cardTitle, selected === 'user' && styles.cardTitleSelected]}>User</Text>
        <Text style={styles.cardDesc}>Order medicines, book lab tests, and manage{'\n'}your family's health records in one secure place.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selected === 'partner' && styles.cardSelected]}
        onPress={() => setSelected('partner')}
        activeOpacity={0.9}
      >
        <View style={styles.cardTopRow}>
          <View style={[styles.iconBox, selected === 'partner' && styles.iconBoxSelected]}>
            <MaterialCommunityIcons name="medical-bag" size={26} color={selected === 'partner' ? '#fff' : '#64748B'} />
          </View>
          <View style={[styles.radio, selected === 'partner' && styles.radioSelected]}>
            {selected === 'partner' && <View style={styles.radioDot} />}
          </View>
        </View>
        <Text style={[styles.cardTitle, selected === 'partner' && styles.cardTitleSelected]}>Partner</Text>
        <Text style={styles.cardDesc}>Join our healthcare network. Offer pharmacy{'\n'}services or diagnostic labs to a wider audience.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
        <Text style={styles.continueBtnText}>
          Continue as {selected === 'user' ? 'User' : 'Partner'}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
      </TouchableOpacity>

     
       <View style={styles.footerLinks}>
               <TouchableOpacity onPress={() => router.push({ pathname: '/legal/LegalWebView', params: { type: 'terms' } })}>
                 <Text style={styles.footerLink}>Terms of Service</Text>
               </TouchableOpacity>
               <Text style={styles.footerSep}> · </Text>
               <TouchableOpacity onPress={() => router.push({ pathname: '/legal/LegalWebView', params: { type: 'privacy' } })}>
                 <Text style={styles.footerLink}>Privacy Policy</Text>
               </TouchableOpacity>
             </View>
     <Text style={styles.copyright}>
  © {new Date().getFullYear()} MedsSeva Healthcare. All rights reserved.
</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F0F3' },
  content: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '700', color: '#0F2937', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#4B6070', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: '#E6F4F3',
    borderColor: PRIMARY,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxSelected: {
    backgroundColor: PRIMARY,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: PRIMARY,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0F2937', marginBottom: 6 },
  cardTitleSelected: { color: '#0F2937' },
  cardDesc: { fontSize: 14, color: '#5A7080', lineHeight: 21 },
  continueBtn: {
    backgroundColor: PRIMARY,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 6,
  },
  continueBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  loginRowText: { fontSize: 14, color: '#5A7080' },
  loginLink: { fontSize: 14, fontWeight: '700', color: PRIMARY },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  footerLink: { fontSize: 13, color: '#5A7080' },
  footerSep: { fontSize: 13, color: '#5A7080' },
  copyright: { fontSize: 12, color: '#7A9AAA', textAlign: 'center' },
});