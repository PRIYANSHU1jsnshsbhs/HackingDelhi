import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCensusStore } from '../store/census';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const enumerator = useCensusStore(state => state.enumerator);
  const surveys = useCensusStore(state => state.surveys);
  const isOnline = useCensusStore(state => state.isOnline);
  const logout = useCensusStore(state => state.logout);

  const pendingCount = surveys.filter(s => !s.synced).length;
  const syncedCount = surveys.filter(s => s.synced).length;

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    router.replace('/');
  };

  const startSurvey = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/identity-scan');
  };

  const viewQueue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/sync-queue');
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
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.enumeratorName}>{enumerator?.name}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Ionicons name="location" size={20} color="#06b6d4" />
                <Text style={styles.statusLabel}>Assigned Area</Text>
                <Text style={styles.statusValue}>{enumerator?.assignedArea}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statusItem}>
                <Ionicons name="business" size={20} color="#06b6d4" />
                <Text style={styles.statusLabel}>Ward</Text>
                <Text style={styles.statusValue}>{enumerator?.assignedWard}</Text>
              </View>
            </View>
            <View style={styles.syncStatus}>
              <View style={[styles.syncIndicator, isOnline ? styles.online : styles.offline]} />
              <Text style={styles.syncText}>
                {isOnline ? 'Online - Data syncing enabled' : 'Offline - Data stored locally'}
              </Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                style={styles.statGradient}
              >
                <Ionicons name="document-text" size={32} color="#fff" />
                <Text style={styles.statNumber}>{surveys.length}</Text>
                <Text style={styles.statLabel}>Total Surveys</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.statGradient}
              >
                <Ionicons name="time" size={32} color="#fff" />
                <Text style={styles.statNumber}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Pending Sync</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.statGradient}
              >
                <Ionicons name="checkmark-circle" size={32} color="#fff" />
                <Text style={styles.statNumber}>{syncedCount}</Text>
                <Text style={styles.statLabel}>Synced</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.primaryButton} onPress={startSurvey}>
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Start New Survey</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={viewQueue}>
            <Ionicons name="sync" size={20} color="#06b6d4" />
            <Text style={styles.secondaryButtonText}>View Sync Queue</Text>
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#94a3b8',
  },
  enumeratorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  statusLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    gap: 8,
  },
  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  online: {
    backgroundColor: '#10b981',
  },
  offline: {
    backgroundColor: '#f59e0b',
  },
  syncText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  secondaryButtonText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});