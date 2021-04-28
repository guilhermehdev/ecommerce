'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Administration Routes V1
 *
 * Prefix: /v1/admin
 */
Route.group(() => {
  /**
   * Categories resource Routes
   */
  Route.resource('category', 'CategoryController')
    .apiOnly()
    .validator(
      new Map([
        [['category.store'], ['Category/Store']],
        [['category.update'], ['Category/Update']]
      ])
    )

  /**
   * Products Resource Routes
   */
  Route.resource('product', 'ProductController').apiOnly()

  /**
   * Coupons Resource Routes
   */
  Route.resource('coupon', 'CouponController').apiOnly()

  /**
   * Orders Resource Routes
   */
  Route.post('order/:id/discount', 'OrderController.applyDiscount')
  Route.delete('order/:id/discount', 'OrderController.removeDiscount')
  Route.resource('order', 'OrderController')
    .apiOnly()
    .validator(new Map([[['order.store'], ['Order/Order']]]))

  /**
   * Images Resource Routes
   */
  Route.resource('images', 'ImageController').apiOnly()
  Route.post('image/bulkUpload', 'ImageController.bulkUpload').as(
    'image.bulkUpload'
  )

  /**
   * Users Resource Rotues
   */
  Route.resource('user', 'UserController')
    .apiOnly()
    .validator(
      new Map([
        [['user.store'], ['User/StoreUser']],
        [['user.update'], ['User/StoreUser']]
      ])
    )

  /**
   * Dashboard Routes
   */
  Route.get('dashboard', 'DashboardController.index').as('dahboard')
})
  .prefix('v1/admin')
  .namespace('Admin')
  .middleware(['auth', 'is:(admin || manager)'])
