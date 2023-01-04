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
          { 
            id: 'user:2', 
            username: 'batman', 
            email: 'bruce@wayne.enterprises' 
          },
          { 
            id: 'user:3', 
            username: 'ww', 
            email: 'diana@lesbos.island' 
          },
          { 
            id: 'user:4', 
            username: 'flash', 
            email: 'barry.allen@ny.com' 
          }
        ],
      },
    ],
    //basePort: 8002,
  };