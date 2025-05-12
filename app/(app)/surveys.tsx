import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Survey, useDatabase } from '@/context/DatabaseContext';
import { syncSurveysWithServer } from '@/utils/api';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Divider, Snackbar } from 'react-native-paper';

export default function SurveysScreen() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { getSurveys, getUnsyncedSurveys, markSurveyAsSynced, isReady } = useDatabase();
  const router = useRouter();

  // Load surveys when screen is focused and database is ready
  useFocusEffect(
    useCallback(() => {
      if (isReady) {
        loadSurveys();
      }
    }, [isReady])
  );

  // Load all surveys from SQLite
  const loadSurveys = async () => {
    if (!isReady) {
      console.log('Database not ready yet');
      return;
    }
    
    try {
      setRefreshing(true);
      const data = await getSurveys();
      setSurveys(data);
    } catch (error) {
      console.error('Failed to load surveys:', error);
      showSnackbar('Failed to load surveys');
    } finally {
      setRefreshing(false);
    }
  };

  // Sync unsynced surveys with server
  const syncSurveys = async () => {
    if (!isReady) {
      showSnackbar('Database not ready');
      return;
    }
    
    try {
      setSyncing(true);
      const unsyncedSurveys = await getUnsyncedSurveys();
      
      if (unsyncedSurveys.length === 0) {
        showSnackbar('No surveys to sync');
        setSyncing(false);
        return;
      }
      
      // Send surveys to server
      const syncResults = await syncSurveysWithServer(unsyncedSurveys);
      
      // Update local database for successfully synced surveys
      for (const id of syncResults.successIds) {
        await markSurveyAsSynced(id);
      }
      
      // Show results
      if (syncResults.successIds.length > 0) {
        showSnackbar(`Synced ${syncResults.successIds.length} surveys successfully`);
      } else {
        showSnackbar('Failed to sync surveys');
      }
      
      // Reload surveys to update UI
      await loadSurveys();
      
    } catch (error) {
      console.error('Sync error:', error);
      showSnackbar('Sync failed. Check your connection.');
    } finally {
      setSyncing(false);
    }
  };

  const goToSurveyDetail = (id: number) => {
    router.push({
      pathname: '/(app)/survey-detail',
      params: { id: id.toString() },
    });
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const renderSurveyItem = ({ item }: { item: Survey }) => {
    // Parse images if they exist
    const surveyImages = item.images ? JSON.parse(item.images) : [];
    const firstImage = surveyImages.length > 0 ? surveyImages[0] : null;
    
    // Format date
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
    return (
      <Card style={styles.card} onPress={() => goToSurveyDetail(item.id!)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardDetails}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText numberOfLines={1}>{item.description}</ThemedText>
              <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
            </View>
            
            {firstImage && (
              <Image source={{ uri: firstImage }} style={styles.thumbnail} />
            )}
          </View>
        </Card.Content>
        
        <Divider />
        
        <Card.Actions>
          <Button 
            mode="text"
            icon={item.synced ? "check-circle" : "sync"}
            textColor={item.synced ? "#4CAF50" : "#FFC107"}
          >
            {item.synced ? "Synced" : "Not Synced"}
          </Button>
          <Button onPress={() => goToSurveyDetail(item.id!)}>View Details</Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Survey List" />
        <Appbar.Action 
          icon="sync" 
          onPress={syncSurveys} 
          disabled={syncing} 
          accessibilityLabel="Sync surveys with server"
        />
      </Appbar.Header>

      {surveys.length === 0 && !refreshing ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No surveys found. Create a new survey to get started.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={surveys}
          renderItem={renderSurveyItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadSurveys} />
          }
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  cardDetails: {
    flex: 1,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginLeft: 10,
  },
  dateText: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
