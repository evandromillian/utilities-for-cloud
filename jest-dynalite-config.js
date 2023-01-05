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
      {
        TableName: "table_sk",
        KeySchema: [
          { 
              AttributeName: "pk", 
              KeyType: "HASH" 
          },
          { 
            AttributeName: "sk", 
            KeyType: "RANGE" 
          },
        ],
        AttributeDefinitions: [
          {
            AttributeName: "pk", 
            AttributeType: "S" 
          },
          {
            AttributeName: "sk", 
            AttributeType: "S"
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
        data: [
          { 
            pk: 'user', 
            sk: '2',
            username: 'batman', 
            email: 'bruce@wayne.enterprises' 
          },
          { 
            pk: 'user', 
            sk: '3',
            username: 'ww', 
            email: 'diana@lesbos.island' 
          },
          { 
            pk: 'user', 
            sk: '4',
            username: 'flash', 
            email: 'barry.allen@ny.com' 
          }
        ],
      },
    ],
    //basePort: 8002,
  };