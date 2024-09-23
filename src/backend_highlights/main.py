import os
import asyncio
import numpy as np
from scipy.sparse import csr_matrix
import uuid
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI, APIConnectionError, RateLimitError, APIStatusError, BadRequestError
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict
from instructions import INSTRUCTION_ADJECTIVE, INSTRUCTION_NOUNS, INSTRUCTION_VERBS, INSTRUCTION_GROUP, INSTRUCTION_VERB_COMPLETE
import re
from recommender import recommend

load_dotenv()

app = FastAPI()

# TODO: Batch Search requests?
# No -> Caching

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_api_key = os.getenv("OPENAI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

client = OpenAI(api_key=openai_api_key)
supabase: Client = create_client(supabase_url, supabase_key)

ARTICLES_DIR = "articles"
VIDEOS_DIR = "processed"
SPECIAL_CHARACTERS = '.,!?¿¡\'"“”‘’1234567890()«»%: '

word_cache = {}

def fetch_all_records(table_name: str, columns: str):
    """
    Fetch all records from a given table with pagination.
    """
    all_records = []
    page = 0
    page_size = 1000  # Adjust the page size according to your needs
    
    while True:
        response = supabase.table(table_name).select(columns).range(page * page_size, (page + 1) * page_size - 1).execute()
        records = response.data
        if not records:
            break
        all_records.extend(records)
        page += 1
    
    return all_records

def initialize_cache():
    global word_cache
    word_cache = {
        'words': {},
        'wordforms': {}
    }

    # Load all words into the cache
    word_entries = fetch_all_records("words", "id, root")
    for word_entry in word_entries:
        word_id = word_entry['id']
        root = word_entry['root'].lower()
        word_cache['words'][root] = word_id
    
    # Load all wordforms into the cache
    wordform_entries = fetch_all_records("wordforms", "word_id, form")
    for wordform_entry in wordform_entries:
        word_id = wordform_entry['word_id']
        form = wordform_entry['form'].lower()
        word_cache['wordforms'][form] = word_id

class TextRequest(BaseModel):
    text: str

def parse_chatgpt_output(output: str, startChar: str, endChar: str) -> str:
    start = output.find(startChar)
    end = output.rfind(endChar)
    
    if start == -1 or end == -1 or start > end:
        raise ValueError("No valid JSON array found in the output")
    
    json_content = output[start:end+1]
    return json_content

def generate_title(text: str) -> str:
    return str(uuid.uuid4())[:8]

def is_special_character(group: str) -> bool:
    return all(char in SPECIAL_CHARACTERS for char in group)

def save_to_supabase(root: str, forms: set, source: str = None):
    word_id = None
    try:
        # Insert the root form into the Words table with the provided source
        response = supabase.table("words").insert({"root": root, "source": source}).execute()
        word_id = response.data[0]['id']
        
        # Prepare the additional forms for insertion
        form_entries = [{"word_id": word_id, "form": form} for form in forms]
        formstring = ""
        if len(forms) <= 4:
            formstring = str(forms)
        else:
            formstring = f"{list(forms)[:3]}..., {len(forms)} in total"
        print(f"Added {root} ({word_id}) | {formstring}")

        if form_entries:
            supabase.table("wordforms").upsert(form_entries).execute()
        
        return word_id
    
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        
        # If there's an error, flag the word and its forms
        try:
            # Update the root word's flagged status
            response = supabase.table("words").update({"flagged": True}).eq("root", root).execute()
            response = supabase.table("words").select("id").eq("root", root).limit(1).execute()
            return response.data[0]['id']
        except Exception as flagging_error:
            print(f"Error flagging the word or forms: {flagging_error}")

def group_text(text: str) -> list:
    groups = []
    special_chars = set(SPECIAL_CHARACTERS)
    current_group = ''

    for char in text:
        if char in special_chars:
            if current_group and not (current_group[-1] in special_chars):
                groups.append(current_group)
                current_group = char
            else:
                current_group += char
        else:
            if current_group and (current_group[-1] in special_chars):
                groups.append(current_group)
                current_group = char
            else:
                current_group += char

    if current_group:
        groups.append(current_group)
    
    return groups

# def group_text(text: str):
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "user", "content": INSTRUCTION_GROUP + text}
#             ],
#             max_tokens=16000,
#             temperature=0
#         )
#         parsed = response.choices[0].message.content
#         parsed = parse_chatgpt_output(parsed, '[', ']')
#         return json.loads(parsed)
#     except json.JSONDecodeError:
#         raise HTTPException(status_code=500, detail="Failed to parse GPT-4 response as JSON")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))    

def get_word_root(word: str) -> str:
    # Create the prompt to send to ChatGPT
    prompt = f"""For the word '{word}' return a 2 element json dictionary that determines the "type" which is either "verb" if it could be a verb, "noun", "adjective", or otherwise "other".
    
    Also include a "key":
    - For verbs of any conjugation it is the root form. 
    - For nouns it is the singular (!) full verb including spanish article
    - For adjectives also give the singular (!) male root form
    - If it's neither (other) the key is the word itself
    """
    
    try:
        # Call the OpenAI API to get the root form
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=45,
            temperature=0.3,
        )
        # TODO: Sanity check response, error handling
        raw_output = response.choices[0].message.content
        json_output = parse_chatgpt_output(raw_output, '{', '}')
        return json.loads(json_output)
    except Exception as e:
        print(f"Error finding root form: {e}")
        return None

