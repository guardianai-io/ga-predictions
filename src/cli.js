#!/usr/bin/env node
import 'dotenv/config';
import { program } from "commander";
import chalk from "chalk";
import { predict, predictAll, predictFirst } from "./app.js";



program.version("1.0.0").description("Guardian AI Metaculus CLI");

program
    .option("-f, --first [string]", "Answer the first question in the list of open questions.")
    .option("-i, --id [integer]", "Provide the id of the question to answer")
    .option("-a, --all", "Answer all the open questions.")
    .option("-e, --evaluation", "Evaluate forecasts")
    .action(async (options) => {
        const evaluation = options.evaluation

        if (options.first) {
            console.log(chalk.yellow("Answering the first question in the list of open questions."));
            await predictFirst({ evaluation });
        }

        if (options.id) {
            console.log(chalk.yellow(`Answering question with ID ${options.id}`));
            await predict(options.id);
        }

        if (options.all) {
            chalk.yellow("Answering all the open questions.");
            await predictAll({ evaluation });
        }

        return;
    });

program.parseAsync(process.argv);