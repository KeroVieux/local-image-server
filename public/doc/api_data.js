define({ "api": [
  {
    "type": "post",
    "url": "/upload-base64",
    "title": "上传base64图片",
    "group": "图片",
    "name": "上传base64图片",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "images",
            "description": "<p>base64字符串</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "curl 请求",
        "content": "curl -X POST -d { images: ['base64 string', 'base64 string']} xx.com/upload-base64",
        "type": "curl"
      }
    ],
    "error": {
      "fields": {
        "500 Internal Server Error": [
          {
            "group": "500 Internal Server Error",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>The server encountered an internal error.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data",
            "description": "<p>上传成功的图片</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "图片",
    "sampleRequest": [
      {
        "url": "http://localhost:9071/upload-base64"
      }
    ]
  },
  {
    "type": "post",
    "url": "/upload-multi",
    "title": "上传单张图片",
    "group": "图片",
    "name": "上传单张图片-form表单使用",
    "examples": [
      {
        "title": "curl 请求",
        "content": "curl -X POST \\\n-H \"Content-Type: image/png\" \\\n--data-binary '@test.png' \\\nxx.com/upload-single",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "图片",
    "sampleRequest": [
      {
        "url": "http://localhost:9071/upload-multi"
      }
    ]
  },
  {
    "type": "post",
    "url": "/upload-multi",
    "title": "上传多张图片",
    "group": "图片",
    "name": "上传多张图片-form表单使用",
    "examples": [
      {
        "title": "curl 请求",
        "content": "curl -X POST \\\n-H \"Content-Type: image/png\" \\\n--data-binary '@test.png' \\\nxx.com/upload-multi",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "图片",
    "sampleRequest": [
      {
        "url": "http://localhost:9071/upload-multi"
      }
    ]
  },
  {
    "type": "get",
    "url": "/scan-disk",
    "title": "扫描硬盘",
    "group": "图片处理",
    "name": "扫描硬盘",
    "description": "<p>扫描硬盘中不存在数据库的文件，将不合规则的文件名改名，并增加到数据库</p>",
    "examples": [
      {
        "title": "curl 请求",
        "content": "curl -X GET xx.com/scan-disk",
        "type": "curl"
      }
    ],
    "error": {
      "fields": {
        "500 Internal Server Error": [
          {
            "group": "500 Internal Server Error",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>The server encountered an internal error.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data",
            "description": "<p>新增成功的图片</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "图片处理",
    "sampleRequest": [
      {
        "url": "http://localhost:9071/scan-disk"
      }
    ]
  },
  {
    "type": "get",
    "url": "/resize/:id",
    "title": "获取处理尺寸后的图片",
    "group": "图片处理",
    "name": "获取处理尺寸后的图片",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "_w",
            "description": "<p>缩略图宽度，默认原尺寸</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "_h",
            "description": "<p>缩略图高度，默认原尺寸</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "_format",
            "description": "<p>缩略图高度，默认png</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "curl 请求",
        "content": "curl -X GET xx.com/resize/123",
        "type": "curl"
      }
    ],
    "error": {
      "fields": {
        "500 Internal Server Error": [
          {
            "group": "500 Internal Server Error",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>The server encountered an internal error.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data",
            "description": "<p>base64</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "图片处理",
    "sampleRequest": [
      {
        "url": "http://localhost:9071/resize/:id"
      }
    ]
  },
  {
    "type": "post",
    "url": "/thumbs",
    "title": "获取缩略图列表",
    "group": "图片处理",
    "name": "获取缩略图",
    "description": "<p>返回图片数组经过处理后的base64</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "filter",
            "description": "<p>id列表，id=:id&amp;id=:id</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "_w",
            "description": "<p>缩略图宽度，默认100</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "_h",
            "description": "<p>缩略图高度，默认100</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "_format",
            "description": "<p>缩略图高度，默认png</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "curl 请求",
        "content": "curl -X POST -d { filter: 'id=:id&id=:id' } xx.com/thumbs?w=20&h=20&format=jpg",
        "type": "curl"
      }
    ],
    "error": {
      "fields": {
        "500 Internal Server Error": [
          {
            "group": "500 Internal Server Error",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>The server encountered an internal error.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data",
            "description": "<p>缩略图列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "图片处理",
    "sampleRequest": [
      {
        "url": "http://localhost:9071/thumbs"
      }
    ]
  },
  {
    "type": "get",
    "url": "/image/:fileName",
    "title": "获取原始图片",
    "group": "图片",
    "name": "获取原始图片",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "_base64",
            "description": "<p>是返回base64还是原始图片</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "curl 请求",
        "content": "curl -X GET xx.com/image/123.png",
        "type": "curl"
      }
    ],
    "error": {
      "fields": {
        "500 Internal Server Error": [
          {
            "group": "500 Internal Server Error",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>The server encountered an internal error.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "File",
            "optional": false,
            "field": "data",
            "description": "<p>图片</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "图片",
    "sampleRequest": [
      {
        "url": "http://localhost:9071/image/:fileName"
      }
    ]
  },
  {
    "type": "post",
    "url": "/upload-url",
    "title": "通过url上传图片",
    "group": "图片",
    "name": "通过url上传图片",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "images",
            "description": "<p>url字符串</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "curl 请求",
        "content": "curl -X POST \\\n-d {images:['url', 'url']} \\\nxx.com/upload-url",
        "type": "curl"
      }
    ],
    "error": {
      "fields": {
        "500 Internal Server Error": [
          {
            "group": "500 Internal Server Error",
            "optional": false,
            "field": "InternalServerError",
            "description": "<p>The server encountered an internal error.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data",
            "description": "<p>上传成功的图片</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./index.js",
    "groupTitle": "图片",
    "sampleRequest": [
      {
        "url": "http://localhost:9071/upload-url"
      }
    ]
  }
] });
