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
  async index({ transform, response, pagination }) {
    const orders = await Order.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.perpage)
    return response.send(await transform.paginate(orders, OrderTransformer))
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      let order = await Order.create({ user_id, status }, trx)
      const service = new OrderService(order, trx)
      if (items.length > 0) {
        await service.syncItems(items)
      }
      await trx.commit()
      // devido aos hooks, é necessário atualizar o valor
      order = await Order.find(order.id)
      let _order = await transform
        .include('items,user')
        .item(order, OrderTransformer)
      // Dispara o broadcast de novo pedido
      const topic = Ws.getChannel('notifications').topic('notifications')
      if (topic) {
        topic.broadcast('new:order', _order)
      }
      return response.status(201).send(_order)
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
  async show({ params, transform, response }) {
    const order = await Order.findOrFail(params.id)
    return response.send(
      await transform
        .include('items,user,discounts')
        .item(order, OrderTransformer)
    )
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, transform }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })
      const service = new OrderService(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      let _order = await transform
        .include('items,user,coupons,discounts')
        .item(order, OrderTransformer)
      return response.send(_order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possível atualizar este pedido!'
      })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      await order.items().delete(trx)
      await order.delete(trx)
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Erro ao deletar este pedido!'
      })
    }
  }

  async applyDiscount({ params: { id }, request, response, transform }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(id)
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
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send({})
  }
}

module.exports = OrderController






























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
  async index({ transform, response, pagination }) {
    const orders = await Order.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.perpage)
    return response.send(await transform.paginate(orders, OrderTransformer))
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      let order = await Order.create({ user_id, status }, trx)
      const service = new OrderService(order, trx)
      if (items.length > 0) {
        await service.syncItems(items)
      }
      await trx.commit()
      // devido aos hooks, é necessário atualizar o valor
      order = await Order.find(order.id)
      let _order = await transform
        .include('items,user')
        .item(order, OrderTransformer)
      // Dispara o broadcast de novo pedido
      const topic = Ws.getChannel('notifications').topic('notifications')
      if (topic) {
        topic.broadcast('new:order', _order)
      }
      return response.status(201).send(_order)
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
  async show({ params, transform, response }) {
    const order = await Order.findOrFail(params.id)
    return response.send(
      await transform
        .include('items,user,discounts')
        .item(order, OrderTransformer)
    )
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, transform }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })
      const service = new OrderService(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      let _order = await transform
        .include('items,user,coupons,discounts')
        .item(order, OrderTransformer)
      return response.send(_order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possível atualizar este pedido!'
      })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      await order.items().delete(trx)
      await order.delete(trx)
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Erro ao deletar este pedido!'
      })
    }
  }

  async applyDiscount({ params: { id }, request, response, transform }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(id)
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
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send({})
  }
}

module.exports = OrderController



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
  async index({ transform, response, pagination }) {
    const orders = await Order.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.perpage)
    return response.send(await transform.paginate(orders, OrderTransformer))
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      let order = await Order.create({ user_id, status }, trx)
      const service = new OrderService(order, trx)
      if (items.length > 0) {
        await service.syncItems(items)
      }
      await trx.commit()
      // devido aos hooks, é necessário atualizar o valor
      order = await Order.find(order.id)
      let _order = await transform
        .include('items,user')
        .item(order, OrderTransformer)
      // Dispara o broadcast de novo pedido
      const topic = Ws.getChannel('notifications').topic('notifications')
      if (topic) {
        topic.broadcast('new:order', _order)
      }
      return response.status(201).send(_order)
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
  async show({ params, transform, response }) {
    const order = await Order.findOrFail(params.id)
    return response.send(
      await transform
        .include('items,user,discounts')
        .item(order, OrderTransformer)
    )
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, transform }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })
      const service = new OrderService(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      let _order = await transform
        .include('items,user,coupons,discounts')
        .item(order, OrderTransformer)
      return response.send(_order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possível atualizar este pedido!'
      })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      await order.items().delete(trx)
      await order.delete(trx)
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Erro ao deletar este pedido!'
      })
    }
  }

  async applyDiscount({ params: { id }, request, response, transform }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(id)
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
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send({})
  }
}

module.exports 

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
  async index({ transform, response, pagination }) {
    const orders = await Order.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.perpage)
    return response.send(await transform.paginate(orders, OrderTransformer))
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      let order = await Order.create({ user_id, status }, trx)
      const service = new OrderService(order, trx)
      if (items.length > 0) {
        await service.syncItems(items)
      }
      await trx.commit()
      // devido aos hooks, é necessário atualizar o valor
      order = await Order.find(order.id)
      let _order = await transform
        .include('items,user')
        .item(order, OrderTransformer)
      // Dispara o broadcast de novo pedido
      const topic = Ws.getChannel('notifications').topic('notifications')
      if (topic) {
        topic.broadcast('new:order', _order)
      }
      return response.status(201).send(_order)
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
  async show({ params, transform, response }) {
    const order = await Order.findOrFail(params.id)
    return response.send(
      await transform
        .include('items,user,discounts')
        .item(order, OrderTransformer)
    )
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, transform }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })
      const service = new OrderService(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      let _order = await transform
        .include('items,user,coupons,discounts')
        .item(order, OrderTransformer)
      return response.send(_order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possível atualizar este pedido!'
      })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const order = await Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()
    try {
      await order.items().delete(trx)
      await order.delete(trx)
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Erro ao deletar este pedido!'
      })
    }
  }

  async applyDiscount({ params: { id }, request, response, transform }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(id)
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
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send({})
  }
}

module.exports = OrderController