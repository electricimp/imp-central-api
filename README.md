# The Electric Imp impCentral&trade; API JavaScript Library #

*imp-central-api* is a JavaScript (Node.js) wrapper for the [impCentral API](https://apidoc.electricimp.com).

![Build Status](https://cse-ci.electricimp.com/app/rest/builds/buildType:(id:ImpCentralApi_BuildAndTest)/statusIcon)

## Library Usage ##

To use *imp-central-api*, you will need to:

- Install Node.js and the library.
- Instantiate the library.
- Initialize the library with an access token.
- Call impCentral API endpoints.
- Process the results, or
- Process any errors you encountered.

Each of these steps are described in the following sections.

### Installation ###

[Node.js](https://nodejs.org/en/) version 8 or higher is required. You can download the Node.js [pre-built binary](https://nodejs.org/en/download/) for your platform, or install Node.js via [package manager](https://nodejs.org/en/download/package-manager). Once `node` and `npm` are installed, you need to execute the following command to set up *imp-central-api*:

```bash
npm install -g imp-central-api
```

#### Proxy Setup ####

If *imp-central-api* is going to connect to the impCentral API via a proxy, one of the following environment variables should be set to a value in URL format:
- `HTTPS_PROXY` (or `https_proxy`) &mdash; for the proxy which passes HTTPs requests.
- `HTTP_PROXY` (or `http_proxy`) &mdash; for the proxy which passes HTTP requests.

Note, the default impCentral API base endpoint is working over HTTPs.

### Instantiation ###

To instantiate this library, call the [ImpCentralApi class](./lib/ImpCentralApi.js) constructor.

By default, *imp-central-api* works with the following impCentral API base endpoint: `https://api.electricimp.com/v5`. You can optionally pass an alternative impCentral API base endpoint into the constructor. This can be used to connect to Private impCloud™ installations. The class method *apiEndpoint()* can be used to obtain the current impCentral API base endpoint.

After instantiation, use [ImpCentralApi class](./lib/ImpCentralApi.js) methods to obtain the subclasses which provide the methods you will use to access specific impCentral API resources. For example:

```javascript
const ImpCentralApi = require('imp-central-api');
const impCentralApi = new ImpCentralApi();
impCentralApi.auth.getAccessToken();
impCentralApi.products.list();
```

### Access Authorization ###

Access to almost every impCentral API endpoint requires authorization: you must supply an access token in an HTTP Authorization header. The library’s [Auth class](./lib/Auth.js) provides several methods to acquire this access token and to refresh it after it has expired. When an access token has expired, any call to the impCentral API will return a 401 error.

- If your access token has not expired, use the method *set accessToken()* to save it for use with future impCentral API calls.
- If your access token has expired, but you have a refresh token which is typically received after calling *login()*, use the *refreshAccessToken()* method to obtain a new access token.
- If you have a login key, call *getAccessToken()* and pass in your login key.
- Alternatively, you can call *login()* with an account username and password pair. 
    - If two-factor authentication is enabled for your account, call *loginWithOtp()* with a one-time password. 

The login methods will return both a new access token and a refresh token.

For more information, please see the [impCentral API documentation](https://apidoc.electricimp.com/#tag/Auth).

### impCentral API Calls ###

The [Accounts](./lib/Accounts.js), [Auth](./lib/Auth.js), [Deployments](./lib/Deployments.js), [DeviceGroups](./lib/DeviceGroups.js), [Devices](./lib/Devices.js), [LogStreams](./lib/LogStreams.js), [Products](./lib/Products.js) and [Webhooks](./lib/Webhooks.js) library classes map to the corresponding impCentral API resources. These classes' methods typically map directly to the corresponding impCentral API endpoints.

See the [impCentral API Coverage](#impcentral-api-coverage) section below for a list of the supported impCentral API endpoints.

### Result Processing ###

All requests are made asynchronously via Promises. Any method which sends a request returns a Promise:

- If the operation succeeds, the Promise resolves with an HTTP response body.
- If the operation fails, the Promise rejects with an error.

Your code needs to parse the returned HTTP response body.

The exact format of HTTP response body for every request can be found [here](https://apidoc.electricimp.com).

### Error Processing ###

[Error classes](./lib/Errors.js) define two types of errors returned by the library:

- *InvalidDataError* Indicates that the library detected one of the following errors:
  - The library has been wrongly initialized, eg. an access token has not been provided or obtained.
  - The library method has been called with invalid argument(s);
  - Internal library problem(s).

  The error details can be found in the *message* property.
  These errors usually happen during an application development. Usually they should be fixed during debugging and therefore should not occur after the application has been deployed.

- *ImpCentralApiError* Indicates that the request to the impCentral API failed.
  The error details can be found in the *message*, *statusCode* and *body* properties. The exact body format is described in the [impCentral API documentation](https://apidoc.electricimp.com/#section/Error-Handling).
  This error may occur during the normal execution of an application.

Use the method *debug()* to enable (*debug(true)*) or disable (*debug(false)*) the library debug output (including error logging). This is disabled by default.

## impCentral API Coverage ##

### [Accounts](https://apidoc.electricimp.com/#tag/Accounts) ###

Library Class: [Accounts](./lib/Accounts.js)

| impCentral API Functionality | Library Methods |
| ---------------------------- | ----------------- |
| Retrieve Account information | *accounts.get()* |
| List Accounts | *accounts.list()* |
| Retrieve Login Keys | *accounts.listLoginKeys()* |
| Create a Login Key | *accounts.createLoginKey()* |
| Retrieve a Login Key | *accounts.getLoginKey()* |
| Delete a Login Key | *accounts.deleteLoginKey()* |
| Update a Login Key | *accounts.updateLoginKey()* |

### [impCentral API: Auth](https://apidoc.electricimp.com/#tag/Auth) ###

Library Class: [Auth](./lib/Auth.js)

| impCentral API Functionality | Library Methods |
| ---------------------------- | ----------------- |
| Authenticate and Retrieve an Access Token | *auth.login()*, *auth.loginWithOTP()* |
| Exchange a refresh token or a login key for an Access Token | *auth.refreshAccessToken()*, *auth.getAccessToken()* |
| Retrieve Refresh Tokens | *auth.getRefreshTokens()* |
| Delete a Refresh Token | *auth.deleteRefreshToken()* |

### [impCentral API: Deployments](https://apidoc.electricimp.com/#tag/Deployments) ###

Library Class: [Deployments](./lib/Deployments.js)

| impCentral API Functionality | Library Methods |
| ---------------------------- | ----------------- |
| List the account’s Deployment history | *deployments.list()* |
| Create a Deployment | *deployments.create()* |
| Get a specific Deployment | *deployments.get()* |
| Update a specific Deployment | *deployments.update()* |
| Delete a Deployment | *deployments.delete()* |

### [impCentral API: Device Groups](https://apidoc.electricimp.com/#tag/DeviceGroups) ###

Library Class: [DeviceGroups](./lib/DeviceGroups.js)

| impCentral API Functionality | Library Methods |
| ---------------------------- | ----------------- |
| List existing Device Groups | *deviceGroups.list()* |
| Create a Device Group | *deviceGroups.create()* |
| Get a specific DeviceGroup | *deviceGroups.get()* |
| Update a specific Device Group | *deviceGroups.update()* |
| Delete a specific DeviceGroup | *deviceGroups.delete()* |
| Restart all the devices in a Device Group | *deviceGroups.restartDevices()* |
| Conditionally restart devices in a Device Group | *deviceGroups.conditionalRestartDevices()* |
| Update the minimum supported deployment for a Device Group | *deviceGroups.updateMinSupportedDeployment()* |
| Assign one or more devices to a Device Group | *deviceGroups.addDevices()* |
| Remove one or more devices from a Device Group | *deviceGroups.removeDevices()* |

### [impCentral API: Devices](https://apidoc.electricimp.com/#tag/Devices) ###

Library Class: [Devices](./lib/Devices.js)

| impCentral API Functionality | Library Methods |
| ---------------------------- | ----------------- |
| List the Devices owned by the Account | *devices.list()* |
| Get a specific Device | *devices.get()* |
| Remove a specific device from the account | *devices.delete()* |
| Update a Device | *devices.update()* |
| Restart a Device | *devices.restart()* |
| Conditionally restart a Device | *devices.conditionalRestart()* |
| Get historical logs for a specific Device | *devices.getLogs()* |

### [impCentral API: Logs](https://apidoc.electricimp.com/#tag/Logs) ###

Library Class: [LogStreams](./lib/LogStreams.js)

| impCentral API Functionality | Library Methods |
| ---------------------------- | ----------------- |
| Request a new logstream, Retrieve logs from a logstream | *logStreams.create()* |
| Add a device to a logstream | *logStreams.addDevice()* |
| Remove a device from a logstream | *logStreams.removeDevice()* |

### [impCentral API: Products](https://apidoc.electricimp.com/#tag/Products) ###

Library Class: [Products](./lib/Products.js)

| impCentral API Functionality | Library Methods |
| ---------------------------- | ----------------- |
| List existing Products | *products.list()* |
| Create a Product | *products.create()* |
| Retrieve a specific Product | *products.get()* |
| Update a specific Product | *products.update()* |
| Delete a specific Product | *products.delete()* |

### [impCentral API: Webhooks](https://apidoc.electricimp.com/#tag/Webhooks) ###

Library Class: [Webhooks](./lib/Webhooks.js)

| impCentral API Functionality | Library Methods |
| ---------------------------- | ----------------- |
| List existing Webhooks | *webhooks.list()* |
| Create a Webhook | *webhooks.create()* |
| Retrieve a Webhook | *webhooks.get()* |
| Update a specific Webhook | *webhooks.update()* |
| Delete a specific Webhook | *webhooks.delete()* |

## Examples ##

1. Library initialization using email/password login:

```javascript
const ImpCentralApi = require('imp-central-api');
const Errors = ImpCentralApi.Errors;
const impCentralApi = new ImpCentralApi();

let token;
impCentralApi.auth.login('<user email for Electric Imp Account>',
                         '<user password for Electric Imp Account>').then(result => {
    token = result.access_token;
}).catch(error => {
    if (error instanceof Errors.InvalidDataError) {
        // Process InvalidDataError
        console.log(error.message);
    }
    else if (error instanceof Errors.ImpCentralApiError) {
        // Process impCentral API HTTP request failure
        console.log(error.statusCode);
        console.log(error.message);
        console.log(error.body);
    }
});
```

2. Library initialization using an existing access token; product and device group creation:

```javascript
const ImpCentralApi = require('imp-central-api');
const DeviceGroups = ImpCentralApi.DeviceGroups;
const impCentralApi = new ImpCentralApi();

// The library can be initialized with a non-expired access token,
// if you have one saved from the last time you used the library
impCentralApi.auth.accessToken = token;

let accountId;
// Retrieve account information
impCentralApi.accounts.get('me').then(account => {
    accountId = account.data.id;
    // Create a product
    // 'accountID' is an optional parameter - if it is not provided,
    // the product will be assigned to the current user
    return impCentralApi.products.create({ name : 'test_product'}, accountID);
}).then(product => {
    // Retrieve the newly created product ID
    let productID = product.data.id;
    // Create a device group
    return impCentralApi.deviceGroups.create(
        productID,
        DeviceGroups.TYPE_DEVELOPMENT,
        {name : 'temp_sensors', description : 'temperature sensors'});
}).then(deviceGroup => {
    // Retrieve the newly created device group ID
    let devGroupID = deviceGroup.data.id;
    console.log(devGroupID);
}).catch(error => {
    console.log(error);
});
```

3. List existing device groups with filters and restart all of the devices in the specified device group:

```javascript
let filters = {
    [DeviceGroups.FILTER_OWNER_ID] : accountId,
    [DeviceGroups.FILTER_TYPE] : DeviceGroups.TYPE_DEVELOPMENT
};

let devGroupName = 'temp_sensors';

// List existing device groups
impCentralApi.deviceGroups.list(filters).then(devGroups => {
    for (let devGroup of devGroups.data) {
        // Find device group by name and restart associated devices
        if (devGroup.attributes.name === devGroupName) {
            impCentralApi.deviceGroups.restartDevices(devGroup.id);
        }
    }
}).catch(error => {
    console.log(error);
});
```

4. Get historical logs for a specific device, using pagination:

```javascript
let deviceID = '<existing Device ID>';
let pageNumber = 1;
let pageSize = 10;
impCentralApi.devices.getLogs(deviceID, pageNumber, pageSize).then(logs => {
    for (let log of logs.data) {
        console.log(log.ts + ': '+ log.msg);
    }
}).catch(error => {
    console.log(error);
});
```

5. Retrieve the logs from a LogStream for all devices assigned to a device group:

```javascript
const Devices = ImpCentralApi.Devices;

function logMessage(message) {
    console.log(message);
}

function logState(state) {
    console.log(state);
}

let deviceGroupID = '<existing Device Group ID>';
let logStreamID;
impCentralApi.logStreams.create(logMessage, logState).then(logStream => {
    logStreamID = logStream.data.id;
    return impCentralApi.devices.list({[Devices.FILTER_DEVICE_GROUP_ID] : deviceGroupId});
}).then(devices => {
    return Promise.all(devices.data.map(device => impCentralApi.logStreams.addDevice(logStreamID, device.id)));
}).catch(error => {
    console.log(error);
});
```

## Testing ##

The library contains [Jasmine](https://www.npmjs.com/package/jasmine) tests in the [spec folder](./spec). To set up and run the tests, you will need to:

1. Clone or download the latest version of the *imp-central-api* repository to a local *imp-central-api* folder, for example by running the command `git clone https://github.com/electricimp/imp-central-api.git imp-central-api`.
1. Install *imp-central-api* dependencies by calling `npm install` from your local *imp-central-api* folder.
1. Set the mandatory environment variables:
    - **IMP_CENTRAL_USER_EMAIL** &mdash; Your impCentral account username or email address.
    - **IMP_CENTRAL_USER_PASSWORD** &mdash; The account password.
1. Set optional environment variables, if needed:
    - **IMP_CENTRAL_API_DEBUG** &mdash; If `true`, displays debug info of the command execution (default: `false`).
    - **IMP_CENTRAL_API_ENDPOINT** &mdash; The impCentral API endpoint (default: *https://api.electricimp.com/v5*).
1. Alternatively, instead of setting environment variables directly, you can specify the values of the corresponding variables in your local [*imp-central-api/spec/config.js* file](./spec/config.js).
1. Run the tests by calling `npm test` from your local *imp-central-api* folder.

It is recommended that your devices do not change their state between online and offline during the tests running.

## License ##

This library is licensed under the [MIT License](./LICENSE).
