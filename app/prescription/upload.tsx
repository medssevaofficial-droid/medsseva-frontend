import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { apiService } from '../../src/services/api';
import { COLORS, SHADOWS } from '../../src/theme/theme';
import { showSuccess, showError } from '../../src/store/toastStore';
import ScreenWrapper from '../../src/components/ScreenWrapper';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  source: 'camera' | 'gallery' | 'files';
  isImage: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'file-pdf-box';
  if (mimeType === 'application/msword' || mimeType.includes('wordprocessingml')) return 'file-word-box';
  return 'file-image';
}

function getFileIconColor(mimeType: string): string {
  if (mimeType === 'application/pdf') return '#EF4444';
  if (mimeType === 'application/msword' || mimeType.includes('wordprocessingml')) return '#2563EB';
  return COLORS.primary;
}

export default function UploadPrescriptionScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);

  const validateFile = (name: string, mimeType: string, size: number): string | null => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `Unsupported file type. Allowed: JPG, PNG, WEBP, PDF, DOC, DOCX`;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) return `Invalid file format detected.`;
    if (size > MAX_FILE_SIZE) return `File size exceeds 20 MB limit. Your file is ${formatFileSize(size)}.`;
    return null;
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { showError('Camera access is needed to capture prescriptions.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: false });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const name = `prescription_${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';
    const size = asset.fileSize || 0;
    const error = validateFile(name, mimeType, size);
    if (error) { showError(error); return; }
    setSelectedFile({ uri: asset.uri, name, size, mimeType, source: 'camera', isImage: true });
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showError('Gallery access is needed to pick prescriptions.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'livePhotos'], quality: 0.85, allowsEditing: false });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
    const name = asset.fileName || `prescription_${Date.now()}.${ext}`;
    const mimeType = asset.mimeType || `image/${ext}`;
    const size = asset.fileSize || 0;
    const error = validateFile(name, mimeType, size);
    if (error) { showError(error); return; }
    setSelectedFile({ uri: asset.uri, name, size, mimeType, source: 'gallery', isImage: true });
  };

  const handleDocumentPicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const name = asset.name;
    const mimeType = asset.mimeType || 'application/octet-stream';
    const size = asset.size || 0;
    const error = validateFile(name, mimeType, size);
    if (error) { showError(error); return; }
    const isImage = mimeType.startsWith('image/');
    setSelectedFile({ uri: asset.uri, name, size, mimeType, source: 'files', isImage });
  };

  const handleUpload = async () => {
    if (!selectedFile) { showError('Please select a prescription file before uploading.'); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? selectedFile.uri : selectedFile.uri.replace('file://', ''),
        name: selectedFile.name,
        type: selectedFile.mimeType,
      } as any);
      if (notes.trim()) formData.append('notes', notes.trim());
      await apiService.uploadPrescription(formData);
      showSuccess('Prescription uploaded successfully. Our team will review it shortly.');
      router.back();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Upload failed. Please try again.';
      showError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadButton = (
    <TouchableOpacity
      style={[styles.ctaBtn, (!selectedFile || isUploading) && styles.ctaBtnDisabled]}
      activeOpacity={0.88}
      onPress={handleUpload}
      disabled={!selectedFile || isUploading}
    >
      {isUploading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <>
          <MaterialCommunityIcons name="cloud-upload-outline" size={22} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.ctaBtnText}>Upload Prescription</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isUploading}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Prescription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScreenWrapper
        scrollable
        backgroundColor="#F5F7F8"
        bottomButton={uploadButton}
        extraScrollHeight={100}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={22} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Upload your prescription and our team will identify the required tests and assist with booking.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select File Source</Text>
          <View style={styles.sourceGrid}>
       <TouchableOpacity style={styles.sourceCard} onPress={handleCamera} activeOpacity={0.75}>
              <View style={[styles.sourceIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <MaterialCommunityIcons name="camera-outline" size={26} color="#2563EB" />
              </View>
              <Text style={styles.sourceLabel}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sourceCard} onPress={handleGallery} activeOpacity={0.75}>
              <View style={[styles.sourceIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <MaterialCommunityIcons name="image-outline" size={26} color="#16A34A" />
              </View>
              <Text style={styles.sourceLabel}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sourceCard} onPress={handleDocumentPicker} activeOpacity={0.75}>
              <View style={[styles.sourceIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="folder-open-outline" size={26} color="#D97706" />
              </View>
              <Text style={styles.sourceLabel}>Files</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.formatHint}>Supported: JPG, PNG, WEBP, PDF, DOCX • Max 20 MB</Text>
        </View>

        {selectedFile && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Selected Prescription</Text>
            <View style={styles.previewRow}>
              <View style={styles.previewThumb}>
                {selectedFile.isImage ? (
                  <Image source={{ uri: selectedFile.uri }} style={styles.thumbImage} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons
                    name={getFileIcon(selectedFile.mimeType) as any}
                    size={32}
                    color={getFileIconColor(selectedFile.mimeType)}
                  />
                )}
                <View style={styles.thumbOverlay}>
                  <MaterialCommunityIcons name="file-document" size={18} color={COLORS.primary} />
                </View>
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewFileName} numberOfLines={1}>{selectedFile.name}</Text>
                <Text style={styles.previewFileMeta}>
                  {formatFileSize(selectedFile.size)} • Uploaded today
                </Text>
              </View>
              <View style={styles.previewActionBtns}>
                <TouchableOpacity style={styles.iconActionBtn} onPress={handleDocumentPicker}>
                  <MaterialCommunityIcons name="refresh" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconActionBtnDanger} onPress={() => setSelectedFile(null)}>
                  <MaterialCommunityIcons name="delete-outline" size={20} color="#BA1A1A" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionLabel}>Additional Notes</Text>
            <Text style={styles.optionalLabel}>OPTIONAL</Text>
          </View>
          <View style={[styles.textAreaWrapper, notesFocused && styles.textAreaWrapperFocused]}>
            <TextInput
              style={styles.textArea}
              placeholder="Add details like preferred timing or doctor instructions..."
              placeholderTextColor="#6E7979"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
              scrollEnabled={false}
              onFocus={() => setNotesFocused(true)}
              onBlur={() => setNotesFocused(false)}
            />
            <MaterialCommunityIcons
              name="text-box-edit-outline"
              size={18}
              color="rgba(110,121,121,0.35)"
              style={styles.textAreaIcon}
            />
          </View>
        </View>

        <View style={styles.secureRow}>
          <MaterialCommunityIcons name="shield-check" size={15} color="#6E7979" />
          <Text style={styles.secureText}>Your prescription is encrypted and stored securely.</Text>
        </View>
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F8' },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },

  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,101,101,0.07)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,101,101,0.15)',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#3E4949',
    lineHeight: 20,
    fontWeight: '400',
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(189,201,200,0.4)',
    ...SHADOWS.soft,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B1B1D',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  sourceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  sourceCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(189,201,200,0.4)',
    borderRadius: 24,
    paddingVertical: 20,
    ...SHADOWS.soft,
  },
  sourceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B1B1D',
    letterSpacing: 0.05,
  },
  formatHint: {
    fontSize: 11,
    color: '#6E7979',
    textAlign: 'center',
  },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,101,101,0.15)',
    padding: 14,
    gap: 12,
    ...SHADOWS.soft,
  },
  previewThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EAE7EA',
    borderWidth: 1,
    borderColor: '#BDC9C8',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  thumbOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,101,101,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B1B1D',
    marginBottom: 3,
  },
  previewFileMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E7979',
    letterSpacing: 0.05,
  },
  previewActionBtns: {
    flexDirection: 'row',
    gap: 4,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,101,101,0.06)',
  },
  iconActionBtnDanger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(186,26,26,0.06)',
  },

  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionalLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6E7979',
    letterSpacing: 0.5,
  },
  textAreaWrapper: {
    backgroundColor: '#F6F3F5',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  textAreaWrapperFocused: {
    borderColor: 'rgba(0,101,101,0.25)',
  },
  textArea: {
    padding: 16,
    paddingRight: 40,
    fontSize: 14,
    color: '#1B1B1D',
    lineHeight: 20,
    minHeight: 110,
  },
  textAreaIcon: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 4,
  },
  secureText: {
    fontSize: 11,
    color: '#6E7979',
    letterSpacing: 0.3,
  },

  ctaBtn: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaBtnDisabled: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});