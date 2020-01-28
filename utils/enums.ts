export enum couponType {
    none,
    receiveCoupons = "receiveCoupons",
    newBabelAwardCollection = "newBabelAwardCollection",
    whiteCoupon = "whiteCoupon",
    purchase = "purchase",
    receiveDayCoupon = "receiveDayCoupon",
    secKillCoupon = "secKillCoupon",
    mfreecoupon = "mfreecoupon",
    coinPurchase = "coinPurchase",
    GcConvert = "GcConvert",
}

export enum activityType {
    none,
    monsterNian = "monsterNian",
    brandCitySpring = "brandCitySpring",
    palace = "palace",
    jdjoy = "JDJoy"
}

export enum consoleEnum {
    log = "log",
    info = "info",
    warn = "warn",
    error = "error"
}

export enum feedGramsEnum {
    ten = 10,
    twenty = 20,
    forty = 40,
    eighty = 80
}

export enum feedEnum {
    feedOk = "feed_ok",
    levelUpgrade = "level_upgrade",
    timeError = "time_error",
    foodInsufficient = "food_insufficient"
}

export enum petButtonEnum {
    feedStart = "自动喂养",
    feedStop = "取消喂养",
    taskStart = "自动任务",
    taskStop = "取消任务",
    actStart = "自动活动",
    actStop = "取消活动",
    helpStart = "自动串门",
    helpStop = "取消串门"
}

export enum petTaskEnum {
    "全部" = "All",
    "每日三餐" = "ThreeMeals",
    //"邀请用户" = "InviteUser",
    "浏览频道" = "FollowChannel",
    "关注商品" = "FollowGood",
    "关注店铺" = "FollowShop",
    "逛会场" = "ScanMarket"  
}

export enum petTaskReceiveStatusEnum {
    unReceive = "unreceive",
    chanceLeft = "chance_left",
    chanceFull = "chance_full"
}

export enum petTaskErrorCodeEnum {
    success = "success",
    received = "received",
    followSuccess = "follow_success",
    followRepeat = "follow_repeat",
    followFail = "follow_fail"
}

export enum petActEnum {
    "全部" = "All",
    "逛年货" = "ScanDeskGood"
}

export enum petHelpEnum {
    "全部" = "All",
    "帮助喂养" = "HelpFeed",
    "偷取狗粮" = "StealFood",
    "获取金币" = "GainGold"
}

export enum petFriendsStatusEnum {
    helpok = "help_ok",
    notfeed = "not_feed",
    timeerror = "time_error",
    stealok = "steal_ok",
    stealexist = "steal_exist",
    cointookok = "coin_took_ok",
    chanceFull = "chance_full"
}