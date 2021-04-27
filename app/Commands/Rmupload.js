'use strict'

const { Command } = require('@adonisjs/ace')
const Helpers = use('Helpers')

class Rmupload extends Command {
  static get signature() {
    return 'remove:uploads'
  }

  static get description() {
    return 'Apaga todos os arquivos da pasta public/uploads'
  }

  async handle(args, options) {
    const uploadsPath = Helpers.publicPath('uploads')
    const deleteFiles = await this.confirm(
      'Tem certeza que deseja apagar todos os arquivos da pasta uploads?'
    )
    if (deleteFiles) {
      await this.warn(
        `${this.icon('warn')} Apagando arquivos da pasta Uploads!`
      )
      await this.removeDir(uploadsPath)
      await this.ensureDir(uploadsPath)
      await this.success(
        `${this.icon('success')} Uploads deletados com sucesso!`
      )
    } else {
      await this.error(`${this.icon('error')} Abortando!`)
    }
  }
}

module.exports = Rmupload
