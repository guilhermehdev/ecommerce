'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')
const UserTransformer = use('App/Transformers/User/UserTransformer')
const OrderItemTransformer = use('App/Transformers/Order/OrderItemTransformer')
const DiscountTransformer = use('App/Transformers/Order/DiscountTransformer')
const CouponTransformer = use('App/Transformers/Coupon/CouponTransformer')

/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends TransformerAbstract {
  availableInclude() {
    return ['user', 'coupons', 'items', 'discounts']
  }
  /**
   * This method is used to transform the data.
   */
  transform(order) {
    order = order.toJSON()
    return {
      id: order.id,
      subtotal:
        order.__meta__ && order.__meta__.subtotal
          ? parseFloat(order.__meta__.subtotal.toFixed(2))
          : 0,
      status: order.status,
      total: order.total ? parseFloat(order.total.toFixed(2)) : 0,
      qty_items: order.qty_items,
      date: order.created_at,
      discount:
        order.__meta__ && order.__meta__.discount
          ? parseFloat(order.__meta__.discount.toFixed(2))
          : 0
    }
  }

  includeUser(order) {
    return this.item(order.getRelated('user'), UserTransformer)
  }

  includeItems(order) {
    return this.collection(order.getRelated('items'), OrderItemTransformer)
  }

  includeCoupons(order) {
    return this.collection(order.getRelated('coupons'), CouponTransformer)
  }

  includeDiscounts(order) {
    return this.collection(order.getRelated('discounts'), DiscountTransformer)
  }
}

module.exports = OrderTransformer
