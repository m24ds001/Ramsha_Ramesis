/**
 * Script to apply database migrations
 * 
 * Usage:
 * node apply-migrations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pool } from './server/db';

// Get the directory name using ES modules pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigrations() {
  try {
    console.log('Starting database migration process...');
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure files are processed in order
    
    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
    console.log(`Found ${migrationFiles.length} migration files to process.`);
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Get already applied migrations
    const { rows: appliedMigrations } = await pool.query(
      'SELECT name FROM migrations'
    );
    const appliedMigrationNames = new Set(appliedMigrations.map(m => m.name));
    
    // Apply new migrations
    for (const file of migrationFiles) {
      if (appliedMigrationNames.has(file)) {
        console.log(`Migration ${file} already applied, skipping.`);
        continue;
      }
      
      console.log(`Applying migration: ${file}`);
      
      // Read migration file
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Apply migration
        await client.query(sql);
        
        // Record migration as applied
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        
        await client.query('COMMIT');
        console.log(`Successfully applied migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }
    
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Error during migration process:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
applyMigrations();