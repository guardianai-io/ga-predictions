import { getAskNewsForecast } from "./helpers/asknews.js";

const forecast = await getAskNewsForecast("Question: Will SpaceX attempt to catch a Starship booster with the tower before Sept 30, 2024?");

console.log(forecast);