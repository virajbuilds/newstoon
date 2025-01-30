import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCartoonById } from '../lib/supabase';
import type { CartoonGeneration } from '../types';

export default function CartoonDetail() {
  const { id } = useParams();
  const [cartoon, setCartoon] = useState<CartoonGeneration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getCartoonById(id)
        .then(setCartoon)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!cartoon) return <div>Cartoon not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{cartoon.actual_title || cartoon.title}</h1>
      <div className="aspect-square rounded-lg overflow-hidden mb-6">
        <img
          src={cartoon.image_url}
          alt={cartoon.title}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </div>
      <p className="text-gray-600">{cartoon.description}</p>
    </div>
  );
} 