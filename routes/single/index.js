'use strict'
const sharp = require('sharp')
const fs = require('fs')
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
  fastify.post('/', { preHandler: upload.single('image') }, async function (request, reply) {
    const { filename } = request.file
    const id = filename.split('.')[0]
    const ext = filename.split('.')[1]
    if (ext !== 'png') {
      const img = `${process.cwd()}/uploads/${filename}`
      await sharp(img).toFile(`${process.cwd()}/uploads/${id}.png`)
      fs.unlinkSync(`${process.cwd()}/uploads/${filename}`)
    }
    return reply.send('ok')
  })

  fastify.get('/:id', async function (request, reply) {
    const { base64, w, h } = request.query
    const { id } = request.params
    const imgPath = `${process.cwd()}/uploads/${id}.png`
    const isExist = fs.existsSync(imgPath)
    if (isExist) {
      const image = fs.readFileSync(imgPath)
      const sharpRes = await sharp(image)
          .resize(w ? parseInt(w, 10) : null, h ? parseInt(h, 10) : null, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} })
          .toBuffer()
      let base64Res = null
      if (base64) {
        base64Res = `data:png;base64,${sharpRes.toString('base64')}`
      }
      return reply.send(base64 ? base64Res : sharpRes)
    }
    return reply.send('No such file')
  })

  fastify.delete('/:id', async function (request, reply) {
    const { id } = request.params
    const imgPath = `${process.cwd()}/uploads/${id}.png`
    const isExist = fs.existsSync(imgPath)
    if (isExist) {
      fs.unlinkSync(imgPath)
      return reply.send('Deleted')
    }
    return reply.send('No such file')
  })
}
