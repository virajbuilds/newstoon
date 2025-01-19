import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputSection from '../components/InputSection';
import ResultSection from '../components/ResultSection';
import DailySection from '../components/DailySection';
import AuthModal from '../components/AuthModal';
import UserMenu from '../components/UserMenu';
import { generateCartoonStory, generateCartoonImage, generateTitle } from '../lib/openai';
import { saveGenerationToSupabase } from '../lib/supabase';
import { onAuthStateChange, getCurrentUser } from '../lib/auth';
import { Toast } from '../components/Toast';
import type { User } from '@supabase/supabase-js';
import type { CartoonGeneration } from '../types';
import { Link } from 'react-router-dom';

export default function MainApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [storyPrompt, setStoryPrompt] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [generatingPhase, setGeneratingPhase] = useState<'story' | 'image' | 'title' | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then(setUser);
    const { data: { subscription } } = onAuthStateChange(setUser);
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (input: string) => {
    if (!input.trim()) {
      setError({
        open: true,
        message: 'Please enter some text or a URL to generate a cartoon.',
      });
      return;
    }
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setCurrentInput(input);
      setError({ open: false, message: '' });
      
      setIsLoading(true);
      setImageUrl(null);
      setStoryPrompt(null);
      setCurrentTitle('');
      
      // Generate story prompt
      setGeneratingPhase('story');
      const { originalPrompt, processedPrompt } = await generateCartoonStory(input);
      setStoryPrompt(originalPrompt);
      
      // Generate image
      setGeneratingPhase('image');
      const imageUrl = await generateCartoonImage(processedPrompt);
      setImageUrl(imageUrl);
      
      // Generate title
      setGeneratingPhase('title');
      const title = await generateTitle(input);
      setCurrentTitle(title);
      
      // Save generation
      try {
        const generation = {
          input_text: input,
          story_prompt: originalPrompt,
          image_url: imageUrl,
          title,
          actual_title: input
        };

        console.log('Saving generation:', generation);
        const saved = await saveGenerationToSupabase(generation);
        console.log('Generation saved:', saved);

        if (saved?.id) {
          navigate(`/cartoon/${saved.id}`);
        } else {
          throw new Error('Failed to get saved generation ID');
        }
      } catch (saveError) {
        console.error('Error saving generation:', saveError);
        setError({
          open: true,
          message: 'Generated successfully but failed to save. Please try again.',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError({
        open: true,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
      setGeneratingPhase(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex-1 flex justify-center">
          <img src="/logo.svg" alt="News2oon AI Logo" className="h-16" />
        </div>
        <div className="absolute right-4 top-4">
          {user && <UserMenu user={user} />}
        </div>
      </div>
      
      <p className="text-gray-600 mb-8">Turn News Stories into Editorial Cartoons Instantly</p>
      
      <InputSection onSubmit={handleSubmit} isLoading={isLoading} />
      
      <div className="mt-8 w-full flex justify-center">
        <ResultSection 
          imageUrl={imageUrl} 
          title={currentTitle}
          isLoading={isLoading}
          onRegenerate={() => handleSubmit(currentInput)}
          onRegenerateTitle={() => {
            setGeneratingPhase('title');
            generateTitle(currentInput)
              .then(setCurrentTitle)
              .catch(console.error)
              .finally(() => setGeneratingPhase(null));
          }}
          generatingPhase={generatingPhase}
        />
      </div>

      <DailySection />

      <Toast
        open={error.open}
        setOpen={(open) => setError({ ...error, open })}
        title="Error"
        description={error.message}
        type="error"
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}