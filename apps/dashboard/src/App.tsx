import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StreamsPage } from './pages/StreamsPage';
import { CreateStreamPage } from './pages/CreateStreamPage';
import { CashoutPage } from './pages/CashoutPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        <Routes>
          <Route path="/" element={<StreamsPage />} />
          <Route path="/streams" element={<StreamsPage />} />
          <Route path="/create" element={<CreateStreamPage />} />
          <Route path="/cashout/:streamId" element={<CashoutPage />} />
          <Route path="/history" element={<TransactionHistoryPage />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App; 