import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizSession, submitQuiz, QUESTION_TYPES } from '../services/api'; // Assuming these are added to api.js
import { useToast } from '../components/Toast';

// --- Helper component for rendering a single question ---
const QuestionCard = ({ question, userAnswer, onAnswerChange }) => {
    const handleCheckboxChange = (optionText) => {
        const currentAnswers = userAnswer || [];
        const newAnswers = currentAnswers.includes(optionText)
            ? currentAnswers.filter(ans => ans !== optionText)
            : [...currentAnswers, optionText];
        onAnswerChange(newAnswers);
    };

    const renderOptions = () => {
        switch (question.type) {
            case QUESTION_TYPES.MULTIPLE_CHOICE:
                return (
                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <label key={index} className="flex items-center p-3 rounded-lg border border-stroke hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={(userAnswer || []).includes(option.text)}
                                    onChange={() => handleCheckboxChange(option.text)}
                                />
                                <span className="ml-3 text-dark">{option.text}</span>
                            </label>
                        ))}
                    </div>
                );
            case QUESTION_TYPES.TRUE_FALSE:
                return (
                     <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <label key={index} className="flex items-center p-3 rounded-lg border border-stroke hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    className="h-5 w-5 text-primary focus:ring-primary"
                                    checked={userAnswer === option.text}
                                    onChange={() => onAnswerChange(option.text)}
                                />
                                <span className="ml-3 text-dark">{option.text}</span>
                            </label>
                        ))}
                    </div>
                );
            case QUESTION_TYPES.SHORT_ANSWER:
                return (
                    <input
                        type="text"
                        className="w-full rounded-md border border-stroke p-3 text-dark focus:border-primary focus:ring-primary"
                        placeholder="Type your answer here..."
                        value={userAnswer || ''}
                        onChange={(e) => onAnswerChange(e.target.value)}
                    />
                );
            default:
                return <p>Unsupported question type.</p>;
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-default">
            <p className="text-lg font-semibold text-dark leading-relaxed">{question.text}</p>
            <div className="mt-6">
                {renderOptions()}
            </div>
        </div>
    );
};


// --- Main Quiz Page Component ---
export default function QuizPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                // This function needs to be added to your api.js
                const response = await getQuizSession(sessionId); 
                setQuizData(response.data);
                // Initialize answers state
                const initialAnswers = {};
                response.data.questions.forEach(q => {
                    initialAnswers[q.id] = q.type === QUESTION_TYPES.MULTIPLE_CHOICE ? [] : '';
                });
                setUserAnswers(initialAnswers);
            } catch (err) {
                setError(err.message);
                addToast(err.message || 'Failed to load quiz session.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [sessionId, addToast]);

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to finish the quiz?")) return;

        setLoading(true);
        const submissionData = {
            answers: Object.entries(userAnswers).map(([questionId, answer]) => ({
                questionId: parseInt(questionId),
                // Ensure answer is always an array for the backend
                selectedAnswers: Array.isArray(answer) ? answer : [answer].filter(Boolean)
            }))
        };
        
        try {
            // This function needs to be added to your api.js
            const response = await submitQuiz(sessionId, submissionData);
            setQuizResult(response.data);
        } catch (err) {
            setError(err.message);
            addToast(err.message || "Failed to submit quiz.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !quizResult) return <div className="text-center py-10">Loading Quiz...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

    // --- Render Quiz Results ---
    if (quizResult) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="text-center bg-white p-8 rounded-lg shadow-default mb-8">
                    <h1 className="text-3xl font-bold text-dark">Quiz Completed!</h1>
                    <p className="text-lg text-body-color mt-2">You scored</p>
                    <p className="text-5xl font-bold text-primary my-4">{quizResult.score} / {quizResult.totalQuestions}</p>
                    <button onClick={() => navigate('/')} className="mt-4 rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90">
                        Back to Home
                    </button>
                </div>

                <div className="space-y-6">
                    {quizResult.results.map((result, index) => (
                        <div key={result.questionId} className={`p-6 rounded-lg shadow-default ${result.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                            <p className="font-semibold text-dark">Q{index + 1}: {result.questionText}</p>
                            <div className="mt-4 text-sm space-y-2">
                                <p>Your answer: <span className="font-medium">{result.userAnswers.join(', ') || 'No answer'}</span></p>
                                {!result.isCorrect && (
                                    <p>Correct answer: <span className="font-medium text-green-700">{result.correctAnswers.join(', ')}</span></p>
                                )}
                                <p className="pt-2 border-t border-stroke mt-2 text-dark-600">Explanation: {result.explanation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    if (!quizData) return null; // Should be covered by loading/error states

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    // --- Render Active Quiz ---
    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-center text-dark">Quiz in Progress</h1>
                <p className="text-center text-body-color">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <QuestionCard
                question={currentQuestion}
                userAnswer={userAnswers[currentQuestion.id]}
                onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
            />

            <div className="flex justify-between mt-8">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="rounded-md border border-stroke px-6 py-3 text-dark hover:bg-gray-100 disabled:opacity-50"
                >
                    Previous
                </button>

                {currentQuestionIndex === quizData.questions.length - 1 ? (
                    <button onClick={handleSubmit} className="rounded-md bg-green-600 px-6 py-3 text-dark hover:bg-green-700">
                        Finish Quiz
                    </button>
                ) : (
                    <button onClick={handleNext} className="rounded-md bg-primary px-6 py-3 text-dark hover:bg-primary/90">
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}
