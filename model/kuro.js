import axios from 'axios'

export class KuroClient {
  /**
   * token
   * @type {string}
   */
  token

  /**
   * gameId ww=3
   * @type {number}
   */
  gameId = 3

  /**
   * serverId 官服
   * @type {string}
   */
  serverId = '76402e5b20be2c39f095a152090afddc'

  baseUrl = {
    '76402e5b20be2c39f095a152090afddc': 'https://api.kurobbs.com'
  }

  urlMap = {
    base: {
      url: '/gamer/roleBox/aki/baseData',
      method: 'post',
      body: (roleId) => `gameId=${this.gameId}&roleId=${roleId}&serverId=${this.serverId}`
    },
    refresh: {
      url: '/gamer/roleBox/aki/refreshData',
      method: 'post',
      body: (roleId) => `gameId=${this.gameId}&roleId=${roleId}&serverId=${this.serverId}`
    },
    daily: {
      url: '/gamer/widget/game3/getData',
      method: 'post',
      body: (roleId, params = { type: 2, sizeType: 1 }) => `type=${params.type}&sizeType=${params.sizeType}&gameId=${this.gameId}&roleId=${roleId}&serverId=${this.serverId}`
    },
    role: {
      url: '/gamer/roleBox/aki/roleData',
      method: 'post',
      body: (roleId) => `gameId=${this.gameId}&roleId=${roleId}&serverId=${this.serverId}`
    },
    roleDetail: {
      url: '/gamer/roleBox/aki/getRoleDetail',
      method: 'post',
      body: (roleId, params = { id: 1501, channelId: 19 }) => `gameId=${this.gameId}&roleId=${roleId}&serverId=${this.serverId}&channelId=${params.channelId}&countryCode=1&id=${params.id}`
    },
    challenge: {
      url: '/gamer/roleBox/aki/challengeIndex',
      method: 'post',
      body: (roleId, params = { channelId: 19 }) => `gameId=${this.gameId}&roleId=${roleId}&serverId=${this.serverId}&channelId=${params.channelId}&countryCode=1`
    },
    // 葫芦
    calabash: {
      url: '/gamer/roleBox/aki/calabashData',
      method: 'post',
      body: (roleId) => `gameId=${this.gameId}&roleId=${roleId}&serverId=${this.serverId}`
    },
    user: {
      url: '/user/mineV2',
      method: 'post',
      body: () => 'type=1'
    },
    player: {
      url: '/gamer/role/default',
      method: 'post',
      body: (kuroId) => `queryUserId=${kuroId}`
    }
  }

  /**
   * kurobbs client
   * @param {string} token
   */
  constructor (token) {
    this.token = token
  }

  /**
   * 通用请求接口
   * @param {'base'|'refresh'|'daily'|'role'|'roleDetail'|'challenge'|'calabash'|'user'|'player'} type
   * @param {string} roleId
   * @param {any?} params
   * @return {Promise<{code: number, data: any, ok: boolean}>}
   */
  async sendRequest (type, roleId, params) {
    const options = this.urlMap[type]
    const url = this.baseUrl[this.serverId] + options.url
    const body = options.body(roleId, params)
    // use axios
    const res = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        token: this.token,
        Origin: 'https://web-static.kurobbs.com',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)  KuroGameBox/2.2.0',
        source: 'ios'
      }
    })
    return {
      ok: res.status === 200,
      code: res.status,
      data: res.data?.data
    }
  }
}
