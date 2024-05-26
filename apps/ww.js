import { common, plugin, Renderer, segment } from '#Karin'
import { KuroUser } from '../model/user.js'
import { KuroClient } from '../model/kuro.js'

const characters =
  {
    1102: {
      name: '散华',
      alias: ['散花', 'Sanhua']
    },
    1103: {
      name: '白芷',
      alias: ['白纸', 'Baizhi']
    },
    1104: {
      name: '凌阳',
      alias: ['雪豹', 'Lingyang']
    },
    1202: {
      name: '炽霞',
      alias: ['赤霞', 'Chixia']
    },
    1203: {
      name: '安可',
      alias: ['安妮', 'Encore']
    },
    1204: {
      name: '莫特斐',
      alias: ['Mortefi']
    },
    1301: {
      name: '卡卡罗',
      alias: ['calcharo', 'kakarot', '可可萝']
    },
    1302: {
      name: '吟霖',
      alias: ['银临', '银铃', 'Yinlin']
    },
    1303: {
      name: '渊武',
      alias: ['元武', 'Yuanwu']
    },
    1304: {},
    1402: {
      name: '秧秧',
      alias: ['泱泱']
    },
    1403: {
      name: '秋水',
      alias: []
    },
    1404: {
      name: '忌炎',
      alias: ['鸡眼', 'Jiyan']
    },
    1405: {
      name: '鉴心',
      alias: ['Jianxin', '小道', '剑心']
    },
    1501: {
      name: '漂泊者-衍射',
      alias: ['漂泊者']
    },
    1502: {
      name: '漂泊者-衍射',
      alias: ['漂泊者']
    },
    1503: {
      name: '维里奈',
      alias: ['维里', '维里奈', 'Verina']
    },
    1504: {
      name: '漂泊者-导电',
      alias: ['漂泊者']
    },
    1505: {
      name: '漂泊者-导电',
      alias: ['漂泊者']
    },
    1601: {
      name: '桃祈',
      alias: ['淘气', 'Taoqi']
    },
    1602: {
      name: '丹瑾',
      alias: ['丹静', 'Danjin']
    },
    1603: {
      name: '椿',
      alias: ['Chun', 'Camellya']
    },
    1604: {
      name: '漂泊者-湮灭',
      alias: ['漂泊者']
    },
    1605: {
      name: '漂泊者-湮灭',
      alias: ['漂泊者']
    }
  }
const chatReg = Object.values(characters).flatMap(i => {
  let r = i.alias || []
  r.push(i.name)
  return r
}).filter(i => i).join('|')
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
          reg: `#?(${chatReg})`,
          /** 执行方法 */
          fnc: 'role'
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
    let icons = ['anke', 'bailian', 'danjing', 'jianxin', 'jiyan', 'lingyang', 'man', 'motefei', 'qiushui',
      'sanhua', 'taoqi', 'women', 'yuanwu', 'zhixia', 'yangyang'
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

  async role () {
    let msg = this.e.msg
    let role = msg.replace(/#/g, '')
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
    let roles = await client.sendRequest('role', user.wwUid[0])
    if (!roles.ok) {
      await this.reply('获取信息失败', { reply: true })
      logger.error(roles.data)
      return
    }
    let roleId = 0
    for (let char of Object.keys(characters)) {
      if (characters[char].alias?.includes(role) && roles.data.roleList?.find(role => role.roleId === parseInt(char))) {
        roleId = char
        break
      }
    }
    if (!roleId) {
      return
    }

    let res = await client.sendRequest('roleDetail', user.wwUid[0], { id: roleId })
    if (!res.ok) {
      await this.reply('获取信息失败', { reply: true })
      logger.error(res.data)
      return
    }
    let roleDetail = res.data
    const filePath = common.absPath('./plugins/karin-plugin-ww/resources')
    const html = filePath + '/template/role/index.html'
    let renderData = {
      data: roleDetail,
      tplFile: html,
      pluResPath: process.cwd() + '/plugins/karin-plugin-ww/resources'
    }
    const img = await Renderer.render({
      name: 'render',
      data: renderData
    })
    this.reply(segment.image(img), { reply: true })
  }
}
