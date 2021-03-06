import fj from "../utils/fetch-jsonp";
import Game from "../interface/Game";
import Utils, { _$ } from "../utils/utils";
import Config from "../config/config";
import { consoleEnum } from '../enum/commonType';
import {
    feedGramsEnum,
    feedEnum,
    petButtonEnum,
    petTaskEnum,
    petTaskReceiveStatusEnum,
    petTaskErrorCodeEnum,
    petActEnum,
    petHelpEnum,
    petFriendsStatusEnum,
    petHelpConfirmEnum,
    petCombatEnum,
    petCombatV2ResultEnum,
    petCombatV2TypeEnum,
    petCombatV2HelpConfirmEnum
} from '../enum/gameType';

let petPin = "",
    beanInterval = 0,
    feedSpan = 0,
    feedInterval = 0,
    lastFeedStamp = 0,
    nextFeedStamp = 0,
    nextFeedInterval = 0,
    taskTiming = 0,
    taskSpan = 0,
    taskInterval = 0,
    combatTiming = "",
    combatSpan = 0,
    combatInterval = 0,
    actSpan = 0,
    actInterval = 0,
    helpSpan = 0,
    helpInterval = 0,
    investTreasureInterval = 0,
    allFriends: any[] = [],
    helpConfirmStatus = petHelpConfirmEnum.待确认,
    combatHelpConfirmStatus = petCombatV2HelpConfirmEnum.待确认;
let taskTimeoutArray: any[] = [],
    actTimeoutArray: any[] = [],
    helpTimeoutArray: any[] = [];
const defaultBeanDetection: number = 3600000, //1小时
    defaultFeedSpan: number = 10800000, //3小时
    defaultTaskTiming: string = '06:00',
    defaultTaskDetection: number = 3600000, //1小时
    defaultActDetection: number = 3600000, //1小时
    defaultHelpDetection: number = 14400000, //4小时
    defaultCombatTiming: string = '19:00',
    defaultCombatDetection: number = 3600000; //1小时
const keyCode = "98c14c997fde50cc18bdefecfd48ceb7",
    utf8KeyCode = Utils.utf8Parse(keyCode),
    utf8IV = Utils.utf8Parse("ea653f4f3c5eda12");

export default class JdJoy implements Game {
    petUrl: string = "https://jdjoy.jd.com/common";
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
        //this.outputTextarea.value = `【哎呀~助手初始化错误，请刷新后重新尝试或联系作者！】`;

