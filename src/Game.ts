class Game extends egret.DisplayObjectContainer {
	public constructor() {
		super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
	}


	private createGameScene() {


		this.setupSubViews();

		this.addTouchEvent();
	}


	private _stageW;	//舞台宽度
	private _stageH;	//舞台高度
	private _person = new Bitmap("person_png");	//对象
	private _isFall = false;	//判断自由落体时是否需要改变x
	private _guide;		//触摸点提示箭头

	private setupSubViews() {

		//常量设置
		this._stageW = this.stage.stageWidth;
		this._stageH = this.stage.stageHeight;

		//舞台背景色
		let background = new egret.Sprite;
        background.graphics.beginFill(0xF08080,1);
        background.graphics.drawRect(0,0,this._stageW,this._stageH);
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
	}

	//添加触摸事件
	private addTouchEvent() {
		this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
		this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMove, this);
		this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);
	}

	//移除触摸事件
	private removeTouchEvent() {
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMove, this);
		this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);
	}

	private _touchX;	//触摸点x
	private _touchY;	//触摸点y
	private _touchPersonX;	//触摸时对象的x值
	private _touchPersonY;	//触摸时对象的y值

	private touchBegin(event: egret.TouchEvent) {
		this._isFall = false;

		this._touchX = event.localX;
		this._touchY = event.localY;
		this._touchPersonX = this._person.x;
		this._touchPersonY = this._person.y;

		this._person.addEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);

		this.rotationGuide();
	}

	private touchMove(event: egret.TouchEvent) { 
		this._isFall = false;
		this._touchX = event.localX;
		this._touchY = event.localY;
		this._touchPersonX = this._person.x;
		this._touchPersonY = this._person.y;

		this.rotationGuide();
	}

	private touchEnd(event: egret.TouchEvent) { 
		this._isFall = true;
		this._guide.alpha = 0;
	}

	//实时旋转引导箭头
	private rotationGuide() {
		//更改位置
		this._guide.alpha = 1;
		this._guide.x = this._touchX;
		this._guide.y = this._touchY;

		//计算触摸点和当前对象的点构成的连线的夹角弧度
		var radian = Math.atan2((this._touchPersonY+this._person.height/2)-this._touchY,(this._touchPersonX+this._person.width/2)-this._touchX);
		//把弧度转成角度
		var angle = radian * 180 / Math.PI;
		//旋转箭头图片
		this._guide.rotation = angle;
	}

	//触摸时的帧事件
	private touchChangeLocation() {
		
		var ratioX = Math.cos((this._touchPersonY - this._touchY)/(this._touchPersonX - this._touchX));
		var ratioY = Math.sin((this._touchPersonY - this._touchY)/(this._touchPersonX - this._touchX));

		var baseX = (1+Math.abs(ratioX)) * 3; 
		var baseY = (1+Math.abs(ratioY)) * 3; 

		var x = this._touchX < this._touchPersonX ? baseX : -baseX;
		var y = this._touchY < this._touchPersonY ? baseY : -baseY;
		
		this._person.x += x;
		this._person.y += y;
	}

	//自由落体
	private freeFall() {
		//手指离开屏幕时x值改变
		if(this._isFall == true) {
			this._person.x += this._touchX < this._touchPersonX ? 2 : -2;
			this._person.removeEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
		} 
		
		this._person.y += 2;

		if(this._person.x < 50)  this._person.x = 50;
		if(this._person.y < 50)  this._person.y = 50;
		if(this._person.x > (this._stageW-150)) this._person.x = this._stageW-150;
		if(this._person.y > (this._stageH-150)) {
			this._person.y = this._stageH-150;
			this._isFall = false;
		}
	}



}