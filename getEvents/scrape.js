const axios = require('axios');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs')
const lineReader = require('line-reader');
const { resolve } = require('path');



fights = [];
total_fights = 0
        /**
         * {
         * result:[String],
         * fighter_a:[String],
         * fighter_b: [String],
         * knock_downs_fighter_a: [int],
         * knock_downs_fighter_b: [int],
         * significant_strikes_fighter_a: [int],
         * significant_strikes_fighter_b: [int],
         * take_downs_fighter_a: [int],
         * take_downs_fighter_b: [int],
         * submission_attempts_fighter_a: [int],
         * submission_attempts_fighter_b: [int],
         * weight_class: [string],
         * result_method: [string],
         * method_detail: [string],
         * total_round: [int],
         * end_time: [string]
         * }
         */
//helper functions
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

let counter = 0;
let love =0;


 async function scrapeLink(url){
    console.log("WE GOT: "+url.slice(url.length-8) + " " + love)
    love++;
   await  axios.get(url)
    .then((html)=>{
            total_fights = 0;
            fights = [];
            counter += 1;
            //success!
            $ = cheerio.load(html.data);
        
            // lets run through every row in the table and store the data into fights array
            table_body =  $('body > section > div > div > table > tbody > tr').each((i, elem) => {
                table_row = $(elem).text();
               // console.log(table_row)
               //console.log(i)
                //lets clean the data
                //remove extra spaces
                table_row_array  = table_row.split("\n").filter((str)=>{return /\S/.test(str)});
                table_row_array=table_row_array.map((str)=>{ return str.trim()});
                
                fight = {
                    result: table_row_array[0],
                    fighter_a:table_row_array[1],
                    fighter_b: table_row_array[2] ,
                    knock_downs_fighter_a: table_row_array[3],
                    knock_downs_fighter_b: table_row_array[4],
                    significant_strikes_fighter_a: table_row_array[5],
                    significant_strikes_fighter_b: table_row_array[6],
                    take_downs_fighter_a: table_row_array[7],
                    take_downs_fighter_b: table_row_array[8],
                    submission_attempts_fighter_a: table_row_array[9],
                    submission_attempts_fighter_b: table_row_array[10],
                    weight_class: table_row_array[11],
                    result_method: table_row_array[12],
                    method_detail: isNumeric(table_row_array[13]) ? '' : table_row_array[14],
                    total_rounds: table_row_array[table_row_array.length-2],
                    end_time: table_row_array[table_row_array.length-1]
            
                    }
                    
                    // console.log(fight)
                    fights.push(fight);
                });
            
                total_fights +=fights.length
            
                
                const writeFightToFile = ()=>{
                    let event_title = $('body > section > div > h2 > span').text();
                    event_title = event_title.replace(/\s\s+/g, ' ');
                    console.log(event_title)
                    const fileName = './scrapedFights/fights'+counter+'.json';

                    console.log(fileName)
                    fs.appendFileSync(fileName, "{ \"event_title\": \"");
                    fs.appendFileSync(fileName, event_title);
                    fs.appendFileSync(fileName, "\", \"total_fights\":"
                    + total_fights+", \"fights\" :[\n");
                    let i =0;
    
                    for(some_fight of fights){
                        fs.appendFileSync(fileName, JSON.stringify(some_fight));
                        i++;
                        if(i<total_fights)
                        fs.appendFileSync(fileName, ",\n");
                    }
    
                    fs.appendFileSync(fileName, "\n] \n}");
                
                    console.log("finished " + counter +".json") 
                    
                }
                writeFightToFile();
                resolve(JSON.stringify(fights))
    })
    .catch(function(err){
      //handle error
      console.log(err)
    });
  }

let links = [];
readLinksPromise = new Promise((resolve, reject) =>{
    lineReader.eachLine('events2.txt', function(line,last) {
        links.push(line);
        if(last){
            resolve(links);
        }
    })
    
});
readLinksPromise.then((linksArry)=>{
    for(url of linksArry){
       // console.log(url)
       // scrapeLink(url);
    }
    scrapeAllLinks(linksArry);


})


function scrapeAllLinks(links){
    if(links.length>0) {
        scrapeLink(links.shift()).then(()=>scrapeAllLinks(links));
     
      }   
}