        Config.debug = true;
    }

    get(): void {
        //this.vaild().then(async (valid) => {
        //    if (valid) {
        //        this.page();
        //        this.list();
        //        await this.info();
        //    }
        //});
        this.page();
        this.list();
        this.info();
    }

    vaild(): Promise<boolean> {
        //验证用户登录状态及宠物领养状态
        let isValid = false;
        const userBasicInfoUrl = `${this.petUrl}/pet/getUserBasicInfo`;
        return fetch(userBasicInfoUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((userBasicInfoJson) => {
                if (userBasicInfoJson.success) {
                    if (userBasicInfoJson.data.petExist) {
                        isValid = !isValid;
                        this.outputTextarea.value = "";
                    }
                    else {
                        Utils.debugInfo(consoleEnum.log, userBasicInfoJson);
                        this.outputTextarea.value = `【你还没有领养过狗子，请领养后再来！】`;
                    }
                }
                else {
                    Utils.debugInfo(consoleEnum.log, userBasicInfoJson);
                    this.outputTextarea.value = `【请确认你已在此浏览器上成功登录京东手机端！】`;
                }

                return isValid;
            }).catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                this.outputTextarea.value = `【哎呀~用户信息异常，请刷新后重新尝试或联系作者！】`;

                return isValid;
            });
    }

    page(): void {
        //宠物信息
        const petContent = document.createElement("div");
        petContent.id = 'petInfo';
        let petInfo = `
                        <div style="border-top: 1px solid #000;font-weight: bold;line-height: 2;">
                            <div><h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>汪汪信息</h3></div>
                            <table style="font-size: 12px;padding-left: 18%;border-collapse: separate;border-spacing: 2px;">
                                <tr> 
                                    <td style="width: 150vw;text-align: -webkit-left;">宠物等级：<span id="petLevel" style="color: #FF69B4;">-</span></td>
                                    <td style="width: 150vw;text-align: -webkit-left;">当前积分：<span id="petCoin" style="color: #FF69B4;">-</div></td> 
                                </tr>
                                <tr> 
                                    <td style="width: 150vw;text-align: -webkit-left;">剩余狗粮：<span id="petFood" style="color: #FF69B4;">-</span></td>
                                    <td style="width: 150vw;text-align: -webkit-left;">好友数量：<span id="friendCount" style="color: #FF69B4;">-</span></td> 
                                </tr>
                                <tr> 
                                    <td style="width: 150vw;text-align: -webkit-left;">当前等级已喂养：<span id="feedTotal" style="color: #FF69B4;">-</span></td>
                                    <td style="width: 150vw;text-align: -webkit-left;">今日喂养：<span id="feedCount" style="color: #FF69B4;">-</span></td> 
                                </tr>
                            </table>
                            <div style="width: 70vw;text-align: -webkit-left;font-size: 12px;padding-left: 18%;margin-left: 1.5px;">
                                最后喂养时间：<span id="lastFeedTime" style="color: #FF69B4;">-</span>
                            </div>
                            <div style="width: 70vw;text-align: -webkit-left;font-size: 12px;padding-left: 18%;margin-left: 1.5px;">
                                下次喂养时间：<span id="nextFeedTime" style="color: #FF69B4;">-</span>
                            </div>
                            <div style="margin: 10px auto 10px auto;display: flex;">
                                <button class="refresh" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 14px;line-height: 0;">手动刷新</button>
                                <button class="autoBean" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 14px;line-height: 0;">自动换豆</button>
                            </div>
                            <div style="margin: 10px auto 10px auto;display: flex;">
                                <button class="favCommDel" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 14px;line-height: 0;">取消关注商品</button>
                                <button class="favShopDel" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 14px;line-height: 0;">取消关注店铺</button>
                            </div>
                        </div>`;
        petContent.innerHTML = petInfo;
        petContent.style.display = 'none';
        this.content.appendChild(petContent);
        //使用帮助
        const helpContent = document.createElement("div");
        helpContent.id = 'usingHelp';
        let helpInfo = `
                        <div style="border-top: 1px solid #000;font-weight:bold;line-height: 1.6;">
                            <div>
                                <h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>使用帮助</h3>
                            </div>
                            <div style="display: inline-block;font-size: 14px;color: #FF69B4;margin: auto 10px 10px 10px;">
                                <details>
                                    <summary style="outline: 0;">自动换豆</summary>
                                    <p style="font-size: 12px;">积分足够且有库存时，自动换取所在等级区的京豆；检测频率：默认${defaultBeanDetection / 3600000}小时，整点触发。</p>
                                </details>
                                <details>
                                    <summary style="outline: 0;">自动喂养</summary>
                                    <p style="font-size: 12px;">根据所填项每天进行喂食，智能喂养会自动计算合适的克数，一定程度上避免口粮不足；喂养间隔：默认${defaultFeedSpan / 3600000}小时，正在进食时自动计算时间差。</p>
                                </details>
                                <details>
                                    <summary style="outline: 0;">自动活动</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成活动；检测频率：默认${defaultActDetection / 3600000}小时，整点触发。</p>
                                </details>
                                <details>
                                    <summary style="outline: 0;">自动串门</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成串门（帮助喂养、偷取狗粮、获取金币）；检测频率：默认${defaultHelpDetection / 3600000}小时。</p>
                                </details>
                                <details>
                                    <summary style="outline: 0;">自动任务</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成任务（除每日签到）；任务定时：默认${defaultTaskTiming}之后；检测频率：默认${defaultTaskDetection / 3600000}小时。</p>
                                </details>
                                <details>
                                    <summary style="outline: 0;">自动组队</summary>
                                    <p style="font-size: 12px;">随机好友：从你的汪汪好友中匹配优势战队自动加入（好友必须为队长）；指定好友：从下拉框中选择加入指定好友战队（好友必须已有战队）；任务定时：默认${defaultCombatTiming}整；检测频率：默认${defaultCombatDetection / 3600000}小时。</p>
                                </details> 
                            </div>
                        </div>`;
        helpContent.innerHTML = helpInfo;
        helpContent.style.display = 'none';
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
                                <tr> 
                                    <td style="width: 80vw;text-align: -webkit-right;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="feedGrams" style="width: 23.5vw;">
                                                <option value="${feedGramsEnum.smartFeed}" selected="selected">${feedGramsEnum.smartFeed}</option>
                                                <option value="${feedGramsEnum.ten}">${feedGramsEnum.ten}g</option>
                                                <option value="${feedGramsEnum.twenty}">${feedGramsEnum.twenty}g</option>
                                                <option value="${feedGramsEnum.forty}">${feedGramsEnum.forty}g</option>
                                                <option value="${feedGramsEnum.eighty}">${feedGramsEnum.eighty}g</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;">
                                        <input id="feedSpan" style="width:37vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: block;" placeholder = "喂养间隔" />
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="feedAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动喂养</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 80vw;text-align: -webkit-right;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="actType" style="width: 23.5vw;">
                                                <option value="${petActEnum.全部}" selected="selected">全部</option>
                                                <option value="${petActEnum.逛店拿积分}">逛店拿积分</option>
                                                <option value="${petActEnum.戳泡泡}">戳泡泡</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;">
                                        <input id="actDetection" style="width:37vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: block;" placeholder = "检测频率" />
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="actAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动活动</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 80vw;text-align: -webkit-right;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="helpType" style="width: 23.5vw;">
                                                <option value="${petHelpEnum.全部}" selected="selected">全部</option>
                                                <option value="${petHelpEnum.帮助喂养}">帮助喂养</option>
                                                <option value="${petHelpEnum.偷取狗粮}">偷取狗粮</option>
                                                <option value="${petHelpEnum.获取金币}">偷取金币</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;">
                                        <input id="helpDetection" style="width:37vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: block;" placeholder = "检测频率" />
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="helpAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动串门</button>
                                    </td>
                                </tr>
                                <tr> 
                                    <td style="width: 80vw;text-align: -webkit-right;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="taskType" style="width: 23.5vw;">
                                                <option value="${petTaskEnum.全部}" selected="selected">全部</option>
                                                <option value="${petTaskEnum.每日三餐}">每日三餐</option>
                                                <option value="${petTaskEnum.浏览频道}">浏览频道</option>
                                                <option value="${petTaskEnum.关注商品}">关注商品</option>
                                                <option value="${petTaskEnum.关注店铺}">关注店铺</option>
                                                <option value="${petTaskEnum.逛会场}">逛会场</option>
                                                <option value="${petTaskEnum.看激励视频}">看激励视频</option>
                                                <option value="${petTaskEnum.邀请用户}">邀请用户</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;display: inline">
                                        <input id="taskTiming" type="time" value="${defaultTaskTiming}" style="width:23.5vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;">
                                        <input id="taskDetection" style="width:12.8vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;" placeholder = "检测频率">
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="taskAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动任务</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 80vw;text-align: -webkit-right;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="combatType" style="width: 23.5vw;">
                                                <option value="${petCombatV2TypeEnum.双人PK赛}" selected="selected">双人PK赛</option>
                                                <option value="${petCombatV2TypeEnum["10人突围赛"]}">10人突围赛</option>
                                                <option value="${petCombatV2TypeEnum["50人挑战赛"]}">50人挑战赛</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;display: inline">
                                        <input id="combatTiming" type="time" value="${defaultCombatTiming}" style="width:23.5vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;">
                                        <input id="combatDetection" style="width:12.8vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;" placeholder = "检测频率">
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="combatAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动组队</button>
                                    </td>
                                </tr>
                            </table>
                        </div>`;
        btnContent.innerHTML = btnInfo;
        btnContent.style.display = 'none';
        this.content.appendChild(btnContent);
        this.container.appendChild(this.content);
    }

    list(): void {
        //取消商品关注
        const favCommDel = _$('.favCommDel');
        favCommDel!.addEventListener('click', async () => {
            (favCommDel as HTMLButtonElement).disabled = true;
            favCommDel.style.backgroundColor = "darkgray";

            const limit = 10;
            const pageSize = 500;
            let commIdArray: any[] = [];
            new Promise(async (resolve, reject) => {
                const favCommQueryFilterUrl = `https://wq.jd.com/fav/comm/FavCommQueryFilter?cp=1&pageSize=${pageSize}&_=${await (await this.getJDTime()).toString()}&sceneval=2&g_login_type=1&g_ty=ls`;
                await fj.fetchJsonp(favCommQueryFilterUrl, { timeout: 10000, jsonpCallbackFunction: "jsonpCBKPP" })
                    .then(function (response) {
                        return response.json();
                    })
                    .then((res) => {
                        if (!res.errMsg || res.errMsg == "success") {
                            commIdArray = res.data.map((item: any) => { return item.commId; });
                        }
                        else {
                            Utils.outPutLog(this.outputTextarea, `【查询关注商品失败，请刷新后重新尝试或联系作者！】`, false);
                        }
                    }).catch((error) => {
                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                        Utils.outPutLog(this.outputTextarea, `【哎呀~查询关注商品异常，请刷新后重新尝试或联系作者！】`, false);
                    });

                let forCount = commIdArray.length / limit;
                for (let i = 0; i < forCount; i++) {
                    let commIds = commIdArray.slice(i * limit, i * limit + limit + 1).join();
                    const favCommBatchDelUrl = `https://wq.jd.com/fav/comm/FavCommBatchDel?commId=${commIds}&sceneval=2&g_login_type=1&g_ty=ls`;
                    await fj.fetchJsonp(favCommBatchDelUrl, { timeout: 10000, jsonpCallbackFunction: "jsonpCBKT" })
                        .then(function (response) {
                            return response.json();
                        })
                        .then((res) => {
                            //if (!!res.errMsg && res.errMsg != "success") {
                            //    Utils.outPutLog(this.outputTextarea, `【取消关注商品失败，请刷新后重新尝试或联系作者！】`, false);
                            //}
                        }).catch((error) => {
                            //Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            //Utils.outPutLog(this.outputTextarea, `【哎呀~取消关注商品异常，请刷新后重新尝试或联系作者！】`, false);
                        });
                }

                (favCommDel as HTMLButtonElement).disabled = false;
                favCommDel.style.backgroundColor = "#2196F3";
                Utils.outPutLog(this.outputTextarea, `已完成取消关注商品（每次最多取消${pageSize}个）！`, false);
                resolve(true);
            });
        });
        //取消店铺关注
        const favShopDel = _$('.favShopDel');
        favShopDel!.addEventListener('click', async () => {
            (favShopDel as HTMLButtonElement).disabled = true;
            favShopDel.style.backgroundColor = "darkgray";

            const limit = 10;
            const pageSize = 1000;
            let shopIdArray: any[] = [];
            new Promise(async (resolve, reject) => {
                const queryShopFavListUrl = `https://wq.jd.com/fav/shop/QueryShopFavList?cp=1&pageSize=${pageSize}&lastlogintime=0&_=${await (await this.getJDTime()).toString()}&sceneval=2&g_login_type=1&g_ty=ls`;
                await fj.fetchJsonp(queryShopFavListUrl, { timeout: 10000, jsonpCallbackFunction: "jsonpCBKA" })
                    .then(function (response) {
                        return response.json();
                    })
                    .then((res) => {
                        if (!res.errMsg || res.errMsg == "success") {
                            shopIdArray = res.data.map((item: any) => { return item.shopId; });
                        }
                        else {
                            Utils.outPutLog(this.outputTextarea, `【查询关注店铺失败，请刷新后重新尝试或联系作者！】`, false);
                        }
                    }).catch((error) => {
                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                        Utils.outPutLog(this.outputTextarea, `【哎呀~查询关注店铺异常，请刷新后重新尝试或联系作者！】`, false);
                    });

                let forCount = shopIdArray.length / limit;
                for (let i = 0; i < forCount; i++) {
                    let shopIds = shopIdArray.slice(i * limit, i * limit + limit + 1).join();
                    const batchunFollowUrl = `https://wq.jd.com/fav/shop/batchunfollow?shopId=${shopIds}&_=${await (await this.getJDTime()).toString()}&sceneval=2&g_login_type=1&g_ty=ls`;
                    await fj.fetchJsonp(batchunFollowUrl, { timeout: 10000, jsonpCallbackFunction: "jsonpCBKJ" })
                        .then(function (response) {
                            return response.json();
                        })
                        .then((res) => {
                            //if (!!res.errMsg && res.errMsg != "success") {
                            //    Utils.outPutLog(this.outputTextarea, `【取消关注店铺失败，请刷新后重新尝试或联系作者！】`, false);
                            //}
                        }).catch((error) => {
                            //Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            //Utils.outPutLog(this.outputTextarea, `【哎呀~取消关注店铺异常，请刷新后重新尝试或联系作者！】`, false);
                        });
                }

                (favShopDel as HTMLButtonElement).disabled = false;
                favShopDel.style.backgroundColor = "#2196F3";
                Utils.outPutLog(this.outputTextarea, `已完成取消关注店铺（每次最多取消1000个）！`, false);
                resolve(true);
            });
        });
        //手动刷新
        const refresh = _$('.refresh');
        refresh!.addEventListener('click', () => {
            this.info();
        });
        //自动换豆
        const autoBean = _$('.autoBean');
        autoBean!.addEventListener('click', () => {
            this.getJDTime().then(async(currentJDTime) => {
                let autoBeanTimeout = 0;
                let currentJDDate = new Date(+currentJDTime);
                if (autoBean.innerHTML == petButtonEnum.autoBeanStart) {
                    autoBean.innerHTML = petButtonEnum.autoBeanStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动换豆！`, false);

                    let firstSpan = defaultBeanDetection - currentJDDate.getMinutes() * 60000;
                    autoBeanTimeout = setTimeout(async () => {
                        this.exchange(new Date(+await this.getJDTime()), +await this.getJDTime());
                        beanInterval = setInterval(async () => {
                            this.exchange(new Date(+await this.getJDTime()), +await this.getJDTime());
                        }, defaultBeanDetection);
                    }, firstSpan);
                }
                else {
                    autoBean.innerHTML = petButtonEnum.autoBeanStart;
                    clearInterval(beanInterval);
                    clearTimeout(autoBeanTimeout);
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动换豆！`, false);
                }
            });
        });
        //自动喂养
        let feedAuto = _$('.feedAuto') as HTMLButtonElement,
            nextFeedTime = document.getElementById('nextFeedTime');
        feedAuto!.addEventListener('click', () => {
            //验证喂养克数
            let gramsSelect = document.getElementById('feedGrams') as HTMLSelectElement,
                gramsSelectOptions = gramsSelect.options[gramsSelect.selectedIndex];
            if (!gramsSelectOptions || !gramsSelectOptions.value) {
                alert("请选择喂养克数！");
                return false;
            }
            //验证喂养间隔
            const reg = /^[1-9]\d*$/;
            let feedSpanInput = document.getElementById('feedSpan') as HTMLInputElement;
            if (!!feedSpanInput.value && !reg.test(feedSpanInput.value)) {
                alert("请检查喂养间隔是否为正整数！");
                return false;
            }

            feedSpan = ((+feedSpanInput!.value * 3600000) || defaultFeedSpan);

            gramsSelect.disabled = !gramsSelect.disabled;
            feedSpanInput.disabled = !feedSpanInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                let feedTimeout = 0;
                let currentJDDate = new Date(+currentJDTime);
                if (feedAuto.innerHTML == petButtonEnum.feedStart) {
                    feedAuto.innerHTML = petButtonEnum.feedStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动喂养！`, false);

                    let timeDiff = feedSpan - +currentJDTime + lastFeedStamp + Utils.random(60000, 300000);
                    if (timeDiff > 0) {
                        nextFeedStamp = +currentJDTime + timeDiff;
                        nextFeedTime!.innerText = new Date(nextFeedStamp).toLocaleString();

                        feedTimeout = setTimeout(() => {
                            this.getJDTime().then((feedTime) => {
                                nextFeedInterval = feedSpan + Utils.random(60000, 300000);
                                nextFeedStamp = +feedTime + nextFeedInterval;
                                this.feed(gramsSelectOptions.value);

                                feedInterval = setInterval(() => {
                                    this.getJDTime().then((currentFeedTime) => {
                                        nextFeedStamp = +currentFeedTime + nextFeedInterval;
                                        this.feed(gramsSelectOptions.value);
                                    });
                                }, nextFeedInterval);
                            });
                        }, timeDiff);
                    }
                    else {
                        nextFeedInterval = feedSpan + Utils.random(60000, 300000);
                        nextFeedStamp = +currentJDTime + nextFeedInterval;
                        this.feed(gramsSelectOptions.value);

                        feedInterval = setInterval(() => {
                            this.getJDTime().then((currentFeedTime) => {
                                nextFeedStamp = +currentFeedTime + nextFeedInterval;
                                this.feed(gramsSelectOptions.value);
                            });
                        }, nextFeedInterval);
                    }
                }
                else {
                    nextFeedStamp = 0;
                    feedAuto.innerHTML = petButtonEnum.feedStart;
                    clearInterval(feedInterval);
                    clearTimeout(feedTimeout);
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动喂养！`, false);
                }
            });
        });
        //自动任务
        let taskAuto = _$('.taskAuto') as HTMLButtonElement;
        taskAuto!.addEventListener('click', () => {
            //验证任务类型
            let typeSelect = document.getElementById('taskType') as HTMLSelectElement,
                typeSelectOptions = typeSelect.options[typeSelect.selectedIndex];
            if (!typeSelectOptions || !typeSelectOptions.value) {
                alert("请选择任务类型！");
                return false;
            }
            //验证任务定时
            let taskTimingInput = document.getElementById('taskTiming') as HTMLInputElement;
            if (!taskTimingInput.value) {
                alert("请输入正确的任务定时格式！");
                return false;
            }
            //验证任务检测频率
            const reg = /^[1-9]\d*$/;
            let taskDetectionInput = document.getElementById('taskDetection') as HTMLInputElement;
            if (!!taskDetectionInput.value && !reg.test(taskDetectionInput.value)) {
                alert("请检查任务检测频率是否为正整数！");
                return false;
            }

            taskTiming = +Utils.formateTime(taskTimingInput.value) || +Utils.formateTime(defaultTaskTiming);
            taskSpan = ((+taskDetectionInput!.value * 3600000) || defaultTaskDetection);

            typeSelect.disabled = !typeSelect.disabled;
            taskTimingInput.disabled = !taskTimingInput.disabled;
            taskDetectionInput.disabled = !taskDetectionInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                let currentJDDate = new Date(+currentJDTime);
                if (taskAuto.innerHTML == petButtonEnum.taskStart) {
                    taskAuto.innerHTML = petButtonEnum.taskStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动任务！`, false);

                    this.task(typeSelectOptions.value);
                    taskInterval = setInterval(() => {
                        this.getJDTime().then((nowJDTime) => {
                            let nowJDDate = new Date(+nowJDTime);
                            if (+(nowJDDate.getHours().toString() + nowJDDate.getMinutes().toString()) >= taskTiming) {
                                this.task(typeSelectOptions.value);
                            }
                        });
                    }, taskSpan);
                }
                else {
                    helpConfirmStatus = petHelpConfirmEnum.待确认;
                    taskAuto.innerHTML = petButtonEnum.taskStart;
                    clearInterval(taskInterval);
                    taskTimeoutArray.forEach((timeout) => { clearTimeout(timeout); });
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动任务！`, false);
                }
            });
        });
        //自动活动
        let actAuto = _$('.actAuto') as HTMLButtonElement;
        actAuto!.addEventListener('click', () => {
            //验证活动类型
            let typeSelect = document.getElementById('actType') as HTMLSelectElement,
                typeSelectOptions = typeSelect.options[typeSelect.selectedIndex];
            if (!typeSelectOptions || !typeSelectOptions.value) {
                alert("请选择活动类型！");
                return false;
            }
            //验证活动检测频率
            const reg = /^[1-9]\d*$/;
            let actDetectionInput = document.getElementById('actDetection') as HTMLInputElement;
            if (!!actDetectionInput.value && !reg.test(actDetectionInput.value)) {
                alert("请检查活动检测频率是否为正整数！");
                return false;
            }

            actSpan = ((+actDetectionInput!.value * 3600000) || defaultActDetection);

            typeSelect.disabled = !typeSelect.disabled;
            actDetectionInput.disabled = !actDetectionInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                let actTimeout = 0;
                let currentJDDate = new Date(+currentJDTime);
                if (actAuto.innerHTML == petButtonEnum.actStart) {
                    actAuto.innerHTML = petButtonEnum.actStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动活动！`, false);

                    let firstSpan = actSpan - currentJDDate.getMinutes() * 60000 + Utils.random(60000, 180000);

                    actTimeout = setTimeout(() => {
                        this.activity(typeSelectOptions.value);
                        actInterval = setInterval(() => {
                            this.activity(typeSelectOptions.value);
                        }, actSpan);
                    }, firstSpan);
                }
                else {
                    actAuto.innerHTML = petButtonEnum.actStart;
                    clearInterval(actInterval);
                    clearTimeout(actTimeout);
                    //clearInterval(investTreasureInterval);
                    actTimeoutArray.forEach((timeout) => { clearTimeout(timeout); });
                    //investTreasureInterval = 0;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动活动！`, false);
                }
            });
        });
        //自动串门
        let helpAuto = _$('.helpAuto') as HTMLButtonElement;
        helpAuto!.addEventListener('click', () => {
            //验证活动类型
            let typeSelect = document.getElementById('helpType') as HTMLSelectElement,
                typeSelectOptions = typeSelect.options[typeSelect.selectedIndex];
            if (!typeSelectOptions || !typeSelectOptions.value) {
                alert("请选择活动类型！");
                return false;
            }
            //验证串门检测频率
            const reg = /^[1-9]\d*$/;
            let helpDetectionInput = document.getElementById('helpDetection') as HTMLInputElement;
            if (!!helpDetectionInput.value && !reg.test(helpDetectionInput.value)) {
                alert("请检查串门检测频率是否为正整数！");
                return false;
            }

            helpSpan = ((+helpDetectionInput!.value * 3600000) || defaultHelpDetection);

            typeSelect.disabled = !typeSelect.disabled;
            helpDetectionInput.disabled = !helpDetectionInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                let currentJDDate = new Date(+currentJDTime);
                if (helpAuto.innerHTML == petButtonEnum.helpStart) {
                    helpAuto.innerHTML = petButtonEnum.helpStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动串门！`, false);

                    this.dropAround(typeSelectOptions.value);
                    helpInterval = setInterval(() => {
                        this.dropAround(typeSelectOptions.value);
                    }, helpSpan);
                }
                else {
                    helpAuto.innerHTML = petButtonEnum.helpStart;
                    clearInterval(helpInterval);
                    helpTimeoutArray.forEach((timeout) => { clearTimeout(timeout); });
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动串门！`, false);
                }
            });
        });
        //自动组队
        let combatAuto = _$('.combatAuto') as HTMLButtonElement;
        combatAuto!.addEventListener('click', () => {
            //验证组队类型
            let typeSelect = document.getElementById('combatType') as HTMLSelectElement,
                typeSelectOptions = typeSelect.options[typeSelect.selectedIndex];
            if (!typeSelectOptions || !typeSelectOptions.value) {
                alert("请选择组队类型！");
                return false;
            }
            //验证组队定时
            let combatTimingInput = document.getElementById('combatTiming') as HTMLInputElement;
            if (!combatTimingInput.value) {
                alert("请输入正确的组队定时格式！");
                return false;
            }
            //验证任务检测频率
            const reg = /^[1-9]\d*$/;
            let combatDetectionInput = document.getElementById('combatDetection') as HTMLInputElement;
            if (!!combatDetectionInput.value && !reg.test(combatDetectionInput.value)) {
                alert("请检查组队检测频率是否为正整数！");
                return false;
            }

            combatTiming = combatTimingInput.value || defaultCombatTiming;
            combatSpan = ((+combatDetectionInput!.value * 3600000) || defaultCombatDetection);

            typeSelect.disabled = !typeSelect.disabled;
            combatTimingInput.disabled = !combatTimingInput.disabled;
            combatDetectionInput.disabled = !combatDetectionInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                let firstSpan = 0,
                    combatTimeout = 0,
                    isTimeOut = false;
                let currentJDDate = new Date(+currentJDTime),
                    timeSplit = combatTiming.split(':'),
                    timingStamp = new Date(+currentJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                if (combatAuto.innerHTML == petButtonEnum.combatStart) {
                    combatAuto.innerHTML = petButtonEnum.combatStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动组队！`, false);

                    if (currentJDDate.getTime() < timingStamp) {
                        firstSpan = timingStamp - currentJDDate.getTime();
                    }

                    combatTimeout = setTimeout(() => {
                        this.combatV2(typeSelectOptions.value);
                        combatInterval = setInterval(() => {
                            this.getJDTime().then((nowJDTime) => {
                                let nowJDDate = new Date(+nowJDTime),
                                    nowTimingStamp = new Date(+nowJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                                if (nowJDDate.getTime() >= nowTimingStamp) {
                                    clearTimeout(combatTimeout);
                                    this.combatV2(typeSelectOptions.value);
                                }
                                else {
                                    if (!isTimeOut) {
                                        isTimeOut = true;
                                        combatTimeout = setTimeout(() => {
                                            isTimeOut = false;
                                            this.combatV2(typeSelectOptions.value);
                                        }, nowTimingStamp - nowJDDate.getTime());
                                    }
                                }
                            });
                        }, combatSpan);
                    }, firstSpan);
                }
                else {
                    combatAuto.innerHTML = petButtonEnum.combatStart;
                    clearInterval(combatInterval);
                    clearTimeout(combatTimeout);
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动组队！`, false);
                }
            });
        });
    }

    async info(tipsShow: boolean = true): Promise<void> {
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        let isGetAllInfo = true,
            petLevel = document.getElementById('petLevel'),
            petCoin = document.getElementById('petCoin'),
            petFood = document.getElementById('petFood'),
            friendCount = document.getElementById('friendCount'),
            feedTotal = document.getElementById('feedTotal'),
            feedCount = document.getElementById('feedCount'),
            lastFeedTime = document.getElementById('lastFeedTime'),
            nextFeedTime = document.getElementById('nextFeedTime'),
            combatType = document.getElementById('combatType');

        petLevel!.innerText
            = petCoin!.innerText
            = petFood!.innerText
            = friendCount!.innerText
            = feedTotal!.innerText
            = feedCount!.innerText
            = lastFeedTime!.innerText
            = nextFeedTime!.innerText
            = "-";
        //获取宠汪汪首页信息
        const enterRoomUrl = `${this.petUrl}/pet/enterRoom/h5?reqSource=h5&invitePin=&lks=${lks}&lkt=${timestamp}`;
        await fetch(enterRoomUrl, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: `{}`
        })
            .then((res) => { return res.json() })
            .then((enterRoomJson) => {
                if (enterRoomJson.success) {
                    petPin = enterRoomJson.data.pin;
                    petLevel!.innerText = enterRoomJson.data.petLevel;
                    petCoin!.innerText = enterRoomJson.data.petCoin;
                    petFood!.innerText = enterRoomJson.data.petFood;
                    feedTotal!.innerText = enterRoomJson.data.feedCount;
                    lastFeedStamp = +enterRoomJson.data.lastFeedTime;
                    lastFeedTime!.innerText = new Date(lastFeedStamp).toLocaleString();
                    if (nextFeedStamp > 0) {
                        nextFeedTime!.innerText = new Date(nextFeedStamp).toLocaleString();
                    }
                    //if (enterRoomJson.data.bubbleOpen || !!enterRoomJson.data.bubbleReward) {
                    //    this.bulbble(enterRoomJson);
                    //}
                }
                else {
                    isGetAllInfo = !isGetAllInfo;
                    Utils.debugInfo(consoleEnum.log, enterRoomJson);
                    Utils.outPutLog(this.outputTextarea, `【首页信息请求失败，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                isGetAllInfo = !isGetAllInfo;
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~首页信息异常，请手动刷新或联系作者！】`, false);
            });
        //获取好友信息
        let currentPage = 1,
            pages = -1;
        allFriends.splice(0); //清空好友
        if (tipsShow) {
            while (pages == -1 || currentPage <= pages) {
                const getFriendsUrl = `${this.petUrl}/pet/h5/getFriends?itemsPerPage=20&currentPage=${currentPage}&reqSource=h5&lks=${lks}&lkt=${timestamp}`;
                await fetch(getFriendsUrl, { credentials: "include" })
                    .then((res) => { return res.json() })
                    .then((getFriendsJson) => {
                        if (getFriendsJson.success) {
                            friendCount!.innerText = getFriendsJson.page.items;
                            pages = getFriendsJson.page.pages;
                            getFriendsJson.datas.forEach((item: any) => {
                                if (!allFriends.some(friend => { return friend.friendPin === item.friendPin })) {
                                    allFriends.push(item);
                                    //combatType!.innerHTML += `<option value="${Utils.aesEncrypt(item.friendPin)}">${item.friendName}</option>`;
                                }
                            });
                        }
                        else {
                            isGetAllInfo = !isGetAllInfo;
                            Utils.debugInfo(consoleEnum.log, getFriendsJson);
                            Utils.outPutLog(this.outputTextarea, `【没有查找到${currentPage}页好友信息，请手动刷新或联系作者！】`, false);
                        }
                    })
                    .catch((error) => {
                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                        Utils.outPutLog(this.outputTextarea, `【哎呀~查询${currentPage}页好友信息异常，请手动刷新或联系作者！】`, false);
                    });

                currentPage++;
            }
        }
        //获取今日喂养信息
        const getTodayFeedInfoUrl = `${this.petUrl}/pet/getTodayFeedInfo?lks=${lks}&lkt=${timestamp}`;
        await fetch(getTodayFeedInfoUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((todayFeedInfoJson) => {
                if (todayFeedInfoJson.success) {
                    feedCount!.innerText = todayFeedInfoJson.data.feedCount;
                }
                else {
                    isGetAllInfo = !isGetAllInfo;
                    Utils.debugInfo(consoleEnum.log, todayFeedInfoJson);
                    Utils.outPutLog(this.outputTextarea, `【没有查找到你的喂养信息，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                isGetAllInfo = !isGetAllInfo;
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~喂养信息异常，请手动刷新或联系作者！】`, false);
            });

        if (isGetAllInfo && tipsShow) {
            document.getElementById('petInfo')!.style.display = '';
            document.getElementById('functionButton')!.style.display = '';
            document.getElementById('usingHelp')!.style.display = '';
            this.getJDTime().then((currentJDTime) => {
                Utils.outPutLog(this.outputTextarea, `${new Date(+currentJDTime).toLocaleString()} 宠物信息获取成功！`, false);
            });
        }
    }
    //兑换
    async exchange(nowJDDate: any, timestamp: any): Promise<void> {
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        const getHomeInfoUrl = `${this.petUrl}/gift/getBeanConfigs?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
        await fetch(getHomeInfoUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then(async (getBeanConfigsJson) => {
                if (getBeanConfigsJson.success && getBeanConfigsJson.data) {
                    let giftIndex = Math.floor(nowJDDate.getHours() / 8) * 8;
                    let currentGiftList = getBeanConfigsJson.data[`beanConfigs${giftIndex}`];

                    if (currentGiftList) {
                        let exchangeGift: any;

                        exchangeGift = currentGiftList.filter((giftItem: any) => {
                            return giftItem.giftType == "jd_bean"/* && getBeanConfigsJson.data.petCoin >= giftItem.salePrice && giftItem.leftStock > 0*/
                        });

                        if (exchangeGift) {
                            let sortGift = exchangeGift.sort((a: any, b: any) => { return b.giftValue - a.giftValue });
                            let hours = nowJDDate.getHours() < 10 ? `0${nowJDDate.getHours()}` : nowJDDate.getHours(); 
                            let minutes = nowJDDate.getMinutes() < 10 ? `0${nowJDDate.getMinutes()}` : nowJDDate.getMinutes(); 

                            if (+(hours + minutes) <= 1600) {
                                sortGift = sortGift.slice(0, 1);
                            }

                            sortGift.map(async (exchangeItem: any) => {
                                if (getBeanConfigsJson.data.petCoin >= exchangeItem.salePrice) {
                                    //"deviceInfo":{"eid":"","fp":"","deviceType":"","macAddress":"","imei":"","os":"","osVersion":"","ip":"","appId":"","openUUID":"","idfa":"","uuid":"","clientVersion":"","networkType":"","appType":"","sdkToken":""}
                                    let postData = `{"buyParam":{"orderSource":"pet","saleInfoId":${exchangeItem.id}},"deviceInfo":{"appId":"","appType":"","clientVersion":"","deviceType":"","eid":"${this.getCookie("3AB9D23F7A4B3C9B")}","fp":"${this.getCookie("fingerprint")}","idfa":"","imei":"","ip":"","macAddress":"","networkType":"","openUUID":"","os":"","osVersion":"","sdkToken":"","uuid":""}}`;
                                    let postlks = `${Utils.md5Encrypt(`${Utils.base64Encode(Utils.aesEncryptCiphertext(postData, utf8KeyCode, utf8IV))}_${keyCode}_${timestamp}`)}`
                                    const petExchangeUrl = `${this.petUrl}/gift/new/exchange?reqSource=h5&lks=${postlks}&lkt=${timestamp}`;
                                    await fetch(petExchangeUrl, {
                                        method: "POST",
                                        mode: "cors",
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: postData
                                    })
                                        .then((res) => { return res.json() })
                                        .then((petExchangeJson) => {
                                            if (petExchangeJson.success && petExchangeJson.errorCode == "buy_success") {
                                                Utils.outPutLog(this.outputTextarea, `${new Date(+petExchangeJson.currentTime).toLocaleString()} ${exchangeItem.giftName}兑换成功！`, false);
                                            }
                                            //else {
                                            //    Utils.debugInfo(consoleEnum.log, petExchangeJson);
                                            //    Utils.outPutLog(this.outputTextarea, `【京豆兑换失败，请手动刷新或联系作者！】`, false);
                                            //}
                                        })
                                        .catch((error) => {
                                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                            Utils.outPutLog(this.outputTextarea, `【哎呀~京豆兑换异常，请刷新后重新尝试或联系作者！】`, false);
                                        });
                                }
                            });

                            this.info(false);
                        }
                    }
                }
                else {
                    Utils.debugInfo(consoleEnum.log, getBeanConfigsJson);
                    Utils.outPutLog(this.outputTextarea, `【获取积分兑换信息失败，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取积分兑换信息异常，请手动刷新或联系作者！】`, false);
            });
    }
    //喂养
    async feed(grams: string | number): Promise<void> {
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        if (grams == feedGramsEnum.smartFeed) {
            grams = this.smartFeedCount();
        }
        const enterRoomUrl = `${this.petUrl}/pet/feed?feedCount=${grams}&lks=${lks}&lkt=${timestamp}`;
        await fetch(enterRoomUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((feedJson) => {
                if (feedJson.success) {
                    switch (feedJson.errorCode) {
                        case feedEnum.feedOk:
                        case feedEnum.levelUpgrade:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+feedJson.currentTime).toLocaleString()} ${grams}g狗粮喂养成功！`, false);
                            break;
                        case feedEnum.timeError:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+feedJson.currentTime).toLocaleString()} 已经喂养过狗子了！`, false);
                            Utils.debugInfo(consoleEnum.log, feedJson);
                            break;
                        case feedEnum.foodInsufficient:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+feedJson.currentTime).toLocaleString()} 没有足够的粮食喂养了！`, false);
                            Utils.debugInfo(consoleEnum.log, feedJson);
                            break;
                        default:
                            Utils.debugInfo(consoleEnum.log, feedJson);
                            Utils.outPutLog(this.outputTextarea, `${new Date(+feedJson.currentTime).toLocaleString()} 喂养失败！`, false);
                            break;
                    }
                }
                else {
                    Utils.debugInfo(consoleEnum.log, feedJson);
                    Utils.outPutLog(this.outputTextarea, `【喂养请求失败，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~喂养发生异常，请刷新后重新尝试或联系作者！】`, false);
            });

        this.info(false);
    }
    //任务
    async task(taskType: string): Promise<void> {
        let taskTimeout = 0;
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        //h5
        const getHPetTaskConfigUrl = `${this.petUrl}/pet/getPetTaskConfig?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
        await fetch(getHPetTaskConfigUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then(async (hPetTaskConfigJson) => {
                if (hPetTaskConfigJson.success) {
                    let exchageData: any,
                        helpFeedData: any,
                        everyDayFeedData: any,
                        raceData: any,
                        threeMealsData: any,
                        followChannelData: any,
                        followGoodData: any,
                        followShopData: any,
                        scanMarketData: any,
                        inviteUserData: any;
                    for (let i = 0; i < hPetTaskConfigJson.datas.length; i++) {
                        switch (hPetTaskConfigJson.datas[i].taskType) {
                            case petTaskEnum.每日参与一次兑换:
                                exchageData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.每日帮好友喂一次狗粮:
                                helpFeedData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.每日喂狗粮:
                                everyDayFeedData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.每日参与一次宠物赛跑:
                                raceData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.每日三餐:
                                threeMealsData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.浏览频道:
                                followChannelData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.关注商品:
                                followGoodData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.关注店铺:
                                followShopData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.逛会场:
                                scanMarketData = hPetTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.邀请用户:
                                inviteUserData = hPetTaskConfigJson.datas[i];
                                break;
                        }
                    }

                    if (taskType == petTaskEnum.每日参与一次兑换 || taskType == petTaskEnum.全部) {
                        if (!!exchageData && exchageData.receiveStatus == petTaskReceiveStatusEnum.unReceive) {
                            const getFoodUrl = `${this.petUrl}/pet/getFood?taskType=exchange&lks=${lks}&lkt=${timestamp}`;
                            await fetch(getFoodUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then((getFoodJson) => {
                                    if (getFoodJson.success) {
                                        if (getFoodJson.errorCode == petTaskErrorCodeEnum.received) {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} 每日参与一次兑换领取成功！`, false);
                                        }
                                        else {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} ${exchageData.errorMessage || "每日参与一次兑换已领取或已领满！"}`, false);
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getFoodJson);
                                        Utils.outPutLog(this.outputTextarea, `【每日参与一次兑换请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~每日参与一次兑换异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }
                    if (taskType == petTaskEnum.每日帮好友喂一次狗粮 || taskType == petTaskEnum.全部) {
                        if (!!helpFeedData && helpFeedData.receiveStatus == petTaskReceiveStatusEnum.unReceive) {
                            const getFoodUrl = `${this.petUrl}/pet/getFood?taskType=HelpFeed&lks=${lks}&lkt=${timestamp}`;
                            await fetch(getFoodUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then((getFoodJson) => {
                                    if (getFoodJson.success) {
                                        if (getFoodJson.errorCode == petTaskErrorCodeEnum.received) {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} 每日帮好友喂一次狗粮领取成功！`, false);
                                        }
                                        else {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} ${helpFeedData.errorMessage || "每日帮好友喂一次狗粮已领取或已领满！"}`, false);
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getFoodJson);
                                        Utils.outPutLog(this.outputTextarea, `【每日帮好友喂一次狗粮请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~每日帮好友喂一次狗粮异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }
                    if (taskType == petTaskEnum.每日喂狗粮 || taskType == petTaskEnum.全部) {
                        if (!!everyDayFeedData && everyDayFeedData.receiveStatus == petTaskReceiveStatusEnum.unReceive) {
                            const getFoodUrl = `${this.petUrl}/pet/getFood?taskType=FeedEveryDay&lks=${lks}&lkt=${timestamp}`;
                            await fetch(getFoodUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then((getFoodJson) => {
                                    if (getFoodJson.success) {
                                        if (getFoodJson.errorCode == petTaskErrorCodeEnum.received) {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} 每日喂狗粮领取成功！`, false);
                                        }
                                        else {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} ${everyDayFeedData.errorMessage || "每日喂狗粮已领取或已领满！"}`, false);
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getFoodJson);
                                        Utils.outPutLog(this.outputTextarea, `【每日喂狗粮请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~每日喂狗粮异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }
                    if (taskType == petTaskEnum.每日参与一次宠物赛跑 || taskType == petTaskEnum.全部) {
                        if (!!raceData && raceData.receiveStatus == petTaskReceiveStatusEnum.unReceive) {
                            const getFoodUrl = `${this.petUrl}/pet/getFood?taskType=race&lks=${lks}&lkt=${timestamp}`;
                            await fetch(getFoodUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then((getFoodJson) => {
                                    if (getFoodJson.success) {
                                        if (getFoodJson.errorCode == petTaskErrorCodeEnum.received) {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} 每日参与一次宠物赛跑领取成功！`, false);
                                        }
                                        else {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} ${raceData.errorMessage || "每日参与一次宠物赛跑已领取或已领满！"}`, false);
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getFoodJson);
                                        Utils.outPutLog(this.outputTextarea, `【每日参与一次宠物赛跑请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~每日参与一次宠物赛跑异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }
                    if (taskType == petTaskEnum.每日三餐 || taskType == petTaskEnum.全部) {
                        if (!!threeMealsData && threeMealsData.receiveStatus == petTaskReceiveStatusEnum.unReceive) {
                            let joinedCount = +threeMealsData.joinedCount,
                                taskChance = +threeMealsData.taskChance;
                            const getFoodUrl = `${this.petUrl}/pet/getFood?taskType=ThreeMeals&lks=${lks}&lkt=${timestamp}`;
                            await fetch(getFoodUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then((getFoodJson) => {
                                    if (getFoodJson.success) {
                                        if (getFoodJson.errorCode == petTaskErrorCodeEnum.received) {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} 【${joinedCount + 1}/${taskChance}】每日三餐领取成功！`, false);
                                        }
                                        else {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} ${threeMealsData.errorMessage || "每日三餐已领取或已领满！"}`, false);
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getFoodJson);
                                        Utils.outPutLog(this.outputTextarea, `【每日三餐请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~每日三餐异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }
                    if (taskType == petTaskEnum.浏览频道 || taskType == petTaskEnum.全部) {
                        if (!!followChannelData && followChannelData.receiveStatus == petTaskReceiveStatusEnum.chanceLeft) {
                            const getFollowChannelsUrl = `${this.petUrl}/pet/getFollowChannels?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
                            await fetch(getFollowChannelsUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then((getFollowChannelsJson) => {
                                    if (getFollowChannelsJson.success) {
                                        let joinedCount = +followChannelData.joinedCount,
                                            taskChance = +followChannelData.taskChance;
                                        for (let j = 0; j < getFollowChannelsJson.datas.length; j++) {
                                            let datas = getFollowChannelsJson.datas[j];
                                            if (!datas.status) {
                                                taskTimeoutArray.push(setTimeout(() => {
                                                    let postData = `{"channelId":"${datas.channelId}","taskType":"${petTaskEnum.浏览频道}"}`;
                                                    let postlks = `${Utils.md5Encrypt(`${Utils.base64Encode(Utils.aesEncryptCiphertext(this.sortByLetter(postData), utf8KeyCode, utf8IV))}_${keyCode}_${timestamp}`)}`
                                                    const scanUrl = `${this.petUrl}/pet/scan?reqSource=h5&lks=${postlks}&lkt=${timestamp}`;
                                                    fetch(scanUrl, {
                                                        method: "POST",
                                                        mode: "cors",
                                                        credentials: "include",
                                                        headers: {
                                                            "Content-Type": "application/json"
                                                        },
                                                        body: postData
                                                    })
                                                        .then((res) => { return res.json() })
                                                        .then((scanJson) => {
                                                            if (scanJson.success) {
                                                                switch (scanJson.errorCode) {
                                                                    case petTaskErrorCodeEnum.success:
                                                                    case petTaskErrorCodeEnum.followSuccess:
                                                                        joinedCount++;
                                                                        Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} 【${joinedCount}/${taskChance}】浏览频道成功！`, false);
                                                                        break;
                                                                    case petTaskErrorCodeEnum.followRepeat:
                                                                        Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "此频道今日已浏览！"}`, false);
                                                                        break;
                                                                    default:
                                                                        Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "无此频道或已过期！"}`, false);
                                                                        break;
                                                                }
                                                            }
                                                            else {
                                                                Utils.debugInfo(consoleEnum.log, scanJson);
                                                                Utils.outPutLog(this.outputTextarea, `【浏览频道请求失败，请手动刷新或联系作者！】`, false);
                                                            }
                                                        })
                                                        .catch((error) => {
                                                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                            Utils.outPutLog(this.outputTextarea, `【哎呀~浏览频道异常，请刷新后重新尝试或联系作者！】`, false);
                                                        });
                                                }, taskTimeout));
                                                taskTimeout += Utils.random(5000, 10000);
                                            }
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getFollowChannelsJson);
                                        Utils.outPutLog(this.outputTextarea, `【获取浏览频道请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取浏览频道异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }
                    if (taskType == petTaskEnum.关注商品 || taskType == petTaskEnum.全部) {
                        if (!!followGoodData && followGoodData.receiveStatus == petTaskReceiveStatusEnum.chanceLeft) {
                            let joinedCount = +followGoodData.joinedCount,
                                taskChance = +followGoodData.taskChance;
                            for (let j = 0; j < followGoodData.followGoodList.length; j++) {
                                let followGoodListData = followGoodData.followGoodList[j];
                                if (!followGoodListData.status) {
                                    taskTimeoutArray.push(setTimeout(() => {
                                        let postData = `sku=${followGoodListData.sku}`;
                                        const followGoodUrl = `${this.petUrl}/pet/followGood?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
                                        fetch(followGoodUrl, {
                                            method: "POST",
                                            mode: "cors",
                                            credentials: "include",
                                            headers: {
                                                "Content-Type": "application/x-www-form-urlencoded"
                                            },
                                            body: postData
                                        })
                                            .then((res) => { return res.json() })
                                            .then((followGoodJson) => {
                                                if (followGoodJson.success) {
                                                    switch (followGoodJson.errorCode) {
                                                        case petTaskErrorCodeEnum.success:
                                                        case petTaskErrorCodeEnum.followSuccess:
                                                            joinedCount++;
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+followGoodJson.currentTime).toLocaleString()} 【${joinedCount}/${taskChance}】关注商品成功！`, false);
                                                            break;
                                                        case petTaskErrorCodeEnum.followRepeat:
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+followGoodJson.currentTime).toLocaleString()} ${followGoodJson.errorMessage || "此商品今日已关注！"}`, false);
                                                            break;
                                                        default:
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+followGoodJson.currentTime).toLocaleString()} ${followGoodJson.errorMessage || "无此商品或已过期！"}`, false);
                                                            break;
                                                    }
                                                }
                                                else {
                                                    Utils.debugInfo(consoleEnum.log, followGoodJson);
                                                    Utils.outPutLog(this.outputTextarea, `【关注商品请求失败，请手动刷新或联系作者！】`, false);
                                                }
                                            })
                                            .catch((error) => {
                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                Utils.outPutLog(this.outputTextarea, `【哎呀~关注商品异常，请刷新后重新尝试或联系作者！】`, false);
                                            });
                                    }, taskTimeout));
                                    taskTimeout += Utils.random(5000, 10000);
                                }
                            }
                        }
                    } 
                    if (taskType == petTaskEnum.关注店铺 || taskType == petTaskEnum.全部) {
                        if (!!followShopData && followShopData.receiveStatus == petTaskReceiveStatusEnum.chanceLeft) {
                            const getFollowShopsUrl = `${this.petUrl}/pet/getFollowShops?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
                            await fetch(getFollowShopsUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then((getFollowShopsJson) => {
                                    if (getFollowShopsJson.success) {
                                        let joinedCount = +followShopData.joinedCount,
                                            taskChance = +followShopData.taskChance;
                                        for (let j = 0; j < getFollowShopsJson.datas.length; j++) {
                                            let datas = getFollowShopsJson.datas[j];
                                            if (!datas.status) {
                                                taskTimeoutArray.push(setTimeout(() => {
                                                    let postData = `shopId=${datas.shopId}`;
                                                    const followShopUrl = `${this.petUrl}/pet/followShop?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
                                                    fetch(followShopUrl, {
                                                        method: "POST",
                                                        mode: "cors",
                                                        credentials: "include",
                                                        headers: {
                                                            "Content-Type": "application/x-www-form-urlencoded"
                                                        },
                                                        body: postData
                                                    })
                                                        .then((res) => { return res.json() })
                                                        .then((followShopJson) => {
                                                            if (followShopJson.success) {
                                                                switch (followShopJson.errorCode) {
                                                                    case petTaskErrorCodeEnum.success:
                                                                    case petTaskErrorCodeEnum.followSuccess:
                                                                        joinedCount++;
                                                                        Utils.outPutLog(this.outputTextarea, `${new Date(+followShopJson.currentTime).toLocaleString()} 【${joinedCount}/${taskChance}】关注店铺成功！`, false);
                                                                        break;
                                                                    case petTaskErrorCodeEnum.followRepeat:
                                                                        Utils.outPutLog(this.outputTextarea, `${new Date(+followShopJson.currentTime).toLocaleString()} ${followShopJson.errorMessage || "此店铺今日已关注！"}`, false);
                                                                        break;
                                                                    default:
                                                                        Utils.outPutLog(this.outputTextarea, `${new Date(+followShopJson.currentTime).toLocaleString()} ${followShopJson.errorMessage || "无此店铺或已过期！"}`, false);
                                                                        break;
                                                                }
                                                            }
                                                            else {
                                                                Utils.debugInfo(consoleEnum.log, followShopJson);
                                                                Utils.outPutLog(this.outputTextarea, `【关注店铺请求失败，请手动刷新或联系作者！】`, false);
                                                            }
                                                        })
                                                        .catch((error) => {
                                                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                            Utils.outPutLog(this.outputTextarea, `【哎呀~关注店铺异常，请刷新后重新尝试或联系作者！】`, false);
                                                        });
                                                }, taskTimeout));
                                                taskTimeout += Utils.random(5000, 10000);
                                            }
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getFollowShopsJson);
                                        Utils.outPutLog(this.outputTextarea, `【获取关注店铺请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取关注店铺异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }
                    if (taskType == petTaskEnum.逛会场 || taskType == petTaskEnum.全部) {
                        if (!!scanMarketData && scanMarketData.receiveStatus == petTaskReceiveStatusEnum.chanceLeft) {
                            let joinedCount = +scanMarketData.joinedCount,
                                taskChance = +scanMarketData.taskChance;
                            for (let j = 0; j < scanMarketData.scanMarketList.length; j++) {
                                let scanMarketListData = scanMarketData.scanMarketList[j];
                                if (!scanMarketListData.status) {
                                    //let linkUrl = scanMarketListData.showDest == "h5" ? scanMarketListData.marketLinkH5 : scanMarketListData.marketLink;
                                    taskTimeoutArray.push(setTimeout(() => {
                                        let postData = `{"marketLink":${JSON.stringify(scanMarketListData.marketLinkH5)},"taskType":"${petTaskEnum.逛会场}"}`;
                                        let postlks = `${Utils.md5Encrypt(`${Utils.base64Encode(Utils.aesEncryptCiphertext(this.sortByLetter(postData), utf8KeyCode, utf8IV))}_${keyCode}_${timestamp}`)}`
                                        const scanUrl = `${this.petUrl}/pet/scan?reqSource=h5&lks=${postlks}&lkt=${timestamp}`;
                                        fetch(scanUrl, {
                                            method: "POST",
                                            mode: "cors",
                                            credentials: "include",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: postData
                                        })
                                            .then((res) => { return res.json() })
                                            .then((scanJson) => {
                                                if (scanJson.success) {
                                                    switch (scanJson.errorCode) {
                                                        case petTaskErrorCodeEnum.success:
                                                        case petTaskErrorCodeEnum.followSuccess:
                                                            joinedCount++;
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} 【${joinedCount}/${taskChance}】逛会场成功！`, false);
                                                            break;
                                                        case petTaskErrorCodeEnum.followRepeat:
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "此会场今日已逛！"}`, false);
                                                            break;
                                                        default:
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "无此会场或已过期！"}`, false);
                                                            break;
                                                    }
                                                }
                                                else {
                                                    Utils.debugInfo(consoleEnum.log, scanJson);
                                                    Utils.outPutLog(this.outputTextarea, `【逛会场请求失败，请手动刷新或联系作者！】`, false);
                                                }
                                            })
                                            .catch((error) => {
                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                Utils.outPutLog(this.outputTextarea, `【哎呀~逛会场异常，请刷新后重新尝试或联系作者！】`, false);
                                            });
                                    }, taskTimeout));
                                    taskTimeout += Utils.random(5000, 10000);
                                }
                            }
                        }
                    }
                    if (taskType == petTaskEnum.看激励视频 || taskType == petTaskEnum.全部) {
                        let joinedCount = 0,
                            taskChance = 10;
                        for (let j = 0; j < taskChance; j++) {
                            taskTimeoutArray.push(setTimeout(() => {
                                let postData = `{"taskType":"${petTaskEnum.看激励视频}"}`;
                                let postlks = `${Utils.md5Encrypt(`${Utils.base64Encode(Utils.aesEncryptCiphertext(this.sortByLetter(postData), utf8KeyCode, utf8IV))}_${keyCode}_${timestamp}`)}`
                                const scanUrl = `${this.petUrl}/pet/scan?reqSource=h5&lks=${postlks}&lkt=${timestamp}`;
                                fetch(scanUrl, {
                                    method: "POST",
                                    mode: "cors",
                                    credentials: "include",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: postData
                                })
                                    .then((res) => { return res.json() })
                                    .then((scanJson) => {
                                        if (scanJson.success) {
                                            switch (scanJson.errorCode) {
                                                case petTaskErrorCodeEnum.success:
                                                case petTaskErrorCodeEnum.followSuccess:
                                                    joinedCount++;
                                                    Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} 【${joinedCount}】看激励视频成功！`, false);
                                                    break;
                                                case petTaskErrorCodeEnum.followFull:
                                                    return;
                                                default:
                                                    Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "无此视频或已完成！"}`, false);
                                                    break;
                                            }
                                        }
                                        else {
                                            Utils.debugInfo(consoleEnum.log, scanJson);
                                            Utils.outPutLog(this.outputTextarea, `【看激励视频请求失败，请手动刷新或联系作者！】`, false);
                                        }
                                    })
                                    .catch((error) => {
                                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                        Utils.outPutLog(this.outputTextarea, `【哎呀~看激励视频异常，请刷新后重新尝试或联系作者！】`, false);
                                    });
                            }, taskTimeout));
                            taskTimeout += Utils.random(10000, 15000);
                        }
                    }
                    if (taskType == petTaskEnum.邀请用户 || taskType == petTaskEnum.全部) {
                        if (!!inviteUserData && inviteUserData.receiveStatus == petTaskReceiveStatusEnum.unReceive) {
                            //领取狗粮
                            const getFoodUrl = `${this.petUrl}/pet/getFood?taskType=InviteUser&lks=${lks}&lkt=${timestamp}`;
                            await fetch(getFoodUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then((getFoodJson) => {
                                    if (getFoodJson.success) {
                                        if (getFoodJson.errorCode == petTaskErrorCodeEnum.received) {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} 成功领取${getFoodJson.data}g助力狗粮！`, false);
                                        }
                                        else {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFoodJson.currentTime).toLocaleString()} 没有可以领取的助力狗粮了！`, false);
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getFoodJson);
                                        Utils.outPutLog(this.outputTextarea, `【领取助力狗粮请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                }).catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~领取助力狗粮异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }

                        let getData = `?where=${encodeURIComponent(`{ "pin": "${petPin}" }`)}`;
                        await fetch(Config.BmobHost + Config.BmobUserInfoUrl + getData, { headers: Utils.getHeaders(Config.BmobUserInfoUrl, hPetTaskConfigJson.currentTime) })
                            .then((res) => { return res.json() })
                            .then((getCurrentUserJson) => {
                                if (!!getCurrentUserJson.results) {
                                    if (getCurrentUserJson.results.length > 0) {
                                        let currentUserData = getCurrentUserJson.results[0];
                                        if (currentUserData.isBlock) {
                                            Utils.outPutLog(this.outputTextarea, `【哎呀~做坏事被列入黑名单了，永久失去互助资格！】`, false);
                                        }
                                        else if (currentUserData.helpStatus) {
                                            //助力
                                            this.helpFriend(hPetTaskConfigJson.currentTime);
                                        }
                                        else {
                                            //更新
                                            if (helpConfirmStatus == petHelpConfirmEnum.待确认 && confirm("是否再次开启【邀请用户】功能？")) {
                                                helpConfirmStatus = petHelpConfirmEnum.已确认;
                                                let putData = `{ "helpStatus": true }`;
                                                fetch(`${Config.BmobHost + Config.BmobUserInfoUrl}/${currentUserData.objectId}`, {
                                                    method: "PUT",
                                                    headers: Utils.getHeaders(`${Config.BmobUserInfoUrl}/${currentUserData.objectId}`, hPetTaskConfigJson.currentTime),
                                                    body: putData
                                                }).then((res) => { return res.json() })
                                                    .then((updateCurrentUserJson) => {
                                                        if (!!updateCurrentUserJson.updatedAt) {
                                                            //助力
                                                            this.helpFriend(hPetTaskConfigJson.currentTime);
                                                        }
                                                        else {
                                                            Utils.debugInfo(consoleEnum.log, updateCurrentUserJson);
                                                            Utils.outPutLog(this.outputTextarea, `【再次开启互助功能失败，请手动刷新或联系作者！】`, false);
                                                        }
                                                    }).catch((error) => {
                                                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                        Utils.outPutLog(this.outputTextarea, `【哎呀~再次开启互助功能异常，请刷新后重新尝试或联系作者！】`, false);
                                                    });
                                            }
                                            else {
                                                helpConfirmStatus = petHelpConfirmEnum.已取消;
                                                Utils.outPutLog(this.outputTextarea, `【您已主动取消互助功能！】`, false);
                                            }
                                        }
                                    }
                                    else {
                                        //新增
                                        if (helpConfirmStatus == petHelpConfirmEnum.待确认 && confirm("确定后将记录您的PIN码并开启【邀请用户】功能，取消则不记录您的PIN码并暂停【邀请用户】功能。")) {
                                            helpConfirmStatus = petHelpConfirmEnum.已确认;
                                            let postData = `{ "pin": "${petPin}", "helpStatus": true }`;
                                            fetch(Config.BmobHost + Config.BmobUserInfoUrl, {
                                                method: "POST",
                                                headers: Utils.getHeaders(Config.BmobUserInfoUrl, hPetTaskConfigJson.currentTime),
                                                body: postData
                                            }).then((res) => { return res.json() })
                                                .then((addCurrentUserJson) => {
                                                    if (!!addCurrentUserJson.objectId) {
                                                        //助力
                                                        this.helpFriend(hPetTaskConfigJson.currentTime);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, addCurrentUserJson);
                                                        Utils.outPutLog(this.outputTextarea, `【记录用户请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                }).catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~记录用户异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }
                                        else {
                                            helpConfirmStatus = petHelpConfirmEnum.已取消;
                                            Utils.outPutLog(this.outputTextarea, `【您已主动取消互助功能！】`, false);
                                        }
                                    }
                                }
                                else {
                                    Utils.debugInfo(consoleEnum.log, getCurrentUserJson);
                                    Utils.outPutLog(this.outputTextarea, `【获取当前用户信息记录请求失败，请手动刷新或联系作者！】`, false);
                                }
                            }).catch((error) => {
                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                Utils.outPutLog(this.outputTextarea, `【哎呀~获取当前用户信息记录异常，请刷新后重新尝试或联系作者！】`, false);
                            });
                    }
                }
                else {
                    Utils.debugInfo(consoleEnum.log, hPetTaskConfigJson);
                    Utils.outPutLog(this.outputTextarea, `【h5任务信息请求失败，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取h5任务信息异常，请刷新后重新尝试或联系作者！】`, false);
            });
    }
    //活动
    async activity(actType: string): Promise<void> {
        let actTimeout = 0;
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        if (actType == petActEnum.逛店拿积分 || actType == petActEnum.全部) {
            const getDeskGoodDetailsUrl = `${this.petUrl}/pet/getDeskGoodDetails?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
            await fetch(getDeskGoodDetailsUrl, { credentials: "include" })
                .then((res) => { return res.json() })
                .then((deskGoodDetailsJson) => {
                    if (deskGoodDetailsJson.success) {
                        let followCount = +deskGoodDetailsJson.data.followCount,
                            taskChance = +deskGoodDetailsJson.data.taskChance;
                        if (followCount < taskChance) {
                            for (let j = 0; j < deskGoodDetailsJson.data.deskGoods.length; j++) {
                                let deskGoodsData = deskGoodDetailsJson.data.deskGoods[j];
                                if (!deskGoodsData.status && j < taskChance) {
                                    actTimeoutArray.push(setTimeout(() => {
                                        let postData = `{"sku":"${deskGoodsData.sku}","taskType":"${petActEnum.逛店拿积分}"}`;
                                        let postlks = `${Utils.md5Encrypt(`${Utils.base64Encode(Utils.aesEncryptCiphertext(postData, utf8KeyCode, utf8IV))}_${keyCode}_${timestamp}`)}`
                                        const scanUrl = `${this.petUrl}/pet/scan?reqSource=h5&lks=${postlks}&lkt=${timestamp}`;
                                        fetch(scanUrl, {
                                            method: "POST",
                                            mode: "cors",
                                            credentials: "include",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: postData
                                        })
                                            .then((res) => { return res.json() })
                                            .then((scanJson) => {
                                                if (scanJson.success) {
                                                    switch (scanJson.errorCode) {
                                                        case petTaskErrorCodeEnum.success:
                                                        case petTaskErrorCodeEnum.followSuccess:
                                                            followCount++;
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} 【${followCount}/${taskChance}】逛店拿积分成功！`, false);
                                                            break;
                                                        case petTaskErrorCodeEnum.followRepeat:
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "此店今日已逛"}`, false);
                                                            break;
                                                        default:
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "无此店或已过期"}`, false);
                                                            break;
                                                    }
                                                }
                                                else {
                                                    Utils.debugInfo(consoleEnum.log, scanJson);
                                                    Utils.outPutLog(this.outputTextarea, `【逛店拿积分请求失败，请手动刷新或联系作者！】`, false);
                                                }
                                            })
                                            .catch((error) => {
                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                Utils.outPutLog(this.outputTextarea, `【哎呀~逛店拿积分异常，请刷新后重新尝试或联系作者！】`, false);
                                            });
                                    }, actTimeout));
                                    actTimeout += Utils.random(5000, 10000);
                                }
                            }
                        }
                    }
                    else {
                        Utils.debugInfo(consoleEnum.log, deskGoodDetailsJson);
                        Utils.outPutLog(this.outputTextarea, `【逛店拿积分信息请求失败，请手动刷新或联系作者！】`, false);
                    }
                })
                .catch((error) => {
                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取逛店拿积分信息异常，请刷新后重新尝试或联系作者！】`, false);
                });
        }
        //if (actType == petActEnum.戳泡泡 || actType == petActEnum.全部) {
        //    const visitPetIndex = `${this.petUrl}/pet/index/`;
        //    fetch(visitPetIndex, { credentials: "include" })
        //        .then((visitPetIndexJson) => {
        //            const enterRoomUrl = `${this.petUrl}/pet/enterRoom?reqSource=h5&invitePin=`;
        //            fetch(enterRoomUrl, { credentials: "include" })
        //                .then((res) => { return res.json() })
        //                .then((enterRoomJson) => {
        //                    if (enterRoomJson.success) {
        //                        if (enterRoomJson.data.bubbleOpen || !!enterRoomJson.data.bubbleReward) {
        //                            this.bulbble(enterRoomJson);
        //                        }
        //                    }
        //                    else {
        //                        Utils.debugInfo(consoleEnum.log, enterRoomJson);
        //                        Utils.outPutLog(this.outputTextarea, `【获取戳泡泡信息请求失败，请手动刷新或联系作者！】`, false);
        //                    }
        //                })
        //                .catch((error) => {
        //                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
        //                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取戳泡泡信息异常，请手动刷新或联系作者！】`, false);
        //                });
        //        })
        //        .catch((error) => {
        //            Utils.debugInfo(consoleEnum.error, 'request failed', error);
        //            Utils.outPutLog(this.outputTextarea, `【哎呀~访问宠汪汪主页异常，请刷新后重新尝试或联系作者！】`, false);
        //        });
        //}
        //if (actType == petActEnum.聚宝盆终极大奖 || actType == petActEnum.全部) {
        //    if (!investTreasureInterval || investTreasureInterval == 0) {
        //        const investTreasureUrl = `${this.petUrl}/pet/investTreasure`;
        //        investTreasureInterval = setInterval(() => {
        //            let localeDate = +Utils.formatDate3(new Date().getTime().toString());
        //            if (localeDate >= 5930000 && localeDate <= 10000000) {
        //                this.getJDTime().then((currentJDTime) => {
        //                    let serverDate = +Utils.formatDate3(currentJDTime.toString());
        //                    if (serverDate >= 5959200 && serverDate <= 10000000) {
        //                        fetch(investTreasureUrl, { credentials: "include" })
        //                            .then((res) => { return res.json() })
        //                            .then((investTreasureJson) => {
        //                                if (investTreasureJson.success) {
        //                                    Utils.debugInfo(consoleEnum.log, investTreasureJson);
        //                                    Utils.outPutLog(this.outputTextarea, `${new Date(+investTreasureJson.currentTime).toLocaleString()} 已尝试聚宝盆终极大奖！`, false);
        //                                }
        //                                else {
        //                                    Utils.debugInfo(consoleEnum.log, investTreasureJson);
        //                                    Utils.outPutLog(this.outputTextarea, `【聚宝盆终极大奖请求失败，请手动刷新或联系作者！】`, false);
        //                                }

        //                                clearInterval(investTreasureInterval);
        //                                investTreasureInterval = 0;
        //                            })
        //                            .catch((error) => {
        //                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
        //                                Utils.outPutLog(this.outputTextarea, `【哎呀~聚宝盆终极大奖异常，请手动刷新或联系作者！】`, false);
        //                            });
        //                    }
        //                });
        //            }
        //        }, 200);
        //    }
        //}
    }
    //串门
    async dropAround(helpType: string): Promise<void> {
        let helpTimeout = 0,
            friends = JSON.parse(JSON.stringify(allFriends)); //深拷贝
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        if (friends.length > 0) {
            friends.forEach((currentFriend: any) => {
                if (currentFriend.friendPin != petPin) {
                    helpTimeoutArray.push(setTimeout(async () => {
                        const enterFriendRoomUrl = `${this.petUrl}/pet/enterFriendRoom?friendPin=${encodeURIComponent(currentFriend.friendPin)}&lks=${lks}&lkt=${timestamp}`;
                        await fetch(enterFriendRoomUrl, { credentials: "include" })
                            .then((res) => { return res.json() })
                            .then(async (enterFriendRoomJson) => {
                                if (enterFriendRoomJson.success) {
                                    if (helpType == petHelpEnum.帮助喂养 || helpType == petHelpEnum.全部) {
                                        if (enterFriendRoomJson.data.helpFeedStatus == petFriendsStatusEnum.notfeed) {
                                            const helpFeedUrl = `${this.petUrl}/pet/helpFeed?friendPin=${encodeURIComponent(currentFriend.friendPin)}&lks=${lks}&lkt=${timestamp}`;
                                            await fetch(helpFeedUrl, { credentials: "include" })
                                                .then((res) => { return res.json() })
                                                .then((helpFeedJson) => {
                                                    if (helpFeedJson.success) {
                                                        switch (helpFeedJson.errorCode) {
                                                            case petFriendsStatusEnum.helpok:
                                                                Utils.outPutLog(this.outputTextarea, `${new Date(+helpFeedJson.currentTime).toLocaleString()} 帮助【${currentFriend.friendName}】喂养成功！`, false);
                                                                break;
                                                            case petFriendsStatusEnum.chanceFull:
                                                                break;
                                                            default:
                                                                Utils.outPutLog(this.outputTextarea, `${new Date(+helpFeedJson.currentTime).toLocaleString()} 【${currentFriend.friendName}】已帮喂或主人已喂！`, false);
                                                                break;
                                                        }
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, enterFriendRoomJson);
                                                        Utils.outPutLog(this.outputTextarea, `【帮助${currentFriend.friendName}喂养失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~帮助${currentFriend.friendName}喂养异常，请手动刷新或联系作者！】`, false);
                                                });
                                        }
                                    }
                                    if (helpType == petHelpEnum.偷取狗粮 || helpType == petHelpEnum.全部) {
                                        if (+enterFriendRoomJson.data.stealFood > 0) {
                                            const getRandomFoodUrl = `${this.petUrl}/pet/getRandomFood?friendPin=${encodeURIComponent(currentFriend.friendPin)}&lks=${lks}&lkt=${timestamp}`;
                                            await fetch(getRandomFoodUrl, { credentials: "include" })
                                                .then((res) => { return res.json() })
                                                .then((getRandomFoodJson) => {
                                                    if (getRandomFoodJson.success) {
                                                        switch (getRandomFoodJson.errorCode) {
                                                            case petFriendsStatusEnum.stealok:
                                                                Utils.outPutLog(this.outputTextarea, `${new Date(+getRandomFoodJson.currentTime).toLocaleString()} 偷取【${currentFriend.friendName}】狗粮成功！`, false);
                                                                break;
                                                            case petFriendsStatusEnum.chanceFull:
                                                                break;
                                                            default:
                                                                Utils.outPutLog(this.outputTextarea, `${new Date(+getRandomFoodJson.currentTime).toLocaleString()} 【${currentFriend.friendName}】的狗粮已偷取或无狗粮！`, false);
                                                                break;
                                                        }
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, enterFriendRoomJson);
                                                        Utils.outPutLog(this.outputTextarea, `【偷取${currentFriend.friendName}狗粮失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~偷取${currentFriend.friendName}狗粮异常，请手动刷新或联系作者！】`, false);
                                                });
                                        }
                                    }
                                    if (helpType == petHelpEnum.获取金币 || helpType == petHelpEnum.全部) {
                                        if (+enterFriendRoomJson.data.friendHomeCoin > 0) {
                                            const getFriendCoinUrl = `${this.petUrl}/pet/getFriendCoin?friendPin=${encodeURIComponent(currentFriend.friendPin)}&lks=${lks}&lkt=${timestamp}`;
                                            await fetch(getFriendCoinUrl, { credentials: "include" })
                                                .then((res) => { return res.json() })
                                                .then((getFriendCoinJson) => {
                                                    if (getFriendCoinJson.success) {
                                                        if (getFriendCoinJson.errorCode == petFriendsStatusEnum.cointookok) {
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFriendCoinJson.currentTime).toLocaleString()} 获取【${currentFriend.friendName}】金币成功！`, false);
                                                        }
                                                        else {
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+getFriendCoinJson.currentTime).toLocaleString()} 【${currentFriend.friendName}】的金币已获取或无金币！`, false);
                                                        }
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, enterFriendRoomJson);
                                                        Utils.outPutLog(this.outputTextarea, `【获取${currentFriend.friendName}金币失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取${currentFriend.friendName}金币异常，请手动刷新或联系作者！】`, false);
                                                });
                                        }
                                    }
                                }
                                else {
                                    Utils.debugInfo(consoleEnum.log, enterFriendRoomJson);
                                    Utils.outPutLog(this.outputTextarea, `【没有获取到${currentFriend.friendName}的信息，请手动刷新或联系作者！】`, false);
                                }
                            })
                            .catch((error) => {
                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                Utils.outPutLog(this.outputTextarea, `【哎呀~获取${currentFriend.friendName}的信息异常，请手动刷新或联系作者！】`, false);
                            });

                    }, helpTimeout));
                    helpTimeout += Utils.random(5000, 10000);
                }
            })
        }
    }
    //组队V2
    async combatV2(combatType: string): Promise<void> {
        let maxRetryCount = 5,
            combatMatchInterval = 0;
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        const myCombatDetailUrl = `${this.petUrl}/pet/combat/detail/v2?reqSource=h5&help=false&reqSource=h5&lks=${lks}&lkt=${timestamp}`
        await fetch(myCombatDetailUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then(async (myCombatDetailJson) => {
                if (myCombatDetailJson.success) {
                    //领取奖励
                    if (+myCombatDetailJson.data.winCoin > 0 && (myCombatDetailJson.data.petRaceResult == petCombatV2ResultEnum.raceWin || myCombatDetailJson.data.petRaceResult == petCombatV2ResultEnum.unreceive)) {
                        const combatReceiveUrl = `${this.petUrl}/pet/combat/receive?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
                        await fetch(combatReceiveUrl, { credentials: "include" })
                            .then((res) => { return res.json() })
                            .then((combatReceiveJson) => {
                                if (combatReceiveJson.success) {
                                    Utils.outPutLog(this.outputTextarea, `${new Date(+combatReceiveJson.currentTime).toLocaleString()} 成功领取组队奖励！`, false);
                                }
                                else {
                                    Utils.outPutLog(this.outputTextarea, `${new Date(+combatReceiveJson.currentTime).toLocaleString()} 已经领取过组队奖励或无奖励！`, false);
                                }

                            })
                            .catch((error) => {
                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                Utils.outPutLog(this.outputTextarea, `【哎呀~领取组队奖励异常，请手动刷新或联系作者！】`, false);
                            });
                    }
                    //开启战队
                    if (myCombatDetailJson.data.petRaceResult == petCombatV2ResultEnum.notParticipate) {
                        combatMatchInterval = setInterval(async () => {
                            if (maxRetryCount > 0) {
                                maxRetryCount--;
                                const combatJoinUrl = `${this.petUrl}/pet/combat/match?reqSource=h5&teamLevel=${combatType}&lks=${lks}&lkt=${timestamp}`;
                                await fetch(combatJoinUrl, { credentials: "include" })
                                    .then((res) => { return res.json() })
                                    .then(async (matchJson) => {
                                        if (matchJson.success) {
                                            switch (matchJson.data.petRaceResult) {
                                                case petCombatV2ResultEnum.matching:
                                                    Utils.outPutLog(this.outputTextarea, `${new Date(+matchJson.currentTime).toLocaleString()} 【${petCombatV2TypeEnum[+combatType]}】正在匹配中！`, false);
                                                    break;
                                                case petCombatV2ResultEnum.participate:
                                                    clearInterval(combatMatchInterval);
                                                    Utils.outPutLog(this.outputTextarea, `${new Date(+matchJson.currentTime).toLocaleString()} 开启【${petCombatV2TypeEnum[+combatType]}】成功！`, false);
                                                    this.combatSupply(myCombatDetailJson.data.supplyOrder);
                                                    break;
                                                default:
                                                    Utils.debugInfo(consoleEnum.log, matchJson);
                                                    Utils.outPutLog(this.outputTextarea, `【开启【${petCombatV2TypeEnum[+combatType]}】失败，请手动刷新或联系作者！】！`, false);
                                                    break;
                                            }
                                        }
                                    })
                                    .catch((error) => {
                                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                        Utils.outPutLog(this.outputTextarea, `【哎呀~开启【${petCombatV2TypeEnum[+combatType]}】异常，请手动刷新或联系作者！】`, false);
                                    });
                            }
                            else {
                                clearInterval(combatMatchInterval);
                            }
                        }, 5000);
                    }
                    //战队补给
                    if (myCombatDetailJson.data.petRaceResult == petCombatV2ResultEnum.participate && !!myCombatDetailJson.data.supplyOrder) {
                        await this.combatSupply(myCombatDetailJson.data.supplyOrder);
                    }
                    //战队助力
                    let getData = `?where=${encodeURIComponent(`{ "pin": "${petPin}" }`)}`;
                    await fetch(Config.BmobHost + Config.BmobUserInfoUrl + getData, { headers: Utils.getHeaders(Config.BmobUserInfoUrl, myCombatDetailJson.currentTime) })
                        .then((res) => { return res.json() })
                        .then((getCurrentUserJson) => {
                            if (!!getCurrentUserJson.results) {
                                if (getCurrentUserJson.results.length > 0) {
                                    let currentUserData = getCurrentUserJson.results[0];
                                    if (currentUserData.isBlock) {
                                        Utils.outPutLog(this.outputTextarea, `【哎呀~做坏事被列入黑名单了，永久失去互助资格！】`, false);
                                    }
                                    else if (currentUserData.combatHelpStatus) {
                                        //助力
                                        this.combatHelpFriend(myCombatDetailJson.currentTime);
                                    }
                                    else {
                                        //更新
                                        if (combatHelpConfirmStatus == petCombatV2HelpConfirmEnum.待确认 && confirm("是否再次开启【战队互助】功能？")) {
                                            combatHelpConfirmStatus = petCombatV2HelpConfirmEnum.已确认;
                                            let putData = `{ "combatHelpStatus": true }`;
                                            fetch(`${Config.BmobHost + Config.BmobUserInfoUrl}/${currentUserData.objectId}`, {
                                                method: "PUT",
                                                headers: Utils.getHeaders(`${Config.BmobUserInfoUrl}/${currentUserData.objectId}`, myCombatDetailJson.currentTime),
                                                body: putData
                                            }).then((res) => { return res.json() })
                                                .then((updateCurrentUserJson) => {
                                                    if (!!updateCurrentUserJson.updatedAt) {
                                                        //助力
                                                        this.combatHelpFriend(myCombatDetailJson.currentTime);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, updateCurrentUserJson);
                                                        Utils.outPutLog(this.outputTextarea, `【再次开启战队互助功能失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                }).catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~再次开启战队互助功能异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }
                                        else {
                                            combatHelpConfirmStatus = petCombatV2HelpConfirmEnum.已取消;
                                            Utils.outPutLog(this.outputTextarea, `【您已主动取消战队互助功能！】`, false);
                                        }
                                    }
                                }
                                else {
                                    //新增
                                    if (combatHelpConfirmStatus == petCombatV2HelpConfirmEnum.待确认 && confirm("确定后将记录您的PIN码并开启【战队互助】功能，取消则不记录您的PIN码并暂停【战队互助】功能。")) {
                                        combatHelpConfirmStatus = petCombatV2HelpConfirmEnum.已确认;
                                        let postData = `{ "pin": "${petPin}", "combatHelpStatus": true }`;
                                        fetch(Config.BmobHost + Config.BmobUserInfoUrl, {
                                            method: "POST",
                                            headers: Utils.getHeaders(Config.BmobUserInfoUrl, myCombatDetailJson.currentTime),
                                            body: postData
                                        }).then((res) => { return res.json() })
                                            .then((addCurrentUserJson) => {
                                                if (!!addCurrentUserJson.objectId) {
                                                    //助力
                                                    this.combatHelpFriend(myCombatDetailJson.currentTime);
                                                }
                                                else {
                                                    Utils.debugInfo(consoleEnum.log, addCurrentUserJson);
                                                    Utils.outPutLog(this.outputTextarea, `【记录用户请求失败，请手动刷新或联系作者！】`, false);
                                                }
                                            }).catch((error) => {
                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                Utils.outPutLog(this.outputTextarea, `【哎呀~记录用户异常，请刷新后重新尝试或联系作者！】`, false);
                                            });
                                    }
                                    else {
                                        combatHelpConfirmStatus = petCombatV2HelpConfirmEnum.已取消;
                                        Utils.outPutLog(this.outputTextarea, `【您已主动取消战队互助功能！】`, false);
                                    }
                                }
                            }
                            else {
                                Utils.debugInfo(consoleEnum.log, getCurrentUserJson);
                                Utils.outPutLog(this.outputTextarea, `【获取当前用户信息记录请求失败，请手动刷新或联系作者！】`, false);
                            }
                        }).catch((error) => {
                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            Utils.outPutLog(this.outputTextarea, `【哎呀~获取当前用户信息记录异常，请刷新后重新尝试或联系作者！】`, false);
                        });
                }
                else {
                    Utils.outPutLog(this.outputTextarea, `【获取自己的战队信息失败，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取自己的战队信息异常，请手动刷新或联系作者！】`, false);
            });
    }
    //戳泡泡
    bulbble(enterRoomJson: any): void {
        let bubbleFloatTime = +enterRoomJson.data.bubbleFloatTime * 1000;
        let bubbleRewardData = Utils.deleteEmptyProperty(enterRoomJson.data.bubbleReward);
        let postData = JSON.stringify(bubbleRewardData);
        let timestamp = this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        const getBubbleRewardUrl = `${this.petUrl}/pet/getBubbleReward&lks=${lks}&lkt=${timestamp}`;
        setTimeout(() => {
            fetch(getBubbleRewardUrl, {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: postData
            })
                .then((res) => { return res.json() })
                .then((getBubbleRewardJson) => {
                    if (getBubbleRewardJson.success) {
                        if (!!getBubbleRewardJson.data) {
                            Utils.outPutLog(this.outputTextarea, `${new Date(+getBubbleRewardJson.currentTime).toLocaleString()} 【戳泡泡】积分：${getBubbleRewardJson.data.coin} 狗粮：${getBubbleRewardJson.data.food} 优惠券：${getBubbleRewardJson.data.couponName + getBubbleRewardJson.data.couponPrice}`, false);
                        }
                        else {
                            Utils.outPutLog(this.outputTextarea, `本次戳泡泡已完成或无奖励！`, false);
                        }
                    }
                    else {
                        Utils.debugInfo(consoleEnum.log, enterRoomJson);
                        Utils.outPutLog(this.outputTextarea, `【戳泡泡请求失败，请手动刷新或联系作者！】`, false);
                    }
                })
                .catch((error) => {
                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                    Utils.outPutLog(this.outputTextarea, `【哎呀~戳泡泡异常，请刷新后重新尝试或联系作者！】`, false);
                });
        }, 14000 + bubbleFloatTime);
    }
    //互助
    async helpFriend(currentTime: any): Promise<void> {
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        let getData = `?where=${encodeURIComponent(`{ "pin": { "$ne": "${petPin}" }}`)}`;
        await fetch(Config.BmobHost + Config.BmobUserInfoUrl + getData, { headers: Utils.getHeaders(Config.BmobUserInfoUrl, currentTime) })
            .then((res) => { return res.json() })
            .then((getOtherUserJson) => {
                if (!!getOtherUserJson.results && getOtherUserJson.results.length > 0) {
                    getOtherUserJson.results.forEach(async (item: any) => {
                        if (item.helpStatus && !item.isBlock) {
                            const enterRoomUrl = `${this.petUrl}/pet/enterRoom/h5?invitePin=${item.pin}&inviteSource=task_invite&shareSource=h5&inviteTimeStamp=${await (await this.getJDTime()).toString()}&reqSource=weapp&lks=${lks}&lkt=${timestamp}`;
                            await fetch(enterRoomUrl, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: "{}"
                            })
                                .then((res) => { return res.json() })
                                .then(async (enterRoomJson) => {
                                    if (enterRoomJson.success) {
                                        if (enterRoomJson.data.helpStatus == petTaskReceiveStatusEnum.canHelp || enterRoomJson.data.helpStatus == petTaskReceiveStatusEnum.cardExpire) {
                                            //const addUserUrl = `https://draw.jdfcloud.com//api/user/addUser?code=081zHm7A0JqZZb1kxm5A0cbn7A0zHm7M&source=UNKNOWN&type=&appId=wxccb5c536b0ecd1bf`;
                                            const helpFriendUrl = `${this.petUrl}/pet/helpFriend?friendPin=${item.pin}&reqSource=weapp&lks=${lks}&lkt=${timestamp}`;
                                            await fetch(helpFriendUrl, { credentials: "include" })
                                                .then((res) => { return res.json() })
                                                .then(async (helpFriendJson) => {
                                                    if (helpFriendJson.success && helpFriendJson.errorCode != petTaskErrorCodeEnum.helpFull) {
                                                        Utils.outPutLog(this.outputTextarea, `${new Date(+currentTime).toLocaleString()} 帮助【${enterRoomJson.data.needHelpUserNickName || item.pin}】助力成功！`, false);
                                                    }
                                                    else {
                                                        Utils.outPutLog(this.outputTextarea, `【${enterRoomJson.data.needHelpUserNickName || item.pin}】重复助力或助力失败`, false);
                                                    }
                                                    //记录明细
                                                    let postData = `{ "pin": { "__type": "Pointer", "className": "UserInfo", "objectId": "${item.objectId}" }, "help_pin": "${item.pin}", "help_status": "${helpFriendJson.errorCode}", "remark": "${helpFriendJson.errorMessage ?? ""}", "ip_address": "${await (await this.getIpAddress()).toString()}" }`;
                                                    fetch(Config.BmobHost + Config.BmobHelpFriendInfoUrl, {
                                                        method: "POST",
                                                        headers: Utils.getHeaders(Config.BmobHelpFriendInfoUrl, currentTime),
                                                        body: postData
                                                    }).then((res) => { return res.json() })
                                                        .then((addHelpInfoJson) => {
                                                            if (!!addHelpInfoJson.objectId) {

                                                            }
                                                            else {
                                                                //Utils.debugInfo(consoleEnum.log, addHelpInfoJson);
                                                                //Utils.outPutLog(this.outputTextarea, `【记录助力结果请求失败，请手动刷新或联系作者！】`, false);
                                                            }
                                                        }).catch((error) => {
                                                            //Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                            //Utils.outPutLog(this.outputTextarea, `【哎呀~记录助力结果异常，请刷新后重新尝试或联系作者！】`, false);
                                                        });
                                                }).catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~助力异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, enterRoomJson);
                                        Utils.outPutLog(this.outputTextarea, `【获取好友首页信息请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                }).catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取好友首页信息异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    });
                }
                else {
                    Utils.debugInfo(consoleEnum.log, getOtherUserJson);
                    Utils.outPutLog(this.outputTextarea, !getOtherUserJson.results ? `【获取其他用户信息记录请求失败，请手动刷新或联系作者！】` : `【暂时没有可以帮您助力的用户】`, false);
                }
            }).catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取其他用户信息记录异常，请刷新后重新尝试或联系作者！】`, false);
            });
    }
    //战队补给
    async combatSupply(supplyOrder: string): Promise<void> {
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        const combatJoinUrl = `${this.petUrl}/pet/combat/getSupplyInfo?reqSource=h5&showOrder=${(!supplyOrder ? "" : supplyOrder)}&lks=${lks}&lkt=${timestamp}`;
        await fetch(combatJoinUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then(async (getSupplyInfoJson) => {
                if (getSupplyInfoJson.success && getSupplyInfoJson.data.status == "processing") {
                    for (let i = 0; i < getSupplyInfoJson.data.marketList.length; i++) {
                        setTimeout(() => {
                            let marketData = getSupplyInfoJson.data.marketList[i];
                            if (!marketData.status) {
                                let postData = `{"showOrder":${getSupplyInfoJson.data.showOrder},"supplyType":"scan_market","taskInfo":"${marketData.marketLinkH5}","reqSource":"h5"}`;
                                const supplyUrl = `${this.petUrl}/pet/combat/supply?reqSource=h5&lks=${lks}&lkt=${timestamp}`;
                                fetch(supplyUrl, {
                                    method: "POST",
                                    mode: "cors",
                                    credentials: "include",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: postData
                                })
                                    .then((res) => { return res.json() })
                                    .then((supplyJson) => {
                                        if (supplyJson.success && supplyJson.data) {
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+supplyJson.currentTime).toLocaleString()} 成功获取${getSupplyInfoJson.data.addDistance}km战队补给！`, false);
                                        }
                                        else {
                                            Utils.debugInfo(consoleEnum.log, supplyJson);
                                            Utils.outPutLog(this.outputTextarea, `【获取战队补给失败，请手动刷新或联系作者！】！`, false);
                                        }
                                    })
                                    .catch((error) => {
                                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                        Utils.outPutLog(this.outputTextarea, `【哎呀~获取战队补给异常，请刷新后重新尝试或联系作者！】`, false);
                                    });
                            }
                        }, i * 2000);
                    }
                }
            })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取补给信息异常，请手动刷新或联系作者！】`, false);
            });
    }
    //战队互助
    async combatHelpFriend(currentTime: any): Promise<void> {
        let timestamp = +await this.getJDTime();
        let lks = `${Utils.md5Encrypt(`_${keyCode}_${timestamp}`)}`;
        let getData = `?where=${encodeURIComponent(`{ "pin": { "$ne": "${petPin}" }}`)}`;
        await fetch(Config.BmobHost + Config.BmobUserInfoUrl + getData, { headers: Utils.getHeaders(Config.BmobUserInfoUrl, currentTime) })
            .then((res) => { return res.json() })
            .then((getOtherUserJson) => {
                if (!!getOtherUserJson.results && getOtherUserJson.results.length > 0) {
                    getOtherUserJson.results.forEach(async (item: any) => {
                        if (item.combatHelpStatus && !item.isBlock) {
                            const combatDetailUrl = `${this.petUrl}/pet/combat/detail/v2?help=true&inviterPin=${item.pin}&shareSource=weapp&inviteTime=${await (await this.getJDTime()).toString()}&reqSource=weapp&openId=&lks=${lks}&lkt=${timestamp}`;
                            await fetch(combatDetailUrl, { credentials: "include" })
                                .then((res) => { return res.json() })
                                .then(async (combatDetailJson) => {
                                    if (combatDetailJson.success) {
                                        if (combatDetailJson.data.petRaceResult == petTaskReceiveStatusEnum.canHelp || combatDetailJson.data.helpStatus == petTaskReceiveStatusEnum.cardExpire) {
                                            const combatHelpFriendUrl = `${this.petUrl}/pet/combat/help?friendPin=${item.pin}&lks=${lks}&lkt=${timestamp}`;
                                            await fetch(combatHelpFriendUrl, { credentials: "include" })
                                                .then((res) => { return res.json() })
                                                .then(async (combatHelpFriendJson) => {
                                                    if (combatHelpFriendJson.success && combatHelpFriendJson.errorCode != petTaskErrorCodeEnum.helpFull) {
                                                        Utils.outPutLog(this.outputTextarea, `${new Date(+currentTime).toLocaleString()} 帮助【${combatDetailJson.data.friendNickName || item.pin}】战队助力成功！`, false);
                                                    }
                                                    else {
                                                        Utils.outPutLog(this.outputTextarea, `【${combatDetailJson.data.friendNickName || item.pin}】战队重复助力或助力失败`, false);
                                                    }
                                                    //记录明细
                                                    let postData = `{ "pin": { "__type": "Pointer", "className": "UserInfo", "objectId": "${item.objectId}" }, "help_pin": "${item.pin}", "help_status": "${combatHelpFriendJson.errorCode}", "remark": "${combatHelpFriendJson.errorMessage ?? ""}", "ip_address": "${await (await this.getIpAddress()).toString()}" }`;
                                                    fetch(Config.BmobHost + Config.BmobCombatHelpFriendInfoUrl, {
                                                        method: "POST",
                                                        headers: Utils.getHeaders(Config.BmobCombatHelpFriendInfoUrl, currentTime),
                                                        body: postData
                                                    }).then((res) => { return res.json() })
                                                        .then((addHelpInfoJson) => {
                                                            if (!!addHelpInfoJson.objectId) {

                                                            }
                                                            else {
                                                                //Utils.debugInfo(consoleEnum.log, addHelpInfoJson);
                                                                //Utils.outPutLog(this.outputTextarea, `【记录助力结果请求失败，请手动刷新或联系作者！】`, false);
                                                            }
                                                        }).catch((error) => {
                                                            //Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                            //Utils.outPutLog(this.outputTextarea, `【哎呀~记录助力结果异常，请刷新后重新尝试或联系作者！】`, false);
                                                        });
                                                }).catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~战队助力异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, combatDetailJson);
                                        Utils.outPutLog(this.outputTextarea, `【获取好友战队首页信息请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                }).catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取好友战队首页信息异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    });
                }
                else {
                    Utils.debugInfo(consoleEnum.log, getOtherUserJson);
                    Utils.outPutLog(this.outputTextarea, !getOtherUserJson.results ? `【获取其他用户信息记录请求失败，请手动刷新或联系作者！】` : `【暂时没有可以帮您助力的用户】`, false);
                }
            }).catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取其他用户信息记录异常，请刷新后重新尝试或联系作者！】`, false);
            });
    }
    //计算狗粮克数
    smartFeedCount(): number {
        const limit = 12;
        const feedCountArray = [+feedGramsEnum.eighty, +feedGramsEnum.forty, +feedGramsEnum.twenty, +feedGramsEnum.ten];

        let feedCount = 10;
        let petFood = document.getElementById('petFood');

        if (!!petFood && !!+petFood!.innerText) {
            let result = Math.floor(+petFood!.innerText / limit);
            feedCountArray.some((count) => {
                if (result >= count) {
                    feedCount = count;
                    return true;
                }
            });
        }

        return feedCount;
    }
    //获取京东服务器时间
    getJDTime(): Promise<number> {
        return fetch(Config.JDTimeInfoURL)
            .then(function (response) { return response.json() })
            .then(function (res) { return res.time; })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                return new Date().getTime();
            });
    }
    //获取ip地址
    getIpAddress(): Promise<string> {
        return fetch(Config.WhoisURL)
            .then(function (res) { return res.json() })
            .then(function (json) { return json.ip; })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                return "";
            });
    }
    //获取cookie
    getCookie(key: string): string {
        var t, r = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
        return (t = document.cookie.match(r)) ? unescape(t[2]) : ""
    }
    //根据字母排序
    sortByLetter(e: any, t: any = undefined): string {
        if (e instanceof Array) {
            t = t || [];
            for (var a = 0; a < e.length; a++)
                t[a] = this.sortByLetter(e[a], t[a])
        } else
            !(e instanceof Array) && e instanceof Object ? (t = t || {},
                Object.keys(e).sort().map(function (a) {
                    t[a] = JdJoy.prototype.sortByLetter(e[a], t[a])
                })) : t = e;
        return t
    }
}