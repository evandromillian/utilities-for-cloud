module.exports = {
    tables: [
      {
        TableName: "table",
        KeySchema: [
          { 
              AttributeName: "PK", 
              KeyType: "HASH" 
          }
        ],
        AttributeDefinitions: [
          {
              AttributeName: "PK", 
              AttributeType: "S" 
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
        data: [
          {
            PK: "lock-test",
            LockValue: 0,
          },
        ],
      },
    ],
    //basePort: 8002,
  };