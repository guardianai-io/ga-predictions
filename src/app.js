import { getQuestionDetails, listQuestions, postQuestionPrediction, postQuestionComment } from './helpers/metaculus.js';
import { getGptPrediction, getGptEvaluation, getAnalysis } from './helpers/openai.js';
import chalk from "chalk";

import 'dotenv/config'


const SUBMIT_PREDICTION = process.env.SUBMIT_PREDICTION === 'true';



const predict = async (questionId) => {
    const questionDetails = await getQuestionDetails(questionId);

    console.log(chalk.yellow(`Predicting for question ID ${questionId}`));
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

    console.log(chalk.yellow(`Predicting for question ID ${questionId}`));
    const { probability, shortTermForecast, longTermForecast, rationale, explanation } = await getGptEvaluation(questionDetails);

    const probabilityTemplate = `----------\n\n#Forecast Result\n\n## Forecast Probability: ${probability}%\n**Short-term Forecast Probability: ${shortTermForecast.probability}%**\n\n**Long-term Forecast Probability: ${longTermForecast.probability}%**\n\n`;
    const rationaleTemplate = `# Rationale:\n\n ${rationale}\n\n`;
    const explanationTemplate = `# Reasoning:\n\n ${explanation}\n\n`;
    const shortTermForecastTemplate = `----------\n\n# Short-term Forecast:\n\n ${shortTermForecast.formatted}\n\n`;
    const longTermForecastTemplate = `# Long-term Forecast:\n\n ${longTermForecast.formatted}\n\n`;
    const output = `${probabilityTemplate}${rationaleTemplate}${explanationTemplate}${shortTermForecastTemplate}${longTermForecastTemplate}`;

    console.log(chalk.yellow(`Asking the analyst for the final prediction`));
    const finalResult = await getAnalysis(output, questionDetails);
    const finalOutput = `# Analyst Prediction: ${finalResult.probability}%\n\n** Final Forecast Probability** :${probability}%\n\n** Short-term Forecast Probability** :${shortTermForecast.probability}%\n\n** Long-term Forecast Probability** :${longTermForecast.probability}%\n\n**Rational** : ${finalResult.rationale}\n\n**Explanation** : ${finalResult.explanation}\n\n----------\n\n${output}`



    if (!SUBMIT_PREDICTION) {
        console.log(`------OUTPUT-------\n\n${finalOutput}`);
    }

    if (probability !== null && SUBMIT_PREDICTION) {
        await postQuestionPrediction(questionId, finalResult.probability);
        const comment = `[Guardian AI](https://guardianai.io)'s prediction ([code and prompts](https://github.com/guardianai-io/ga-predictions)):\n\n${finalOutput}\n\n[Guardian AI](https://guardianai.io)\n\n`;
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
