import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Toast } from './Toast';

interface ResultSectionProps {
  imageUrl: string | null;
  title: string;
  isLoading: boolean;
  onRegenerate: () => void;
  onRegenerateTitle: () => void;
  generatingPhase: 'story' | 'image' | 'title' | null;
}

export default function ResultSection({ 
  imageUrl, 
  title,
  isLoading, 
  onRegenerate,
  onRegenerateTitle,
  generatingPhase 
}: ResultSectionProps) {
  const [downloadError, setDownloadError] = React.useState<boolean>(false);
  const [imageError, setImageError] = React.useState<boolean>(false);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      console.log('Attempting to download image:', imageUrl);
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.error('Failed to fetch image for download:', response.status, response.statusText);
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'news2toon-cartoon.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('Image downloaded successfully');
      setDownloadError(false);
    } catch (error) {
      console.error('Error downloading image:', error);
      setDownloadError(true);
    }
  };

  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
    
    // Retry loading image up to 3 times
    if (retryCount < 3 && imageRef.current) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.src = `${imageUrl}?retry=${retryCount + 1}`;
        }
      }, 1000 * (retryCount + 1));
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
    setRetryCount(0);
  };

  if (!isLoading && !imageUrl) return null;

  return (
    <div className="w-full max-w-3xl">
      {title && !isLoading && (
        <div className="mb-6 flex items-center justify-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onRegenerateTitle}
            disabled={generatingPhase === 'title'}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            title="Regenerate title"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="bg-gray-100 rounded-lg relative min-h-[400px] flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-center px-4">
              {generatingPhase === 'story' && 'Generating your story...'}
              {generatingPhase === 'image' && 'Now generating your image, please wait...'}
              {generatingPhase === 'title' && 'Creating a witty title...'}
            </p>
            {generatingPhase === 'image' && (
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-indigo-600 rounded-full animate-progress"></div>
              </div>
            )}
          </div>
        ) : imageUrl ? (
          <>
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Generated cartoon"
              className="rounded-lg max-w-full max-h-[600px] object-contain"
              onError={handleImageError}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={onRegenerate}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                title="Regenerate image"
              >
                <RefreshCw className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                title="Download image"
              >
                <Download className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </>
        ) : null}
      </div>
      
      <Toast
        open={downloadError}
        setOpen={setDownloadError}
        title="Download Failed"
        description="Failed to download image. Please try again or right-click the image and select 'Save image as...'"
        type="error"
      />

      <Toast
        open={imageError && retryCount >= 3}
        setOpen={setImageError}
        title="Image Loading Failed"
        description="Failed to load the generated image. Please try regenerating or try a different prompt."
        type="error"
      />
    </div>
  );
}