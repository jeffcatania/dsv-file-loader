# Webpack dsv loader

A Webpack plugin for loading dsv files (for example .csv). This is a modification of [dsv-loader](https://github.com/wbkd/dsv-loader) which returns a raw JSON file instead of an object.

## Installation

Install via npm:

```
npm install --save dsv-file-loader
```

## Usage

You can require dsv data like this:

``` javascript
var data = require('dsv-file!./data.csv');
// => returns data.csv content as json file
```

The loader will translate the ```data.csv``` file into a JSON File.

#### Usage with webpack.config

To require dsv files like this: ```require('data.csv')``` , you can add the dsv-file-loader to your webpack config:

``` javascript
module : {
  loaders : [
    { test: /\.csv?$/, loader: 'dsv-file-loader' } //will load all .csv files with dsv-file-loader by default
  ]
}
```

#### Options

**delimiter**

Tells the loader which delimiter is used to seperate the data. *Default: ','*

Examples:
``` javascript
var data = require('dsv-file?delimiter=;!./data.csv'); //load data seperated by semicolon

var data = require('dsv-file?delimiter=x!./data.csv'); //load data seperated by an 'x'
```

## Credits

* Inspired by webpack's [dsv-loader](https://github.com/wbkd/dsv-loader)
* DSV parsing done with [dsv](https://github.com/mbostock/dsv) by Mike Bostock
