import Coupon from "../interface/Coupon";
type couponDetails = {
    couponBusinessId: string
    platform: string
    title: string
    detail: string
}

export default class WhiteCoupon implements Coupon {
    url: string = "https://opencredit.jd.com/act/get/coupon?couponBusinessId={couponBusinessId}&actId=004";
    detailurl: string = "http://opencredit.jd.com/act/get/couponInfo?couponBusinessId={couponBusinessId}";
    couponList: couponDetails[] = [];
    container: HTMLDivElement;
    couponParams: any;
    outputTextarea: HTMLTextAreaElement;
    constructor(couponParams: any, containerDiv: HTMLDivElement, outputTextarea: HTMLTextAreaElement) {
        this.couponParams = couponParams;
        this.container = containerDiv;
        this.outputTextarea = outputTextarea;
    }
    get(): void {
        this.couponList = [];
        let url = this.detailurl.replace("{couponBusinessId}", this.couponParams.couponBusinessId);
        fetch(url)
            .then((res) => { return res.json() })
            .then((json) => {
                const data = JSON.parse(json["data"])["baiCouponInfo"];
                if (json.isSuccess) {
                    this.couponList.push({
                        couponBusinessId: JSON.parse(json["data"])["baiCouponDetailsNext"].couponBusinessId,
                        platform: data.platform,
                        title: data.title,
                        detail: data.detail,
                    });
                    this.list();
                } else {
                    alert("请检查该页面优惠券的有效性！");
                }
            });
    }
    list(): void {
        const content = document.createElement("div");
        content.innerHTML = "<h3 style='border-bottom: 1px solid #2196F3;display: inline-block;margin-top: 5px;padding: 0 37.5vw 5px;'>优惠券</h3>";
        content.setAttribute('style', 'display:flex;flex-direction:column;padding: 5px;margin-top: 5px;border: 1px solid #000;');
        for (let i = 0; i < this.couponList.length; i++) {
            const item = this.couponList[i],
                itemDiv = document.createElement("div");
            itemDiv.setAttribute('style', 'padding:10px 0;border-bottom:1px solid #999');
            itemDiv.innerHTML = `<h3>${item.title}</h3><p>${item.detail}</p><p>可用范围：${item.platform}</p>
                                <button style="width: 80px;height:30px;background-color: #2196F3;border-radius: 5px;border: 0;">
                                    <a href='http://opencredit.jd.com/act/get/coupon?couponBusinessId=${item.couponBusinessId}&actId=004' target="_blank" style="color: #fff;text-decoration: none;">直接领取</a>
                                </button>`;
            content.appendChild(itemDiv);
        }
        this.container.appendChild(content);
    }
    send(): void {
        this.outputTextarea.style.display = "block";
        for (let i = 0; i < this.couponList.length; i++) {
            let item = this.couponList[i], url = this.url.replace("{couponBusinessId}",item.couponBusinessId);
            fetch(url)
                .then((res) => { return res.json() })
                .then((json) => {
                    let resultMsg = '';
                    switch (parseInt(json.responseCode)) {
                        case 2:
                        case 999:
                        case 13002:
                        case 13007:
                        case 13009:
                            resultMsg = '啊喔，出问题了，请稍候再试';
                            break;
                        case 2000:
                            resultMsg = '用户未登录';
                            break;
                        case 13001:
                            resultMsg = '领取成功，感谢您的参与';
                            break;
                        case 13004:
                        case 13015:
                            resultMsg = '您不满足领取条件';
                            break;
                        case 13005:
                            resultMsg = '您未开通小白信用，不满足领取条件';
                            break;
                        case 13008:
                            resultMsg = '您曾经开通过小白信用，不满足领取条件';
                            break;
                        case 13010:
                            resultMsg = '操作太快了喔';
                            break;
                        case 13011:
                            resultMsg = '活动未开始';
                            break;
                        case 13012:
                            resultMsg = '活动已结束';
                            break;
                        case 13013:
                            resultMsg = '本时段优惠券已抢光';
                            break;
                        default:
                            resultMsg = '优惠券已抢光';
                            break;
                    }
                    //if (json.isSuccess) {
                    //    this.outputTextarea.value = `第${i + 1}张 领券结果:领取成功！}\n` + this.outputTextarea.value;
                    //} else {
                    //    this.outputTextarea.value = `第${i + 1}张 领券结果:领取失败！\n` + this.outputTextarea.value;
                    //}
                    this.outputTextarea.value = `领券结果:${resultMsg}！\n` + this.outputTextarea.value;
                });
        }
    }


}