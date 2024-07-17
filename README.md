# Guardian AI Metaculus CLI
Guardian AI's Metaculus CLI leverages various APIs to predict outcomes for questions on Metaculus. It uses [AskNews](https://asknews.app/) for gathering relevant news articles and OpenAI for generating predictions. This project is open-sourced and maintained by [Guardian AI](https://guardianai.io).

This project is a rewrite in javascript of the [notebook](https://colab.research.google.com/drive/1tc383HraMZOiyfKFF1EXAtlTYbsuv3Q5?usp=sharing) in python provided by Asknews.

You will find the original prompt, and some variations.

In order to improve predictions for certain topics we will add integration with data sources from Guardian AI. 

## Installation
To get started with the project, clone the repository and install the dependencies using npm:

```
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

To use the CLI, you can link the package:

```
npm link
```

You can also run the main script directly without linking:

bash
Copy code


Before running the project, ensure you have a .env file with the necessary configuration.

## Usage
Usage
The Guardian AI Metaculus CLI is designed to predict outcomes for questions listed on Metaculus, leveraging AskNews for gathering relevant news articles and OpenAI for generating predictions. The CLI supports predicting outcomes for a specific question, all open questions, or the first open question in the list.

### CLI Commands
CLI Commands
The project provides the following commands to interact with the CLI:


* Predict the outcome for a specific question by providing its ID:

```bash
ganswer --id 1234
```

* Predict the outcomes for all open questions:

```bash
ganswer --all
# Or
ganswer -a
```

* Predict the outcome for the first open question in the list:

```bash
ganswer --first
# Or
ganswer -f
```

Use `ganswer -h` for a full help message:

```
Usage: ganswer [options]

Guardian AI Metaculus CLI

Options:
  -V, --version         output the version number
  -f, --first [string]  Answer the first question in the list of open questions.
  -i, --id [integer]    Provide the id of the question to answer
  -a, --all             Answer all the open questions.
  -h, --help            display help for command
```

## Environment Variables
Create a .env file in the root directory of your project and add the following environment variables. You can use the .env.example file as a reference:

```
# AskNews API
ASKNEWS_CLIENT_ID=
ASKNEWS_SECRET=
AKSNEWS_FORECAST_API=true

# OpenAI API credentials 
OPENAI_API_KEY=

# Metaculus API
METACULUS_TOKEN=
TOURNAMENT_ID=3349
API_BASE_URL=https://www.metaculus.com/api2

# Submit your predictions to Metaculus
SUBMIT_PREDICTION=true
```

Ensure you have valid API keys and tokens for AskNews, OpenAI, and Metaculus. Predictions are available only with the `Analyst` plan.

## Contributing
We welcome contributions to enhance the functionality and performance of this project. If you're interested in contributing, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.

## Acknowledgements
This project leverages APIs from AskNews and OpenAI.

