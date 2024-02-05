import fs from 'fs'
import { inherits } from 'util'

import mocha from 'mocha'
import mochaStatsCollector from 'mocha/lib/stats-collector'

const { Base } = mocha.reporters

const MOCHA_MULTI_REPORTER_DEFAULT_CONFIG = '.reporters.json'

type MultiReporterThis = {
  reporters: (typeof Base)[]
}

function readConfig(path?: string): Record<string, unknown> {
  const configPath = path ?? MOCHA_MULTI_REPORTER_DEFAULT_CONFIG

  if (!fs.existsSync(configPath)) {
    return {}
  }

  return JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }))
}

function parseReporterOptions(options: mocha.RunnerOptions): Record<string, Record<string, unknown>> {
  const result = {}

  for (const option of Object.keys(options)) {
    if (option === 'config' || option == 'reporters') {
      continue
    }

    if (option.trim().length === 0) {
      console.error('Empty option for reporter')
    }

    const [reporterName, configKey] = option.split(':')

    if (!configKey) {
      console.error(`Could not parse option for reporter '${reporterName}': '${option}'`)
    } else {
      result[reporterName] = { ...result[reporterName], [configKey]: options[option] }
    }
  }

  return result
}

function MultiReporter(this: MultiReporterThis, runner: mocha.Runner, options: mocha.MochaOptions): void {
  Base.call(this, runner)

  // We do not support mocha below version 7
  mochaStatsCollector(runner)

  this.reporters = []

  const config = readConfig(options.reporterOptions?.config)
  const parsedReporterOptions = parseReporterOptions(options.reporterOptions)
  const commandLineReporters = options.reporterOptions?.reporters?.split(':') ?? []
  const reporterNames = new Set([...Object.keys(config), ...commandLineReporters])

  for (const reporterName of reporterNames) {
    const reporter = mocha.reporters[reporterName]

    if (reporter == null) {
      console.error(`Could not find reporter '${reporterName}'`)
    } else {
      const configValue = config[reporterName]

      if (typeof configValue === 'boolean' && !configValue) {
        continue
      }

      const configReporterOptions = typeof configValue === 'object' ? configValue : {}

      this.reporters.push(
        new reporter(runner, {
          reporterOption: {
            ...configReporterOptions,
            ...parsedReporterOptions[reporterName]
          }
        })
      )
    }
  }

  if (this.reporters.length === 0) {
    console.error('No reporters were registered')
  }
}

<<<<<<< HEAD
inherits(MultiReporter, Base)

MultiReporter.prototype.done = function(failures: number, fn?: (failures: number) => void): void {
  const doneableReporters = this.reporters.filter((reporter: typeof Base) =>
    typeof reporter.prototype.done === "function"
||||||| parent of 5a02983 (Eslint fixes)
MultiReporter.prototype.done = function(failures: number, fn?: (failures: number) => void): void {
  const doneableReporters = this.reporters.filter((reporter: typeof Base) =>
    typeof reporter.prototype.done === "function"
=======
MultiReporter.prototype.done = function (failures: number, fn?: (failures: number) => void): void {
  const doneableReporters = this.reporters.filter(
    (reporter: typeof Base) => typeof reporter.prototype.done === 'function'
>>>>>>> 5a02983 (Eslint fixes)
  )

  for (const reporter of doneableReporters) {
    reporter.done(failures, fn)
  }

  fn(failures)
}

MultiReporter.description = 'Run multiple reporters at the same time'

module.exports = MultiReporter
