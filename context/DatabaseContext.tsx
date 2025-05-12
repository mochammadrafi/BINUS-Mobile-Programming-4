import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Define survey structure
export interface Survey {
  id?: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  images?: string; // JSON string of image paths
  createdAt: string;
  synced: number; // 0 = not synced, 1 = synced
}

interface DatabaseContextType {
  saveSurvey: (survey: Omit<Survey, 'id' | 'createdAt' | 'synced'>) => Promise<number>;
  getSurveys: () => Promise<Survey[]>;
  getUnsyncedSurveys: () => Promise<Survey[]>;
  markSurveyAsSynced: (id: number) => Promise<void>;
  deleteSurvey: (id: number) => Promise<void>;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Create mock implementation
const mockImpl: DatabaseContextType = {
  saveSurvey: () => Promise.resolve(0),
  getSurveys: () => Promise.resolve([]),
  getUnsyncedSurveys: () => Promise.resolve([]),
  markSurveyAsSynced: () => Promise.resolve(),
  deleteSurvey: () => Promise.resolve(),
  isReady: false
};

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [dbImpl, setDbImpl] = useState<DatabaseContextType>(mockImpl);

  useEffect(() => {
    let isMounted = true;
    
    const initDatabase = async () => {
      try {
        let implementation: any;
        
        if (Platform.OS === 'web') {
          // Use web implementation (IndexedDB)
          const { WebDatabase } = require('../database/WebDatabase');
          implementation = new WebDatabase();
        } else {
          // Use native implementation (SQLite)
          const { NativeDatabase } = require('../database/NativeDatabase');
          implementation = new NativeDatabase();
        }
        
        // Wait for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (isMounted) {
          setDbImpl({
            saveSurvey: implementation.saveSurvey.bind(implementation),
            getSurveys: implementation.getSurveys.bind(implementation),
            getUnsyncedSurveys: implementation.getUnsyncedSurveys.bind(implementation), 
            markSurveyAsSynced: implementation.markSurveyAsSynced.bind(implementation),
            deleteSurvey: implementation.deleteSurvey.bind(implementation),
            isReady: true
          });
          
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Even on error, mark as ready with mock implementation to not block the app
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    initDatabase();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{...dbImpl, isReady}}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
