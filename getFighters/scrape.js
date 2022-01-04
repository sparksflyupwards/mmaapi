const axios = require("axios");
const cheerio = require("cheerio");
const { table } = require("console");
const fs = require("fs");
const lineReader = require("line-reader");
const { resolve } = require("path");
const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
dotenv.config();

const ufc_fighters = [];

const scrapeAllFighers = async () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const baseLink = "http://ufcstats.com/statistics/fighters?char=";

  for (letter of letters) {
    let count = 1;
    let stayOnLetter = true;
    while (stayOnLetter) {
      let url = baseLink + letter + "&page=" + count;
      //console.log(url)
      count++;
      await axios.get(url).then((response) => {
        $ = cheerio.load(response.data);
        //parses through each table cell if there are cells on this page else ends scraping of the letter
        const table_row_selector =
          "body > section > div > div > div > table > tbody > tr";
        if ($(table_row_selector).length <= 1) {
          stayOnLetter = false;
          console.log(
            "For letter: " +
              letter +
              " finished with num of pages: " +
              (count - 2)
          );
        }
        table_body = $(table_row_selector).each((i, elem) => {
          //format the elements data into an array slicing out the spaces
          table_row = $(elem).text();
          const row_to_array_by_spaces = table_row.split("\n");
          let row_to_array_pruned = [];

          for (let i = 2; i < row_to_array_by_spaces.length; i += 3) {
            console.log(row_to_array_by_spaces[i]);
            if (row_to_array_by_spaces[i].trim().length == 0) {
              row_to_array_pruned.push("--");
            } else {
              row_to_array_pruned.push(row_to_array_by_spaces[i]);
            }
          }
          row_to_array_pruned = row_to_array_pruned.filter((str) => {
            return /\S/.test(str);
          });
          row_to_array_pruned = row_to_array_pruned.map((str) => {
            return str.trim();
          });
          //  console.log(row_to_array_pruned)

          //find link for more figher info
          let link = $(elem)
            .children(".b-statistics__table-col")
            .children()
            .attr("href");

          //if link undefined then the row is not a figher
          let fighter_id = "";
          if (link) {
            fighter_id = link.slice(36);
          } else {
            return;
          }

          //formulate the figher into an object
          let fighter = {
            first_name: row_to_array_pruned[0],
            last_name: row_to_array_pruned[1],
            nick_name: row_to_array_pruned[2],
            height: row_to_array_pruned[3],
            weight: row_to_array_pruned[4],
            reach: row_to_array_pruned[5],
            stance: row_to_array_pruned[6],
            total_wins: row_to_array_pruned[7],
            total_losses: row_to_array_pruned[8],
            total_draws: row_to_array_pruned[9],
            fighter_id: fighter_id,
          };

          //  console.log(fighter);
          ufc_fighters.push(fighter);
          // console.log(ufc_fighters);
          return;
        });
      });
    }
  }
  return ufc_fighters;
};

scrapeAllFighers().then((ufc_fighters) => {
  const writeFightersToDB = async (fightersToWrite) => {
    const { MongoClient } = require("mongodb");
    const DB_password = process.env.DATABASEPASSWORD;
    const uri =
      "mongodb+srv://admin:" +
      DB_password +
      "@cluster0.ks3d7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect(async (err) => {
      console.log("writing fighters of length: " + fightersToWrite.length);
      console.log("starting writing...");
      const fighters = client.db("MMAStats").collection("fighters");
      await fighters.insertMany(fightersToWrite, (err, result) => {
        if (err) {
          console.log("error writing fighters to db: " + err);
          return false;
        } else if (result) {
          console.log("result of writing db: " + result);
        } else {
          console.log(
            "something unexpected happened writing fighters to db: " +
              err +
              result
          );
        }
      });

      console.log("finished writing");
      client.close();
      return true;
    });
  };

  const writeFightersToDBDriver = async (ufc_fighters) => {
    const fighters_to_write = [...ufc_fighters];
    try {
      while (fighters_to_write.length > 999) {
        await writeFightersToDB(fighters_to_write.splice(0, 998)).then(
          (was_inserted) => {
            if (!was_inserted) {
              console.log(
                "unexpected error writing to DB, failed to insert. \n was_inserted value: " +
                  was_inserted
              );

              return false;
            }
          }
        );
      }
      if (fighters_to_write.length > 0 && fighters_to_write.length <= 999) {
        await writeFightersToDB(fighters_to_write);
      } else {
        console.log("unexpected error writing to DB");
      }
    } catch (exception) {
      console.log(exception);
    }
  };

  const writeFightersToFile = () => {
    fs.appendFileSync("fighters.txt", JSON.stringify(ufc_fighters), (err) => {
      if (err) throw err;
      console.log("Saved!");
    });
  };

  writeFightersToDBDriver(ufc_fighters);
});


