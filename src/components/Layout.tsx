import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { signInWithGoogle, signOut } from '../lib/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-900">
            News2toon AI
          </Link>
          <div>
            {!loading && (
              user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign In with Google
                </button>
              )
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 