const AWS = require('aws-sdk');
const tableName = 'word_catcher_dev_one';
AWS.config.update({region:'us-east-1'});
var dbHelper = function() {};

var myDynamoDB = new AWS.DynamoDB({
    endpoint: 'http://localhost:2525', // If you change the default url, change it here
    accessKeyId: 'fakekey',
    secretAccessKey: 'fake-secret-access-key',
    region: "us-east-1",
    apiVersion: 'latest'
});

/* Function to get Details of the User */
dbHelper.prototype.getUser = (user) => {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: tableName,
            Key: {
              'userID': {S: user}
            }
          };

          myDynamoDB.getItem(params, (err,data) => {
              if(err){
                return reject(err)
              } else {
                  console.log("Before resolving");
                  console.log(params);
                  console.log(user);
                  console.log(data);
                  resolve(data);
              }
          })
          
    });
}

/* Function to add Details of the User */
dbHelper.prototype.addUser = (userID, player) => {
  return new Promise((resolve, reject) => {
    var params = {
        TableName: tableName,
        Item: {
          'userID' : {S: userID},
          'externalPlayerID': {S: player.externalPlayerID},
          'gamerName': {S: player.profile.name},
          'gamerAvatar': {S: player.profile.avatar}
        }
    };

    myDynamoDB.putItem(params, (err,data) => {
        if(err){
          return reject(err)
        } else {
            console.log(data);
            resolve(data);
        }
    })
    
  });
}
/* Function to insert the user's successful answer */
dbHelper.prototype.updateLastAnsweredDay = (userID, currentDay) => {
  return new Promise((resolve, reject) => {
        var params = {
            TableName: tableName,
            Item: {
              'userID' : {S: userID},
              'lastAnsweredDay': {S: currentDay}
            }
        };

        myDynamoDB.putItem(params, (err,data) => {
            if(err){
              return reject(err)
            } else {
                console.log(data);
                resolve(data);
            }
        })
        
  });
}

/* Function to insert the user's answer attempt for the weekly theme*/
dbHelper.prototype.updateWeeklyAnswerAttempt = (userID, currentWeek, currentDay) => {
  return new Promise((resolve, reject) => {

        var params;
        if (currentDay === undefined){
          params = {
              ExpressionAttributeNames: {
                "#LAT": "lastAnsweredWeek"
              },
              ExpressionAttributeValues: {
                ":w": {
                  S: currentWeek
                }
              },
              Key: {
                "userID": {
                  S: userID
                }
              },
              ReturnValues: "ALL_NEW",
              TableName: tableName,
              UpdateExpression: "SET #LAT = :w"
          };
        } else {
          params = {
              ExpressionAttributeNames: {
                "#LAT": "lastAnsweredWeek",
                "#AT": "attempt"
              },
              ExpressionAttributeValues: {
                ":w": {
                  S: currentWeek
                },
                ":a": {
                  N: currentDay
                }
              },
              Key: {
                "userID": {
                  S: userID
                }
              },
              ReturnValues: "ALL_NEW",
              TableName: tableName,
              UpdateExpression: "SET #LAT = :w, #AT = :a"
          };
        } 

        myDynamoDB.updateItem(params, (err,data) => {
            if(err){
              return reject(err)
            } else {
                console.log(data);
                resolve(data);
            }
        });
        
  });
}

module.exports = new dbHelper();