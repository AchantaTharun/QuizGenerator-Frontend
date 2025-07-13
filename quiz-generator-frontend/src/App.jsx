import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuestionBanks from "./pages/bank/QuestionBanks";
import CreateBank from "./pages/bank/CreateBank";
import EditBank from "./pages/bank/EditBank";
import BankDetails from "./pages/bank/BankDetails";
import Navbar from "./components/Navbar";
import { ConfirmationDialogProvider } from './components/ConfirmationDialog';
import { ToastProvider } from './components/Toast';
import QuizPage from './pages/QuizPage';
import QuizHistory from './pages/QuizHistory';
import QuizResultPage from './pages/QuizResultPage'

function App() {
  return (
    <ToastProvider>
      <ConfirmationDialogProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 bg-grey-50">
              <Routes>
                <Route path="/" element={<QuestionBanks />} />
                <Route path="/create" element={<CreateBank />} />
                <Route path="/edit/:id" element={<EditBank />} />
                <Route path="/bank/:id" element={<BankDetails />} />
                <Route path="/quiz/:sessionId" element={<QuizPage />} /> 
                <Route path="/history" element={<QuizHistory />} /> {/* Add history route */}
                <Route path="/history/:sessionId" element={<QuizResultPage />} /> {/* Add result route */}

              </Routes>
            </div>
          </div>
        </Router>
      </ConfirmationDialogProvider>
    </ToastProvider>
  );
}

export default App;
