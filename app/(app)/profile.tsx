import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, List } from 'react-native-paper';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>User data not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Avatar.Image 
            size={100} 
            source={{ uri: user.picture }} 
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <ThemedText type="title">{user.name}</ThemedText>
            <ThemedText>{user.email}</ThemedText>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <List.Section>
          <List.Subheader>Account Info</List.Subheader>
          <List.Item
            title="Email"
            description={user.email}
            left={props => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title="Account ID"
            description={user.id}
            left={props => <List.Icon {...props} icon="card-account-details" />}
          />
        </List.Section>
        
        <Divider style={styles.divider} />
        
        <List.Section>
          <List.Subheader>App Info</List.Subheader>
          <List.Item
            title="App Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Demo Mode"
            description="This app is running in demo mode"
            left={props => <List.Icon {...props} icon="test-tube" />}
          />
          <List.Item
            title="Terms & Conditions"
            onPress={() => {/* Open terms */}}
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Privacy Policy"
            onPress={() => {/* Open privacy */}}
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={signOut}
            style={styles.logoutButton}
            buttonColor="#FF5252"
            accessibilityLabel="Logout"
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  avatar: {
    marginBottom: 16,
  },
  headerInfo: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  buttonContainer: {
    padding: 16,
    marginTop: 24,
    marginBottom: 48,
  },
  logoutButton: {
    paddingVertical: 6,
  },
});
