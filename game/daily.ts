import Game from "../interface/Game";
import Utils, { _$ } from "../utils/utils";
import Config from "../config/config";
import { CookieType, CookieHandler } from "../cookie/CookieHandler";
import CookieManager from "../cookie/CookieManager";

let cakeBakerTiming = "";
let cakeBakerTimeoutArray: any[] = [];
let cakeBakerMultiTimeoutArray: any[] = [];
let taskTimeout = 0;
const defaultCakeBakerTiming: string = '01:00',
    defaultCakeBakerDetection: number = 3600000; //1小时

export default class Daily implements Game {
    baseReqData: string = "https://api.m.jd.com/client.action?functionId=";
    rootURI: string = "https://api.m.jd.com/client.action?functionId=";
    params: any;
    data: any;
    container: HTMLDivElement;
    outputTextarea: HTMLTextAreaElement;
    content: HTMLDivElement;
    constructor(params: any, containerDiv: HTMLDivElement, outputTextarea: HTMLTextAreaElement) {
        this.params = params;
        this.container = containerDiv;
        this.outputTextarea = outputTextarea;
        this.content = document.createElement("div");

        document.body.style.fontSize = "18px";
        document.body.style.fontFamily = "auto";

        Config.debug = true;
    }

    get(): void {
        this.page();
        this.list();
    }

    page(): void {
        //使用帮助
        let helpInfoDetail = '';
        let btnInfoDetail = '';

        helpInfoDetail = `<details>
                                      <summary style="outline: 0;">自动种树</summary>
                                      <p style="font-size: 12px;">根据所填项每天完成种摇钱树任务；任务定时：默认${defaultCakeBakerTiming}之后；检测频率：默认${defaultCakeBakerDetection / 3600000}小时。</p>
                                  </details>`;
        btnInfoDetail = `<tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="cakeBakerType" style="width: 23.5vw;">
                                                <option value="全部" selected="selected">全部</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left">
                                        <input id="cakeBakerTiming" type="time" value="${defaultCakeBakerTiming}" style="width:23.5vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;">
                                        <input id="cakeBakerDetection" style="width:12.8vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;" placeholder = "检测频率">
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="cakeBakerAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动营业</button>
                                    </td>
                                </tr>`;

        const helpContent = document.createElement("div");
        helpContent.id = 'usingHelp';
        let helpInfo = `
                        <div style="border-top: 1px solid #000;font-weight:bold;line-height: 1.6;">
                            <div>
                                <h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>使用帮助</h3>
                            </div>
                            <div style="display: inline-block;font-size: 14px;color: #FF69B4;margin: auto 10px 10px 10px;">
                                ${helpInfoDetail}
                            </div>
                        </div>`;
        helpContent.innerHTML = helpInfo;
        this.content.appendChild(helpContent);
        //功能按键
        const btnContent = document.createElement("div");
        btnContent.id = 'functionButton';
        let btnInfo = `
                        <div style="border-top: 1px solid #000;font-weight:bold;line-height: 1.6;">
                            <div>
                                <h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>功能按键</h3>
                            </div>
                            <table style="font-size: 12px;padding-left: 4px;margin-bottom: 10px;">
                                ${btnInfoDetail}
                            </table>
                        </div>`;
        btnContent.innerHTML = btnInfo;
        this.content.appendChild(btnContent);
        this.container.appendChild(this.content);
    }

