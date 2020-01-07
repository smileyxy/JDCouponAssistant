import Activity from "../interface/Activity";
import Utils from "../utils/utils";
import Config from "../config/config";

let btnControl: HTMLCollectionOf<HTMLButtonElement>;

export default class MonsterNian implements Activity {
    detailurl: string = "https://api.m.jd.com/client.action?functionId=bombnian_getTaskDetail";
    data: any = [];
    timer: number = 1000;
    container: HTMLDivElement;
    params: any;
    outputTextarea: HTMLTextAreaElement;
    constructor(params: any, containerDiv: HTMLDivElement, outputTextarea: HTMLTextAreaElement) {
        this.params = params;
        this.container = containerDiv;
        this.outputTextarea = outputTextarea;
        this.outputTextarea.value = `当你看到这行文字时，说明你还没有配置好浏览器UA！`;
        Config.taskCount = 8;
    }
    get(): void {
        var postData = "functionId=bombnian_getTaskDetail&body={}&client=wh5&clientVersion=1.0.0";
        fetch(this.detailurl, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: postData
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            this.data = res.data.result;
            this.outputTextarea.value = `获取数据成功\n已加购物车：${this.data.taskVos[1]["times"]}/${this.data.taskVos[1]["productInfoVos"].length}\n已逛店铺：${this.data.taskVos[2]["times"]}/${this.data.taskVos[2]["browseShopVo"].length}\n已逛会场：${this.data.taskVos[3]["times"]}/${this.data.taskVos[3]["shoppingActivityVos"].length}\n已参与互动：${this.data.taskVos[4]["times"]}/${this.data.taskVos[4]["shoppingActivityVos"].length}\n已看直播：${this.data.taskVos[5]["times"]}/${this.data.taskVos[5]["shoppingActivityVos"].length}\n已LBS定位：${this.data.taskVos[6]["times"]}/1`;
            this.list();
        })

