const axios = require('axios');
const cheerio = require('cheerio');
const { table } = require('console');
const fs = require('fs')
const lineReader = require('line-reader');
const { resolve } = require('path');


const letters = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z"