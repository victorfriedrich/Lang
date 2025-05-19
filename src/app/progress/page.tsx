"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { useUnseenWords } from "../hooks/useUnseenWords";
import { useFetchTotalWordsKnown } from "../hooks/useFetchTotalWordsKnown";
import { useUniqueLearned } from "../hooks/useUniqueLearned";
import { useWordsKnownByDate } from "../hooks/useWordsKnownByDate";
import { useCategories } from "../hooks/useCategories";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";

import ProtectedRoute from "../components/ProtectedRoute";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import ProgressBar from "../components/ProgressBar";
import KnownWords from "../components/KnownWords";
import WordCategories from "../components/WordCategories";

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
  const [selectedView, setSelectedView] = useState("editVocabulary");
  const [underlineStyle, setUnderlineStyle] = useState({});
  const editRef = useRef(null);
  const addRef = useRef(null);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const { unseenWords, isLoading: unseenLoading, error: unseenError } =
    useUnseenWords();
  const {
    totalWordsKnown,
    isLoading: totalLoading,
    error: totalError,
  } = useFetchTotalWordsKnown();
  const {
    uniqueLearned,
    isLoading: uniqueLoading,
    error: uniqueError,
  } = useUniqueLearned();
  const {
    wordsKnownData,
    isLoading: wordsKnownLoading,
    error: wordsKnownError,
  } = useWordsKnownByDate();
  const { categories, isLoading: categoriesLoading } = useCategories("es");

  useLayoutEffect(() => {
    const updateUnderline = () => {
      const targetRef =
        selectedView === "editVocabulary" ? editRef : addRef;
      if (targetRef.current) {
        const { offsetLeft, offsetWidth } = targetRef.current;
        setUnderlineStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
          transition: "all 0.3s ease-in-out",
        });
      }
    };

    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [selectedView]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 320);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    setSelectedCategory(null);
    setSearchTerm("");
  }, [selectedView]);

  const chartData = useMemo(() => {
    const labels = wordsKnownData.map((item) => item.date);
    const data = wordsKnownData.map((item) =>
      Math.round(item.words_known)
    );

    const uniqueLabels = [...new Set(labels)];
    const uniqueData = uniqueLabels.map((date) => {
      const index = labels.indexOf(date);
      return data[index];
    });

    if (uniqueLabels.length === 1) {
      uniqueLabels.push(uniqueLabels[0]);
      uniqueData.push(uniqueData[0]);
    }

    return {
      labels: uniqueLabels,
      datasets: [
        {
          label: "Words Known",
          data: uniqueData,
          fill: true,
          backgroundColor: "rgba(60, 130, 250, 0.2)",
          borderColor: "rgb(60, 130, 250)",
          tension: 0,
        },
      ],
    };
  }, [wordsKnownData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 2,
          precision: 0,
          font: { size: 14 },
        },
        grid: { drawBorder: false },
      },
      x: {
        ticks: {
          font: { size: 14 },
          maxRotation: 0,
          autoSkip: false,
          padding: 10,
          align: "inner",
        },
        grid: { drawBorder: false },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: -10,
      },
    },
  };

  if (
    unseenLoading ||
    totalLoading ||
    uniqueLoading ||
    wordsKnownLoading
  )
    return <LoadingState />;
  if (
    unseenError ||
    totalError ||
    uniqueError ||
    wordsKnownError
  )
    return (
      <ErrorState
        message={
          unseenError ||
          totalError ||
          uniqueError ||
          wordsKnownError ||
          "An error occurred"
        }
      />
    );

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h1 className="text-3xl font-bold mb-6">Your Learning Progress</h1>

        {/* Stats Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="lg:w-1/2 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Words Learned Over Time</h2>
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="lg:w-1/2 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Total Words Known</h2>
              <p className="text-3xl mb-2 font-bold text-blue-600">
                {totalWordsKnown}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Words Learned</h2>
              <p className="text-3xl mb-2 font-bold text-blue-600">
                {uniqueLearned}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation and Search/Category Section */}
        <div className="">
          <div className="relative bg-white rounded-t-md py-2 flex justify-between items-center">
            <div className="flex space-x-8">
              <button
                ref={editRef}
                className={`py-2 px-4 font-semibold ${
                  selectedView === "editVocabulary"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setSelectedView("editVocabulary")}
              >
                Known Words
              </button>
              <button
                ref={addRef}
                className={`py-2 px-4 font-semibold ${
                  selectedView === "addNewWords"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setSelectedView("addNewWords")}
              >
                Add Common Words
              </button>
              <button
                onClick={() => router.push("/import")}
                className="py-2 px-4 font-semibold text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                Import
                <ArrowUpRight className="h-4 w-4 mt-0.5" />
              </button>
            </div>

            <div className="ml-auto mr-4">
              {selectedView === "editVocabulary" ? (
                <input
                  type="text"
                  placeholder="Search..."
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              ) : (
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={categoriesLoading}
                >
                  <option value="">Select Category</option>
                  {categories?.map((categoryObj) => (
                    <option key={categoryObj.category} value={categoryObj.category}>
                      {categoryObj.category}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div
              className="absolute bottom-0 h-0.5 bg-blue-600"
              style={underlineStyle}
            />
          </div>

          {/* Content Section */}
          <div className="border border-gray-200">
            {selectedView === "editVocabulary" ? (
              <KnownWords searchTerm={debouncedSearchTerm} />
            ) : (
              <WordCategories language="es" selectedCategory={selectedCategory} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProgressPage;
