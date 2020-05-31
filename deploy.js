#!/usr/bin/env node

/**
 * Module dependencies.
 */
const shell = require('shelljs')

const SERVER = ''
const SERVER_PATH = '/apps/local-image-server/'

shell.exec(`ssh root@${SERVER} "cd ${SERVER_PATH} ; git pull ; yarn ; pm2 restart 14"`)
