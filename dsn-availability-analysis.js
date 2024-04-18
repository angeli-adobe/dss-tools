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
//  Type parameter define whether return the full or delta data.
function convertToArray(jsonData) {
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
    return out;
}

function mergeHistoricalData(newData, oldData) {
    // Merge old data and out and return a deduplicated array
    let union = _.uniq(_.union(oldData, newData), function (el) { return el.testid; });
    // Write union in a file called source_array_full.json
    fs.writeFileSync('input/dsn-availability/source_array_full.json', JSON.stringify(union, null, 4));
    return union;
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

    const mostRecentData = readDataFromFile();
    // Read the file source_array.json
    const oldData = JSON.parse(fs.readFileSync('input/dsn-availability/source_array_full.json', 'utf8'));

    let dataForAEPFull = 'data-for-aep_full' + '.json';
    const mostRecentDataArray = convertToArray(mostRecentData);
    // Merge mostRecentDataArray with history
    const fullData = mergeHistoricalData(mostRecentDataArray, oldData);
    const schemaOutputFull = createSchemaOutput(fullData);
    fs.writeFileSync('output/dsn-availability/' + dataForAEPFull, JSON.stringify(schemaOutputFull, 0, 4));

    let dataForAEPDelta = 'data-for-aep_delta' + '.json';
    const deltaData = getDeltaData(mostRecentDataArray,oldData);
    const schemaOutputDelta = createSchemaOutput(deltaData);
    fs.writeFileSync('output/dsn-availability/' + dataForAEPDelta, JSON.stringify(schemaOutputDelta, 0, 4));
}

function getDeltaData(newData, oldData){
    let delta =  newData.filter(newItem => {
        return !oldData.some(oldItem => newItem.testid === oldItem.testid)
      });
      fs.writeFileSync('input/dsn-availability/source_array_delta.json', JSON.stringify(delta, null, 4));
    return delta;
}

function createSchemaOutput(data) {
    let out = [];

    // DatacenterID
    let datacenterID = "luma-emea";

    // Read the file schema.json
    const schema = JSON.parse(fs.readFileSync('input/dsn-availability/schema.json', 'utf8'));

    // Loop through data
    for (let i = 0; i < data.length; i++) {
        const d = data[i];

        // Event collection
        //  With underscore clone the schema object
        let clone_a = JSON.parse(JSON.stringify(schema));
        // Convert data.dateString to ISO 8601 format with moment
        clone_a.timestamp = moment(d.dateString, 'MMMM Do YYYY, h:mm:ss a').toISOString();
        clone_a.eventType = "test.completed";
        clone_a._demopotemea.identities.datacenterId = datacenterID;
        clone_a._demopotemea.testDetails.testType = 'event-collection';
        clone_a._demopotemea.testDetails.testResult.testPass = d["event-collection"] == "pass" ? 1 : 0;
        clone_a._demopotemea.testDetails.testResult.testWarn = d["event-collection"] == "warn" ? 1 : 0;
        clone_a._demopotemea.testDetails.testResult.testFail = d["event-collection"] == "fail" ? 1 : 0;
        out.push(clone_a);

        // Segmentation
        //  With underscore clone the schema object
        let clone_b = JSON.parse(JSON.stringify(schema));
        // Convert data.dateString to ISO 8601 format with moment
        clone_b.timestamp = moment(d.dateString, 'MMMM Do YYYY, h:mm:ss a').toISOString();
        clone_b.eventType = "test.completed";
        clone_b._demopotemea.identities.datacenterId = datacenterID;
        clone_b._demopotemea.testDetails.testType = 'segmentation';
        clone_b._demopotemea.testDetails.testResult.testPass = d["segmentation"] == "pass" ? 1 : 0;
        clone_b._demopotemea.testDetails.testResult.testWarn = d["segmentation"] == "warn" ? 1 : 0;
        clone_b._demopotemea.testDetails.testResult.testFail = d["segmentation"] == "fail" ? 1 : 0;
        out.push(clone_b);

        // Profile collection
        //  With underscore clone the schema object
        let clone_c = JSON.parse(JSON.stringify(schema));
        // Convert data.dateString to ISO 8601 format with moment
        clone_c.timestamp = moment(d.dateString, 'MMMM Do YYYY, h:mm:ss a').toISOString();
        clone_c.eventType = "test.completed";
        clone_c._demopotemea.identities.datacenterId = datacenterID;
        clone_c._demopotemea.testDetails.testType = 'profile-collection';
        clone_c._demopotemea.testDetails.testResult.testPass = d["profile-collection"] == "pass" ? 1 : 0;
        clone_c._demopotemea.testDetails.testResult.testWarn = d["profile-collection"] == "warn" ? 1 : 0;
        clone_c._demopotemea.testDetails.testResult.testFail = d["profile-collection"] == "fail" ? 1 : 0;
        out.push(clone_c);

    }

    return out;
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