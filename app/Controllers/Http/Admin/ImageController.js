'use strict'

const { manage_multiple_uploads, manage_single_upload } = use('App/Helpers')
const Image = use('App/Models/Image')
const fs = use('fs') // require('fs')
const Helpers = use('Helpers')
const Transformer = use('App/Transformers/Image/ImageTransformer')

class ImageController {
  async bulkUpload({ request, response, transform }) {
    const fileJar = request.file('images', {
      types: ['image'],
      size: '2mb'
    })

    let files = await manage_multiple_uploads(fileJar)
    let images = []
    await Promise.all(
      files.successes.map(async file => {
        let image = await Image.create({
          path: file.fileName,
          size: file.size,
          original_name: file.clientName,
          extension: file.subtype
        })
        images.push(image)
      })
    )

    images = await transform.collection(images, Transformer)

    return response
      .status(201)
      .send({ successes: images, errors: files.errors })
  }

  async index({ request, response, pagination }) {
    let images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.perpage)
    return response.send(images)
  }

  async store({ request, response, transform }) {
    try {
      // captura uma lista de imagens
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      // retorno da api
      let images = []

      // caso seja enviado um único arquivo, trata como single file
      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar)
        if (file.moved()) {
          const imagem = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          images.push(imagem)
          images = await transform.collection(images, Transformer)

          return response.status(201).send({ success: images, errors: {} })
        }

        return response.status(500).send({
          message: 'Não foi possível processar a sua solicitação!'
        })
      }

      // caso sejam enviados vários arquivos
      let files = await manage_multiple_uploads(fileJar)

      await Promise.all(
        files.successes.map(async file => {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })
          images.push(image)
        })
      )
      images = await transform.collection(images, Transformer)

      return response
        .status(201)
        .send({ success: images, errrors: files.errors })
    } catch (e) {
      return response.status(500).send({
        message: 'Não foi possível processar a sua soliticação',
        error: e.message
      })
    }
  }

  async update({ request, response, params: { id }, transform }) {
    const image = await Image.findOrFail(id)
    try {
      image.merge(request.only(['original_name']))
      await image.save()
      return response.status(200).send(await transform.item(image, Transformer))
    } catch (e) {
      return response.status(500).send({
        message: 'Não foi possível processar a sua soliticação',
        error: e.message
      })
    }
  }

  async show({ response, params, transform }) {
    const image = await Image.findOrFail(params.id)
    return response.send(await transform.item(image, Transformer))
  }

  async destroy({ response, params }) {
    const image = await Image.findOrFail(params.id)

    try {
      let filePath = Helpers.publicPath(`uploads/${image.path}`)

      await fs.unlink(filePath, err => {
        // if (err) throw err
      })

      await image.delete()
      return response.status(204).send()
    } catch (e) {
      return response.status(400).send({
        message: 'Não foi possível processar a sua soliticação',
        error: e.message
      })
    }
  }
}

module.exports = ImageController
