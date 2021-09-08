const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./router')

// 创建 express 应用
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// app.all('*', function(req, res, next) {  
//   res.header("Access-Control-Allow-Origin", "*");  
//   res.header("Access-Control-Allow-Headers", "X-Requested-With,xtoken");  
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
//   res.header("X-Powered-By",' 3.2.1')  
//   res.header("Content-Type", "application/json;charset=utf-8");  
//   next();  
// }); 
// app.use(cors({
//   origin:['http://localhost:5000'],
//   methods:['GET','POST'],
//   alloweHeaders:['Conten-Type', 'Authorization']
// }));
app.use('/', router)


// 使 express 监听 5000 端口号发起的 http 请求
const server = app.listen(5000, function() {
  const { address, port } = server.address()
  console.log('Http 服務啟動成功 on http://%s:%s', address, port)
})