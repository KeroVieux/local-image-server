'use strict'
const sharp = require('sharp')
const fs = require('fs')
const axios = require('axios')
const dayjs = require('dayjs')
const multer = require('fastify-multer')
const nanoid = require('nanoid').nanoid


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `uploads`)
  },
  filename: function (req, file, cb) {
    cb(null, `${nanoid(8)}.${file.originalname.split('.')[1]}`)
  }
})

const upload = multer({ storage })

module.exports = async function (fastify, opts) {
  fastify.addContentTypeParser('*', function (req, done) {
    done()
  })
  fastify.post('/', { preHandler: upload.array('image', 12) }, async function (request, reply) {
    const list = []
    for (const i of request.files) {
      const payload = {
        id: i.filename.split('.')[0],
        createdAt: dayjs().format(),
      }
      if (i.filename.split('.')[1] !== 'png') {
        const img = `${process.cwd()}/uploads/${i.filename}`
        await sharp(img).toFile(`${process.cwd()}/uploads/${payload.id}.png`)
        fs.unlinkSync(`${process.cwd()}/uploads/${i.filename}`)
      }
      list.push(payload)
    }

    return reply.send({
      code: 0,
      list,
    })
  })

  fastify.post('/base64', async function (request, reply) {
    if (request.body.images && request.body.images.length) {
      const list = []
      for (const i of request.body.images) {
        const str = i.split(';base64,').pop()
        const id = nanoid(8)
        const imgBuffer = Buffer.from(str, 'base64')
        await sharp(imgBuffer).toFile(`${process.cwd()}/uploads/${id}.png`)
        list.push({
          id,
          createdAt: dayjs().format(),
        })
      }
      return reply.send({
        code: 0,
        list,
      })
    }
    return reply.send({
      code: 1,
      msg: 'No images',
    })
  })

  fastify.post('/url', async function (request, reply) {
    if (request.body.images && request.body.images.length) {
      const list = []
      for (const i of request.body.images) {
        const id = nanoid(8)
        const { imgBuffer } = await axios({ url: i, responseType: 'arraybuffer'} )
        await sharp(imgBuffer).toFile(`${process.cwd()}/uploads/${id}.png`)
        list.push({
          id,
          createdAt: dayjs().format(),
        })
      }
      return reply.send({
        code: 0,
        list,
      })
    }
    return reply.send({
      code: 1,
      msg: 'No images',
    })
  })

  fastify.get('/', async function (request, reply) {
    const { ids, w, h } = request.query
    if (ids && ids.length) {
      const list = []
      for (const id of ids) {
        const imgPath = `${process.cwd()}/uploads/${id}.png`
        const isExist = fs.existsSync(imgPath)

        if (isExist) {
          const image = fs.readFileSync(imgPath)
          const sharpRes = await sharp(image)
              .resize(w ? parseInt(w, 10) : null, h ? parseInt(h, 10) : null, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} })
              .toBuffer()
          list.push({
            id,
            base64: `data:png;base64,${sharpRes.toString('base64')}`,
          })
        }
      }
      return reply.send({
        code: 0,
        list,
      })
    }
    return reply.send({
      code: 1,
      msg: 'No images',
    })
  })

  fastify.delete('/', async function (request, reply) {
    const { ids } = request.query
    if (ids && ids.length) {
      for (const id of ids) {
        const imgPath = `${process.cwd()}/uploads/${id}.png`
        const isExist = fs.existsSync(imgPath)
        if (isExist) {
          fs.unlinkSync(imgPath)
          return reply.send('Deleted')
        }
      }
      return reply.send({
        code: 0,
        msg: 'Deleted',
      })
    }
    return reply.send({
      code: 1,
      msg: 'No images',
    })
  })
}
