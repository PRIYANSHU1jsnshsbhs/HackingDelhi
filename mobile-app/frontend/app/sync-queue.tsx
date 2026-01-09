import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCensusStore, CitizenData } from "../store/census";
import { Platform } from "react-native";

// IMPORTANT: Backend must be started with: uvicorn server:app --reload --host 0.0.0.0 --port 8000
// Use your computer's network IP address (check with: ipconfig getifaddr en0)
const API_BASE_URL = "http://192.168.1.54:8000/api";

export default function SyncQueueScreen() {
  const surveys = useCensusStore((state) => state.surveys);
  const markAsSynced = useCensusStore((state) => state.markAsSynced);
  const isOnline = useCensusStore((state) => state.isOnline);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pendingSurveys = surveys.filter((s) => !s.synced);
  const syncedSurveys = surveys.filter((s) => s.synced);

  const syncSurveyToServer = async (survey: CitizenData): Promise<boolean> => {
    try {
      console.log(`Attempting to sync to: ${API_BASE_URL}/surveys`);
      const response = await fetch(`${API_BASE_URL}/surveys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: survey.id,
          name: survey.name,
          age: survey.age,
          sex: survey.sex,
          caste: survey.caste,
          income: survey.income,
          voiceNote: survey.voiceNote || null,
          photoBase64: survey.photoBase64 || null,
          aiVerification: survey.aiVerification,
          blockchainReceipt: survey.blockchainReceipt,
          createdAt: survey.createdAt,
        }),
      });

      console.log(`Response status: ${response.status}`);
      if (response.ok) {
        return true;
      } else if (response.status === 400) {
        // Survey already exists on server, consider it synced
        return true;
      }
      const errorText = await response.text();
      console.error(`Server error: ${errorText}`);
      return false;
    } catch (error) {
      console.error("Sync error:", error);
      Alert.alert(
        "Connection Error",
        `Cannot reach server at ${API_BASE_URL}\n\nMake sure:\n1. Backend is running with: uvicorn server:app --reload --host 0.0.0.0 --port 8000\n2. Phone is on same WiFi network\n3. IP address is correct (192.168.1.54)`
      );
      return false;
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert(
        "Offline Mode",
        "Cannot sync while offline. Data will be synced when connection is restored."
      );
      return;
    }

    if (pendingSurveys.length === 0) {
      Alert.alert("No Data to Sync", "All surveys are already synced.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSyncing(true);

    let successCount = 0;
    let failCount = 0;

    // Sync each survey to the server
    for (let i = 0; i < pendingSurveys.length; i++) {
      const survey = pendingSurveys[i];
      const success = await syncSurveyToServer(survey);

      if (success) {
        markAsSynced(survey.id);
        successCount++;
      } else {
        failCount++;
      }
    }

    setSyncing(false);

    if (failCount === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Sync Complete",
        `Successfully synced ${successCount} survey(s) to the server.`
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Sync Partial",
        `Synced ${successCount} survey(s). ${failCount} failed - will retry later.`
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Sync Queue</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#06b6d4"
            />
          }
        >
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.statusIndicator,
                    isOnline ? styles.online : styles.offline,
                  ]}
                />
                <Text style={styles.statusLabel}>
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="time-outline" size={24} color="#f59e0b" />
                <Text style={styles.statusValue}>{pendingSurveys.length}</Text>
                <Text style={styles.statusLabel}>Pending</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#10b981"
                />
                <Text style={styles.statusValue}>{syncedSurveys.length}</Text>
                <Text style={styles.statusLabel}>Synced</Text>
              </View>
            </View>
          </View>

          {/* Sync Button */}
          {pendingSurveys.length > 0 && (
            <TouchableOpacity
              style={[
                styles.syncButton,
                (!isOnline || syncing) && styles.syncButtonDisabled,
              ]}
              onPress={handleSync}
              disabled={!isOnline || syncing}
            >
              <LinearGradient
                colors={["#06b6d4", "#0891b2"]}
                style={styles.syncGradient}
              >
                <Ionicons
                  name={syncing ? "sync" : "cloud-upload"}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.syncButtonText}>
                  {syncing
                    ? "Syncing..."
                    : `Sync ${pendingSurveys.length} Survey${
                        pendingSurveys.length > 1 ? "s" : ""
                      }`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Pending Surveys */}
          {pendingSurveys.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Surveys</Text>
              {pendingSurveys.map((survey) => (
                <View key={survey.id} style={styles.surveyCard}>
                  <View style={styles.surveyHeader}>
                    <Ionicons name="document-text" size={24} color="#f59e0b" />
                    <View style={styles.surveyInfo}>
                      <Text style={styles.surveyName}>{survey.name}</Text>
                      <Text style={styles.surveyDate}>
                        {new Date(survey.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  </View>

                  <View style={styles.surveyDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Age:</Text>
                      <Text style={styles.detailValue}>{survey.age}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Income:</Text>
                      <Text style={styles.detailValue}>₹{survey.income}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>AI Confidence:</Text>
                      <Text style={styles.detailValue}>
                        {survey.aiVerification.confidence}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Synced Surveys */}
          {syncedSurveys.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Synced Surveys</Text>
              {syncedSurveys.map((survey) => (
                <View key={survey.id} style={styles.surveyCard}>
                  <View style={styles.surveyHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10b981"
                    />
                    <View style={styles.surveyInfo}>
                      <Text style={styles.surveyName}>{survey.name}</Text>
                      <Text style={styles.surveyDate}>
                        {new Date(survey.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.syncedBadge}>
                      <Text style={styles.syncedBadgeText}>Synced</Text>
                    </View>
                  </View>

                  <View style={styles.surveyDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Transaction:</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {survey.blockchainReceipt.transactionHash.substring(
                          0,
                          20
                        )}
                        ...
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {surveys.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#64748b" />
              <Text style={styles.emptyTitle}>No Surveys Yet</Text>
              <Text style={styles.emptyText}>
                Start collecting census data to see surveys here
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/identity-scan")}
              >
                <Text style={styles.emptyButtonText}>Start New Survey</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollContent: {
    padding: 24,
  },
  statusCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.1)",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statusItem: {
    alignItems: "center",
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  online: {
    backgroundColor: "#10b981",
  },
  offline: {
    backgroundColor: "#f59e0b",
  },
  statusValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statusLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  syncButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  surveyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.1)",
  },
  surveyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  surveyInfo: {
    flex: 1,
  },
  surveyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  surveyDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  pendingBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: "600",
  },
  syncedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncedBadgeText: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "600",
  },
  surveyDetails: {
    gap: 8,
    paddingLeft: 36,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    color: "#94a3b8",
  },
  detailValue: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  emptyButtonText: {
    color: "#06b6d4",
    fontSize: 14,
    fontWeight: "600",
  },
});
