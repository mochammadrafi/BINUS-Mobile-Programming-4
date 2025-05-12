import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Survey, useDatabase } from '@/context/DatabaseContext';
import { syncSurveysWithServer } from '@/utils/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ActivityIndicator, Appbar, Button, Card, Divider, Snackbar } from 'react-native-paper';

export default function SurveyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const { getSurveys, markSurveyAsSynced, deleteSurvey, isReady } = useDatabase();

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }
    
    if (isReady) {
      loadSurvey();
    }
  }, [id, isReady]);

  const loadSurvey = async () => {
    if (!isReady) {
      console.log('Database not ready yet');
      return;
    }
    
    try {
      // Get all surveys and find the one with matching ID
      const surveys = await getSurveys();
      const foundSurvey = surveys.find(s => s.id === Number(id));
      
      if (foundSurvey) {
        setSurvey(foundSurvey);
        
        // Parse images if available
        if (foundSurvey.images) {
          try {
            const parsedImages = JSON.parse(foundSurvey.images);
            setImages(parsedImages);
          } catch (error) {
            console.error('Failed to parse images:', error);
          }
        }
      } else {
        showSnackbar('Survey not found');
        setTimeout(() => router.back(), 2000);
      }
    } catch (error) {
      console.error('Error loading survey:', error);
      showSnackbar('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const syncSurvey = async () => {
    if (!survey || survey.synced === 1) return;
    
    try {
      setSyncing(true);
      
      const result = await syncSurveysWithServer([survey]);
      
      if (result.successIds.includes(survey.id!)) {
        await markSurveyAsSynced(survey.id!);
        showSnackbar('Survey synced successfully');
        loadSurvey(); // Refresh survey data
      } else {
        showSnackbar('Failed to sync survey');
      }
    } catch (error) {
      console.error('Sync error:', error);
      showSnackbar('Sync failed. Check your connection');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    if (!survey?.id) return;
    
    try {
      await deleteSurvey(survey.id);
      showSnackbar('Survey deleted successfully');
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar('Failed to delete survey');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!survey) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>Survey not found</ThemedText>
      </ThemedView>
    );
  }

  // Format date for display
  const createdAt = new Date(survey.createdAt);
  const formattedDate = createdAt.toLocaleDateString() + ' ' + createdAt.toLocaleTimeString();

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Survey Details" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.titleCard}>
          <Card.Content>
            <ThemedText type="title">{survey.title}</ThemedText>
            <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <ThemedText type="subtitle">Description</ThemedText>
          <ThemedText style={styles.description}>
            {survey.description || 'No description provided'}
          </ThemedText>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <ThemedText type="subtitle">Location</ThemedText>
          <View style={styles.coordinatesContainer}>
            <ThemedText>Latitude: {survey.latitude.toFixed(6)}</ThemedText>
            <ThemedText>Longitude: {survey.longitude.toFixed(6)}</ThemedText>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: survey.latitude,
                longitude: survey.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: survey.latitude,
                  longitude: survey.longitude,
                }}
                title={survey.title}
              />
            </MapView>
          </View>
        </View>

        {images.length > 0 && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <ThemedText type="subtitle">Photos</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                {images.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}

        <Divider style={styles.divider} />

        <View style={styles.actionsContainer}>
          {survey.synced === 0 && (
            <Button 
              mode="contained" 
              onPress={syncSurvey}
              loading={syncing}
              disabled={syncing}
              icon="cloud-upload"
              style={styles.actionButton}
            >
              Sync to Server
            </Button>
          )}
          
          <Button 
            mode="outlined" 
            onPress={handleDelete}
            icon="delete"
            textColor="#FF5252"
            style={styles.actionButton}
          >
            Delete Survey
          </Button>
        </View>

        <View style={styles.syncStatus}>
          <ThemedText style={styles.syncStatusText}>
            Status: {survey.synced === 1 ? 'Synced to server' : 'Not synced'}
          </ThemedText>
        </View>
      </ScrollView>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  titleCard: {
    margin: 16,
    elevation: 2,
  },
  section: {
    padding: 16,
  },
  divider: {
    marginHorizontal: 16,
  },
  dateText: {
    marginTop: 8,
    opacity: 0.7,
  },
  description: {
    marginTop: 8,
    lineHeight: 22,
  },
  coordinatesContainer: {
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  mapContainer: {
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  imagesScroll: {
    marginTop: 12,
  },
  image: {
    width: 240,
    height: 180,
    marginRight: 10,
    borderRadius: 8,
  },
  actionsContainer: {
    padding: 16,
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
  },
  syncStatus: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  syncStatusText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
});
