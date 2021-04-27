'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { str_random } = use('App/Helpers')

class PasswordReset extends Model {
  static boot() {
    super.boot()

    this.addHook('beforeCreate', async model => {
      model.token = await str_random(25)
      const now = new Date()
      now.setMinutes(now.getMinutes() + 30)
      model.expires_at = now
    })
  }

  // Define database date fiedls
  static get dates() {
    return ['created_at', 'updated_at', 'expires_at']
  }
}

module.exports = PasswordReset
