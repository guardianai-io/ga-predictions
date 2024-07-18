import { getQuestionDetails, listQuestions, postQuestionPrediction, postQuestionComment } from './helpers/metaculus.js';
import { getGptPrediction } from './helpers/openai.js';

import 'dotenv/config'


const SUBMIT_PREDICTION = process.env.SUBMIT_PREDICTION === 'true';



const predict = async (questionId) => {
    const questionDetails = await getQuestionDetails(questionId);
    console.log(`Question: ${questionDetails.title}\n\nResolution criteria: ${questionDetails.resolution_criteria}\n\nDescription: ${questionDetails.description}\n\nFine print: ${questionDetails.fine_print}\n\n`);

    const { probability, askNewsResult, rationale, askNewsForecast } = await getGptPrediction(questionDetails);

    const probabilityTemplate = `Probability: ${probability}%\n\n`;
    const rationaleTemplate = `Rationale:\n\n ${rationale}\n\n`;
    const sourcesTemplate = `Sources:\n\n ${askNewsResult.formattedArticles}\n\n`;
    const askNewsForecastTemplate = askNewsForecast ? `AskNews Forecast:\n\n${askNewsForecast}\n\n` : '';
    const output = `${probabilityTemplate}${rationaleTemplate}${sourcesTemplate}${askNewsForecastTemplate}`;
    if (!SUBMIT_PREDICTION) {
        console.log(`------OUTPUT-------\n\n${output}`);
    }


    if (probability !== null && SUBMIT_PREDICTION) {
        await postQuestionPrediction(questionId, probability);
        const gptResult = `${probabilityTemplate}${rationaleTemplate}`;
        const comment = `GPT\n\n${gptResult}\n\n${sourcesTemplate}\n\n${askNewsForecast ? askNewsForecastTemplate : ""}\n\n [Guardian AI](https://guardianai.io)\n\n`;
        console.log(comment);
        await postQuestionComment(questionId, comment);
    }
}

const predictWithEvaluation = async (questionId) => {
    const questionDetails = await getQuestionDetails(questionId);
    console.log(`Question: ${questionDetails.title}\n\nResolution criteria: ${questionDetails.resolution_criteria}\n\nDescription: ${questionDetails.description}\n\nFine print: ${questionDetails.fine_print}\n\n`);

    const { probability, shortTermForecast, longTermForecast, rationale, explanation } = await getGptEvaluation(questionDetails);

    const probabilityTemplate = `# Probability: ${probability}%\n\n`;
    const rationaleTemplate = `# Rationale:\n\n ${rationale}\n\n`;
    const explanationTemplate = `# Reasoning:\n\n ${explanation}\n\n`;
    const shortTermForecastTemplate = `# Short-term Forecast:\n\n ${shortTermForecast}\n\n`;
    const longTermForecastTemplate = `# Long-term Forecast:\n\n ${longTermForecast}\n\n`;
    const output = `${probabilityTemplate}${rationaleTemplate}${explanationTemplate}${shortTermForecastTemplate}${longTermForecastTemplate}$`;

    if (!SUBMIT_PREDICTION) {
        console.log(`------OUTPUT-------\n\n${output}`);
    }

    if (probability !== null && SUBMIT_PREDICTION) {
        await postQuestionPrediction(questionId, probability);
        const comment = `[Guardian AI](https://guardianai.io)'s prediction:\n\n${output}\n\n [Guardian AI](https://guardianai.io)\n\n`;
        console.log(comment);
        await postQuestionComment(questionId, comment);
    }

}

const predictAll = async ({ evaluation }) => {
    const questions = await listQuestions();
    const openQuestionIds = questions.results.filter(q => q.active_state === "OPEN").map(q => q.id);

    console.log("Open Questions:");
    openQuestionIds.forEach(id => console.log(id));

    for (const id of openQuestionIds) {
        try {
            if (evaluation) {
                await predictWithEvaluation(id);
            } else {
                await predict(id);
            }
        } catch (error) {
            console.error(`Failed to predict for question ID ${id}:`, error);
        }
    }
};

const predictFirst = async ({ evaluation }) => {
    const questions = await listQuestions();
    const openQuestionIds = questions.results.filter(q => q.active_state === "OPEN").map(q => q.id);

    console.log("Open Questions:");
    openQuestionIds.forEach(id => console.log(id));

    try {
        if (evaluation) {
            await predictWithEvaluation(openQuestionIds[0]);
        } else {
            await predict(openQuestionIds[0]);
        }
    } catch (error) {
        console.error(`Failed to predict for question ID ${openQuestionIds[0]}:`, error);
    }
};


export { predict, predictAll, predictFirst };
