import OpenAI from 'openai';
import { supabase } from './supabase';
import { generateImage } from './imageProviders';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function getPromptFromSupabase(name: string) {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('content')
      .eq('name', name)
      .single();

    if (error) throw error;
    return data?.content;
  } catch (error) {
    console.warn('Using fallback prompt:', error);
    const defaultPrompts = {
      story: `Create a witty editorial cartoon scene that captures the essence of the story. Use visual metaphors and symbolism to convey the message clearly and cleverly. Keep it simple, clean, and family-friendly.`,
      title: `Create a clever, catchy title for this editorial cartoon in 5-7 words. Use wordplay or cultural references when appropriate while keeping it accessible and family-friendly.`
    };
    return defaultPrompts[name as keyof typeof defaultPrompts];
  }
}

export async function generateCartoonPrompt(newsTitle: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert editorial cartoonist. Create a detailed description for an editorial cartoon based on the news title provided."
      },
      {
        role: "user",
        content: `Create a detailed editorial cartoon description for this news: ${newsTitle}`
      }
    ],
    temperature: 0.7,
    max_tokens: 200
  });

  return completion.choices[0].message.content;
}

export async function generateCartoonImage(prompt: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
}

export const generateCartoonStory = async (content: string) => {
  if (!content.trim()) {
    throw new Error('Please provide content to generate a story');
  }

  try {
    const storyPrompt = await getPromptFromSupabase('story');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: storyPrompt || ''
      },
      {
        role: "user", 
        content: content
      }],
      max_tokens: 200,
      temperature: 0.8
    });

    const generatedPrompt = response.choices[0].message.content;
    if (!generatedPrompt) {
      throw new Error('Failed to generate story prompt');
    }

    console.log('Generated story prompt:', generatedPrompt);
    return {
      originalPrompt: generatedPrompt,
      processedPrompt: generatedPrompt
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
    }
    console.error('Story generation error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate story'
    );
  }
};

export const generateTitle = async (content: string) => {
  if (!content.trim()) {
    throw new Error('Content required for title generation');
  }

  try {
    const titlePrompt = await getPromptFromSupabase('title');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: `${titlePrompt}\n\nContent: ${content}`
      }],
      max_tokens: 50,
      temperature: 0.7
    });

    const title = response.choices[0].message.content?.trim();
    if (!title) {
      throw new Error('Failed to generate title');
    }

    return title;
  } catch (error) {
    console.error('Title generation error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to generate title'
    );
  }
};