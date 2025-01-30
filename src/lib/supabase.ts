import { createClient } from '@supabase/supabase-js';
import type { CartoonGeneration } from '../types';
import { getCurrentUser } from './auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const supabase = supabase;

export async function saveGenerationToSupabase(generation: Omit<CartoonGeneration, 'id' | 'created_at' | 'is_daily' | 'actual_title'>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('User must be authenticated to save generations');
    }

    console.log('Attempting to save generation for user:', user.id);
    console.log('Generation data:', generation);

    // Validate required fields
    if (!generation.input_text || !generation.story_prompt || !generation.image_url || !generation.title) {
      throw new Error('Missing required fields for generation');
    }

    const { data, error } = await supabase
      .from('generations')
      .insert([{
        user_id: user.id,
        input_text: generation.input_text,
        story_prompt: generation.story_prompt,
        image_url: generation.image_url,
        title: generation.title,
        actual_title: generation.input_text, // Use input_text as actual_title
        is_daily: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    console.log('Generation saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    // Re-throw the error to be handled by the caller
    throw error instanceof Error 
      ? error 
      : new Error('Failed to save generation to database');
  }
}

export async function getDailyGenerations() {
  const { data, error } = await supabase
    .from('cartoons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data as CartoonGeneration[];
}

export async function getRecentGenerations() {
  const { data, error } = await supabase
    .from('cartoons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) throw error;
  return data as CartoonGeneration[];
}

export async function getCartoonById(id: string) {
  const { data, error } = await supabase
    .from('cartoons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as CartoonGeneration;
}

export async function createCartoon(cartoon: Partial<CartoonGeneration>) {
  const { data, error } = await supabase
    .from('cartoons')
    .insert([cartoon])
    .select()
    .single();

  if (error) throw error;
  return data as CartoonGeneration;
}

export async function getGenerationById(id: string) {
  try {
    const { data, error } = await supabase
      .from('generations')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching generation:', error);
    return null;
  }
}