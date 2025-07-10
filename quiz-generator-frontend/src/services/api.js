import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7226/api',
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

export const getQuestionBanks = () => api.get('/questionbanks');
export const createQuestionBank = (bankData) => api.post('/questionbanks', bankData);
export const getQuestionBankForEdit = (id) => api.get(`/questionbanks/${id}`);
export const updateQuestionBank = (id, bankData) => api.put(`/questionbanks/${id}`, bankData);
export const deleteQuestionBank = (id) => api.delete(`/questionbanks/${id}`);

