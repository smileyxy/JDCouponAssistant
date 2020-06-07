export enum gameType {
    none,
    cloudpig = "cloudpig",
    moneytree = "moneytree",
    jdjoy = "jdjoy"
}
//宠汪汪
export enum feedGramsEnum {
    smartFeed = "智能",
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
    autoBeanStart = "自动换豆",
    autoBeanStop = "取消换豆",
    feedStart = "自动喂养",
    feedStop = "取消喂养",
    taskStart = "自动任务",
    taskStop = "取消任务",
    actStart = "自动活动",
    actStop = "取消活动",
    helpStart = "自动串门",
    helpStop = "取消串门",
    combatStart = "自动组队",
    combatStop = "取消组队"
}

export enum petTaskEnum {
    "全部" = "All",
    "每日三餐" = "ThreeMeals",
    "邀请用户" = "InviteUser",
    "浏览频道" = "FollowChannel",
    "关注商品" = "FollowGood",
    "关注店铺" = "FollowShop",
    "逛会场" = "ScanMarket",
    "看激励视频" = "ViewVideo"
}

export enum petTaskReceiveStatusEnum {
    unReceive = "unreceive",
    chanceLeft = "chance_left",
    chanceFull = "chance_full",
    canHelp = "can_help",
    cannotHelp = "cannot_help",
    cardExpire = "card_expire"
}

export enum petTaskErrorCodeEnum {
    success = "success",
    received = "received",
    followSuccess = "follow_success",
    followRepeat = "follow_repeat",
    followFail = "follow_fail",
    followFull = "follow_full",
    helpFull = "help_full"
}

export enum petActEnum {
    "全部" = "All",
    "逛店拿积分" = "ScanDeskGood",
    "戳泡泡" = "Paopao"
    //"聚宝盆终极大奖" = "TreasureBox"
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

export enum petHelpConfirmEnum {
    "待确认",
    "已确认",
    "已取消"
}

export enum petCombatEnum {
    participate = "PARTICIPATE",
    notParticipate = "NOT_PARTICIPATE"
}

export enum petCombatV2ResultEnum {
    matching = "matching",
    participate = "participate",
    notParticipate = "not_participate",
    unBegin = "unbegin",
    timeOver = "time_over",
    raceLose = "race_lose",
    raceWin = "race_win",
    unreceive = "unreceive"
}

export enum petCombatV2TypeEnum {
    "双人PK赛" = 2,
    "10人突围赛" = 10,
    "50人挑战赛" = 50
}

export enum petCombatV2HelpConfirmEnum {
    "待确认",
    "已确认",
    "已取消"
}