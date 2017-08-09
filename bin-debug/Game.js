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
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.createGameScene, _this);
        return _this;
    }
    Game.prototype.createGameScene = function () {
        this.setupSubViews();
        this.addTouchEvent();
    };
    Game.prototype.setupSubViews = function () {
        //常量设置
        this._stageW = this.stage.stageWidth;
        this._stageH = this.stage.stageHeight;
        //舞台背景色
        var background = new egret.Sprite;
        background.graphics.beginFill(0xF08080, 1);
        background.graphics.drawRect(0, 0, this._stageW, this._stageH);
        background.graphics.endFill();
        this.addChild(background);
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
        this._person.addEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
        this.rotationGuide();
    };
    Game.prototype.touchMove = function (event) {
        this._isFall = false;
        this._touchX = event.localX;
        this._touchY = event.localY;
        this._touchPersonX = this._person.x;
        this._touchPersonY = this._person.y;
        this.rotationGuide();
    };
    Game.prototype.touchEnd = function (event) {
        this._isFall = true;
        this._guide.alpha = 0;
    };
    //实时旋转引导箭头
    Game.prototype.rotationGuide = function () {
        //更改位置
        this._guide.alpha = 1;
        this._guide.x = this._touchX;
        this._guide.y = this._touchY;
        //计算触摸点和当前对象的点构成的连线的夹角弧度
        var radian = Math.atan2((this._touchPersonY + this._person.height / 2) - this._touchY, (this._touchPersonX + this._person.width / 2) - this._touchX);
        //把弧度转成角度
        var angle = radian * 180 / Math.PI;
        //旋转箭头图片
        this._guide.rotation = angle;
    };
    //触摸时的帧事件
    Game.prototype.touchChangeLocation = function () {
        var ratioX = Math.cos((this._touchPersonY - this._touchY) / (this._touchPersonX - this._touchX));
        var ratioY = Math.sin((this._touchPersonY - this._touchY) / (this._touchPersonX - this._touchX));
        var baseX = (1 + Math.abs(ratioX)) * 3;
        var baseY = (1 + Math.abs(ratioY)) * 3;
        var x = this._touchX < this._touchPersonX ? baseX : -baseX;
        var y = this._touchY < this._touchPersonY ? baseY : -baseY;
        this._person.x += x;
        this._person.y += y;
    };
    //自由落体
    Game.prototype.freeFall = function () {
        //手指离开屏幕时x值改变
        if (this._isFall == true) {
            this._person.x += this._touchX < this._touchPersonX ? 2 : -2;
            this._person.removeEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
        }
        this._person.y += 2;
        if (this._person.x < 50)
            this._person.x = 50;
        if (this._person.y < 50)
            this._person.y = 50;
        if (this._person.x > (this._stageW - 150))
            this._person.x = this._stageW - 150;
        if (this._person.y > (this._stageH - 150)) {
            this._person.y = this._stageH - 150;
            this._isFall = false;
        }
    };
    return Game;
}(egret.DisplayObjectContainer));
__reflect(Game.prototype, "Game");
//# sourceMappingURL=Game.js.map