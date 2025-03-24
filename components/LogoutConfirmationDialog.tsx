// LogoutConfirmationDialog.tsx
import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  darkMode: boolean;
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  darkMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className={`relative w-full max-w-md rounded-xl shadow-lg p-6 border transform transition-all
          ${darkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-800'}`}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`mb-4 p-3 rounded-full ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
            <AlertTriangle className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          
          {/* Title */}
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Confirm Logout
          </h3>
          
          {/* Message */}
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Are you sure you want to log out of your ZoomBotic account?
          </p>
          
          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition duration-200
                ${darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 
                      rounded-lg transition duration-200 flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationDialog;