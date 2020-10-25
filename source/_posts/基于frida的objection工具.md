---
title: 基于frida的objection工具的使用
tags: frida
categories: frida
abbrlink: 2e5769ea
date: 2020-10-25 22:31:33
---
摘录http://strivemario.work/archives/8eec80c3.html

官方仓库: [objection](https://github.com/sensepost/objection)

------

## 安装前置条件

```
1. python版本 > 3.4
2. pip版本 > 9.0
```

## 安装命令

```
pip3 install objection
```

安装完成后, 直接输入`objection`, 就可以看到食用方法了

## 简单使用一下

- 使用前几个使用tips

    ```
    1. 空格键: 忘记命令直接输入空格键, 会有提示与补全
    2. help: help [command] 会有详细介绍指定命令的作用与例子
    3. jobs: 任务管理系统, 可以方便的查看与删除任务
    ```

- 启动Frida-server并转发端口

- 附加需要调试的app, 进入交互界面

    ```bash
    objection -g [packageName] explore
    ```

- 可以使用该env命令枚举与所讨论的应用程序相关的其他有趣目录: `env`

    ```bash
    com.opera.mini.native on (samsung: 6.0.1) [usb] # env
    
    Name                    Path
    ----------------------  ------------------------------------------------------------
    filesDirectory          /data/user/0/com.opera.mini.native/files
    cacheDirectory          /data/user/0/com.opera.mini.native/cache
    externalCacheDirectory  /storage/emulated/0/Android/data/com.opera.mini.native/cache
    codeCacheDirectory      /data/user/0/com.opera.mini.native/code_cache
    obbDir                  /storage/emulated/0/Android/obb/com.opera.mini.native
    packageCodePath         /data/app/com.opera.mini.native-1/base.apk
    ```

- 我们可以使用以下file download命令从远程文件系统中下载文件:
    `file download [file] [outfile]`

    ```
    com.opera.mini.native on (samsung: 6.0.1) [usb] # file download fhash.dat fhash.dat
    Downloading /data/user/0/com.opera.mini.native/cache/fhash.dat to fhash.dat
    ```

- 可以列出app具有的所有avtivity: `android hooking list activities`

    ```
    com.opera.mini.native on (samsung: 6.0.1) [usb] # android hooking list activities
    com.facebook.ads.AudienceNetworkActivity
    com.google.android.gms.ads.AdActivity
    com.google.android.gms.auth.api.signin.internal.SignInHubActivity
    com.google.android.gms.common.api.GoogleApiActivity
    com.opera.android.AssistActivity
    com.opera.android.MiniActivity
    com.opera.android.ads.AdmobIntentInterceptor
    com.opera.mini.android.Browser
    
    Found 8 classes
    ```

- 启动指定avtivity: `android intent launch_activity [class_activity]`

    ```
    com.opera.mini.native on (samsung: 6.0.1) [usb] # android intent launch_activity com.facebook.ads.AudienceNetworkActivity
    Launching Activity: com.facebook.ads.AudienceNetworkActivity...
    ```

- RPC 调用命令: `curl -s "http://127.0.0.1:8888/rpc/invoke/androidHookingListActivities"`

    ```
    $ curl -s "http://127.0.0.1:8888/rpc/invoke/androidHookingListActivities"
    ["com.reddit.frontpage.StartActivity","com.reddit.frontpage.IntroductionActivity", ... snip ...]
    ```

- RPC调用执行脚本:`url -X POST -H "Content-Type: text/javascript" http://127.0.0.1:8888/script/runonce -d "@script.js"`

    ```bash
    $ cat script.js
    {
        send(Frida.version);
    }
    
    [{"payload":"12.8.0","type":"send"}]
    ```

## API介绍

- Memory 指令

    ```
    memory list modules //枚举当前进程模块
    memory list exports [lib_name] //查看指定模块的导出函数
    memory list exports libart.so --json /root/libart.json //将结果保存到json文件中
    memory search --string --offsets-only //搜索内存
    ```

- android heap

    ```
    //堆内存中搜索指定类的实例, 可以获取该类的实例id
    search instances search instances com.xx.xx.class
    
    //直接调用指定实例下的方法
    android heap execute [ins_id] [func_name]
    
    //自定义frida脚本, 执行实例的方法
    android heap execute [ins_id]
    ```

- root

    ```
    //尝试关闭app的root检测
    android root disable
    
    //尝试模拟root环境
    android root simulate
    ```

- ui

    ```
    //截图
    android ui screenshot [image.png]
    
    //设置FLAG_SECURE权限
    android ui FLAG_SECURE false
    ```

- 内存漫游

    ```
    //列出内存中所有的类
    android hooking list classes
    
    //在内存中所有已加载的类中搜索包含特定关键词的类
    android hooking search classes [search_name] 
    
    //在内存中所有已加载的方法中搜索包含特定关键词的方法
    android hooking search methods [search_name] 
    
    //直接生成hook代码
    android hooking generate simple [class_name]
    ```

- hook 方式

    ```
    /*
    hook指定方法, 如果有重载会hook所有重载,如果有疑问可以看
    --dump-args : 打印参数
    --dump-backtrace : 打印调用栈
    --dump-return : 打印返回值
    */
    //hook类中的方法
    android hooking watch class_method com.xxx.xxx.methodName --dump-args --dump-backtrace --dump-return
    
    //hook指定类, 会打印该类下的所有的调用
    android hooking watch class com.xxx.xxx
    
    //设置返回值(只支持bool类型)
    android hooking set return_value com.xxx.xxx.methodName false
    ```

- Spawn方式Hook

    ```
    objection -g packageName explore --startup-command '[obejection_command]'
    ```

- activity和service操作

    ```
    //枚举activity
    android hooking list activities
    
    //启动activity
    android intent launch_activity [activity_class]
    
    //枚举services
    android hooking list services
    
    //启动services
    android intent launch_service [services_class]
    ```

- 任务管理器

    ```
    //查看任务列表
    jobs list
    
    //关闭任务
    jobs kill [task_id]
    ```

- 关闭app的ssl校验

    ```
    android sslpinning disable
    ```

- 监控系统剪贴板

    ```
    //获取Android剪贴板服务上的句柄并每5秒轮询一次用于数据。 如果发现新数据，与之前的调查不同，则该数据将被转储到屏幕上。
    help android  clipboard
    ```

- 执行命令行

    ```
    help android shell_exec [command]
    ```

- 插件编写 : [objection pluging](https://github.com/sensepost/objection/wiki/Plugins)

## 使用参考

https://www.anquanke.com/post/id/197657