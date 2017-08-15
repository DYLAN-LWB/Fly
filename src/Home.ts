class Home extends egret.DisplayObjectContainer {
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
    }

    private _playNumText;	//剩余挑战机会
    private _startButton;	//开始按钮
    private _overButton;	//活动结束
    private _rankButton;	//查看排名
    private _alert;	        //弹窗提示
    private _playCount = -1;  //挑战次数

    private _isPortraitScreen: boolean = true; //竖屏
    private _info = new Info(); //公用信息表

    public _pageUrl = window.location.href;	//获取当前页面地址

    private createGameScene() {

		//屏幕适配
        var ua = window.navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i) == 'micromessenger'){    //微信
            this.stage.setContentSize(this._isPortraitScreen ? 750 : 1218, this._isPortraitScreen ? 1218 : 750);
        } else {
            if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { //判断iPhone|iPad|iPod|iOS
                this.stage.setContentSize(this._isPortraitScreen ? 750 : 1218,this._isPortraitScreen ? 1218 : 750);
            } else if (/(Android)/i.test(navigator.userAgent)) {  //判断Android
                this.stage.setContentSize(this._isPortraitScreen ? 750 : 1334,this._isPortraitScreen ? 1334 : 750);
            }
        }

        //设置背景
        var homeBackground = new Bitmap("bg_png");
        homeBackground.width = this.stage.stageWidth;
		homeBackground.height = this.stage.stageHeight;
        this.addChild(homeBackground);

		//获取用户相关信息
        this.getUserInfo();
        
        //首页显示广告
        //test
        this.addChild(new Advert(this.stage.stageWidth, this.stage.stageHeight, this._isPortraitScreen));
    }
     public getUserInfo() {

        //test app url
        this._pageUrl = "http://ceshi.beisu100.com//actity/11/index.html?uid=3&key=1241ea11b7f3b5bf852b3bbc428ef209&isfrom=1&activitynum=11&timenum=1";
        // alert("this._pageUrl = " + this._pageUrl);

        //解析url参数
        var params = this.getUrlParams();
        this._info._vuid = params["uid"].replace(/"/g,"");
        this._info._key = params["key"].replace(/"/g,"");
        this._info._isfrom = params["isfrom"].replace(/"/g,"");
        this._info._timenum = params["timenum"].replace(/"/g,"");
        this._info._activitynum = params["activitynum"].replace(/"/g,"");

        
        if(this._info._key.length < 8) { //app在排行榜点击重玩 会重新加载首页, 没有id key
            this._info._vuid = localStorage.getItem("vuid").replace(/"/g,"");
            this._info._key = localStorage.getItem("key").replace(/"/g,"");
		    this._info._isfrom = localStorage.getItem("isfrom").replace(/"/g,"");
		    this._info._timenum = localStorage.getItem("timenum").replace(/"/g,"");
		    this._info._activitynum = localStorage.getItem("activitynum").replace(/"/g,"");
        } else {
            //保存信息
            localStorage.setItem("vuid", JSON.stringify(this._info._vuid));
            localStorage.setItem("key", JSON.stringify(this._info._key));
            localStorage.setItem("isfrom", JSON.stringify(this._info._isfrom));
            localStorage.setItem("timenum", JSON.stringify(this._info._timenum));
            localStorage.setItem("activitynum", JSON.stringify(this._info._activitynum));
        }

        if (this._info._key == null) {
			alert("请先登录！");
        }

        //微信端先获取用户剩余挑战次数
        if (parseInt(this._info._isfrom) == 0) {
            this.getNumberOfGames();
        } else { //app直接设置首页页面
            this.setupSubViews();
        }
    }

     //获取用户剩余挑战次数
    private getNumberOfGames() {

        var params = "?vuid=" + this._info._vuid + 
                     "&key=" + this._info._key + 
                     "&timenum=" + this._info._timenum +
                     "&activitynum=" + this._info._activitynum + 
                     "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._canPalyNumber + params, egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function() {
            let result = JSON.parse(request.response);
            // alert(result["code"] + "----" +this._info._canPalyNumber + params);
            console.log(result);
            if (result["code"] == 0) {

                this.setupSubViews();
                this._playCount = result["data"]["num"];
                this._playNumText.text = "您当前有" + this._playCount + "次挑战机会";
                
                if (result["data"]["isend"] != 0) {
                    this.setupOverButton();
                }
            }
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("post error : " + event);
            this._rankButton.touchEnabled = true;
            this._startButton.touchEnabled = true;
        }, this);
    }

    //活动已结束,删除开始游戏按钮,添加活动结束按钮
    private setupOverButton() {
        this.removeChild(this._startButton);
        this._overButton = new Bitmap("gamebody_json.ending");
        this._overButton.x = this._isPortraitScreen ? 180 : 780;
        this._overButton.y = this._isPortraitScreen ? 820 : 570;
        this._overButton.rotation = this._isPortraitScreen ? 0 : -90;
        this._overButton.touchEnabled = true;
        this._overButton.addEventListener(egret.TouchEvent.TOUCH_TAP, function() {
            alert("活动已结束");
        }, this);
        this.addChild(this._overButton);
    }

    private setupSubViews() {

        //规则介绍
        var introduce = new egret.TextField();
        introduce.x = this._isPortraitScreen ? 370 : 365;
        introduce.y = this._isPortraitScreen ? 600 : 375;
        introduce.lineSpacing = 15;
        introduce.width = 600;
        introduce.anchorOffsetX = introduce.width / 2;
        introduce.anchorOffsetY = introduce.height / 2;
        introduce.rotation = this._isPortraitScreen ? 0 : -90;
        this.addChild(introduce);

        //剩余挑战机会
        this._playNumText = new egret.TextField();
        this._playNumText.size = 30;
        this._playNumText.x = this._isPortraitScreen ? 220 : 620;
        this._playNumText.y = this._isPortraitScreen ? 780 : 520;
        this._playNumText.rotation = this._isPortraitScreen ? 0 : -90;
        this._playNumText.textColor = 0x275b51;
        this._playNumText.anchorOffsetX = this._playNumText.width / 2;
        this._playNumText.anchorOffsetY = this._playNumText.height / 2;
        // this._playNumText.text = "您当前有0次挑战机会";
        this.addChild(this._playNumText);

        //开始游戏按钮
        this._startButton = new Bitmap("start_png");
        this._startButton.x = this._isPortraitScreen ? 180 : 700;
        this._startButton.y = this._isPortraitScreen ? 820 : 570;
        this._startButton.rotation = this._isPortraitScreen ? 0 : -90;
        this._startButton.touchEnabled = true;
        this._startButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.startPlayGame, this);
        this.addChild(this._startButton);

        //查看排名按钮
        this._rankButton = new Bitmap("ranking_png");
        this._rankButton.x = this._isPortraitScreen ? 180 : 850;
        this._rankButton.y = this._isPortraitScreen ? 990 : 570;
        this._rankButton.rotation = this._isPortraitScreen ? 0 : -90;
        this._rankButton.touchEnabled = true;
        this._rankButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.checkRanking, this);
        this.addChild(this._rankButton);

		//微信=0 app=1
        if (parseInt(this._info._isfrom) == 0) {
 
            introduce.textFlow = <Array<egret.ITextElement>>[
                { text: "通过手指力度控制倍倍的跳跃轨迹，使其成功捡到单词，单词完整后加速跳跃。按照倍倍走过的最远距离进行排名，排名前50都有红包奖励。此外，还会随机抽取100名发送幸运红包哦~ ",
                    style: {"textColor": 0x185b4e, "size": 28} },
                { text: "分享给好友，让好友为你加油，可增加机会呦~",  
                style: {"textColor": 0xff3a5f, "size": 28} } ];

        } else if (parseInt(this._info._isfrom) == 1) {

            this.removeChild(this._playNumText);

            introduce.x = this._isPortraitScreen ? 370 : 480;
            introduce.y = this._isPortraitScreen ? 450 : 375;
            introduce.text = "通过手指力度控制倍倍的跳跃轨迹，使其成功捡到单词，单词完整后加速跳跃。 ";
 
            this._startButton.x = this._isPortraitScreen ? 180 : 660;
            this._startButton.y = this._isPortraitScreen ? 660 : 570;

            this._rankButton.x = this._isPortraitScreen ? 180 : 850;
            this._rankButton.y = this._isPortraitScreen ? 810 : 570;
        }
    }

	//查看排名
    private checkRanking(evt:egret.TouchEvent) {
        window.location.href = this._info._rankUrl + this._info._timenum + "/activitynum/" + this._info._activitynum + "/vuid/" + this._info._vuid + "/key/" + this._info._key + "/isfrom/" + this._info._isfrom;
    }

	//开始游戏
    private startPlayGame(evt:egret.TouchEvent) {

        //避免重复点击使游戏次数出错
        this._rankButton.touchEnabled = false;
        this._startButton.touchEnabled = false;

        //微信端检查是否关注
        if (parseInt(this._info._isfrom) == 0) {
            if(this._playCount < 1) { //没有次数点击开始游戏时提示分享
                this._alert = new Alert(Alert.HomePageShare, "", "", "",0,this.stage.stageHeight,this.stage.stageWidth);
                this._alert.x = this._isPortraitScreen ? 0 : 0;
                this._alert.y = this._isPortraitScreen ? 0 : 750;
                this._alert.rotation = this._isPortraitScreen ? 0 : -90;
                this._alert.addEventListener(AlertEvent.Share, this.shareButtonClick, this);
                this._alert.addEventListener(AlertEvent.Cancle, this.cancleButtonClick, this);
                this.addChild(this._alert);
            } else {
                this.checkIsAttention();
            }
        } else { //app直接进入游戏页面
            $("#guangao").hide();
            this.removeChildren();
            this.addChild(new Game());
        }
    }

    //检查是否关注
    private checkIsAttention() {

        let params = "?vuid=" + this._info._vuid + "&timenum=" + this._info._timenum + "&activitynum=" + this._info._activitynum + "&isfrom=" + this._info._isfrom;
        let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._hasAttention + params, egret.HttpMethod.GET); 
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function() {
            let result = JSON.parse(request.response);
            console.log(result);
            if (result["code"] == 0) { //已关注
                if (this._playCount > 0) { //已关注并且有游戏次数 进入游戏页面
                    $("#guangao").hide();
                    this.removeChildren();
                    this.addChild(new Game());
                } 
            } else if (result["code"] == 2) { //未关注 进入关注界面
                this._rankButton.touchEnabled = true;
                this._startButton.touchEnabled = true;
                document.getElementById("attention").style.display = "block";
            }

        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("post error : " + event);
            this._rankButton.touchEnabled = true;
            this._startButton.touchEnabled = true;
        }, this);
    }

	//关闭alert
    private cancleButtonClick() {
        this._rankButton.touchEnabled = true;
        this._startButton.touchEnabled = true;
        this.removeChild(this._alert);
    }

	//引导分享
    private shareButtonClick() {
        this.removeChild(this._alert);

        //分享引导图
        let _shareGuide = new Bitmap("shareGui_png");
        _shareGuide.touchEnabled = true;
        _shareGuide.x = this._isPortraitScreen ? 0 : 0;
        _shareGuide.y = this._isPortraitScreen ? 0 : this.stage.stageHeight;
        _shareGuide.width = this._isPortraitScreen ? this.stage.stageWidth : this.stage.stageHeight;
        _shareGuide.height = this._isPortraitScreen ? this.stage.stageHeight : this.stage.stageWidth;
        _shareGuide.rotation = this._isPortraitScreen ? 0 : -90;
        _shareGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, function() {
            //关闭分享引导图片
            this.removeChild(_shareGuide);
            this._rankButton.touchEnabled = true;
            this._startButton.touchEnabled = true;
        }, this);
		this.addChild(_shareGuide);
    }

    //解析接口包含的参数
    public  getUrlParams() {
        var index = this._pageUrl.indexOf("?");
        var content = this._pageUrl.substring(index);
        var url = decodeURIComponent(content);
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);//decodeURI
            }
        }
        return theRequest;
    }
}
