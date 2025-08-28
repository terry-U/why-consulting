import { useState } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { ChatBot } from './components/ChatBot';
import { ComponentsPage } from './components/ComponentsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigateToChat={() => setCurrentPage('chat')} />;
      case 'chat':
        return <ChatBot />;
      case 'components':
        return <ComponentsPage />;
      default:
        return <HomePage onNavigateToChat={() => setCurrentPage('chat')} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}