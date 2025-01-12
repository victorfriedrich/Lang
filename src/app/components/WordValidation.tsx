"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseclient';

function InvalidWordsPage({ language }) {
    const [words, setWords] = useState([]);
    const [wordForms, setWordForms] = useState({});
    const [selectedWords, setSelectedWords] = useState([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
    const [page, setPage] = useState(1);
    const [isEditing, setIsEditing] = useState({});
    const [editedRoots, setEditedRoots] = useState({});
    const [isEditingForm, setIsEditingForm] = useState({});
    const [editedForms, setEditedForms] = useState({});
    const [currentEditingForm, setCurrentEditingForm] = useState(null); // Track the currently editing form

    const itemsPerPage = 30;

    const fetchWords = async () => {
        if (!language) return;

        const { data: wordsData, error: wordsError } = await supabase
            .from('words')
            .select('*, wordforms:wordforms!inner(*)') // Join with wordforms
            .eq('language', language.toLowerCase())
            .eq('cognate', 'invalid')
            .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        if (wordsError) {
            console.error('Error fetching words:', wordsError);
            return;
        }

        setWords(wordsData);

        const formsMap = {};
        wordsData.forEach(word => {
            formsMap[word.id] = word.wordforms.slice(0, 6); // Take the first 6 wordforms
        });

        setWordForms(formsMap);
    };

    useEffect(() => {
        fetchWords();
    }, [page, language]);

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

        if (error) {
            console.error('Error updating root:', error);
        } else {
            setIsEditing((prevEditing) => ({
                ...prevEditing,
                [id]: false,
            }));
            setEditedRoots((prevRoots) => ({
                ...prevRoots,
                [id]: undefined,
            }));
            fetchWords();
        }
    };

    const handleCancelEditRoot = (id) => {
        setIsEditing((prevEditing) => ({
            ...prevEditing,
            [id]: false,
        }));
        setEditedRoots((prevRoots) => ({
            ...prevRoots,
            [id]: undefined,
        }));
    };

    const handleEditForm = (wordId, formId, currentForm) => {
        setEditedForms((prev) => ({
            ...prev,
            [`${wordId}-${formId}`]: currentForm,
        }));
        setIsEditingForm((prev) => ({
            ...prev,
            [`${wordId}-${formId}`]: true,
        }));
    };

    const handleSaveForm = async (wordId, formId) => {
        const newForm = editedForms[`${wordId}-${formId}`];
        const { error } = await supabase
            .from('wordforms')
            .update({ form: newForm })
            .eq('id', formId);

        if (error) {
            console.error('Error updating word form:', error);
        } else {
            setIsEditingForm((prev) => ({
                ...prev,
                [`${wordId}-${formId}`]: false,
            }));
            setEditedForms((prev) => ({
                ...prev,
                [`${wordId}-${formId}`]: undefined,
            }));
            fetchWords();
        }
    };

    const handleCancelEditForm = (wordId, formId) => {
        setIsEditingForm((prev) => ({
            ...prev,
            [`${wordId}-${formId}`]: false,
        }));
        setEditedForms((prev) => ({
            ...prev,
            [`${wordId}-${formId}`]: undefined,
        }));
    };

    const handleDeleteForm = async (wordId, formId) => {
        const { error } = await supabase
            .from('wordforms')
            .delete()
            .eq('id', formId);

        if (error) {
            console.error('Error deleting word form:', error);
        } else {
            fetchWords();
        }
    };

    const handlePageChange = async (newPage) => {
        // Update selected words to remove 'invalid' translation
        if (selectedWords.length > 0) {
            const { error } = await supabase
                .from('words')
                .update({ cognate: null })
                .in('id', selectedWords);
            
            if (error) {
                console.error('Error updating translations:', error);
                return;
            }
        }

        setSelectedWords([]);
        setPage(newPage);
    };

    const renderWordForms = (word) => {
        return wordForms[word.id]?.map((form, index) => {
            const key = `${word.id}-${form.id}`;
            const isEditing = isEditingForm[key];
            const editedValue = editedForms[key] || form.form;

            if (isEditing) {
                return (
                    <span key={form.id} className="inline-flex items-center">
                        <input
                            type="text"
                            value={editedValue}
                            onChange={(e) =>
                                setEditedForms((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                }))
                            }
                            className="border rounded px-2 py-1 mr-2"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSaveForm(word.id, form.id);
                            }}
                            className="text-green-600 hover:underline mr-2"
                        >
                            Save
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEditForm(word.id, form.id);
                            }}
                            className="text-gray-600 hover:underline mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteForm(word.id, form.id);
                            }}
                            className="text-red-600 hover:underline"
                        >
                            Delete
                        </button>
                        {index < wordForms[word.id].length - 1 && ", "}
                    </span>
                );
            } else {
                return (
                    <span
                        key={form.id}
                        className="cursor-pointer text-blue-600 hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditForm(word.id, form.id, form.form);
                        }}
                    >
                        {form.form}
                        {index < wordForms[word.id].length - 1 && ", "}
                    </span>
                );
            }
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Translation Validation</h1>
            <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold">Select</th>
                        <th className="px-4 py-3 text-left font-semibold">Word</th>
                        <th className="px-4 py-3 text-left font-semibold">Translation</th>
                        <th className="px-4 py-3 text-left font-semibold">Wordforms</th>
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
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            value={editedRoots[word.id] || word.root}
                                            onChange={(e) => handleEditRoot(word.id, e.target.value)}
                                            className="border rounded px-2 py-1 w-full mr-2"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveRoot(word.id);
                                            }} 
                                            className="text-blue-600 hover:underline mr-2"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelEditRoot(word.id);
                                            }}
                                            className="text-gray-600 hover:underline"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditRoot(word.id, word.root);
                                        }}
                                        className="cursor-pointer text-gray-800"
                                    >
                                        {word.root}
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-2 text-gray-800">{word.translation}</td>
                            <td className="px-4 py-2 text-gray-800">
                                {renderWordForms(word)}
                            </td>
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