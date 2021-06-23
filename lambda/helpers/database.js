const AWS = require('aws-sdk');
const tableName = 'word_catcher_dev_one';
AWS.config.update({region:'us-east-1'});
var dbHelper = function() {};

var myDynamoDB = new AWS.DynamoDB.DocumentClient({
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
              'userID':  user
            }
          };

          myDynamoDB.get(params, (err,data) => {
              if(err){
                return reject(err)
              } else {
                  console.log(data);
                  resolve(data);
              }
          })
          
    });
}

/* Function to add Details of the User */
dbHelper.prototype.addUser = (userID, player) => {
  console.log(player.externalPlayerId);
  return new Promise((resolve, reject) => {
    var params = {
          TableName: tableName,
          Item: {
            'userID' : userID,
            'player': player
          }
      };

    myDynamoDB.put(params, (err,data) => {
        if(err){
          return reject(err)
        } else {
            console.log("successs");
            resolve(data);
        }
    })
    
  });
}
/* Function to insert the user's successful answer */
dbHelper.prototype.updateLastAnsweredDay = (userID, currentDay) => {
  return new Promise((resolve, reject) => {
        var params = {
            ExpressionAttributeNames: {
              "#LAD": "lastAnsweredDay"
            },
            ExpressionAttributeValues: {
              ":d": currentDay    
            },
            Key: {
              "userID": userID
            },
            ReturnValues: "ALL_NEW",
            TableName: tableName,
            UpdateExpression: "SET #LAD = :d"
          };

        myDynamoDB.update(params, (err,data) => {
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
                ":w": currentWeek
              },
              Key: {
                "userID": userID
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
                ":w": currentWeek,
                ":a": currentDay
              },
              Key: {
                "userID": userID
              },
              ReturnValues: "ALL_NEW",
              TableName: tableName,
              UpdateExpression: "SET #LAT = :w, #AT = :a"
          };
        } 

        myDynamoDB.update(params, (err,data) => {
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