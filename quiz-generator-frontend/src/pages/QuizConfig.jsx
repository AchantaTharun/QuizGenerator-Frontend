import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuizConfig({ bank, onStartQuiz }) {
  const [config, setConfig] = useState({
    questionCount: 10,
    shuffleQuestions: true,
    shuffleOptions: true,
    questionTypes: ['MultipleChoice', 'TrueFalse']
  });

  const navigate = useNavigate();

  const handleStart = () => {
    onStartQuiz(config);
    navigate('/quiz');
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configure Quiz: {bank?.name}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Number of Questions (Max: {bank?.questionCount || 10})
          </label>
          <input
            type="number"
            min="1"
            max={bank?.questionCount || 10}
            value={config.questionCount}
            onChange={(e) => setConfig({...config, questionCount: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="space-y-2 mb-4">
          <label className="block text-sm font-medium">Question Types</label>
          {['MultipleChoice', 'TrueFalse', 'ShortAnswer'].map(type => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.questionTypes.includes(type)}
                onChange={() => {
                  const newTypes = config.questionTypes.includes(type)
                    ? config.questionTypes.filter(t => t !== type)
                    : [...config.questionTypes, type];
                  setConfig({...config, questionTypes: newTypes});
                }}
                className="rounded"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2 mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.shuffleQuestions}
              onChange={() => setConfig({...config, shuffleQuestions: !config.shuffleQuestions})}
              className="rounded"
            />
            <span>Shuffle Questions</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.shuffleOptions}
              onChange={() => setConfig({...config, shuffleOptions: !config.shuffleOptions})}
              className="rounded"
            />
            <span>Shuffle Answer Options</span>
          </label>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}