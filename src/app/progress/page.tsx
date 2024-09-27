"use client"

import React, { useMemo } from 'react';
import { useUnseenWords } from '../hooks/useUnseenWords';
import { useFetchTotalWordsKnown } from '../hooks/useFetchTotalWordsKnown';
import { useUniqueLearned } from '../hooks/useUniqueLearned';
import { useRecallEfficiency } from '../hooks/useRecallEfficiency';
import { useWordsKnownByDate } from '../hooks/useWordsKnownByDate';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import NewWordsTable from '../components/NewWordsTable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const ProgressPage = () => {
  const { unseenWords, isLoading: unseenLoading, error: unseenError } = useUnseenWords();
  const { totalWordsKnown, isLoading: totalLoading, error: totalError } = useFetchTotalWordsKnown();
  const { uniqueLearned, isLoading: uniqueLoading, error: uniqueError } = useUniqueLearned();
  const { recallEfficiency, isLoading: recallLoading, error: recallError } = useRecallEfficiency();
  const { wordsKnownData, isLoading: wordsKnownLoading, error: wordsKnownError } = useWordsKnownByDate();

  const chartData = useMemo(() => {
    const labels = wordsKnownData.map(item => item.date);
    const data = wordsKnownData.map(item => Math.round(item.words_known));

    // If there's only one data point, add a duplicate to create a flat line
    if (labels.length === 1) {
      labels.push(labels[0]);
      data.push(data[0]);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Words Known',
          data,
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          tension: 0,
        },
      ],
    };
  }, [wordsKnownData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Your Learning Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  const handleWordAdded = () => {
    console.log('Word added to vocabulary');
  };

  if (unseenLoading || totalLoading || uniqueLoading || recallLoading || wordsKnownLoading) return <LoadingState />;
  if (unseenError || totalError || uniqueError || recallError || wordsKnownError) return <ErrorState message={unseenError || totalError || uniqueError || recallError || wordsKnownError || 'An error occurred'} />;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Learning Progress</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 bg-white p-4 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Words Learned Over Time</h2>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="lg:w-1/3 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Total Words Known</h2>
              <p className="text-3xl font-bold text-blue-600">{totalWordsKnown}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Words Learned</h2>
              <p className="text-3xl font-bold text-blue-600">{uniqueLearned}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Learning Efficiency</h2>
              <p className="text-3xl font-bold text-blue-600">
                {recallEfficiency !== null ? `${Math.round(recallEfficiency)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <NewWordsTable words={unseenWords.slice(0, 5)} onWordAdded={handleWordAdded} />
      </div>
    </ProtectedRoute>
  );
};

export default ProgressPage;