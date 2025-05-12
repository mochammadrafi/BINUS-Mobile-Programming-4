import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useDatabase } from '@/context/DatabaseContext';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Snackbar, TextInput } from 'react-native-paper';

export default function NewSurveyScreen() {
  const { latitude, longitude } = useLocalSearchParams<{ latitude: string; longitude: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { saveSurvey } = useDatabase();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      setSnackbarMessage('Permission to access camera roll is required!');
      setSnackbarVisible(true);
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      if (images.length + newImages.length > 5) {
        setSnackbarMessage('Maximum 5 images allowed!');
        setSnackbarVisible(true);
        return;
      }
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setSnackbarMessage('Title is required!');
      setSnackbarVisible(true);
      return;
    }
    
    const parsedLat = parseFloat(latitude || '0');
    const parsedLng = parseFloat(longitude || '0');
    
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setSnackbarMessage('Invalid location data!');
      setSnackbarVisible(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await saveSurvey({
        title,
        description,
        latitude: parsedLat,
        longitude: parsedLng,
        images: images.length > 0 ? JSON.stringify(images) : undefined,
      });
      
      setSnackbarMessage('Survey saved successfully!');
      setSnackbarVisible(true);
      
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save survey:', error);
      setSnackbarMessage('Failed to save survey. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Survey Baru" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <TextInput
          label="Judul Survey*"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          accessibilityLabel="Judul Survey"
          accessibilityHint="Masukkan judul survey"
          mode="outlined"
        />
        
        <TextInput
          label="Deskripsi"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.input}
          accessibilityLabel="Deskripsi Survey"
          accessibilityHint="Masukkan deskripsi survey"
          mode="outlined"
        />
        
        <Button 
          mode="contained-tonal" 
          icon="camera"
          onPress={pickImage}
          style={styles.imageButton}
          accessibilityLabel="Tambah Foto"
        >
          Tambah Foto (Max 5)
        </Button>
        
        {images.length > 0 && (
          <View style={styles.imageContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <Button 
                  icon="close-circle" 
                  mode="text" 
                  compact 
                  onPress={() => removeImage(index)}
                  style={styles.removeButton}
                  accessibilityLabel="Hapus foto"
                />
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.locationInfo}>
          <ThemedText>
            Latitude: {parseFloat(latitude || '0').toFixed(6)}
          </ThemedText>
          <ThemedText>
            Longitude: {parseFloat(longitude || '0').toFixed(6)}
          </ThemedText>
        </View>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          accessibilityLabel="Simpan Survey"
        >
          Simpan Survey
        </Button>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  imageButton: {
    marginBottom: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageWrapper: {
    margin: 4,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    right: -10,
    top: -10,
    margin: 0,
    padding: 0,
  },
  locationInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButton: {
    marginVertical: 24,
  },
});
