import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getQuestionBankQuestions,
  getQuestionBankForEdit,
  addQuestionToBank,
  updateQuestionInBank,
  deleteQuestionFromBank,
  QUESTION_TYPES // Import QUESTION_TYPES
} from '../../services/api';
import { useToast } from '../../components/Toast';

export default function BankDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bank, setBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const initialFormState = {
    text: '',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    explanation: '', // Add explanation to initial state
    options: ['', '', '', ''],
    correctAnswers: [],
    editingId: null
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestionBankQuestions(id);
        const bankRes = await getQuestionBankForEdit(id);
        setBank(bankRes.data);
        // This is a temporary shim to handle the old data structure if needed.
        // Ideally, the API would return the correctAnswers array.
        const formattedQuestions = response.data.map(q => ({
          ...q,
          correctAnswers: q.options.map((opt, index) => opt.isCorrect ? index : -1).filter(i => i !== -1)
        }));
        setQuestions(formattedQuestions);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchQuestions();
  }, [id]);

  const handleExport = () => {
    if (!bank) {
      addToast('Bank data is not loaded yet.', 'error');
      return;
    }

    const exportData = {
      name: bank.name,
      description: bank.description,
      // Use the full question data from the state
      questions: bank.questions.map(q => ({
        text: q.text,
        type: q.type.toString(), // Ensure type is a string
        explanation: q.explanation,
        options: q.options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      })),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `${bank.name.replace(/\s+/g, '_')}.json`;
    link.click();
    addToast('Bank exported successfully!', 'success');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newForm = { ...prev, [name]: value };
        if (name === 'type') {
            switch(value) {
                case QUESTION_TYPES.MULTIPLE_CHOICE:
                    newForm.options = ['', '', '', ''];
                    newForm.correctAnswers = [];
                    break;
                case QUESTION_TYPES.TRUE_FALSE:
                    newForm.options = ['True', 'False'];
                    newForm.correctAnswers = [0];
                    break;
                case QUESTION_TYPES.SHORT_ANSWER:
                    newForm.options = [];
                    newForm.correctAnswers = [];
                    break;
                default:
                    newForm.options = ['', '', '', ''];
                    newForm.correctAnswers = [];
            }
        }
        return newForm;
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const handleCorrectAnswerChange = (index) => {
    setFormData(prev => {
      const newCorrectAnswers = [...prev.correctAnswers];
      if (prev.type === 'TrueFalse') {
        return { ...prev, correctAnswers: [index] };
      }

      if (newCorrectAnswers.includes(index)) {
          return { ...prev, correctAnswers: newCorrectAnswers.filter(i => i !== index) };
      } else {
          return { ...prev, correctAnswers: [...newCorrectAnswers, index] };
      }
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswers: prev.correctAnswers.filter(i => i !== index).map(i => i > index ? i - 1 : i)
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // This data structure is what the component uses
    const questionData = {
      text: formData.text,
      type: formData.type,
      explanation: formData.explanation, // Pass explanation
      options: formData.options,
      correctAnswers: formData.correctAnswers
    };

    try {
      if (formData.editingId) {
        await updateQuestionInBank(id, formData.editingId, questionData);
        // Refetching to ensure data consistency after update
        const response = await getQuestionBankQuestions(id);
        const formattedQuestions = response.data.map(q => ({
            ...q,
            correctAnswers: q.options.map((opt, index) => opt.isCorrect ? index : -1).filter(i => i !== -1)
        }));
        setQuestions(formattedQuestions);
        addToast('Question updated successfully!', 'success');
      } else {
        const response = await addQuestionToBank(id, questionData);
        // Add the new question to the state, formatted correctly
        const newQuestion = {
          ...response.data,
          correctAnswers: response.data.options.map((opt, index) => opt.isCorrect ? index : -1).filter(i => i !== -1)
        };
        setQuestions([...questions, newQuestion]);
        addToast('Question added successfully!', 'success');
      }
      resetForm();
    } catch (err) {
      addToast(err.message || 'Failed to save question', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    setFormData({
      text: question.text,
      type: question.type,
      explanation: question.explanation || '', // Handle cases where explanation might be null
      options: question.options.map(o => o.text), // Map from object back to string array
      correctAnswers: question.correctAnswers,
      editingId: question.id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestionFromBank(id, questionId);
        setQuestions(questions.filter(q => q.id !== questionId));
        addToast('Question deleted successfully!', 'success');
      } catch (err) {
        addToast(err.message || 'Failed to delete question', 'error');
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark">
          Manage Questions
        </h2>
        <p className="text-sm text-body-color">
          Add, edit, or remove questions from this question bank
        </p>
        <button onClick={handleExport} className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800 transition shadow-md">
          Export Bank
        </button>
      </div>

      <div className="rounded-lg bg-white p-8 shadow-default mb-8">
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark mb-2">
              Question Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-md border border-stroke bg-transparent px-4 py-2 text-body-color outline-none transition focus:border-primary"
            >
              <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice</option>
              <option value={QUESTION_TYPES.TRUE_FALSE}>True/False</option>
              <option value={QUESTION_TYPES.SHORT_ANSWER}>Short Answer</option>
            </select>
          </div>

          

          <div className="mb-6">
            <label className="block text-sm font-medium text-dark mb-2">
              Question Text *
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              required
              rows="3"
              className="w-full rounded-md border border-stroke bg-transparent px-4 py-3 text-body-color outline-none transition focus:border-primary"
              placeholder="Enter question text"
            />
          </div>

          {formData.type !== QUESTION_TYPES.SHORT_ANSWER && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark mb-2">
                Options *
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type={formData.type === 'MultipleChoice' ? 'checkbox' : 'radio'}
                      name="correctAnswers"
                      checked={formData.correctAnswers.includes(index)}
                      onChange={() => handleCorrectAnswerChange(index)}
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required
                      disabled={formData.type === 'TrueFalse'}
                      className={`w-full rounded-md border border-stroke bg-transparent px-4 py-2 text-body-color outline-none transition focus:border-primary ${formData.type === 'TrueFalse' ? 'bg-gray-100' : ''}`}
                    />
                    {formData.type === 'MultipleChoice' && (
                       <button
                         type="button"
                         onClick={() => removeOption(index)}
                         className="ml-2 text-red-500 hover:text-red-700"
                       >
                         Remove
                       </button>
                    )}
                  </div>
                ))}
              </div>
              {formData.type === 'MultipleChoice' && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 rounded-md border border-stroke px-4 py-2 text-sm font-medium text-dark hover:border-primary hover:bg-gray-50"
                >
                  Add Option
                </button>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-dark mb-2">
              Explanation
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows="2"
              className="w-full rounded-md border border-stroke bg-transparent px-4 py-3 text-body-color outline-none transition focus:border-primary"
              placeholder="Enter explanation for the answer"
            />
          </div>

          <div className="flex justify-end space-x-3">
             <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-dark hover:border-primary hover:bg-gray-50"
              >
                Clear Form
              </button>
            <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90 disabled:opacity-70"
            disabled={isSubmitting || !formData.text.trim() || (formData.type !== QUESTION_TYPES.SHORT_ANSWER && formData.options.some(opt => !opt.trim()))}
          >
            {formData.editingId ? 'Update Question' : 'Add Question'}
          </button>
          </div>
        </form>
      </div>

      {/* Existing Questions section */}
      <div className="rounded-lg bg-white p-8 shadow-default">
        <h3 className="mb-6 text-xl font-semibold text-dark">Existing Questions</h3>
        
        {questions.length === 0 ? (
          <p className="text-sm text-gray-500">No questions added yet</p>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border border-stroke p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Q{index + 1}: {question.type}</span>
                    <p className="text-base font-medium text-dark">{question.text}</p>
                    <br></br>
                    <p className="text-base font-medium text-dark">{question.explanation}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {question.options && question.options.length > 0 &&
                    <div className="mt-3 space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`flex items-center px-3 py-1 rounded ${option.isCorrect ? 'bg-green-50' : ''}`}
                        >
                          <span className={`inline-block w-4 h-4 rounded-full border mr-2 ${option.isCorrect ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></span>
                          <span className={option.isCorrect ? 'font-medium text-green-700' : 'text-gray-700'}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}