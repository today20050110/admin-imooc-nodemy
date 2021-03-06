const Book = require('../models/Book')
const db = require('../db')
const _ = require('lodash')
const { debug } = require('../utils/constant')

function exists(book) {
    const { title, author, publisher } = book
    const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
    return db.queryOne(sql)
}
async function removeBook(book) {
    if (book) {
        book.reset()
        if (book.fileName) {
            const removeBookSql = `delete from book where fileName='${book.fileName}'`
            const removeContentsSql = `delete from contents where fileName='${book.fileName}'`
            await db.querySql(removeBookSql)
            await db.querySql(removeContentsSql)
        }
    }
}
async function insertContents(book) {
    const contents = book.getContents()
    // console.log('contents', contents)
    if (contents && contents.length > 0) {
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i]
            const _content = _.pick(content, [
                'fileName',
                'id',
                'href',
                'text',
                'order',
                'level',
                'label',
                'pid',
                'navId'
            ])
            // console.log('_content', _content)
            await db.insert(_content, 'contents')
        }
    }
}
function insertBook(book) {
    return new Promise(async (resolve, reject) => {
        try {
            if (book instanceof Book) {
                const result = await exists(book)
                if (result) {
                    await removeBook(book)
                    reject(new Error('電子書已存在'))
                } else {
                    await db.insert(book.toDb(), 'book')
                    await insertContents(book)
                    resolve()
                }
            } else {
                reject(new Error('添加的圖書對象不合法'))
            }
        } catch (e) {
            reject(e)
        }
    })
}
function updateBook(book) {
    return new Promise(async (resolve, reject) => {
        try {
            if (book instanceof Book) {
                const result = await getBook(book.fileName)
                if (result) {
                    const model = book.toDb()
                    if (+result.updateType === 0) {
                        reject(new Error('內置圖書不能編輯'))
                    } else {
                        await db.update(model, 'book', `where fileName='${book.fileName}'`)
                        resolve()
                    }
                }
            } else {
                reject(new Error('添加的圖書對象不合法'))
            }
        } catch (e) {
            reject(e)
        }
    })
}
function getBook(fileName) {
    return new Promise(async (resolve, reject) => {
        const bookSql = `select * from book where fileName='${fileName}'`
        const contentsSql = `select * from contents where fileName='${fileName}' order by \`order\``
        const book = await db.queryOne(bookSql)
        const contents = await db.querySql(contentsSql)
        if (book) {
            book.cover = Book.getCoverUrl(book)
            console.log('--cover--', book.cover)
            book.contentsTree = Book.getContentsTree(contents)
            resolve(book)
        } else {
            reject(new Error('電子書不存在'))
        }
    })
}
async function getCategory() {
    const sql = 'select * from category order by category asc'
    const result = await db.querySql(sql)
    const categoryList = []
    result.forEach(item => {
        // console.log(item)
        categoryList.push({
            label: item.categoryText,
            value: item.category,
            num: item.num
        })
    })
    return categoryList
}
async function listBook(query) {
    console.log('query--', query)
    const {
        category,
        author,
        title,
        sort,
        page = 1,
        pageSize = 20 } = query
    const offset = ( page - 1 ) * pageSize
    let bookSql = 'select * from book'
    let where = 'where'
    title && (where = db.andLike(where, 'title', title))
    author && (where = db.andLike(where, 'author', author))
    category && (where = db.and(where, 'categoryText', category))
    if (where !== 'where') {
        bookSql = `${bookSql} ${where}`
    }
    if (sort) {
        const symbol = sort[0]
        const column = sort.slice(1, sort.length)
        const order = symbol === '+' ? 'asc' : 'desc'
        bookSql = `${bookSql} order by \`${column}\` ${order}`
    }
    let countSql = `select count(*) as count from book`
    if (where !== 'where') {
        countSql = `${countSql} ${where}`
    }
    const count = await db.querySql(countSql)
    console.log('count----', count)
    bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
    const list = await db.querySql(bookSql)
    list.forEach(book => book.cover = Book.getCoverUrl(book))
    return  { list, count: count[0].count, page, pageSize }
}
function deleteBook(fileName) {
    return new Promise(async (resolve, reject) => {
        let book = await getBook(fileName)
        if (book) {
            if (+book.updateType === 0) {
                reject(new Error('內置電子書不能刪除'))
            } else {
                const bookObj = new Book(null, book)
                const sql = `delete from book where fileName='${fileName}'`
                db.querySql(sql).then(() => {
                    bookObj.reset()
                    resolve()
                })
            }
        } else {
            reject(new Error('電子書不存在'))
        }
    })
}
module.exports = {
    insertBook,
    updateBook,
    getBook,
    getCategory,
    listBook,
    deleteBook
}