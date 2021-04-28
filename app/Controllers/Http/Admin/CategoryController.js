'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Category = use('App/Models/Category')
const Database = use('Database')
const Transformer = use('App/Transformers/Category/CategoriesTransformer')
/**
 * Resourceful controller for interacting with categories
 */
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param { transform } ctx.transform
   */
  async index({request, response, transform, pagination }) {
    const { title } = request.only(['title'])
    const query = Category.query()

    if (title) {
      query.where('title', 'LIKE', `%${title}%`)
    }

    const categories = await query.paginate(pagination.page, pagination.perpage)
    return response.send(await transform.paginate(categories, Transformer))
  }

  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const transaction = await Database.beginTransaction()
    try {
      const category = new Category()
      category.merge(request.only(['title', 'description', 'image_id']))

      await category.save(transaction)
      await transaction.commit()

      return response
        .status(201)
        .send(await transform.item(category, Transformer))
    } catch (e) {
      await transaction.rollback()
      return response.status(400).send({
        message: 'Erro ao processar sua requisição',
        error: e.message
      })
    }
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, response, transform }) {
    const category = await Category.findOrFail(params.id)
    return response.send(await transform.item(category, Transformer))
  }

  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, transform }) {
    const transaction = await Database.beginTransaction()
    try {
      const category = await Category.findOrFail(params.id)
      category.merge(request.only(['title', 'description', 'image_id']))
      await category.save(transaction)
      await transaction.commit()
      return response.send(await transform.item(category, Transformer))
    } catch (e) {
      await transaction.rollback()
      return response.status(400).send({
        message: 'Erro ao processar sua requisição!',
        error: e.message
      })
    }
  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const category = await Category.find(params.id)
    await category.delete()
    return response.status(204).send()
  }
}

module.exports = CategoryController
