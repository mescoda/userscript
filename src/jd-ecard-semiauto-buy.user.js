// ==UserScript==
// @name jd-ecard-semiauto-buy
// @namespace jd-ecard-semiauto-buy
// @version 0.0.13
// @author mescoda
// @include *.jd.com/*
// @grant unsafeWindow
// ==/UserScript==

/*
# 方便购买京东 E 卡的脚本

## 安装

安装成功后修改 PAY_PW 字段，为京东支付密码，用于将京东卡绑定到本账户

## 使用

1. 每次使用前请先保证当前浏览器下已经登录京东
2. 访问 http://o.jd.com/ 会弹出输入框，输入想要购买的金额，然后会自行提交订单，直到最后的微信支付扫码页面，扫码支付成功后会重新跳转 o.jd.com，如果继续输入金额会重复当前步骤，如果取消则结束
3. 每天购买成功后，访问我的订单页面，右上角将出现 「open ecard orders belong to today」按钮，点击将自动打开今天所有支付成功的 E 卡订单，然后会自动将 E 卡绑定到帐号。注意 Chrome 默认会禁止打开多个 tab，初次点击按钮后，请选择「总是允许弹窗」

 */

/* global unsafeWindow */

const PAY_PW = '';

(w => {

    let handler = () => {
        let hostname = location.hostname;
        let pathname = location.pathname;

        // buy first step
        if (hostname === 'o.jd.com' && pathname === '/') {
            let buy = w.prompt();
            if (buy) {
                document.querySelector('#eletricPrice').value = buy;
                document.querySelector('#eletricValue').innerHTML = buy;
                document.querySelector('.add-list').click();
                setTimeout(() => {
                    window.location = 'http://giftcard.jd.com/cart/index.action';
                }, 500);
            }

        // buy 1.5 step
        } else if (hostname === 'giftcard.jd.com' && pathname === '/cart/index.action') {
            document.querySelector('#gotoacc').click();

        // buy second step
        } else if (hostname === 'giftcard.jd.com' && pathname === '/giftcardpurchase/indexNew') {
            document.querySelector('.checkout-submit').click();

        // buy third step
        } else if (hostname === 'pcashier.jd.com' && pathname === '/cashier/index.action') {
            setTimeout(() => {
                document.querySelector('.pc-w-left a').click();
            }, 600);

        // buy result
        } else if (hostname === 'pcashier.jd.com' && pathname === '/success/payResult.action') {
            window.location = 'http://o.jd.com';

        // orderlist
        } else if (hostname === 'order.jd.com' && pathname === '/center/list.action') {

            let pad = num => {
                return num < 10 ? '0' + num : num;
            };

            let openOrdersHander = () => {
                let now = new Date();
                let todayDate = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
                let orderElems = document.querySelectorAll('.order-tb tbody');

                [].forEach.call(orderElems, elem => {

                    // make sure it's single order
                    if (elem.id.split('-')[0] === 'tb') {
                        let date = elem.querySelector('.dealtime').textContent.trim().split(' ')[0];
                        let title = elem.querySelector('.p-name').textContent.trim();
                        let status = elem.querySelector('.status .order-status').textContent.trim();
                        if (
                            date === todayDate
                            && title.slice(0, 3) === '自定义'
                            && status === '已完成'
                        ) {
                            let href = elem.querySelector('.status a').getAttribute('href');
                            window.open(href);
                        }
                    }

                });
            };

            let buttonHTMl = ''
                + '<button style="position: fixed; top: 10px; right: 10px; z-index:99999;" id="m-jde-openorders">'
                + 'open ecard orders belong to today'
                + '</button>';

            let div = document.createElement('div');
            div.innerHTML = buttonHTMl;
            document.body.appendChild(div);
            document.querySelector('#m-jde-openorders').addEventListener('click', openOrdersHander, false);

        // detail: bind ecard
        } else if (location.hostname === 'details.jd.com' && location.pathname === '/normal/item.action') {
            document.querySelector('#coupwd').value = PAY_PW;
            document.querySelector('.view-btn').click();

            setTimeout(() => {
                document.querySelector('.bind-btn').click();
                setTimeout(() => {
                    document.querySelector('.btn-red').click();
                }, 500);
            }, 500);
        // new detail: bind ecard
        } else if (location.hostname === 'giftcard.jd.com' && location.pathname === '/ecardorder/getOrderDetail.action') {
            // document.querySelector('#paypwd').value = PAY_PW;
            // document.querySelector('.getCards').click();
            // setTimeout(() => {
                // 发现现在不需要输入密码也能激活
                document.querySelector('#allbind').click();
                setTimeout(() => {
                    document.querySelector('#bindconfirm').click();
                }, 500);
            // }, 500);
        }
    };

    if (document.readyState === 'complete') {
        handler();
    } else {
        window.addEventListener('load', handler, false);
    }

})(unsafeWindow);
