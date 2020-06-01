const _ = require('lodash')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs');
const axios = require('axios')
const shortid = require('shortid')
const moment = require('moment')
const sharp = require('sharp')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })
const uploadMulti = multer({ storage }).array('images',100)
const path = require('path')
const app = express()

app.use(cors())
app.use(bodyParser.json())

/**
 * @api {post} /upload-multi 上传单张图片
 * @apiGroup 图片
 * @apiName 上传单张图片-form表单使用
 * @apiExample {curl} curl 请求
 * curl -X POST \
 * -H "Content-Type: image/png" \
 * --data-binary '@test.png' \
 * xx.com/upload-single
 */
app.post('/upload-single', upload.single('image'), async (req, res, next) =>{
  if (req.file) {
    axios.post('http://127.0.0.1:9072/images', {
      id: req.file.filename.split('.')[0],
      ext: req.file.filename.split('.')[1],
      fileName: req.file.filename,
      createdAt: moment().valueOf(),
    })
    return res.json({
      id: req.file.filename.split('.')[0],
      ext: req.file.filename.split('.')[1],
      fileName: req.file.filename,
    })
  }
  return res.send(false)
})

/**
 * @api {post} /upload-multi 上传多张图片
 * @apiGroup 图片
 * @apiName 上传多张图片-form表单使用
 * @apiExample {curl} curl 请求
 * curl -X POST \
 * -H "Content-Type: image/png" \
 * --data-binary '@test.png' \
 * xx.com/upload-multi
 */
app.post('/upload-multi', async (req, res, next) => {
  uploadMulti(req,res,function(err) {
    if (req.files && !err) {
      _.forEach(req.files, (i) => {
        axios.post('http://127.0.0.1:9072/images', {
          id: i.filename.split('.')[0],
          ext: i.filename.split('.')[1],
          fileName: i.filename,
          createdAt: moment().valueOf(),
        })
      })
      return res.send(_.map(req.files, (i) => {
        return {
          id: i.filename.split('.')[0],
          fileName: `${id}.png`,
        }
      }))
    }
    return res.send(false)
  });
})

/**
 * @api {post} /upload-base64 上传base64图片
 * @apiGroup 图片
 * @apiName 上传base64图片
 * @apiParam {Array} images base64字符串
 * @apiExample {curl} curl 请求
 * curl -X POST -d { images: ['base64 string', 'base64 string']} xx.com/upload-base64
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error.
 * @apiSuccess { Array } data 上传成功的图片
 */
app.post('/upload-base64', async (req, res, next) => {
  if (req.body.images && req.body.images.length) {
    const data = []
    _.forEach(req.body.images, (i) =>{
      const str = i.split(';base64,').pop()
      const id = `${shortid.generate()}`
      fs.writeFile(`./uploads/${id}.png`, str, 'base64')
      data.push({
        id,
        ext: 'png',
        fileName: `${id}.png`,
      })
      axios.post('http://127.0.0.1:9072/images', {
        id,
        ext: 'png',
        fileName: `${id}.png`,
        createdAt: moment().valueOf(),
      })
    })
    return res.send(data)
  }
  return res.send(false)
})

/**
 * @api {post} /upload-url 通过url上传图片
 * @apiGroup 图片
 * @apiName 通过url上传图片
 * @apiParam {Array} images url字符串
 * @apiExample {curl} curl 请求
 * curl -X POST \
 * -d {images:['url', 'url']} \
 * xx.com/upload-url
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error.
 * @apiSuccess { Array } data 上传成功的图片
 */

app.post('/upload-url', async (req, res, next) => {
  const { images } = req.body
  const inserted = []
  for (const i of images) {
    const id = shortid.generate()
    const { data } = await axios({ url: i, responseType: 'arraybuffer'} )
    await sharp(data).toFile(`./uploads/${id}.png`)
    inserted.push({
      id,
      ext: 'png',
      fileName: `${id}.png`,
    })
    await axios.post('http://127.0.0.1:9072/images', {
      id,
      fileName: `${id}.png`,
      ext: 'png',
      createdAt: moment().valueOf(),
    })
  }
  res.send(inserted)
})

/**
 * @api {get} /image/:fileName 获取原始图片
 * @apiGroup 图片
 * @apiName 获取原始图片
 * @apiParam {String} _base64 是返回base64还是原始图片
 * @apiExample {curl} curl 请求
 * curl -X GET xx.com/image/123.png
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error.
 * @apiSuccess { File } data 图片
 */
