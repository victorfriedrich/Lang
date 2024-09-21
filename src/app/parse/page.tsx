'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Link, FileText } from 'lucide-react';

interface ParsedResult {
  message: string;
  parsed_json: any;
}

interface UrlParserProps {
  onParsed?: (result: ParsedResult) => void;
}

const UrlParser: React.FC<UrlParserProps> = ({ onParsed }) => {
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [inputMode, setInputMode] = useState<'article' | 'text'>('article');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isValidUrl = (url: string): boolean => {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(url);
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

      if (inputMode === 'article') {
        if (!isValidUrl(inputToParse)) {
          throw new Error('Invalid URL. Please enter a valid URL.');
        }
        const readerResponse = await fetch(`https://cors-anywhere.herokuapp.com/https://reader.tuananh.net/?url=${encodeURIComponent(inputToParse)}`);
        if (!readerResponse.ok) throw new Error('Failed to fetch article content');
        textToSend = await readerResponse.text();
      } else {
        textToSend = escapeSpecialChars(inputToParse);
      }

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const parseResponse = await fetch(`${API_URL}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      });

      if (!parseResponse.ok) throw new Error('Failed to parse text');

      const result: ParsedResult = await parseResponse.json();
      setSuccess('Text successfully parsed and saved.');
      if (onParsed) {
        onParsed(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the input.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (input && inputMode === 'article') {
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
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md"> {/* Increased shadow */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">What do you want to read?</h2>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setInputMode('article')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
              inputMode === 'article'
                ? 'bg-gray-300 text-gray-800'
                : 'bg-transparent text-gray-700 hover:bg-gray-200'
            }`}
          >
            Article
          </button>
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
        </div>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            {inputMode === 'article' ? (
              <Link className="h-5 w-5 text-gray-400" />
            ) : (
              <FileText className="h-5 w-5 text-gray-400" />
            )}
          </div>
          {inputMode === 'article' ? (
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-md focus:border-gray-300 focus:ring-0 py-2 pl-10 pr-10 outline-none" // Removed blue focus, added outline-none
              placeholder="https://example.com"
            />
          ) : (
            <textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-300 focus:ring-0 py-2 pl-10 pr-10 h-32 outline-none" // Removed blue focus, added outline-none
              placeholder="Enter your text here..."
            />
          )}
          {isLoading && inputMode === 'article' && (
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

export default UrlParser