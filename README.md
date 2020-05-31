# local-image-server
1. a simple image hosting service used nodejs 
2. running without mysql or mongodb, lowdb is required again (I'm a big fan of lodash)
3. base64 or image from web URL is supported, besides the form submit
4. resize the image to your expect and return base64
5. all images stay in your disk

## Getting started
1. install
`yarn`

2. start
`yarn start`

## demo
open link http://localhost:9072

or

see the file in `./public/index.html`

## deploy

```bash
$ mkdir uploads
$ pm2 start yarn --interpreter bash --name local-image-server -- start
```


## what here provided
### upload single image from form

1. the name of file input must be 'image'

```http request
curl -X POST \
  -H "Content-Type: image/png" \
  --data-binary '@test.png'  \
  http://localhost:9071/upload-single
```

return

```json
{"id":"yNJ7Qa0rH","url":"http://xxx.com:9071/image/yNJ7Qa0rH.jpg"}
```

### upload multiple images from form

1. the name of file input must be 'images'

```http request
curl -X POST \
  -H "Content-Type: image/png" \
  --data-binary '@test.png'  \
  http://localhost:9071/upload-multi
```

return

```json
[{"id":"yNJ7Qa0rH","url":"http://xxx.com:9071/image/yNJ7Qa0rH.jpg"}]
```

### base64 array

```http request
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"images": ["base64 str","base64 str"]}' \
  http://localhost:9071/upload-base64
```

return

```json
[{"id":"yNJ7Qa0rH","url":"http://xxx.com:9071/image/yNJ7Qa0rH.jpg"}]
```

### image url array

```http request
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"images": ["web url","web url"]}' \
  http://localhost:9071/upload-url
```

return

```json
[{"id":"yNJ7Qa0rH","url":"http://xxx.com:9071/image/yNJ7Qa0rH.jpg"}]
```

### get images objects

```http request
curl -X GET \
  -H "nothing: {{nothing}}" \
  http://localhost:9072/images?id=:id&id=:id
```

return

```json
[{"id":"yNJ7Qa0rH","url":"http://xxx.com:9071/image/yNJ7Qa0rH.jpg"}]
```

### get image by id

```http request
curl -X GET \
  -H "nothing: {{nothing}}" \
  http://localhost:9072/images/:id
```

return

```json
{"id":"yNJ7Qa0rH","url":"http://xxx.com:9071/image/yNJ7Qa0rH.jpg"}
```

### get base64

```http request
curl -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9072/image/:id?base64=true
```

return base64 string

### get file

```http request
curl -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9072/image/:id
```

return file

### get specific size base64

```http request
curl -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9072/sharp/:id?w=100&h=100&format=png
```

return base64 string

## why not chevereto
1. the only api for upload used get method, so you cannot upload some image within large size
2. cannot get image with the specific size and format
3. bad pagination

## todo
1. search images in a disk and generate the specific info in the database
2. build an app for users like chevereto, it should have albums /pagination / tags / full-text search /multiple users
