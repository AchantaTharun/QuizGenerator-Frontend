import { useState, createContext, useContext } from 'react';

const ConfirmationDialogContext = createContext();

export const ConfirmationDialogProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Confirm Action',
    message: 'Are you sure you want to perform this action?',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const openDialog = (dialogConfig) => {
    setConfig({
      title: dialogConfig.title || 'Confirm Action',
      message: dialogConfig.message || 'Are you sure you want to perform this action?',
      onConfirm: dialogConfig.onConfirm || (() => {}),
      onCancel: dialogConfig.onCancel || (() => {})
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return (
    <ConfirmationDialogContext.Provider value={{ openDialog }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{config.title}</h3>
            <p className="text-gray-600 mb-6">{config.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  config.onCancel();
                  closeDialog();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  config.onConfirm();
                  closeDialog();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationDialogContext.Provider>
  );
};

export const useConfirmationDialog = () => {
  const context = useContext(ConfirmationDialogContext);
  if (!context) {
    throw new Error('useConfirmationDialog must be used within a ConfirmationDialogProvider');
  }
  return context;
};