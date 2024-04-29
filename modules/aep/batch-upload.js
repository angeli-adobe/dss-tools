const fs = require('fs');
const axios = require('axios');
const auth = require('../auth.js');
const moment = require('moment');

// DEMO POT EMEA - Alberto Angeli Demo
let parameters = {
    clientId: '',
    clientSecret: '',
    scope: '',
    ims_org: '',
    sandbox_name: '',
    datasetId: ''
}

// Get token

async function getToken() {
    var t = await auth.getToken(parameters);
    return t.access_token;
}

function _setCredentials(data) {
    parameters = {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        scope: data.scope,
        ims_org: data.ims_org,
        sandbox_name: data.sandbox_name,
        datasetId: data.datasetId
    };
    var c = ""
}




async function _uploadFile() {
    let t = await getToken();
    //  Create batch
    // AXIOS POST request
    let createBatchResponse = await axios({
        method: 'post',
        url: 'https://platform.adobe.io/data/foundation/import/batches',
        headers: {
            'Authorization': 'Bearer ' + t,
            'x-api-key': parameters.clientId,
            'Content-Type': 'application/json',
            'x-gw-ims-org-id': parameters.ims_org,
            'x-sandbox-name': parameters.sandbox_name
        },
        data: {
            "datasetId": parameters.datasetId, // Datacenter Availability - test
            "inputFormat": {
                "format": "json"
                // "isMultiLineJson": true
            }
        }
    });

    console.log("Batch ID >> " + createBatchResponse.data.id);
    //  Upload file
    let file = fs.readFileSync("/Users/angeli/git/dss-tools/output/dsn-availability/data-for-aep_delta.json", 'utf8')
    let AEPFilePath = "data-for-aep_delta.json";

    //  AXIOS POST request
    let uploadFileUrl = 'https://platform.adobe.io/data/foundation/import/batches/{batchId}/datasets/{datasetId}/files/{filePath}'
    uploadFileUrl = uploadFileUrl
        .replace("{batchId}", createBatchResponse.data.id)
        .replace("{datasetId}", parameters.datasetId)
        .replace("{filePath}", AEPFilePath);

    //  AXIOS PUT request
    let uploadFileResponse = await axios({
        method: 'put',
        data: file,
        url: uploadFileUrl,
        headers: {
            'Authorization': 'Bearer ' + t,
            'x-api-key': parameters.clientId,
            'Content-Type': 'application/octet-stream',
            'x-gw-ims-org-id': parameters.ims_org,
            'x-sandbox-name': parameters.sandbox_name
        }
    }).catch(function (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }
        //console.log(error.config);
    });
    //  Complete batch
    //  Add AXIOS POST request with query parameters

    let completeBatchResponse = await axios({
        method: 'post',
        url: 'https://platform.adobe.io/data/foundation/import/batches/' + createBatchResponse.data.id,
        headers: {
            'Authorization': 'Bearer ' + t,
            'x-api-key': parameters.clientId,
            'Content-Type': 'application/json',
            'x-gw-ims-org-id': parameters.ims_org,
            'x-sandbox-name': parameters.sandbox_name
        },
        params: {
            'action': 'complete'
        }
    });

    console.log(completeBatchResponse.data)
}

module.exports = {
    setCredentials: _setCredentials,
    uploadFile: _uploadFile
}