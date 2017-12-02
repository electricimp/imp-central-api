# Electric Imp impCentral API (v5) JavaScript library

This library is a JavaScript (Node.js) wrapper for the [Electric Imp impCentral API (v5)](https://preview-apidoc.electricimp.com). **TODO: change the link to the final one**

## Library Usage

Using the library you are doing:
- the library installation,
- the library instantiation,
- initializing the library by an access token,
- calling impCentral API methods,
- processing results,
- processing errors.

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

By default the library works with the following impCentral API base endpoint: [https://api.electricimp.com/v5](https://api.electricimp.com/v5) **TODO: check if the link is final**

You can optionally pass to the constructor an alternative impCentral API base endpoint. This can be used to connect to private impCloud installations. *apiEndpoint()* getter of the [ImpCentralApi class](./lib/ImpCentralApi.js) can be used to obtain impCentral API base endpoint used by the instance of ImpCentralApi class.

After instantiation use [ImpCentralApi class](./lib/ImpCentralApi.js) property getters to obtain the subclasses which provide methods to access impCentral API.

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

Remember, when access token is expired any call of impCentral API returns 401 error. You need to re-initialize the library by a new access token using one of the above methods.

For more information see [impCentral API: Auth](https://preview-apidoc.electricimp.com/#tag/Auth) **TODO: change the link to the final one**

### impCentral API Calls

This library is a JavaScript wrapper for impCentral API.

[Accounts](./lib/Accounts.js), [Auth](./lib/Auth.js), [Deployments](./lib/Deployments.js), [DeviceGroups](./lib/DeviceGroups.js), [Devices](./lib/Devices.js), [LogStreams](./lib/LogStreams.js), [Products](./lib/Products.js), [Webhooks](./lib/Webhooks.js) classes of the library map to the corresponding groups of impCentral API. Interface methods of these classes mostly map one to one to the corresponding methods of impCentral API.

See [impCentral API Coverage](#impcentral-api-coverage) section below for the list of the supported impCentral API methods.

### Results Processing

All requests to impCentral API are made asynchronously via Promises. Any method which sends a request returns a Promise:
- if operation succeeds, the Promise resolves with HTTP response body;
- if operation fails, the Promise rejects with an error.

You need to parse the returned HTTP response body by your code.

The exact format of HTTP response body for every request can be found in [Electric Imp impCentral API (v5)](https://preview-apidoc.electricimp.com). **TODO: change the link to the final one**

### Errors Processing

[Error classes](./lib/Errors.js) define two types of errors returned by the library:

- *InvalidDataError* - indicates that the library detects one of the following errors:
  - the library is wrongly initialized. E.g. access token is not provided or obtained;
  - the library method is called with invalid argument(s);
  - internal library problem(s).

  The error details can be found in the message property.
  These errors usually happen during an application development. Usually they should be fixed during debugging and therefore should not occur after the application has been deployed.

- *ImpCentralApiError* - Indicates that HTTP request to impCentral API failed.

  The error details can be found in the message, statusCode and body properties. The exact body format is described in [impCentral API: Error Handling](https://preview-apidoc.electricimp.com/#section/Error-Handling) **TODO: change the link to the final one**
  This error may occur during the normal execution of an application.

Use *debug(value)* setter of the [ImpCentralApi class](./lib/ImpCentralApi.js) to enable (*value = true*) or disable (*value = false*) the library debug output (including errors logging). Disabled by default (after the library instantiation).

## impCentral API Coverage

**TODO: update according to the final impCentral API list of functionality**

**TODO: change impCentral links to the final ones**

### [impCentral API: Accounts](https://preview-apidoc.electricimp.com/#tag/Accounts)

Library Class: [Accounts](./lib/Accounts.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| Retrieve account information (**TODO: not publicly specified yet**) | *accounts.get()* |
| Retrieve Login Keys | *accounts.listLoginKeys()* |
| Create a Login Key | *accounts.createLoginKey()* |
| Retrieve a Login Key | *accounts.getLoginKey()* |
| Delete a Login Key | *accounts.deleteLoginKey()* |
| Update a Login Key | *accounts.updateLoginKey()* |

### [impCentral API: Auth](https://preview-apidoc.electricimp.com/#tag/Auth)

Library Class: [Auth](./lib/Auth.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| Authenticate and Retrieve an Access Token | *auth.login()*, *auth.loginWithOTP()* |
| Exchange a refresh token or a login key for an Access Token | *auth.refreshAccessToken()*, *auth.getAccessToken()* |
| Retrieve Refresh Tokens | *auth.getRefreshTokens()* |
| Delete a Refresh Token | *auth.deleteRefreshToken()* |

### [impCentral API: Deployments](https://preview-apidoc.electricimp.com/#tag/Deployments)

Library Class: [Deployments](./lib/Deployments.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| List the account's Deployment history | *deployments.list()* |
| Create a Deployment | *deployments.create()* |
| Get a specific Deployment | *deployments.get()* |
| Update a specific Deployment | *deployments.update()* |
| Delete a Deployment | *deployments.delete()* |

### [impCentral API: Device Groups](https://preview-apidoc.electricimp.com/#tag/DeviceGroups)

Library Class: [DeviceGroups](./lib/DeviceGroups.js)

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

Library Class: [Devices](./lib/Devices.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| List the Devices owned by the Account | *devices.list()* |
| Get a specific Device | *devices.get()* |
| Remove a specific device from the account | *devices.delete()* |
| Update a Device | *devices.update()* |
| Restart a Device | *devices.restart()* |
| Get historical logs for a specific Device | *devices.getLogs()* |

### [impCentral API: Logs](https://preview-apidoc.electricimp.com/#tag/Logs)

Library Class: [LogStreams](./lib/LogStreams.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| Request a new logstream, Retrieve logs from a Logstream | *logStreams.create()* |
| Add a device to a Logstream | *logStreams.addDevice()* |
| Remove a device from a Logstream | *logStreams.removeDevice()* |

### [impCentral API: Products](https://preview-apidoc.electricimp.com/#tag/Products)

Library Class: [Products](./lib/Products.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| List existing Products | *products.list()* |
| Create a Product | *products.create()* |
| Retrieve a specific Product | *products.get()* |
| Update a specific Product | *products.update()* |
| Delete a specific Product | *products.delete()* |

### [impCentral API: Webhooks](https://preview-apidoc.electricimp.com/#tag/Webhooks)

Library Class: [Webhooks](./lib/Webhooks.js)

| impCentral API Functionality | Library Method(s) |
| ---------------------------- | ----------------- |
| List existing Webhooks | *webhooks.list()* |
| Create a Webhook | *webhooks.create()* |
| Retrieve a Webhook | *webhooks.get()* |
| Update a specific Webhook | *webhooks.update()* |
| Delete a specific Webhook | *webhooks.delete()* |

## Examples

1. library initialization using email/password login:

**TODO: change the url in the example to the final one**

```javascript
const ImpCentralApi = require('imp-central-api');
const Errors = ImpCentralApi.Errors;
const impCentralApi = new ImpCentralApi('https://api.electricimp.com/v5');

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
