export enum activityType {
    none,
    monsterNian = "monsterNian",
    brandCitySpring = "brandCitySpring",
    palace = "palace",
    receiveBless = "ReceiveBless",
    cakeBaker = "cakeBaker",
    carnivalCity = "carnivalCity",
    rubiksCube = "rubiksCube"
}

export enum cakeBakerTaskEnum {
    "全部" = "All",
    "叠蛋糕" = "foldCake",
    "小精灵" = 35,
    "签到" = 1,
    "逛主会场" = 3,
    "去逛商品" = 100,
    "浏览游戏1" = 18,
    "浏览游戏2" = 29,
    "浏览频道" = 19,
    "浏览会场" = 4,
    "逛金融主会场" = 26,
    "逛品牌庆生" = 11,
    "逛校园会场" = 25,
    "加购商品" = 101,
    "AR吃蛋糕" = 34,
    "逛店铺" = "taskVos"
    //"浏览商品" = "viewProductVos"
}

export enum cakeBakerButtonEnum {
    cakeBakerStart = "自动蛋糕",
    cakeBakerStop = "取消蛋糕"
}

export enum carnivalCityTaskEnum {
    "全部" = "All",
    "今日主推" = "tPlusShop",
    "今日大牌" = "t1ShopList",
    "今日精选" = "featuredShop",
    "热卖单品" ="singleSku",
    "精选会场" = "venue",
    "开通会员" = "brandMembers",
    "探索物种" = "exploreSpecies"
}

export enum carnivalCityButtonEnum {
    carnivalCityStart = "自动狂欢",
    carnivalCityStop = "取消狂欢"
}

export enum rubiksCubeTaskEnum {
    "全部" = "All",
    "浏览新品" = "taskSkuInfo",
    "关注浏览" = 6,
    "浏览会场" = 9,
    "抽奖" = "luckyDraw"
}

export enum rubiksCubeButtonEnum {
    rubiksCubeStart = "自动魔方",
    rubiksCubeStop = "取消魔方"
}