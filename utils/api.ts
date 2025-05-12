import { Survey } from '@/context/DatabaseContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React from 'react'; // Add this import

// API URL - replace with your actual API endpoint
const API_URL = 'https://api.example.com/survey';

// Type definition for sync result
interface SyncResult {
  successIds: number[];
  failedIds: number[];
}

/**
 * Sync unsynced surveys with the server
 * @param surveys - List of unsynced surveys
 */
export async function syncSurveysWithServer(surveys: Survey[]): Promise<SyncResult> {
  const result: SyncResult = {
    successIds: [],
    failedIds: [],
  };

  if (!surveys || surveys.length === 0) {
    return result;
  }

  try {
    // Get authentication token
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Process each survey
    await Promise.all(
      surveys.map(async (survey) => {
        try {
          if (!survey.id) return;

          // Transform survey for API
          const surveyData = {
            id: survey.id,
            title: survey.title,
            description: survey.description,
            location: {
              latitude: survey.latitude,
              longitude: survey.longitude,
            },
            createdAt: survey.createdAt,
            // Parse images from JSON string
            images: survey.images ? JSON.parse(survey.images) : [],
          };

          // Send request to API
          await axios.post(`${API_URL}/upload`, surveyData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          // Mark as success
          result.successIds.push(survey.id);
        } catch (error) {
          console.error(`Failed to sync survey ${survey.id}:`, error);
          if (survey.id) {
            result.failedIds.push(survey.id);
          }
        }
      })
    );

    return result;
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

/**
 * Generic function to fetch data from API with loading and error states
 * @param {string} endpoint - API endpoint to fetch from
 * @returns {Promise<T>} - Data from API
 */
export async function fetchFromApi<T>(endpoint: string): Promise<T> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.get(`${API_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data as T;
  } catch (error) {
    console.error(`API fetch error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Custom hook for API data fetching
 * This replaces react-query with a simpler implementation
 */
export function useApiHook<T>(fetcher: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetcher();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  // Function to manually refetch data
  const refetch = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  return { data, isLoading, error, refetch };
}
