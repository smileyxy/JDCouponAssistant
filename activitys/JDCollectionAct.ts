import fj from "../utils/fetch-jsonp";
import Activity from "../interface/Activity";
import Utils, { _$ } from "../utils/utils";
import Config from "../config/config";
import { consoleEnum } from '../enum/commonType';
import { CookieType, CookieHandler } from "../cookie/CookieHandler";
import CookieManager from "../cookie/CookieManager";
import {
    activityType,
    cakeBakerTaskEnum,
    cakeBakerButtonEnum,
    carnivalCityTaskEnum,
    carnivalCityButtonEnum,
    rubiksCubeTaskEnum,
    rubiksCubeButtonEnum
} from '../enum/activityType';

let cakeBakerTiming = "",
    cakeBakerSpan = 0,
    cakeBakerInterval = 0,
    carnivalCityTiming = "",
    carnivalCitySpan = 0,
    carnivalCityInterval = 0,
    rubiksCubeTiming = "",
    rubiksCubeSpan = 0,
    rubiksCubeInterval = 0;
let cakeBakerTimeoutArray: any[] = [],
    carnivalCityTimeoutArray: any[] = [],
    rubiksCubeTimeoutArray: any[] = [];
let taskTimeout = 0,
    carnivalCityTimeOut = 0,
    rubiksCubeTimeOut = 0;
