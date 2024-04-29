const axios = require("axios");
const inquirer = require("inquirer");
const _ = require("underscore");

const credentialsList = require("../config.js");

const TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3"

async function init() {

    //  Create an array with company names to be used for the prompt
    const companyNameList = _.map(credentialsList, function (c) {
        return {
            name: c.companyName,
            value: c
        }
    });

    //  Ask the user to select the company
    var a = await selectCompany(companyNameList)
    // console.log(a.company)
    var t = await auth(a.company);

    a.company.token = t.access_token;

    return a.company;
}

async function selectCompany(list) {
    var answer = inquirer
    .prompt([
        {
            name: "company",
            type: "list",
            message: "Select the company:",
            choices: list,
        },
    ]);
    return answer;
}
async function auth(credentials) {
    var res = await axios({
        method: 'post',
        url: TOKEN_URL,
        params: {
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            grant_type: "client_credentials",
            scope: credentials.scope
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
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
    return res.data;

}
module.exports = {
    init: init,
    getToken: auth
};