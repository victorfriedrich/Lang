import React from 'react';
import { Search } from 'lucide-react';

interface VocabularyTableProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  words: any[];
  onWordClick: (word: any) => void;
  totalWordsCount: number;
  onLoadMore: () => void;
}

const VocabularyTable: React.FC<VocabularyTableProps> = ({ 
  searchTerm, 
  onSearch, 
  words, 
  onWordClick, 
  totalWordsCount, 
  onLoadMore 
}) => (
  <div className="bg-white rounded-lg shadow mt-6">
    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-900">Ready for Review</h2>
      <div className="relative w-48">
        <input
          type="text"
          placeholder="Search words..."
          className="w-full pl-7 pr-2 py-1 text-sm border rounded-md"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Word</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Translation</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">Days Until Review</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {words.map((item) => (
            <tr
              key={item.word_id}
              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
              onClick={() => onWordClick(item)}
            >
              <td className="whitespace-nowrap text-sm font-medium text-gray-900 py-2 px-4">
                <div>{item.word_root}</div>
                <div className="sm:hidden text-xs text-gray-500 mt-1">
                  {renderDueDate(item.daysUntilRepeat)}
                </div>
              </td>
              <td className="whitespace-nowrap text-sm text-gray-500 py-2 px-4">{item.translation}</td>
              <td className="whitespace-nowrap text-sm text-gray-500 py-2 px-4 text-right hidden sm:table-cell">
                {renderDueDate(item.daysUntilRepeat)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Updated Load More section */}
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {words.length} of {totalWordsCount} words</span>
        {words.length < totalWordsCount && (
          <button 
            onClick={onLoadMore}
            className="text-blue-600 hover:text-blue-800"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  </div>
);

const renderDueDate = (daysUntilRepeat: number | null) => {
  if (daysUntilRepeat === null) {
    return (
      <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-gray-800 text-white">
        Learned
      </span>
    );
  } else if (daysUntilRepeat === 0) {
    return (
      <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full bg-red-100 text-red-800">
        Due Today
      </span>
    );
  } else {
    return `${daysUntilRepeat}`;
  }
};

export default VocabularyTable;