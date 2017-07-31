# Electric Imp impCentral API (v5) JavaScript library

This library is a JavaScript wrapper for the [Electric Imp impCentral API (v5)](https://preview-apidoc.electricimp.com). **TODO: change the link to the final one**

It's main purpose is to support development processes. The library is not intended for factory and production processes.

## Library Usage

Using the library you are doing:

- the library installation

- the library instantiation

- initializing the library by an access token

- calling impCentral API methods

- processing results

- processing errors

All these steps are described in the following sections.

### Installation

[Node.js](https://nodejs.org/en/) is required.
You can download the Node.js [pre-built binary](https://nodejs.org/en/download/) for your platform or install Node.js via [package manager](https://nodejs.org/en/download/package-manager).
Once `node` and `npm` are installed, you need to execute the following command to set up *imp-central-api*:

```
npm install -g imp-central-api
```

### Instantiation

To instantiate this library you need to call [ImpCentralApi class](./lib/ImpCentralApi.js) constructor.

By default the library works with the following impCentral API base endpoint: **TODO: add the final link**

You can optionally pass to the constructor an alternative impCentral API base endpoint. This can be used to connect to private impCloud installations.

After instantiation use *ImpCentralApi* property getters to obtain the subclasses which provide methods to access impCentral API.

```javascript
const ImpCentralApi = require('imp-central-api');
const impCentralApi = new ImpCentralApi('<api_base_endpoint>');
impCentralApi.auth.<auth_method()>;
impCentralApi.products.<products_method()>;
```

### Authorization / Authentication

Access to almost every endpoint in impCentral API requires authorization. Authorization is presented via an access_token in the HTTP Authorization header.

[Auth class](./lib/Auth.js) of the library provides several methods to initialize the library by an access token to allow further access to impCentral API:

- if you already have a non-expired access token, e.g. saved after the previous usage of the library: use *set accessToken()* property setter;
- if an access token is expired but you have a refresh token, e.g. saved after the previous usage of the library or received after *login()* methods: use *refreshAccessToken()* method;
- if you have a login key: use *getAccessToken()* with login key;
- alternatively, use *login()* method with identifier/password pair and, additionally, if Two-Factor authentication is enabled for your account, *loginWithOtp()* method with one-time password. Login methods allow to obtain the both - an access token and a refresh token.

**TODO: leave only the finally supported methods**

Remember, when access token is expired any call of impCentral API returns 401 error. You need to re-initialize the library by a new access token using one of the above methods.

For more information see [impCentral API: Auth](https://preview-apidoc.electricimp.com/#tag/Auth) **TODO: change the link to the final one**

### impCentral API Calls

This library is a JavaScript wrapper for impCentral API.

[Accounts](./lib/Accounts.js), [Products](./lib/Products.js), [DeviceGroups](./lib/DeviceGroups.js), [Devices](./lib/Devices.js), [Deployments](./lib/Deployments.js), [LogStreams](./lib/LogStreams.js) classes of the library map to the corresponding groups in impCentral API. Interface methods of these classes mostly map one to one to the corresponding methods of impCentral API.

See **impCentral API Coverage** section below for the list of the supported impCentral API methods.

### Results Processing

All requests to impCentral API are made asynchronously via Promises. Any method which sends a request returns a Promise:

- if operation succeeds, the Promise resolves with HTTP response body;
- if operation fails, the Promise rejects with an error.

You need to parse the returned HTTP response body by your code.

The exact format of HTTP response body for every request can be found in [Electric Imp impCentral API (v5)](https://preview-apidoc.electricimp.com). **TODO: change the link to the final one**

### Errors Processing

[Error classes](./lib/Errors.js) define two types of errors returned by the library.

- *InvalidDataError* - indicates that the library detects one of the following errors:
  - the library is wrongly initialized. E.g. access token is not provided or obtained;
  - the library method is called with invalid argument(s);
  - internal library problem(s).
  
  The error details can be found in the message property.
  
  These errors usually happen during an application development. Usually they should be fixed during debugging and therefore should not occur after the application has been deployed.

- *ImpCentralApiError* - Indicates that HTTP request to impCentral API failed.

  The error details can be found in the message, statusCode and body properties. The exact body format is described in [impCentral API: Error Handling](https://preview-apidoc.electricimp.com/#section/Error-Handling) **TODO: change the link to the final one**
  
  This error may occur during the normal execution of an application.

## impCentral API Coverage

**TODO: update according to the final impCentral API list of functionality**

**TODO: change impCentral links to the final ones** 

### [impCentral API: Accounts](https://preview-apidoc.electricimp.com/accounts.html#tag/Accounts)

Library Class: [Accounts](./lib/Accounts.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| Retrieve account information | *accounts.get()* |
| Create an Account | Not supported |
| Verify an Email Address and Finalize an Account | Not supported |

### [impCentral API: Auth](https://preview-apidoc.electricimp.com/accounts.html#tag/Auth)

Library Class: [Auth](./lib/Auth.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| Authenticate and Retrieve an Access Token | *auth.login()*, *auth.loginWithOTP()* |
| Exchange a refresh token or login key for an Access Token | *auth.refreshAccessToken()*, *auth.getAccessToken()* |

### [impCentral API: Products](https://preview-apidoc.electricimp.com/#tag/Products)

Library Class: [Products](./lib/Products.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| List existing Products | *products.list()* |
| Create a Product | *products.create()* |
| Retrieve a specific Product | *products.get()* |
| Update a specific Product | *products.update()* |
| Delete a specific Product | *products.delete()* |
| Update a specific Webhook | Not supported (Factory/Production feature) |

### [impCentral API: Device Groups](https://preview-apidoc.electricimp.com/#tag/DeviceGroups)

Library Class: [DeviceGroups](./lib/DeviceGroups.js)

Only *'development_devicegroup'* type is accepted as an argument in device group creation/update. Factory/Production related parameters are ignored.

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| List existing Device Groups | *deviceGroups.list()* |
| Create a Device Group | *deviceGroups.create()* |
| Get a specific DeviceGroup | *deviceGroups.get()* |
| Update a specific Device Group | *deviceGroups.update()* |
| Delete a specific DeviceGroup | *deviceGroups.delete()* |
| Restart all the devices in a Device Group | *deviceGroups.restartDevices()* |
| Assign one or more devices to a Device Group | *deviceGroups.addDevices()* |
| Remove one or more devices from a Device Group |  *deviceGroups.removeDevices()* |

### [impCentral API: Devices](https://preview-apidoc.electricimp.com/#tag/Devices)

Library Classes: [Devices](./lib/Devices.js), [DeviceGroups](./lib/DeviceGroups.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| Assign one or more devices to a Device Group | *deviceGroups.addDevices()* |
| Remove one or more devices from a Device Group |  *deviceGroups.removeDevices()* |
| List the Devices owned by the Account | *devices.list()* |
| Get a specific Device | *devices.get()* |
| Remove a specific device from the account | *devices.delete()* |
| Update a Device | *devices.update()* |
| Restart a Device | *devices.restart()* |

### [impCentral API: Deployments](https://preview-apidoc.electricimp.com/#tag/Deployments)

Library Class: [Deployments](./lib/Deployments.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| List the account's Deployment history | *deployments.list()* |
| Create a Deployment | *deployments.create()* |
| Get a specific Deployment | *deployments.get()* |
| Update a specific Deployment | *deployments.update()* |
| Delete a Deployment | *deployments.delete()* |

### [impCentral API: Logs](https://preview-apidoc.electricimp.com/#tag/Logs)

Library Classes: [LogStreams](./lib/LogStreams.js), [Devices](./lib/Devices.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| Get historical logs for a specific Device | *devices.getLogs()* |
| Request a new logstream, Retrieve logs from a Logstream | *logStreams.create()* |
| Add a device to a Logstream | *logStreams.addDevice()* |
| Remove a device from a Logstream | *logStreams.removeDevice()* |

### [impCentral API: Webhooks](https://preview-apidoc.electricimp.com/#tag/Webhooks)

Not supported (Factory/Production feature).

### impCentral API: Collaboration

Not supported by impCentral API yet.

## Examples

1. library initialization using email/password login:

**TODO: change the url in the example to the final one**

```javascript
const ImpCentralApi = require('imp-central-api');
const Errors = ImpCentralApi.Errors;
const impCentralApi = new ImpCentralApi('https://api.ei.run/v5');

let token;
impCentralApi.auth.login('<user email for Electric Imp Account>', 
                         '<user password for Electric Imp Account>').then(result => {
    token = result.access_token;
}).catch(error => {
    if (error instanceof Errors.InvalidDataError) {
        // process InvalidDataError
        console.log(error.message);
    }
    else if (error instanceof Errors.ImpCentralApiError) {
        // process impCentral API HTTP request failure
        console.log(error.statusCode);
        console.log(error.message);
        console.log(error.body);
    }
});
```

2. library initialization using existing access token, product and device group creation:

```javascript
const ImpCentralApi = require('imp-central-api');
const DeviceGroups = ImpCentralApi.DeviceGroups;

const impCentralApi = new ImpCentralApi();

// the library can be initialized by non-expired access token if exists 
// (e.g. saved after the previous usage of the library)
impCentralApi.auth.accessToken = token;

let accountId;
// retrieve account information
impCentralApi.accounts.get('me').then(account => {
    accountId = account.data.id;
    // create a product
    // accountId is optional parameter, if not provided, 
    // product will be assigned to the acting user
    return impCentralApi.products.create({ name : 'test_product'}, accountId);
}).then(product => {
    // retrieve the newly created product id
    let productId = product.data.id;
    // create a device group
    return impCentralApi.deviceGroups.create(
        productId,
        DeviceGroups.TYPE_DEVELOPMENT,
        {name : 'temp_sensors', description : 'temperature sensors'});
}).then(deviceGroup => {
    // retrieve the newly created device group id
    let devGroupId = deviceGroup.data.id;
    console.log(devGroupId);
}).catch(error => {
    console.log(error);
});
```

3. list existing device groups with filters and restart all the devices from the specified device group:

```javascript
let filters = {
    [DeviceGroups.FILTER_OWNER_ID] : accountId,
    [DeviceGroups.FILTER_TYPE] : DeviceGroups.TYPE_DEVELOPMENT
};
let devGroupName = 'temp_sensors';
// list existing device groups
impCentralApi.deviceGroups.list(filters).then(devGroups => {
    for (let devGroup of devGroups.data) {
        // find device group by name and restart associated devices
        if (devGroup.attributes.name === devGroupName) {
            impCentralApi.deviceGroups.restartDevices(devGroup.id);
        }
    }
}).catch(error => {
    console.log(error);
});
```

4. get historical logs for a specific Device

```javascript
let deviceId = '<existing Device ID>';
let pageNumber = 1;
let pageSize = 10;
impCentralApi.devices.getLogs(deviceId, pageNumber, pageSize).then(logs => {
    for (let log of logs.data) {
        console.log(log.ts + ': '+ log.msg);
    }    
}).catch(error => {
    console.log(error);
});
```

5. Retrieve logs from a LogStream for all devices assigned to a device group

```javascript
const Devices = ImpCentralApi.Devices;

function logMessage(message) {
    console.log(message);
}

function logState(state) {
    console.log(state);
}

let deviceGroupId = '<existing Device Group ID>';
let logStreamId;
impCentralApi.logStreams.create(logMessage, logState).then(logStream => {
    logStreamId = logStream.data.id;
    return impCentralApi.devices.list({[Devices.FILTER_DEVICE_GROUP_ID] : deviceGroupId});
}).then(devices => {
    return Promise.all(devices.data.map(device => impCentralApi.logStreams.addDevice(logStreamId, device.id)));
}).catch(error => {
    console.log(error);
});
```

## License

This library is licensed under the [MIT License](./LICENSE).

## Release History ?
