
const lineReader = require('line-reader');
const fs = require('fs')
const firstEvent = 2;
const lastEvent = 3;
for(let i =firstEvent; i<=lastEvent; i++){
    

let rawdata = fs.readFileSync('fights'+i+'.json');
let  event_data = JSON.parse(rawdata);
console.log(event_data);
//todo add this to database
   
   
}