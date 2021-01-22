const rp = require('request-promise');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs')
const lineReader = require('line-reader');




fights = [];
total_fights = 0
counter = 0;
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


//lineReader.eachLine('eventlinks.txt', function(line) {
  //  let url = line;
url = 'http://www.ufcstats.com/event-details/154a6b3ffae264cd';
rp(url)
  .then(function(html){
    //success!
    $ = cheerio.load(html);
    // lets run through every row in the table and store the data into fights array
    table_body = $('body > section > div > div > table > tbody > tr').each(function (i, elem) {
        table_row = $(this).text();
        //lets clean the data
        //remove extra spaces
    
        table_row = table_row.replace(/\s\s+/g, ' ');
        //lets put it into an array now;
        table_row_array = table_row.split(' ');
        
       

        fight = {
            result: table_row_array[1],
            fighter_a:table_row_array[2]+ " "+ table_row_array[3],
            fighter_b: table_row_array[4]+ " "+ table_row_array[5],
            knock_downs_fighter_a: table_row_array[6],
            knock_downs_fighter_b: table_row_array[7],
            significant_strikes_fighter_a: table_row_array[8],
            significant_strikes_fighter_b: table_row_array[9],
            take_downs_fighter_a: table_row_array[10],
            take_downs_fighter_b: table_row_array[11],
            submission_attempts_fighter_a: table_row_array[12],
            submission_attempts_fighter_b: table_row_array[13],
            weight_class: table_row_array[14],
            result_method: table_row_array[15],
            method_detail: isNumeric(table_row_array[16]) ? '' : table_row_array.slice(16,table_row_array.length-3),
            total_rounds: table_row_array[table_row_array.length-3],
            end_time: table_row_array[table_row_array.length-2]



            }

           

            fights.push(fight);
      });
    
      total_fights +=fights.length

      console.log("now: "+total_fights)
      
      let event_title = $('body > section > div > h2 > span').text();
      event_title = event_title.replace(/\s\s+/g, ' ');
      console.log(event_title)


      fs.appendFileSync('fights'+counter+'.json', "{ \"event_title\": \"");
      fs.appendFileSync('fights'+counter+'.json', event_title);
      fs.appendFileSync('fights'+counter+'.json', "\", \"total_fights\":"+total_fights+", \"fights\" :[\n");
      
      for(some_fight of fights){
        fs.appendFileSync('fights'+counter+'.json', JSON.stringify(some_fight));
        fs.appendFileSync('fights'+counter+'.json', ",\n");
  
      }
      fs.appendFileSync('fights'+counter+'.json', "\n] \n}");
     
      counter = counter +1;
      
  })
  .catch(function(err){
    //handle error
  });
//});



