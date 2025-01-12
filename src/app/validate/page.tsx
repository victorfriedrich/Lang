"use client";

import React, { useContext } from 'react';
import InvalidWordsPage from '../components/WordValidation';
import { UserContext } from '@/context/UserContext';

export default function ValidationPage() {

  const { language } = useContext(UserContext);

  return (
    <InvalidWordsPage language={language?.name} />
  );
}
