import Image from 'next/image';
import Link from 'next/link';
import { Download } from 'lucide-react'; // Importing the Download icon from Lucide
import screenshot from '../public/demo.webp'; // Ensure the screenshot is in your public folder
import { supabase } from '@/lib/supabaseclient';


export default function ExtensionGuide() {
    return (
        <div className="p-6 bg-white text-gray-800">
            <div className="max-w-2xl mr-auto">
                <h1 className="text-3xl font-bold mb-4">Langfive Chrome Extension</h1>

                <p className="mb-4">
                    Expand your vocabulary while watching YouTube videos. Unlearned words in subtitles are highlighted in <span className="text-orange-500 font-semibold">orange</span>. Hover over any word to translate it and add it to your flashcards instantly.
                </p>

                <div className="flex items-center mb-6">
                    <Download className="text-blue-500 mr-2" size={24} />
                    <Link href="https://xpovcmbrttmkhnrfspvo.supabase.co/storage/v1/object/sign/downloads/dist.zip?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkb3dubG9hZHMvZGlzdC56aXAiLCJpYXQiOjE3MzY3MTg2NDIsImV4cCI6MTc2ODI1NDY0Mn0.Wnb7-HxrlMBCVgPZHqqLNPbqCpBzAg25hpsjy632VoU&t=2025-01-12T21%3A50%3A42.204Z">
                        <span className="text-blue-500 font-semibold text-md underline cursor-pointer">
                            Download Extension (Development Build)
                        </span>
                    </Link>
                </div>

                <Image
                    src={screenshot}
                    alt="Extension usage example"
                    className="rounded-md shadow-2xl mb-6" // Updated shadow class for a more prominent shadow
                />

                <div className="bg-gray-100 p-4 rounded-md mb-6 border-2 border-t-white">
                    <h2 className="font-semibold text-lg mb-2">Installation and Usage</h2>
                    <ol className="list-decimal list-inside space-y-1 mb-4">
                        <li>Unzip the extension folder</li>
                        <li>Open <strong>chrome://extensions</strong> in Chrome</li>
                        <li>Enable <strong>Developer Mode</strong> (top right)</li>
                        <li>Click <strong>“Load unpacked”</strong> and select the unzipped folder</li>
                    </ol>
                    <p>
                        Login is required for the extension to work. First-time use after installation may require reloading the video page after enabling subtitles.
                    </p>
                </div>

            </div>
        </div>
    );
}