def identify_word_id(word: str):
    global word_cache

    # Step 1: Cache Lookup
    word_lower = word.lower().strip()
    word_title = word.title().strip()

    # Check in words cache
    if word_lower in word_cache['words']:
        return word_cache['words'][word_lower]
    elif word_title in word_cache['words']:
        return word_cache['words'][word_title]

    # Check in wordforms cache
    if word_lower in word_cache['wordforms']:
        return word_cache['wordforms'][word_lower]
    
    # in theory continue because the entire db cant find into cache?
    print(f"{word} not found")
    raise ValueError(f"Word '{word}' not found")
    
    # Step 2: Look up in word (lowercase form match)
    word_entry = supabase.table("words").select("*").eq("root", word.lower()).execute()
    if word_entry.data:
        return word_entry.data[0]['id']
    
    # Step 3: Look up in wordlist (word forms)
    word_form_entry = supabase.table("wordforms").select("*").eq("form", word.lower()).execute()
    if word_form_entry.data:
        return word_form_entry.data[0]['word_id']
    
    # Step 4: Look up in word (titlecase form match)
    word_entry = supabase.table("words").select("*").eq("root", word.title()).execute()
    if word_entry.data:
        return word_entry.data[0]['id']

    raise ValueError(f"Word '{word}' not found")

def complete_verb(word: str):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": INSTRUCTION_VERB_COMPLETE.format(word=word)}],
            max_tokens=100,
            temperature=0.25,
        )
        raw_output = response.choices[0].message.content
        print(raw_output)
        forms = parse_chatgpt_output(raw_output, '{', '}')
        forms = forms.lower()
        dict = json.loads(forms)
        
        return dict["gerundio"]

def complete_gerundio_all():
    # Select word IDs and roots that have more than 20 associated wordforms
    response = supabase.rpc("get_words_with_many_forms").execute()

    # Extract the data from the response
    words_with_many_forms = response.data


    # 2. Generate and insert gerundio forms for these words
    for word_entry in words_with_many_forms:
        word_id = word_entry['id']
        word_root = word_entry['root']

        # Get the gerundio form of the verb using complete_verb
        gerundio_form = complete_verb(word_root)

        # Prepare the gerundio form entry
        gerundio_entry = {
            "word_id": word_id,
            "form": gerundio_form
        }
        print(gerundio_entry)
        # 3. Insert the gerundio form into the wordforms table
        try:
            supabase.table("wordforms").insert(gerundio_entry).execute()
            print(f"Added gerundio form '{gerundio_form}' for verb '{word_root}' (ID: {word_id})")
        except Exception as e:
            print(f"Error inserting gerundio form '{gerundio_form}' for verb '{word_root}': {e}")


def generate_alternatives(word: str, type: str):
    if type == "verb":
        # Get all conjugations into a dict (this improves accuracy)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": INSTRUCTION_VERBS.format(word=word)}],
            max_tokens=550,
            temperature=0.25,
        )
        raw_output = response.choices[0].message.content
        forms = parse_chatgpt_output(raw_output, '{', '}')
        forms = forms.lower()
        dict = json.loads(forms)
        
        dict["perfecto root"] = dict["perfecto root"].split()[1:]
        dict["gerundio"] = dict["gerundio"].split()[1:]
        
        result_set = set()
        for value in dict.values():
            if isinstance(value, list):
                result_set.update(value)
            else:
                result_set.add(value)
        return result_set
        
    elif type == "noun":
        prompt = INSTRUCTION_NOUNS.format(word=word)
    elif type == "adjective":
        prompt = INSTRUCTION_ADJECTIVE.format(word=word)
    else:
        return []

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=180,
        temperature=0.3,
    )
    
    raw_output = response.choices[0].message.content
    forms = parse_chatgpt_output(raw_output, '[', ']')
    forms = forms.lower()
    
    return set(json.loads(forms))

def add_to_dictionary(word: str, source: str):
    try:
        # Step one: Get word type and key using get_word_root
        word_root_info = get_word_root(word)
        if not word_root_info:
            raise ValueError(f"Could not determine root information for word '{word}'")
        
        type = word_root_info.get("type")
        key = word_root_info.get("key")

        # Step two: Determine word list to be added to the database using the type:
        forms = generate_alternatives(key, type)

        # Step three: save_to_supabase(form, [])
        return save_to_supabase(key, forms, source)
    except Exception as e:
        print(f"Error adding word to dictionary: {e} ")
        try:
            # Update the root word's flagged status
            supabase.table("words").update({"flagged": True}).eq("root", word).execute()
            save_to_supabase(key, [], source)
            supabase.table("words").update({"flagged": True}).eq("root", word).execute()

        except Exception as flagging_error:
            print(f"Error flagging the word or forms: {flagging_error}")
        return None

