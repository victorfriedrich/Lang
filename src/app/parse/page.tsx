'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, Youtube } from 'lucide-react';

interface ParsedResult {
  message: string;
  parsed_json: any;
}

const UrlParser: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [inputMode, setInputMode] = useState<'text' | 'video'>('text');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isValidYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const escapeSpecialChars = (str: string): string => {
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m] || m;
    });
  };

  const parseInput = async (inputToParse: string): Promise<void> => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let textToSend: string;

      if (inputMode === 'video') {
        if (!isValidYoutubeUrl(inputToParse)) {
          throw new Error('Invalid YouTube URL. Please enter a valid YouTube URL.');
        }
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const videoResponse = await fetch(`${API_URL}/api/process-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputToParse }),
        });
        if (!videoResponse.ok) throw new Error('Failed to process video');
        const videoResult = await videoResponse.json();
        setSuccess(`Video processing started for ID: ${videoResult.video_id}`);
        return;
      } else {
        textToSend = escapeSpecialChars(inputToParse);
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const parseResponse = await fetch(`${API_URL}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      });

      if (!parseResponse.ok) throw new Error('Failed to parse text');

      const result: ParsedResult = await parseResponse.json();
      setSuccess('Text successfully parsed and saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the input.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (input && (inputMode === 'video' || inputMode === 'text')) {
      timeoutRef.current = setTimeout(() => {
        parseInput(input);
      }, 1000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [input, inputMode]);

  const handleManualSubmit = () => {
    if (input) {
      parseInput(input);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">What do you want to watch?</h2>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setInputMode('text')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
              inputMode === 'text'
                ? 'bg-gray-300 text-gray-800'
                : 'bg-transparent text-gray-700 hover:bg-gray-200'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setInputMode('video')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
              inputMode === 'video'
                ? 'bg-gray-300 text-gray-800'
                : 'bg-transparent text-gray-700 hover:bg-gray-200'
            }`}
          >
            Video
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            {inputMode === 'video' ? (
              <Youtube className="h-5 w-5 text-gray-400" />
            ) : (
              <FileText className="h-5 w-5 text-gray-400" />
            )}
          </div>
          {inputMode === 'text' ? (
            <textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-300 focus:ring-0 py-2 pl-10 pr-10 h-32 outline-none"
              placeholder="Enter your text here..."
            />
          ) : (
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-md focus:border-gray-300 focus:ring-0 py-2 pl-10 pr-10 outline-none"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          )}
          {isLoading && inputMode === 'video' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        {inputMode === 'text' && (
          <div className="flex justify-end">
            <button
              onClick={handleManualSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2 text-gray-300" />
                  Parsing...
                </>
              ) : (
                'Parse Text'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlParser;