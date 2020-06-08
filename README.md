# TwinJet ATC Client

JavaScript client for TwinJet ATC service (https://twinjet.co/)

[![Build Status](https://travis-ci.org/EdouardDem/twinjet-atc-client.svg?branch=master)](https://travis-ci.org/EdouardDem/twinjet-atc-client) [![codecov](https://codecov.io/gh/EdouardDem/twinjet-atc-client/branch/master/graph/badge.svg)](https://codecov.io/gh/EdouardDem/twinjet-atc-client)

For more information about the TwinJet ATC API: https://twinjet.co/developer/

## Installation

```bash
npm install --save twinjet-atc-client
```

## Usage

### New client

Before making requests, you need to instantiate a new client:

```javascript
const TwinJetATCClient = require('twinjet-atc-client');

const options = {
    api_token: 'Ahngohsieb5aijooghugheF6iel0AeGh',
};
const client = new TwinJetATCClient(options);
```

#### More options

You can use more options in client constructor:

```javascript
const options = {
    api_token: 'Ahngohsieb5aijooghugheF6iel0AeGh', // Required
    base_url: 'https://api.other.io/v1', // Override API base URL. Default: 'https://www.twinjet.co/api/v1'
    timeout: 2000, // Requests timeout, in milliseconds. 0 to disable. Default: 10000
    live: false // Live or test mode. Default: true
}
```

### Create a job

```javascript
const requestId = await client.create({
    order_contact_name: 'Larry Bluejeans',
    order_contact_phone: '5555555555',
    pick_address: {
        address_name: 'TCB Courier',
        street_address: '565 Ellis St',
        floor: 'Unit B',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94109',
        contact: 'Larry Bluejeans',
        special_instructions: 'Come right in',
    },
    deliver_address: {
        address_name: 'Important Office Building',
        street_address: '560 Mission St',
        floor: '13th floor',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94105',
        contact: 'P. Pete',
        special_instructions: 'Go to the messenger center',
    },
    ready_time: new Date(),
    deliver_from_time: Date.now(),
    deliver_to_time: '2014-08-04T14:54:28.630613-07:00',
    service_id: 21,
    order_total: 20.0,
    tip: 5.0,
    webhook_url: 'https://www.myawesomecompany.io/order/1234/',
    job_items: [
        {
            quantity: 4,
            description: 'Fried Chickens',
        },
        {
            quantity: 1,
            description: 'Coke',
        },
    ],
});

// requestId = 'A1B2C3D4E5'
```

### Cancel a job

````javascript
const response = await client.cancel({
    request_id: 'A1B2C3D4E5',
});

// response example: https://twinjet.co/developer/#statusjson
````

You can also use `external_id` or `job_id` to identify the job.

### Update a job

````javascript
const response = await client.update(
    {
        request_id: 'A1B2C3D4E5',
    },
    {
        order_contact_name: 'Larry Bluejeans',
        order_contact_phone: '5555555555',
        ready_time: new Date(),
        deliver_from_time: Date.now(),
        deliver_to_time: '2014-08-04T14:54:28.630613-07:00',
        webhook_url: 'https://www.myawesomecompany.io/order/1234/',
        job_items: [
            {
                quantity: 4,
                description: 'Fried Chickens',
            },
            {
                quantity: 1,
                description: 'Coke',
            },
        ],
    }
);

// response example: https://twinjet.co/developer/#statusjson
````

You can also use `external_id` or `job_id` to identify the job.

### Job status

````javascript
const response = await client.status({
    request_id: 'A1B2C3D4E5',
});

// response example: https://twinjet.co/developer/#statusjson
````

You can also use `external_id` or `job_id` to identify the job.

### Address validation

````javascript
const response = await client.addressValidation({
    pick_address: {
        address_name: 'TCB Courier',
        street_address: '565 Ellis St',
        floor: 'Unit B',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94109',
        contact: 'Larry Bluejeans',
        special_instructions: 'Come right in',
    },
    deliver_address: {
        address_name: 'Important Office Building',
        street_address: '560 Mission St',
        floor: '13th floor',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94105',
        contact: 'P. Pete',
        special_instructions: 'Go to the messenger center',
    },
});

// response example: https://twinjet.co/developer/#verifyjson
````

## TypeScript

This package includes TypeScript definitions.

```typescript
import TwinJetATCClient from 'twinjet-atc-client';

const client = new TwinJetATCClient({ api_token: '...'});
```

## License

[MIT](https://github.com/EdouardDem/twinjet-atc-client/blob/master/LICENSE)
