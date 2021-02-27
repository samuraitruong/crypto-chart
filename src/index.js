const express = require('express');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
let app = express();
const moment = require('moment-timezone');
const { default: axios } = require('axios');

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

const serviceInstance = {};
const mkChart = async (params) => {
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
  const first = data[0][1];
  const last = data[data.length - 1][1];
  let percentageChange = (((last - first) * 100) / first).toFixed(2) + '%';
  if (!percentageChange.includes('-'))
    percentageChange = '+' + percentageChange;
  const label = `From ${moment(new Date(fixedStartTime || startTime)).format(
    'DD MMM',
  )}(${percentageChange})`;
  const configuration = {
    type: 'line',
    data: {
      datasets: [
        {
          label,
          labelColor: '#fee',
          backgroundColor: '#ffffff', //color(window.chartColors.red).alpha(0.5).rgbString(),
          borderColor: last < first ? '#ff413d' : '#21CE99',
          data: data.map(([t, y]) => ({ t, y })),
          type: 'line',
          pointRadius: 0,
          fill: false,
          lineTension: 0,
          borderWidth: params.lineWidth || 0.8,
        },
      ],
    },
    options: {
      animation: {
        duration: 0,
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            distribution: 'series',
            offset: false,
            gridLines: {
              display: false,
            },
            ticks: {
              display: false,
              major: {
                enabled: false,
                fontStyle: 'bold',
              },
              source: 'data',
              autoSkip: false,
              autoSkipPadding: 75,
              maxRotation: 0,
              sampleSize: 100,
            },
            afterBuildTicks: function (scale, ticks) {
              const majorUnit = scale._majorUnit;
              const firstTick = ticks[0];
              var i, ilen, val, tick, currMajor, lastMajor;

              val = moment(ticks[0].value);
              if (
                (majorUnit === 'minute' && val.second() === 0) ||
                (majorUnit === 'hour' && val.minute() === 0) ||
                (majorUnit === 'day' && val.hour() === 9) ||
                (majorUnit === 'month' &&
                  val.date() <= 3 &&
                  val.isoWeekday() === 1) ||
                (majorUnit === 'year' && val.month() === 0)
              ) {
                firstTick.major = true;
              } else {
                firstTick.major = false;
              }
              lastMajor = val.get(majorUnit);

              for (i = 1, ilen = ticks.length; i < ilen; i++) {
                tick = ticks[i];
                val = moment(tick.value);
                currMajor = val.get(majorUnit);
                tick.major = currMajor !== lastMajor;
                lastMajor = currMajor;
              }
              return ticks;
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              display: false,
            },
            gridLines: {
              drawBorder: false,
              display: false,
            },
            scaleLabel: {
              display: false,
              labelString: 'Closing price ($)',
            },
          },
        ],
      },
      legend: {
        display: true,
        labels: {
          fontColor: last < first ? '#ff413d' : 'blue',
          opacity: 1,
          fontSize: +params.width < 500 ? 8 : 14,
          boxWidth: 0,
        },
      },
    },
  };
  const config = {
    width: parseInt(params.width || 1000),
    height: parseInt(params.height || 400),
  };
  const key = `${config.width}x${config.height}`;

  const canvasRenderService =
    serviceInstance[key] || new ChartJSNodeCanvas(config);
  serviceInstance[key] = canvasRenderService;
  return await canvasRenderService.renderToBuffer(configuration);
};

app.get('/chart', async function (req, res) {
  const image = await mkChart(req.query);
  res.type('image/png');
  res.send(image);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('server is running.....', PORT);
});
