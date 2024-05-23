import { common, plugin, Renderer, segment } from '#Karin'
import { KuroUser } from '../model/user.js'
import { KuroClient } from '../model/kuro.js'

export class WutheringWaves extends plugin {
  constructor () {
    super({
      // 必选 插件名称
      name: 'WutheringWaves',
      // 插件描述
      dsc: '鸣潮基本信息',
      // 监听消息事件 默认message
      event: 'message',
      // 优先级
      priority: 5000,
      // 以下rule、task、button、handler均为可选，如键入，则必须为数组
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^(#鸣潮|ww|#ww)(\\d{9})?$',
          /** 执行方法 */
          fnc: 'basicWW'
        },
        {
          /** 命令正则匹配 */
          reg: '^(#鸣潮|ww|#ww)绑定*(token|uid)$',
          /** 执行方法 */
          fnc: 'bind'
        }
      ]
    })
  }

  async basicWW () {
    const uin = this.e.sender.uin
    const user = KuroUser.get(uin)
    if (!user) {
      await this.reply('请先绑库街区uid', { reply: true })
      return
    }
    if (user.tokens.length === 0) {
      // 尝试用全局token查询
      let allUsers = KuroUser.getAll()
      for (let key in allUsers) {
        if (allUsers[key].tokens.length > 0) {
          user.tokens = allUsers[key].tokens
          break
        }
      }
    }
    const client = new KuroClient(user.tokens[0])
    let uid = user.wwUid[0]
    const match = this.e.msg.match(/^(#鸣潮|ww|#ww)(\d{9})?$/)
    if (match && match[2]) {
      uid = match[2]
    }
    await client.sendRequest('refresh', uid)
    const { ok, data } = await client.sendRequest('base', uid)
    if (!ok) {
      await this.reply('获取信息失败', { reply: true })
      logger.error(data)
      return
    }
    const { ok: ok1, data: roleData } = await client.sendRequest('role', uid)
    if (!ok1) {
      await this.reply('获取信息失败', { reply: true })
      logger.error(roleData)
      return
    }
    const { ok: ok2, data: calabashData } = await client.sendRequest('calabash', uid)
    if (!ok2) {
      await this.reply('获取信息失败', { reply: true })
      logger.error(roleData)
      return
    }
    let icons = ['anke', 'bailian', 'danjing', 'jianxin', 'jiyan', 'kakaluo', 'lingyang', 'man', 'motefei', 'qiushui',
      'sanhua', 'taoqi', 'weilinai', 'women', 'yuanwu', 'zhixia', 'yangyang'
    ]
    const filePath = common.absPath('./plugins/karin-plugin-ww/resources')
    const html = filePath + '/template/basic/index.html'
    let renderData = {
      randomIconName: icons[Math.floor(Math.random() * icons.length)],
      base: data,
      role: roleData,
      calabash: calabashData,
      tplFile: html,
      pluResPath: process.cwd() + '/plugins/karin-plugin-ww/resources'
    }
    const img = await Renderer.render({
      name: 'render',
      data: renderData
    })
    this.reply(segment.image(img), { reply: true })
  }

  async bind () {
    let isBindToken = this.e.msg.includes('token')
    if (isBindToken) {
      this.reply('请发送要绑定的token')
      this.setContext('doBindToken')
    } else {
      this.reply('请发送要绑定的uid')
      this.setContext('doBindUid')
    }
  }

  async doBindUid () {
    let uid = this.e.msg
    KuroUser.add(new KuroUser(this.e.sender.uin, [uid], []))
    this.reply('绑定成功')
    this.finish()
  }

  async doBindToken () {
    let token = this.e.msg
    let client = new KuroClient(token)
    let { ok, data } = await client.sendRequest('user', '')
    if (ok) {
      let kuroId = data?.mine?.userId
      let { ok: ok1, data: player } = await client.sendRequest('player', kuroId)
      if (ok1) {
        let wwRole = player.defaultRoleList.find(role => role.gameId === 3)
        logger.info(wwRole)
        if (wwRole) {
          let wwUid = wwRole.roleId
          KuroUser.add(new KuroUser(this.e.sender.uin, [wwUid], [token]))
          this.reply('绑定成功')
          this.finish()
          return
        }
      } else {
        logger.error(player)
      }
    } else {
      logger.error(data)
    }
    this.reply('绑定失败')
  }
}
