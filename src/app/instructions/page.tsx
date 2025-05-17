import Link from 'next/link';
import { ChevronLeft, Chrome } from 'lucide-react';
import CopyButton from './CopyButton';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl pl-10 pr-3 py-4">
        {/* Back link */}
        <Link 
          href="/extension" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to extension
        </Link>

        <h1 className="text-2xl font-semibold mb-4">Installing the Extension</h1>

        {/* Progress steps */}
        <div className="space-y-3 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                1
              </div>
              <h2 className="font-medium">Extract the downloaded file</h2>
            </div>
            <p className="text-sm text-gray-600 ml-9">
              Locate the downloaded <code className="bg-gray-100 px-1.5 py-0.5 rounded">dist.zip</code> file and unzip it to a folder
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                2
              </div>
              <h2 className="font-medium">Open Chrome Extensions</h2>
            </div>
            <div className="ml-9">
              <p className="text-sm text-gray-600 mb-2">
                Open Chrome and navigate to:
              </p>
              <div className="flex items-center bg-gray-100 p-2 rounded-lg mb-3">
                <Chrome size={16} className="text-gray-500 mr-2" />
                <code className="text-sm">chrome://extensions</code>
              </div>
              <CopyButton />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                3
              </div>
              <h2 className="font-medium">Enable Developer Mode</h2>
            </div>
            <p className="text-sm text-gray-600 ml-9">
              Find and enable the "Developer mode" toggle in the top right corner
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                4
              </div>
              <h2 className="font-medium">Load the Extension</h2>
            </div>
            <p className="text-sm text-gray-600 ml-9">
              Click "Load unpacked" and select the unzipped folder
            </p>
          </div>
        </div>

        {/* Important notes */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="font-medium mb-2">Getting Started</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Sign in to your account to start using the extension</li>
            <li>• Open any YouTube video and enable subtitles</li>
            <li>• If words aren&apos;t highlighted, try refreshing the page</li>
            <li>• Hover over highlighted words to see translations</li>
            <li>• Start the reader with <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">CMD-Shift-Y</kbd> or configure a shortcut in <a href="chrome://extensions/shortcuts" className="text-blue-600 hover:underline">chrome://extensions/shortcuts</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
