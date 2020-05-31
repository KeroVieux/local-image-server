# local-image-server
1. a simple image hosting service used nodejs 
2. running without mysql or mongodb, lowdb is required again (I'm a big fan of lodash)
3. base64 or image from web URL is supported, besides the form submit
4. resize the image to your expected and return base64
5. all images stay in your disk

## Getting started
1. install
`yarn`

2. start
`yarn start`

3. finally
two server have started, one is image server, the other one is data server.(default port is 9071 and 9072)

## demo
[image list demo](http://hidoge.cn:9072/)

## deploy

```bash
$ mkdir uploads
$ pm2 start yarn --interpreter bash --name local-image-server -- start
```


## what here provided

### upload single image from form

1. the name of file input must be 'image'  

```
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

```
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

```
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

```
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

```
curl -X GET \
  -H "nothing: {{nothing}}" \
  http://localhost:9072/images?id=:id&id=:id
```

return  

```json
[{"id":"yNJ7Qa0rH","url":"http://xxx.com:9071/image/yNJ7Qa0rH.jpg"}]
```

### get thumbs

```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"filter": "id=:id&id=:id"' \
  http://localhost:9071/thumbs
```

return  

```json
[{"id":"yNJ7Qa0rH","fileName":"yNJ7Qa0rH.jpg","base64": "base64"}]
```

### get image by id

```
curl -X GET \
  -H "nothing: {{nothing}}" \
  http://localhost:9072/images/:id
```

return  

```json
{"id":"yNJ7Qa0rH","url":"http://xxx.com:9071/image/yNJ7Qa0rH.jpg"}
```

### get base64

```
curl -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9072/image/:id?base64=true
```

return base64 string  

### get file

```
curl -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9072/image/:id
```

return file  

### get specific size base64  

```
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
