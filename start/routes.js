'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post("/login", "UserController.login").as('login.login')
Route.post("/register", "UserController.store").as('register.store')
Route.post("/refresh", "UserController.refreshToken").as('refresh.refreshToken')


Route.get("/users", "UserController.index").as('users.index')

Route.group(() => {

}).middleware('jwt')

Route.get("/", function ({response})
{
  return response.status(200).json({message:'Bem vindo À Api do JusTask!'})
})

Route.any('*', function ({response})
{
  return response.status(404).json({message:'Rota não encontrada!'})
})
