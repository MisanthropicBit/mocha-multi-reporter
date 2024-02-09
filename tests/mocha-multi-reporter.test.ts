import util from 'util'
import child_process from 'child_process'
import expect from 'unexpected'

const exec = util.promisify(child_process.exec)

describe('mocha-multi-reporter', () => {
  const runReporter = async (command: string[]): Promise<{ stdout: string; stderr: string }> => exec(command.join(' '))
  const testFile = './src/test.test.js'

  it('runs reporter', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      '--reporter-options',
      'reporters=json:spec',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'to contain', '"fullTitle"')
    expect(stdout, 'to contain', '1 passing')
    expect(stderr, 'to equal', '')
  })

  it('runs reporter with config file', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      '--reporter-options',
      'reporters=json:spec',
      '--reporter-options',
      'config=./sample-config.json',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'not to contain', '"fullTitle"')
    expect(stdout, 'to contain', '1 passing')
    expect(stderr, 'to equal', '')
  })

  it('runs reporter with disabled reporters in config file', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      '--reporter-options',
      'config=./disabled-reporter.json',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'not to contain', '"fullTitle"')
    expect(stdout, 'to contain', '1 passing')
    expect(stderr, 'to equal', '')
  })

  it('runs with doneable reporters', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      '--reporter-options',
      'reporters=spec:xunit:json',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'to contain', '<testsuite name="Mocha Tests" tests="1"')
    expect(stdout, 'to contain', '"fullTitle"')
    expect(stdout, 'to contain', '1 passing')
    expect(stderr, 'to equal', '')
  })

  it('reports empty option for reporter', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      '--reporter-options',
      'reporters=json:spec',
      '--reporter-options',
      '"  "',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'to contain', '"fullTitle"')
    expect(stdout, 'to contain', '1 passing')
    expect(stderr, 'to equal', 'Empty option for reporter\n')
  })

  it('reports unparsed reporter option', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      '--reporter-options',
      'reporters=json:spec',
      '--reporter-options',
      '"json>"',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'to contain', '"fullTitle"')
    expect(stdout, 'to contain', '1 passing')
    expect(stderr, 'to equal', "Could not parse option for reporter 'json>': 'json>'\n")
  })

  it('reports unknwon reporter', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      '--reporter-options',
      'reporters=spec:lol',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'to contain', '1 passing')
    expect(stderr, 'to equal', "Could not find reporter 'lol'\n")
  })

  it('reports incorrect configuration value', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      '--reporter-options',
      'reporters=spec:json',
      '--reporter-options',
      'config=./incorrect-config-value.json',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'not to contain', '"fullTitle"')
    expect(stdout, 'to contain', '1 passing')
    expect(stderr, 'to equal', "Expected a boolean or object value for reporter 'json'\n")
  })

  it('reports no reporters registered', async () => {
    const command = [
      'mocha',
      '--reporter',
      './build/dist/src/index.js',
      testFile
    ]

    const { stdout, stderr } = await runReporter(command)

    expect(stdout, 'not to contain', '"fullTitle"')
    expect(stdout, 'not to contain', '1 passing')
    expect(stderr, 'to equal', 'No reporters were registered\n')
  })
})
