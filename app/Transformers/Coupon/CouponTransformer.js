'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')
const UserTransformer = use('App/Transformers/Coupon/UserTransformer')
const OrdersTransformer = use('App/Transformers/Coupon/OrdersTransformer')
const ProductsTransformer = use('App/Transformers/Coupon/ProductsTransformer')
/**
 * CouponTransformer class
 *
 * @class CouponTransformer
 * @constructor
 */
class CouponTransformer extends TransformerAbstract {
    availableInclude() {
        return ['users', 'products', 'orders']
    }

    /**
     * This method is used to transform the data.
     */
    transform(coupon) {
        coupon = coupon.toJSON()
        delete coupon.created_at
        delete coupon.updated_at
        return coupon
    }

    includeUsers(coupon) {
        return this.collection(coupon.getRelated('users'), UserTransformer)
    }

    includeProducts(coupon) {
        return this.collection(
            coupon.getRelated('products'),
            ProductsTransformer
        )
    }

    includeOrders(coupon) {
        return this.collection(coupon.getRelated('orders'), OrdersTransformer)
    }
}

module.exports = CouponTransformer
