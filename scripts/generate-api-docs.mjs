import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Application } from 'typedoc'

const rootDirectory = fileURLToPath(new URL('../', import.meta.url))
const configPath = fileURLToPath(new URL('../typedoc.json', import.meta.url))
const config = JSON.parse(await readFile(configPath, 'utf8'))
delete config.$schema
const gitRevision = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: rootDirectory,
  encoding: 'utf8',
}).trim()

config.packageOptions = {
  ...config.packageOptions,
  gitRevision,
}

const app = await Application.bootstrapWithPlugins(config)
const project = await app.convert()

if (!project) {
  throw new Error('TypeDoc could not convert the SDK packages.')
}

await app.generateDocs(project, app.options.getValue('out'))