    openBoxFlag: boolean = false;
    foodskuId: string = "1001003004";
    harvestSpan: number = 1800000;
    autoToWithdrawTimer: number = 0;
    signNo: number = 1;
    favoriteFood: string = "";
    list(): void {
        let msg = `
            <div>
                <button class="login" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;">查看详情</button>
                <button class="harvest" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;">一键收金果</button>
            </div>
        <p>自动收蛋间隔：<select class="harvestSpan" name="harvestSpan" style="border: 1px solid #333;padding: 2px;">
            <option value ="1800000">30分钟</option>
            <option value ="3600000">60分钟</option>
            <option value ="5400000">90分钟</option>
        </select>
        </p>
        <button class="autoToWithdraw" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">自动定时收蛋</button>
        <button class="cancelautoToWithdraw" style="display:none;width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;">取消定时收蛋</button>
        <button class="toGoldExchange" style="display:display;width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;">兑换金币</button>
        <div>`;
        this.content.innerHTML = msg;
        this.container.appendChild(this.content);
        const d = _$(".login"),
            g = _$(".toGoldExchange"),
            autoToWithdraw = _$(".autoToWithdraw"),
            cancelautoToWithdraw = _$(".cancelautoToWithdraw"),
            t = _$(".harvest");

        t!.addEventListener('click', async () => {
            Utils.outPutLog(this.outputTextarea, `开始收取金果`);
            if (Config.multiFlag) {
                this.harvestMulti();
            } else {
                this.harvest();
            }
        });

        d!.addEventListener('click', async () => {
            Utils.outPutLog(this.outputTextarea, `开始查看金果树详情`);
            if (Config.multiFlag) {
                this.homeMulti();
            } else {
                this.home();
            }
        });

        g!.addEventListener('click', async () => {
            Utils.outPutLog(this.outputTextarea, `开始兑换金币`);
            if (Config.multiFlag) {
                this.toGoldExchangeMulti();
            } else {
                this.toGoldExchange();
            }
        });

        autoToWithdraw.addEventListener("click", () => {
            autoToWithdraw.style.display = "none";
            cancelautoToWithdraw.style.display = "block";
            Utils.outPutLog(this.outputTextarea, `自动定时收蛋已开启！`);
            this.autoToWithdrawTimer = window.setInterval(() => {
                Utils.outPutLog(this.outputTextarea, `自动定时收蛋任务开启！`);
                t.click();
            }, this.harvestSpan)
        })

        cancelautoToWithdraw.addEventListener('click', () => {
            autoToWithdraw.style.display = "block";
            cancelautoToWithdraw.style.display = "none";
            Utils.outPutLog(this.outputTextarea, `自动定时收蛋已关闭！`);
            window.clearInterval(this.autoToWithdrawTimer);
        })
    }

