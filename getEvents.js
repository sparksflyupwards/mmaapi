const rp = require('request-promise');
const cheerio = require('cheerio');
const { table } = require('console');
const url = 'http://www.ufcstats.com/statistics/events/completed?page=1';


rp(url)
  .then(function(html){
    //success!
    $ = cheerio.load(html);
    //data = $('body > section > div > div > div > div.b-statistics__sub-inner > div > table > tbody > tr').text();

    //data = data.replace(/\s\s+/g, ' ');
        //lets put it into an array now;
    //data = data.split(' ');
    //console.log(data);
    
    table_body = $('body > section > div > div > div > div.b-statistics__sub-inner > div > table > tbody > tr').each(function(i,elem) {
   
        table_row = $(this).text();

        //lets clean the data
        //remove extra spaces
    
        table_row = table_row.replace(/\s\s+/g, ' ');
        //lets put it into an array now;
        table_row_array = table_row.split(' ');
        
        console.log(table_row)
    })
    
    
    
  })
  .catch(function(err){
    //handle error
  });