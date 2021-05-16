const express = require('express');
const moment = require('moment-timezone');
const { default: axios } = require('axios');
const { CoinGeckoClient } = require('coingecko-api-v3');
const renderChart = require('./chart');

const app = express();

async function getData(url, retry = 0) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (e) {
    if (retry < 4) {
      return getData(url, retry + 1);
    }
  }
}
let cache = {};
app.get('/chart_v1', async function (req, res) {
  const date = moment().format('YYYYMMDD');

  const params = req.query || {};
  const duration = params.period || 7;

  const client = new CoinGeckoClient();
  const coinList =
    cache[date] || (await client.coinList({ include_platform: false }));
  if (Array.isArray(coinList)) {
    cache = {
      [date]: coinList,
    };
  }
  const findCoin = coinList.find(
    (x) =>
      x.id === params.coin ||
      x.symbol === params.coin ||
      x.name.toUpperCase() === params.coin.toUpperCase(),
  );

  const data = await client.coinIdMarketChart({
    id: findCoin.id,
    vs_currency: 'usd',
    days: duration,
  });

  const image = await renderChart(data.prices, params);
  res.type('image/png');
  res.send(image);
});

app.get('/chart', async function (req, res) {
  const params = req.query || {};
  const duration = +params.period || 7;
  let fixedStartTime;
  if (params.period?.includes('/')) {
    const fixedDate = moment
      .tz(params.period, 'DD/MM HH:mm a', 'Australia/Melbourne')
      .toDate();
    fixedStartTime = fixedDate.getTime();
  }
  const now = moment.tz('Australia/Melbourne');
  const nowTs = now.toDate().getTime();
  const startTime = now.add(-duration, 'days').toDate().getTime();
  const url = `https://www.coinspot.com.au/charts/history_basic?symbol=${(
    params.coin || 'ADA'
  ).toUpperCase()}&from=${fixedStartTime || startTime}&to=${nowTs}`;

  const data = await getData(url);

  const image = await renderChart(data, params);
  res.type('image/png');
  res.send(image);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running.....', PORT);
});
