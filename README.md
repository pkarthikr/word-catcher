Skill Name : Word Catcher

1st Time User Experience (n Day)

Customer: Open Word Catcher
Alexa: <plays an intro music> Welcome to Word Catcher, <tag-line>. <rules>. Are you ready to play the game?
Customer: Yes
Alexa: What's a five letter word that has three hands?
Customer: is it <correct answer>
Alexa: <plays a correct answer sound> You are correct. Almost 40% of the users answered that correctly. You get 10 points for answering that correctly. Do you want to guess this week's theme as well? <Upsell to come back tomorrow>

Wrong Answer Experience 

Alexa: What's a five letter word that has three hands?
Customer: is it <wrong answer>
Alexa: I am going to give you a hint and here's the hint <hint>. When this is broken, it is right twice a day
Customer: is it <right answer>
Alexa: Bingo. You get 5 points. 

Return Experience (n+1st Day)
Customer: Open Word Catcher
Alexa: I am delighted that you came back to play another round of Word Catcher with me. <Update on Leaderboard>. Are you ready for today's question. 
Customer: Yes
Alexa: <question for n+1 Day>
Customer: is it <correct answer>
Alexa: <plays a correct answer sound> You are correct. Almost 40% of the users answered that correctly. You get 10 points for answering that correctly. <Upsell to come back tomorrow>

Both hints fail
Alexa: I am going to give you a hint and here's the hint <hint>. When this is broken, it is right twice a day
Customer: is it <wrong answer>
Alexa: Oops, looks like today's a not so good day for you. <consolation message>


Think about : 
* Leaderboard
* Gameplay Mechanics
* Publish skill 
* Purchasing options 
* Streak 

oxygenbox: What is you catch a word each day and each word is a clue to a weekly puzzle?
goldzulu: Explore AppSync and GraphQL 
Week's Theme : Time 


Clock n
Meridian n+1 
Alarm n+2
Hour n+3
Seconds n+4
Minutes n+5
Time n+6

Chance : 60


Architecture Decisions : 

Questions - JSON 
User Preferences / User's Ranking / User's correct answers / history - DynamoDB table. 
iScreemCodes : So instead of calculating the week and date, wouldnt it be a lot less code/overhead just to have the date field in the question