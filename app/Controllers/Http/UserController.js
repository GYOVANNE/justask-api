'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { validate } = use('Validator')
const User = use("App/Models/User")
const Signature = use("App/Models/Signature")
// const UserDetailService = use("App/Services/User/UserDetailService")
const Helpers = use('Helpers')
const Drive = use('Drive')
const TeamUser = use("App/Models/TeamUser")
const Team = use("App/Models/Team")
const Setting = use("App/Models/Setting")

class UserController {

    get rules () {
        return {
        name:     'required|string|max:100',
        email:    'required|email|max:250|unique:users,email',
        cpf:      'required|string|max:11|unique:users,cpf',
        phone:    'required|string|max:11|unique:users,phone',
        password: 'required|confirmed|min:6'
        }
    }

    get loginRules () {
        return {
        email:    'required|email',
        password: 'required|min:6'
        }
    }

    get rulesProfile () {
        return {
          'file':     'required|file|fileTypes:image,pdf|file_ext:jpg,png,jpeg|fileSize:2mb',
        };
    }

    get messages() {
        return {
        'name.required':      'O nome é obrigatório!',
        'name.max':           'O nome ultrapassou o limite máximo de caracteres! (max 100)',
        'email.max':          'O e-mail ultrapassou o limite máximo de caracteres! (max 250)',
        'email.required':     'O e-mail é obrigatório!',
        'email.unique':       'Este e-mail já está sendo usado por outra pessoa!',
        'email.email':        'Este e-mail não é válido!',
        'password.required':  'A senha é obrigatória!',
        'password.min':       'A senha deve ter no mínimo 6 caracteres!',
        'password.confirmed': 'As senhas devem ser iguais!',
        'file.required':      'O arquivo é obrigatório!',
        'file.file':            'O arquivo não é válido!',
        'file.fileTypes':       'O tipo do arquivo não é válido!',
        'file.file_ext':        'A extensão do arquivo não é válida!',
        'file.fileSize':        'Tamanho máximo do arquivo é 10mb!',
        }
    }

    /**
     * Create/save a new user.
     * POST users
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async store ({ request, response}) {
        try{
            const data = request.all();
            const validation = await validate(data, this.rules, this.messages)
            if (validation.fails()) return response.status(422).json(validation.messages())
            delete data.password_confirmation
            await User.create(data)
            return response.status(201).json('Criado')
        }catch(e){
            return response.status(400).json('Ops, ocorreu um erro!')
        }
    }

    /**
     *LOGIN
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async login ({ request, response, auth }) {
        const data = request.only(["email", "password"]);
        try {
        const validation = await validate(data, this.loginRules, this.messages)
        if (validation.fails()) return response.status(422).json(validation.message())
            if (await auth.authenticator('jwt').attempt(data.email, data.password)) {
                let user = await User.query().where('email', data.email).with('setting').first()
                let token = await auth.authenticator('jwt').withRefreshToken().generate(user, false, { expiresIn: '720min' }) //8 horas
                Object.assign(user, token)
                return response.status(200).json(user)
            }
        } catch (e) {
            return response.status(403).json('Esse email não está cadastrado ou sua senha está incorreta!');
        }
    }

  /**
   * Refresh token method
   * @param request
   * @param auth
   * @param response
   * @returns {Promise<void|*>}
   */
  async refreshToken({ request, auth, response})
  {
    const refreshToken = request.input('refresh_token')
    const token = await auth.generateForRefreshToken(refreshToken)
    return response.status(200).json(token)
  }

  /**
   * Leave of application
   * @param auth
   * @param response
   * @returns {Promise<void>}
   */
    async logout({auth, response})
    {
      try{
        const token = await auth.getAuthHeader();
        await auth.authenticator('jwt').revokeTokens([token])
        return response.status(200).json('Sessão encerrada!')
      }catch (e) {
        return response.status(400).json('Ops, ocorreu um erro!')
      }
    }

    /**
     * Display a single user.
     * GET users/:id
     *
     * @param {object} ctx
     * @param {Response} ctx.response
     */
    async show ({ params, response }) {
        try {
            const user = await User.find(params.id)
            return response.status(200).json(user)
        } catch (error) {
            return response.status(400).json('Ops, ocorreu um erro!')
        }
    }

    /**
     * Update user details.
     * PUT or PATCH users/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update ({ params, request, response }) {
        try {
            const data = request.all()
            const user = await User.find(params.id)
            user.merge(data)
            await user.save()
            return response.status(204).json('');
        } catch (error) {
            return response.status(400).json('Ops, ocorreu um erro!')
        }
    }

    // async info({auth, response})
    // {
    //     return new UserDetailService().info(auth, response)
    // }

    /**
     * Delete a user with id.
     * DELETE users/:id
     *
     * @param {object} ctx
     * @param {Response} ctx.response
     */
    async destroy ({ params, response }) {
        try {
            const user = await User.find(params.id)
            await user.delete()
            return response.status(200).json('Usuário deletado');
        } catch (error) {
            return response.status(400).json('Ops, ocorreu um erro!')
        }
    }
}

module.exports = UserController
