// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./strings');
const questions = require('./questions');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager; 
        const sessionAttributes = attributesManager.getSessionAttributes();

        const { question } = sessionAttributes;
        // let persistentAttributes = await attributesManager.getPersistentAttributes();
        // console.log("PERSPERSPERS");
        // console.log(persistentAttributes);
        // if(persistentAttributes.hintUsed >= 1){
        //     // Code for not asking question
        // }

        /* First Time User */
        const speakOutput = handlerInput.t('WELCOME_MSG') + handlerInput.t('RULES') + handlerInput.t('READY');
        let questionMode = 'daily';
        
        sessionAttributes.question = {
            'questionMode': questionMode,
            'hintUsed': 0
        }
        attributesManager.setSessionAttributes(sessionAttributes);
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
    },
    handle(handlerInput) {
        // Daily Question Mode
        // TODO: Get the Question Mode and serve the question to the user.
        // TODO: Clean the code. Make it a function. Differentiate between the daily question vs weekly question
        const attributesManager = handlerInput.attributesManager; 
        const sessionAttributes = attributesManager.getSessionAttributes();
        // TODO: what does { } mean and how does this stuff work? 
        const {question} = sessionAttributes; 

        const currentQuestion = getCurrentQuestion();
        question.answer = currentQuestion.answer; 
        attributesManager.setSessionAttributes(sessionAttributes);

        let speakOutput = currentQuestion.question;
        return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
       
    }
}

const AnswersIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent') || 
            (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswersOnlyIntent')
    },
    handle(handlerInput) {
        //TODO: Use the resolved value, not the given value
        //TODO: If the answer is wrong, we are going to give them another chance. Hint Mechanism
        const attributesManager = handlerInput.attributesManager; 
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {question} = sessionAttributes;
        const answer = handlerInput.requestEnvelope.request.intent.slots.answer.value; 
        const actualAnswer = sessionAttributes.question.answer;
        let speakOutput = "";
        let currentQuestion = getCurrentQuestion();
        const hintUsed = sessionAttributes.question.hintUsed;
        console.log("Hint Used"+hintUsed);

        if(answer === actualAnswer){
            speakOutput = handlerInput.t('CORRECT_ANSWER');
            
            // The Points Mechanism 
            switch(hintUsed){
                case 0:
                    speakOutput += "You get 10 points"; 
                    break;
                case 1:
                    speakOutput += "You get 5 points"; 
                    break; 
                case 2:
                    speakOutput += "You get 3 points";
                    break;
                default:
                break;
            }
        } else {
            speakOutput = handlerInput.t('WRONG_ANSWER');
            if(hintUsed === 0){
                speakOutput += currentQuestion.first_hint
            } else if(hintUsed === 1){
                speakOutput += currentQuestion.second_hint
            } else {
                speakOutput = 'No more hints for you';
            }
            question.hintUsed = hintUsed + 1;
            attributesManager.setSessionAttributes(sessionAttributes);
        }

        

        return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("Reprompt")
        .getResponse();
    }
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* Code for Interceptors*/
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};

/* Question for the Day */
function getCurrentQuestion() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    let weekString = "week" + weekNumber.toString();
    let currentDay = today.getDay();
    return questions[weekString][currentDay];

}
// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        YesIntentHandler,
        AnswersIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        ) 
    .addRequestInterceptors(LocalisationRequestInterceptor)
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();
