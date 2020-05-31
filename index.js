const _ = require('lodash')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs');
const axios = require('axios')
const shortid = require('shortid')
const moment = require('moment')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db.json')
const db = low(adapter)

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
    axios.post('http://localhost:9072/images', {
      id: req.file.filename.split('.')[0],
      ext: req.file.filename.split('.')[1],
      fileName: req.file.filename,
      createdAt: moment().valueOf(),
    })
    return res.json({
      id: req.file.filename.split('.')[0],
      url: `http://localhost:9071/image/${req.file.filename}`
    })
  }
  return res.json(false)
})

app.post('/upload-multi', async (req, res, next) => {
  uploadMulti(req,res,function(err) {
    if (req.files && !err) {
      _.forEach(req.files, (i) => {
        axios.post('http://localhost:9072/images', {
          id: i.filename.split('.')[0],
          ext: i.filename.split('.')[1],
          fileName: i.filename,
          createdAt: moment().valueOf(),
        })
      })
      return res.json(_.map(req.files, (i) => {
        return {
          id: i.filename.split('.')[0],
          url: `http://localhost:9071/image/${i.filename}`
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
        url: `http://localhost:9071/image/${id}.png`,
      })
      axios.post('http://localhost:9072/images', {
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
      url: `http://localhost:9071/image/${id}.png`
    })
    axios.post('http://localhost:9072/images', {
      id: id,
      fileName: `${id}.png`,
      ext: 'png',
      url: `http://localhost:9071/image/${id}.png`,
      createdAt: moment().valueOf(),
    })
  })
  res.json(data)
})

app.get('/image/:fileName', function (req, res, next) {
  const base64 = req.query.base64
  const fileName = req.params['fileName']
  const image = path.join(__dirname, 'uploads', fileName)
  if (base64) {
    const data = db.get('images').find({ fileName }).value()
    const bitmap = fs.readFileSync(image);
    const base64str = Buffer.from(bitmap, 'binary').toString('base64')

    return res.send(`data:${data.ext};base64,${base64str}`)
  }
  return res.sendFile(image)
})

app.listen(9071, () => {
  console.log('local image server started on 9071')
})