const defaultCakeBakerTiming: string = '01:00',
    defaultCakeBakerDetection: number = 3600000, //1小时
    defaultCarnivalCityTiming: string = '02:00',
    defaultCarnivalCityDetection: number = 10800000, //3小时
    defaultRubiksCubeTiming: string = '03:00',
    defaultRubiksCubeDetection: number = 3600000, //1小时
    defaultMultiPollingDetection: number = 1800000; //30分钟

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
        let helpInfoDetail = '';
        let btnInfoDetail = '';
        switch (this.params.switchType) {
            case activityType.cakeBaker:
                helpInfoDetail = `<details>
                                      <summary style="outline: 0;">自动蛋糕</summary>
                                      <p style="font-size: 12px;">根据所填项每天完成叠蛋糕任务；任务定时：默认${defaultCakeBakerTiming}之后；检测频率：默认${defaultCakeBakerDetection / 3600000}小时。</p>
                                  </details>`;
                btnInfoDetail = `<tr> 
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
                                                <option value="${cakeBakerTaskEnum.AR吃蛋糕}">AR吃蛋糕</option>
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
                                </tr>`;
            //    break;
            //case activityType.carnivalCity:
                helpInfoDetail += `<details>
                                    <summary style="outline: 0;">自动狂欢</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成品牌狂欢城任务；任务定时：默认${defaultCarnivalCityTiming}之后；检测频率：默认${defaultCarnivalCityDetection / 3600000}小时。</p>
                                </details>`;
                btnInfoDetail += `<tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="carnivalCityType" style="width: 23.5vw;">
                                                <option value="${carnivalCityTaskEnum.全部}" selected="selected">全部</option>
                                                <option value="${carnivalCityTaskEnum.今日主推}">今日主推</option>
                                                <option value="${carnivalCityTaskEnum.今日大牌}">今日大牌</option>
                                                <option value="${carnivalCityTaskEnum.今日精选}">今日精选</option>
                                                <option value="${carnivalCityTaskEnum.热卖单品}">热卖单品</option>
                                                <option value="${carnivalCityTaskEnum.精选会场}">精选会场</option>
                                                <option value="${carnivalCityTaskEnum.开通会员}">开通会员</option>
                                                <option value="${carnivalCityTaskEnum.探索物种}">探索物种</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left">
                                        <input id="carnivalCityTiming" type="time" value="${defaultCarnivalCityTiming}" style="width:23.5vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;">
                                        <input id="carnivalCityDetection" style="width:12.8vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;" placeholder = "检测频率">
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="carnivalCityAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动狂欢</button>
                                    </td>
                                </tr>`;
                helpInfoDetail += `<details>
                                    <summary style="outline: 0;">自动魔方</summary>
                                    <p style="font-size: 12px;">根据所填项每天完成京东小魔方任务；任务定时：默认${defaultRubiksCubeTiming}之后；检测频率：默认${defaultRubiksCubeDetection / 3600000}小时。</p>
                                </details>`;
                btnInfoDetail += `<tr> 
                                    <td style="width: 80vw;text-align: -webkit-left;vertical-align: middle;">
                                        <div style="width: 24vw;">
                                            <select id="rubiksCubeType" style="width: 23.5vw;">
                                                <option value="${rubiksCubeTaskEnum.全部}" selected="selected">全部</option>
                                                <option value="${rubiksCubeTaskEnum.浏览新品}">浏览新品</option>
                                                <option value="${rubiksCubeTaskEnum.关注浏览}">关注浏览</option>
                                                <option value="${rubiksCubeTaskEnum.浏览会场}">浏览会场</option>
                                                <option value="${rubiksCubeTaskEnum.抽奖}">抽奖</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td style="width: 230vw;text-align: -webkit-left">
                                        <input id="rubiksCubeTiming" type="time" value="${defaultRubiksCubeTiming}" style="width:23.5vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;">
                                        <input id="rubiksCubeDetection" style="width:12.8vw;height: 3vh;font-size:12px;border: solid 1px #000;border-radius: 5px;margin: 10px auto;display: inline;" placeholder = "检测频率">
                                    </td>
                                    <td style="width: 50vw;text-align: -webkit-left;">
                                        <button class="rubiksCubeAuto" style="width: 21vw;height:3vh;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px;display:block;font-size: 12px;line-height: 0;">自动魔方</button>
                                    </td>
                                </tr>`;
                break;
        }
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

    list(): void {
        //自动蛋糕
        let cakeBakerAuto = _$('.cakeBakerAuto') as HTMLButtonElement;
        cakeBakerAuto?.addEventListener('click', () => {
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

            if (Config.multiFlag) {
                cakeBakerSpan = ((+cakeBakerDetectionInput!.value * 3600000) || defaultCakeBakerDetection) + (defaultMultiPollingDetection * CookieManager.cookieArr.length);
            }
            else {
                cakeBakerSpan = ((+cakeBakerDetectionInput!.value * 3600000) || defaultCakeBakerDetection);
            }

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
                        if (Config.multiFlag) {
                            CookieManager.cookieArr.map((item: CookieType) => {
                                setTimeout(() => {
                                    CookieHandler.coverCookie(item);
                                    this.cakeBaker(typeSelectOptions.value, item);
                                }, item.index * defaultMultiPollingDetection);
                            });
                        }
                        else {
                            this.cakeBaker(typeSelectOptions.value);
                        }
                        cakeBakerInterval = setInterval(() => {
                            this.getJDTime().then((nowJDTime) => {
                                let nowJDDate = new Date(+nowJDTime),
                                    nowTimingStamp = new Date(+nowJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                                if (nowJDDate.getTime() >= nowTimingStamp) {
                                    clearTimeout(cakeBakerTimeout);
                                    if (Config.multiFlag) {
                                        CookieManager.cookieArr.map((item: CookieType) => {
                                            setTimeout(() => {
                                                CookieHandler.coverCookie(item);
                                                this.cakeBaker(typeSelectOptions.value, item);
                                            }, item.index * defaultMultiPollingDetection);
                                        });
                                    }
                                    else {
                                        this.cakeBaker(typeSelectOptions.value);
                                    }
                                }
                                else {
                                    if (!isTimeOut) {
                                        isTimeOut = true;
                                        cakeBakerTimeout = setTimeout(() => {
                                            isTimeOut = false;
                                            if (Config.multiFlag) {
                                                CookieManager.cookieArr.map((item: CookieType) => {
                                                    setTimeout(() => {
                                                        CookieHandler.coverCookie(item);
                                                        this.cakeBaker(typeSelectOptions.value, item);
                                                    }, item.index * defaultMultiPollingDetection);
                                                });
                                            }
                                            else {
                                                this.cakeBaker(typeSelectOptions.value);
                                            }
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
        //自动狂欢
        let carnivalCityAuto = _$('.carnivalCityAuto') as HTMLButtonElement;
        carnivalCityAuto?.addEventListener('click', () => {
            //验证狂欢任务类型
            let typeSelect = document.getElementById('carnivalCityType') as HTMLSelectElement,
                typeSelectOptions = typeSelect.options[typeSelect.selectedIndex];
            if (!typeSelectOptions || !typeSelectOptions.value) {
                alert("请选择任务类型！");
                return false;
            }
            //验证狂欢任务定时
            let carnivalCityTimingInput = document.getElementById('carnivalCityTiming') as HTMLInputElement;
            if (!carnivalCityTimingInput.value) {
                alert("请输入正确的任务定时格式！");
                return false;
            }
            //验证狂欢任务检测频率
            const reg = /^[1-9]\d*$/;
            let carnivalCityDetectionInput = document.getElementById('carnivalCityDetection') as HTMLInputElement;
            if (!!carnivalCityDetectionInput.value && !reg.test(carnivalCityDetectionInput.value)) {
                alert("请检查组队检测频率是否为正整数！");
                return false;
            }

            carnivalCityTiming = carnivalCityTimingInput.value || defaultCarnivalCityTiming;

            if (Config.multiFlag) {
                carnivalCitySpan = ((+carnivalCityDetectionInput!.value * 3600000) || defaultCarnivalCityDetection) + (defaultMultiPollingDetection * CookieManager.cookieArr.length);
            }
            else {
                carnivalCitySpan = ((+carnivalCityDetectionInput!.value * 3600000) || defaultCarnivalCityDetection);
            }

            typeSelect.disabled = !typeSelect.disabled;
            carnivalCityTimingInput.disabled = !carnivalCityTimingInput.disabled;
            carnivalCityDetectionInput.disabled = !carnivalCityDetectionInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                let firstSpan = 0,
                    carnivalCityTimeout = 0,
                    isTimeOut = false;
                let currentJDDate = new Date(+currentJDTime),
                    timeSplit = carnivalCityTiming.split(':'),
                    timingStamp = new Date(+currentJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                if (carnivalCityAuto.innerHTML == carnivalCityButtonEnum.carnivalCityStart) {
                    carnivalCityAuto.innerHTML = carnivalCityButtonEnum.carnivalCityStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动狂欢！`, false);

                    if (currentJDDate.getTime() < timingStamp) {
                        firstSpan = timingStamp - currentJDDate.getTime();
                    }

                    carnivalCityTimeout = setTimeout(() => {
                        if (Config.multiFlag) {
                            CookieManager.cookieArr.map((item: CookieType) => {
                                setTimeout(() => {
                                    CookieHandler.coverCookie(item);
                                    this.carnivalCity(typeSelectOptions.value, item);
                                }, item.index * defaultMultiPollingDetection);
                            });
                        }
                        else {
                            this.carnivalCity(typeSelectOptions.value);
                        }
                        carnivalCityInterval = setInterval(() => {
                            this.getJDTime().then((nowJDTime) => {
                                let nowJDDate = new Date(+nowJDTime),
                                    nowTimingStamp = new Date(+nowJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                                if (nowJDDate.getTime() >= nowTimingStamp) {
                                    clearTimeout(carnivalCityTimeout);
                                    if (Config.multiFlag) {
                                        CookieManager.cookieArr.map((item: CookieType) => {
                                            setTimeout(() => {
                                                CookieHandler.coverCookie(item);
                                                this.carnivalCity(typeSelectOptions.value, item);
                                            }, item.index * defaultMultiPollingDetection);
                                        });
                                    }
                                    else {
                                        this.carnivalCity(typeSelectOptions.value);
                                    }
                                }
                                else {
                                    if (!isTimeOut) {
                                        isTimeOut = true;
                                        carnivalCityTimeout = setTimeout(() => {
                                            isTimeOut = false;
                                            if (Config.multiFlag) {
                                                CookieManager.cookieArr.map((item: CookieType) => {
                                                    setTimeout(() => {
                                                        CookieHandler.coverCookie(item);
                                                        this.carnivalCity(typeSelectOptions.value, item);
                                                    }, item.index * defaultMultiPollingDetection);
                                                });
                                            }
                                            else {
                                                this.carnivalCity(typeSelectOptions.value);
                                            }
                                        }, nowTimingStamp - nowJDDate.getTime());
                                    }
                                }
                            });
                        }, carnivalCitySpan);
                    }, firstSpan);
                }
                else {
                    carnivalCityAuto.innerHTML = carnivalCityButtonEnum.carnivalCityStart;
                    clearInterval(carnivalCityInterval);
                    clearTimeout(carnivalCityTimeout);
                    carnivalCityTimeoutArray.forEach((timeout) => { clearTimeout(timeout); });
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动狂欢！`, false);
                }
            });
        });
        //自动魔方
        let rubiksCubeAuto = _$('.rubiksCubeAuto') as HTMLButtonElement;
        rubiksCubeAuto?.addEventListener('click', () => {
            //验证魔方任务类型
            let typeSelect = document.getElementById('rubiksCubeType') as HTMLSelectElement,
                typeSelectOptions = typeSelect.options[typeSelect.selectedIndex];
            if (!typeSelectOptions || !typeSelectOptions.value) {
                alert("请选择任务类型！");
                return false;
            }
            //验证魔方任务定时
            let rubiksCubeTimingInput = document.getElementById('rubiksCubeTiming') as HTMLInputElement;
            if (!rubiksCubeTimingInput.value) {
                alert("请输入正确的任务定时格式！");
                return false;
            }
            //验证魔方任务检测频率
            const reg = /^[1-9]\d*$/;
            let rubiksCubeDetectionInput = document.getElementById('rubiksCubeDetection') as HTMLInputElement;
            if (!!rubiksCubeDetectionInput.value && !reg.test(rubiksCubeDetectionInput.value)) {
                alert("请检查组队检测频率是否为正整数！");
                return false;
            }

            rubiksCubeTiming = rubiksCubeTimingInput.value || defaultRubiksCubeTiming;

            if (Config.multiFlag) {
                rubiksCubeSpan = ((+rubiksCubeDetectionInput!.value * 3600000) || defaultRubiksCubeDetection) + (defaultMultiPollingDetection * CookieManager.cookieArr.length);
            }
            else {
                rubiksCubeSpan = ((+rubiksCubeDetectionInput!.value * 3600000) || defaultRubiksCubeDetection);
            }

            typeSelect.disabled = !typeSelect.disabled;
            rubiksCubeTimingInput.disabled = !rubiksCubeTimingInput.disabled;
            rubiksCubeDetectionInput.disabled = !rubiksCubeDetectionInput.disabled;

            this.getJDTime().then((currentJDTime) => {
                let firstSpan = 0,
                    rubiksCubeTimeout = 0,
                    isTimeOut = false;
                let currentJDDate = new Date(+currentJDTime),
                    timeSplit = rubiksCubeTiming.split(':'),
                    timingStamp = new Date(+currentJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                if (rubiksCubeAuto.innerHTML == rubiksCubeButtonEnum.rubiksCubeStart) {
                    rubiksCubeAuto.innerHTML = rubiksCubeButtonEnum.rubiksCubeStop;
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已开启自动魔方！`, false);

                    if (currentJDDate.getTime() < timingStamp) {
                        firstSpan = timingStamp - currentJDDate.getTime();
                    }

                    rubiksCubeTimeout = setTimeout(() => {
                        if (Config.multiFlag) {
                            CookieManager.cookieArr.map((item: CookieType) => {
                                setTimeout(() => {
                                    CookieHandler.coverCookie(item);
                                    this.rubiksCube(typeSelectOptions.value, item);
                                }, item.index * defaultMultiPollingDetection);
                            });
                        }
                        else {
                            this.rubiksCube(typeSelectOptions.value);
                        }
                        rubiksCubeInterval = setInterval(() => {
                            this.getJDTime().then((nowJDTime) => {
                                let nowJDDate = new Date(+nowJDTime),
                                    nowTimingStamp = new Date(+nowJDTime).setHours(+timeSplit[0], +timeSplit[1], 0, 0);
                                if (nowJDDate.getTime() >= nowTimingStamp) {
                                    clearTimeout(rubiksCubeTimeout);
                                    if (Config.multiFlag) {
                                        CookieManager.cookieArr.map((item: CookieType) => {
                                            setTimeout(() => {
                                                CookieHandler.coverCookie(item);
                                                this.rubiksCube(typeSelectOptions.value, item);
                                            }, item.index * defaultMultiPollingDetection);
                                        });
                                    }
                                    else {
                                        this.rubiksCube(typeSelectOptions.value);
                                    }
                                }
                                else {
                                    if (!isTimeOut) {
                                        isTimeOut = true;
                                        rubiksCubeTimeout = setTimeout(() => {
                                            isTimeOut = false;
                                            if (Config.multiFlag) {
                                                CookieManager.cookieArr.map((item: CookieType) => {
                                                    setTimeout(() => {
                                                        CookieHandler.coverCookie(item);
                                                        this.rubiksCube(typeSelectOptions.value, item);
                                                    }, item.index * defaultMultiPollingDetection);
                                                });
                                            }
                                            else {
                                                this.rubiksCube(typeSelectOptions.value);
                                            }
                                        }, nowTimingStamp - nowJDDate.getTime());
                                    }
                                }
                            });
                        }, rubiksCubeSpan);
                    }, firstSpan);
                }
                else {
                    rubiksCubeAuto.innerHTML = rubiksCubeButtonEnum.rubiksCubeStart;
                    clearInterval(rubiksCubeInterval);
                    clearTimeout(rubiksCubeTimeout);
                    rubiksCubeTimeoutArray.forEach((timeout) => { clearTimeout(timeout); });
                    Utils.outPutLog(this.outputTextarea, `${currentJDDate.toLocaleString()} 已关闭自动魔方！`, false);
                }
            });
        });
    }
    //叠蛋糕任务
    async cakeBaker(taskType: any, ckObj?: CookieType) {
        taskTimeout = 0;

        let submitTimeout = 0;
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
            arEatCake: any,
            browseShop: any;
        let nick = Config.multiFlag ? `${ckObj!["mark"]}:` : "";
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
                    Utils.outPutLog(this.outputTextarea, `${nick}【获取蛋糕首页信息失败，请手动刷新或联系作者！】`, false);
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
                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~获取蛋糕任务信息1异常，请刷新后重新尝试或联系作者！】`, false);
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
                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~获取蛋糕任务信息2异常，请刷新后重新尝试或联系作者！】`, false);
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
                    case cakeBakerTaskEnum.AR吃蛋糕:
                        arEatCake = getTaskDetailJson.data.result.taskVos[i];
                        break;
                }
            }
        }
        else {
            Utils.debugInfo(consoleEnum.log, getTaskDetailJson);
            Utils.outPutLog(this.outputTextarea, `${nick}【获取蛋糕任务信息1请求失败，请手动刷新或联系作者！】`, false);
        }
        //任务分组2
        if ((getFeedDetailJson.code == 0 || getFeedDetailJson.msg == "调用成功") && getFeedDetailJson.data.success) {
            browseShop = getFeedDetailJson.data.result[cakeBakerTaskEnum.逛店铺][0];
        }
        else {
            Utils.debugInfo(consoleEnum.log, getFeedDetailJson);
            Utils.outPutLog(this.outputTextarea, `${nick}【获取蛋糕任务信息2请求失败，请手动刷新或联系作者！】`, false);
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
                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕小精灵成功！`, false);
                                }
                                else {
                                    Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕小精灵失败，请手动刷新或联系作者！】`, false);
                                }
                            })
                            .catch((error) => {
                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕小精灵异常，请刷新后重新尝试或联系作者！】`, false);
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
                                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕签到成功！`, false);
                            }
                            else {
                                Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕签到失败，请手动刷新或联系作者！】`, false);
                            }
                        })
                        .catch((error) => {
                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕签到异常，请刷新后重新尝试或联系作者！】`, false);
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
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕逛主会场成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, tcdoTaskmongoJson);
                                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛主会场请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛主会场请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛主会场领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛主会场领取异常，请刷新后重新尝试或联系作者！】`, false);
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
                                                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕去逛商品${k + 1}成功！`, false);
                                                                }
                                                                else {
                                                                    Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                                                    Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕去逛商品${k + 1}请求失败，请手动刷新或联系作者！】`, false);
                                                                }
                                                            })
                                                            .catch((error) => {
                                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕去逛商品${k + 1}请求异常，请刷新后重新尝试或联系作者！】`, false);
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
                                Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕去逛商品领取失败，请手动刷新或联系作者！】`, false);
                            }
                        })
                        .catch((error) => {
                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕去逛商品领取异常，请刷新后重新尝试或联系作者！】`, false);
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
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕浏览游戏1成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, tcdoTaskmongoJson);
                                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕浏览游戏1请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕浏览游戏1请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕浏览游戏1领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕浏览游戏1领取异常，请刷新后重新尝试或联系作者！】`, false);
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
                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕浏览游戏2成功！`, false);
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕浏览游戏2请求失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕浏览游戏2请求异常，请刷新后重新尝试或联系作者！】`, false);
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
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕浏览频道成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕浏览频道请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕浏览频道请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕浏览频道领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕浏览频道领取异常，请刷新后重新尝试或联系作者！】`, false);
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
                    if (viewVenue.shoppingActivityVos[j].status == 1) {
                        cakeBakerTimeoutArray.push(setTimeout(() => {
                            if (joinedCount < taskChance) {
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
                                                            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕浏览会场成功！`, false);
                                                        }
                                                        else {
                                                            Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                            Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕浏览会场请求失败，请手动刷新或联系作者！】`, false);
                                                        }
                                                    })
                                                    .catch((error) => {
                                                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                        Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕浏览会场请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                    });
                                            }, Utils.random(9000, 10000));
                                        }
                                        else {
                                            Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                            Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕浏览会场领取失败，请手动刷新或联系作者！】`, false);
                                        }
                                    })
                                    .catch((error) => {
                                        Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕浏览会场领取异常，请刷新后重新尝试或联系作者！】`, false);
                                    });
                            }
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
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕逛金融主会场成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛金融主会场请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛金融主会场请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛金融主会场领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛金融主会场领取异常，请刷新后重新尝试或联系作者！】`, false);
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
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕逛品牌庆生成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛品牌庆生请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛品牌庆生请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛品牌庆生领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛品牌庆生领取异常，请刷新后重新尝试或联系作者！】`, false);
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
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕逛校园会场成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
                                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛校园会场请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛校园会场请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛校园会场领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛校园会场领取异常，请刷新后重新尝试或联系作者！】`, false);
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
                                                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕加购商品${k + 1}成功！`, false);
                                                                }
                                                            })
                                                            .catch((error) => {
                                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕加购商品${k + 1}请求异常，请刷新后重新尝试或联系作者！】`, false);
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
                                Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕加购商品领取失败，请手动刷新或联系作者！】`, false);
                            }
                        })
                        .catch((error) => {
                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕加购商品领取异常，请刷新后重新尝试或联系作者！】`, false);
                        });
                }, taskTimeout));
                taskTimeout += Utils.random(11000, 12000);
            }
        }
        //if (taskType == cakeBakerTaskEnum.AR吃蛋糕 || taskType == cakeBakerTaskEnum.全部) {
        //    if (!!arEatCake && arEatCake.status == 1) {
        //        let joinedCount = +arEatCake.times,
        //            taskChance = +arEatCake.maxTimes;
        //        for (let j = 0; j < taskChance - joinedCount; j++) {
        //            if (arEatCake.status == 1) {
        //                cakeBakerTimeoutArray.push(setTimeout(() => {
        //                    let postData = `&body={\"taskId\":${arEatCake.taskId},\"itemId\":\"${arEatCake.simpleRecordInfoVo.itemId}\",\"safeStr\":\"{\\\"secretp\\\":\\\"${secretp}\\\"}\",\"actionType\":1}&client=wh5&clientVersion=1.0.0`;
        //                    fetch(`${this.rootURI}cakebaker_ckCollectScore${postData}`, {
        //                        method: "POST",
        //                        mode: "cors",
        //                        credentials: "include",
        //                        headers: {
        //                            "Content-Type": "application/x-www-form-urlencoded"
        //                        }
        //                    })
        //                        .then(function (res) { return res.json(); })
        //                        .then((cakebakerckCollectScoreJson) => {
        //                            if ((cakebakerckCollectScoreJson.code == 0 || cakebakerckCollectScoreJson.msg == "调用成功") && cakebakerckCollectScoreJson.data.success) {
        //                                setTimeout(() => {
        //                                    postData = `adid=719BE990-0425-4C06-984C-AF6E27C1111E&area=2_2826_51941_0&body=%7B%22taskToken%22%3A%22${arEatCake.simpleRecordInfoVo.taskToken}%22%7D&appid=publicUseApi`;
        //                                    fetch(`${this.rootURI}tc_doTask_mongo`, {
        //                                        method: "POST",
        //                                        mode: "cors",
        //                                        credentials: "include",
        //                                        headers: {
        //                                            "Content-Type": "application/x-www-form-urlencoded"
        //                                        },
        //                                        body: postData
        //                                    })
        //                                        .then(function (res) { return res.json(); })
        //                                        .then((qryViewkitCallbackResultJson) => {
        //                                            if ((qryViewkitCallbackResultJson.code == 0 || qryViewkitCallbackResultJson.msg == "调用成功") && qryViewkitCallbackResultJson.data.success) {
        //                                                joinedCount++;
        //                                                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕AR吃蛋糕成功！`, false);
        //                                            }
        //                                            else {
        //                                                Utils.debugInfo(consoleEnum.log, qryViewkitCallbackResultJson);
        //                                                Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕AR吃蛋糕请求失败，请手动刷新或联系作者！】`, false);
        //                                            }
        //                                        })
        //                                        .catch((error) => {
        //                                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
        //                                            Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕AR吃蛋糕请求异常，请刷新后重新尝试或联系作者！】`, false);
        //                                        });
        //                                }, Utils.random(9000, 10000));
        //                            }
        //                            else {
        //                                Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
        //                                Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕AR吃蛋糕领取失败，请手动刷新或联系作者！】`, false);
        //                            }
        //                        })
        //                        .catch((error) => {
        //                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
        //                            Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕AR吃蛋糕领取异常，请刷新后重新尝试或联系作者！】`, false);
        //                        });
        //                }, taskTimeout));
        //                taskTimeout += Utils.random(11000, 12000);
        //            }
        //        }
        //    }
        //}
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
                                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】蛋糕逛店铺成功！`, false);
                                                    }
                                                    else {
                                                        Utils.debugInfo(consoleEnum.log, tcdoTaskmongoJson);
                                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛店铺请求失败，请手动刷新或联系作者！】`, false);
                                                    }
                                                })
                                                .catch((error) => {
                                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛店铺请求异常，请刷新后重新尝试或联系作者！】`, false);
                                                });
                                        }, Utils.random(9000, 10000));
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, cakebakerckCollectScoreJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【蛋糕逛店铺领取失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~蛋糕逛店铺领取异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, taskTimeout));
                        taskTimeout += Utils.random(11000, 12000);
                    }
                }
            }
        }
        //叠蛋糕
        if (taskType == cakeBakerTaskEnum.叠蛋糕 || taskType == cakeBakerTaskEnum.全部) {
            cakeBakerTimeoutArray.push(setTimeout(async () => {
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
                                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}叠蛋糕升至${cakebakerRaiseJson.data.result.raiseInfo.scoreLevel}级！`, false);
                            }
                            else {
                                needLevel = false;
                                //Utils.debugInfo(consoleEnum.log, cakebakerRaiseJson);
                                //Utils.outPutLog(this.outputTextarea, `${nick}【叠蛋糕失败，请手动刷新或联系作者！】`, false);
                            }
                        })
                        .catch((error) => {
                            needLevel = false;
                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                            Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~叠蛋糕异常，请刷新后重新尝试或联系作者！】`, false);
                        });
                }
            }, taskTimeout));
        }
    }
    //品牌狂欢城任务
    async carnivalCity(taskType: any, ckObj?: CookieType) {
        carnivalCityTimeOut = 0;

        let uuid = 'ee9a4e872b8043c8c6d550fbdc636823e2096324';
        let getIndexJson: any,
            getTaskJson: any;
        let tPlusShop: any,
            t1ShopList: any,
            featuredShop: any,
            singleSku: any,
            venue: any,
            brandMembers: any,
            exploreSpecies: any;
        let nick = Config.multiFlag ? `${ckObj!["mark"]}:` : "";

        //狂欢任务信息1
        getIndexJson = await fetch(`${this.rootURI}sixOneEight_index&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"opType\":\"1\",\"uuid\":\"${uuid}\"}`,
            {
                method: "GET",
                credentials: "include"
            })
            .then(function (res) { return res.json(); })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~获取狂欢任务信息1异常，请刷新后重新尝试或联系作者！】`, false);
            });
        //狂欢任务信息2
        getTaskJson = await fetch(`${this.rootURI}sixOneEight_taskInfo&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"uuid"\:\"${uuid}\"}`,
            {
                method: "GET",
                credentials: "include"
            })
            .then(function (res) { return res.json(); })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~获取狂欢任务信息2异常，请刷新后重新尝试或联系作者！】`, false);
            });
        //任务分组1
        if ((getIndexJson.code == 0 || getIndexJson.msg == "调用成功") && getIndexJson.data.success) {
            tPlusShop = getIndexJson.data.result.tPlusShopList;
            t1ShopList = getIndexJson.data.result.t1ShopList;
            exploreSpecies = getIndexJson.data.result.continentList;
        }
        else {
            Utils.debugInfo(consoleEnum.log, getIndexJson);
            Utils.outPutLog(this.outputTextarea, `${nick}【获取狂欢任务信息1请求失败，请手动刷新或联系作者！】`, false);
        }
        //任务分组2
        if ((getTaskJson.code == 0 || getTaskJson.msg == "调用成功") && getTaskJson.data.success) {
            featuredShop = getTaskJson.data.result.featuredShopLimitCount;
            singleSku = getTaskJson.data.result.singleSkuInfo;
            brandMembers = getTaskJson.data.result.brandMembersInfo;
            venue = getTaskJson.data.result.venueLimitCount;
        }
        else {
            Utils.debugInfo(consoleEnum.log, getTaskJson);
            Utils.outPutLog(this.outputTextarea, `${nick}【获取狂欢任务信息2请求失败，请手动刷新或联系作者！】`, false);
        }
        //完成任务1
        if (taskType == carnivalCityTaskEnum.今日主推 || taskType == carnivalCityTaskEnum.全部) {
            if (!!tPlusShop) {
                let joinedCount = +getIndexJson.data.result.tPlusCoinTimes,
                    taskChance = +tPlusShop.length;
                for (let i = 0; i < tPlusShop.length; i++) {
                    if (!tPlusShop[i].viewed) {
                        carnivalCityTimeoutArray.push(setTimeout(() => {
                            fetch(`${this.rootURI}sixOneEight_practicalTask&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"source\":4,\"shopId\":${tPlusShop[i].shopId},\"uuid\":\"${uuid}\"}`, {
                                method: "GET",
                                credentials: "include"
                            })
                                .then(function (res) { return res.json(); })
                                .then((practicalTaskJson) => {
                                    if ((practicalTaskJson.code == 0 || practicalTaskJson.msg == "调用成功") && practicalTaskJson.data.success) {
                                        joinedCount++;
                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】狂欢今日主推成功！`, false);
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, practicalTaskJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【狂欢今日主推失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~狂欢今日主推异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, carnivalCityTimeOut));
                        carnivalCityTimeOut += Utils.random(2000, 3000);
                    }
                }
            }
        }
        if (taskType == carnivalCityTaskEnum.今日大牌 || taskType == carnivalCityTaskEnum.全部) {
            if (!!t1ShopList) {
                let joinedCount = +getIndexJson.data.result.t1CoinTimes,
                    taskChance = 20;
                if (joinedCount < taskChance) {
                    for (let i = 0; i < t1ShopList.length; i++) {
                        if (!t1ShopList[i].viewed) {
                            carnivalCityTimeoutArray.push(setTimeout(() => {
                                if (joinedCount < taskChance) {
                                    fetch(`${this.rootURI}sixOneEight_practicalTask&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"source\":5,\"shopId\":${t1ShopList[i].shopId},\"uuid\":\"${uuid}\"}`, {
                                        method: "GET",
                                        credentials: "include"
                                    })
                                        .then(function (res) { return res.json(); })
                                        .then((practicalTaskJson) => {
                                            if ((practicalTaskJson.code == 0 || practicalTaskJson.msg == "调用成功") && practicalTaskJson.data.success) {
                                                joinedCount++;
                                                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】狂欢今日大牌成功！`, false);
                                            }
                                            else {
                                                Utils.debugInfo(consoleEnum.log, practicalTaskJson);
                                                Utils.outPutLog(this.outputTextarea, `${nick}【狂欢今日大牌失败，请手动刷新或联系作者！】`, false);
                                            }
                                        })
                                        .catch((error) => {
                                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                            Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~狂欢今日大牌异常，请刷新后重新尝试或联系作者！】`, false);
                                        });
                                }
                            }, carnivalCityTimeOut));
                            carnivalCityTimeOut += Utils.random(2000, 3000);
                        }
                    }
                }
            }
        }
        if (taskType == carnivalCityTaskEnum.今日精选 || taskType == carnivalCityTaskEnum.全部) {
            let joinedCount = +featuredShop,
                taskChance = 80;
            if (joinedCount < taskChance) {
                for (let i = 0; i < taskChance; i++) {
                    carnivalCityTimeoutArray.push(setTimeout(() => {
                        if (joinedCount < taskChance) {
                            fetch(`${this.rootURI}sixOneEight_practicalTask&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"source\":6,\"uuid\":\"${uuid}\"}`, {
                                method: "GET",
                                credentials: "include"
                            })
                                .then(function (res) { return res.json(); })
                                .then((practicalTaskJson) => {
                                    if ((practicalTaskJson.code == 0 || practicalTaskJson.msg == "调用成功") && practicalTaskJson.data.success) {
                                        joinedCount++;
                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】狂欢今日精选成功！`, false);
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, practicalTaskJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【狂欢今日精选失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~狂欢今日精选异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }, carnivalCityTimeOut));
                    carnivalCityTimeOut += Utils.random(2000, 3000);
                }
            }
        }
        if (taskType == carnivalCityTaskEnum.热卖单品 || taskType == carnivalCityTaskEnum.全部) {
            if (!!singleSku) {
                let joinedCount = +singleSku.skuLimitCount,
                    taskChance = +singleSku.skuList.length;
                for (let i = 0; i < singleSku.skuList.length; i++) {
                    if (!singleSku.skuList[i].visited) {
                        carnivalCityTimeoutArray.push(setTimeout(() => {
                            fetch(`${this.rootURI}sixOneEight_practicalTask&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"source\":8,\"skuId\":${singleSku.skuList[i].skuId},\"uuid\":\"${uuid}\"}`, {
                                method: "GET",
                                credentials: "include"
                            })
                                .then(function (res) { return res.json(); })
                                .then((practicalTaskJson) => {
                                    if ((practicalTaskJson.code == 0 || practicalTaskJson.msg == "调用成功") && practicalTaskJson.data.success) {
                                        joinedCount++;
                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】狂欢热卖单品成功！`, false);
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, practicalTaskJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【狂欢热卖单品失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~狂欢热卖单品异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, carnivalCityTimeOut));
                        carnivalCityTimeOut += Utils.random(2000, 3000);
                    }
                }
            }
        }
        if (taskType == carnivalCityTaskEnum.精选会场 || taskType == carnivalCityTaskEnum.全部) {
            let joinedCount = +venue,
                taskChance = 8;
            if (joinedCount < taskChance) {
                for (let i = 0; i < taskChance; i++) {
                    carnivalCityTimeoutArray.push(setTimeout(() => {
                        if (joinedCount < taskChance) {
                            fetch(`${this.rootURI}sixOneEight_practicalTask&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"source\":9,\"uuid\":\"${uuid}\"}`, {
                                method: "GET",
                                credentials: "include"
                            })
                                .then(function (res) { return res.json(); })
                                .then((practicalTaskJson) => {
                                    if ((practicalTaskJson.code == 0 || practicalTaskJson.msg == "调用成功") && practicalTaskJson.data.success) {
                                        joinedCount++;
                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】狂欢精选会场成功！`, false);
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, practicalTaskJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【狂欢精选会场失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~狂欢精选会场异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }
                    }, carnivalCityTimeOut));
                    carnivalCityTimeOut += Utils.random(2000, 3000);
                }
            }
        }
        //if (taskType == carnivalCityTaskEnum.开通会员 || taskType == carnivalCityTaskEnum.全部) {
        //    if (!!brandMembers) {
        //        let joinedCount = +getTaskJson.data.result.brandMembersInfo.memberLimitCount,
        //            taskChance = +brandMembers.brandMemberList.length;
        //        for (let i = 0; i < brandMembers.brandMemberList.length; i++) {
        //            if (!brandMembers.brandMemberList[i].member) {
        //                carnivalCityTimeoutArray.push(setTimeout(() => {
        //                    fetch(`${this.rootURI}sixOneEight_practicalTask&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"source\":7,\"shopId\":${brandMembers.brandMemberList[i].venderId},\"uuid\":\"${uuid}\"}`, {
        //                        method: "GET",
        //                        credentials: "include"
        //                    })
        //                        .then(function (res) { return res.json(); })
        //                        .then((practicalTaskJson) => {
        //                            if ((practicalTaskJson.code == 0 || practicalTaskJson.msg == "调用成功") && practicalTaskJson.data.success) {
        //                                joinedCount++;
        //                                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】狂欢开通会员成功！`, false);
        //                            }
        //                            else {
        //                                Utils.debugInfo(consoleEnum.log, practicalTaskJson);
        //                                Utils.outPutLog(this.outputTextarea, `${nick}【狂欢开通会员失败，请手动刷新或联系作者！】`, false);
        //                            }
        //                        })
        //                        .catch((error) => {
        //                            Utils.debugInfo(consoleEnum.error, 'request failed', error);
        //                            Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~狂欢开通会员异常，请刷新后重新尝试或联系作者！】`, false);
        //                        });
        //                }, carnivalCityTimeOut));
        //                carnivalCityTimeOut += Utils.random(2000, 3000);
        //            }
        //        }
        //    }
        //}
        if (taskType == carnivalCityTaskEnum.探索物种 || taskType == carnivalCityTaskEnum.全部) {
            if (!!exploreSpecies) {
                let limit = 400;
                let levelCount = Math.floor(+getIndexJson.data.result.homeButton.curCoinNum / limit);
                let continentId = exploreSpecies.find((item: any) => { return item.state == 2 })?.id;
                if (getIndexJson.data.result.homeButton.state == 1 && levelCount > 0) {
                    for (let i = 0; i < levelCount; i++) {
                        carnivalCityTimeoutArray.push(setTimeout(() => {
                            fetch(`${this.rootURI}sixOneEight_getSpecies&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"continentId\":${continentId}}`, {
                                method: "GET",
                                credentials: "include"
                            })
                                .then(function (res) { return res.json(); })
                                .then((getSpeciesJson) => {
                                    if ((getSpeciesJson.code == 0 || getSpeciesJson.msg == "调用成功") && getSpeciesJson.data.success) {

                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}狂欢探索物种成功！`, false);

                                        fetch(`${this.rootURI}sixOneEight_getLottery&clientVersion=1.0.0&client=wh5&uuid=${uuid}&area=2_2826_51941_0&appid=publicUseApi&body={\"type\":2,\"brickId\":\"${continentId}_${getSpeciesJson.data.result.speciesId}\"}`, {
                                            method: "GET",
                                            credentials: "include"
                                        })
                                            .then(function (res) { return res.json(); })
                                            .then((getLotteryJson) => {
                                                if ((getLotteryJson.code == 0 || getLotteryJson.msg == "调用成功") && getLotteryJson.data.success) {
                                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}狂欢探索奖励领取成功！`, false);
                                                }
                                                else {
                                                    Utils.debugInfo(consoleEnum.log, getLotteryJson);
                                                    Utils.outPutLog(this.outputTextarea, `${nick}【狂欢狂欢探索奖励领取失败，请手动刷新或联系作者！】`, false);
                                                }
                                            })
                                            .catch((error) => {
                                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~狂欢狂欢探索奖励领取异常，请刷新后重新尝试或联系作者！】`, false);
                                            });
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, getSpeciesJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【狂欢探索物种失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~狂欢探索物种异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, carnivalCityTimeOut));
                        carnivalCityTimeOut += Utils.random(2000, 3000);
                    }
                }
            }
        }
    }
    //京东小魔方任务
    async rubiksCube(taskType: any, ckObj?: CookieType) {
        rubiksCubeTimeOut = 0;

        let getNewsInteractionInfoJson: any;
        let luckyDraw: any,
            taskSkuInfo: any,
            viewVenue: any,
            followView: any;
        let nick = Config.multiFlag ? `${ckObj!["mark"]}:` : "";
        //魔方任务信息
        getNewsInteractionInfoJson = await fetch(`${this.rootURI}getNewsInteractionInfo&appid=smfe&body={}`,
            {
                method: "GET",
                credentials: "include"
            })
            .then(function (res) { return res.json(); })
            .catch((error) => {
                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~获取魔方任务信息异常，请刷新后重新尝试或联系作者！】`, false);
            });
        //任务分组
        if (getNewsInteractionInfoJson.result.code == 0 || getNewsInteractionInfoJson.result.toast == "响应成功") {
            taskSkuInfo = getNewsInteractionInfoJson.result.taskSkuInfo;
            luckyDraw = getNewsInteractionInfoJson.result.lotteryInfo;

            for (let i = 0; i < getNewsInteractionInfoJson.result.taskPoolInfo.taskList.length; i++) {
                switch (getNewsInteractionInfoJson.result.taskPoolInfo.taskList[i].taskId) {
                    case rubiksCubeTaskEnum.关注浏览:
                        followView = getNewsInteractionInfoJson.result.taskPoolInfo.taskList[i];
                        break;
                    case rubiksCubeTaskEnum.浏览会场:
                        viewVenue = getNewsInteractionInfoJson.result.taskPoolInfo.taskList[i];
                        break;
                }
            }
        }
        else {
            Utils.debugInfo(consoleEnum.log, getNewsInteractionInfoJson);
            Utils.outPutLog(this.outputTextarea, `${nick}【获取魔方任务信息请求失败，请手动刷新或联系作者！】`, false);
        }
        //完成任务
        if (taskType == rubiksCubeTaskEnum.浏览新品 || taskType == rubiksCubeTaskEnum.全部) {
            if (!!taskSkuInfo) {
                let joinedCount = +getNewsInteractionInfoJson.result.taskSkuNum,
                    taskChance = +taskSkuInfo.length;
                for (let i = 0; i < taskChance; i++) {
                    if (taskSkuInfo[i].browseStatus == 0) {
                        rubiksCubeTimeoutArray.push(setTimeout(() => {
                            fetch(`${this.rootURI}viewNewsInteractionSkus&appid=smfe&body={\"sku\":\"${taskSkuInfo[i].skuId}\",\"interactionId\":${getNewsInteractionInfoJson.result.interactionId},\"taskPoolId\":${getNewsInteractionInfoJson.result.taskPoolInfo.taskPoolId}}`, {
                                method: "GET",
                                credentials: "include"
                            })
                                .then(function (res) { return res.json(); })
                                .then((viewNewsInteractionSkusJson) => {
                                    if (viewNewsInteractionSkusJson.result.code == 0) {
                                        joinedCount++;
                                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}【${joinedCount}/${taskChance}】魔方浏览新品成功！`, false);
                                    }
                                    else {
                                        Utils.debugInfo(consoleEnum.log, viewNewsInteractionSkusJson);
                                        Utils.outPutLog(this.outputTextarea, `${nick}【魔方浏览新品失败，请手动刷新或联系作者！】`, false);
                                    }
                                })
                                .catch((error) => {
                                    Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~魔方浏览新品异常，请刷新后重新尝试或联系作者！】`, false);
                                });
                        }, rubiksCubeTimeOut));
                        rubiksCubeTimeOut += Utils.random(2000, 3000);
                    }
                }
            }
        }
        if (taskType == rubiksCubeTaskEnum.关注浏览 || taskType == rubiksCubeTaskEnum.全部) {
            if (!!followView) {
                if (followView.taskStatus == 0) {
                    rubiksCubeTimeoutArray.push(setTimeout(() => {
                        fetch(`${this.rootURI}followViewChannelInteraction&appid=smfe&body={\"interactionId\":${getNewsInteractionInfoJson.result.interactionId},\"taskPoolId\":${getNewsInteractionInfoJson.result.taskPoolInfo.taskPoolId}}`, {
                            method: "GET",
                            credentials: "include"
                        })
                            .then(function (res) { return res.json(); })
                            .then((followViewChannelInteractionJson) => {
                                if (followViewChannelInteractionJson.result.code == 0) {
                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}魔方浏览关注成功！`, false);
                                }
                                else {
                                    Utils.debugInfo(consoleEnum.log, followViewChannelInteractionJson);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【魔方浏览关注失败，请手动刷新或联系作者！】`, false);
                                }
                            })
                            .catch((error) => {
                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~魔方浏览关注异常，请刷新后重新尝试或联系作者！】`, false);
                            });
                    }, rubiksCubeTimeOut));
                    rubiksCubeTimeOut += Utils.random(2000, 3000);
                }
            }
        }
        if (taskType == rubiksCubeTaskEnum.浏览会场 || taskType == rubiksCubeTaskEnum.全部) {
            if (!!viewVenue) {
                if (viewVenue.taskStatus == 0) {
                    rubiksCubeTimeoutArray.push(setTimeout(() => {
                        fetch(`${this.rootURI}executeInteractionTask&appid=smfe&body={\"interactionId\":${getNewsInteractionInfoJson.result.interactionId},\"taskPoolId\":${getNewsInteractionInfoJson.result.taskPoolInfo.taskPoolId},\"taskType\":9}`, {
                            method: "GET",
                            credentials: "include"
                        })
                            .then(function (res) { return res.json(); })
                            .then((executeInteractionTaskJson) => {
                                if (executeInteractionTaskJson.result.code == 0) {
                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}魔方浏览会场成功！`, false);
                                }
                                else {
                                    Utils.debugInfo(consoleEnum.log, executeInteractionTaskJson);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【魔方浏览会场失败，请手动刷新或联系作者！】`, false);
                                }
                            })
                            .catch((error) => {
                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~魔方浏览会场异常，请刷新后重新尝试或联系作者！】`, false);
                            });
                    }, rubiksCubeTimeOut));
                    rubiksCubeTimeOut += Utils.random(2000, 3000);
                }
            }
        }
        if (taskType == rubiksCubeTaskEnum.抽奖 || taskType == rubiksCubeTaskEnum.全部) {
            if (!!luckyDraw) {
                let luckyDrawCount = +luckyDraw.lotteryNum;
                for (let i = 0; i < luckyDrawCount; i++) {
                    rubiksCubeTimeoutArray.push(setTimeout(() => {
                        fetch(`${this.rootURI}getNewsInteractionLotteryInfo&appid=smfe&body={\"interactionId\":${getNewsInteractionInfoJson.result.interactionId}}`, {
                            method: "GET",
                            credentials: "include"
                        })
                            .then(function (res) { return res.text(); })
                            .then((getNewsInteractionLotteryInfoJson) => {
                                let data = JSON.parse(getNewsInteractionLotteryInfoJson);
                                if (data.result.code == 0) {
                                    Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} ${nick}魔方抽奖获得${data.result.lotteryInfo?.name ?? "空气"}${data.result.lotteryInfo?.quantity ?? ""}！`, false);
                                }
                                else {
                                    Utils.debugInfo(consoleEnum.log, getNewsInteractionLotteryInfoJson);
                                    Utils.outPutLog(this.outputTextarea, `${nick}【魔方抽奖失败，请手动刷新或联系作者！】`, false);
                                }
                            })
                            .catch((error) => {
                                Utils.debugInfo(consoleEnum.error, 'request failed', error);
                                Utils.outPutLog(this.outputTextarea, `${nick}【哎呀~魔方抽奖异常，请刷新后重新尝试或联系作者！】`, false);
                            });
                    }, rubiksCubeTimeOut));
                    rubiksCubeTimeOut += Utils.random(2000, 3000);
                }
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