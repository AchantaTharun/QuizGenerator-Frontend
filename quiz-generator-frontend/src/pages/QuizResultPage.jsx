import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuizResult } from '../services/api';
import { useToast } from '../components/Toast';

export default function QuizResultPage() {
    const { sessionId } = useParams();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await getQuizResult(sessionId);
                setResultData(response.data);
            } catch (err) {
                setError(err.message);
                addToast(err.message || 'Failed to load quiz results.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [sessionId, addToast]);

    if (loading) return <div className="text-center py-10">Loading Results...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    if (!resultData) return null;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center bg-white p-8 rounded-lg shadow-default mb-8">
                <h1 className="text-3xl font-bold text-dark">Quiz Results</h1>
                <p className="text-md text-body-color mt-1">For quiz: <span className="font-semibold">{resultData.questionBankName}</span></p>
                <p className="text-5xl font-bold text-primary my-4">{resultData.score} / {resultData.totalQuestions}</p>
                <Link to="/history" className="mt-4 rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90">
                    Back to History
                </Link>
            </div>

            <div className="space-y-6">
                {resultData.results.map((result, index) => (
                    <div key={result.questionId} className={`p-6 rounded-lg shadow-default ${result.isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                        <p className="font-semibold text-dark">Q{index + 1}: {result.questionText}</p>
                        <div className="mt-4 text-sm space-y-2">
                            <p>Your answer: <span className="font-medium">{result.userAnswers.join(', ') || 'No answer'}</span></p>
                            {!result.isCorrect && (
                                <p>Correct answer: <span className="font-medium text-green-700">{result.correctAnswers.join(', ')}</span></p>
                            )}
                            <p className="pt-2 border-t border-stroke mt-2 text-gray-600">Explanation: {result.explanation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
