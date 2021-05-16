const moment = require('moment-timezone');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const serviceInstance = {};

const renderChart = async (data, params) => {
  console.log(params);
  const first = data[0][1];
  const last = data[data.length - 1][1];
  const [green, red] = (params.colors || '#21CE99,#ff413d').split(',');
  let percentageChange = (((last - first) * 100) / first).toFixed(2) + '%';
  if (!percentageChange.includes('-'))
    percentageChange = '+' + percentageChange;
  // const label = `From ${moment(new Date(fixedStartTime || startTime)).format(
  //   'DD MMM',
  // )}(${percentageChange})`;
  const configuration = {
    type: 'line',
    data: {
      datasets: [
        {
          label: '',
          labelColor: '#fee',
          backgroundColor: '#ffffff', //color(window.chartColors.red).alpha(0.5).rgbString(),
          borderColor: last < first ? red : green,
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
        display: false,
        labels: {
          fontColor: last < first ? red : green,
          opacity: 1,
          fontSize: +params.width < 500 ? 10 : 14,
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

module.exports = renderChart;
