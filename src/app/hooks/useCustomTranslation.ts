import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface CustomTranslationParams {
  customTranslation: string;
  userId: string;
  wordId: number;
}

export const useCustomTranslation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCustomTranslation = async ({
    customTranslation,
    userId,
    wordId,
  }: CustomTranslationParams) => {
    setIsLoading(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase URL or Anon Key is missing');
      setIsLoading(false);
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    try {
      let { data, error } = await supabase.rpc('add_custom_translation', {
        _custom_translation: customTranslation, 
        _user_id: userId, 
        _word_id: wordId
      });
      if (error) {
        console.error('Error adding custom translation:', error);
        setError(error.message);
      } else {
        console.log('Custom translation added successfully:', data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { addCustomTranslation, isLoading, error };
};
