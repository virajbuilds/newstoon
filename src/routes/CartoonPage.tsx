import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGenerationById } from '../lib/supabase';
import { shareService } from '../lib/services/share';
import { watermarkService } from '../lib/services/watermark';
import type { CartoonGeneration } from '../types';

export default function CartoonPage() {
  const { id } = useParams();
  const [cartoon, setCartoon] = React.useState<CartoonGeneration | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function loadCartoon() {
      if (!id) return;
      try {
        const data = await getGenerationById(id);
        if (data) {
          setCartoon(data);
        }
      } catch (error) {
        console.error('Error loading cartoon:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCartoon();
  }, [id]);

  const handleDownload = async () => {
    if (!cartoon?.image_url) return;
    try {
      const blob = await watermarkService.addWatermark(cartoon.image_url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cartoon.title}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleShare = async (platform: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin') => {
    if (!cartoon) return;
    try {
      await shareService.share({
        url: window.location.href,
        title: cartoon.actual_title || cartoon.title,
        text: `Check out this editorial cartoon: ${cartoon.title}`,
        image: cartoon.image_url
      }, platform);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!cartoon) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Cartoon not found</h1>
        <button 
          onClick={() => navigate('/')}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Return to home
        </button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
        >
          ← Back to home
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-2">
              {new Date(cartoon.created_at || '').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {cartoon.actual_title || cartoon.title}
            </h1>
            <img 
              src={cartoon.image_url} 
              alt={cartoon.title}
              className="w-full max-w-2xl mx-auto rounded-lg mb-6"
            />
            <p className="text-xl text-center font-comic text-gray-800">{cartoon.title}</p>
            
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => handleShare('whatsapp')}
                className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                title="Share on WhatsApp"
              >
                Share on WhatsApp
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                title="Share on Twitter"
              >
                Share on Twitter
              </button>
              <button
                onClick={handleDownload}
                className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                title="Download image"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}