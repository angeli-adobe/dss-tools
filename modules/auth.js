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
        }
    })
    return res.data;

}
module.exports = init;