# Take this as inspiration
def parse(groups: List[str], source: str):
    result = []
    for group in groups:
        try:
            # Ignore special characters
            if is_special_character(group):
                result.append({"content": group})
                continue
            
            # Case distinction by group length
            words = group.split()
            word_id = 0
                
            if len(words) == 1:
                try:
                    word_id = identify_word_id(words[0])
                except ValueError:
                    word_id = add_to_dictionary(words[0], source)
                    #print(words[0])
                    #word_id = None
                finally:
                    result.append({"content": words[0], "id": word_id})
                    
            elif len(words) >= 2:
                # TODO: Make more robust. Groups should be as minimalistic as possible
                root = get_word_root(" ".join(words))["key"]
                try:
                    word_id = identify_word_id(root)
                except ValueError:
                    word_id = add_to_dictionary(root, source)
                finally:
                    result.append({"content": " ".join(words), "id": word_id})
                
            
        except APIConnectionError:
            raise HTTPException(status_code=500, detail="OpenAI API connection error")
        except RateLimitError:
            raise HTTPException(status_code=429, detail="OpenAI API rate limit exceeded")
        except APIStatusError:
            raise HTTPException(status_code=503, detail="OpenAI API status error")
        except BadRequestError:
            raise HTTPException(status_code=400, detail="Bad request to OpenAI API")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    return result

# TODO: Add source                       
@app.post("/parse")
async def parse_text(request: TextRequest):
    
    groups = await group_text(request.text)
    result = parse(groups)
                

    title = generate_title(request.text)
    full_content = {
        "title": title,
        "content": result
    }

    os.makedirs(ARTICLES_DIR, exist_ok=True)
    file_path = os.path.join(ARTICLES_DIR, f"{title}.json")
    with open(file_path, "w") as f:
        json.dump(full_content, f, indent=2)

    return {
        "message": f"Parsed JSON saved to {file_path}",
        "title": title,
        "parsed_json": result
    }


@app.get("/recommendations/")
def get_recommendations():
    video_ids, ratios = asyncio.run(recommend())    
    return {"video_ids": video_ids, "ratios": ratios}

# Pydantic models to validate the incoming request
class Word(BaseModel):
    content: str
    id: int

class VideoWords(BaseModel):
    video_id: str
    words: List[Word]

def get_video_words(video_id: str) -> List[Dict]:
    try:
        file_path = os.path.join(VIDEOS_DIR, f"{video_id}_processed.json")
        with open(file_path, 'r') as f:
            video_data = json.load(f)
        return video_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Video data not found: {video_id}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Optimized helper function to check if words are in user's wordlist
from supabase.client import Client

async def get_missing_words(user_id: str, words: List[Dict], include_cognates: bool = False) -> List[Dict]:
    # Filter out items without 'id' and extract word_ids
    word_ids = [word['id'] for word in words if 'id' in word and word['id'] is not None]
    
    print(word_ids)
    
    try:
        # Perform a single query to fetch all user word IDs at once
        response = supabase.table("userwords").select("word_id").eq("user_id", user_id).in_("word_id", word_ids).execute()
        
        # Get the set of word IDs already in the user's wordlist
        existing_word_ids = {word['word_id'] for word in response.data}

        if include_cognates:
            # Fetch all cognate word IDs
            cognate_response = supabase.table("words").select("id").not_("cognate", None).execute()
            cognate_word_ids = {word['id'] for word in cognate_response.data if word['id'] is not None}
            existing_word_ids.update(cognate_word_ids)

        # Use set-based operations to filter the missing words
        missing_words = [word for word in words if 'id' in word and word['id'] not in existing_word_ids]

        return missing_words

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data from Supabase: {str(e)}")

@app.post("/api/videos/{video_id}/missing-words")
async def check_missing_words(video_id: str):
    try:
        # Get the list of words from the video
        words = get_video_words(video_id)
        
        # Check which words are missing in the user's wordlist
        # Assuming a default user_id for demonstration purposes
        user_id = "529cf561-a58a-4e90-9148-5e9b0f8c49e1"
        missing_words = await get_missing_words(user_id, words)
        print(missing_words)
        return {"missing_words": missing_words}
    
    except Exception as e:
        print(f"Error in check_missing_words: {str(e)}")  # Add this line
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/videos/{video_id}")
async def get_video_info(video_id: str):
    try:
        words = get_video_words(video_id)
        return {"video_id": video_id, "words": words}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/article/{article_id}")
async def article(article_id: str):
    try:
        article_file = os.path.join(ARTICLES_DIR, f"{article_id}.json")
        with open(article_file, 'r') as f:
            article_data = json.load(f)

        return {"article": article_data}

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Article not found: {article_id}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/articles")
async def get_article_ids():
    try:
        files = os.listdir(ARTICLES_DIR)
        article_ids = [f[:-5] for f in files if f.endswith('.json')]
        return {"article_ids": article_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing article IDs: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

initialize_cache()