// // App.tsx
// import React from 'react';
// import { useRouter } from 'next/router';
// import Link from 'next/link';

// // Import your components here
// import Reader from './components/Reader';
// import UrlParser from './components/UrlParser';
// import ArticleList from './components/ArticleList';
// import LanguageLevelSelector from './components/LanguageLevelSelector';
// import YouTubeVideoGrid from './components/YouTubeVideoGrid';
// // import Flashcards from './components/Flashcards';

// const App: React.FC = () => {
//   const router = useRouter();

//   const handleTranslationAdded = (group: any, translations: any[]) => {
//     // Handle the added translation
//     console.log('Translation added:', group, translations);
//   };

//   const handleSentenceComplete = () => {
//     // Handle completion of all sentences
//     console.log('All sentences completed');
//   };

//   const renderContent = () => {
//     const { pathname, query } = router;

//     switch (pathname) {
//       case '/articles':
//         return <ArticleList />;
//       case '/parse':
//         return <UrlParser />;
//       case '/read/[articleId]':
//         return (
//           <Reader
//             articleId={query.articleId as string}
//             onTranslationAdded={handleTranslationAdded}
//             onSentenceComplete={handleSentenceComplete}
//           />
//         );
//       case '/proficiency':
//         return <LanguageLevelSelector />;
//       case '/ranking':
//         return <YouTubeVideoGrid />;
//       // case '/current':
//       //   return <Flashcards />;
//       default:
//         return <ArticleList />; // Default route
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <nav className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex space-x-4">
//               <Link href="/articles" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
//                 Articles
//               </Link>
//               <Link href="/parse" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
//                 Parse URL
//               </Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div>
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default App;