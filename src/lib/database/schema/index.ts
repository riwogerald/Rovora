// Export all schema tables for easy importing
export * from './auth';
export * from './games';
export * from './codex';
export * from './social';
export * from './reviews';

// Re-export commonly used types
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';