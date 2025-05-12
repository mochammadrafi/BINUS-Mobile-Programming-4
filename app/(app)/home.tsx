import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Survey, useDatabase } from '@/context/DatabaseContext';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ActivityIndicator, FAB, Snackbar } from 'react-native-paper';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [visible, setVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  const { getSurveys, isReady } = useDatabase();

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Error getting your location');
      }
    })();
  }, []);

  useEffect(() => {
    if (isReady) {
      loadSurveys();
    }
  }, [isReady]);

  const loadSurveys = async () => {
    try {
      if (!isReady) {
        console.log('Database not ready yet');
        return;
      }
      
      const surveyData = await getSurveys();
      setSurveys(surveyData);
    } catch (error) {
      console.error('Failed to load surveys:', error);
      setErrorMsg('Failed to load surveys');
      setVisible(true);
    }
  };

  const goToNewSurvey = () => {
    if (location) {
      router.push({
        pathname: '/(app)/new-survey',
        params: {
          latitude: location.coords.latitude.toString(),
          longitude: location.coords.longitude.toString(),
        },
      });
    } else {
      setErrorMsg('Lokasi belum tersedia');
      setVisible(true);
    }
  };

  const goToSurveyDetail = (survey: Survey) => {
    router.push({
      pathname: '/(app)/survey-detail',
      params: { id: survey.id?.toString() || '' },
    });
  };

  const goToCurrentLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  if (errorMsg && !location) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>{errorMsg}</ThemedText>
      </ThemedView>
    );
  }

  if (!location) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Mendapatkan lokasi Anda...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {surveys.map((survey) => (
          <Marker
            key={survey.id}
            coordinate={{
              latitude: survey.latitude,
              longitude: survey.longitude,
            }}
            title={survey.title}
            description={survey.description}
            pinColor={survey.synced ? '#4CAF50' : '#FFC107'}
            onCalloutPress={() => goToSurveyDetail(survey)}
          />
        ))}
      </MapView>
      
      <View style={styles.fabContainer}>
        <FAB
          icon="crosshairs-gps"
          size="small"
          style={[styles.fab, styles.fabLocation]}
          onPress={goToCurrentLocation}
          accessibilityLabel="Go to current location"
        />
        <FAB
          icon="plus"
          label="Tambah Survey"
          style={styles.fab}
          onPress={goToNewSurvey}
          accessibilityLabel="Add new survey"
        />
      </View>
      
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setVisible(false),
        }}
      >
        {errorMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  fabContainer: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 70,
  },
  fab: {
    marginTop: 16,
  },
  fabLocation: {
    backgroundColor: 'white',
  },
});
