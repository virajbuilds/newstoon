import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecentGenerations } from '../lib/supabase';
import type { CartoonGeneration } from '../types';

export default function RecentSection() {
  const [recentItems, setRecentItems] = useState<CartoonGeneration[]>([]);

  useEffect(() => {
    getRecentGenerations()
      .then(setRecentItems)
      .catch(console.error);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 px-4">Recent Cartoons</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {recentItems.map((item) => (
          <Link
            key={item.id}
            to={`/cartoon/${item.id}`}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer block"
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-4">
              <p className="text-white text-sm line-clamp-2">
                {item.actual_title || item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 