app.get('/image/:fileName', async (req, res, next) => {
  const base64 = req.query.base64
  const { fileName } = req.params
  const image = path.join(__dirname, 'uploads', fileName)
  if (base64) {
    const bitmap = fs.readFileSync(image);
    const base64str = Buffer.from(bitmap, 'binary').toString('base64')

    return res.send(`data:${fileName.split('.')[1]};base64,${base64str}`)
  }
  return res.sendFile(image)
})

/**
 * @api {post} /thumbs 获取缩略图列表
 * @apiGroup 图片处理
 * @apiName 获取缩略图
 * @apiDescription 返回图片数组经过处理后的base64
 * @apiParam {String} filter id列表，id=:id&id=:id
 * @apiParam {Number} _w 缩略图宽度，默认100
 * @apiParam {Number} _h 缩略图高度，默认100
 * @apiParam {String} _format 缩略图高度，默认png
 * @apiExample {curl} curl 请求
 * curl -X POST -d { filter: 'id=:id&id=:id' } xx.com/thumbs?w=20&h=20&format=jpg
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error.
 * @apiSuccess { Array } data 缩略图列表
 */
app.post('/thumbs/', async (req, res, next) => {
  const { filter } = req.body
  const { w, h, format} = req.query
  const { data } = await axios.get(`http://127.0.0.1:9072/images?${filter}`)
  const images = []
  for (const i of data) {
    const image = path.join(__dirname, 'uploads', i.fileName)
    const sharpRes = await sharp(image)
        .resize(w ? parseInt(w, 10) : 100, h ? parseInt(h, 10) : 100, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} })
        .toBuffer()
    images.push({
      id: i.id,
      fileName: i.fileName,
      base64: `data:${format || i.ext};base64,${sharpRes.toString('base64')}`,
    })
  }
  return res.send(images)
})

/**
 * @api {get} /sharp/:id 获取处理尺寸后的图片
 * @apiGroup 图片处理
 * @apiName 获取处理尺寸后的图片
 * @apiParam {Number} _w 缩略图宽度，默认原尺寸
 * @apiParam {Number} _h 缩略图高度，默认原尺寸
 * @apiParam {String} _format 缩略图高度，默认png
 * @apiExample {curl} curl 请求
 * curl -X GET xx.com/sharp/123
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error.
 * @apiSuccess { String } data base64
 */
app.get('/sharp/:id', async (req, res, next) => {
  const { id } = req.params
  const { w, h, format} = req.query
  const { data } = await axios.get(`http://127.0.0.1:9072/images/${id}`)
  const image = path.join(__dirname, 'uploads', data.fileName)
  const sharpRes = await sharp(image)
      .resize(w ? parseInt(w, 10) : null, h ? parseInt(h, 10) : null, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} })
      .toBuffer()
  return res.send(`data:${format || data.ext};base64,${sharpRes.toString('base64')}`)
})

/**
 * @api {get} /scan-disk 扫描硬盘
 * @apiGroup 图片处理
 * @apiName 扫描硬盘
 * @apiDescription 扫描硬盘中不存在数据库的文件，将不合规则的文件名改名，并增加到数据库
 * @apiExample {curl} curl 请求
 * curl -X GET xx.com/scan-disk
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error.
 * @apiSuccess { Array } data 新增成功的图片
 */
app.get('/scan-disk', async (req, res, next) => {
  const fsList = fs.readdirSync('./uploads')
  const { data } = await axios.get('http://127.0.0.1:9072/images/')
  const existIds = _.map(data, (i) => {
    return i.id
  })
  let needInsert = []
  const needAlter = []
  _.forEach(fsList, (i) => {
    const nameList = i.split('.')
    if (!_.includes(existIds, nameList[0])) {
      if (nameList.length !== 2) {
        needAlter.push(i)
      } else if (shortid.isValid(nameList[0])) {
        needInsert.push({
          id: nameList[0],
          ext: nameList[1],
          fileName: i,
          createdAt: moment().valueOf(),
        })
      } else {
        needAlter.push(i)
      }
    }
  })
  for (const i of needAlter) {
    const image = path.join(__dirname, 'uploads', i)
    const id = shortid.generate()
    const nameList = i.split('.')
    const ext = nameList[nameList.length - 1],
        fileName = `${id}.${ext}`
    await sharp(image).toFile(`./uploads/${fileName}`)
    fs.unlinkSync(`./uploads/${i}`)
    needInsert.push({
      id,
      ext,
      fileName,
      createdAt: moment().valueOf(),
    })
  }
  _.forEach(needInsert, async (i) => {
    await axios.post('http://127.0.0.1:9072/images/', i)
  })
  res.send(needInsert)
})
app.listen(9071, () => {
  console.log('local image server started on 9071')
})
