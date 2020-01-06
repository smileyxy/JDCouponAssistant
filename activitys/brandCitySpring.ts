import Activity from "../interface/Activity";
import Utils from "../utils/utils";
import Config from "../config/config";

let btnControl: HTMLCollectionOf<HTMLButtonElement>;

export default class BrandCitySpring implements Activity {
    url: string = "https://api.m.jd.com/client.action";
    params: any;
    container: HTMLDivElement;
    outputTextarea: HTMLTextAreaElement;
    constructor(params: any, containerDiv: HTMLDivElement, outputTextarea: HTMLTextAreaElement) {
        this.params = params;
        this.container = containerDiv;
        this.outputTextarea = outputTextarea;
        Config.taskCount = 3;
    }
    get(): void {
        this.list();

        btnControl = document.getElementsByTagName('button');
    }
    list(): void {
        const content = document.createElement("div");
        let msg = `
        <div style="margin:10px;">
	    <button class="everyday" style="width: 200px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">开启每日自动</button>
        <button class="auto" style="width: 200px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">一键自动完成</button>
        <button class="visit" style="width: 200px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">浏览店铺</button>
        <button class="linkgame" style="width: 200px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">小游戏</button>
        <button class="exchange" style="width: 200px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">福币兑换</button></div>`;

        content.innerHTML = msg;
        this.container.appendChild(content);
        const e = document.querySelector('.exchange'),
            v = document.querySelector('.visit'),
            g = document.querySelector('.linkgame'),
            a = document.querySelector('.auto'),
            d = document.querySelector('.everyday');

        e!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动福币兑换`);
            this.send();
        });
        v!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动浏览店铺`);
            this.visit();
        });
        g!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动小游戏`);
            this.game();
        });
        a!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动完成所有任务`);
            this.visit(0);
            this.game(1);
            this.send(2);
        });
        var ent = document.createEvent("MouseEvents");
        ent.initEvent("click", true, true);
        d!.addEventListener('click', () => {
            let startTime = 0;
            Config.autoEveryDay = !Config.autoEveryDay;
            d!.innerHTML = Config.autoEveryDay ? '取消每日自动' : '开启每日自动';
            Utils.outPutLog(this.outputTextarea, `${(Config.autoEveryDay ? '已开启每日自动【开启后立即执行一次，往后每天10点后执行，监测频率30~60分钟/次】' : '已取消每日自动')}`);
            setInterval(() => {
                fetch(Config.JDTimeInfoURL)
                    .then(function (response) { return response.json() })
                    .then(function (res) {
                        let time = Utils.formatDate2(res.time);
                        if (Config.autoEveryDay) {
                            if (startTime == 0 || (+time > startTime && new Date(+res.time).getHours() >= 10)) {
                                startTime = +time;
                                a!.dispatchEvent(ent);
                            }
                        }
                    });
            }, (startTime == 0 ? Config.timeoutSpan : 1800000 + Utils.random(0, 1800000)));
        });
    }

    send(progress: number = -1): void {
        let self = this,
            sendInterval = 0,
            sendTaskQty = 12,
            sendNowQty = sendTaskQty;

        sendInterval = setInterval(() => {
            if (progress < 0 || Config.taskProgress == progress) {
                if (sendTaskQty - sendNowQty + 1 <= sendTaskQty) {
                    let postData = {
                        "clientVersion": "1.0.0",
                        "client": "wh5",
                        "uuid": "15727505818691431184273",
                        "area": "",
                        "appid": "publicUseApi",
                        "functionId": "brandcity_spring_getLottery",
                        "body": { "actionType": 2, "taskId": `${sendTaskQty - sendNowQty + 1}` }
                    };
                    fetch(`${self.url}?${Utils.stringify(postData)}`, { credentials: "include" }).then(function (response) {
                        return response.json()
                    }).then((res) => {
                        Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} 操作成功！任务序号：${sendTaskQty - sendNowQty + 1}/${sendTaskQty}`);
                    }).finally(() => {
                        sendNowQty--;
                    })
                }
                else {
                    Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} 福币兑换任务已完成`);

                    if (progress >= 0 && Config.taskProgress < Config.taskCount) Config.taskProgress++;
                    if (progress < 0 || Config.taskProgress >= Config.taskCount) {
                        Config.taskProgress = 0;
                        for (let i = 0; i < btnControl.length; i++) {
                            btnControl[i].disabled = false;
                            btnControl[i].style.color = '#fff';
                        }
                    }

                    clearInterval(sendInterval);
                }
            }
        }, Config.timeoutSpan + Utils.random(300, 500));
    }
    
    visit(progress: number = -1): void {
        let self = this,
            visitInterval = 0,
            visitTaskQty = 80,
            visitNowQty = visitTaskQty;

        visitInterval = setInterval(() => {
            if (progress < 0 || Config.taskProgress == progress) {
                if (visitTaskQty - visitNowQty + 1 <= visitTaskQty) {
                    let postData = {
                        "clientVersion": "1.0.0",
                        "client": "wh5",
                        "uuid": "15727505818691431184273",
                        "area": "",
                        "appid": "publicUseApi",
                        "functionId": "brandcity_spring_randomVisit",
                        "body": { "uuid": "15727505818691431184273" }
                    };
                    fetch(`${self.url}?${Utils.stringify(postData)}`, { credentials: "include" }).then(function (response) {
                        return response.json()
                    }).then((res) => {
                        Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} 操作成功！任务序号：${visitTaskQty - visitNowQty + 1}/${visitTaskQty}`);
                    }).finally(() => {
                        visitNowQty--;
                    })
                }
                else {
                    Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} 浏览店铺任务已完成`);

                    if (progress >= 0 && Config.taskProgress < Config.taskCount) Config.taskProgress++;
                    if (progress < 0 || Config.taskProgress >= Config.taskCount) {
                        Config.taskProgress = 0;
                        for (let i = 0; i < btnControl.length; i++) {
                            btnControl[i].disabled = false;
                            btnControl[i].style.color = '#fff';
                        }
                    }

                    clearInterval(visitInterval);
                }
            }
        }, Config.timeoutSpan + Utils.random(300, 500));
    }

    game(progress: number = -1): void {
        let self = this,
            gameInterval = 0,
            gameTaskQty = 6,
            gameNowQty = gameTaskQty;

        gameInterval = setInterval(() => {
            if (progress < 0 || Config.taskProgress == progress) {
                if (gameTaskQty - gameNowQty + 1 <= gameTaskQty) {
                    let postData = {
                        "clientVersion": "1.0.0",
                        "client": "wh5",
                        "uuid": "15727505818691431184273",
                        "area": "",
                        "appid": "publicUseApi",
                        "functionId": "brandcity_spring_getLottery",
                        "body": { "actionType": 4, "taskId": gameTaskQty - gameNowQty + 1 }
                    };
                    fetch(`${self.url}?${Utils.stringify(postData)}`, { credentials: "include" }).then(function (response) {
                        return response.json()
                    }).then((res) => {
                        Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} 操作成功！任务序号：${gameTaskQty - gameNowQty + 1}/${gameTaskQty}`);
                    }).finally(() => {
                        gameNowQty--;
                    })
                }
                else {
                    Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} 小游戏任务已完成`);

                    if (progress >= 0 && Config.taskProgress < Config.taskCount) Config.taskProgress++;
                    if (progress < 0 || Config.taskProgress >= Config.taskCount) {
                        Config.taskProgress = 0;
                        for (let i = 0; i < btnControl.length; i++) {
                            btnControl[i].disabled = false;
                            btnControl[i].style.color = '#fff';
                        }
                    }

                    clearInterval(gameInterval);
                }
            }
        }, Config.timeoutSpan + Utils.random(300, 500));
    }
}