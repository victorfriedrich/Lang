"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseclient';

function InvalidWordsPage({ language }) {
    const [words, setWords] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
    const [page, setPage] = useState(1);
    const [isEditing, setIsEditing] = useState({});
    const [editedRoots, setEditedRoots] = useState({});

    const itemsPerPage = 30;

    const fetchWords = async () => {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('language', language)
            .eq('translation', 'invalid')
            .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        if (error) console.error('Error fetching words:', error);
        else setWords(data);
    };

    useEffect(() => {
        fetchWords();
    }, [page]);

    const handleSelectWord = useCallback((index, id, event) => {
        // Prevent text selection when shift-clicking
        if (event.shiftKey) {
            event.preventDefault();
        }

        if (event.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelection = words.slice(start, end + 1).map(word => word.id);
            setSelectedWords(prev => Array.from(new Set([...prev, ...newSelection])));
        } else {
            setSelectedWords(prev => {
                if (prev.includes(id)) {
                    return prev.filter(wordId => wordId !== id);
                } else {
                    return [...prev, id];
                }
            });
        }
        setLastSelectedIndex(index);
    }, [lastSelectedIndex, words]);

    const handleEditRoot = (id, root) => {
        setEditedRoots((prevRoots) => ({
            ...prevRoots,
            [id]: root,
        }));
        setIsEditing((prevEditing) => ({
            ...prevEditing,
            [id]: true,
        }));
    };

    const handleSaveRoot = async (id) => {
        const newRoot = editedRoots[id];
        const { error } = await supabase
            .from('words')
            .update({ root: newRoot })
            .eq('id', id);

        if (error) console.error('Error updating root:', error);
        else {
            setIsEditing((prevEditing) => ({
                ...prevEditing,
                [id]: false,
            }));
            fetchWords();
        }
    };

    const handlePageChange = async (newPage) => {
        // Get IDs of words that weren't selected
        const unselectedWordIds = words
            .filter(word => !selectedWords.includes(word.id))
            .map(word => word.id);

        // Delete unselected words
        if (unselectedWordIds.length > 0) {
            const { error } = await supabase
                .from('words')
                .delete()
                .in('id', unselectedWordIds);
            
            if (error) {
                console.error('Error deleting words:', error);
                return;
            }
        }

        // Update selected words to remove 'invalid' translation
        if (selectedWords.length > 0) {
            const { error } = await supabase
                .from('words')
                .update({ translation: null })
                .in('id', selectedWords);
            
            if (error) {
                console.error('Error updating translations:', error);
                return;
            }
        }

        setSelectedWords([]);
        setPage(newPage);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen select-none">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Invalid Translations - {language}</h1>
            <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold">Select</th>
                        <th className="px-4 py-3 text-left font-semibold">Word</th>
                        <th className="px-4 py-3 text-left font-semibold">Translation</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {words.map((word, index) => (
                        <tr 
                            key={word.id}
                            className="border-b hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => handleSelectWord(index, word.id, e)}
                        >
                            <td className="px-4 py-2">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                    checked={selectedWords.includes(word.id)}
                                    onChange={(e) => e.stopPropagation()}
                                />
                            </td>
                            <td className="px-4 py-2">
                                {isEditing[word.id] ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editedRoots[word.id] || word.root}
                                            onChange={(e) => handleEditRoot(word.id, e.target.value)}
                                            className="border rounded px-2 py-1 w-full select-text"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveRoot(word.id);
                                            }} 
                                            className="text-blue-600 hover:underline ml-2"
                                        >
                                            Save
                                        </button>
                                    </>
                                ) : (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditing((prev) => ({ ...prev, [word.id]: true }));
                                        }}
                                        className="cursor-pointer text-gray-800"
                                    >
                                        {word.root}
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-2 text-gray-800">{word.translation}</td>
                            <td className="px-4 py-2 text-green-600">Known</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                    Previous
                </button>
                <span className="text-gray-600">Page {page}</span>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default InvalidWordsPage;