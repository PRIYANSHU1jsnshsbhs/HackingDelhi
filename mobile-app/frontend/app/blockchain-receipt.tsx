import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Share,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import uuid from 'react-native-uuid';
import { generateBlockchainReceipt } from '../utils/simulatedData';
import { useCensusStore } from '../store/census';

export default function BlockchainReceiptScreen() {
  const params = useLocalSearchParams();
  const addSurvey = useCensusStore(state => state.addSurvey);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    // Generate blockchain receipt
    const blockchainData = generateBlockchainReceipt();
    setReceipt(blockchainData);
    
    // Save survey to local store
    const surveyData = {
      id: uuid.v4().toString(),
      name: params.name as string,
      age: params.age as string,
      guardian: params.guardian as string,
      caste: params.caste as string,
      income: params.income as string,
      aiVerification: {
        incomeStatus: 'Verified',
        confidence: parseInt(params.aiConfidence as string) || 95,
        conflictDetected: false
      },
      blockchainReceipt: {
        transactionHash: blockchainData.transactionHash,
        timestamp: blockchainData.timestamp,
        status: 'Anchored' as const
      },
      synced: false,
      createdAt: new Date().toISOString()
    };
    
    addSurvey(surveyData);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Census Survey Receipt\n\nCitizen: ${params.name}\nTransaction: ${receipt?.transactionHash}\nStatus: ${receipt?.status}\nTimestamp: ${new Date(receipt?.timestamp).toLocaleString()}`
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/home');
  };

  if (!receipt) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Success Icon */}
          <View style={styles.successContainer}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={64} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Survey Complete!</Text>
            <Text style={styles.successSubtitle}>Data recorded on blockchain</Text>
          </View>

          {/* Blockchain Receipt Card */}
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <Ionicons name="cube-outline" size={28} color="#06b6d4" />
              <Text style={styles.receiptTitle}>Blockchain Receipt</Text>
            </View>

            <View style={styles.divider} />

            {/* Citizen Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Citizen Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{params.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{params.age} years</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Transaction Details */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Transaction Details</Text>
              
              <View style={styles.hashContainer}>
                <Text style={styles.hashLabel}>Transaction Hash</Text>
                <View style={styles.hashBox}>
                  <Text style={styles.hashText} numberOfLines={1}>
                    {receipt.transactionHash}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Block Number:</Text>
                <Text style={styles.infoValue}>{receipt.blockNumber}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Timestamp:</Text>
                <Text style={styles.infoValue}>
                  {new Date(receipt.timestamp).toLocaleString()}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gas Used:</Text>
                <Text style={styles.infoValue}>{receipt.gasUsed} ETH</Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusIndicator} />
                  <Text style={styles.statusText}>{receipt.status}</Text>
                </View>
              </View>
            </View>
          </View>

          
          {/* Action Buttons */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#06b6d4" />
            <Text style={styles.shareButtonText}>Share Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.completeGradient}
            >
              <Text style={styles.completeText}>Back to Home</Text>
              <Ionicons name="home" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
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
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  receiptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: 20,
  },
  infoSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06b6d4',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  hashContainer: {
    marginBottom: 12,
  },
  hashLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
  },
  hashBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  hashText: {
    fontSize: 12,
    color: '#06b6d4',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  completeGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});