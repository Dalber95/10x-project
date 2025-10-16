/**
 * Test Teardown Helper
 * Provides utilities for cleaning up test data from database
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/db/database.types';
import { TestConfig } from './test-config';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

/**
 * Create Supabase client for test cleanup operations
 * Uses service role key if available, otherwise uses anon key
 */
export function createTestSupabaseClient(): SupabaseClient {
  // Get values directly from process.env for better compatibility
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || TestConfig.supabase.url;
  const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || TestConfig.supabase.anonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase configuration is missing. Make sure SUPABASE_URL and SUPABASE_KEY are set in .env.test'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Delete all flashcards for a specific user
 * 
 * @param userId - The user ID whose flashcards should be deleted
 * @returns Number of deleted flashcards
 */
export async function deleteUserFlashcards(userId: string): Promise<number> {
  const supabase = createTestSupabaseClient();

  const { data, error } = await supabase
    .from('flashcards')
    .delete()
    .eq('user_id', userId)
    .select('id');

  if (error) {
    console.error('Error deleting flashcards:', error);
    throw error;
  }

  const deletedCount = data?.length || 0;
  console.log(`🧹 Deleted ${deletedCount} flashcards for user ${userId}`);
  return deletedCount;
}

/**
 * Delete all generations for a specific user
 * 
 * @param userId - The user ID whose generations should be deleted
 * @returns Number of deleted generations
 */
export async function deleteUserGenerations(userId: string): Promise<number> {
  const supabase = createTestSupabaseClient();

  const { data, error } = await supabase
    .from('generations')
    .delete()
    .eq('user_id', userId)
    .select('id');

  if (error) {
    console.error('Error deleting generations:', error);
    throw error;
  }

  const deletedCount = data?.length || 0;
  console.log(`🧹 Deleted ${deletedCount} generations for user ${userId}`);
  return deletedCount;
}

/**
 * Delete all generation error logs for a specific user
 * 
 * @param userId - The user ID whose error logs should be deleted
 * @returns Number of deleted error logs
 */
export async function deleteUserGenerationErrors(userId: string): Promise<number> {
  const supabase = createTestSupabaseClient();

  const { data, error } = await supabase
    .from('generation_error_logs')
    .delete()
    .eq('user_id', userId)
    .select('id');

  if (error) {
    console.error('Error deleting generation errors:', error);
    throw error;
  }

  const deletedCount = data?.length || 0;
  console.log(`🧹 Deleted ${deletedCount} generation error logs for user ${userId}`);
  return deletedCount;
}

/**
 * Clean up all test data for a specific user
 * Deletes flashcards, generations, and error logs in the correct order
 * 
 * @param userId - The user ID whose data should be cleaned
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  console.log(`\n🧹 Starting cleanup for user ${userId}...`);

  try {
    // Order matters: delete flashcards first (they reference generations)
    await deleteUserFlashcards(userId);
    await deleteUserGenerationErrors(userId);
    await deleteUserGenerations(userId);

    console.log('✅ Cleanup completed successfully\n');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

/**
 * Clean up test data created in the last N minutes
 * Useful for cleaning up after test runs without affecting other data
 * 
 * @param userId - The user ID whose recent data should be cleaned
 * @param minutesAgo - Delete data created in the last N minutes (default: 30)
 */
export async function cleanupRecentTestData(
  userId: string,
  minutesAgo: number = 30
): Promise<void> {
  const supabase = createTestSupabaseClient();
  const cutoffTime = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

  console.log(`\n🧹 Cleaning up data created after ${cutoffTime}...`);

  try {
    // Delete recent flashcards
    const { data: flashcards, error: fcError } = await supabase
      .from('flashcards')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', cutoffTime)
      .select('id');

    if (fcError) throw fcError;
    console.log(`🧹 Deleted ${flashcards?.length || 0} recent flashcards`);

    // Delete recent generations
    const { data: generations, error: genError } = await supabase
      .from('generations')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', cutoffTime)
      .select('id');

    if (genError) throw genError;
    console.log(`🧹 Deleted ${generations?.length || 0} recent generations`);

    console.log('✅ Recent data cleanup completed\n');
  } catch (error) {
    console.error('❌ Recent cleanup failed:', error);
    throw error;
  }
}

/**
 * Get count of test data for a user (for verification)
 * 
 * @param userId - The user ID to check
 * @returns Object with counts of flashcards and generations
 */
export async function getTestDataCount(userId: string): Promise<{
  flashcards: number;
  generations: number;
  errorLogs: number;
}> {
  const supabase = createTestSupabaseClient();

  const [flashcardsResult, generationsResult, errorLogsResult] = await Promise.all([
    supabase.from('flashcards').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('generations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('generation_error_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    flashcards: flashcardsResult.count || 0,
    generations: generationsResult.count || 0,
    errorLogs: errorLogsResult.count || 0,
  };
}

