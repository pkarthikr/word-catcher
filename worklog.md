5/31 
* Cleaned up some part of the codebase. 
* Added Break Tags after certain sentences

6/1
* Setting up Local Debugging, Installing Local DynamoDB
Links: 
https://stackoverflow.com/questions/52424226/alexa-skill-local-could-not-write-to-dynamodb
https://letmypeoplecode.com/posts/alexa_local_debugger/

6/7: 
* Created DB Helpers and updated it to a Promise

6/8: 
* Clean up the DB Helper file so we do not have to use the variables twice. 
* DB Helpers - Get User / Modify the function in such a way that we check for user Availability and not their last answered Day
Up Next: 
* Check what was the lastAnsweredDay's value and they have answered this week's question or not
* Depending on User's performance for the day, surface the right message
* GameOn