'use strict';

const args = require('yargs').argv;

//  Expected parameters
//  - org
//  - ecid
//  - url 

let ts = Math.round(Date.now() / 1000)

// TS=1691058839|MCMID=14699374036374826082352645353555272707|MCORGID=6BB915785DE67ED10A495E68%40AdobeOrg

console.table(args)
// console.log("Adobe Org:" + encodeURIComponent(args.org))
// console.log("ECID:" + args.ecid)

function composeURL(org, url, ecid) {
    let ts = Math.round(Date.now() / 1000)    

    let params = `TS=${ts}|MCMID=${ecid}|MCORGID=${encodeURIComponent(org)}`

    return `${url}?adobe_mc=${encodeURIComponent(params)}`
}

let out = composeURL(args.org, args.url, args.ecid)

console.log(out)