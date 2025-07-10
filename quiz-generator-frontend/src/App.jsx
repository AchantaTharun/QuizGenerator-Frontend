import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuestionBanks from "./pages/QuestionBanks";
import CreateBank from "./pages/CreateBank";
import EditBank from "./pages/EditBank";
import Navbar from "./components/Navbar";
import { ConfirmationDialogProvider } from './components/ConfirmationDialog';
import { ToastProvider } from './components/Toast';


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

              </Routes>
            </div>
          </div>
        </Router>
      </ConfirmationDialogProvider>
    </ToastProvider>
  );
}

export default App;
