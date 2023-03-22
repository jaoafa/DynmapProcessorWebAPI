import { Logger } from '@book000/node-utils'
import { spawn } from 'node:child_process'
import fs from 'node:fs'

export class DynmapProcessor {
  private outputDirectory: string | undefined

  public async init(): Promise<void> {
    const hostname = process.env.DB_HOSTNAME || 'localhost'
    const port = process.env.DB_PORT || '3306'
    const database = process.env.DB_DATABASE || 'dynmap'
    const prefix = process.env.DB_PREFIX || 'dmap'
    const mapId = process.env.MAP_ID || '1'

    const username = process.env.DB_USERNAME
    const password = process.env.DB_PASSWORD
    if (!username || !password) {
      throw new Error('DB_USERNAME or DB_PASSWORD is not set')
    }

    const outputDirectory = `${
      process.env.DYNMAP_TILE_DIR || 'dynmap-tiles'
    }/${Date.now()}/`
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true })
    }

    await this.runCommand([
      '--type',
      'database',
      '--jdbc-url',
      `jdbc:mysql://${hostname}:${port}/${database}`,
      '--db-user',
      username,
      '--db-password',
      password,
      '--db-table-prefix',
      prefix,
      '--db-map-id',
      mapId,
      '--input',
      outputDirectory,
      '--output',
      outputDirectory,
    ])
    this.outputDirectory = outputDirectory
  }

  private async runCommand(dynmapProcessorArguments: string[]) {
    const logger = Logger.configure('DynmapProcessor.runCommand')
    const jarPath =
      process.env.DYNMAP_PROCESSOR_JAR_PATH || 'dynmap-processor.jar'
    const javaArguments = [
      '-jar',
      jarPath,
      '--type',
      'file',
      ...(this.outputDirectory ? ['--input', this.outputDirectory] : []),
      ...dynmapProcessorArguments,
    ]
    const java = spawn('java', javaArguments)

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Command: java ${javaArguments.join(' ')}`)

      java.stdout.on('data', (data) => {
        logger.info(data.toString().trim())
      })
      java.stderr.on('data', (data) => {
        logger.error(data.toString().trim())
      })
    }

    await new Promise<void>((resolve) => {
      java.on('exit', () => {
        resolve()
      })
    })
  }
}
