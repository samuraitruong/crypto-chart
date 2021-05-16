## Introduction

The chart api to generate image for market historical data crypto available.

This is just a part of my work to make inline chart available on coinspot list UI via my extension

## Usage

The runtime environmet is hosting on heroku , you can access them with below url

### Coinspot data

https://coinspot-chart.herokuapp.com/chart?coin=bnb&period=30&width=1200&height=700&lineWidth=3

- coin : coin symbol, default ada
- period: number of days from today you want to render chart, default 7
- witdh : width of the output image , default 1200
- height: height of the output image, default 700
- lineWidth: the with of line draw, default =0.7
- colors: array of green and red color to override default color color=%23ddd,%23999ccc

### Coingecko API data

- https://coinspot-chart.herokuapp.com/chart?coin=bnb&period=30&width=1200&height=700&lineWidth=3
- coin: it can be name, id or symbol of coin

## Development

```
npm install
npm run dev

```
