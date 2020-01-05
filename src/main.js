const axios = require('axios');
const cheerio = require('cheerio');
const url = "https://www.iban.com/exchange-rates";
const { Worker }  = require('worker_threads');
let workDir = __dirname+"/dbWorker.js";

fetchData(url).then( (res) => {
    const html = res.data;
    const $ = cheerio.load(html);
    const statsTable = $('.table.table-bordered.table-hover.downloads > tbody > tr');
    statsTable.each(function(){
        let title = $(this).find('td').text();
        console.log(title);
    });
});

async function fetchData(url){
    console.log("Crawling data...")
    let response = await axios(url).catch((err) => console.log(err));

    if(response.status !== 200){
        console.log("Error occured while fetching data");
        return;
    }
    return response; 
}



const mainFunc = async () => {
    const url = "https://www.iban.com/exchange-rates";
    let res = await fetchData(url);
    if(!res.data){
        console.log("Invalid data Obj");
        return; 
    }
    const html = res.data;

    const $ = cheerio.load(html);
    let dataObj = new Object();
    const statsTable = $('.table.table-bordered.table-hover.downloads > tbody > tr');
    statsTable.each(function(){
        //get text in all td elements 
        let title = $(this).find('td').text();
        //convert string into array
        let newStr = title.split("\t");
        //strip off empty array element at index 0
        newStr.shift();
        //format array string and store in an object
        formatStr(newStr, dataObj)
    });
    return dataObj;

}

mainFunc().then((res) => {
    //start worker
    const worker = new Worker(workDir);
    console.log("Sending crawled data to dbWorker...");
    //send formatted data to worker thread
    worker.postMessage(res);
    //listen to message from worker thread
    worker.on("message", (message) => {
        console.log(message);
    });
});

function formatStr(arr, dataObj){
    //regex to match all the works before the first digit
    let regExp = /[^A-Z]*(^\D+)/
    //split array element 0 using the regExp rule
    let newArr = arr[0].split(regExp);
    //Store Object
    dataObj[newArr[1]] = newArr[2];
}