import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center fade-in">
        <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6">404</h1>
        <h2 className="text-2xl md:text-3xl font-medium mb-8">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="btn btn-primary inline-flex items-center justify-center"
        >
          <Home size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;