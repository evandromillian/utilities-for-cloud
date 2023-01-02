module.exports = {
    tables: [
      {
        TableName: "table",
        KeySchema: [
          { 
              AttributeName: "id", 
              KeyType: "HASH" 
          }
        ],
        AttributeDefinitions: [
          {
              AttributeName: "id", 
              AttributeType: "S" 
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
        data: [
          {
            id: "lock-test",
            LockValue: 0,
          },
        ],
      },
    ],
    //basePort: 8002,
  };