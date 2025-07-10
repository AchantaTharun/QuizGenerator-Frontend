import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getQuestionBanks } from '../services/api';
import { useConfirmationDialog } from '../components/ConfirmationDialog';
import { deleteQuestionBank } from '../services/api';
import { useToast } from '../components/Toast';



export default function QuestionBanks() {
  const { openDialog } = useConfirmationDialog();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
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

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8 border-b border-stroke pb-4">
        <div>
          <h2 className="text-2xl font-bold text-dark">
            Question Banks
          </h2>
          <p className="text-sm text-body-color">
            Manage your question banks and create quizzes
          </p>
        </div>
        <Link
            to="/create"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Bank
          </Link>
      </div>

      {/* Banks Grid */}
      <div className="rounded-lg bg-white shadow-default">
        {banks.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {banks.map((bank) => (
              <div
                key={bank.id}
                className="rounded-lg border border-stroke bg-white p-6 shadow-1 hover:shadow-md transition"
              >
                <h3 className="mb-2 text-xl font-bold text-dark">
                  {bank.name}
                </h3>
                <p className="mb-4 text-sm text-body-color">
                  {bank.questions?.length || 0} questions
                </p>
                {bank.description && (
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                    {bank.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-body-color">
                    Updated: {new Date(bank.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/edit/${bank.id}`}
                      className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(bank.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-500/80 hover:underline transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No question banks found</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Your First Bank
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}