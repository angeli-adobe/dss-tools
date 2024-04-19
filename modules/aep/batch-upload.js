const fs = require('fs');
const axios = require('axios');
const auth = require('../auth.js');
const moment = require('moment');

let credentials = {
    clientId: "2eee98d096464931b663f7c87a55f95b",
    clientSecret: "p8e-rCh5JG23UkJ3mbTc_Nfk35zfxtmHYuhN",
    scope: "openid,AdobeID,read_organizations,additional_info.projectedProductContext,session,additional_info.job_function,additional_info.roles",
    ims_org: "8AB51935659C10E40A495FA2@AdobeOrg",
    sandbox_name: 'alberto-angeli'
}

let datasetId = "662286d3ed1c242ca16dc7ff";

// Get token

async function getToken() {
    // let credentials = {
    //     clientId: process.env.CLIENT_ID,
    //     clientSecret: process.env.CLIENT_SECRET,
    //     scope: process.env.SCOPE
    // }

    // DEMO POT EMEA - Alberto Angeli Demo


    var t = await auth.getToken(credentials);
    return t.access_token;
}

function _setCredentials() {

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
            'x-api-key': credentials.clientId,
            'Content-Type': 'application/json',
            'x-gw-ims-org-id': credentials.ims_org,
            'x-sandbox-name': credentials.sandbox_name
        },
        data: {
            "datasetId": datasetId, // Datacenter Availability - test
            "inputFormat": {
                "format": "json"
                // "isMultiLineJson": true
            }
        }
    });

    console.log("Batch ID >> " + createBatchResponse.data.id);
    //  Upload file
    let filePath = 'File=@"/Users/angeli/git/dss-tools/output/dsn-availability/data-for-aep_full_api_2.json"';
    let AEPFilePath = "data-for-aep_full_api_2.json";

    //  AXIOS POST request
    let uploadFileUrl = 'https://platform.adobe.io/data/foundation/import/batches/{batchId}/datasets/{datasetId}/files/{filePath}'
    uploadFileUrl = uploadFileUrl.replace("{batchId}", createBatchResponse.data.id)
        .replace("{datasetId}", datasetId)
        .replace("{filePath}", AEPFilePath);

    //  AXIOS PUT request
    let uploadFileResponse = await axios({
        method: 'put',
        data: filePath,
        url: uploadFileUrl,
        headers: {
            'Authorization': 'Bearer ' + t,
            'x-api-key': credentials.clientId,
            'Content-Type': 'application/octet-stream',
            'x-gw-ims-org-id': credentials.ims_org,
            'x-sandbox-name': credentials.sandbox_name
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
            'x-api-key': credentials.clientId,
            'Content-Type': 'application/json',
            'x-gw-ims-org-id': credentials.ims_org,
            'x-sandbox-name': credentials.sandbox_name
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