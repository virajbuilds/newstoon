import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCartoon } from '../lib/supabase';
import { generateCartoonPrompt, generateCartoonImage } from '../lib/openai';
import LoadingSpinner from './LoadingSpinner';

export default function CreateCartoon() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setStatus('Generating cartoon description...');
      const prompt = await generateCartoonPrompt(title);
      
      setStatus('Creating cartoon image...');
      const imageUrl = await generateCartoonImage(prompt);
      
      setStatus('Saving cartoon...');
      const cartoon = await createCartoon({
        title,
        actual_title: title,
        description: prompt,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      });
      
      navigate(`/cartoon/${cartoon.id}`);
    } catch (error) {
      console.error(error);
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 px-4">
      <h2 className="text-2xl font-bold mb-6">Create New Cartoon</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            News Title or Description
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Cartoon'}
        </button>
        {loading && (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">{status}</p>
          </div>
        )}
      </form>
    </div>
  );
} 