/**
 * THE ANSWER
 * function scraper(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(err, resp, body) {
            var $ = cheerio.load(body),
                results = [];

            if (err) {
                reject(err);
            } else {
             $('#div').find('li').each(function(i, element){
                 // everything i want to scrape i do under here
                 results.push(element);
             });
             resolve(results);
           }
        });
    });
}

var pages = ['https://www.google.com/','https://www.yahoo.com/'],
    scrapers = pages.map(scraper);

Promise.all.apply(null, scrapers).then(function(scrapes) {
    // "scrapes" collects the results from all pages.
}, function(error) {
    // At least one of them went wrong.
});
 */












const rp = require('request-promise');
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
   await  rp(url)
    .then(function(html){
      total_fights = 0;
      fights = [];
      counter += 1;
      //success!
      $ = cheerio.load(html);
      // lets run through every row in the table and store the data into fights array
      table_body =  $('body > section > div > div > table > tbody > tr').each(function (i, elem) {
          table_row = $(this).text();
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
            
             //console.log(fight)
              fights.push(fight);
        });
      
        total_fights +=fights.length
    
        
        let event_title = $('body > section > div > h2 > span').text();
        event_title = event_title.replace(/\s\s+/g, ' ');
        console.log(event_title)
        console.log('fights'+counter+'.json')
    
      fs.appendFileSync('fights'+counter+'.json', "{ \"event_title\": \"");
        fs.appendFileSync('fights'+counter+'.json', event_title);
       fs.appendFileSync('fights'+counter+'.json', "\", \"total_fights\":"+total_fights+", \"fights\" :[\n");
        let i =0;
        for(some_fight of fights){
          
        fs.appendFileSync('fights'+counter+'.json', JSON.stringify(some_fight));
          i++;
          if(i<total_fights)
        fs.appendFileSync('fights'+counter+'.json', ",\n");
    
        }
    fs.appendFileSync('fights'+counter+'.json', "\n] \n}");
       
       console.log("finished " + counter +".json") 
       resolve(true)
    })
    .catch(function(err){
      //handle error
    });



   
    
  }

let links = [];
readLinksPromise = new Promise((resolve, reject) =>{
    lineReader.eachLine('eventlinks.txt', function(line,last) {
        links.push(line);
        if(last){
            resolve(links);
        }
    })
    
});
readLinksPromise.then((linksArry)=>{
  // console.log("WE HAVE: "+linksArry.length)
   // console.log(links)
    //url = 'http://www.ufcstats.com/event-details/154a6b3ffae264cd';
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



