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
app.post('/upload-single', upload.single('image'), async (req, res, next) =>{
  if (req.file) {
    axios.post('http://hidoge.cn:9072/images', {
      id: req.file.filename.split('.')[0],
      ext: req.file.filename.split('.')[1],
      fileName: req.file.filename,
      createdAt: moment().valueOf(),
    })
    return res.json({
      id: req.file.filename.split('.')[0],
      url: `http://hidoge.cn:9071/image/${req.file.filename}`
    })
  }
  return res.json(false)
})

app.post('/upload-multi', async (req, res, next) => {
  uploadMulti(req,res,function(err) {
    if (req.files && !err) {
      _.forEach(req.files, (i) => {
        axios.post('http://hidoge.cn:9072/images', {
          id: i.filename.split('.')[0],
          ext: i.filename.split('.')[1],
          fileName: i.filename,
          createdAt: moment().valueOf(),
        })
      })
      return res.json(_.map(req.files, (i) => {
        return {
          id: i.filename.split('.')[0],
          url: `http://hidoge.cn:9071/image/${i.filename}`
        }
      }))
    }
    return res.json(false)
  });
})

app.post('/upload-base64', async (req, res, next) => {
  if (req.body.images && req.body.images.length) {
    const data = []
    _.forEach(req.body.images, (i) =>{
      const str = i.split(';base64,').pop()
      const id = `${shortid.generate()}`
      fs.writeFile(`./uploads/${id}.png`, str, 'base64', function(err) {
        console.log(err);
      })
      data.push({
        id,
        url: `http://hidoge.cn:9071/image/${id}.png`,
      })
      axios.post('http://hidoge.cn:9072/images', {
        id,
        ext: 'png',
        fileName: `${id}.png`,
        createdAt: moment().valueOf(),
      })
    })
    return res.json(data)
  }
  return res.json(false)
})

const downloadImage = async (url, filePath) => {
  const req = await axios({
    url,
    responseType: 'stream',
  })
  await req.data.pipe(fs.createWriteStream(filePath))
}

app.post('/upload-url', async (req, res, next) => {
  const { images } = req.body
  console.log('images', images)
  const data = []
  _.forEach(images, (i) => {
    const id = shortid.generate()
    downloadImage(i, `./uploads/${id}.png`)
    data.push({
      id,
      url: `http://hidoge.cn:9071/image/${id}.png`
    })
    axios.post('http://hidoge.cn:9072/images', {
      id: id,
      fileName: `${id}.png`,
      ext: 'png',
      url: `http://hidoge.cn:9071/image/${id}.png`,
      createdAt: moment().valueOf(),
    })
  })
  res.json(data)
})

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

app.post('/thumb/', async (req, res, next) => {
  const { filter } = req.body
  const { w, h, format} = req.query
  const { data } = await axios.get(`http://hidoge.cn:9072/images?${filter}`)
  console.log('data', data)
  const images = []
  _.forEach(data, async (i) => {
    const image = path.join(__dirname, 'uploads', i.fileName)
    const sharpRes = await sharp(image)
        .resize(w ? parseInt(w, 10) : 100, h ? parseInt(h, 10) : 100, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} })
        .toBuffer()
    _.assign(i, { base64: sharpRes })
    images.push(i)
  })
  return res.send(images)
})

app.get('/sharp/:id', async (req, res, next) => {
  const { id } = req.params
  const { w, h, format} = req.query
  const { data } = await axios.get(`http://localhost:9072/images/${id}`)
  const image = path.join(__dirname, 'uploads', data.fileName)
  const sharpRes = await sharp(image)
      .resize(w ? parseInt(w, 10) : null, h ? parseInt(h, 10) : null, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} })
      .toBuffer()
  return res.send(`data:${format || data.ext};base64,${sharpRes.toString('base64')}`)
})


app.listen(9071, () => {
  console.log('local image server started on 9071')
})
