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
                console.log("we are error");
                return reject(err)
              } else {
                  // let resolvedData = data.Item.player;
                  // let marshalledData = AWS.DynamoDB.Converter.unmarshall({ resolvedData });
                  // console.log("Before resolving");
                  // console.log(marshalledData)
                  // console.log(params);
                  console.log("we do end up here");
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
              ":d": {
                S: currentDay
              }
            },
            Key: {
              "userID": {
                S: userID
              }
            },
            ReturnValues: "ALL_NEW",
            TableName: tableName,
            UpdateExpression: "SET #LAD = :d"
          };

        myDynamoDB.updateItem(params, (err,data) => {
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