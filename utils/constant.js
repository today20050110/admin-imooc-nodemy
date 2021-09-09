const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ? '/test/imoocepub/admin-dev/admin-imooc-node/Users/today/admin-upload-ebook' : '/root/admin-imooc-nodemy/admin-upload-ebook'
const OLD_UPLOAD_URL = env === 'dev' ? 'https://book.youbaobao.xyz/book/res/img' : 'https://www.youbaobao.xyz/book/res/img'
const UPLOAD_URL = env === 'dev' ? 'http://localhost:8089/users/today/admin-upload-ebook' : 'http://test123.win/admin-upload-ebook'
module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  debug: true,
  PWD_SALT: 'admin_imooc_node',
  PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
  JWT_EXPIRED: 60 * 60, // token失效时间
  CODE_TOKEN_EXPIRED: -2,
  UPLOAD_PATH,
  UPLOAD_URL,
  OLD_UPLOAD_URL,
  MINE_TYPE_EPUB: 'application/epub+zip'
}