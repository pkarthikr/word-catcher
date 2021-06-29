const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./strings');
const questions = require('./questions');
const dbHelper = require('./helpers/database');
const gameOn = require('./helpers/gameOn.js');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
   async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager; 
        const sessionAttributes = attributesManager.getSessionAttributes();
        const { question } = sessionAttributes;

        const userID = handlerInput.requestEnvelope.context.System.user.userId;
        var speakOutput = '';
        await dbHelper.getUser(userID)
        .then(async (data) => {
            console.log(data);
            
            /* If player does not exist in our DB, then it is a new player and we enter here. Existing players go to the Else Loop*/
            if(data.Item === undefined){
                let player = await gameOn.newPlayer();
                await gameOn.enterMatch
                console.log(player)
                console.log(player.externalPlayerId);

                await dbHelper.addUser(userID, player)
                .then((playerData) => {
                    speakOutput += handlerInput.t('WELCOME_MSG') + handlerInput.t('RULES') + handlerInput.t('READY');
                    let questionMode = 'daily';
                    sessionAttributes.question = {
                        'questionMode': questionMode,
                        'hintUsed': 0
                    }
                    sessionAttributes.player = player;
                    attributesManager.setSessionAttributes(sessionAttributes); 
                }).catch((err) => {
                    console.log("error");
                    console.log(err);
                });    
               
            } else {
                sessionAttributes.player = data.Item.player;
                var currentDay = getCurrentDayOrWeek('day');
                currentDay = currentDay.toString();
                
                /*Check if user has answered any day's question*/
                if (!data.Item.hasOwnProperty('lastAnsweredDay')){
                    speakOutput += handlerInput.t('WELCOME_MSG') + handlerInput.t('RULES') + handlerInput.t('READY');
                    let questionMode = 'daily';
                    sessionAttributes.question = {
                        'questionMode': questionMode,
                        'hintUsed': 0
                    }
                    attributesManager.setSessionAttributes(sessionAttributes); 
                } /*Check if user has attempted today's question*/
                else if (data.Item.lastAnsweredDay != currentDay){
                    speakOutput += handlerInput.t('WELCOME_BACK') + handlerInput.t('READY');
                    let questionMode = 'daily';
                    sessionAttributes.question = {
                        'questionMode': questionMode,
                        'hintUsed': 0
                    }
                    attributesManager.setSessionAttributes(sessionAttributes); 
                } else {
                    /*Check if user has attempted this week's question*/
                    if(data.Item.lastAnsweredWeek === undefined){
                       let questionMode = 'weekly';
                       sessionAttributes.question = {
                           'questionMode': questionMode,
                           'hintUsed': 0
                       }
                       attributesManager.setSessionAttributes(sessionAttributes); 
                       speakOutput += handlerInput.t('ANSWER_WEEKLY_PROMPT');
                    } else {
                       speakOutput += handlerInput.t('ANSWERED_DAILY_QUESTION');   
                    }
                }
            }
             
        })
        .catch((err) => {
            console.log("error");
            console.log(err);
        });      
        

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
        let speakOutput; 
        if(question.questionMode === 'daily'){
            const currentQuestion = getCurrentQuestion();
            question.answer = currentQuestion.answer; 
            attributesManager.setSessionAttributes(sessionAttributes);
    
            speakOutput = currentQuestion.question;
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        } else if(question.questionMode === 'weekly'){
            const currentQuestion = getCurrentQuestion(true);
            speakOutput = currentQuestion.question; 
            question.answer = currentQuestion.answer; 

            attributesManager.setSessionAttributes(sessionAttributes);
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        }   
    }
}

const AnswersIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent') || 
            (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswersOnlyIntent')
    },
    async handle(handlerInput) {
        //TODO: Use the resolved value, not the given value
        //TODO: If the answer is wrong, we are going to give them another chance. Hint Mechanism
        const attributesManager = handlerInput.attributesManager; 
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {question} = sessionAttributes;
        const answer = handlerInput.requestEnvelope.request.intent.slots.answer.value; 
        const actualAnswer = sessionAttributes.question.answer;
        let speakOutput = "";
        let dailyanswerPoint = 0;
        let weeklyAnswerPoint = 0;
        let userID = handlerInput.requestEnvelope.context.System.user.userId;
        const hintUsed = sessionAttributes.question.hintUsed;
        var player = sessionAttributes.player;
        let gameOnPlayer = await gameOn.refreshPlayerSession(player);    


        /*If the answer is correct, we enter here. Incorrect answers go in the else loop*/
        if(answer === actualAnswer){
            if(sessionAttributes.question.questionMode === 'weekly'){
                // Weekly logic
                let today = new Date();
                let currentDay = today.getDay();
                switch(currentDay){
                    case 0:
                        weeklyAnswerPoint = 5;
                        break;
                    case 1:
                        weeklyAnswerPoint = 60;
                        break;
                    case 2:
                        weeklyAnswerPoint = 50;
                        break;
                    case 3:
                        weeklyAnswerPoint = 40;
                        break;
                    case 4:
                        weeklyAnswerPoint = 30;
                        break;
                    case 5:
                        weeklyAnswerPoint = 20;
                        break;
                    case 6:
                        weeklyAnswerPoint = 10;
                        break;
                }
                var currentWeek = getCurrentDayOrWeek('week');
                await dbHelper.updateWeeklyAnswerAttempt(userID, currentWeek)
                .then((data) => {
                    console.log(data);
                })
                .catch((err) => {
                    console.log(err);
                });     

                await gameOn.submitScore(gameOnPlayer, weeklyAnswerPoint);
                let playerScore = await gameOn.getPlayerScore(gameOnPlayer);
                console.log("We are in the Weekly Correct Answer block");
                console.log(playerScore);

                speakOutput += `Correct answer. You get ${weeklyAnswerPoint} points.<break time="0.1s"/> And with that you are ${playerScore.ordinalRank} on our leaderboard for this week with a total of ${playerScore.score} points.`

                speakOutput += handlerInput.t('UPSELL_COME_BACK');
            } else {
                speakOutput = handlerInput.t('CORRECT_ANSWER');
                // The Points Mechanism 
                switch(hintUsed){
                    case 0:
                        dailyanswerPoint = 10;
                        break;
                    case 1:
                        dailyanswerPoint = 5;
                        break; 
                    case 2:
                        dailyanswerPoint = 3;
                        break;
                    default:
                    break;
                }
                var currentDay = getCurrentDayOrWeek('day');
                currentDay = currentDay.toString();
                
                await dbHelper.updateLastAnsweredDay(userID, currentDay)
                .then((data) => {
                    console.log(data);
                })
                .catch((err) => {
                    console.log(err);
                });

                await gameOn.submitScore(gameOnPlayer, dailyanswerPoint);

                speakOutput += `You get ${dailyanswerPoint} points.`;
                speakOutput += handlerInput.t('WEEK_QUESTION_PROMPT');
                question.questionMode = 'weekly';
                attributesManager.setSessionAttributes(sessionAttributes);
            }
        } else {
            if(sessionAttributes.question.questionMode === 'weekly'){
                let today = new Date();
                var currentDay = today.getDay();
                currentDay = currentDay.toString();

                console.log("Entering the if block for weekly wrong answers")
                var currentWeek = getCurrentDayOrWeek('week');
                await dbHelper.updateWeeklyAnswerAttempt(userID, currentWeek, currentDay)
                .then((data) => {
                    console.log("Okay this is done");
                    console.log(data);
                })
                .catch((err) => {
                    console.log("error");
                    console.log(err);
                });     

                if(currentDay != 0){
                    speakOutput += handlerInput.t('WEEKLY_WRONG_ANSWER');
                } else {
                    speakOutput += handlerInput.t('WEEKLY_WRONG_ANSWER_SUNDAY');
                }
                 
            } else {
                let currentQuestion = getCurrentQuestion();
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
    async handle(handlerInput) {
   
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

function getCurrentDayOrWeek(mode) {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    const currentDayNumber = Math.ceil(pastDaysOfYear);
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    let weekString = "week" + weekNumber.toString();

    if(mode == "day"){
        return currentDayNumber;
    } else {
        return weekString;
    }
}


/* Question for the Day */
function getCurrentQuestion(weeklyMode) {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    let weekString = "week" + weekNumber.toString();
    let currentDay;
    if(weeklyMode === true){
        currentDay = 0;
    } else {
        currentDay = today.getDay();
    }
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
