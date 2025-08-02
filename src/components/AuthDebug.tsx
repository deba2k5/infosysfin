import React from 'react';
import { useAuth } from './AuthProvider';

const AuthDebug: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4 bg-yellow-100 text-yellow-800">Loading...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 text-gray-800 text-sm">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <p>User: {user ? JSON.stringify(user) : 'null'}</p>
      <p>Loading: {loading.toString()}</p>
      <p>localStorage: {localStorage.getItem('krishakSure_user') || 'null'}</p>
    </div>
  );
};

export default AuthDebug; 