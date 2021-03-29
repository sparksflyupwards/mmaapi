const rp = require('request-promise');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs')


ufc_events = [];

for(let i = 1; i<21; i++){

    const url = 'http://www.ufcstats.com/statistics/events/completed?page='+i;


rp(url)
  .then(function(html){
    //success!
    $ = cheerio.load(html);
    //data = $('body > section > div > div > div > div.b-statistics__sub-inner > div > table > tbody > tr').text();

    //data = data.replace(/\s\s+/g, ' ');
        //lets put it into an array now;
    //data = data.split(' ');
    //console.log(data);
    /**
     * to get the links
     * body > section > div > div > div > div.b-statistics__sub-inner > div > table > tbody > tr:nth-child(3) > td:nth-child(1) > i > a
     * 
     * to get the whole table row
     * body > section > div > div > div > div.b-statistics__sub-inner > div > table > tbody > tr
     */

    count = 0;
    table_body = $('body > section > div > div > div > div.b-statistics__sub-inner > div > table > tbody > tr > td > i > a').each(function(i,elem) {
   
        event_row = $(this).text();
        var link = $(elem).attr('href');
        count +=1;
       // console.log(link)
        /** 
        //lets clean the data
        //remove extra spaces
    
        event_row = event_row.replace(/\s\s+/g, ' ');
        //lets put it into an array now;
        event_row_array = event_row.split(' ');
        */
        ufc_events.push(link)

    })
    console.log(ufc_events.length)
    fs.appendFile('events.txt', ufc_events, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
    
  })
  .catch(function(err){
    //handle error
  });
}
