import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getQuestionBanks } from '../../services/api';
import { useConfirmationDialog } from '../../components/ConfirmationDialog';
import { deleteQuestionBank, importQuestionBank, createQuizSession, QUESTION_TYPES } from '../../services/api';
import { useToast } from '../../components/Toast';

const ImportPreviewModal = ({ bankData, onConfirm, onCancel, isImporting }) => {
  if (!bankData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-dark mb-4">Import Preview</h2>
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-stroke">
          <h3 className="text-xl font-semibold text-dark">{bankData.name}</h3>
          <p className="text-sm text-body-color mt-1">{bankData.description}</p>
        </div>
        <div className="border-t border-stroke pt-4">
          <h4 className="font-semibold text-dark mb-2">{bankData.questions?.length || 0} Questions</h4>
          <ul className="space-y-2 text-sm max-h-60 overflow-y-auto p-2 border rounded-md">
            {bankData.questions?.map((q, i) => <li key={i} className="p-2 rounded bg-gray-100 truncate">{q.text}</li>)}
          </ul>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onCancel} className="rounded-md border border-stroke px-4 py-2 text-dark hover:bg-gray-100">Cancel</button>
          <button 
            onClick={onConfirm}
            disabled={isImporting}
            className="rounded-md bg-primary px-4 py-2 text-black hover:bg-primary/90 disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : 'Create Bank'}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizConfigModal = ({ bank, onCancel, onStartQuiz }) => {
    const [config, setConfig] = useState({
        questionBankId: bank.id,
        numberOfQuestions: bank.questions?.length || 10,
        shuffleQuestions: true,
        shuffleOptions: true,
        immediateFeedback: false,
        includedTypes: Object.values(QUESTION_TYPES)
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleConfigChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTypeChange = (type) => {
        setConfig(prev => {
            const newTypes = new Set(prev.includedTypes);
            if (newTypes.has(type)) {
                newTypes.delete(type);
            } else {
                newTypes.add(type);
            }
            return { ...prev, includedTypes: Array.from(newTypes) };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        await onStartQuiz(config);
        setIsCreating(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-dark mb-2">Start Quiz: {bank.name}</h2>
                <p className="text-sm text-body-color mb-6">Configure your quiz session.</p>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1">Number of Questions</label>
                            <input
                                type="number"
                                name="numberOfQuestions"
                                value={config.numberOfQuestions}
                                onChange={handleConfigChange}
                                max={bank.questions?.length || 100}
                                min="1"
                                className="w-full rounded-md border border-stroke p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark mb-2">Question Types</label>
                            <div className="flex flex-wrap gap-3">
                                {Object.values(QUESTION_TYPES).map(type => (
                                    <label key={type} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={config.includedTypes.includes(type)}
                                            onChange={() => handleTypeChange(type)}
                                        />
                                        <span>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-dark">Shuffle Questions</label>
                            <input type="checkbox" name="shuffleQuestions" checked={config.shuffleQuestions} onChange={handleConfigChange} />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-dark">Shuffle Options</label>
                            <input type="checkbox" name="shuffleOptions" checked={config.shuffleOptions} onChange={handleConfigChange} />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-8">
                        <button type="button" onClick={onCancel} className="rounded-md border border-stroke px-4 py-2 text-dark hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={isCreating} className="rounded-md bg-primary px-4 py-2 text-dark hover:bg-primary/90 disabled:opacity-50">
                            {isCreating ? 'Creating...' : 'Start Quiz'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function QuestionBanks() {
  const { openDialog } = useConfirmationDialog();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  const [bankToImport, setBankToImport] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [quizBank, setQuizBank] = useState(null);
  const navigate = useNavigate();
  const fetchBanks = async () => {
      try {
        const response = await getQuestionBanks();
        setBanks(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    

    fetchBanks();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  const handleDelete = (bankId) => {
    openDialog({
      title: 'Delete Question Bank',
      message: 'Are you sure you want to delete this question bank? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteQuestionBank(bankId);
          setBanks(banks.filter(bank => bank.id !== bankId));
          addToast('Bank deleted successfully!', 'success');
        } catch (error) {
          addToast('Failed to delete bank', 'error');
        }
      },
      onCancel: () => console.log('Deletion cancelled')
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          if (content.name && Array.isArray(content.questions)) {
            setBankToImport(content);
          } else {
            addToast('Invalid JSON format. "name" and "questions" array are required.', 'error');
          }
        } catch (err) {
          console.log(err);
          addToast('Failed to parse JSON file.', 'error');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = null;
  };
  
  const handleImportConfirm = async () => {
    if (!bankToImport) return;
    setIsImporting(true);
    try {
      await importQuestionBank(bankToImport);
      addToast('Bank imported successfully!', 'success');
      setBankToImport(null);
      fetchBanks();
    } catch (err) {
      addToast(err.message || 'Failed to import bank.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleStartQuiz = async (config) => {
        try {
            const response = await createQuizSession(config);
            const { id: sessionId } = response.data;
            addToast('Quiz session created!', 'success');
            setQuizBank(null); // Close modal
            navigate(`/quiz/${sessionId}`); // Navigate to the quiz page
        } catch (err) {
            addToast(err.message || 'Failed to start quiz.', 'error');
        }
    };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div>
      {quizBank && <QuizConfigModal bank={quizBank} onCancel={() => setQuizBank(null)} onStartQuiz={handleStartQuiz} />}
       <ImportPreviewModal 
        bankData={bankToImport}
        onConfirm={handleImportConfirm}
        onCancel={() => setBankToImport(null)}
        isImporting={isImporting}
      />
      
      <div className="flex justify-between items-center mb-8 border-b border-stroke pb-4">
        <div>
          <h2 className="text-2xl font-bold text-dark">Question Banks</h2>
          <p className="text-sm text-body-color">Manage your question banks and create quizzes</p>
        </div>
        <div className="flex items-center space-x-3">
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden"/>
          <button onClick={triggerFileSelect} className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition shadow-md">
            Import
          </button>
          <Link to="/create" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Create Bank
          </Link>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-default">
                {banks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                        {banks.map((bank) => (
                            <div key={bank.id} className="flex flex-col justify-between rounded-lg border border-stroke bg-white p-6 shadow-1 hover:shadow-md transition-shadow duration-300">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-dark truncate">
                                        <Link to={`/bank/${bank.id}`} className="hover:text-primary hover:underline">{bank.name}</Link>
                                    </h3>
                                    <p className="mb-4 text-sm text-body-color line-clamp-2 h-10">{bank.description}</p>
                                    <p className="text-xs text-body-color mb-4">
                                        {bank.questions?.length || 'No'} questions
                                    </p>
                                </div>
                                <div className="flex flex-col space-y-3 pt-4 border-t border-stroke">
                                    <button onClick={() => setQuizBank(bank)} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition">
                                        Start Quiz
                                    </button>
                                    <div className="flex justify-between items-center">
                                         <span className="text-xs text-body-color">Updated: {new Date(bank.updatedAt).toLocaleDateString()}</span>
                                        <div className="flex space-x-3">
                                            <Link to={`/edit/${bank.id}`} className="text-sm font-medium text-primary hover:underline">Edit</Link>
                                            <button onClick={() => handleDelete(bank.id)} className="text-sm font-medium text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center"><p className="text-gray-500">No question banks found.</p></div>
                )}
        </div>
    </div>
  );
}