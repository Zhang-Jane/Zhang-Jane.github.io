---
title: python调用js代码
categories: 爬虫
abbrlink: 8d64ccf8
date: 2020-10-26 13:56:41
---
# 1.pyexecjs

- 安装`pip install PyExecJS`
- 用法：
    - `import execjs 
        execjs.eval(js代码)
        或者
        js = js代码
        ctx = execjs.compile(js)
        result = ctx.call(js函数，参数)
        `
- 存在的问题：
    - 执行编码的输入输出操作出现报错
        - 解决方案，可以把参数使用base64编码一下
    - 执行大型js会慢

# 2.selenium

- 用法
    - `js = “js代码” result = browser.execute_script(js)`

# 3.pyppeteer

- 用法

    - ```python
        await page.evaluate("""
            () =>{
                Object.defineProperties(navigator,{
                    webdriver:{
                    get: () => false
                    }
                })
            }
        """)
        ```

    - ```python
        # -*- coding: utf-8 -*-
        import asyncio
        import time
        from pyppeteer.launcher import launch
        '''
        pip uninstall websockets
        pip install websockets==6.0
        
        '''
        from utils_bag.exe_js import js1, js3, js4, js5
        from fake_useragent import UserAgent
        
        loop = asyncio.get_event_loop()
        
        
        async def main(url, img_addr, index):
            cookies = []
            # browser = await launch({'headless': False, 'args':
            # ['--proxy-server='.format(proxy)], 'executablePath':
            # 'chrome-win/chrome.exe', })
            browser = await launch({'headless': False, 'args': ['--no-sandbox'], 'executablePath': r'chrome-win\chrome.exe', })
            page = await browser.newPage()
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36')
            await page.goto(url)
            time.sleep(5)
            for cookie in cookies:
                await page.setCookie(cookie)
            await page.goto(url)
            await page.evaluateOnNewDocument('() =>{ Object.defineProperties(navigator,'
                                             '{ webdriver:{ get: () => false } }) }')
            await page.evaluate(js1)
            await page.evaluate(js3)
            await page.evaluate(js4)
            await page.evaluate(js5)
            try:
                await page.click('#sufei-dialog-close')
            except Exception as e:
                print(e)
            time.sleep(5)
            try:
                print('-------------------')
                await page.evaluate('''(function () {
                                    var y = 0;
                                    var step = 100;
                                    window.scroll(0, 0);
                                    function f() {
                                        if (y < document.body.scrollHeight) {
                                            y += step;
                                            window.scroll(0, y);
                                            setTimeout(f, 100);
                                        } else {
                                            window.scroll(0, 0);
                                            document.title += "scroll-done";
                                        }
                                    }
                                    setTimeout(f, 1000);
                                })();
                            ''')
            except Exception as err:
                print(err)
            # js_border = '''
            #         a1 = document.querySelectorAll('.tshop-pbsm-shop-srch-list .grid .item3line1 .item .detail a.item-name, .tshop-pbsm-shop-srch-list .rmd-bd .item3line1 .item .detail a.item-name, .tshop-pbsm-shop-srch-list .grid .item30line1 .item .detail a.item-name, .tshop-pbsm-shop-srch-list .rmd-bd .item30line1 .item .detail a.item-name, .tshop-pbsm-shop-srch-list .grid .item4line1 .item .detail a.item-name, .tshop-pbsm-shop-srch-list .rmd-bd .item4line1 .item .detail a.item-name');
            #         a1[{}].style.color="red";
            #         a1[{}].style.textDecoration='underline';
            #         a2 = document.querySelectorAll('.tshop-pbsm-shop-srch-list .grid .item3line1 .item .photo a img, .tshop-pbsm-shop-srch-list .rmd-bd .item3line1 .item .photo a img');
            #         a2[{}].style = 'border-bottom-color:green;border:5px solid black';
            #         a2[{}].style = 'border-bottom-color:green;border:5px solid black';
            # '''.format(index)
            # await page.evaluate(js_border)
            position = await page.evaluate('''
                () => {
                a2 = document.querySelectorAll('.tshop-pbsm-shop-srch-list .grid .item3line1 .item .photo a img, .tshop-pbsm-shop-srch-list .rmd-bd .item3line1 .item .photo a img')
                p = a2[%s].getBoundingClientRect()
                return {
                left:p["left"],
                right:p["right"],
                top:p["top"],
                bottom:p["bottom"],
        
                }
                }
            ''' % (index))
            time.sleep(10)
            await page.screenshot({
                "path": '{}'.format(img_addr),
                "fullPage": True
            })
            time.sleep(10)
            await browser.close()
            return position
        
        
        def callback(task):
            return task.result()
        
        def screenshot(url, img_addr, index=1):
            coroutine = main(url, img_addr, index)
            task = loop.create_task(coroutine)
            task.add_done_callback(callback)
            loop.run_until_complete(task)
            result = task.result()
            return result
        
        
        if __name__ == '__main__':
            screenshot(
                'https://shop449187140.taobao.com/search.htm?pageNo=2',
                "./sqs.png")
        
        ```

        

