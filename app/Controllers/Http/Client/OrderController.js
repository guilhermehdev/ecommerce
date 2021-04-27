'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const OrderTransformer = use('App/Transformers/Order/OrderTransformer')
const Order = use('App/Models/Order')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')
const Database = use('Database')
const OrderService = use('App/Services/Orders/OrderService')
const Ws = use('Ws')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, transform, pagination }) {
    const { number } = request.only(['number'])
    const query = Order.query()
    if (number) {
      query.where('id', 'LIKE', `${number}`)
    }
    const results = await query
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.perpage)
    const orders = await transform.paginate(results, OrderTransformer)
    return response.send(orders)
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, auth, transform }) {
    const trx = await Database.beginTransaction()
    try {
      const { items } = request.only(['items'])
      const client = await auth.getUser()
      var order = await Order.create({ user_id: client.id }, trx)
      const service = new OrderService(order, trx)
      if (items.length > 0) {
        await service.syncItems(items)
      }
      await trx.commit()
      order = await Order.find(order.id)
      order = await transform.include('items').item(order, OrderTransformer)
      // Dispara o broadcast de novo pedido
      const topic = Ws.getChannel('notifications').topic('notifications')
      if (topic) {
        topic.broadcast('new:order', order)
      }
      return response.status(201).send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possível criar seu pedido no momento!'
      })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}

  async applyDiscount({ params: { id }, request, response, transform, auth }) {
    const { code } = request.all()
    const user = await auth.getUser()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())

    const order = await Order.query()
      .where('user_id', user.id)
      .where('id', id)
      .firstOrFail()
    var discount,
      info = {}
    try {
      const service = new OrderService(order)
      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscounts = await order.coupons().getCount()
      /**
       * Efetua as verificações de descontos no pedido
       * Verifica se o pedido já tem descontos e se pode aplicar +1
       */
      const canApplyToOrder =
        orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)
      if (canAddDiscount && canApplyToOrder) {
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })
        info.message = 'Cupom Aplicado com sucesso!'
        info.success = true
      } else {
        info.message = 'Não foi possível aplicar o cupom'
        info.success = false
      }

      const _order = await transform
        .include('user,coupons,items,discounts')
        .item(order, OrderTransformer)
      return response.send({ order: _order, info })
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Não foi possível aplicar o desconto!' })
    }
  }

  async removeDiscount({ params: { id }, request, response }) {
    const { discount_id } = request.all()
    const user = await auth.getUser()
    const order = await Order.query()
      .where('user_id', user.id)
      .where('id', id)
      .firstOrFail()
    await order
      .discounts()
      .where('id', discount_id)
      .delete()
    return response.status(204).send({})
  }
}

module.exports = OrderController
