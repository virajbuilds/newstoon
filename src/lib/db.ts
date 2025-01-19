import type { CartoonGeneration } from '../types';

// Simplified version for static deployment
export async function initDb() {
  // No-op for static deployment
}

export async function saveGeneration(generation: Omit<CartoonGeneration, 'id' | 'created_at'>) {
  // No-op for static deployment
  console.log('Generation saved locally:', generation);
}