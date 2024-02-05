<div align="center">

# mocha-multi-reporter

![version badge](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)
![test badge](https://img.shields.io/github/actions/workflow/status/MisanthropicBit/mocha-multi-reporter/test.yml?branch=master&style=flat-square)
![license badge](https://img.shields.io/github/license/MisanthropicBit/mocha-multi-reporter?style=flat-square)

</div>

A [`mocha`](https://github.com/mochajs/mocha) reporter written in TypeScript
that can run multiple reporters at once. Developed for personal use and inspired
by
[mocha-multi-reporters](https://github.com/stanleyhlng/mocha-multi-reporters)
and
[multi-reporter](https://github.com/mocha-community/multi-reporter).

## Installation

Git clone this repository or install using `npm` and the git url.

```shell
> npm i git+https://github.com/MisanthropicBit/mocha-multi-reporter.git

```

## Building and testing

```shell
> npm i
> npm run build
> npm test
```

## Usage

In the following command, replace `./build/dist/src/index.js` with the path to
the built index file. Here, we are selecting the json and spec reporters,
loading the configuration file `sample-config.json` and passing an option to
the json reporter.

```shell
> mocha --reporter ./build/dist/src/index.js --reporter-options reporters=json:spec --reporter-options config=sample-config.json --reporter-options json:test-output.json \"src/**/*.test.ts\"
```

You can also use a json configuration file which defaults to `.reporters.json` in the
current directory or you can set the path using
`--reporter-options=config=sample-config.json` as above. Reporter options
specified on the command line will be merged with those in the configuration
file but the former with higher precedence.

Sample configuration file.

```json
{
  "json": {
    "output": "test-output.log"
  },
  "spec": true
}
```

A reporter can be enabled or disabled by setting its value to `true` or
`false` respectively. An object value enables the reporter and passes those
options to the reporter.
