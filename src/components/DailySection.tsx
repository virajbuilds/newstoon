import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { getDailyGenerations } from '../lib/supabase';
import type { CartoonGeneration } from '../types';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link, useNavigate } from 'react-router-dom';

export default function DailySection() {
  const [dailyItems, setDailyItems] = useState<CartoonGeneration[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getDailyGenerations()
      .then(setDailyItems)
      .catch(console.error);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 px-4">Today's Top 10</h2>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="daily-swiper"
      >
        {dailyItems.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <Link 
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
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}