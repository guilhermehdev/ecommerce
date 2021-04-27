'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle(ctx, next) {
    if (ctx.request.method() === 'GET') {
      ctx.pagination = ctx.request.only(['page', 'perpage'])
      /**
       * Captura também o parâmetro limit e preenche o valor de perpage com ele
       */
      const { limit } = ctx.request.only(['limit'])
      if (limit) {
        ctx.pagination.perpage = limit
      }
    }

    await next()
  }
}

module.exports = Pagination
