import React, { useState } from 'react';
import { X, Download, ExternalLink, Share2 } from 'lucide-react';
import { shareService } from '../lib/services/share';
import type { SharePlatform } from '../lib/services/share';

interface ImageModalProps {
  imageUrl: string;
  title: string;
  actualTitle?: string;
  date?: string;
  sourceUrl?: string;
  onClose: () => void;
  onDownload: () => void;
}

export default function ImageModal({
  imageUrl,
  title,
  actualTitle,
  date,
  sourceUrl,
  onClose,
  onDownload
}: ImageModalProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleShare = async (platform: SharePlatform) => {
    try {
      await shareService.share({
        url: sourceUrl || window.location.href,
        title: actualTitle || title,
        text: `Check out this editorial cartoon: ${title}`,
        image: imageUrl
      }, platform);
      setShowShareMenu(false);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-2xl">
        <div className="p-6 pb-3 border-b border-gray-100">
          {date && (
            <p className="text-sm text-gray-500 mb-2">{date}</p>
          )}
          {actualTitle && (
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">{actualTitle}</h2>
          )}
        </div>
        <div className="px-6 py-4 relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
            crossOrigin="anonymous"
          />
          <p className="mt-4 text-center font-comic text-xl text-gray-800">{title}</p>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-center gap-4">
          {sourceUrl && (
            <button
              onClick={() => window.open(sourceUrl, '_blank')}
              className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
              title="View original article"
            >
              <ExternalLink className="w-6 h-6 text-gray-700" />
            </button>
          )}
          <button
            onClick={onDownload}
            className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
            title="Download image"
          >
            <Download className="w-6 h-6 text-gray-700" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
              title="Share"
            >
              <Share2 className="w-6 h-6 text-gray-700" />
            </button>
            {showShareMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                >
                  LinkedIn
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
            title="Close"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}