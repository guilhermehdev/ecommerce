'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Auth Routes used for admins and users
 */
Route.group(() => {
  Route.post('/register', 'AuthController.register')
    .as('auth.register')
    .validator('Clients/ClientRegister')

  Route.post('login', 'AuthController.login')
    .as('auth.login')
    .validator('Clients/ClientLogin')

  Route.post('refresh', 'AuthController.refresh')
    .as('auth.refresh')
    .validator('Clients/ClientRefreshToken')

  Route.post('logout', 'AuthController.logout')
    .as('auth.logout')
    .middleware(['auth'])

  Route.get('reset-password', 'AuthController.remember').as('auth.remember')
  Route.post('reset-password', 'AuthController.forgot').as('auth.forgot')
  Route.put('reset-password', 'AuthController.reset').as('auth.reset')
  // .validator('Clients/ClientRefreshToken')
})
  .prefix('v1/auth')
  .namespace('Auth')