# 4.nodejs

- 方案
    - 所有的python代码直接用js写，不在跨语言
    - rpc
        - 使用nodejs的Express框架搭建个服务，然后用python调用
- 缺点
    - nodejs中没有window对象
        - 需要自己创建，或者使用jsdom之类的库
    - base64中window.btoa,btoa() 方法用于创建一个base64编码的字符串。

# 5.pip install PyJSCaller

## https://github.com/ZSAIm/PyJSCaller

```js
import jscaller
example_js= """
function add(a, b){
	return a + b;
}
"""

ctx = jscaller.compile('example.js', timeout=3)
print(ctx.call('add', 1, 1))

with jscaller.session('example.js') as sess:
    add, math = sess.get('add', 'Math')
    res1 = add(2, 3)
    res2 = math.PI + math.E
    sess.call(res1, res2)

print(res1.get_value())
print(res2.get_value())
print(jscaller.eval("'Hello World!'.toUpperCase()"))

2
5
5.859874482048838
HELLO WORLD!
```



# 6.python

直接引用npm包，解决一些加密包的依赖问题。

我的目录：

````
│  js_aes.py
│  package-lock.json
│
└  node_modules

````

代码：

```python
import execjs
from Crypto.Cipher import AES
from binascii import b2a_hex, a2b_hex

text = '123'

def js_aes(text):
    """
    引用nodejs的原生aes加密
    :param text:
    :return:
    """
    jscode = """
    function encryptByAES(pwd) {
        var cryptoJS = require("crypto-js");

        let i = cryptoJS.enc.Utf8.parse("12345678901234561234567890123456");
        let t = cryptoJS.enc.Utf8.parse(pwd);
        let o = cryptoJS.enc.Utf8.parse("1234567890123456");
        return cryptoJS.AES.encrypt(t, i, {
                    iv: o,
                    mode: cryptoJS.mode.CBC,
                    padding: cryptoJS.pad.Pkcs7
                }).ciphertext.toString()
    }
    """
    ctx = execjs.compile(jscode)
    encrypto = ctx.call("encryptByAES", text)

    return encrypto

print(js_aes(text))

def py_aes(text):
    """
    python3的aes加密
    :param text:
    :return:
    """
    key = b"12345678901234561234567890123456"  # 长度必须为16
    text = text.encode("utf-8")
    iv_str = "1234567890123456"
    iv = "16-Bytes--String"
    cryptor = AES.new(key, AES.MODE_CBC, iv=iv_str.encode())
    pad = 16 - len(text) % 16
    text = text + (chr(pad) * pad).encode("utf-8")  # 相当于JS里面的 padding: cryptoJS.pad.Pkcs7
    ciphertext = cryptor.encrypt(text)

    return b2a_hex(ciphertext).decode("utf-8")

print(py_aes(text))
```




