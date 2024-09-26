import React from 'react';

interface ErrorStateProps {
  message: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => (
  <div className="text-center text-red-500 mt-8">{message}</div>
);

export default ErrorState;