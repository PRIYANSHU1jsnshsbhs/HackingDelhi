import React, { useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { casteCategories } from '../utils/simulatedData';

export default function DeclarationScreen() {
  const params = useLocalSearchParams();
  const [caste, setCaste] = useState('');
  const [income, setIncome] = useState('');
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleVoiceInput = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceRecording(!voiceRecording);
    
    // Simulate voice recording
    if (!voiceRecording) {
      setTimeout(() => {
        setVoiceRecording(false);
      }, 3000);
    }
  };

  const handleSubmit = () => {
    if (!caste || !income || !consentGiven) {
      Alert.alert('Incomplete Declaration', 'Please fill all fields and provide consent before continuing.');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({
      pathname: '/ai-verification',
      params: {
        ...params,
        caste,
        income
      }
    });
  };

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
            <Text style={styles.title}>Citizen Declaration</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 3</Text>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={18} color="#06b6d4" />
              <Text style={styles.infoText}>{params.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={18} color="#06b6d4" />
              <Text style={styles.infoText}>{params.age} years old</Text>
            </View>
          </View>

          {/* Consent Notice */}
          <View style={styles.consentCard}>
            <View style={styles.consentHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#10b981" />
              <Text style={styles.consentTitle}>Privacy & Consent</Text>
            </View>
            <Text style={styles.consentText}>
              This information is collected for government census purposes only. Your data will be:
            </Text>
            <View style={styles.bulletPoints}>
              <View style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Stored securely with encryption</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Used only for statistical analysis</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Not shared with third parties</Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Socio-Economic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Caste Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={caste}
                  onValueChange={(value) => setCaste(value)}
                  style={styles.picker}
                  dropdownIconColor="#06b6d4"
                >
                  <Picker.Item label="Select caste category" value="" color="#64748b" />
                  {casteCategories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} color="black" />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Annual Household Income (₹)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cash" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter annual income"
                  placeholderTextColor="#64748b"
                  value={income}
                  onChangeText={setIncome}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Voice Input Section */}
            <View style={styles.voiceSection}>
              <View style={styles.voiceSectionHeader}>
                <Ionicons name="mic" size={18} color="#94a3b8" />
                <Text style={styles.voiceSectionTitle}>Optional Voice Input</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.voiceButton, voiceRecording && styles.voiceButtonActive]}
                onPress={handleVoiceInput}
              >
                <View style={styles.voiceButtonContent}>
                  <Ionicons
                    name={voiceRecording ? 'stop-circle' : 'mic-circle'}
                    size={32}
                    color={voiceRecording ? '#ef4444' : '#06b6d4'}
                  />
                  <Text style={styles.voiceButtonText}>
                    {voiceRecording ? 'Recording...' : 'Tap to add voice note'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Consent Checkbox */}
          <TouchableOpacity
            style={styles.consentCheckbox}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setConsentGiven(!consentGiven);
            }}
          >
            <View style={[styles.checkbox, consentGiven && styles.checkboxChecked]}>
              {consentGiven && <Ionicons name="checkmark" size={20} color="#fff" />}
            </View>
            <Text style={styles.consentCheckboxText}>
              I consent to the collection and processing of this information
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (!caste || !income || !consentGiven) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!caste || !income || !consentGiven}
          >
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>Submit & Verify</Text>
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
  infoCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  consentCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  consentText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 20,
  },
  bulletPoints: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
  },
  bulletText: {
    fontSize: 12,
    color: '#cbd5e1',
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 48,
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
  voiceSection: {
    marginTop: 8,
  },
  voiceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  voiceSectionTitle: {
    fontSize: 14,
    color: '#94a3b8',
    flex: 1,
  },
  mockBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mockBadgeText: {
    fontSize: 10,
    color: '#fbbf24',
    fontWeight: '600',
  },
  voiceButton: {
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    borderStyle: 'dashed',
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  voiceButtonContent: {
    alignItems: 'center',
    gap: 8,
  },
  voiceButtonText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  consentCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  consentCheckboxText: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});