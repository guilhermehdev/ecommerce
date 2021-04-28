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
  Route.resource('categories', 'CategoryController')
    .apiOnly()
    .validator(
      new Map([
        [['categories.store'], ['Category/Store']],
        [['categories.update'], ['Category/Update']]
      ])
    )

  /**
   * Products Resource Routes
   */
  Route.resource('products', 'ProductController').apiOnly()

  /**
   * Coupons Resource Routes
   */
  Route.resource('coupons', 'CouponController').apiOnly()

  /**
   * Orders Resource Routes
   */
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController')
    .apiOnly()
    .validator(new Map([[['orders.store'], ['Order/Order']]]))

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
  Route.resource('users', 'UserController')
    .apiOnly()
    .validator(
      new Map([
        [['users.store'], ['User/StoreUser']],
        [['users.update'], ['User/StoreUser']]
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
