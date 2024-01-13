import fs from 'fs'

import mocha from 'mocha'
import mochaStatsCollector from 'mocha/lib/stats-collector'

const { Base } = mocha.reporters

type MultiReporterThis = {
  reporters: typeof Base[]
}

function readConfig(path?: string): Record<string, unknown> {
  const configPath = path ?? '.reporters.json'

  if (!fs.existsSync(configPath)) {
    return {}
  }

  const buffer = fs.readFileSync(configPath, { encoding: 'utf8' })

  return JSON.parse(buffer)
}

function parseReporterOptions(options: mocha.RunnerOptions): Record<string, Record<string, unknown>> {
  const result = {}

  for (const key of Object.keys(options)) {
    if (key === 'config' || key == 'reporters') {
      continue
    }

    const [reporterName, configKey] = key.split(':')

    result[reporterName] = { ...result[reporterName], [configKey]: options[key] }
  }

  return result
}

function MultiReporter(this: MultiReporterThis, runner: mocha.Runner, options: mocha.MochaOptions) {
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

      this.reporters.push(new reporter(runner, {
        reporterOption: {
          ...configReporterOptions,
          ...(parsedReporterOptions[reporterName] ?? {})
        }
      }))
    }
  }
}

MultiReporter.prototype.done = function(failures: number, fn?: (failures: number) => void): void {
  const doneableReporters = this.reporters.filter((reporter: typeof Base) =>
    typeof reporter.prototype.done === "function"
  )

  if (doneableReporters.length === 0) {
    fn(failures)
  }

  for (const reporter of doneableReporters) {
    reporter.done(failures, fn)
  }

  fn(failures)
}

MultiReporter.description = 'Run multiple reporters at the same time'

module.exports = MultiReporter
