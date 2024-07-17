import axios from 'axios';

import 'dotenv/config'

const METACULUS_TOKEN = process.env.METACULUS_TOKEN;
const TOURNAMENT_ID = process.env.TOURNAMENT_ID;
const API_BASE_URL = process.env.API_BASE_URL;


const authHeaders = {
    headers: { Authorization: `Token ${METACULUS_TOKEN}` }
};

const postQuestionComment = async (questionId, commentText) => {
    await axios.post(
        `${API_BASE_URL}/comments/`,
        {
            comment_text: commentText,
            submit_type: "N",
            include_latest_prediction: true,
            question: questionId,
        },
        authHeaders
    );
};

const postQuestionPrediction = async (questionId, predictionPercentage) => {
    const url = `${API_BASE_URL}/questions/${questionId}/predict/`;
    await axios.post(
        url,
        { prediction: predictionPercentage / 100 },
        authHeaders
    );
};

const getQuestionDetails = async (questionId) => {
    const url = `${API_BASE_URL}/questions/${questionId}/`;
    const response = await axios.get(url, authHeaders);
    return response.data;
};

const listQuestions = async (tournamentId = TOURNAMENT_ID, offset = 0, count = 10) => {
    const url = `${API_BASE_URL}/questions/`;
    const params = {
        limit: count,
        offset,
        has_group: "false",
        order_by: "-activity",
        forecast_type: "binary",
        project: tournamentId,
        status: "open",
        type: "forecast",
        include_description: "true",
    };
    const response = await axios.get(url, { ...authHeaders, params });
    return response.data;
};

export { postQuestionComment, postQuestionPrediction, getQuestionDetails, listQuestions };