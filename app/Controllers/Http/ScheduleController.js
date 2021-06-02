'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { validate } = use('Validator')
const Schedule = use("App/Models/Schedule")

/**
 * Resourceful controller for interacting with schedules
 */
class ScheduleController {

  get rules () {
    return {
    forum:    'required|string|max:200',
    services: 'required|max:250',
    date:     'required|date',
    hour:     'required',
    }
  }

  get messages() {
      return {
      'forum.required':       'O Forum é obrigatório!',
      'services.required':    'O Serviço é obrigatório!',
      'date.required':        'A Data é obrigatória!',
      'hour.required':        'A Hora é obrigatória!',
      'date.date':            'A Data é inválida!',
      }
  }

  /**
   * Show a list of all schedules.
   * GET schedules
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ response, request }) {
    try {
      const data = request.only(['date'])
      console.log(data)
      const validation = await validate(data,{date:'date'}, {
          'date.date':      'A Data é inválida!'
        })
      if (validation.fails()) return response.status(422).json(validation.messages())
      let schedules = null
      if(data.date){
        schedules = await Schedule.query().where('date',data.date).orderBy('hour').fetch()
      }else {
        schedules = await Schedule.query().orderBy('hour').fetch()
      }
      return response.status(200).json(schedules)
    }catch(e){
        return response.status(400).json('Ops, ocorreu um erro! ' + e)
    }
  }

  async scheduleAvailable({response, request}) {
    try {
      const data = request.only(['date'])
      const validation = await validate(data,{
        date:    'required|date',
      }, {
        'date.required':  'A Data é obrigatória!',
        'date.date':      'A Data é inválida!',
      })
      if (validation.fails()) return response.status(422).json(validation.messages())
      const schedule = await Schedule.query()
      .where('date',data.date)
      .fetch()
      const array = [7,8,9,10,11,12,13,14,15,16,17]
      if(schedule){
        schedule.toJSON().map((elementx) => {
            array.forEach((elementy, y) => {
              if(elementy===elementx.hour){
                array.splice(y,1)
              }
            });
        });
      }
      return response.status(200).json(array)
    }catch(e){
        return response.status(400).json('Ops, ocorreu um erro! ' + e)
    }
  }
  /**
   * Create/save a new schedule.
   * POST schedules
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    try {
      const data = request.all();
      const validation = await validate(data, this.rules, this.messages)
      if (validation.fails()) return response.status(422).json(validation.messages())

      const schedule = await Schedule.create(data)
      return response.status(200).json(schedule)
    }catch(e){
        return response.status(400).json('Ops, ocorreu um erro! ' + e)
    }
  }

  /**
   * Display a single schedule.
   * GET schedules/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async show ({ params, response }) {
    try {
      const schedule = await Schedule.find(params.id)
      return response.status(200).json(schedule)
    }catch(e){
        return response.status(400).json('Ops, ocorreu um erro! ' + e)
    }
  }

  /**
   * Update schedule details.
   * PUT or PATCH schedules/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    try {
      const data = request.all()
      const schedule = await Schedule.find(params.id)
      schedule.merge(data)
      await schedule.save()
      return response.status(204).json('');
    } catch (e) {
        return response.status(400).json('Ops, ocorreu um erro! ' + e)
    }
  }

  /**
   * Delete a schedule with id.
   * DELETE schedules/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    try {
      const schedule = await Schedule.find(params.id)
      await schedule.delete()
      return response.status(200).json('Agendamento deletado');
    } catch (e) {
        return response.status(400).json('Ops, ocorreu um erro! ' + e)
    }
  }
}

module.exports = ScheduleController
