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

6/9: 
* Worked on the Weekly Answer attempt capturing 

6/14:
* Write the logic in such a way that Weekly answer does not overwrite database row. 
* Weekly / Daily Answer check

6/21:
* Integrated DocumentClient in DynamoDB
* Submitted Score successfully using GameON SDK

Up Next: 
* Try and figure out why values are not reflecting on GameON SDK
* Update DB Helpers to Document Client