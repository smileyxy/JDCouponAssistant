import Activity from "../interface/Activity";
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
    petFriendsStatusEnum
} from '../enum/gameType';

let petPin = "",
    feedSpan = 0,
    feedInterval = 0,
    lastFeedStamp = 0,
    nextFeedStamp = 0,
    nextFeedInterval = 0,
    taskTiming = 0,
    taskSpan = 0,
    taskInterval = 0,
    actSpan = 0,
    actInterval = 0,
    helpSpan = 0,
    helpInterval = 0,
    investTreasureInterval = 0;
let taskTimeoutArray: any[] = [],
    actTimeoutArray: any[] = [],
    helpTimeoutArray: any[] = [];
const defaultFeedSpan: number = 10800000, //3小时
    defaultTaskTiming: string = '06:00',
    defaultTaskDetection: number = 3600000, //1小时
    defaultActDetection: number = 3600000, //1小时
    defaultHelpDetection: number = 14400000; //4小时

export default class JdJoy implements Activity {
    url: string = "https://api.m.jd.com/client.action";
    params: any;
    data: any;
    container: HTMLDivElement;
    outputTextarea: HTMLTextAreaElement;
    constructor(params: any, containerDiv: HTMLDivElement, outputTextarea: HTMLTextAreaElement) {
        this.params = params;
        this.container = containerDiv;
        this.outputTextarea = outputTextarea;
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
        const userBasicInfoUrl = 'https://jdjoy.jd.com/pet/getUserBasicInfo';
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
                        <div style="border: 1px solid #000;margin: 10px;font-weight: bold;line-height: 2;">
                            <div><h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>宠物信息</h3></div>
                            <table style="font-size: 12px;padding-left: 18%;">
                                <tr> 
                                    <td style="width: 150vw;text-align: -webkit-left;">宠物等级：<span id="petLevel" style="color: #FF69B4;">-</span></td>
                                    <td style="width: 150vw;text-align: -webkit-left;">当前积分：<span id="petCoin" style="color: #FF69B4;">-</div></td> 
                                </tr>
                                <tr> 
                                    <td style="width: 150vw;text-align: -webkit-left;">剩余狗粮：<span id="petFood" style="color: #FF69B4;">-</span></td>
                                    <td style="width: 150vw;text-align: -webkit-left;">好友数量：<span id="friendCount" style="color: #FF69B4;">-</span></td> 
                                </tr>
                                <tr> 
                                    <td style="width: 150vw;text-align: -webkit-left;">当前等级喂养总数：<span id="feedTotal" style="color: #FF69B4;">-</span></td>
                                    <td style="width: 150vw;text-align: -webkit-left;">今日喂养数：<span id="feedCount" style="color: #FF69B4;">-</span></td> 
                                </tr>
                            </table>
                            <div style="width: 70vw;text-align: -webkit-left;font-size: 12px;padding-left: 18%;margin-left: 1.5px;">
                                最后喂养时间：<span id="lastFeedTime" style="color: #FF69B4;">-</span>
                            </div>
                            <div style="width: 70vw;text-align: -webkit-left;font-size: 12px;padding-left: 18%;margin-left: 1.5px;">
                                下次喂养时间：<span id="nextFeedTime" style="color: #FF69B4;">-</span>
                            </div>
                            <div style="margin-top: 10px;">
                                <button class="refresh" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 14px;line-height: 0;">手动刷新</button>
                            </div>
                        </div>`;
        petContent.innerHTML = petInfo;
        petContent.style.display = 'none';
        this.container.appendChild(petContent);
        //使用帮助
        const helpContent = document.createElement("div");
        helpContent.id = 'usingHelp';
        let helpInfo = `<div style="border: 1px solid #000;margin:10px;font-weight:bold">
                            <div>
                                <h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>使用帮助</h3>
                            </div>
                            <div style="display: inline-block;font-size: 14px;color: #FF69B4;margin: auto 10px auto 10px;">
                                <details>
                                    <summary style="outline: 0;">自动喂养</summary>
                                    <p style="font-size: 12px;">根据所填项每天进行喂食；喂养间隔：默认${defaultFeedSpan / 3600000}小时。</p>
                                </details>
                                <details>
                                    <summary style="outline: 0;">自动活动</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成活动；检测频率：默认${defaultActDetection / 3600000}小时。</p>
                                </details>
                                <details>
                                    <summary style="outline: 0;">自动串门</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成串门（帮助喂养、偷取狗粮、获取金币）；检测频率：默认${defaultHelpDetection / 3600000}小时。</p>
                                </details>
                                <details>
                                    <summary style="outline: 0;">自动任务</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成任务（除每日签到及邀请用户）；任务定时：默认${defaultTaskTiming}后；检测频率：默认${defaultTaskDetection / 60000}分钟。</p>
                                </details> 
                            </div>
                        </div>`;
        helpContent.innerHTML = helpInfo;
        helpContent.style.display = 'none';
        this.container.appendChild(helpContent);
        //功能按键
        const btnContent = document.createElement("div");
        btnContent.id = 'functionButton';
        let btnInfo = `
                        <div style="border: 1px solid #000;margin:10px;font-weight:bold">
                            <div>
                                <h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>功能按键</h3>
                            </div>
                            <table style="font-size: 12px;padding-left: 4px;">
                                <tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;">
                                        <div style="width: 24vw;">
                                            <select id="feedGrams" style="width: 23.5vw;">
                                                <option value="${feedGramsEnum.ten}">${feedGramsEnum.ten}g</option>
                                                <option value="${feedGramsEnum.twenty}">${feedGramsEnum.twenty}g</option>
                                                <option value="${feedGramsEnum.forty}" selected="selected">${feedGramsEnum.forty}g</option>
                                                <option value="${feedGramsEnum.eighty}">${feedGramsEnum.eighty}g</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;">
                                        <input id="feedSpan" style="width:37vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: block;" placeholder = "喂养间隔" />
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="feedAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 12px;line-height: 0;">自动喂养</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 80vw;text-align: -webkit-left;">
                                        <div style="width: 24vw;">
                                            <select id="actType" style="width: 23.5vw;">
                                                <option value="${petActEnum.全部}" selected="selected">全部</option>
                                                <option value="${petActEnum.逛店拿积分}">逛店拿积分</option>
                                                <option value="${petActEnum.戳泡泡}">戳泡泡</option>
                                                <option value="${petActEnum.聚宝盆终极大奖}">聚宝盆终极大奖</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;">
                                        <input id="actDetection" style="width:37vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: block;" placeholder = "检测频率" />
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="actAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 12px;line-height: 0;">自动活动</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 80vw;text-align: -webkit-left;">
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
                                        <button class="helpAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 12px;line-height: 0;">自动串门</button>
                                    </td>
                                </tr>
                                <tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;">
                                        <div style="width: 24vw;">
                                            <select id="taskType" style="width: 23.5vw;">
                                                <option value="${petTaskEnum.全部}" selected="selected">全部</option>
                                                <option value="${petTaskEnum.每日三餐}">每日三餐</option>
                                                <option value="${petTaskEnum.浏览频道}">浏览频道</option>
                                                <option value="${petTaskEnum.关注商品}">关注商品</option>
                                                <option value="${petTaskEnum.关注店铺}">关注店铺</option>
                                                <option value="${petTaskEnum.逛会场}">逛会场</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;display: inline">
                                        <input id="taskTiming" type="time" value="${defaultTaskTiming}" style="width:23.5vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;">
                                        <input id="taskDetection" style="width:12.8vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;" placeholder = "检测频率">
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="taskAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 12px;line-height: 0;">自动任务</button>
                                    </td>
                                </tr>
                            </table>
                        </div>`;
        btnContent.innerHTML = btnInfo;
        btnContent.style.display = 'none';
        this.container.appendChild(btnContent);
    }

    list(): void {
        //手动刷新
        const refresh = _$('.refresh');
        refresh!.addEventListener('click', () => {
            this.info();
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
                let currentJDDate = new Date(+currentJDTime);
                if (feedAuto.innerHTML == petButtonEnum.feedStart) {
                    feedAuto.innerHTML = petButtonEnum.feedStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动喂养！`, false);

