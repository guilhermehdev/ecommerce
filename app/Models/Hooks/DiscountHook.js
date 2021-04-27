'use strict'
const Coupon = use('App/Models/Coupon')
const Order = use('App/Models/Order')
const Database = use('Database')
const DiscountHook = (exports = module.exports = {})

DiscountHook.calculateValues = async modelInstance => {
  var couponProducts,
    discountItems = []
  modelInstance.discount = 0
  const coupon = await Coupon.find(modelInstance.coupon_id)
  const order = await Order.find(modelInstance.order_id)

  switch (coupon.can_use_for) {
    /**
     * Caso o cupom esteja diretamente associado a alguns produtos
     * então devemos verificar estes dois casos
     */
    case 'product_client' || 'product':
      /**
       * Vou buscar na base de dados, quais produtos podem receber desconto
       * neste pedido
       */
      couponProducts = await Database.from('coupon_product')
        .where('coupon_id', modelInstance.coupon_id)
        .pluck('product_id')
      discountItems = await Database.from('order_items')
        .where('order_id', modelInstance.order_id)
        .whereIn('product_id', couponProducts)
      // calcula o valor do desconto baseando-se no tipo do de desconto
      if (coupon.type === 'percent') {
        for (let orderItem of discountItems) {
          modelInstance.discount += (orderItem.subtotal / 100) * coupon.discount
        }
      } else if (coupon.type === 'currency') {
        for (let orderItem of discountItems) {
          modelInstance.discount += coupon.discount * orderItem.quantity
        }
        modelInstance
      } else {
        // coupon.type === 'free'
        for (let orderItem of discountItems) {
          // Caso o cupom dê gratuidade, logo o item será gratuito
          modelInstance.discount += orderItem.subtotal
        }
      }
      break
    default:
      // case 'client' || 'all':
      if (coupon.type === 'percent') {
        modelInstance.discount = (order.subtotal / 100) * coupon.discount
      } else if (coupon.type === 'currency') {
        modelInstance.discount = coupon.discount
      } else {
        // coupon.type === 'free'
        modelInstance.discount = order.subtotal
      }
      break
  }
  return modelInstance
}

/**
 * Este método é responsável por diminuir a quantidade de cupons disponíveis
 */
DiscountHook.decrementCoupons = async modelInstance => {
  const query = Database.from('coupons')
  if (modelInstance.$transaction) {
    query.transacting(modelInstance.$transaction)
  }
  await query.where('id', modelInstance.coupon_id).decrement('quantity', 1)
}

/**
 * Este método é responsável por aumentar a quantidade de cupons disponíveis
 */
DiscountHook.incrementCoupons = async modelInstance => {
  const query = Database.from('coupons')
  if (modelInstance.$transaction) {
    query.transacting(modelInstance.$transaction)
  }
  await query.where('id', modelInstance.coupon_id).increment('quantity', 1)
}
