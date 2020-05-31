#!/usr/bin/env node

/**
 * Module dependencies.
 */
const shell = require('shelljs')

const SERVER = '120.78.123.54'
const SERVER_PATH = '/apps/local-image-server/'

shell.exec(`ssh root@${SERVER} "cd ${SERVER_PATH} ; git pull origin doge-cloud:doge-cloud ; yarn ; pm2 restart 15"`)