                    let timeDiff = feedSpan - +currentJDTime + lastFeedStamp + Utils.random(60000, 300000);
                    if (timeDiff > 0) {
                        nextFeedStamp = +currentJDTime + timeDiff;
                        nextFeedTime!.innerText = new Date(nextFeedStamp).toLocaleString();

                        setTimeout(() => {
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
            taskSpan = ((+taskDetectionInput!.value * 60000) || defaultTaskDetection);

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
                let currentJDDate = new Date(+currentJDTime);
                if (actAuto.innerHTML == petButtonEnum.actStart) {
                    actAuto.innerHTML = petButtonEnum.actStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动活动！`, false);

                    this.activity(typeSelectOptions.value);
                    actInterval = setInterval(() => {
                        this.activity(typeSelectOptions.value);
                    }, actSpan);
                }
                else {
                    actAuto.innerHTML = petButtonEnum.actStart;
                    clearInterval(actInterval);
                    clearInterval(investTreasureInterval);
                    actTimeoutArray.forEach((timeout) => { clearTimeout(timeout); });
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

                    this.help(typeSelectOptions.value);
                    helpInterval = setInterval(() => {
                        this.help(typeSelectOptions.value);
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
    }

    async info(tipsShow: boolean = true): Promise<void> {
        let isGetAllInfo = true,
            petLevel = document.getElementById('petLevel'),
            petCoin = document.getElementById('petCoin'),
            petFood = document.getElementById('petFood'),
            friendCount = document.getElementById('friendCount'),
            feedTotal = document.getElementById('feedTotal'),
            feedCount = document.getElementById('feedCount'),
            lastFeedTime = document.getElementById('lastFeedTime'),
            nextFeedTime = document.getElementById('nextFeedTime');

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
        const enterRoomUrl = 'https://jdjoy.jd.com/pet/enterRoom?reqSource=h5&invitePin=';
        await fetch(enterRoomUrl, { credentials: "include" })
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
                }
                else {
                    isGetAllInfo = !isGetAllInfo;
                    Utils.debugInfo(consoleEnum.log, enterRoomJson);
                    Utils.outPutLog(this.outputTextarea, `【狗窝信息请求失败，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                isGetAllInfo = !isGetAllInfo;
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~狗窝信息异常，请手动刷新或联系作者！】`, false);
            });
        //获取好友信息
        const getFriendsUrl = 'https://jdjoy.jd.com/pet/getFriends?itemsPerPage=20&currentPage=1';
        await fetch(getFriendsUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((friendsJson) => {
                if (friendsJson.success) {
                    friendCount!.innerText = friendsJson.page.items;
                }
                else {
                    isGetAllInfo = !isGetAllInfo;
                    Utils.debugInfo(consoleEnum.log, friendsJson);
                    Utils.outPutLog(this.outputTextarea, `【没有查找到你的好友信息，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                isGetAllInfo = !isGetAllInfo;
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~查询好友信息异常，请手动刷新或联系作者！】`, false);
            });
        //获取今日喂养信息
        const getTodayFeedInfoUrl = 'https://jdjoy.jd.com/pet/getTodayFeedInfo';
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
    //喂养
    async feed(grams: string | number): Promise<void> {
        const enterRoomUrl = `https://jdjoy.jd.com/pet/feed?feedCount=${grams}`;
        await fetch(enterRoomUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((feedJson) => {
                if (feedJson.success) {
                    switch (feedJson.errorCode) {
                        case feedEnum.feedOk:
                        case feedEnum.levelUpgrade:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+feedJson.currentTime).toLocaleString()} 喂养成功！`, false);
                            break;
                        case feedEnum.timeError:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+feedJson.currentTime).toLocaleString()} 已经喂养过狗子了！`, false);
                            Utils.debugInfo(consoleEnum.log, feedJson);
                            break;
                        case feedEnum.foodInsufficient:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+feedJson.currentTime).toLocaleString()} 狗子的粮食吃空了！`, false);
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
        const getPetTaskConfigUrl = `https://jdjoy.jd.com/pet/getPetTaskConfig?reqSource=h5`;
        await fetch(getPetTaskConfigUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then(async (petTaskConfigJson) => {
                if (petTaskConfigJson.success) {
                    let taskTimeout = 0;
                    let threeMealsData: any,
                        followChannelData: any,
                        followGoodData: any,
                        followShopData: any,
                        scanMarketData: any;
                    for (let i = 0; i < petTaskConfigJson.datas.length; i++) {
                        switch (petTaskConfigJson.datas[i].taskType) {
                            case petTaskEnum.每日三餐:
                                threeMealsData = petTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.浏览频道:
                                followChannelData = petTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.关注商品:
                                followGoodData = petTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.关注店铺:
                                followShopData = petTaskConfigJson.datas[i];
                                break;
                            case petTaskEnum.逛会场:
                                scanMarketData = petTaskConfigJson.datas[i];
                                break;
                        }
                    }

                    if (taskType == petTaskEnum.每日三餐 || taskType == petTaskEnum.全部) {
                        if (!!threeMealsData && threeMealsData.receiveStatus == petTaskReceiveStatusEnum.unReceive) {
                            let joinedCount = +threeMealsData.joinedCount,
                                taskChance = +threeMealsData.taskChance;
                            const getFoodUrl = `https://jdjoy.jd.com/pet/getFood?taskType=ThreeMeals`;
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
                            const getFollowChannelsUrl = `https://jdjoy.jd.com/pet/getFollowChannels`;
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
                                                    const scanUrl = `https://jdjoy.jd.com/pet/scan`;
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
                                        const followGoodUrl = `https://jdjoy.jd.com/pet/followGood`;
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
                            const getFollowShopsUrl = `https://jdjoy.jd.com/pet/getFollowShops`;
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
                                                    const followShopUrl = `https://jdjoy.jd.com/pet/followShop`;
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
                                    taskTimeoutArray.push(setTimeout(() => {
                                        let postData = `{"marketLink":"${scanMarketListData.marketLinkH5}","taskType":"${petTaskEnum.逛会场}","reqSource":"h5"}`;
                                        const scanUrl = `https://jdjoy.jd.com/pet/scan`;
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
                }
                else {
                    Utils.debugInfo(consoleEnum.log, petTaskConfigJson);
                    Utils.outPutLog(this.outputTextarea, `【任务信息请求失败，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取任务信息异常，请刷新后重新尝试或联系作者！】`, false);
            });
    }
    //活动
    async activity(actType: string): Promise<void> {
        let actTimeout = 0;
        if (actType == petActEnum.逛店拿积分 || actType == petActEnum.全部) {
            const getDeskGoodDetailsUrl = `https://jdjoy.jd.com/pet/getDeskGoodDetails`;
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
                                        let postData = `{"taskType":"${petActEnum.逛店拿积分}","sku":"${deskGoodsData.sku}"}`;
                                        const scanUrl = `https://jdjoy.jd.com/pet/scan`;
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
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} 【${followCount}/${taskChance}】逛年货成功！`, false);
                                                            break;
                                                        case petTaskErrorCodeEnum.followRepeat:
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "此年货今日已逛"}`, false);
                                                            break;
                                                        default:
                                                            Utils.outPutLog(this.outputTextarea, `${new Date(+scanJson.currentTime).toLocaleString()} ${scanJson.errorMessage || "无此年货或已过期"}`, false);
                                                            break;
                                                    }
                                                }
                                                else {
                                                    Utils.debugInfo(consoleEnum.log, scanJson);
                                                    Utils.outPutLog(this.outputTextarea, `【逛年货请求失败，请手动刷新或联系作者！】`, false);
                                                }
                                            })
                                            .catch((error) => {
                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                Utils.outPutLog(this.outputTextarea, `【哎呀~逛年货异常，请刷新后重新尝试或联系作者！】`, false);
                                            });
                                    }, actTimeout));
                                    actTimeout += Utils.random(5000, 10000);
                                }
                            }
                        }
                    }
                    else {
                        Utils.debugInfo(consoleEnum.log, deskGoodDetailsJson);
                        Utils.outPutLog(this.outputTextarea, `【逛年货活动信息请求失败，请手动刷新或联系作者！】`, false);
                    }
                })
                .catch((error) => {
                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取逛年货活动信息异常，请刷新后重新尝试或联系作者！】`, false);
                });
        }
        if (actType == petActEnum.聚宝盆终极大奖 || actType == petActEnum.全部) {
            if (!investTreasureInterval || investTreasureInterval == 0) {
                const investTreasureUrl = 'https://jdjoy.jd.com/pet/investTreasure';
                investTreasureInterval = setInterval(() => {
                    let localeDate = +Utils.formatDate3(new Date().getTime().toString())
                    if (localeDate >= 5958000 && localeDate <= 10000000) {
                        this.getJDTime().then((currentJDTime) => {
                            let serverDate = +Utils.formatDate3(currentJDTime.toString());
                            if (serverDate >= 5959400 && serverDate <= 10000000) {
                                fetch(investTreasureUrl, { credentials: "include" })
                                    .then((res) => { return res.json() })
                                    .then((investTreasureJson) => {
                                        if (investTreasureJson.success) {
                                            Utils.debugInfo(consoleEnum.log, investTreasureJson);
                                            Utils.outPutLog(this.outputTextarea, `${new Date(+investTreasureJson.currentTime).toLocaleString()} 已尝试聚宝盆终极大奖！`, false);
                                        }
                                        else {
                                            Utils.debugInfo(consoleEnum.log, investTreasureJson);
                                            Utils.outPutLog(this.outputTextarea, `【聚宝盆终极大奖请求失败，请手动刷新或联系作者！】`, false);
                                        }

                                        clearInterval(investTreasureInterval);
                                    })
                                    .catch((error) => {
                                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                        Utils.outPutLog(this.outputTextarea, `【哎呀~聚宝盆终极大奖异常，请手动刷新或联系作者！】`, false);
                                    });
                            }
                        });
                    }
                }, 200);
            }
        }
        if (actType == petActEnum.戳泡泡 || actType == petActEnum.全部) {
            const enterRoomUrl = 'https://jdjoy.jd.com/pet/enterRoom?reqSource=h5&invitePin=';
            fetch(enterRoomUrl, { credentials: "include" })
                .then((res) => { return res.json() })
                .then((enterRoomJson) => {
                    if (enterRoomJson.success) {
                        if (enterRoomJson.data.bubbleOpen || !!enterRoomJson.data.bubbleReward) {
                            Utils.debugInfo(consoleEnum.log, `获得戳泡泡资格：${enterRoomJson}`);
                            let postData = `{"couponStock":${enterRoomJson.data.bubbleReward.couponStock},"coinStock":${enterRoomJson.data.bubbleReward.coinStock},"foodStock":${enterRoomJson.data.bubbleReward.foodStock}}`;
                            const getBubbleRewardUrl = `https://jdjoy.jd.com/pet/getBubbleReward`;
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
                                    Utils.debugInfo(consoleEnum.log, `戳泡泡结果：${getBubbleRewardJson}`);
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~戳泡泡异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }
                    else {
                        Utils.debugInfo(consoleEnum.log, enterRoomJson);
                        Utils.outPutLog(this.outputTextarea, `【获取戳泡泡信息请求失败，请手动刷新或联系作者！】`, false);
                    }
                })
                .catch((error) => {
                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                    Utils.outPutLog(this.outputTextarea, `【哎呀~获取戳泡泡信息异常，请手动刷新或联系作者！】`, false);
                });
        }
    }
    //串门
    async help(helpType: string): Promise<void> {
        let currentPage = 1,
            pages = -1,
            helpTimeout = 0;
        while (pages == -1 || currentPage <= pages) {
            const getFriendsUrl = `https://jdjoy.jd.com/pet/getFriends?itemsPerPage=20&currentPage=${currentPage}`;
            await fetch(getFriendsUrl, { credentials: "include" })
                .then((res) => { return res.json() })
                .then((getFriendsJson) => {
                    if (getFriendsJson.success) {
                        pages = getFriendsJson.page.pages;
                        for (let i = 0; i < getFriendsJson.datas.length; i++) {
                            let currentFriend = getFriendsJson.datas[i];
                            if (currentFriend.friendPin != petPin) {
                                helpTimeoutArray.push(setTimeout(async () => {
                                    const enterFriendRoomUrl = `https://jdjoy.jd.com/pet/enterFriendRoom?friendPin=${encodeURIComponent(currentFriend.friendPin)}`;
                                    await fetch(enterFriendRoomUrl, { credentials: "include" })
                                        .then((res) => { return res.json() })
                                        .then(async (enterFriendRoomJson) => {
                                            if (enterFriendRoomJson.success) {
                                                if (helpType == petHelpEnum.帮助喂养 || helpType == petHelpEnum.全部) {
                                                    if (currentFriend.status == petFriendsStatusEnum.notfeed) {
                                                        const helpFeedUrl = `https://jdjoy.jd.com/pet/helpFeed?friendPin=${encodeURIComponent(currentFriend.friendPin)}`;
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
                                                        const getRandomFoodUrl = `https://jdjoy.jd.com/pet/getRandomFood?friendPin=${encodeURIComponent(currentFriend.friendPin)}`;
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
                                                        const getFriendCoinUrl = `https://jdjoy.jd.com/pet/getFriendCoin?friendPin=${encodeURIComponent(currentFriend.friendPin)}`;
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
                        }

                        currentPage++;
                    }
                    else {
                        Utils.debugInfo(consoleEnum.log, getFriendsJson);
                        Utils.outPutLog(this.outputTextarea, `【没有查找到你的好友信息，请手动刷新或联系作者！】`, false);
                    }
                })
                .catch((error) => {
                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                    Utils.outPutLog(this.outputTextarea, `【哎呀~查询好友信息异常，请手动刷新或联系作者！】`, false);
                });
        }
    }

    getJDTime(): Promise<number> {
        //获取京东服务器时间
        return fetch(Config.JDTimeInfoURL)
            .then(function (response) { return response.json() })
            .then(function (res) { return res.time; })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                return new Date().getTime();
            });
    }
}