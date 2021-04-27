'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')
const CodeTransformer = use('App/Transformers/Order/CodeTransformer')
const CouponTransformer = use('App/Transformers/Coupon/CouponTransformer')
/**
 * DiscountTransformer class
 *
 * @class DiscountTransformer
 * @constructor
 */
class DiscountTransformer extends TransformerAbstract {
  defaultInclude() {
    return ['coupon']
  }

  transform(model) {
    return {
      id: model.id,
      amount: model.discount
    }
  }

  includeCoupon(order) {
    return this.item(order.getRelated('coupon'), CodeTransformer)
  }
}

module.exports = DiscountTransformer
