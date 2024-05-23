import fs from 'fs'

const DATA_DIR = 'data/karin-plugin-ww'
export class KuroUser {
  /**
   * @type {number|string} qq号
   */
  uin

  /**
   * @type {string[]} 对应的uid们
   */
  wwUid

  /**
   * @type {string[]} 对应的token们
   */
  tokens

  /**
   * 角色绑定
   * @param uin
   * @param wwUid
   * @param tokens
   */
  constructor (uin, wwUid, tokens) {
    this.uin = uin
    this.wwUid = wwUid
    this.tokens = tokens
  }

  /**
   * 所有
   * @return {Object.<string|number, KuroUser>}
   */
  static getAll () {
    if (!fs.existsSync(`${DATA_DIR}/user.json`)) {
      fs.writeFileSync(`${DATA_DIR}/user.json`, '{}')
    }
    const users = fs.readFileSync(`${DATA_DIR}/user.json`, 'utf8')
    return JSON.parse(users)
  }

  /**
   * 会覆盖所有
   * @param {Object.<string|number, KuroUser>} bindings
   */
  static saveAll (bindings) {
    if (bindings) {
      fs.writeFileSync(`${DATA_DIR}/user.json`, JSON.stringify(bindings, null, 2))
    }
  }

  /**
   * get
   * @param {number|string} uin
   * @return {KuroUser}
   */
  static get (uin) {
    const users = KuroUser.getAll()
    return users[uin]
  }

  /**
   * 增加绑定
   * @param {KuroUser} binding
   */
  static add (binding) {
    if (!fs.existsSync(`${DATA_DIR}/user.json`)) {
      fs.writeFileSync(`${DATA_DIR}/user.json`, '{}')
    }
    const users = KuroUser.getAll()
    users[binding.uin] = binding
    KuroUser.saveAll(users)
  }

  static delete (uin, wwUids) {
    let users = KuroUser.getAll()
    let user = users[uin]
    if (!user) {
      logger.warn(`用户${uin}不存在，跳过删除`)
      return
    }
    user.wwUid = user.wwUid.filter(wwUid => !wwUids.includes(wwUid))
    users[uin] = user
    KuroUser.saveAll(users)
  }
}
