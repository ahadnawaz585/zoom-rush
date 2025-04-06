// components/HOC/withUserEnabled.tsx
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { getUserById } from '@/lib/firebase/users';
import { UserData } from '@/lib/firebase/users';
import { Loader2 } from 'lucide-react';

// HOC function
export const withUserEnabled = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const ComponentWithUserEnabled: React.FC<P> = (props) => {
    const [isUserEnabled, setIsUserEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkUserStatus = async () => {
        try {
          const userId = Cookies.get('session');
          
          if (!userId) {
            setIsUserEnabled(false);
            setLoading(false);
            return;
          }

          const user = await getUserById(userId);
          
          // Check if user exists and is either disabled or deleted
          if (!user || user.isDeleted || !user.isAllowed) {
            // Remove both session cookies
            Cookies.remove('session');
            Cookies.remove('adminSession');
            // Reload the page
            window.location.reload();
            return;
          }

          // If user is valid and enabled
          setIsUserEnabled(true);
        } catch (error) {
          console.error('Error checking user status:', error);
          // On error, assume user is invalid and clear cookies
          Cookies.remove('session');
          Cookies.remove('adminSession');
          window.location.reload();
        } finally {
          setLoading(false);
        }
      };

      checkUserStatus();
    }, []);

    if (loading) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-50 z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-12 w-12 text-blue-500 dark:text-blue-400 animate-spin" />
            <span className="text-gray-700 dark:text-gray-300">Loading...</span>
          </div>
        </div>
      );
    }

    return isUserEnabled ? <WrappedComponent {...props} /> : null;
  };

  ComponentWithUserEnabled.displayName = `WithUserEnabled(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ComponentWithUserEnabled;
};

// Example usage:
// components/MyComponent.tsx
interface MyComponentProps {
  message: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ message }) => {
  return <div>{message}</div>;
};

export const ProtectedMyComponent = withUserEnabled(MyComponent);

// pages/index.tsx
const HomePage: React.FC = () => {
  return (
    <ProtectedMyComponent 
      message="This will only show if user is enabled"
    />
  );
};