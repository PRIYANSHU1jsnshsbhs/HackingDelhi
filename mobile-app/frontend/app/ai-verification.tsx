import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { generateAIVerification } from '../utils/simulatedData';

export default function AIVerificationScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<any>(null);

  useEffect(() => {
    // Simulate AI processing
    setTimeout(() => {
      const result = generateAIVerification(params.income as string);
      setVerification(result);
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2500);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/blockchain-receipt',
      params: {
        ...params,
        aiVerified: 'true',
        aiConfidence: verification.confidence.toString()
      }
    });
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.title}>AI Verification</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 3</Text>

          {loading ? (
            <View style={styles.loadingCard}>
              <View style={styles.loadingIconContainer}>
                <Ionicons name="analytics" size={64} color="#06b6d4" />
                <ActivityIndicator
                  size="large"
                  color="#06b6d4"
                  style={styles.spinner}
                />
              </View>
              <Text style={styles.loadingTitle}>AI Analysis in Progress</Text>
              <Text style={styles.loadingSubtitle}>Validating income declaration...</Text>
              
              <View style={styles.processingSteps}>
                <View style={styles.stepRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.stepText}>Cross-referencing databases</Text>
                </View>
                <View style={styles.stepRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.stepText}>Analyzing patterns</Text>
                </View>
                <View style={styles.stepRow}>
                  <ActivityIndicator size="small" color="#06b6d4" />
                  <Text style={styles.stepText}>Generating confidence score</Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              {/* Verification Result */}
              <View style={styles.resultCard}>
                <View style={styles.successIcon}>
                  <Ionicons
                    name={verification.conflictDetected ? 'alert-circle' : 'checkmark-circle'}
                    size={64}
                    color={verification.conflictDetected ? '#f59e0b' : '#10b981'}
                  />
                </View>
                <Text style={styles.resultTitle}>
                  {verification.conflictDetected ? 'Review Required' : 'Verification Complete'}
                </Text>
                <Text style={styles.resultSubtitle}>
                  AI analysis completed successfully
                </Text>
              </View>

              {/* AI Signals */}
              <View style={styles.signalsCard}>
                <Text style={styles.signalsTitle}>AI Verification Signals</Text>
                
                <View style={styles.signalRow}>
                  <View style={styles.signalLabel}>
                    <Ionicons name="cash-outline" size={20} color="#06b6d4" />
                    <Text style={styles.signalLabelText}>Income Verification</Text>
                  </View>
                  <Text style={[styles.signalValue, verification.conflictDetected && styles.signalWarning]}>
                    {verification.incomeStatus}
                  </Text>
                </View>

                <View style={styles.signalRow}>
                  <View style={styles.signalLabel}>
                    <Ionicons name="speedometer-outline" size={20} color="#06b6d4" />
                    <Text style={styles.signalLabelText}>Model Confidence</Text>
                  </View>
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceText}>{verification.confidence}%</Text>
                    <View style={styles.confidenceBar}>
                      <View
                        style={[styles.confidenceBarFill, { width: `${verification.confidence}%` }]}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.signalRow}>
                  <View style={styles.signalLabel}>
                    <Ionicons name="search-outline" size={20} color="#06b6d4" />
                    <Text style={styles.signalLabelText}>Conflict Detection</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusIndicator,
                        verification.conflictDetected ? styles.statusWarning : styles.statusSuccess
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {verification.conflictDetected ? 'Flagged' : 'Clear'}
                    </Text>
                  </View>
                </View>

                <View style={styles.signalRow}>
                  <View style={styles.signalLabel}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#06b6d4" />
                    <Text style={styles.signalLabelText}>Data Quality</Text>
                  </View>
                  <Text style={styles.signalValue}>High</Text>
                </View>
              </View>

              {/* Model Info */}
              <View style={styles.modelCard}>
                <View style={styles.modelHeader}>
                  <Ionicons name="cube-outline" size={20} color="#94a3b8" />
                  <Text style={styles.modelTitle}>Model Information</Text>
                </View>
                <View style={styles.modelDetails}>
                  <Text style={styles.modelDetail}>Model: Census Validator v3.2</Text>
                  <Text style={styles.modelDetail}>Training Data: 2.5M records</Text>
                  <Text style={styles.modelDetail}>Last Updated: Jan 2025</Text>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={styles.continueGradient}
                >
                  <Text style={styles.continueText}>Continue to Blockchain</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
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
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  loadingIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  spinner: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
  },
  processingSteps: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  simulationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  simulationText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  successIcon: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  signalsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  signalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  signalRow: {
    marginBottom: 20,
  },
  signalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  signalLabelText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  signalValue: {
    fontSize: 14,
    color: '#e2e8f0',
    paddingLeft: 28,
  },
  signalWarning: {
    color: '#fbbf24',
  },
  confidenceContainer: {
    paddingLeft: 28,
  },
  confidenceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 28,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusSuccess: {
    backgroundColor: '#10b981',
  },
  statusWarning: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  modelCard: {
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modelTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  modelDetails: {
    gap: 6,
  },
  modelDetail: {
    fontSize: 12,
    color: '#64748b',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
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
});