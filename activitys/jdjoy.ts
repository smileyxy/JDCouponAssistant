import Activity from "../interface/Activity";
import Utils from "../utils/utils";
import Config from "../config/config";
import { consoleEnum, feedGramsEnum, feedEnum, feedAutoButtonEnum, petTaskEnum } from '../utils/enums';

let feedSpan = 0,
    feedInterval = 0,
    lastFeedStamp = 0,
    nextFeedStamp = 0,
    nextIntervalStamp = 0;
const defaultFeedSpan: number = 10800000;

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
        this.outputTextarea.value = `哎呀~助手初始化错误，请刷新后重新尝试或联系作者！`;

        Config.debug = true;
    }

    get(): void {
        this.vaild().then(async (valid) => {
            if (valid) {
                this.page();
                this.list();
                await this.info();
            }
        });
    }

    list(): void {
        //手动刷新
        const refresh = document.querySelector('.refresh');
        refresh!.addEventListener('click', () => {
            this.info();
        });
        //自动喂养
        let feedAuto = document.querySelector('.feedAuto') as HTMLButtonElement,
            nextFeedTime = document.getElementById('nextFeedTime');

        feedAuto!.addEventListener('click', () => {
            //验证克数
            let gramsSelect = document.getElementById('feedGrams') as HTMLSelectElement;
            let gramsSelectOptions = gramsSelect.options[gramsSelect.selectedIndex];
            if (!gramsSelectOptions || !gramsSelectOptions.value) {
                alert("请选择克数！");
                return false;
            }
            //验证喂养间隔
            const reg = /^[1-9]\d*$/;
            let feedSpanInput = document.getElementById('feedSpan') as HTMLInputElement;
            if (!!feedSpanInput.value && !reg.test(feedSpanInput.value)) {
                alert("请检查喂养间隔是否为正整数！");
                return false;
            }

            feedSpan = (+feedSpanInput!.value || defaultFeedSpan);
            
            gramsSelect.disabled = !gramsSelect.disabled;
            feedSpanInput.disabled = !feedSpanInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                if (feedAuto.innerHTML == feedAutoButtonEnum.feedStart) {
                    feedAuto.innerHTML = feedAutoButtonEnum.feedStop;
                    Utils.outPutLog(this.outputTextarea, `${new Date(+currentJDTime).toLocaleString()} 已开启自动喂养！`);

                    let timeDiff = feedSpan - +currentJDTime + lastFeedStamp + Utils.random(60000, 300000);
                    if (timeDiff > 0) {
                        nextFeedStamp = +currentJDTime + timeDiff;
                        nextFeedTime!.innerText = new Date(nextFeedStamp).toLocaleString();

                        setTimeout(() => {
                            this.getJDTime().then((feedTime) => {
                                nextIntervalStamp = feedSpan + Utils.random(60000, 300000);
                                nextFeedStamp = +feedTime + nextIntervalStamp;
                                this.feed(gramsSelectOptions.value);

                                feedInterval = setInterval(() => {
                                    this.getJDTime().then((currentFeedTime) => {
                                        nextFeedStamp = +currentFeedTime + nextIntervalStamp;
                                        this.feed(gramsSelectOptions.value);
                                    });
                                }, nextIntervalStamp);
                            });
                        }, timeDiff);
                    }
                    else {
                        nextIntervalStamp = feedSpan + Utils.random(60000, 300000);
                        nextFeedStamp = +currentJDTime + nextIntervalStamp;
                        this.feed(gramsSelectOptions.value);

                        feedInterval = setInterval(() => {
                            this.getJDTime().then((currentFeedTime) => {
                                nextFeedStamp = +currentFeedTime + nextIntervalStamp;
                                this.feed(gramsSelectOptions.value);
                            });
                        }, nextIntervalStamp);
                    }
                }
                else {
                    nextFeedStamp = 0;
                    feedAuto.innerHTML = feedAutoButtonEnum.feedStart;
                    clearInterval(feedInterval);
                    Utils.outPutLog(this.outputTextarea, `${new Date(+currentJDTime).toLocaleString()} 已关闭自动喂养！`);

                    this.info(false);
                }
            });
        });
    }

    vaild(): Promise<boolean> {
        //验证用户登录状态及宠物领养状态
        let isValid = false;
        const userBasicInfoUrl = 'https://jdjoy.jd.com/pet/getUserBasicInfo';
        return fetch(userBasicInfoUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((json) => {
                if (json.success) {
                    if (json.data.petExist) {
                        isValid = !isValid;
                        this.outputTextarea.value = "";
                    }
                    else {
                        Utils.debugInfo(consoleEnum.log, json);
                        this.outputTextarea.value = `你还没有领养过狗子，请领养后再来！`;
                    }
                }
                else {
                    Utils.debugInfo(consoleEnum.log, json);
                    this.outputTextarea.value = `请确认你已在此浏览器上成功登录京东手机端！`;
                }

                return isValid;
            }).catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                this.outputTextarea.value = `哎呀~用户信息异常，请刷新后重新尝试或联系作者！`;

                return isValid;
            });
    }

    page(): void {
        //宠物信息
        const petContent = document.createElement("div");
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
                                    <td style="width: 150vw;text-align: -webkit-left;">已喂养总数：<span id="feedTotal" style="color: #FF69B4;">-</span></td>
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
        this.container.appendChild(petContent);
        //功能按键
        const btnContent = document.createElement("div");
        btnContent.id = 'functionButton';
        let btnInfo = `
                        <div style="border: 1px solid #000;margin:10px;font-weight:bold">
                            <div><h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>功能按键</h3></div>
                            <table style="font-size: 12px;padding-left: 4px;">
                                <tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;">
                                        <div style="width: 24vw;">
                                            <label>克数：</label>
                                            <select id="feedGrams" style="width: 13vw;">
                                                <option value="${feedGramsEnum.ten}">${feedGramsEnum.ten}g</option>
                                                <option value="${feedGramsEnum.twenty}">${feedGramsEnum.twenty}g</option>
                                                <option value="${feedGramsEnum.forty}" selected="selected">${feedGramsEnum.forty}g</option>
                                                <option value="${feedGramsEnum.eighty}">${feedGramsEnum.eighty}g</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left;">
                                        <input id="feedSpan" style="width:37vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: block;" placeholder = "喂养间隔【默认:${defaultFeedSpan / 3600000}小时】" />
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="feedAuto" style="width: 22vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block;font-size: 12px;line-height: 0;">自动喂养</button>
                                    </td>
                                </tr>                                
                                <tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;">
                                    </td>
                                    <td style="width: 100vw;text-align: -webkit-left;">
                                        <button class="taskAuto" style="width: 38vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#c1c1c1;margin:5px auto;display:block;font-size: 12px;line-height: 0;">自动任务（开发中）</button>
                                    </td>
                                </tr>
                                <tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;">
                                    </td>
                                    <td style="width: 100vw;text-align: -webkit-left;">
                                        <button class="helpAuto" style="width: 38vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#c1c1c1;margin:5px auto;display:block;font-size: 12px;line-height: 0;">自动帮喂（开发中）</button>
                                    </td>
                                </tr>
                            </table>
                        </div>`;
        btnContent.innerHTML = btnInfo;
        btnContent.style.display = 'none';
        this.container.appendChild(btnContent);
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
            .then((json) => {
                if (json.success) {
                    petLevel!.innerText = json.data.petLevel;
                    petCoin!.innerText = json.data.petCoin;
                    petFood!.innerText = json.data.petFood;
                    feedTotal!.innerText = json.data.feedCount;
                    lastFeedStamp = +json.data.lastFeedTime;
                    lastFeedTime!.innerText = new Date(lastFeedStamp).toLocaleString();
                    if (nextFeedStamp > 0) {
                        nextFeedTime!.innerText = new Date(nextFeedStamp).toLocaleString();
                    }
                }
                else {
                    isGetAllInfo = !isGetAllInfo;
                    Utils.debugInfo(consoleEnum.log, json);
                    Utils.outPutLog(this.outputTextarea, `没有查找到你的狗窝信息，请手动刷新或联系作者！`);
                }
            })
            .catch((error) => {
                isGetAllInfo = !isGetAllInfo;
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `哎呀~狗窝信息异常，请手动刷新或联系作者！`);
            });
        //获取好友信息
        const getFriendsUrl = 'https://jdjoy.jd.com/pet/getFriends?itemsPerPage=20&currentPage=1';
        await fetch(getFriendsUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((json) => {
                if (json.success) {
                    friendCount!.innerText = json.page.items;
                }
                else {
                    isGetAllInfo = !isGetAllInfo;
                    Utils.debugInfo(consoleEnum.log, json);
                    Utils.outPutLog(this.outputTextarea, `没有查找到你的好友信息，请手动刷新或联系作者！`);
                }
            })
            .catch((error) => {
                isGetAllInfo = !isGetAllInfo;
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `哎呀~好友信息异常，请手动刷新或联系作者！`);
            });
        //获取今日喂养信息
        const getTodayFeedInfoUrl = 'https://jdjoy.jd.com/pet/getTodayFeedInfo';
        await fetch(getTodayFeedInfoUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((json) => {
                if (json.success) {
                    feedCount!.innerText = json.data.feedCount;
                }
                else {
                    isGetAllInfo = !isGetAllInfo;
                    Utils.debugInfo(consoleEnum.log, json);
                    Utils.outPutLog(this.outputTextarea, `没有查找到你的喂养信息，请手动刷新或联系作者！`);
                }
            })
            .catch((error) => {
                isGetAllInfo = !isGetAllInfo;
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `哎呀~喂养信息异常，请手动刷新或联系作者！`);
            });

        if (isGetAllInfo && tipsShow) {
            document.getElementById('functionButton')!.style.display = '';
            this.getJDTime().then((currentJDTime) => {
                Utils.outPutLog(this.outputTextarea, `${new Date(+currentJDTime).toLocaleString()} 宠物信息获取成功！`);
            });
        }
    }

    async feed(grams: string | number): Promise<void> {
        //喂养
        const enterRoomUrl = `https://jdjoy.jd.com/pet/feed?feedCount=${grams}`;
        await fetch(enterRoomUrl, { credentials: "include" })
            .then((res) => { return res.json() })
            .then((json) => {
                if (json.success) {
                    switch (json.errorCode) {
                        case feedEnum.feedOk:
                        case feedEnum.levelupgrade:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+json.currentTime).toLocaleString()} 喂养成功！`);
                            break;
                        case feedEnum.timeerror:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+json.currentTime).toLocaleString()} 已经喂养过狗子了！`);
                            Utils.debugInfo(consoleEnum.log, json);
                            break;
                        case feedEnum.foodinsufficient:
                            Utils.outPutLog(this.outputTextarea, `${new Date(+json.currentTime).toLocaleString()} 狗子的粮食吃空了！`);
                            Utils.debugInfo(consoleEnum.log, json);
                            break;
                        default:
                            Utils.debugInfo(consoleEnum.log, json);
                            Utils.outPutLog(this.outputTextarea, `${new Date(+json.currentTime).toLocaleString()} 喂养失败！`);
                            break;
                    }
                }
                else {
                    Utils.debugInfo(consoleEnum.log, json);
                    Utils.outPutLog(this.outputTextarea, `${new Date(+json.currentTime).toLocaleString()} ${json.errorMessage}！`);
                }
            })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `哎呀~喂养发生异常，请刷新后重新尝试或联系作者！`);
            });

        this.info(false);
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