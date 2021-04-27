'use strict'

const OrderItemHook = (exports = module.exports = {})
const Product = use('App/Models/Product')
OrderItemHook.updateSubtotal = async modelInstance => {
  let product = await Product.find(modelInstance.product_id)
  modelInstance.subtotal = modelInstance.quantity * product.price
}
