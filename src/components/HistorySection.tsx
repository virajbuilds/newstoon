import React from 'react';
import type { CartoonGeneration } from '../lib/db';

interface HistorySectionProps {
  generations: CartoonGeneration[];
}

export default function HistorySection({ generations }: HistorySectionProps) {
  return (
    <div className="w-full max-w-3xl mt-12">
      <h2 className="text-2xl font-bold mb-6">Generation History</h2>
      <div className="space-y-6">
        {generations.map((gen) => (
          <div key={gen.id} className="bg-gray-50 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Input:</h3>
              <p className="text-gray-700">{gen.input_text}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Story Prompt:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{gen.story_prompt}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Generated Image:</h3>
              <img 
                src={gen.image_url} 
                alt="Generated cartoon" 
                className="rounded-lg max-h-[300px] object-contain"
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Generated at: {new Date(gen.created_at!).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}