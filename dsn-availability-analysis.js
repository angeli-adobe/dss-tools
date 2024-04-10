const fs = require('fs');
const moment = require('moment');
const _ = require('underscore');

// To run the code, open DSN Status, filter the Network result with "luma" and copy the response.
// Paste the response in dsn-availability.json and run the code.


// Function to read the data from the file dsn-availability.json
function readDataFromFile() {
    const fs = require('fs');
    const data = fs.readFileSync('input/dsn-availability/source.json', 'utf8');

    // Save a copy of the data in a new file called dsn-availability-source_YYYYMMDD.json
    const filename = 'source_' + moment().format("YYYYMMDD") + '.json';
    fs.writeFileSync('input/dsn-availability/' + filename, data);

    const jsonData = JSON.parse(data);
    return jsonData;
}

// Function to replace the "value" node in dsn-availability.json with an array of objects and merge with the old data
function replaceValueNode(jsonData) {
    let out = [];
    const keys = Object.keys(jsonData.value);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = jsonData.value[key];
        value.testid = key;
        let dateTime = convertToDateTime(key)
        value.timestamp = dateTime.timestamp;
        value.dateString = dateTime.dateString;
        value.isWorkingTime = dateTime.isWorkingTime;

        out.push(value);
    }
    out = _.sortBy(out, function (v) { return v.timestamp });

    // Read the file source_array.json
    const oldData = JSON.parse(fs.readFileSync('input/dsn-availability/source_array.json', 'utf8'));

    // Merge old data and out and return a deduplicated array
    let union = _.uniq(_.union(oldData, out),function (el) { return el.testid; });
    // console.log(oldData.length)
    // console.log(out.length)
    // console.log(union.length)

    // Write union in a file called source_array.json
    fs.writeFileSync('input/dsn-availability/source_array.json', JSON.stringify(union,null, 4));

    return out;

}

function convertToDateTime(str) {
    const parts = str.split(":");
    const timestamp = parseInt(parts[1]);
    const date = moment(timestamp).format('MMMM Do YYYY, h:mm:ss a');
    const workingTime = moment(timestamp).hour() >= 9 && moment(timestamp).hour() <= 18 ? true : false;
    return {
        isWorkingTime: workingTime,
        timestamp: timestamp,
        dateString: date
    };
}

// Main function that calls the other functions
function main() {
    let filename = 'dsn-availability-results' + '.json'
    const jsonData = readDataFromFile();
    const updatedValue = replaceValueNode(jsonData);
    const dataAnalysis = dataAnalyser(updatedValue);
    fs.writeFileSync('output/dsn-availability/'+ filename, JSON.stringify(dataAnalysis, 0 , 4));
}

function dataAnalyser(data) {
    // Expected output
    // {

    // "event-collection": {
    // "totalTest": 0,
    // "totalPass": 0,
    // "totalWarn": 0,
    // "totalFail": 0,
    // "passPercentage": 0,
    // "warnPercentage": 0,
    // "failPercentage": 0
    // },
    // "segmentation": {
    // "totalTest": 0,
    // "totalPass": 0,
    // "totalWarn": 0,
    // "totalFail": 0,
    // "passPercentage": 0,
    // "warnPercentage": 0,
    // "failPercentage": 0
    // },
    // "profile-collection": {
    // "totalTest": 0,
    // "totalPass": 0,
    // "totalWarn": 0,
    // "totalFail": 0,
    // "passPercentage": 0,
    // "warnPercentage": 0,
    // "failPercentage": 0
    // }
    //};
    let out = {
        "event-collection": {
            "totalTest": data.length,
            "totalPass": _.filter(data, function (test) { return test['event-collection'] == 'pass'; }).length,
            "totalWarn": _.filter(data, function (test) { return test['event-collection'] == 'warn'; }).length,
            "totalFail": _.filter(data, function (test) { return test['event-collection'] == 'fail'; }).length
        },
        "segmentation": {
            "totalTest": data.length,
            "totalPass": _.filter(data, function (test) { return test['segmentation'] == 'pass'; }).length,
            "totalWarn": _.filter(data, function (test) { return test['segmentation'] == 'warn'; }).length,
            "totalFail": _.filter(data, function (test) { return test['segmentation'] == 'fail'; }).length
        },
        "profile-collection": {
            "totalTest": data.length,
            "totalPass": _.filter(data, function (test) { return test['profile-collection'] == 'pass'; }).length,
            "totalWarn": _.filter(data, function (test) { return test['profile-collection'] == 'warn'; }).length,
            "totalFail": _.filter(data, function (test) { return test['profile-collection'] == 'fail'; }).length
        }
    };

    out['event-collection']['passPercentage'] = Math.round((out['event-collection']['totalPass'] / out['event-collection']['totalTest']) * 100);
    out['event-collection']['warnPercentage'] = Math.round((out['event-collection']['totalWarn'] / out['event-collection']['totalTest']) * 100);
    out['event-collection']['failPercentage'] = Math.round((out['event-collection']['totalFail'] / out['event-collection']['totalTest']) * 100);

    out['segmentation']['passPercentage'] = Math.round((out['segmentation']['totalPass'] / out['segmentation']['totalTest']) * 100);
    out['segmentation']['warnPercentage'] = Math.round((out['segmentation']['totalWarn'] / out['segmentation']['totalTest']) * 100);
    out['segmentation']['failPercentage'] = Math.round((out['segmentation']['totalFail'] / out['segmentation']['totalTest']) * 100);

    out['profile-collection']['passPercentage'] = Math.round((out['profile-collection']['totalPass'] / out['profile-collection']['totalTest']) * 100);
    out['profile-collection']['warnPercentage'] = Math.round((out['profile-collection']['totalWarn'] / out['profile-collection']['totalTest']) * 100);
    out['profile-collection']['failPercentage'] = Math.round((out['profile-collection']['totalFail'] / out['profile-collection']['totalTest']) * 100);

    return out;

}


main()