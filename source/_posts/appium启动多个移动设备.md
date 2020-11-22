---
title: appium启动多个移动设备
tags: 自动化测试
categories: 自动化测试
abbrlink: '47341153'
date: 2020-11-22 18:22:18
---
## 元素的判断

from selenium.webdriver.support import expected_conditions as EC


expected_condtions提供了16种判断页面元素的方法：

1.title_is:判断当前页面的title是否完全等于预期字符串，返回布尔值

2.title_contains:判断当前页面的title是否包含预期字符串，返回布尔值

3.presence_of_element_located:判断某个元素是否被加到dom树下,不代表该元素一定可见

4.visibility_of_element_located:判断某个元素是否可见,可见代表元素非隐藏,并且元素的宽和高都不为0

5.visibility_of:跟上面的方法是一样的,只是上面需要传入locator,这个方法直接传定位到的element就好

6.presence_of_all_elements_located:判断是否至少一个元素存在于dom树中,举个例子,如果页面上有n个元素的class都是'coumn-md-3',name只要有一个元素存在,这个方法就返回True

7.text_to_be_present_in_element:判断某个元素中的text文本是否包含预期字符串

8.text_to_be_present_in_element_value:判断某个元素中的value属性值是否包含了预期字符串

9.frame_to_be_availabe_and_switch_to_it:判断该frame是否可以switch进去,如果可以,则返回True并且switch进去,否则返回False

10.invisibility_of_element_located:判断某个元素是否不存在于dom树或不可见

11.element_to_be_clickable:判断某个元素是见并且是enable(有效)的,这样的话才叫clickable

12.staleness_of:等某个元素从dom树下移除,返回True或False

13.element_to_be_selected:判断某个元素是否被选中,一般用于select下拉表

14.element_selection_state_to_be:判断某个元素的选中状态是否符合预期

15.element_located_selection_state_to_be:跟上面的方法一样,只是上面的方法传入定位到的element,这个方法传入locator

16.alert_is_present:判断页面上是会否存在alert

## appium启动多个移动设备

```
## appium初始化的配置

http://appium.io/docs/en/writing-running-appium/caps/

## Parallel Android Tests
https://github.com/appium/appium/blob/master/docs/en/advanced-concepts/parallel-tests.md#parallel-android-tests

## 启动appium服务

appium -a 127.0.0.1 -p 4730  -bp 8201
appium -a 127.0.0.1 -p 4730 -U HT69B0203366 -bp 8201

appium -a 127.0.0.1 -p 4740  -bp 8202
appium -a 127.0.0.1 -p 4740 -U HT69L0206174 -bp 8202

## 卸载
adb uninstall io.appium.uiautomator2.server
adb uninstall io.appium.uiautomator2.server.test
adb uninstall io.appium.settings
## 配置设备
self.desired_caps = {
'platformName': PLATFORM,
'platformVersion': '8.1.0',
'deviceName': "Pixel_XL",
'appPackage': app_package,
'appActivity': app_activity,
'automationName': 'UIAutomator2',
'noReset': True,
'fullReset': False,
'udid': device_id,
'systemPort': 8221, # port from 8200 to 8299
'unicodeKeyboard': True,
'newCommandTimeout': 60*2,
'resetKeyboard': True

}
```

