import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { generateOCRResult } from '../utils/simulatedData';

export default function IdentityScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [guardian, setGuardian] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = () => {
    if (hasPermission === false) {
      Alert.alert('Camera Permission', 'Camera permission is required to scan identity documents.');
      return;
    }
    setShowCamera(true);
  };

  const simulateScan = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Simulate OCR processing
    setTimeout(() => {
      const ocrData = generateOCRResult();
      setName(ocrData.name);
      setAge(ocrData.age);
      setGuardian(ocrData.guardian);
      setShowCamera(false);
      setScanned(true);
    }, 1500);
  };

  const handleContinue = () => {
    if (!name || !age || !guardian) {
      Alert.alert('Incomplete Data', 'Please fill in all fields before continuing.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/declaration',
      params: { name, age, guardian }
    });
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <StatusBar barStyle="light-content" />
        <CameraView style={styles.camera}>
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanInstruction}>Position ID within frame</Text>
            
            <View style={styles.cameraButtons}>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={simulateScan}
              >
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={styles.scanButtonGradient}
                >
                  <Ionicons name="scan" size={24} color="#fff" />
                  <Text style={styles.scanButtonText}>Scan Document</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Identity Verification</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 3</Text>

          {/* Camera Section */}
          <View style={styles.scanCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="id-card" size={40} color="#06b6d4" />
            </View>
            <Text style={styles.scanTitle}>Scan Identity Document</Text>
            <Text style={styles.scanDescription}>
              Capture voter ID, Aadhaar card, or any government-issued ID
            </Text>
            
            <TouchableOpacity
              style={styles.scanActionButton}
              onPress={handleScan}
            >
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                style={styles.scanActionGradient}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.scanActionText}>Open Camera</Text>
              </LinearGradient>
            </TouchableOpacity>

            {scanned && (
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.successText}>Document scanned successfully</Text>
              </View>
            )}
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Citizen Information</Text>
            <Text style={styles.formSubtitle}>Review and edit extracted data</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter age"
                  placeholderTextColor="#64748b"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>sex</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="people" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter sex"
                  placeholderTextColor="#64748b"
                  value={guardian}
                  onChangeText={setGuardian}
                />
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, (!name || !age || !guardian) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!name || !age || !guardian}
          >
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>Continue to Declaration</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
  },
  progressText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 24,
  },
  scanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  scanDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  scanActionGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  scanActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  input: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 16,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scanFrame: {
    width: 280,
    height: 180,
    borderWidth: 3,
    borderColor: '#06b6d4',
    borderRadius: 12,
    marginBottom: 24,
  },
  scanInstruction: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 40,
  },
  cameraButtons: {
    width: '100%',
    gap: 12,
  },
  scanButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  simulationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginTop: 24,
  },
  simulationText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '500',
  },
});