import OpenAIApi from 'openai';
import dayjs from 'dayjs';

import { getAskNewsContext, getAskNewsForecast } from './asknews.js';
import { forecaster, professor, professorAndAFriend } from '../prompts/index.js';

import 'dotenv/config'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASKNEWS_FORECAST_API = process.env.ASKNEWS_FORECAST_API === 'true';
const oaiClient = new OpenAIApi({ apiKey: OPENAI_API_KEY })

// const PROMPT_TEMPLATE = forecaster
const PROMPT_TEMPLATE = ASKNEWS_FORECAST_API ? professorAndAFriend : professor;



const getGptPrediction = async (questionDetails) => {
    const today = dayjs().format("YYYY-MM-DD");

    const { title, resolution_criteria, description, fine_print } = questionDetails;
    let newsArticles = "";

    const askNewsResult = await getAskNewsContext(title);
    newsArticles = askNewsResult.llmContext;

    const askNewsForecast = ASKNEWS_FORECAST_API ? await getAskNewsForecast(title, fine_print) : undefined;

    let content = PROMPT_TEMPLATE
        .replace("{title}", title)
        .replace("{news_articles}", newsArticles)
        .replace("{today}", today)
        .replace("{background}", description)
        .replace("{resolution_criteria}", resolution_criteria)
        .replace("{fine_print}", fine_print);

    if (askNewsForecast) {
        content = content.replace("{trusted_forecast}", askNewsForecast);
    }

    const chatCompletion = await oaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: content
            }
        ],
        response_format: { type: "json_object" }
    });

    const gptText = chatCompletion.choices[0].message.content;
    const parsedDict = JSON.parse(gptText);
    const probability = parsedDict.probability;
    const rationale = parsedDict.rationale;

    return { probability, askNewsResult, rationale, askNewsForecast: ASKNEWS_FORECAST_API ? askNewsForecast : undefined };
};

export { getGptPrediction };