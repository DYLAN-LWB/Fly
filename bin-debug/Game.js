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
        _this._person = new Bitmap("person_png"); //对象
        _this._isFall = false; //判断自由落体时是否需要改变x
        _this._allIdiomArray = []; //所有成语数组
        _this._characterArray = []; //成语拆分成单个文字
        _this._characterTFArray = []; //textField数组
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.createGameScene, _this);
        return _this;
    }
    Game.prototype.createGameScene = function () {
        //常量设置
        this._stageW = this.stage.stageWidth;
        this._stageH = this.stage.stageHeight;
        this.setupViews();
        this.addTouchEvent();
    };
    Game.prototype.setupViews = function () {
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
        this._background = new egret.Sprite;
        this._background.x = -this._stageW;
        this._background.y = -this._stageH;
        this._background.width = 3 * this._stageW;
        this._background.height = 3 * this._stageH;
        this.addChild(this._background);
        var _idiomArray = ["金蝉脱壳", "百里挑一", "背水一战", "天上人间", "不吐不快", "海阔天空", "情非得已", "天下无双", "偷天换日", "八仙过海"];
        var characterString = _idiomArray.join().replace(/,/g, ""); //将单词数组转为字符串,并且去掉所有逗号
        var character = characterString.split(""); //将字母字符串转为数组
        Array.prototype.push.apply(this._characterArray, character); //追加到字母数组
        Array.prototype.push.apply(this._allIdiomArray, _idiomArray); //将请求到的单词添加到大数组
        for (var index = 0; index < this._characterArray.length; index++) {
            var _characterTF = new egret.TextField();
            _characterTF.x = Math.random() * 3 * this._stageW;
            _characterTF.y = Math.random() * 3 * this._stageH;
            _characterTF.width = 80;
            _characterTF.height = 80;
            _characterTF.text = this._characterArray[index];
            _characterTF.size = 35;
            _characterTF.textAlign = egret.HorizontalAlign.CENTER;
            _characterTF.verticalAlign = egret.VerticalAlign.MIDDLE;
            this._background.addChild(_characterTF);
            this._characterTFArray.push(_characterTF);
        }
        //自由落体
        this._person.addEventListener(egret.Event.ENTER_FRAME, this.freeFall, this);
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
        //添加碰撞检测
        this.checkHit();
    };
    //自由落体,改变对象和背景
    Game.prototype.freeFall = function () {
        //手指离开屏幕时x值改变
        if (this._isFall == true) {
            var x = this._touchX < this._touchPersonX ? 2 : -2;
            this._person.x += x;
            this._background.x += x * 2;
            this._person.y += 4;
        }
        this._person.y += 1;
        if (this._person.x < 50)
            this._person.x = 50;
        if (this._person.y < 50)
            this._person.y = 50;
        if (this._person.x > (this._stageW - this._person.width - 50))
            this._person.x = this._stageW - this._person.width - 50;
        if (this._person.y > (this._stageH - this._person.height - 50)) {
            this._person.y = this._stageH - this._person.height - 50;
            this._isFall = false;
        }
        this._background.y -= 4;
        if (this._background.x > 0)
            this._background.x = 0;
        if (this._background.x < -2 * this._stageW)
            this._background.x = -2 * this._stageW;
        if (this._background.y > 0)
            this._background.y = 0;
        if (this._background.y < -2 * this._stageH)
            this._background.y = -2 * this._stageH;
        //添加碰撞检测
        this.checkHit();
    };
    //背景左右移动方向,与对象相反
    Game.prototype.moveBackground = function (isRight, isUp) {
        this._background.x += isRight ? 4 : -4;
        this._background.y += isUp ? 6 : -6;
        if (this._background.x > 0)
            this._background.x = 0;
        if (this._background.x < -2 * this._stageW)
            this._background.x = -2 * this._stageW;
        if (this._background.y > 0)
            this._background.y = 0;
        if (this._background.y < -2 * this._stageH)
            this._background.y = -2 * this._stageH;
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
        console.log(this._characterTFArray[index].text);
        this._background.removeChild(this._characterTFArray[index]);
    };
    return Game;
}(egret.DisplayObjectContainer));
__reflect(Game.prototype, "Game");
//# sourceMappingURL=Game.js.map