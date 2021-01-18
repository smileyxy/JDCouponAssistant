export enum activityType {
    none,
    monsterNian = "monsterNian",
    brandCitySpring = "brandCitySpring",
    palace = "palace",
    receiveBless = "ReceiveBless",
    cakeBaker = "cakeBaker",
    carnivalCity = "carnivalCity",
    rubiksCube = "rubiksCube",
    arFutureCity = "arFutureCity",
    allBusiness = "allBusiness",
}

export enum cakeBakerTaskEnum {
    "全部" = "All",
    "营业" = "foldCake",
    "收取金币" = "collectProducedCoin",
    "小精灵" = 24,
    "签到" = 1, //ok
    "逛主会场" = 15, //ok
    "去逛商品" = 100,
    "浏览游戏1" = 19, //ok
    "浏览游戏2" = 17, //ok
    "浏览频道" = 6, //ok
    "浏览会场" = 4, //ok
    "逛金融主会场" = 101,
    "逛品牌庆生" = 11,
    "逛预售会场" = 16, //ok
    "加购商品" = 101, //ok
    "AR游戏" = 34,
    "开通会员" = 7, //test
    "营业版图" = "myShop",
    "逛店铺" = "taskVos", //ok
    "扔炸弹" = "cakeBomb"
}

export enum cakeBakerSubtaskEnum {
    "全部" = "All",
    "签到" = 1,
    "浏览任务1" = 2,
    "浏览任务2" = 3,
    "浏览任务3" = 4,
    "浏览任务4" = 5,
    "抽奖" = 6
}

export enum cakeBakerButtonEnum {
    cakeBakerStart = "自动营业",
    cakeBakerStop = "取消营业"
}

export enum helpFriendEnum {
    "全部" = "All",
    "Smiley" = "Vl4IS9IxFiFRKK03o2z4N00rIdUjYSNNrNbb33xbWRb_MgJ4eQXThFU",
    "莹子" = "eVcnDYMmA_T_sXyfNiPlEL57-66ibK8wr7uotgnPEaR7sw",
    "灰哒哒" = "Vl4ISIdlESABcvxioWaqM92XOHcTMAuojLAG5UwrHWRZ8bl7wN9BWfc",
    "薇" = "DQlgSddjQyZQI6hb5yPlEATO8fAhWE070jmg08tTsQbzMQ",
    "SmileyMOM" = "Vl4ISYBhQCJdJqk8oGyrZCQM4VEGK4nJ7ziq_pIXYy8fWKi_F9cQ3L8",
    "SmileyDAD" = "Vl4IOKA8HVAUaP1o9AjALQfhsv00bDScfCZ0m_0srcdO-MwOy9I",
    "妈1" = "Vl4ISdI0FSJRdKwx8zqgMHmm2blAmnrgTE_UMlqTdZiSCCQgESFDWSs",
    "爸1" = "Vl4IS4Q2RCNQIK9lpD2uZgL7Z0t4DLepXmKPgM_zb8-vj0Za_vOasOk",
    "爸2" = "Vl4IS4NsQXRSdfxioz6qN3Fuzxn9HyaNPO93WKEako4ueByFZKg9iAU",
    "妈2" = "Vl4IS4UzQ3VcIv02oDuqN - JOE8IQ7v_EzpgBAORqwTopd4lX6S4K_8s",
    "小号" = "S14vCaA3MkUSZOhw0TXlLcb9isF7iTW9kzIAn5SiZi3tyd90",
    "琳" = "Vl4ISYQ3Q3cGca1ipzr7ZDjlPgssxKKN2ohpHJXWlpoFjwGpg8kVqiU"
}

export enum helpFriendButtonEnum {
    helpFriendStart = "自动助力",
    helpFriendStop = "取消助力"
}

export enum cakeBakerPkUserEnum {
    "全部" = "All"
    //"Smiley战队" = "XUkkFpUhDG0OdMYwozv_YY5SkhEKcO-qgLkW-fbCIbLmH0um0yWFpM2hn4s70ac",
    //"灰哒哒战队" = "XUkkFpUhDG0OdMYz9m_4YMiCzMD6snpC6NEqMjXfQncQfDIvlvDKAKDVNsAMKeM",
    //"薇战队" = "XUkkFpUhDG1VI64ypmmqZrqs-me-8WhFjsddkJ-H3kFhPgwkISQ61C8",
    //"琳战队" = "XUkkFpUhDG0OdMYy9T2qN59sHjBEWkiH3U1A1QhMQa0AsbX_ugsfyxAnB72AiVA"
}

export enum cakeBakerPkUserButtonEnum {
    cakeBakerPkUserStart = "一键战队",
    cakeBakerPkUserStop = "正在助力"
}

export enum carnivalCityTaskEnum {
    "全部" = "All",
    "今日主推" = "tPlusShop",
    "今日大牌" = "t1ShopList",
    "今日精选" = "featuredShop",
    "热卖单品" ="singleSku",
    "精选会场" = "venue",
    "精选直播" = "live",
    "开通会员" = "brandMembers",
    "探索物种" = "exploreSpecies"
}

export enum carnivalCityButtonEnum {
    carnivalCityStart = "自动时光",
    carnivalCityStop = "取消时光"
}

export enum timeMachineTaskEnum {
    "全部" = "All",
    "逛“超级”品牌店铺" = 1,
    "逛“大牌”品牌店铺" = 2,
    "逛“精选”品牌店铺" = 3,
    "逛同城附近好店" = 4,
    "逛11.11精选会场" = 5,
    "体验AR热爱空间" = 6,
    "浏览会场采集能量包" = 7,
    "邀请好友一起玩" = 8
}

export enum rubiksCubeTaskEnum {
    "全部" = "All",
    "签到" = 1,
    "浏览新品" = "taskSkuInfo",
    "关注浏览" = 6,
    "浏览会场" = 9,
    "抽奖" = "luckyDraw"
}

export enum actRubiksCubeTaskEnum {
    "全部" = "All",
    "浏览商品" = 1002,
    "关注店铺" = 1003,
    "浏览新品会场" = 1004,
    "关注频道任务" = 1001,
    "浏览直播会场" = 1005,
    "浏览大促会场" = 1006,
    "灵活配置" = 1007,
    "抽奖" = "luckyDraw"
}

export enum rubiksCubeButtonEnum {
    rubiksCubeStart = "自动魔方",
    rubiksCubeStop = "取消魔方"
}

export enum arFutureCityTaskEnum {
    "全部" = "All",
    "每日登录" = 1,
    "逛逛家电" = 2,
    "逛逛好店" = 4,
    "加购好物" = 5,
    "红包雨" = "RedRain"
}

export enum arFutureCityButtonEnum {
    arFutureCityStart = "自动城市",
    arFutureCityStop = "取消城市"
}

export enum BmobConfirmEnum {
    "待确认",
    "已确认",
    "已取消"
}