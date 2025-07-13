import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizHistory } from '../services/api';
import { useToast } from '../components/Toast';

export default function QuizHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getQuizHistory();
                setHistory(response.data);
            } catch (err) {
                setError(err.message);
                addToast(err.message || 'Failed to load quiz history.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [addToast]);

    if (loading) return <div className="text-center py-10">Loading History...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-dark mb-6">Quiz History</h1>
            {history.length === 0 ? (
                <div className="text-center bg-white p-8 rounded-lg shadow-default">
                    <p className="text-body-color">You haven't completed any quizzes yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-default overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Completed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map(item => (
                                <tr key={item.quizSessionId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">{item.questionBankName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-body-color">{new Date(item.completedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-body-color">
                                        <span className="font-semibold">{item.score}</span> / {item.totalQuestions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/history/${item.quizSessionId}`} className="text-primary hover:text-primary/80">
                                            View Results
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
