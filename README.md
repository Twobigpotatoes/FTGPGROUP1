运行步骤
---

### fq安装metamask
安装metamask要fq，全局代理一下呗
fq地址：http://miao.sdmone.pro/user

metamask下载地址：https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn

#### 安装nodejs
使用最新LTS版本，下载地址：https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi

#### 安装ganache
下载地址：https://www.trufflesuite.com/ganache

配置ganache：NEW WORKSPACE，端口8545，链ID 1337，关闭AUTOMINE，设置MINING BLOCK TIME为10秒

#### 安装依赖
```bash

# 安装过了，不再演示
npm install yarn truffle -g

# 进入项目根目录
yarn
```

#### 部署合约
```bash
truffle migrate --reset
```

#### 配置metamask
添加localhost网络，端口8545，链ID 1337。然后切换到localhost网络，导入ganache第一个账户的私钥

#### 启动前端
```bash
cd web
yarn
yarn dev
```


出块时间是10秒，也就是提交后，最多最多等10秒会打包交易，如果想打包快，可以改成5秒 1秒，但是电脑会很卡我的CPU有点差，所以就不改了
如果是自动出块，会有问题，因为block.timestamp不会自动刷新，所以只能间隔出块，也不是太卡 3秒还可以接受，有点卡了
刚刚撤单了，改成15秒，也就是说2个截止时间都可能会有最大15秒误差，现在是投注时间截止，已经不能投注了
你测试，投注截止可以适当改大点，因为我开发期间需要高频测试，所以部署合约的时候设置得很小
截止时间以这个为准，记住，最新的block时间

我还没搞懂为什么要弹4个弹窗，同样的，暂时先这样吧

我重新部署

时间没到  不能公开，强行公开也不会成功