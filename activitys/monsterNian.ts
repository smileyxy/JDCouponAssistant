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
        Config.taskCount = 7;
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
        <button class="raise" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">一键炸年兽</button>
        <button class="shop" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">逛逛好店</button>
        <button class="product" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">好物加购</button>
        <button class="shopping" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">逛逛会场</button>
        <button class="activity" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">好玩互动</button>
        <button class="video" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">视频直播</button>
        <button class="record" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">LBS定位</button>
        <button class="help" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">帮作者助力</button>
        <button class="invite" style = "width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">获取邀请链接</button>
        <button class="auto" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">一键完成任务</button>
        </div>`;
        // <button class="join" style="width: 120px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;color:#fff;margin:5px auto;display:block">加入作者战队</button>
        content.innerHTML = msg;
        this.container.appendChild(content);
        const o = document.querySelector('.shop'),
            h = document.querySelector('.help'),
            a = document.querySelector('.activity'),
            v = document.querySelector('.video'),
            r = document.querySelector('.record'),
            s = document.querySelector('.shopping'),
            i = document.querySelector('.invite'),
            // j = document.querySelector('.join'),
            b = document.querySelector('.raise'),
            u = document.querySelector('.auto'),
            l = document.querySelector('.product');
 

        o!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动逛逛好店任务`)
            this.send(this.data.taskVos[2]["browseShopVo"], this.data.taskVos[2]["taskId"]);
        });
        l!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动好物加购任务`)
            this.send(this.data.taskVos[1]["productInfoVos"], this.data.taskVos[1]["taskId"]);
        });
        s!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动逛逛会场任务`)
            this.send(this.data.taskVos[3]["shoppingActivityVos"], this.data.taskVos[3]["taskId"]);
        });
        a!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动好玩互动任务`)
            this.send(this.data.taskVos[4]["shoppingActivityVos"], this.data.taskVos[4]["taskId"]);
        });
        v!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动视频直播任务`)
            this.send(this.data.taskVos[5]["shoppingActivityVos"], this.data.taskVos[5]["taskId"]);
        });
        r!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 开始自动LBS定位任务`)
            this.send([this.data.taskVos[6]["simpleRecordInfoVo"]], this.data.taskVos[6]["taskId"]);
        });
        i!.addEventListener('click', () => {
            Utils.copyText(`https://bunearth.m.jd.com/babelDiy/SGFJVMOZADGTQCZWGEYU/4PWgqmrFHunn8C38mJA712fufguU/index.html?shareType=taskHelp&inviteId=${this.data["inviteId"]}&taskId=1&itemId=${this.data["taskVos"][0]["assistTaskDetailVo"]["itemId"]}&shareFrom=key`);
        })
        h!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            this.invite();
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
        })
        //var e = document.createEvent("MouseEvents");
        //e.initEvent("click", true, true);
        u!.addEventListener('click', () => {
            for (let i = 0; i < btnControl.length; i++) {
                btnControl[i].disabled = true;
                btnControl[i].style.color = '#c1c1c1';
            }
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 一键自动开始任务！`);
            this.invite();
            this.send(this.data.taskVos[2]["browseShopVo"], this.data.taskVos[2]["taskId"], 0, '逛逛好店');
            this.send(this.data.taskVos[1]["productInfoVos"], this.data.taskVos[1]["taskId"], 1, '好物加购');
            this.send(this.data.taskVos[3]["shoppingActivityVos"], this.data.taskVos[3]["taskId"], 2, '逛逛会场');
            this.send(this.data.taskVos[4]["shoppingActivityVos"], this.data.taskVos[4]["taskId"], 3, '好玩互动');
            this.send(this.data.taskVos[5]["shoppingActivityVos"], this.data.taskVos[5]["taskId"], 4, '视频直播');
            this.send([this.data.taskVos[6]["simpleRecordInfoVo"]], this.data.taskVos[6]["taskId"], 5, 'LBS定位');
            this.raise(6);
            //b!.dispatchEvent(e);
            //o!.dispatchEvent(e);
            //a!.dispatchEvent(e);
            //v!.dispatchEvent(e);
            //s!.dispatchEvent(e);
            //l!.dispatchEvent(e);
        })
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
                    Utils.outPutLog(self.outputTextarea, `${new Date().toLocaleString()} ${taskName}任务已完成`);

                    (progress < 0 || Config.taskProgress >= Config.taskCount) ? Config.taskProgress = 0 : Config.taskProgress++;

                    for (let i = 0; i < btnControl.length; i++) {
                        btnControl[i].disabled = false;
                        btnControl[i].style.color = '#fff';
                    }

                    clearInterval(sendInterval);
                }
            }
        }, Config.timeoutSpan + Utils.random(300, 500));
    }

    invite() {
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
            Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 助力成功！感谢您的帮助！`);
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
                Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 操作失败，好像满人了哦`);
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
                        Utils.outPutLog(this.outputTextarea, `${new Date().toLocaleString()} 炸年兽操作失败！${res.data.bizMsg}`);

                        clearInterval(raiseInterval);
                    }
                })
            }
        }, Config.timeoutSpan + Utils.random(300, 500));
    }
}