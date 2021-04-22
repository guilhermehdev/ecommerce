'use strict';

const Product = use('App/Models/Product');
const Transformer = use('App/Transformers/Product/ProductTransformer');
const Database = use('Database');
/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, transform, pagination }) {
    const { title } = request.only(['title']);

    const query = Product.query();

    // Adiciona o where, caso seja solicitado via url params
    if (title) {
      query.where('name', 'LIKE', `%${title}%`);
    }

    const products = await query.paginate(pagination.page, pagination.perpage);
    return response.send(await transform.paginate(products, Transformer));
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const transaction = await Database.beginTransaction();
    try {
      let product = request.only(['name', 'description', 'price', 'image_id']);
      const { images } = request.only(['images']);
      product = await Product.create(product, transaction);
      await product.images().attach(images, null, transaction);
      await transaction.commit();
      return response
        .status(201)
        .send(await transform.item(product, Transformer));
    } catch (error) {
      await transaction.rollback();
      return response.status(error.status).send(error);
    }
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, transform }) {
    const product = await Product.findOrFail(params.id);
    return transform.item(product, Transformer);
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, transform, response }) {
    const transaction = await Database.beginTransaction();
    const product = await Product.findOrFail(params.id);
    try {
      const data = request.only(['name', 'description', 'price', 'image_id']);
      const { images } = request.only(['images']);
      product.merge(data);
      await product.save(transaction);
      await product.images().sync(images, null, transaction);
      await transaction.commit();
      return transform.item(product, Transformer);
    } catch (error) {
      await transaction.rollback();
      return response.status(error.status).send(error);
    }
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    const transaction = await Database.beginTransaction();
    const product = await Product.findOrFail(params.id);
    try {
      await product.images().detach(null, transaction);
      await product.delete(transaction);
      await transaction.commit();
      return response.status(204).send();
    } catch (error) {
      await transaction.rollback();
      return response.status(error.status).send(error);
    }
  }
}

module.exports = ProductController;
