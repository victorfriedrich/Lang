import json
import time
from dotenv import load_dotenv
import pytubefix as pytube
from moviepy.editor import VideoFileClip
import os
from openai import OpenAI
import traceback
from nlp_processing import filter_non_spanish_words, parse, group_text

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

def download_video(url):
    try:
        start_time = time.time()
        video = pytube.YouTube(url)
        stream = video.streams.filter(only_audio=True).first()
        audio_file = stream.download()
        end_time = time.time()
        print(f"Video download completed in {end_time - start_time:.2f} seconds")
        return audio_file
    except Exception as e:
        print(f"Error occurred during video download: {e}")
        return None

def convert_to_mp3(filename):
    try:
        start_time = time.time()
        clip = VideoFileClip(filename)
        mp3_filename = filename[:-4] + ".mp3"
        clip.audio.write_audiofile(mp3_filename)
        clip.close()
        end_time = time.time()
        print(f"MP3 conversion completed in {end_time - start_time:.2f} seconds")
        return mp3_filename
    except Exception as e:
        print(f"Error converting to MP3: {e}")
        return None

def transcribe_audio(mp3_filename, video_id):
    txt_filename = f"{video_id}.txt"
    if os.path.exists(txt_filename):
        print(f"Transcription file {txt_filename} already exists. Skipping transcription.")
        return txt_filename
    
    try:
        start_time = time.time()
        with open(mp3_filename, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        with open(txt_filename, "w") as txt_file:
            txt_file.write(transcription)
        end_time = time.time()
        print(f"Audio transcription completed in {end_time - start_time:.2f} seconds")
        return txt_filename
    except Exception as e:
        print(f"Error during transcription: {e}")
        return None
    finally:
        cleanup_files(mp3_filename)

def cleanup_files(*filenames):
    for filename in filenames:
        try:
            if os.path.exists(filename):
                os.remove(filename)
                print(f"Deleted file: {filename}")
        except Exception as e:
            print(f"Error deleting file {filename}: {e}")

def main(url):
    video_id = url.split('v=')[-1]
    txt_filename = f"{video_id}.txt"
    
    if os.path.exists(txt_filename):
        print(f"Transcription file {txt_filename} already exists. Processing...")
        process_transcription(txt_filename, video_id)
        return

    mp4_filename = download_video(url)
    if mp4_filename:
        mp3_filename = mp4_filename
        if mp3_filename:
            transcription_file = transcribe_audio(mp3_filename, video_id)
            if transcription_file:
                print(f"Transcription saved as: {transcription_file}")
                process_transcription(transcription_file, video_id)
            else:
                print("Transcription failed.")
            cleanup_files(mp4_filename)
        else:
            print("MP3 conversion failed.")
    else:
        print("Video download failed.")

def process_transcription(txt_filename, video_id):
    try:
        start_time = time.time()
        with open(txt_filename, 'r') as file:
            transcription_text = file.read()

        filtered_text = filter_non_spanish_words(transcription_text)
        groups = group_text(filtered_text)
        result = parse(groups, video_id)
        
        processed_filename = f"processed/{video_id}_processed.json"
        os.makedirs(os.path.dirname(processed_filename), exist_ok=True)
        with open(processed_filename, "w") as json_file:
            json.dump(result, json_file)
        
        end_time = time.time()
        print(f"Transcription processing completed in {end_time - start_time:.2f} seconds")
    except Exception as e:
        print(f"Error processing transcription: {e}")
        traceback.print_exc()