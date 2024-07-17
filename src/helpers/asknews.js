import { AskNewsSDK } from '@emergentmethods/asknews-typescript-sdk';
import dayjs from 'dayjs';

import 'dotenv/config'

const ASKNEWS_CLIENT_ID = process.env.ASKNEWS_CLIENT_ID;
const ASKNEWS_SECRET = process.env.ASKNEWS_SECRET;

const ask = new AskNewsSDK({
    clientId: ASKNEWS_CLIENT_ID,
    clientSecret: ASKNEWS_SECRET,
    scopes: ['news', 'stories', 'chat'],
    // scopes: ['news', 'stories', 'forecast'],
})

const formatAskNewsContext = (hotArticles, historicalArticles) => {
    let formattedArticles = "Here are the relevant news articles:\n\n";

    if (hotArticles.length > 0) {
        hotArticles.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
        hotArticles.forEach(article => {
            const pubDate = dayjs(article.pub_date).format("MMMM DD, YYYY hh:mm A");
            formattedArticles += `**${article.eng_title}**\n${article.summary}\nOriginal language: ${article.language}\nPublish date: ${pubDate}\nSource:[${article.source_id}](${article.article_url})\n\n`;
        });
    }

    if (historicalArticles.length > 0) {
        historicalArticles.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
        historicalArticles.forEach(article => {
            const pubDate = dayjs(article.pub_date).format("MMMM DD, YYYY hh:mm A");
            formattedArticles += `**${article.eng_title}**\n${article.summary}\nOriginal language: ${article.language}\nPublish date: ${pubDate}\nSource:[${article.source_id}](${article.article_url})\n\n`;
        });
    }

    if (hotArticles.length === 0 && historicalArticles.length === 0) {
        formattedArticles += "No articles were found.\n\n";
    } else {
        formattedArticles += `*Generated by AI at [AskNews](https://asknews.app), check out the [API](https://docs.asknews.app) for more information*.`;
    }

    return formattedArticles;
};

const getAskNewsContext = async (query) => {
    const hotResponse = await ask.news.searchNews({
        query,
        n_articles: 5,
        return_type: "both",
        strategy: "latest news",
        diversify_sources: true,
    });

    const historicalResponse = await ask.news.searchNews({
        query,
        n_articles: 20,
        return_type: "both",
        strategy: "news knowledge",
        diversify_sources: true,
    });

    const llmContext = hotResponse.asString + historicalResponse.asString;
    const formattedArticles = formatAskNewsContext(hotResponse.asDicts, historicalResponse.asDicts);
    return { llmContext, formattedArticles };
};

const parseAskNewsArticles = (sources) => {
    let formattedArticles = "";
    sources.forEach(article => {
        const pubDate = dayjs(article.pub_date).format("MMMM DD, YYYY hh:mm A");
        formattedArticles += `**${article.engTitle}**\n${article.summary}\nOriginal language: ${article.language}\nPublish date: ${pubDate}\nSource:[${article.sourceId}](${article.articleUrl})\n\n`;
    })
    return formattedArticles;
}

const parseWebResults = (webResults) => {
    let formattedResults = "";
    webResults.forEach(result => {
        formattedResults += `**${result.title}**\n${result.source}\nKey Points: ${result.key_points.map(k => `${k}\n`).join('')}\n\n`;
    })
    return formattedResults;

}

const parseAskNewsForecast = (forecast) => {
    return `Forecast: ${forecast.forecast}\n\nResolution Criteria: ${forecast.resolutionCriteria}\n\nReasoning: ${forecast.reasoning}\n\nSources: ${parseAskNewsArticles(forecast.sources)}\n\nTimeline to resolution: ${forecast.timeline.map(t => `${t}\n`).join('')}\n\nProbability: ${forecast.probability}\n\nLLM Confidence: ${forecast.llmConfidence}\n\nWeb Results: ${parseWebResults(forecast.webSearchResults)}\n\nSummary: ${forecast.summary}\n\nReconciled Information: ${forecast.reconciledInformation}\n\nUnique Information: ${forecast.uniqueInformation}\n\n`;

}

const getAskNewsForecast = async (query) => {
    const response = await ask.forecast.getForecast({
        query,
        lookback: 180,
        articlesToUse: 50,
        model: 'claude-3-5-sonnet-20240620',
        webSearch: true,
        // additionalContext: "",
    })
    return parseAskNewsForecast(response);
};

export { getAskNewsContext, getAskNewsForecast, parseAskNewsForecast };