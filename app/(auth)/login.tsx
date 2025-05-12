import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>SL</Text>
        </View>
        <Text variant="headlineMedium" style={styles.title}>
          Survey Lapangan
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Aplikasi survey lapangan berbasis lokasi
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={signIn}
          loading={isLoading}
          icon="login"
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          accessibilityLabel="Login"
        >
          Login Demo
        </Button>
      </View>
      
      <Text variant="bodySmall" style={styles.version}>Version 1.0.0</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white'
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    padding: 5,
    borderRadius: 10,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 40
  }
});
