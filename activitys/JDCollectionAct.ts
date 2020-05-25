import fj from "../utils/fetch-jsonp";
import Activity from "../interface/Activity";
import Utils, { _$ } from "../utils/utils";
import Config from "../config/config";
import { consoleEnum } from '../enum/commonType';
import {
    cakeBakerTaskEnum,
    cakeBakerButtonEnum
} from '../enum/activityType';

let cakeBakerTiming = "",
    cakeBakerSpan = 0,
    cakeBakerInterval = 0;
let cakeBakerTimeoutArray: any[] = [];
const defaultCakeBakerTiming: string = '06:00',
    defaultCakeBakerDetection: number = 3600000; //1小时

export default class jdCollectionAct implements Activity {
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
        //this.outputTextarea.value = `当你看到这行文字时，说明你还没有配置好浏览器UA或者还没有登录京东帐号！`;

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
        const helpContent = document.createElement("div");
        helpContent.id = 'usingHelp';
        let helpInfo = `
                        <div style="border-top: 1px solid #000;font-weight:bold;line-height: 1.6;">
                            <div>
                                <h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin: 5px;'>使用帮助</h3>
                            </div>
                            <div style="display: inline-block;font-size: 14px;color: #FF69B4;margin: auto 10px 10px 10px;">
                                <details>
                                    <summary style="outline: 0;">自动蛋糕</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成叠蛋糕任务；任务定时：默认${defaultCakeBakerTiming}之后；检测频率：默认${defaultCakeBakerDetection / 3600000}小时。</p>
                                </details>
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
                                <tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="cakeBakerType" style="width: 23.5vw;">
                                                <option value="${cakeBakerTaskEnum.全部}" selected="selected">全部</option>
                                                <option value="${cakeBakerTaskEnum.叠蛋糕}">小精灵</option>
                                                <option value="${cakeBakerTaskEnum.小精灵}">小精灵</option>
                                                <option value="${cakeBakerTaskEnum.签到}">签到</option>
                                                <option value="${cakeBakerTaskEnum.逛主会场}">逛主会场</option>
                                                <option value="${cakeBakerTaskEnum.去逛商品}">去逛商品</option>
                                                <option value="${cakeBakerTaskEnum.浏览游戏1}">浏览游戏1</option>
                                                <option value="${cakeBakerTaskEnum.浏览游戏2}">浏览游戏2</option>
                                                <option value="${cakeBakerTaskEnum.浏览频道}">浏览频道</option>
                                                <option value="${cakeBakerTaskEnum.浏览会场}">浏览会场</option>
                                                <option value="${cakeBakerTaskEnum.逛金融主会场}">逛金融主会场</option>
                                                <option value="${cakeBakerTaskEnum.逛品牌庆生}">逛品牌庆生</option>
                                                <option value="${cakeBakerTaskEnum.逛校园会场}">逛校园会场</option>
                                                <option value="${cakeBakerTaskEnum.加购商品}">加购商品</option>
                                                <option value="${cakeBakerTaskEnum.逛店铺}">逛店铺</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left">
                                        <input id="cakeBakerTiming" type="time" value="${defaultCakeBakerTiming}" style="width:23.5vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;">
                                        <input id="cakeBakerDetection" style="width:12.8vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;" placeholder = "检测频率">
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="cakeBakerAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动蛋糕</button>
                                    </td>
                                </tr>
                            </table>
                        </div>`;
        btnContent.innerHTML = btnInfo;
        this.content.appendChild(btnContent);
        this.container.appendChild(this.content);
    }

    list(): void {
        //自动蛋糕
        let cakeBakerAuto = _$('.cakeBakerAuto') as HTMLButtonElement;
        cakeBakerAuto!.addEventListener('click', () => {
            //验证蛋糕任务类型
            let typeSelect = document.getElementById('cakeBakerType') as HTMLSelectElement,
                typeSelectOptions = typeSelect.options[typeSelect.selectedIndex];
            if (!typeSelectOptions || !typeSelectOptions.value) {
                alert("请选择任务类型！");
                return false;
            }
            //验证蛋糕任务定时
            let cakeBakerTimingInput = document.getElementById('cakeBakerTiming') as HTMLInputElement;
            if (!cakeBakerTimingInput.value) {
                alert("请输入正确的任务定时格式！");
                return false;
            }
            //验证蛋糕任务检测频率
            const reg = /^[1-9]\d*$/;
            let cakeBakerDetectionInput = document.getElementById('cakeBakerDetection') as HTMLInputElement;
            if (!!cakeBakerDetectionInput.value && !reg.test(cakeBakerDetectionInput.value)) {
                alert("请检查组队检测频率是否为正整数！");
                return false;
            }

            cakeBakerTiming = cakeBakerTimingInput.value || defaultCakeBakerTiming;
            cakeBakerSpan = ((+cakeBakerDetectionInput!.value * 3600000) || defaultCakeBakerDetection);

            typeSelect.disabled = !typeSelect.disabled;
            cakeBakerTimingInput.disabled = !cakeBakerTimingInput.disabled;
            cakeBakerDetectionInput.disabled = !cakeBakerDetectionInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                let firstSpan = 0,
                    cakeBakerTimeout = 0,
                    isTimeOut = false;
                let currentJDDate = new Date(+currentJDTime),
                    timeSplit = cakeBakerTiming.split(':'),
                    timingStamp = new Date(+currentJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                if (cakeBakerAuto.innerHTML == cakeBakerButtonEnum.cakeBakerStart) {
                    cakeBakerAuto.innerHTML = cakeBakerButtonEnum.cakeBakerStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动蛋糕！`, false);

                    if (currentJDDate.getTime() < timingStamp) {
                        firstSpan = timingStamp - currentJDDate.getTime();
                    }

                    cakeBakerTimeout = setTimeout(() => {
                        this.cakeBaker(typeSelectOptions.value);
                        cakeBakerInterval = setInterval(() => {
                            this.getJDTime().then((nowJDTime) => {
                                let nowJDDate = new Date(+nowJDTime),
                                    nowTimingStamp = new Date(+nowJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                                if (nowJDDate.getTime() >= nowTimingStamp) {
                                    clearTimeout(cakeBakerTimeout);
                                    this.cakeBaker(typeSelectOptions.value);
                                }
                                else {
                                    if (!isTimeOut) {
                                        isTimeOut = true;
                                        cakeBakerTimeout = setTimeout(() => {
                                            isTimeOut = false;
                                            this.cakeBaker(typeSelectOptions.value);
                                        }, nowTimingStamp - nowJDDate.getTime());
                                    }
                                }
                            });
                        }, cakeBakerSpan);
                    }, firstSpan);
                }
                else {
                    cakeBakerAuto.innerHTML = cakeBakerButtonEnum.cakeBakerStart;
                    clearInterval(cakeBakerInterval);
                    clearTimeout(cakeBakerTimeout);
                    cakeBakerTimeoutArray.forEach((timeout) => { clearTimeout(timeout); });
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动蛋糕！`, false);
                }
            });
        });
    }
    //叠蛋糕任务
    async cakeBaker(taskType: any) {
        let taskTimeout = 0,
            submitTimeout = 0;
        let secretp = '',
            needLevel = false;
        let getTaskDetailJson: any,
            getFeedDetailJson: any;
        let elf: any,
            signIn: any,
            shoppingMain: any,
            shoppingProduct: any,
            viewGame1: any,
            viewGame2: any,
            viewChannel: any,
            viewVenue: any,
            shoppingFinance: any,
            shoppingBrandBirthday: any,
            shoppingCampusVenue: any,
            addProduct: any,
            browseShop: any;
        //蛋糕首页信息
        await fetch(`${this.rootURI}cakebaker_getHomeData&client=wh5&clientVersion=1.0.0`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
            .then((res) => { return res.json() })
            .then((cakebakergetHomeDataJson) => {
                if ((cakebakergetHomeDataJson.code == 0 || cakebakergetHomeDataJson.msg == "调用成功") && cakebakergetHomeDataJson.data.success) {
                    secretp = cakebakergetHomeDataJson.data.result.cakeBakerInfo.secretp;
                    needLevel = cakebakergetHomeDataJson.data.result.cakeBakerInfo.raiseInfo.remainScore > cakebakergetHomeDataJson.data.result.cakeBakerInfo.raiseInfo.nextLevelScore - cakebakergetHomeDataJson.data.result.cakeBakerInfo.raiseInfo.curLevelStartScore;
                }
                else {
                    Utils.debugInfo(consoleEnum.log, cakebakergetHomeDataJson);
                    Utils.outPutLog(this.outputTextarea, `【获取蛋糕首页信息失败，请手动刷新或联系作者！】`, false);
                }
            })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取蛋糕首页信息异常，请刷新后重新尝试或联系作者！】`, false);
            });

        if (!secretp) { return false; }
        //蛋糕任务信息1
        getTaskDetailJson = await fetch(`${this.rootURI}cakebaker_getTaskDetail`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `functionId=cakebaker_getTaskDetail&body={}&client=wh5&clientVersion=1.0.0`
        })
            .then(function (res) { return res.json(); })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取蛋糕任务信息1异常，请刷新后重新尝试或联系作者！】`, false);
            });
        //蛋糕任务信息2
        getFeedDetailJson = await fetch(`${this.rootURI}cakebaker_getFeedDetail`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `functionId=cakebaker_getFeedDetail&body={}&client=wh5&clientVersion=1.0.0`
        })
            .then(function (res) { return res.json(); })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `【哎呀~获取蛋糕任务信息2异常，请刷新后重新尝试或联系作者！】`, false);
            });
        //任务分组1
        if ((getTaskDetailJson.code == 0 || getTaskDetailJson.msg == "调用成功") && getTaskDetailJson.data.success) {
            for (let i = 0; i < getTaskDetailJson.data.result.taskVos.length; i++) {
                switch (getTaskDetailJson.data.result.taskVos[i].taskId) {
                    case cakeBakerTaskEnum.小精灵:
                        elf = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.签到:
                        signIn = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.逛主会场:
                        shoppingMain = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.去逛商品:
                        shoppingProduct = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.浏览游戏1:
                        viewGame1 = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.浏览游戏2:
                        viewGame2 = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.浏览频道:
                        viewChannel = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.浏览会场:
                        viewVenue = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.逛金融主会场:
                        shoppingFinance = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.逛品牌庆生:
                        shoppingBrandBirthday = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.逛校园会场:
                        shoppingCampusVenue = getTaskDetailJson.data.result.taskVos[i];
                        break;
                    case cakeBakerTaskEnum.加购商品:
                        addProduct = getTaskDetailJson.data.result.taskVos[i];
                        break;
                }
            }
        }
        else {
            Utils.debugInfo(consoleEnum.log, getTaskDetailJson);
            Utils.outPutLog(this.outputTextarea, `【获取蛋糕任务信息1请求失败，请手动刷新或联系作者！】`, false);
        }
        //任务分组2
        if ((getFeedDetailJson.code == 0 || getFeedDetailJson.msg == "调用成功") && getFeedDetailJson.data.success) {
            browseShop = getFeedDetailJson.data.result[cakeBakerTaskEnum.逛店铺][0];
        }
        else {
            Utils.debugInfo(consoleEnum.log, getFeedDetailJson);
            Utils.outPutLog(this.outputTextarea, `【获取蛋糕任务信息2请求失败，请手动刷新或联系作者！】`, false);
        }
        //完成任务1
        if (taskType == cakeBakerTaskEnum.小精灵 || taskType == cakeBakerTaskEnum.全部) {
            if (!!elf && elf.status == 1) {
                let joinedCount = +elf.times,
                    taskChance = +elf.maxTimes;
                for (let j = 0; j < taskChance - joinedCount; j++) {
                    cakeBakerTimeoutArray.push(setTimeout(() => {
                        let postData = `&body={\"taskId\":${elf.taskId},\"itemId\":\"${elf.simpleRecordInfoVo.itemId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\"}&client=wh5&clientVersion=1.0.0`;
                        fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                            method: "POST",
                            mode: "cors",
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        })
                            .then(function (res) { return res.json(); })
                            .then((cakebakerckCollectScoreJson) => {
                                if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                    joinedCount++;
                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕小精灵成功！`, false);
                                }
                                else {
                                    Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                    Utils.outPutLog(this.outputTextarea, `【蛋糕小精灵失败，请手动刷新或联系作者！】`, false);
                                }
                            })
                            .catch((error) => {
                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕小精灵异常，请刷新后重新尝试或联系作者！】`, false);
                            });
                    }, taskTimeout));
                    taskTimeout += Utils.random(11000, 12000);
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.签到 || taskType == cakeBakerTaskEnum.全部) {
            if (!!signIn && signIn.status == 1) {
                let joinedCount = +signIn.times,
                    taskChance = +signIn.maxTimes;
                cakeBakerTimeoutArray.push(setTimeout(() => {
                    let postData = `&body={\"taskId\":${signIn.taskId},\"itemId\":\"${signIn.simpleRecordInfoVo.itemId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\"}&client=wh5&clientVersion=1.0.0`;
                    fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                        method: "POST",
                        mode: "cors",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    })
                        .then(function (res) { return res.json(); })
                        .then((cakebakerckCollectScoreJson) => {
                            if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                joinedCount++;
                                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕签到成功！`, false);
                            }
                            else {
                                Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                Utils.outPutLog(this.outputTextarea, `【蛋糕签到失败，请手动刷新或联系作者！】`, false);
                            }
                        })
                        .catch((error) => {
                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕签到异常，请刷新后重新尝试或联系作者！】`, false);
                        });
                }, taskTimeout));
                taskTimeout += Utils.random(11000, 12000);
            }
        }
        if (taskType == cakeBakerTaskEnum.逛主会场 || taskType == cakeBakerTaskEnum.全部) {
            if (!!shoppingMain && shoppingMain.status == 1) {
                let joinedCount = +shoppingMain.times,
                    taskChance = +shoppingMain.maxTimes;
                for (let j = 0; j < shoppingMain.shoppingActivityVos.length; j++) {
                    if (shoppingMain.shoppingActivityVos[j].status == 1) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${shoppingMain.taskId},\"itemId\":\"${shoppingMain.shoppingActivityVos[j].advId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                        setTimeout(() => {
                                            postData = `body={"taskToken":"${shoppingMain.shoppingActivityVos[j].taskToken}","actionType":0}&area=2_2826_51941_0&appid=publicUseApi&client=wh5&clientVersion=1.0.0`;
                                            fetch(`${this.rootURI}tc_doTask_mongo`, {
                                                method: "POST",
                                                mode: "cors",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                },
                                                body: postData
                                            })
                                                .then(function (res) { return res.json(); })
                                                .then((tcdoTaskmongoJson) => {
                                                    if ((tcdoTaskmongoJson.code == 0 || tcdoTaskmongoJson.msg == "调用成功") && tcdoTaskmongoJson.data.success) {
                                                        joinedCount++;
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕逛主会场成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, tcdoTaskmongoJson);
                                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛主会场请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛主会场请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛主会场领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛主会场领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.去逛商品 || taskType == cakeBakerTaskEnum.全部) {
            if (!!shoppingProduct && shoppingProduct.status == 1) {
                cakeBakerTimeoutArray.push(setTimeout(() => {
                    let postData = `&body={"taskIds":"${shoppingProduct.productInfoVos.map((item: any) => { return item.itemId; }).join()}"}&client=wh5&clientVersion=1.0.0`;
                    fetch(`${this.rootURI}cakebaker_getFeedDetail${postData}`, {
                        method: "POST",
                        mode: "cors",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    })
                        .then(function (res) { return res.json(); })
                        .then((cakebakerckCollectScoreJson) => {
                            if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                submitTimeout = 0;
                                for (let k = 0; k < cakebakerckCollectScoreJson.data.result.viewProductVos.length; k++) {
                                    if (cakebakerckCollectScoreJson.data.result.viewProductVos[k].status == 1) {
                                        let joinedCount = +cakebakerckCollectScoreJson.data.result.viewProductVos[k].times,
                                            taskChance = +cakebakerckCollectScoreJson.data.result.viewProductVos[k].maxTimes;
                                        for (let l = 0; l < cakebakerckCollectScoreJson.data.result.viewProductVos[k].productInfoVos.length; l++) {
                                            if (cakebakerckCollectScoreJson.data.result.viewProductVos[k].productInfoVos[l].status == 1) {
                                                setTimeout(() => {
                                                    if (joinedCount < taskChance) {
                                                        postData = `&body={\"taskId\":${cakebakerckCollectScoreJson.data.result.viewProductVos[k].taskId},\"itemId\":\"${cakebakerckCollectScoreJson.data.result.viewProductVos[k].productInfoVos[l].itemId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\"}&client=wh5&clientVersion=1.0.0`;
                                                        fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                                            method: "POST",
                                                            mode: "cors",
                                                            credentials: "include",
                                                            headers: {
                                                                "Content-Type": "application/x-www-form-urlencoded"
                                                            }
                                                        })
                                                            .then(function (res) { return res.json(); })
                                                            .then((cakebakerckCollectScoreJson) => {
                                                                if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                                                    joinedCount++;
                                                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕去逛商品${k + 1}成功！`, false);
                                                                }
                                                                else {
                                                                    Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                                                    Utils.outPutLog(this.outputTextarea, `【蛋糕去逛商品${k + 1}请求失败，请手动刷新或联系作者！】`, false);
                                                                }
                                                            })
                                                            .catch((error) => {
                                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                                Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕去逛商品${k + 1}请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                            });
                                                    }
                                                }, submitTimeout);
                                                submitTimeout += Utils.random(3000, 5000);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                Utils.outPutLog(this.outputTextarea, `【蛋糕去逛商品领取失败，请手动刷新或联系作者！】`, false);
                            }
                        })
                        .catch((error) => {
                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕去逛商品领取异常，请刷新后重新尝试或联系作者！】`, false);
                        });
                }, taskTimeout));
                taskTimeout += Utils.random(11000, 12000);
            }
        }
        if (taskType == cakeBakerTaskEnum.浏览游戏1 || taskType == cakeBakerTaskEnum.全部) {
            if (!!viewGame1 && viewGame1.status == 1) {
                let joinedCount = +viewGame1.times,
                    taskChance = +viewGame1.maxTimes;
                for (let j = 0; j < viewGame1.shoppingActivityVos.length; j++) {
                    if (viewGame1.shoppingActivityVos[j].status == 1) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${viewGame1.taskId},\"itemId\":\"${viewGame1.shoppingActivityVos[j].advId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                        setTimeout(() => {
                                            postData = `body={"taskToken":"${viewGame1.shoppingActivityVos[j].taskToken}","version":4,"channel":1}&appid=wh5`;
                                            fetch(`${this.rootURI}tc_doTask_mongo`, {
                                                method: "POST",
                                                mode: "cors",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                },
                                                body: postData
                                            })
                                                .then(function (res) { return res.json(); })
                                                .then((tcdoTaskmongoJson) => {
                                                    if ((tcdoTaskmongoJson.code == 0 || tcdoTaskmongoJson.msg == "调用成功") && tcdoTaskmongoJson.data.success) {
                                                        joinedCount++;
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕浏览游戏1成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, tcdoTaskmongoJson);
                                                        Utils.outPutLog(this.outputTextarea, `【蛋糕浏览游戏1请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕浏览游戏1请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕浏览游戏1领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕浏览游戏1领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.浏览游戏2 || taskType == cakeBakerTaskEnum.全部) {
            if (!!viewGame2 && viewGame2.status == 1) {
                let joinedCount = +viewGame2.times,
                    taskChance = +viewGame2.maxTimes;
                for (let j = 0; j < viewGame2.shoppingActivityVos.length; j++) {
                    if (viewGame2.shoppingActivityVos[j].status == 1) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${viewGame2.taskId},\"itemId\":\"${viewGame2.shoppingActivityVos[j].advId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\"}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                        joinedCount++;
                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕浏览游戏2成功！`, false);
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕浏览游戏2请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕浏览游戏2请求异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(3000, 5000);
                    }
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.浏览频道 || taskType == cakeBakerTaskEnum.全部) {
            if (!!viewChannel && viewChannel.status == 1) {
                let joinedCount = +viewChannel.times,
                    taskChance = +viewChannel.maxTimes;
                for (let j = 0; j < viewChannel.shoppingActivityVos.length; j++) {
                    if (viewChannel.shoppingActivityVos[j].status == 1) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${viewChannel.taskId},\"itemId\":\"${viewChannel.shoppingActivityVos[j].advId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                        setTimeout(() => {
                                            postData = `adid=719BE990-0425-4C06-984C-AF6E27C1111E&area=2_2826_51941_0&body=%7B%22taskToken%22%3A%22${viewChannel.shoppingActivityVos[j].taskToken}%22%7D&appid=publicUseApi`;
                                            fetch(`${this.rootURI}tc_doTask_mongo`, {
                                                method: "POST",
                                                mode: "cors",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                },
                                                body: postData
                                            })
                                                .then(function (res) { return res.json(); })
                                                .then((qryViewkitCallbackResultJson) => {
                                                    if ((qryViewkitCallbackResultJson.code == 0 || qryViewkitCallbackResultJson.msg == "调用成功") && qryViewkitCallbackResultJson.data.success) {
                                                        joinedCount++;
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕浏览频道成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `【蛋糕浏览频道请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕浏览频道请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕浏览频道领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕浏览频道领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.浏览会场 || taskType == cakeBakerTaskEnum.全部) {
            if (!!viewVenue && viewVenue.status == 1) {
                let joinedCount = +viewVenue.times,
                    taskChance = +viewVenue.maxTimes;
                for (let j = 0; j < viewVenue.shoppingActivityVos.length; j++) {
                    if (viewVenue.shoppingActivityVos[j].status == 1 && joinedCount < taskChance) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${viewVenue.taskId},\"itemId\":\"${viewVenue.shoppingActivityVos[j].advId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                        setTimeout(() => {
                                            postData = `adid=719BE990-0425-4C06-984C-AF6E27C1111E&area=2_2826_51941_0&body=%7B%22taskToken%22%3A%22${viewVenue.shoppingActivityVos[j].taskToken}%22%7D&appid=publicUseApi`;
                                            fetch(`${this.rootURI}tc_doTask_mongo`, {
                                                method: "POST",
                                                mode: "cors",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                },
                                                body: postData
                                            })
                                                .then(function (res) { return res.json(); })
                                                .then((qryViewkitCallbackResultJson) => {
                                                    if ((qryViewkitCallbackResultJson.code == 0 || qryViewkitCallbackResultJson.msg == "调用成功") && qryViewkitCallbackResultJson.data.success) {
                                                        joinedCount++;
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕浏览会场成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `【蛋糕浏览会场请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕浏览会场请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕浏览会场领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕浏览会场领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.逛金融主会场 || taskType == cakeBakerTaskEnum.全部) {
            if (!!shoppingFinance && shoppingFinance.status == 1) {
                let joinedCount = +shoppingFinance.times,
                    taskChance = +shoppingFinance.maxTimes;
                for (let j = 0; j < shoppingFinance.shoppingActivityVos.length; j++) {
                    if (shoppingFinance.shoppingActivityVos[j].status == 1 && joinedCount < taskChance) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${shoppingFinance.taskId},\"itemId\":\"${shoppingFinance.shoppingActivityVos[j].advId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                        setTimeout(() => {
                                            postData = `adid=719BE990-0425-4C06-984C-AF6E27C1111E&area=2_2826_51941_0&body=%7B%22taskToken%22%3A%22${shoppingFinance.shoppingActivityVos[j].taskToken}%22%7D&appid=publicUseApi`;
                                            fetch(`${this.rootURI}tc_doTask_mongo`, {
                                                method: "POST",
                                                mode: "cors",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                },
                                                body: postData
                                            })
                                                .then(function (res) { return res.json(); })
                                                .then((qryViewkitCallbackResultJson) => {
                                                    if ((qryViewkitCallbackResultJson.code == 0 || qryViewkitCallbackResultJson.msg == "调用成功") && qryViewkitCallbackResultJson.data.success) {
                                                        joinedCount++;
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕逛金融主会场成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛金融主会场请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛金融主会场请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛金融主会场领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛金融主会场领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.逛品牌庆生 || taskType == cakeBakerTaskEnum.全部) {
            if (!!shoppingBrandBirthday && shoppingBrandBirthday.status == 1) {
                let joinedCount = +shoppingBrandBirthday.times,
                    taskChance = +shoppingBrandBirthday.maxTimes;
                for (let j = 0; j < shoppingBrandBirthday.shoppingActivityVos.length; j++) {
                    if (shoppingBrandBirthday.shoppingActivityVos[j].status == 1 && joinedCount < taskChance) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${shoppingBrandBirthday.taskId},\"itemId\":\"${shoppingBrandBirthday.shoppingActivityVos[j].advId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                        setTimeout(() => {
                                            postData = `adid=719BE990-0425-4C06-984C-AF6E27C1111E&area=2_2826_51941_0&body=%7B%22taskToken%22%3A%22${shoppingBrandBirthday.shoppingActivityVos[j].taskToken}%22%7D&appid=publicUseApi`;
                                            fetch(`${this.rootURI}tc_doTask_mongo`, {
                                                method: "POST",
                                                mode: "cors",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                },
                                                body: postData
                                            })
                                                .then(function (res) { return res.json(); })
                                                .then((qryViewkitCallbackResultJson) => {
                                                    if ((qryViewkitCallbackResultJson.code == 0 || qryViewkitCallbackResultJson.msg == "调用成功") && qryViewkitCallbackResultJson.data.success) {
                                                        joinedCount++;
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕逛品牌庆生成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛品牌庆生请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛品牌庆生请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛品牌庆生领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛品牌庆生领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.逛校园会场 || taskType == cakeBakerTaskEnum.全部) {
            if (!!shoppingCampusVenue && shoppingCampusVenue.status == 1) {
                let joinedCount = +shoppingCampusVenue.times,
                    taskChance = +shoppingCampusVenue.maxTimes;
                for (let j = 0; j < shoppingCampusVenue.shoppingActivityVos.length; j++) {
                    if (shoppingCampusVenue.shoppingActivityVos[j].status == 1 && joinedCount < taskChance) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${shoppingCampusVenue.taskId},\"itemId\":\"${shoppingCampusVenue.shoppingActivityVos[j].advId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                        setTimeout(() => {
                                            postData = `adid=719BE990-0425-4C06-984C-AF6E27C1111E&area=2_2826_51941_0&body=%7B%22taskToken%22%3A%22${shoppingCampusVenue.shoppingActivityVos[j].taskToken}%22%7D&appid=publicUseApi`;
                                            fetch(`${this.rootURI}tc_doTask_mongo`, {
                                                method: "POST",
                                                mode: "cors",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                },
                                                body: postData
                                            })
                                                .then(function (res) { return res.json(); })
                                                .then((qryViewkitCallbackResultJson) => {
                                                    if ((qryViewkitCallbackResultJson.code == 0 || qryViewkitCallbackResultJson.msg == "调用成功") && qryViewkitCallbackResultJson.data.success) {
                                                        joinedCount++;
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕逛校园会场成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛校园会场请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛校园会场请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛校园会场领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛校园会场领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        if (taskType == cakeBakerTaskEnum.加购商品 || taskType == cakeBakerTaskEnum.全部) {
            if (!!addProduct && addProduct.status == 1) {
                cakeBakerTimeoutArray.push(setTimeout(() => {
                    let postData = `&body={"taskIds":"${addProduct.productInfoVos.map((item: any) => { return item.itemId; }).join()}"}&client=wh5&clientVersion=1.0.0`;
                    fetch(`${this.rootURI}cakebaker_getFeedDetail${postData}`, {
                        method: "POST",
                        mode: "cors",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    })
                        .then(function (res) { return res.json(); })
                        .then((cakebakerckCollectScoreJson) => {
                            if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                submitTimeout = 0;
                                for (let k = 0; k < cakebakerckCollectScoreJson.data.result.addProductVos.length; k++) {
                                    if (cakebakerckCollectScoreJson.data.result.addProductVos[k].status == 1) {
                                        let joinedCount = +cakebakerckCollectScoreJson.data.result.addProductVos[k].times,
                                            taskChance = +cakebakerckCollectScoreJson.data.result.addProductVos[k].maxTimes;
                                        for (let l = 0; l < cakebakerckCollectScoreJson.data.result.addProductVos[k].productInfoVos.length; l++) {
                                            if (cakebakerckCollectScoreJson.data.result.addProductVos[k].productInfoVos[l].status == 1) {
                                                setTimeout(() => {
                                                    if (joinedCount < taskChance) {
                                                        postData = `&body={\"taskId\":${cakebakerckCollectScoreJson.data.result.addProductVos[k].taskId},\"itemId\":\"${cakebakerckCollectScoreJson.data.result.addProductVos[k].productInfoVos[l].itemId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\"}&client=wh5&clientVersion=1.0.0`;
                                                        fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                                            method: "POST",
                                                            mode: "cors",
                                                            credentials: "include",
                                                            headers: {
                                                                "Content-Type": "application/x-www-form-urlencoded"
                                                            }
                                                        })
                                                            .then(function (res) { return res.json(); })
                                                            .then((cakebakerckCollectScoreJson) => {
                                                                if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
                                                                    joinedCount++;
                                                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕加购商品${k + 1}成功！`, false);
                                                                }
                                                            })
                                                            .catch((error) => {
                                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                                Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕加购商品${k + 1}请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                            });
                                                    }
                                                }, submitTimeout);
                                                submitTimeout += Utils.random(3000, 5000);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                Utils.outPutLog(this.outputTextarea, `【蛋糕加购商品领取失败，请手动刷新或联系作者！】`, false);
                            }
                        })
                        .catch((error) => {
                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕加购商品领取异常，请刷新后重新尝试或联系作者！】`, false);
                        });
                }, taskTimeout));
                taskTimeout += Utils.random(11000, 12000);
            }
        }
        //完成任务2
        if (taskType == cakeBakerTaskEnum.逛店铺 || taskType == cakeBakerTaskEnum.全部) {
            if (!!browseShop && browseShop.status == 1) {
                let joinedCount = +browseShop.times,
                    taskChance = +browseShop.maxTimes;
                for (let j = 0; j < browseShop.browseShopVo.length; j++) {
                    if (browseShop.browseShopVo[j].status == 1) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            let postData = `&body={\"taskId\":${browseShop.taskId},\"itemId\":\"${browseShop.browseShopVo[j].itemId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
                            fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
                                method: "POST",
                                mode: "cors",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(function (res) { return res.json(); })
                                .then((cakebakerckCollectScoreJson) => {
                                    if (cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") {
                                        setTimeout(() => {
                                            postData = `adid=719BE990-0425-4C06-984C-AF6E27C1111E&area=2_2826_51941_0&body=%7B%22taskToken%22%3A%22${browseShop.browseShopVo[j].taskToken}%22%7D&appid=publicUseApi`;
                                            fetch(`${this.rootURI}tc_doTask_mongo`, {
                                                method: "POST",
                                                mode: "cors",
                                                credentials: "include",
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                },
                                                body: postData
                                            })
                                                .then(function (res) { return res.json(); })
                                                .then((tcdoTaskmongoJson) => {
                                                    if (tcdoTaskmongoJson.code == 0 || tcdoTaskmongoJson.msg == "调用成功") {
                                                        joinedCount++;
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 【${joinedCount}/${taskChance}】蛋糕逛店铺成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, tcdoTaskmongoJson);
                                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛店铺请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛店铺请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `【蛋糕逛店铺领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `【哎呀~蛋糕逛店铺领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        //叠蛋糕
        if (taskType == cakeBakerTaskEnum.叠蛋糕 || taskType == cakeBakerTaskEnum.全部) {
            while (needLevel) {
                await fetch(`${this.rootURI}cakebaker_raise&vody={}&client=wh5&clientVersion=1.0.0`, {
                    method: "POST",
                    mode: "cors",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })
                    .then(function (res) { return res.json(); })
                    .then((cakebakerRaiseJson) => {
                        if ((cakebakerRaiseJson.code == 0 || cakebakerRaiseJson.msg == "调用成功") && cakebakerRaiseJson.data.success) {
                            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 叠蛋糕升至${cakebakerRaiseJson.data.result.raiseInfo.scoreLevel}级！`, false);
                        }
                        else {
                            needLevel = false;
                            //Utils.debugInfo(consoleEnum.log, cakebakerRaiseJson);
                            //Utils.outPutLog(this.outputTextarea, `【叠蛋糕失败，请手动刷新或联系作者！】`, false);
                        }
                    })
                    .catch((error) => {
                        needLevel = false;
                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                        Utils.outPutLog(this.outputTextarea, `【哎呀~叠蛋糕异常，请刷新后重新尝试或联系作者！】`, false);
                    });
            }
        }
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
}