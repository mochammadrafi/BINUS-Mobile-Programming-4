import { Survey } from '@/context/DatabaseContext';

export class WebDatabase {
  private dbName = 'surveyDB';
  private storeName = 'surveys';
  private db: IDBDatabase | null = null;
  private dbInitialized = false;
  private initPromise: Promise<void> | null = null;
  
  constructor() {
    this.initPromise = this.initDatabase();
  }

  private initDatabase(): Promise<void> {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported by this browser');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, 1);
        
        request.onerror = (event) => {
          console.error('IndexedDB error:', event);
          reject('Error opening database');
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.dbInitialized = true;
          resolve();
        };

        request.onupgradeneeded = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Create an objectStore for this database
            if (!db.objectStoreNames.contains(this.storeName)) {
              const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
              
              // Define the structure of our data
              objectStore.createIndex('title', 'title', { unique: false });
              objectStore.createIndex('createdAt', 'createdAt', { unique: false });
              objectStore.createIndex('synced', 'synced', { unique: false });
            }
          } catch (error) {
            console.error('Error upgrading database:', error);
          }
        };
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
        resolve(); // Resolve anyway to prevent app from crashing
      }
    });
  }

  private async ensureDbConnection(): Promise<IDBDatabase | null> {
    if (this.initPromise) {
      await this.initPromise;
    }
    
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported by this browser');
      return null;
    }

    if (this.db && this.dbInitialized) {
      return this.db;
    }
    
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, 1);
        
        request.onerror = (event) => {
          console.error('Error opening database:', event);
          resolve(null);
        };
        
        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.dbInitialized = true;
          resolve(this.db);
        };
      } catch (error) {
        console.error('Error ensuring DB connection:', error);
        resolve(null);
      }
    });
  }

  // Save new survey
  async saveSurvey(survey: Omit<Survey, 'id' | 'createdAt' | 'synced'>): Promise<number> {
    const db = await this.ensureDbConnection();
    
    if (!db) {
      console.warn('Using fallback in-memory storage for web');
      const id = Math.floor(Math.random() * 10000);
      // Store in local storage as fallback
      const surveys = this.getLocalStorageSurveys();
      const newSurvey = {
        ...survey,
        id,
        createdAt: new Date().toISOString(),
        synced: 0
      };
      surveys.push(newSurvey);
      this.saveLocalStorageSurveys(surveys);
      return Promise.resolve(id);
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const surveyWithTimestamp = {
          ...survey,
          createdAt: new Date().toISOString(),
          synced: 0
        };
        
        const request = store.add(surveyWithTimestamp);
        
        request.onsuccess = () => {
          resolve(request.result as number);
        };
        
        request.onerror = (event) => {
          console.error('Error saving survey:', event);
          reject('Error saving survey');
        };
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }

  // Get all surveys
  async getSurveys(): Promise<Survey[]> {
    const db = await this.ensureDbConnection();
    
    if (!db) {
      console.warn('Using fallback in-memory storage for web');
      return Promise.resolve(this.getLocalStorageSurveys());
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const surveys = request.result as Survey[];
          // Sort by createdAt in descending order
          surveys.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          resolve(surveys);
        };
        
        request.onerror = (event) => {
          console.error('Error fetching surveys:', event);
          reject('Error fetching surveys');
        };
      } catch (error) {
        console.error('Transaction error:', error);
        resolve([]); // Return empty array on error to prevent app crash
      }
    });
  }

  // Get unsynced surveys
  async getUnsyncedSurveys(): Promise<Survey[]> {
    const db = await this.ensureDbConnection();
    
    if (!db) {
      console.warn('Using fallback in-memory storage for web');
      const surveys = this.getLocalStorageSurveys();
      return Promise.resolve(surveys.filter(s => s.synced === 0));
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('synced');
        const request = index.getAll(IDBKeyRange.only(0)); // Get all with synced=0
        
        request.onsuccess = () => {
          resolve(request.result as Survey[]);
        };
        
        request.onerror = (event) => {
          console.error('Error fetching unsynced surveys:', event);
          reject('Error fetching unsynced surveys');
        };
      } catch (error) {
        console.error('Transaction error:', error);
        resolve([]); // Return empty array on error to prevent app crash
      }
    });
  }

  // Mark survey as synced
  async markSurveyAsSynced(id: number): Promise<void> {
    const db = await this.ensureDbConnection();
    
    if (!db) {
      console.warn('Using fallback in-memory storage for web');
      const surveys = this.getLocalStorageSurveys();
      const surveyIndex = surveys.findIndex(s => s.id === id);
      if (surveyIndex !== -1) {
        surveys[surveyIndex].synced = 1;
        this.saveLocalStorageSurveys(surveys);
      }
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // First get the survey
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          const survey = getRequest.result;
          if (!survey) {
            reject(`Survey with ID ${id} not found`);
            return;
          }
          
          // Update the synced status
          survey.synced = 1;
          
          // Put the updated object back
          const updateRequest = store.put(survey);
          
          updateRequest.onsuccess = () => {
            resolve();
          };
          
          updateRequest.onerror = (event) => {
            console.error('Error updating survey sync status:', event);
            reject('Error updating survey sync status');
          };
        };
        
        getRequest.onerror = (event) => {
          console.error('Error fetching survey to update:', event);
          reject('Error fetching survey to update sync status');
        };
      } catch (error) {
        console.error('Transaction error:', error);
        resolve(); // Resolve anyway to prevent app crashes
      }
    });
  }

  // Delete survey
  async deleteSurvey(id: number): Promise<void> {
    const db = await this.ensureDbConnection();
    
    if (!db) {
      console.warn('Using fallback in-memory storage for web');
      const surveys = this.getLocalStorageSurveys();
      const surveyIndex = surveys.findIndex(s => s.id === id);
      if (surveyIndex !== -1) {
        surveys.splice(surveyIndex, 1);
        this.saveLocalStorageSurveys(surveys);
      }
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('Error deleting survey:', event);
          reject('Error deleting survey');
        };
      } catch (error) {
        console.error('Transaction error:', error);
        resolve(); // Resolve anyway to prevent app crashes
      }
    });
  }

  // Local storage fallback methods for browsers without IndexedDB
  private getLocalStorageSurveys(): Survey[] {
    try {
      const surveys = localStorage.getItem('surveys');
      return surveys ? JSON.parse(surveys) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  private saveLocalStorageSurveys(surveys: Survey[]): void {
    try {
      localStorage.setItem('surveys', JSON.stringify(surveys));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }
}
