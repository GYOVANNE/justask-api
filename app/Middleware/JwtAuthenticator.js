'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class JwtAuthenticator {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({  request, auth, response  }, next) {
    try {
      await auth.check()
    } catch (error) {
      return response.status(401).json('Você não está autenticado!')
    }
    await next()
  }
}

module.exports = JwtAuthenticator
