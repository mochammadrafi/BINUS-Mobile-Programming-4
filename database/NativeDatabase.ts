import { Survey } from '@/context/DatabaseContext';
import * as SQLite from 'expo-sqlite';

export class NativeDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbInitialized = false;
  private dbInitPromise: Promise<void>;
  
  constructor() {
    this.dbInitPromise = this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    try {
      console.log('Initializing SQLite database...');
      // Open the database
      this.db = await SQLite.openDatabaseAsync('survey.db');
      
      // Create the surveys table if it doesn't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS surveys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          images TEXT,
          createdAt TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        );
      `);
      
      console.log('Database initialized successfully');
      this.dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Ensure DB is initialized before operations
  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbInitialized) {
      await this.dbInitPromise.catch(err => {
        console.error('Error during database initialization:', err);
        throw new Error('Database initialization failed');
      });
    }
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    return this.db;
  }

  // Save new survey
  async saveSurvey(survey: Omit<Survey, 'id' | 'createdAt' | 'synced'>): Promise<number> {
    try {
      const db = await this.getDb();
      const createdAt = new Date().toISOString();
      
      const result = await db.runAsync(
        `INSERT INTO surveys (title, description, latitude, longitude, images, createdAt, synced)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        survey.title,
        survey.description,
        survey.latitude,
        survey.longitude,
        survey.images || '',
        createdAt
      );
      
      return result.lastInsertRowId || 0;
    } catch (error) {
      console.error('Error saving survey:', error);
      throw error;
    }
  }

  // Get all surveys
  async getSurveys(): Promise<Survey[]> {
    try {
      const db = await this.getDb();
      console.log('Getting all surveys...');
      const surveys = await db.getAllAsync('SELECT * FROM surveys ORDER BY createdAt DESC');
      console.log(`Found ${surveys.length} surveys`);
      return surveys as Survey[];
    } catch (error) {
      console.error('Error getting surveys:', error);
      return [];
    }
  }

  // Get unsynced surveys
  async getUnsyncedSurveys(): Promise<Survey[]> {
    try {
      const db = await this.getDb();
      const surveys = await db.getAllAsync('SELECT * FROM surveys WHERE synced = 0');
      return surveys as Survey[];
    } catch (error) {
      console.error('Error getting unsynced surveys:', error);
      return [];
    }
  }

  // Mark survey as synced
  async markSurveyAsSynced(id: number): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync('UPDATE surveys SET synced = 1 WHERE id = ?', id);
    } catch (error) {
      console.error('Error marking survey as synced:', error);
    }
  }

  // Delete survey
  async deleteSurvey(id: number): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync('DELETE FROM surveys WHERE id = ?', id);
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  }
}
