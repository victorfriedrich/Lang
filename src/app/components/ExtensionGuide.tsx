import Image from 'next/image';
import { Download } from 'lucide-react';
import { useState } from 'react';


export default function ExtensionGuide() {
    const [showInstructions, setShowInstructions] = useState(false);

    const handleDownload = () => {
        // Create an anchor element to handle the download
        const downloadLink = document.createElement('a');
        downloadLink.href = 'https://xpovcmbrttmkhnrfspvo.supabase.co/storage/v1/object/sign/downloads/dist.zip?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5Xzc2YjQ1NTAzLTQ5ZDYtNDU2Ny05YmMxLTBjYTVmYzM3MTUxZCJ9.eyJ1cmwiOiJkb3dubG9hZHMvZGlzdC56aXAiLCJpYXQiOjE3NDc5NDk2MzcsImV4cCI6MTc3OTQ4NTYzN30.kikxPBu2d6M2Tt6cZsj2o7n4Va_Z4R1j_NUT6mbndmo';
        downloadLink.setAttribute('download', 'lang-extension.zip'); // Set a filename
        document.body.appendChild(downloadLink);
        
        // Trigger the download
        downloadLink.click();
        
        // Clean up
        document.body.removeChild(downloadLink);
        
        // Navigate to instructions page after a short delay to allow download to start
        setTimeout(() => {
            window.location.href = '/instructions';
        }, 1000); // 1 second delay
    };

    return (
        <div className="relative min-h-screen bg-gray-50">
            {/* Main content */}
            <div className="max-w-3xl pl-10 pr-3 py-6 pb-24">
                {/* Title section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold mb-1.5">
                        Chrome Extension Features
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Install our extension to unlock interactive language learning directly in YouTube videos
                    </p>
                </div>

                {/* Feature section 1 */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-2">Manage your Vocabulary directly in YouTube & Netflix</h2>
                    <p className="text-gray-600 text-sm mb-3">
                        Highlight words that are not yet in your flashcards. Translate and add them to flashcards in one click.
                    </p>
                    <div className="aspect-video bg-gray-800 relative rounded-lg overflow-hidden">
                        <Image
                            src="/videotranslation.webp"
                            alt="Extension demo showing word translation"
                            width={768}
                            height={432}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 768px"
                        />
                    </div>
                </div>

                {/* Feature section 2 */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-2">Article Reader Mode</h2>
                    <p className="text-gray-600 text-sm mb-3">
                        A reader mode for articles and blogs, integrating your flashcards
                    </p>
                    <div className="aspect-video bg-gray-800 relative rounded-lg overflow-hidden">
                        <Image
                            src="/documentreader.webp"
                            alt="Extension demo showing personalized learning"
                            width={768}
                            height={432}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 768px"
                        />
                    </div>
                </div>

            </div>

            {/* Sticky download section */}
            <div className="fixed bottom-0 left-[var(--sidebar-width,16rem)] right-0 bg-white border-t shadow-lg z-10 md:left-60">
                <div className="flex items-center justify-between pl-[10px] pr-3 py-3">
                    <div>
                        <h3 className="font-semibold">Learn while watching YouTube</h3>
                        <p className="text-sm text-gray-600">Free Chrome extension • 2 minute setup</p>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
                    >
                        <Download size={18} />
                        Install Now
                    </button>
                </div>
            </div>
        </div>
    );
}