import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuestionBankForEdit, updateQuestionBank } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function EditBank() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();


  useEffect(() => {
    const fetchBank = async () => {
      try {
        const response = await getQuestionBankForEdit(id);
        setFormData({
            id: response.data.id,
          name: response.data.name,
          description: response.data.description || ''
        });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchBank();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await updateQuestionBank(id, formData);
      addToast('Bank updated successfully!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update bank', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark">
          Edit Question Bank
        </h2>
        <p className="text-sm text-body-color">
          Update your question bank details
        </p>
      </div>

      <div className="rounded-lg bg-white p-8 shadow-default">
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-dark"
            >
              Bank Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-stroke bg-transparent px-4 py-3 text-body-color outline-none transition focus:border-primary"
              placeholder="Enter bank name"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-dark"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-md border border-stroke bg-transparent px-4 py-3 text-body-color outline-none transition focus:border-primary"
              placeholder="Enter a brief description (optional)"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-md border border-stroke px-5 py-2 text-base font-medium text-dark hover:border-primary hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-5 py-2 text-base font-medium text-white hover:bg-primary/90 disabled:opacity-70"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Bank'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}