    harvest(ckObj?: CookieType) {
        fetch(this.rootURI + "harvest", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "reqData=" + JSON.stringify(this.baseReqData)
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            if (res.resultCode == 0) {
                let data = res.resultData;
                if (data.code == "0000") {
                    let eggTotal = data.data.eggTotal;
                    if (Config.multiFlag && ckObj) {
                        Utils.outPutLog(this.outputTextarea, `【${ckObj["mark"]}】 收蛋成功！当前鹅蛋数量：${eggTotal}`);
                    } else {
                        Utils.outPutLog(this.outputTextarea, `收蛋成功！当前鹅蛋数量：${eggTotal}`);
                    }

                } else {
                    Utils.outPutLog(this.outputTextarea, `${data.msg}`);
                }
            } else {
                Utils.outPutLog(this.outputTextarea, `${res.resultMsg}`);
            }
        })
    }

    harvestMulti() {
        CookieManager.cookieArr.map((item: CookieType) => {
            setTimeout(() => {
                CookieHandler.coverCookie(item);
                this.harvest(item);
            }, item.index * 750)
        });
    }

    home(ckObj?: CookieType) {
        fetch(this.rootURI + "login", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "reqData=" + JSON.stringify(this.baseReqData)
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            if (res.resultCode == 0) {
                let data = res.resultData.data;
                let { sharePin, treeInfo, firstLogin } = data;
                if (firstLogin) {
                    //首次登录
                } else {
                    if (Config.multiFlag && ckObj) {
                        Utils.outPutLog(this.outputTextarea, `【${ckObj["mark"]}】 等级：${treeInfo.level} 升级还差：${treeInfo.progressLeft}% 可兑换：${treeInfo.fruit} 未收取：${treeInfo.fruitOnTree}`);
                    } else {

                        Utils.outPutLog(this.outputTextarea, ` 等级：${treeInfo.level} 升级还差：${treeInfo.progressLeft}% 可兑换：${treeInfo.fruit} 未收取：${treeInfo.fruitOnTree}`);
                    }
                }

            } else {
                Utils.outPutLog(this.outputTextarea, `${res.resultMsg}`);
            }
        })
    }

    homeMulti() {
        CookieManager.cookieArr.map((item: CookieType) => {
            setTimeout(() => {
                CookieHandler.coverCookie(item);
                this.home(item);
            }, item.index * 500)
        });
    }

    toGoldExchange(ckObj?: CookieType) {
        fetch(this.rootURI + "toGoldExchange", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "reqData=" + JSON.stringify(this.baseReqData)
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            if (res.resultCode == 0) {
                if (res.resultData.code == "0000") {
                    let data = res.resultData.data;
                    let { cnumber, rate, goldTotal } = data;
                    if (Config.multiFlag && ckObj) {
                        Utils.outPutLog(this.outputTextarea, `【${ckObj["mark"]}】 已兑换:${cnumber} 比例：${rate} 总金币：${goldTotal}`);
                    } else {
                        Utils.outPutLog(this.outputTextarea, `已兑换:${cnumber} 比例：${rate} 总金币：${goldTotal}`);
                    }
                } else {
                    Utils.outPutLog(this.outputTextarea, `${res.resultData.msg}`);
                }
            } else {
                if (Config.multiFlag && ckObj) {
                    Utils.outPutLog(this.outputTextarea, `${res.resultMsg}`);
                }
            }
        })
    }

    toGoldExchangeMulti() {
        CookieManager.cookieArr.map((item: CookieType) => {
            setTimeout(() => {
                CookieHandler.coverCookie(item);
                this.toGoldExchange(item);
            }, item.index * 500)
        });
    }

    lotteryIndex(ckObj?: CookieType) {
        fetch(this.rootURI + "pigPetLotteryIndex", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "reqData=" + JSON.stringify(this.baseReqData)
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            if (res.resultCode == 0) {
                let data = res.resultData.resultData;
                if (res.resultData.resultCode == 0) {
                    let currentCount = data?.currentCount,
                        coinCount = data?.coinCount,
                        price = data?.price,
                        nextFreeTime = data?.nextFreeTime;
                    if (Config.multiFlag && ckObj) {
                        Utils.outPutLog(this.outputTextarea, `【${ckObj["mark"]}】 当前可抽奖次数：${currentCount} 距下一次免费抽奖时间：${nextFreeTime}毫秒 金币抽奖次数：${coinCount} 需花费金币：${price}`);
                    } else {
                        Utils.outPutLog(this.outputTextarea, `当前可抽奖次数：${currentCount} 距下一次免费抽奖时间：${nextFreeTime}毫秒 金币抽奖次数：${coinCount} 需花费金币：${price}`);
                    }
                } else {
                    Utils.outPutLog(this.outputTextarea, `${res.resultData.resultMsg}`);
                }
            } else {
                if (Config.multiFlag && ckObj) {
                    Utils.outPutLog(this.outputTextarea, `${res.resultMsg}`);
                }
            }
        })
    }

    lotteryIndexMulti() {
        CookieManager.cookieArr.map((item: CookieType) => {
            setTimeout(() => {
                CookieHandler.coverCookie(item);
                this.lotteryIndex(item);
            }, item.index * 500)
        });
    }

    signOne(ckObj?: CookieType) {
        fetch(this.rootURI + "pigPetSignOne?_=" + Utils.getTimestamp(), {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "reqData=" + JSON.stringify(Object.assign(this.baseReqData, { "no": ckObj ? ckObj.signNo : this.signNo }))
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            if (res.resultCode == 0) {
                let data = res.resultData.resultData;
                if (res.resultData.resultCode == 0) {
                    let today = data?.today,
                        name = data?.award?.name;
                    if (Config.multiFlag && ckObj) {
                        Utils.outPutLog(this.outputTextarea, `【${ckObj["mark"]}】 已签到${today}天 获得奖励：${name}`);
                    } else {
                        Utils.outPutLog(this.outputTextarea, `已签到${today}天 获得奖励：${name}`);
                    }
                } else {
                    Utils.outPutLog(this.outputTextarea, `${res.resultData.resultMsg}`);
                }
            } else {
                if (Config.multiFlag && ckObj) {
                    Utils.outPutLog(this.outputTextarea, `${res.resultMsg}`);
                }
            }
        })
    }

    // signOneMulti() {
    //     CookieManager.cookieArr.map((item: CookieType) => {
    //         setTimeout(() => {
    //             CookieHandler.coverCookie(item);
    //             this.signOne(item);
    //         }, item.index * 500)
    //     });
    // }

    signIndex(ckObj?: CookieType) {
        fetch(this.rootURI + "pigPetSignIndex?_=" + Utils.getTimestamp(), {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "reqData=" + JSON.stringify(this.baseReqData)
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            if (res.resultCode == 0) {
                let data = res.resultData.resultData;
                if (res.resultData.resultCode == 0) {
                    let today = data?.today;
                    if (Config.multiFlag && ckObj) {
                        ckObj.signNo = today;
                        Utils.outPutLog(this.outputTextarea, `【${ckObj["mark"]}】 已签到${today}天 `);
                        this.signOne(ckObj);
                    } else {
                        this.signNo = today;
                        Utils.outPutLog(this.outputTextarea, `已签到${today}天`);
                        this.signOne()
                    }
                } else {
                    Utils.outPutLog(this.outputTextarea, `${res.resultData.resultMsg}`);
                }
            } else {
                if (Config.multiFlag && ckObj) {
                    Utils.outPutLog(this.outputTextarea, `${res.resultMsg}`);
                }
            }
        })
    }

    signIndexMulti() {
        CookieManager.cookieArr.map((item: CookieType) => {
            setTimeout(() => {
                CookieHandler.coverCookie(item);
                this.signIndex(item);
            }, item.index * 500)
        });

    }

    userBag(ckObj?: CookieType) {
        fetch(this.rootURI + "pigPetUserBag?_=" + Utils.getTimestamp(), {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "reqData=" + JSON.stringify(Object.assign(this.baseReqData, { "category": "1001" }))
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            if (res.resultCode == 0) {
                let data = res.resultData.resultData;
                if (res.resultData.resultCode == 0) {
                    let goods = data?.goods, goodStr = "";
                    if (Config.multiFlag && ckObj) {
                        goodStr += goods.map((good: any) => {
                            return `\n名称:${good.goodsName} 数量：${good.count}g`;
                        })
                        Utils.outPutLog(this.outputTextarea, `【${ckObj["mark"]}】 ----食物背包一览----${goodStr}`);
                    } else {
                        goodStr += goods.map((good: any) => {
                            return `\n名称:${good.goodsName} 数量：${good.count}g`;
                        })
                        Utils.outPutLog(this.outputTextarea, `----食物背包一览----${goodStr}`);
                    }
                } else {
                    Utils.outPutLog(this.outputTextarea, `${res.resultData.resultMsg}`);
                }
            } else {
                if (Config.multiFlag && ckObj) {
                    Utils.outPutLog(this.outputTextarea, `${res.resultMsg}`);
                }
            }
        })
    }

    userBagMulti() {
        CookieManager.cookieArr.map((item: CookieType) => {
            setTimeout(() => {
                CookieHandler.coverCookie(item);
                this.userBag(item);
            }, item.index * 500)
        });
    }

}