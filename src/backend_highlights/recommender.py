import os
import json
import numpy as np
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List
from scipy.sparse import lil_matrix, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer

# Path to the folder containing the documents
folder_path = 'processed'

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

async def get_known_words(user_id: str, include_cognates: bool) -> List[int]:
    try:
        known_word_ids = set()
        
        # Fetch user's known words with pagination
        page = 0
        while True:
            response = supabase.table("userwords").select("word_id").eq("user_id", user_id).range(page*1000, (page+1)*1000-1).execute()
            if not response.data:
                break
            known_word_ids.update(word['word_id'] for word in response.data)
            page += 1

        if include_cognates:
            # Fetch all word IDs where the cognate column is not null with pagination
            cognate_page = 0
            while True:
                cognate_response = supabase.table("words").select("id").neq("cognate", None).range(cognate_page*1000, (cognate_page+1)*1000-1).execute()
                if not cognate_response.data:
                    break
                known_word_ids.update(word['id'] for word in cognate_response.data if word['id'] is not None)
                cognate_page += 1

        return list(known_word_ids)

    except Exception as e:
        print(f"Error fetching known words from Supabase: {str(e)}")
        return []

async def recommend(include_cognates: bool = True):
    # Load all documents from the folder
    documents = []
    filenames = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".json"):
            with open(os.path.join(folder_path, filename), 'r') as file:
                documents.append(json.load(file))
                filenames.append(filename)
                
    from scipy.sparse import lil_matrix

    # Determine the maximum word ID for matrix size
    max_word_id = 0
    for doc in documents:
        for word in doc:
            if "id" in word and word["id"] is not None:  # Filter out null IDs
                max_word_id = max(max_word_id, word["id"])

    user_known_words = await get_known_words('529cf561-a58a-4e90-9148-5e9b0f8c49e1', include_cognates)
    
    # Update max_word_id if necessary
    max_word_id = max(max_word_id, max(user_known_words, default=0))

    # Create the document-term matrix using lil_matrix for efficient row building
    num_documents = len(documents)
    D = lil_matrix((num_documents, max_word_id + 1))

    # Track unique word IDs per document
    unique_word_counts = np.zeros(num_documents)
    word_counts = np.zeros(num_documents)

    # Populate the matrix
    for i, doc in enumerate(documents):
        unique_ids = list()
        for word in doc:
            if "id" in word and word["id"] is not None:  # Filter out null IDs
                word_id = word["id"]
                D[i, word_id] = 1  # Binary presence/absence indicator
                unique_ids.append(word_id)
        
        word_counts[i] = len(unique_ids)        
        unique_word_counts[i] = len(set(unique_ids))  # Count unique word IDs in the document

    # Convert to CSR for efficient operations
    D = D.tocsr()

    U = csr_matrix((1, max_word_id + 1))
    for word_id in user_known_words:
        if word_id <= max_word_id:  # Ensure word_id is within range
            U[0, word_id] = 1

    for i, doc in enumerate(documents):
        doc_word_ids = [word["id"] for word in doc if "id" in word and word["id"] is not None]
        unknown_words = [word_id for word_id in doc_word_ids if word_id not in user_known_words]

    # Matrix-vector multiplication
    S = D.dot(U.T).toarray().flatten()  # Resulting vector of size (num_documents,)

    # Compute the ratio of known words
    ratios = np.divide(S, unique_word_counts, where=unique_word_counts!=0)

    # Rank the documents by the ratio of known words
    document_rankings = np.argsort(-ratios)  # Sort in descending order of ratio of known words

    # Display the filenames, known words, unique word counts, and ratios
    top_documents = document_rankings[:20]  # Top 10 documents
    top_videos = [filenames[i].replace("_processed.json", "") for i in top_documents]
    for doc_index in top_documents:
        print(f"Document {filenames[doc_index]}: {S[doc_index]} / {unique_word_counts[doc_index]} words ({ratios[doc_index]:.2f}), {word_counts[doc_index]} total")
    
    return top_videos, (-np.sort(-ratios)).tolist()