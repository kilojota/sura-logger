const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

const appendToFile = data => {
  fs.appendFile('logs.txt', data, function(err) {
    // if (err) throw err;
    console.log('Logged Sura Info');
  });
};
const getDiff = () => {
  fs.readFile('logs.txt', 'utf8', function(err, contents) {
    if (err || contents == '') return false;
    contents = contents.split('\n');
    // console.log(contents);
    lastLine = contents[contents.length - 1];

    shares = lastLine.split('|')[1].split(':')[1];
    sharesValue = lastLine.split('|')[2].split(':')[1];
    balance = lastLine
      .split('|')[3]
      .split(':')[1]
      .replace('$', '');

    return { shares, sharesValue, balance };
  });
};

const time = () => {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) month = `0${month}`;
  let day = date.getDate();
  if (day < 10) day = `0${day}`;
  let hours = date.getHours();
  if (hours < 10) hours = `0${hours}`;
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = `0${minutes}`;
  let seconds = date.getSeconds();
  if (seconds < 10) seconds = `0${seconds}`;

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const login = async () => {
  body = {
    document: process.env.CI,
    country: 845,
    documentType: 1,
    password: process.env.PASSWORD
  };
  try {
    loginRequest = await axios.post('https://investment.sura.com.uy/api/Auth/login', body, config);
  } catch (err) {
    console.log(err.data);
  }
  if (loginRequest.data.authenticationSuccessful) {
    config.headers.token = loginRequest.data.token;
    config.headers.cookie = loginRequest.headers['set-cookie'][0].split(';')[0];

    try {
      getMe = await axios.get('https://investment.sura.com.uy/api/Auth/Me', config);
      sura = getMe.data.products[0]['accounts'].filter(account => account.fund == 7)[0];
      // diff = getDiff();
      formattedInfo = `${time()} | Cuotas: ${sura.balanceFees} | ValorCuota: ${sura.shareValue} | Balance: $${sura.balance}\n`;
      // if (!diff) {
      //   appendToFile(formattedInfo);
      // }
      // if (sura.balanceFees != diff.shares || sura.shareValue != diff.sharesValue || sura.balance != diff.balance) {
      appendToFile(formattedInfo);
      // } else {
      // console.log('No change');
      // }
    } catch (err) {
      console.log(err.data);
    }
  } else {
    console.log('Bad Creds');
    return 'BadCredentials';
  }
  // response = { success: loginRequest.data.authenticationSuccessful, token: loginRequest.data.token };
};

// login();
module.exports = login;
