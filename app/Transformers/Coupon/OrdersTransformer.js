'use strict'

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')

/**
 * OrdersTransformer class
 *
 * @class OrdersTransformer
 * @constructor
 */
class OrdersTransformer extends TransformerAbstract {
    /**
     * This method is used to transform the data.
     */
    transform(order) {
        return {
            id: order.id,
            total: order.total,
            status: order.status
        }
    }
}

module.exports = OrdersTransformer
