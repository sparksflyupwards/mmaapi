const axios = require('axios');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs')
const lineReader = require('line-reader');
const { resolve } = require('path');


// Make a request for a user with a given ID
axios.get('http://www.ufcstats.com/event-details/8f4616698508f24d')
  .then((html)=> {
    // handle success

    $ = cheerio.load(html.data);
        console.log(
            "we starting"
        )

    // lets run through every row in the table and store the data into fights array
    //#SHORTCUT_FOCUSABLE_DIV > div:nth-child(4) > div > div > div > div._3ozFtOe6WpJEMUtxDOIvtU > div._31N0dvxfpsO6Ur5AKx4O5d > div._1OVBBWLtHoSPfGCRaPzpTf._3nSp9cdBpqL13CqjdMr2L_._2OVNlZuUd8L9v0yVECZ2iA > div.rpBJOHq2PR60pnwJlUyP0 > div:nth-child(1)
    table_body =  $('body > section > div > div > table > tbody > tr'
    ).each((i, elem) => {
        console.log(i)
        table_row = $(elem).text();
        console.log(table_row)
        });
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });