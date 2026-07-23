import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Modal, ActivityIndicator, Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, SHADOWS } from '@/src/theme/theme';

const LEGAL_ITEMS = [
  {
    icon: 'file-document-outline',
    label: 'Terms & Conditions',
    subtitle: 'Our terms of service',
    url: 'https://medsseva-app.onrender.com/terms',
  },
  {
    icon: 'shield-lock-outline',
    label: 'Privacy Policy',
    subtitle: 'How we handle your data',
    url: 'https://medsseva-app.onrender.com/privacy',
  },
  {
    icon: 'information-outline',
    label: 'About App',
    subtitle: 'Version and app information',
    url: 'https://medsseva-app.onrender.com/about',
  },
];

export default function LegalScreen() {
  const router = useRouter();
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState(false);

  const openPage = (url: string, title: string) => {
    setActiveUrl(url);
    setActiveTitle(title);
    setWebLoading(true);
    setWebError(false);
  };

  const closeWebView = () => {
    setActiveUrl(null);
    setWebLoading(true);
    setWebError(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {LEGAL_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.row, idx < LEGAL_ITEMS.length - 1 && styles.rowBorder]}
              onPress={() => openPage(item.url, item.label)}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowSub}>{item.subtitle}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal visible={!!activeUrl} animationType="slide" onRequestClose={closeWebView}>
        <View style={styles.webviewContainer}>
          <View style={styles.webviewHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={closeWebView}>
              <MaterialCommunityIcons name="close" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.webviewTitle} numberOfLines={1}>{activeTitle}</Text>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => activeUrl && Linking.openURL(activeUrl)}
            >
              <MaterialCommunityIcons name="open-in-new" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {activeUrl && (
            <WebView
              source={{ uri: activeUrl }}
              onLoadStart={() => { setWebLoading(true); setWebError(false); }}
              onLoadEnd={() => setWebLoading(false)}
              onError={() => { setWebLoading(false); setWebError(true); }}
              style={styles.webview}
            />
          )}

          {webLoading && (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.webviewLoadingText}>Loading...</Text>
            </View>
          )}

          {webError && (
            <View style={styles.webviewError}>
              <MaterialCommunityIcons name="wifi-off" size={48} color="#CBD5E1" />
              <Text style={styles.webviewErrorTitle}>Unable to load page</Text>
              <Text style={styles.webviewErrorSub}>Check your internet connection</Text>
              <TouchableOpacity
                style={styles.openBrowserBtn}
                onPress={() => activeUrl && Linking.openURL(activeUrl)}
              >
                <Text style={styles.openBrowserText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F8FAFC',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 1, borderColor: '#E2E8F0', ...SHADOWS.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FDFA',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  rowSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  webviewContainer: { flex: 1, backgroundColor: '#fff' },
  webviewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  webviewTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  webview: { flex: 1 },
  webviewLoading: {
    position: 'absolute', top: 90, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', gap: 12,
  },
  webviewLoadingText: { color: '#64748B', fontSize: 14 },
  webviewError: {
    position: 'absolute', top: 90, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', gap: 12, padding: 32,
  },
  webviewErrorTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  webviewErrorSub: { fontSize: 14, color: '#64748B' },
  openBrowserBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  openBrowserText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});