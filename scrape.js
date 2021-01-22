const rp = require('request-promise');
const cheerio = require('cheerio');
const { table } = require('console');
const url = 'http://www.ufcstats.com/event-details/18f5669a92e99d92';



//fight data object
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




rp(url)
  .then(function(html){
    //success!
    $ = cheerio.load(html);
    fights = [];
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
    console.log(fights[2])
    
    

     
  })
  .catch(function(err){
    //handle error
  });