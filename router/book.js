const express = require('express')
const router = express.Router()
const multer = require('multer')
const Result = require('../models/Result')
const Book = require('../models/Book')
const boom = require('boom')
const { decoded } = require('../utils')
const bookService = require('../services/book')

const { UPLOAD_PATH } = require('../utils/constant')

router.post(
    '/upload',
    multer({dest: `${UPLOAD_PATH}/book`}).single('file'),
    function(req, res, next) {
        if (!req.file || req.file.length === 0) {
            new Result('上傳電子書失敗').fail(res)
        } else {
            const book = new Book(req.file)
            book.parse()
                .then(book => {
                    new Result(book, '上傳電子書成功').success(res)
                })
                .catch(err => {
                    next(boom.badImplementation(err))
                })
        }
    }
)
router.post(
    '/create',
    function(req, res, next) {
        const decode = decoded(req)
        // console.log(req.body)
        if (decode && decode.username) {
            req.body.username = decode.username
        }
        const book = new Book(null, req.body)
        // const book = {}
        // console.log(book)
        bookService.insertBook(book).then(() => {
            new Result('添加電子書成功').success(res)
        })
        .catch(err => {
            next(boom.badImplementation(err))
        })
    }
)
router.post(
    '/update',
    function(req, res, next) {
        const decode = decoded(req)
        // console.log(req.body)
        if (decode && decode.username) {
            req.body.username = decode.username
        }
        const book = new Book(null, req.body)
        // const book = {}
        // console.log(book)
        bookService.updateBook(book).then(() => {
            new Result('更新電子書成功').success(res)
        })
        .catch(err => {
            next(boom.badImplementation(err))
        })
    }
)
router.get(
    '/get',
    function(req, res, next) {
        const { fileName } = req.query
        if (!fileName) {
            next(boom.badRequest(new Error('參數fileName不能為空')))
        } else {
            bookService.getBook(fileName).then(book => {
                new Result(book, '獲取圖書信息成功').success(res)
            }).catch(err => {
                next(boom.badImplementation(err))
            })
        }
    }
)
router.get('/category', function(req, res, next) {
        bookService.getCategory().then(category => {
            new Result(category, '獲取分類成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
)
router.get(
    '/list',
    function(req, res, next) {
        bookService.listBook(req.query).then(({ list, count, page, pageSize }) => {
            new Result({ list, count, page: +page, pageSize: +pageSize }, '獲取圖書列表成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
)
router.get(
    '/delete',
    function(req, res, next) {
        const { fileName } = req.query
        if (!fileName) {
            next(boom.badRequest(new Error('參數fileName不能為空')))
        } else {
            bookService.deleteBook(fileName).then(() => {
                new Result('刪除圖書信息成功').success(res)
            }).catch(err => {
                next(boom.badImplementation(err))
            })
        }
    }
)
module.exports = router