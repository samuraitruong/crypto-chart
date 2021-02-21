## Introduction
The chart api to generate image for historical data crypto available on coinspot.com.au, This is just  a part of my work to make inline chart available on coinspot list UI via my extension


## Usage
The runtime environmet is hosting on heroku , you can access them with below url

https://coinspot-chart.herokuapp.com/chart?coin=bnb&period=30&width=1200&height=700&lineWidth=3
- coin : coin symbol, default ada
- period: number of days from today you want to render chart, default 7
- witdh : width of the output image , default 1200
- height: height of the output image, default 700
- lineWidth: the with of line draw, default =0.7

## Development
just need to run
```
npm install
npm run dev
``