        btnControl = document.getElementsByTagName('button');
    }

    list(): void {
        const content = document.createElement("div");
        let msg = `
        <div style="margin:10px;">
        <button class="everyday" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">开启每日自动</button>
        <button class="auto" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">一键自动完成</button>
        <button class="raise" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">炸年兽</button>
        <button class="shop" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">逛逛好店</button>
        <button class="product" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">好物加购</button>
        <button class="shopping" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">逛逛会场</button>
        <button class="activity" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">好玩互动</button>
        <button class="video" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">视频直播</button>
        <button class="record" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">LBS定位</button>
        <button class="nianHelp" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">帮作者年兽助力</button>
        <button class="teamHelp" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">帮作者战队助力</button>
        <button class="invite" style = "width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">获取邀请链接</button>
        </div>`;
        // <button class="join" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">加入作者战队</button>
        content.innerHTML = msg;
        this.container.appendChild(content);
        const o = document.querySelector('.shop'),
            n = document.querySelector('.nianHelp'),
            t = document.querySelector('.teamHelp'),
            a = document.querySelector('.activity'),
            v = document.querySelector('.video'),
            r = document.querySelector('.record'),
            s = document.querySelector('.shopping'),
            i = document.querySelector('.invite'),
            // j = document.querySelector('.join'),
            b = document.querySelector('.raise'),
            u = document.querySelector('.auto'),
            l = document.querySelector('.product'),
            d = document.querySelector('.everyday');
 

        o!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动逛逛好店任务！`)
            this.send(this.data.taskVos[2]["browseShopVo"], this.data.taskVos[2]["taskId"], -1, '逛逛好店');
        });
        l!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动好物加购任务！`)
            this.send(this.data.taskVos[1]["productInfoVos"], this.data.taskVos[1]["taskId"], -1, '好物加购');
        });
        s!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动逛逛会场任务！`)
            this.send(this.data.taskVos[3]["shoppingActivityVos"], this.data.taskVos[3]["taskId"], -1, '逛逛会场');
        });
        a!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动好玩互动任务！`)
            this.send(this.data.taskVos[4]["shoppingActivityVos"], this.data.taskVos[4]["taskId"], -1, '好玩互动');
        });
        v!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动视频直播任务！`)
            this.send(this.data.taskVos[5]["shoppingActivityVos"], this.data.taskVos[5]["taskId"], -1, '视频直播');
        });
        r!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动LBS定位任务！`)
            this.send([this.data.taskVos[6]["simpleRecordInfoVo"]], this.data.taskVos[6]["taskId"], -1, 'LBS定位');
        });
        i!.addEventListener('click', () => {
            Utils.copyText(`https://bunearth.m.jd.com/babelDiy/SGFJVMOZADGTQCZWGEYU/4PWgqmrFHunn8C38mJA712fufguU/index.html?shareType=taskHelp&inviteId=${this.data["inviteId"]}&taskId=1&itemId=${this.data["taskVos"][0]["assistTaskDetailVo"]["itemId"]}&shareFrom=key`);
        });
        n!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            this.invite();
        });
        t!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            this.assist();
        });
        // j!.addEventListener('click', () => {
        //     this.join();
        // })
        b!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            this.raise();
        });
        var e = document.createEvent("MouseEvents");
        e.initEvent("click", true, true);
        u!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            var postData = "functionId=bombnian_getTaskDetail&body={}&client=wh5&clientVersion=1.0.0";
            fetch(this.detailurl, {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: postData
            }).then(function (response) {
                return response.json()
            }).then((res) => {
                this.data = res.data.result;
                Utils.outPutLog(this.outputTextarea, `获取数据成功\n已加购物车：${this.data.taskVos[1]["times"]}/${this.data.taskVos[1]["productInfoVos"].length}\n已逛店铺：${this.data.taskVos[2]["times"]}/${this.data.taskVos[2]["browseShopVo"].length}\n已逛会场：${this.data.taskVos[3]["times"]}/${this.data.taskVos[3]["shoppingActivityVos"].length}\n已参与互动：${this.data.taskVos[4]["times"]}/${this.data.taskVos[4]["shoppingActivityVos"].length}\n已看直播：${this.data.taskVos[5]["times"]}/${this.data.taskVos[5]["shoppingActivityVos"].length}\n已LBS定位：${this.data.taskVos[6]["times"]}/1`);
            })
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动完成所有任务！`);
            this.assist(0);
            //this.invite(1);
            this.send(this.data.taskVos[2]["browseShopVo"], this.data.taskVos[2]["taskId"], 1, '逛逛好店');
            this.send(this.data.taskVos[1]["productInfoVos"], this.data.taskVos[1]["taskId"], 2, '好物加购');
            this.send(this.data.taskVos[3]["shoppingActivityVos"], this.data.taskVos[3]["taskId"], 3, '逛逛会场');
            this.send(this.data.taskVos[4]["shoppingActivityVos"], this.data.taskVos[4]["taskId"], 4, '好玩互动');
            this.send(this.data.taskVos[5]["shoppingActivityVos"], this.data.taskVos[5]["taskId"], 5, '视频直播');
            this.send([this.data.taskVos[6]["simpleRecordInfoVo"]], this.data.taskVos[6]["taskId"], 6, 'LBS定位');
            this.raise(7);
            //b!.dispatchEvent(e);
            //o!.dispatchEvent(e);
            //a!.dispatchEvent(e);
            //v!.dispatchEvent(e);
            //s!.dispatchEvent(e);
            //l!.dispatchEvent(e);
        });
        d!.addEventListener('click', () => {
            let startTime = 0,
                detectionInterval = 0;
            Config.autoEveryDay = !Config.autoEveryDay;
            if (Config.autoEveryDay) {
                d!.innerHTML = '取消每日自动';
            }
            else {
                d!.innerHTML = '开启每日自动';
                clearInterval(detectionInterval);
            }
            Utils.outPutLog(this.outputTextarea, `${(Config.autoEveryDay ? '已开启每日自动【每天10点后执行，监测频率30~60分钟/次】' : '已取消每日自动')}`);
            detectionInterval = setInterval(() => {
                fetch(Config.JDTimeInfoURL)
                    .then(function (response) { return response.json() })
                    .then(function (res) {
                        let time = Utils.formatDate2(res.time);
                        if (Config.autoEveryDay) {
                            if (startTime == 0 || (+time > startTime && new Date(+res.time).getHours() >= 10)) {
                                startTime = +time;
                                u!.dispatchEvent(e);
                            }
                        }
                    });
            }, 1800000 + Utils.random(0, 1800000));
        });
    }

    send(data: any, taskId: number, progress: number = -1, taskName: string = "") {
        let self = this,
            sendInterval = 0,
            sendTaskQty = data.length,
            sendNowQty = sendTaskQty;

        sendInterval = setInterval(() => {
            if (progress < 0 || Config.taskProgress == progress) {
                if (sendTaskQty - sendNowQty + 1 <= sendTaskQty) {
                    var postData = `functionId=bombnian_collectScore&body={"taskId":${taskId},"itemId":"${data[sendTaskQty - sendNowQty]["itemId"]}"}&client=wh5&clientVersion=1.0.0`;
                    fetch("https://api.m.jd.com/client.action?functionId=bombnian_collectScore", {
                        method: "POST",
                        mode: "cors",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: postData
                    }).then(function (response) {
                        return response.json()
                    }).then((res) => {
                        Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} 操作成功！任务序号：${sendTaskQty - sendNowQty + 1}/${sendTaskQty}`);
                    }).finally(() => {
                        sendNowQty--;
                    })
                }
                else {
                    clearInterval(sendInterval);
                    Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} ${taskName}任务已完成！`);

                    if (progress >= 0 && Config.taskProgress < Config.taskCount) Config.taskProgress++;
                    if (progress < 0 || Config.taskProgress >= Config.taskCount) {
                        Config.taskProgress = 0;
                        for (let i = 0; i < btnControl.length; i++) {
                            btnControl[i].disabled = false;
                            btnControl[i].style.color = '#fff';
                        }
                    }
                }
            }
        }, Config.timeoutSpan + Utils.random(300, 500));
    }

    invite(progress: number = -1) {
        // var postData =`functionId=bombnian_collectScore&body={"inviteId":"T0kkDJUmGX0Sdet46x7KGSqKNI-klg18GVA8f5s","taskId":1,"itemId":"ASHYV3O7TlGlOXSI"}&client=wh5&clientVersion=1.0.0`;
        var postData = `functionId=bombnian_collectScore&body={"inviteId":"Vl4IS9IxFiFRKK03o2z4N00rIdUjYSNNrNbb33xbWRb_MgJ4eQXThFU","taskId":1,"itemId":"AUWE5m6nEmzUNAGT72X8bww"}&client=wh5&clientVersion=1.0.0`;
        fetch("https://api.m.jd.com/client.action?functionId=bombnian_collectScore", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: postData
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 年兽助力成功！感谢您的帮助！`);

            if (progress >= 0 && Config.taskProgress < Config.taskCount) Config.taskProgress++;
            if (progress < 0 || Config.taskProgress >= Config.taskCount) {
                Config.taskProgress = 0;
                for (let i = 0; i < btnControl.length; i++) {
                    btnControl[i].disabled = false;
                    btnControl[i].style.color = '#fff';
                }
            }
        })
    }

    join() {
        fetch("https://api.m.jd.com/client.action?functionId=bombnian_pk_joinGroup", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `functionId=bombnian_pk_joinGroup&body={"inviteId":"VlU-EZopQidWJ6s2oG2sfIHInYsPApTbtntxKA1MAWPJSGYsX6Se6Dv3","confirmFlag":1}&client=wh5&clientVersion=1.0.0`
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            if (res.data.bizCode == 0) {
                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 操作成功！加入成功！`);
            } else {
                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 操作失败，好像满人了哦！`);
            }
        })
    }

    assist(progress: number = -1) {
        fetch("https://api.m.jd.com/client.action?functionId=bombnian_pk_assistGroup", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `functionId=bombnian_pk_assistGroup&body={"confirmFlag":1,"inviteId":"XUkkFpUhDG0OdMYwozv_YY5SkhEKcO-qgLkW-fbCIbLmH0um0yWFpM2hn4s70aY"}&client=wh5&clientVersion=1.0.0`
        }).then(function (response) {
            return response.json()
        }).then((res) => {
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 战队助力成功！感谢您的帮助！`);

            if (progress >= 0 && Config.taskProgress < Config.taskCount) Config.taskProgress++;
            if (progress < 0 || Config.taskProgress >= Config.taskCount) {
                Config.taskProgress = 0;
                for (let i = 0; i < btnControl.length; i++) {
                    btnControl[i].disabled = false;
                    btnControl[i].style.color = '#fff';
                }
            }
        })
    }

    raise(progress: number = -1) {
        let raiseInterval = 0;

        raiseInterval = setInterval(() => {
            if (progress < 0 || Config.taskProgress == progress) {
                fetch("https://api.m.jd.com/client.action?functionId=bombnian_raise", {
                    method: "POST",
                    mode: "cors",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `functionId=bombnian_raise&body={}&client=wh5&clientVersion=1.0.0`
                }).then(function (response) {
                    return response.json()
                }).then((res) => {
                    if (res.data.bizCode == 0) {
                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 炸年兽操作成功！奖励:${JSON.stringify(res.data.result.levelUpAward.score)}`);
                    } else {
                        clearInterval(raiseInterval);
                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 炸年兽任务已完成！`);

                        if (progress >= 0 && Config.taskProgress < Config.taskCount) Config.taskProgress++;
                        if (progress < 0 || Config.taskProgress >= Config.taskCount) {
                            Config.taskProgress = 0;
                            for (let i = 0; i < btnControl.length; i++) {
                                btnControl[i].disabled = false;
                                btnControl[i].style.color = '#fff';
                            }
                        }
                    }
                })
            }
        }, Config.timeoutSpan + Utils.random(300, 500));
    }
}