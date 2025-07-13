import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quizgenerator-3nvl.onrender.com/api',
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ message: 'No response from server' });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({ message: error.message });
    }
  }
);

// --- C# ENUM MAPPING ---
// This maps the JavaScript string to the integer value of the C# Enum
const QuestionTypeEnum = {
  MultipleChoice: 0,
  TrueFalse: 1,
  ShortAnswer: 2,
};

// --- PAYLOAD TRANSFORMATION LOGIC ---
// This function converts the React state into the DTO the API expects
const transformQuestionData = (questionData) => {
  const payload = {
    text: questionData.text,
    explanation: questionData.explanation,
    type: QuestionTypeEnum[questionData.type], // Convert string to integer
    options: (questionData.options || []).map((optionText, index) => ({
      text: optionText,
      isCorrect: (questionData.correctAnswers || []).includes(index),
    })),
  };

  // Ensure 'options' is an empty array for ShortAnswer, not an array of empty objects
  if (questionData.type === 'ShortAnswer') {
    payload.options = [];
  }

  return payload;
};


export const getQuestionBanks = () => api.get('/questionbanks');
export const createQuestionBank = (bankData) => api.post('/questionbanks', bankData);
export const getQuestionBankForEdit = (id) => api.get(`/questionbanks/${id}`);
export const updateQuestionBank = (id, bankData) => api.put(`/questionbanks/${id}`, bankData);
export const deleteQuestionBank = (id) => api.delete(`/questionbanks/${id}`);
export const importQuestionBank = (bankData) => api.post('/questionbanks/import', bankData); // New


// Question Bank Questions API
export const getQuestionBankQuestions = async (bankId) => {
  const response = await api.get(`/question-banks/${bankId}/questions`);
  return response;
};

export const addQuestionToBank = async (bankId, questionData) => {
  const transformedPayload = transformQuestionData(questionData); //
  const response = await api.post(`/question-banks/${bankId}/questions`, transformedPayload);
  return response;
};

export const updateQuestionInBank = async (bankId, questionId, questionData) => {
  const transformedPayload = transformQuestionData(questionData); //
  const response = await api.put(`/question-banks/${bankId}/questions/${questionId}`, transformedPayload);
  return response;
};

export const deleteQuestionFromBank = async (bankId, questionId) => {
  const response = await api.delete(`/question-banks/${bankId}/questions/${questionId}`);
  return response;
};

// --- QUESTION CONSTANTS ---
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 0, //
  TRUE_FALSE: 1, //
  SHORT_ANSWER: 2 //
};

// Default question templates
export const getDefaultQuestion = (type) => {
  switch (type) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return {
        text: '',
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        options: ['', ''],
        correctAnswers: []
      };
    case QUESTION_TYPES.TRUE_FALSE:
      return {
        text: '',
        type: QUESTION_TYPES.TRUE_FALSE,
        options: ['True', 'False'],
        correctAnswers: [0]
      };
    case QUESTION_TYPES.SHORT_ANSWER:
      return {
        text: '',
        type: QUESTION_TYPES.SHORT_ANSWER,
        options: [],
        correctAnswers: []
      };
    default:
      return {
        text: '',
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        options: ['', ''],
        correctAnswers: []
      };
  }
};



// --- Quiz API ---
export const createQuizSession = (config) => api.post('/quiz/create', config);

export const getQuizSession = (sessionId) => api.get(`/quiz/${sessionId}`);

export const submitQuiz = (sessionId, submissionData) => api.post(`/quiz/${sessionId}/submit`, submissionData);

export const getQuizHistory = () => api.get('/quiz/history');

export const getQuizResult = (sessionId) => api.get(`/quiz/${sessionId}/result`);
