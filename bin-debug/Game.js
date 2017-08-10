var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        var _this = _super.call(this) || this;
        //public
        _this._info = new Info(); //公用信息表
        //this game
        _this._person = new Bitmap("person_png"); //对象
        _this._isFall = false; //判断自由落体时是否需要改变x
        _this._allIdiomArray = []; //所有成语数组
        _this._characterArray = []; //成语拆分成单个文字
        _this._characterTFArray = []; //textField数组
        _this._remindTFArray = []; //成语提词器
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.createGameScene, _this);
        return _this;
    }
    Game.prototype.createGameScene = function () {
        //常量设置
        this._stageW = this.stage.stageWidth;
        this._stageH = this.stage.stageHeight;
        this._scends = 50;
        this._score = 0;
        this._isFall = true;
        this._info._vuid = localStorage.getItem("vuid").replace(/"/g, "");
        this._info._key = localStorage.getItem("key").replace(/"/g, "");
        this._info._isfrom = localStorage.getItem("isfrom").replace(/"/g, "");
        this._info._timenum = localStorage.getItem("timenum").replace(/"/g, "");
        this._info._activitynum = localStorage.getItem("activitynum").replace(/"/g, "");
        //test
        // this.setupViews();
        // this.addTouchEvent();
        //减游戏次数
        this.minusGameCount();
    };
    Game.prototype.setupViews = function () {
        var sound = new egret.Sound();
        sound.addEventListener(egret.Event.COMPLETE, function () {
            this._backgroundChannel = sound.play(0, 0);
            this._backgroundChannel.volume = 0.7;
        }, this);
        sound.load("resource/sound/bg.mp3");
        //添加对象
        this._person.x = 200;
        this._person.y = 300;
        this._person.width = 100;
        this._person.height = 100;
        this.addChild(this._person);
        //提示箭头
        this._guide = new Bitmap("start_png");
        this._guide.x = 200;
        this._guide.y = 200;
        this._guide.width = 100;
        this._guide.height = 15;
        this._guide.alpha = 0;
        this.addChild(this._guide);
        //背景
        this._background = new egret.Sprite;
        this._background.x = -this._stageW;
        this._background.y = 0;
        this._background.width = 3 * this._stageW;
        this._background.height = this._stageH;
        this.addChild(this._background);
        //添加随机文字
        for (var index = 0; index < this._characterArray.length; index++) {
            var _characterTF = new egret.TextField();
            _characterTF.x = Math.random() * (3 * this._stageW - 600) + 300;
            _characterTF.y = Math.random() * (this._stageH - 600) + 300;
            _characterTF.width = 80;
            _characterTF.height = 80;
            _characterTF.text = this._characterArray[index];
            _characterTF.size = 35;
            _characterTF.textColor = 0x000000;
            _characterTF.textAlign = egret.HorizontalAlign.CENTER;
            _characterTF.verticalAlign = egret.VerticalAlign.MIDDLE;
            this._background.addChild(_characterTF);
            this._characterTFArray.push(_characterTF);
        }
        //自由落体
        this._person.addEventListener(egret.Event.ENTER_FRAME, this.freeFall, this);
        //提示成语
        for (var index = 0; index < this._allIdiomArray.length; index++) {
            var _remindTF = new egret.TextField;
            _remindTF.x = 20;
            _remindTF.y = 400 + 25 * index;
            _remindTF.width = 200;
            _remindTF.height = 25;
            _remindTF.textColor = 0xff6600;
            _remindTF.verticalAlign = egret.VerticalAlign.MIDDLE;
            _remindTF.size = 20;
            _remindTF.text = this._allIdiomArray[index];
            _remindTF.fontFamily = "Microsoft YaHei";
            this.addChild(_remindTF);
            this._remindTFArray.push(_remindTF);
        }
        //已经吃的
        this._currentTF = new egret.TextField;
        this._currentTF.x = 0;
        this._currentTF.y = 20;
        this._currentTF.width = this._stageW;
        this._currentTF.height = 50;
        this._currentTF.textColor = 0xff6600;
        this._currentTF.verticalAlign = egret.VerticalAlign.MIDDLE;
        this._currentTF.textAlign = egret.HorizontalAlign.CENTER;
        this._currentTF.size = 35;
        this._currentTF.text = this._allIdiomArray[index];
        this._currentTF.fontFamily = "Microsoft YaHei";
        this.addChild(this._currentTF);
        //倒计时提示
        this._scendsTF = new egret.TextField();
        this._scendsTF.x = this.stage.stageWidth * 0.75;
        this._scendsTF.y = 20;
        this._scendsTF.width = this.stage.stageWidth * 0.25;
        this._scendsTF.height = 55;
        this._scendsTF.fontFamily = "Microsoft YaHei";
        this._scendsTF.textColor = 0xff6c14;
        this._scendsTF.textAlign = egret.HorizontalAlign.CENTER;
        this._scendsTF.size = 50;
        this._scendsTF.text = this._scends + "秒";
        this.addChild(this._scendsTF);
        //游戏计时器
        this._gameTimer = new egret.Timer(1000, this._scends);
        this._gameTimer.addEventListener(egret.TimerEvent.TIMER, this.gameTimerFunc, this);
        this._gameTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.gameTimerCompleteFunc, this);
        this._gameTimer.start();
        //分数提示
        this._scoreTF = new egret.TextField();
        this._scoreTF.x = 33;
        this._scoreTF.y = 20;
        this._scoreTF.width = 333;
        this._scoreTF.height = 55;
        this._scoreTF.textColor = 0x20544a;
        this._scoreTF.textAlign = egret.HorizontalAlign.CENTER;
        this._scoreTF.size = 30;
        this._scoreTF.text = this._score + "分";
        this._scoreTF.fontFamily = "Microsoft YaHei";
        this.addChild(this._scoreTF);
    };
    //添加触摸事件
    Game.prototype.addTouchEvent = function () {
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMove, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);
    };
    //移除触摸事件
    Game.prototype.removeTouchEvent = function () {
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMove, this);
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);
    };
    Game.prototype.touchBegin = function (event) {
        this._isFall = false;
        this._touchX = event.localX;
        this._touchY = event.localY;
        this._touchPersonX = this._person.x;
        this._touchPersonY = this._person.y;
        //触摸时添加帧事件
        this._person.addEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
        //更新箭头方向
        this.rotationGuide();
    };
    Game.prototype.touchMove = function (event) {
        this._isFall = false;
        this._touchX = event.localX;
        this._touchY = event.localY;
        this._touchPersonX = this._person.x;
        this._touchPersonY = this._person.y;
        //更新箭头方向
        this.rotationGuide();
    };
    Game.prototype.touchEnd = function (event) {
        this._isFall = true;
        this._guide.alpha = 0;
        //移除帧事件
        this._person.removeEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
    };
    //实时旋转引导箭头
    Game.prototype.rotationGuide = function () {
        //更改位置
        this._guide.alpha = 1;
        this._guide.x = this._touchX;
        this._guide.y = this._touchY;
        //计算触摸点和当前对象的点构成的连线的夹角弧度 Math.atan2(y2-y1,x2-x1)
        var radian = Math.atan2((this._touchPersonY + this._person.height / 2) - this._touchY, (this._touchPersonX + this._person.width / 2) - this._touchX);
        //把弧度转成角度
        var angle = radian * 180 / Math.PI;
        //旋转箭头图片
        this._guide.rotation = angle;
    };
    //触摸不松手或者移动时的帧事件
    Game.prototype.touchChangeLocation = function () {
        var ratioX = Math.cos((this._touchPersonY - this._touchY) / (this._touchPersonX - this._touchX));
        var ratioY = Math.sin((this._touchPersonY - this._touchY) / (this._touchPersonX - this._touchX));
        var baseX = (1 + Math.abs(ratioX)) * 4;
        var baseY = (1 + Math.abs(ratioY)) * 4;
        var x = this._touchX < this._touchPersonX ? baseX : -baseX;
        var y = this._touchY < this._touchPersonY ? baseY : -baseY;
        this._person.x += x;
        this._person.y += y;
        //改变对象位置时同时移动背景
        this.moveBackground(x > 0 ? false : true, y > 0 ? false : true);
    };
    //自由落体,改变对象和背景
    Game.prototype.freeFall = function () {
        //手指离开屏幕时x值改变
        if (this._isFall == true) {
            var x = this._touchX < this._touchPersonX ? 3 : -3;
            this._person.x += x;
            this._person.y += 7;
        }
        this._person.y += 1;
        if (this._person.x < 150)
            this._person.x = 150;
        if (this._person.y < 150)
            this._person.y = 150;
        if (this._person.x > (this._stageW - this._person.width - 150))
            this._person.x = this._stageW - this._person.width - 150;
        if (this._person.y > (this._stageH - this._person.height - 150)) {
            this._person.y = this._stageH - this._person.height - 150;
            this._isFall = false;
        }
        //添加碰撞检测
        this.checkHit();
    };
    //背景左右移动方向,与对象相反
    Game.prototype.moveBackground = function (isRight, isUp) {
        this._background.x += isRight ? 5 : -5;
        if (this._background.x > 0)
            this._background.x = 0;
        if (this._background.x < -2 * this._stageW)
            this._background.x = -2 * this._stageW;
    };
    //碰撞检测
    Game.prototype.checkHit = function () {
        for (var index = 0; index < this._characterTFArray.length; index++) {
            var _character = this._characterTFArray[index];
            var _isHit = _character.hitTestPoint(this._person.x + this._person.width / 2, this._person.y + this._person.height);
            if (_isHit) {
                this.hitAction(index);
            }
        }
    };
    Game.prototype.hitAction = function (index) {
        //test
        this.plusScore(1);
        this._score += 1;
        this._scoreTF.text = this._score + "分";
        this._currentTF.text += this._characterTFArray[index].text;
        this._background.removeChild(this._characterTFArray[index]);
        this._characterTFArray.splice(index, 1);
        //清空	
        if (this._currentTF.text.length > 4) {
            var character = this._currentTF.text.split(""); //将字母字符串转为数组
            //把清空掉的文字重新添加
            for (var index = 0; index < character.length; index++) {
                var _characterTF = new egret.TextField();
                _characterTF.x = Math.random() * (3 * this._stageW - 600) + 300;
                _characterTF.y = Math.random() * (this._stageH - 600) + 300;
                _characterTF.width = 80;
                _characterTF.height = 80;
                _characterTF.text = this._characterArray[index];
                _characterTF.textColor = 0x000000;
                _characterTF.size = 35;
                _characterTF.textAlign = egret.HorizontalAlign.CENTER;
                _characterTF.verticalAlign = egret.VerticalAlign.MIDDLE;
                this._background.addChild(_characterTF);
                this._characterTFArray.push(_characterTF);
            }
            this._currentTF.text = "";
        }
    };
    //每秒计时
    Game.prototype.gameTimerFunc = function () {
        this._scends--;
        this._scendsTF.text = this._scends + "秒";
        //剩5秒时播放倒计时音乐
        if (this._scends == 5) {
            var sound_1 = new egret.Sound();
            sound_1.addEventListener(egret.Event.COMPLETE, function () {
                this._countdownChannel = sound_1.play(0, 0);
            }, this);
            sound_1.load("resource/sound/countdown.mp3");
        }
    };
    //游戏结束
    Game.prototype.gameTimerCompleteFunc = function () {
        this.removeTouchEvent();
        //请求游戏结束接口
        this.gameOver();
        if (this._countdownChannel)
            this._countdownChannel.stop();
        if (this._backgroundChannel)
            this._backgroundChannel.stop();
        if (this._gameTimer)
            this._gameTimer.stop();
    };
    //接口-减游戏次数
    Game.prototype.minusGameCount = function () {
        var params = "?vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        // alert("减游戏次数接口 - "+this._info._getWord + params);
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._downnum + params, egret.HttpMethod.GET);
        console.log(this._info._downnum + params);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            console.log(result);
            if (result["code"] == 0) {
                this._linnum = parseInt(result["data"]["linnum"]);
                this._rands = result["data"]["rands"].toString();
                this._tid = result["data"]["tid"].toString();
                //请求单词
                this.getWords(1);
            }
            else if (result["code"] == 2) {
                this._overAlert = new Alert(Alert.GamePageShare, "", "", "", 0, this.stage.stageHeight, this.stage.stageWidth);
                this._overAlert.addEventListener(AlertEvent.Share, this.shareButtonClick, this);
                this._overAlert.addEventListener(AlertEvent.Cancle, function () {
                    window.location.reload();
                }, this);
                this.addChild(this._overAlert);
            }
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("post error : " + event);
        }, this);
    };
    //接口-请求单词, 只在初次请求时添加UI
    Game.prototype.getWords = function (type) {
        var params = "?vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&rands=" + this._rands +
            "&isfrom=" + this._info._isfrom;
        // alert("请求单词接口 - "+this._info._getWord + params);
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        console.log(this._info._getWord + params);
        request.open(this._info._getWord + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            console.log(result);
            if (result["code"] == 0) {
                //设置数组		
                var _idiomArray = ["金蝉脱壳", "百里挑一", "背水一战"];
                var characterString = _idiomArray.join().replace(/,/g, ""); //将单词数组转为字符串,并且去掉所有逗号
                var character = characterString.split(""); //将字母字符串转为数组
                Array.prototype.push.apply(this._characterArray, character); //追加到字母数组
                Array.prototype.push.apply(this._allIdiomArray, _idiomArray); //将请求到的单词添加到大数组
                //接口请求成功添加UI
                if (type == 1) {
                    this.setupViews();
                    this.addTouchEvent();
                }
            }
            else {
                alert(result["msg"]);
            }
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("post error : " + event);
        }, this);
    };
    //接口-增加分数
    Game.prototype.plusScore = function (score) {
        var params = "?vuid=" + this._info._vuid +
            "&rands=" + this._rands +
            "&tid=" + this._tid +
            "&md5=" + score +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        console.log(this._info._typosTempjump + params);
        request.open(this._info._typosTempjump + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            // alert(this._info._typosTempjump + "---"+ params + "---"+result["code"] + "---"+result["msg"]);
            console.log(result);
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("post error : " + event);
        }, this);
    };
    //接口-游戏结束
    Game.prototype.gameOver = function () {
        var params = "?score=" + this._score +
            "&vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&rands=" + this._rands +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        // alert("游戏结束接口 - "+this._info._gameover + params);
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        console.log(this._info._gameover + params);
        request.open(this._info._gameover + params, egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            console.log(result);
            var highScore = result["data"]["score"];
            if (this._score > parseInt(highScore)) {
                highScore = this._score;
            }
            this._normalAlert = new Alert(Alert.GamePageScore, this._score.toString(), highScore, result["data"]["order"], result["data"]["text"], this._stageW, this._stageH);
            this._normalAlert.addEventListener(AlertEvent.Ranking, this.checkRanking, this);
            this._normalAlert.addEventListener(AlertEvent.Restart, this.restartGame, this);
            this.addChild(this._normalAlert);
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("post error : " + event);
        }, this);
    };
    //游戏结束alert-查看排名
    Game.prototype.checkRanking = function () {
        console.log("game 查看排名");
        if (this._normalAlert && this._normalAlert.parent) {
            this._normalAlert.parent.removeChild(this._normalAlert);
        }
        // alert("查看排名 - "+this._info._rankUrl + this._info._timenum + "/activitynum/" + this._info._activitynum + "/vuid/" + this._info._vuid + "/key/" + this._info._key + "/isfrom/" + this._info._isfrom);
        window.location.href = this._info._rankUrl + this._info._timenum + "/activitynum/" + this._info._activitynum + "/vuid/" + this._info._vuid + "/key/" + this._info._key + "/isfrom/" + this._info._isfrom;
    };
    //游戏结束alert-重玩
    Game.prototype.restartGame = function () {
        //移动当前场景
        this.removeChildren();
        //重玩时清空数组
        this._allIdiomArray.splice(0, this._allIdiomArray.length);
        this._characterArray.splice(0, this._characterArray.length);
        this._characterTFArray.splice(0, this._characterTFArray.length);
        this._remindTFArray.splice(0, this._remindTFArray.length);
        //重新添加
        this.createGameScene();
    };
    Game.prototype.shareButtonClick = function () {
        //分享引导图
        var _shareGuide = new Bitmap("shareGui2_png");
        _shareGuide.touchEnabled = true;
        _shareGuide.x = 0;
        _shareGuide.y = 0;
        _shareGuide.width = this.stage.stageWidth;
        _shareGuide.height = this.stage.stageHeight;
        _shareGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            this.removeChild(_shareGuide);
        }, this);
        this.addChild(_shareGuide);
    };
    return Game;
}(egret.DisplayObjectContainer));
__reflect(Game.prototype, "Game");
//# sourceMappingURL=Game.js.map