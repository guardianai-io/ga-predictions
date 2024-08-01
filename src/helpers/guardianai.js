import axios from 'axios';
import 'dotenv/config';

const { GUARDIANAI_API_KEY, GUARDIANAI_BASE_URL } = process.env;


const gaClient = axios.create({
    baseURL: GUARDIANAI_BASE_URL,
    headers: { Authorization: `users API-Key ${GUARDIANAI_API_KEY}` }
});

const gaSubmitPrediction = async (question, prediction, explanation) => {
    try {
        const result = await gaClient.post('/api/predictions', { question: question.title, questionId: question.id, questionUrl: question.url, prediction, explanation });
        return result.data;
    } catch (error) {
        console.error(error.response.data);
        return null;
    }

}

export {
    gaSubmitPrediction
}