'use client';

export default function CopyButton() {
  return (
    <button 
      onClick={() => navigator.clipboard.writeText('chrome://extensions')}
      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
    >
      Copy URL
    </button>
  );
}
