'use strict';

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.group(() => {
  /**
   * Products
   */
  Route.resource('products', 'ProductController').apiOnly();

  /**
   * Orders
   */
  Route.post('orders/:id/discount', 'OrderController.applyDiscount').middleware(
    'auth'
  );
  Route.delete(
    'orders/:id/discount',
    'OrderController.removeDiscount'
  ).middleware('auth');
  Route.resource('orders', 'OrderController').apiOnly().middleware('auth');
})
  .namespace('Client')
  .prefix('v1');
