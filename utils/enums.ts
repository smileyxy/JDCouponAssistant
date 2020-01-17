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
    actStop = "取消活动"
}

export enum petTaskEnum {
    "全部" = "All",
    "每日三餐" = "ThreeMeals",
    "每日签到" = "SignEveryDay",
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

export enum actEnum {
    "全部" = "All",
    "逛年货" = "ScanDeskGood"
}