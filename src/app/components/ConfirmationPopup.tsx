import React, { useEffect } from 'react';

interface ConfirmationPopupProps {
  count: number;
  onClose: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ count, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-white text-slate-700 px-4 py-3 rounded shadow-lg z-50 transition-opacity duration-300">
      <p>{count} {count === 1 ? 'word' : 'words'} added to learning set</p>
      <p>Practice {count === 1 ? 'it' : 'them'} <a href="/practice" className="text-blue-500 hover:text-blue-600 underline underline-offset-2">here</a></p>
    </div>
  );
};

export default ConfirmationPopup;