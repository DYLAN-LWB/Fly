class Game extends egret.DisplayObjectContainer {
	public constructor() {
		super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
	}

	//public
    private _info = new Info(); //公用信息表
	private _linnum: number;	//剩余挑战次数
	private _rands: string;		//随机字符串,提交分数时加	
	private _tid: string;
	private _normalAlert;
	private _score;						//分数
	private _scoreTF: egret.TextField;		//分数文字

	private _stageW;	//舞台宽度
	private _stageH;	//舞台高度

	private _scends;					//游戏默认180秒
	private _scendsTF: egret.TextField;		//倒计时文字
	private _gameTimer: egret.Timer;			//游戏倒计时计时器
	private _countdownChannel: egret.SoundChannel;	//倒计时结束的声音
	private _backgroundChannel: egret.SoundChannel;	//游戏背景音乐

	private _background; 	//游戏背景

	//this game
	private _person = new Bitmap("person_png");	//对象
	private _bubble = new Bitmap("papaw_png");
	private _isFall = false;	//判断自由落体时是否需要改变x
	private _guide;		//触摸点提示箭头

	private _allIdiomArray = [];	//所有成语数组
	private _currentIdiomArray = [];	//当前提示的成语
	private _characterArray = [];	//成语拆分成单个文字
	private _characterTFArray = [];	//textField数组
	private _characterBgArray = [];	//textField背景数组
	// private _remindTFArray = [];	//成语提词器
	private _barrierArray = [];
	private _currentTF;	//当前吃到的成语

	private _isHitBarrier = false;

	private _clear = new Bitmap("magic_png");	//对象


	private createGameScene() {

		//常量设置
		this._stageW = this.stage.stageWidth;
		this._stageH = this.stage.stageHeight;
		this._scends = 180;
        this._score = 0;
		this._isFall  = true;

		this._info._vuid = localStorage.getItem("vuid").replace(/"/g,"");
		this._info._key = localStorage.getItem("key").replace(/"/g,"");
		this._info._isfrom = localStorage.getItem("isfrom").replace(/"/g,"");
		this._info._timenum = localStorage.getItem("timenum").replace(/"/g,"");
		this._info._activitynum = localStorage.getItem("activitynum").replace(/"/g,"");

		//test
		// let _idiomArray = ["1111","2222","3333","4444","5555","6666","7777"];
		// Array.prototype.push.apply(this._allIdiomArray, _idiomArray); 	//将请求到的单词添加到大数组
		// this._currentIdiomArray.push(this._allIdiomArray[0]);	//将前两个添加到数组
		// this._currentIdiomArray.push(this._allIdiomArray[1]);
		// this._allIdiomArray.splice(0,2);	//添加完后删除
		// let characterString = this._currentIdiomArray.join().replace(/,/g,""); 	//将单词数组转为字符串,并且去掉所有逗号
		// let character = characterString.split("");	//将字母字符串转为数组
		// Array.prototype.push.apply(this._characterArray, character); 	//追加到字母数组


		// this.setupViews();
		// this.addTouchEvent();

		//http://ceshi.beisu100.com/liweibin/Fly/index.html
		//减游戏次数
		this.minusGameCount();
	}

	private setupViews() {

		let sound = new egret.Sound();
		sound.addEventListener(egret.Event.COMPLETE, function() {
			this._backgroundChannel = sound.play(0,0);
			this._backgroundChannel.volume = 0.8;
		}, this);
		// sound.load("resource/sound/bg.mp3");

		//背景图片
		let bg = new Bitmap("bg_jpg");
		bg.x = 0;
		bg.y = 0;
		bg.width = this._stageW;
		bg.height = this._stageH;
		this.addChild(bg);

		//背景
		this._background = new egret.Sprite;
		this._background.x = -this._stageW;
		this._background.y = 0;
		this._background.width = 3*this._stageW;
		this._background.height = this._stageH;
        this.addChild(this._background);


		//添加障碍物
		this.addBarrier();

		//添加文字相关
		this.addCharacter();

		//添加对象
		this._person.x = 300;
		this._person.y = 500;
		this._person.width = 80;
		this._person.height = 80;
		this.addChild(this._person);

		this._bubble.x = 280;
		this._bubble.y = 480;
		this._bubble.width = 120;
		this._bubble.height = 120;
		this.addChild(this._bubble);

		//提示箭头
		this._guide = new Bitmap("guide1_png");
		this._guide.x = 200;
		this._guide.y = 200;
		this._guide.width = 100;
		this._guide.height = 100;
		this._guide.alpha = 0;
		this.addChild(this._guide);

		//自由落体
		this._person.addEventListener(egret.Event.ENTER_FRAME, this.freeFall, this);

		//清空
		this._clear.x = Math.random()*(3*this._stageW - 800) + 400; //随机x 300 ~ 3W-600	
		this._clear.y = Math.random()*(this._stageH - 600) + 300; //随机y 300 ~ H-600	
		this._clear.width = 80;
		this._clear.height = 80;
		this._background.addChild(this._clear);

		//提示当前的成语
		// for(var index = 0; index < this._currentIdiomArray.length; index++) {
		// 	let _remindTF = new egret.TextField;
		// 	_remindTF.x = 20;
		// 	_remindTF.y = 400 + 25*index;
		// 	_remindTF.width = 200;
		// 	_remindTF.height = 25;
		// 	_remindTF.textColor = 0xff6600;
		// 	_remindTF.verticalAlign = egret.VerticalAlign.MIDDLE;
		// 	_remindTF.size = 20;
		// 	_remindTF.text = this._currentIdiomArray[index];
		// 	_remindTF.fontFamily = "Microsoft YaHei";
		// 	// this.addChild(_remindTF);

		// 	this._remindTFArray.push(_remindTF);
		// }

		let my_word  = new egret.TextField;
		my_word.x = 0;
		my_word.y = 250;
		my_word.width = this._stageW/2;
		my_word.height = 50;
		my_word.textColor = 0xffffff;
		my_word.verticalAlign = egret.VerticalAlign.MIDDLE;
		my_word.textAlign = egret.HorizontalAlign.RIGHT;
		my_word.size = 35;
		my_word.text = "我的成语："
		my_word.fontFamily = "Microsoft YaHei";
		this.addChild(my_word);

		//已经吃的提示
		this._currentTF  = new egret.TextField;
		this._currentTF.x = this._stageW/2;
		this._currentTF.y = 250;
		this._currentTF.width = this._stageW/2;
		this._currentTF.height = 50;
		this._currentTF.textColor = 0xFFFF00;
		this._currentTF.verticalAlign = egret.VerticalAlign.MIDDLE;
		this._currentTF.textAlign = egret.HorizontalAlign.LEFT;
		this._currentTF.size = 35;
		this._currentTF.text = ""
		this._currentTF.fontFamily = "Microsoft YaHei";
		this.addChild(this._currentTF);

		//分数提示
		this._scoreTF = new egret.TextField();
		this._scoreTF.x = 90;
		this._scoreTF.y = 35;
		this._scoreTF.width = 333;
		this._scoreTF.height = 55;
        this._scoreTF.textColor = 0xff6c14;
		this._scoreTF.textAlign =  egret.HorizontalAlign.CENTER;
        this._scoreTF.size = 40;
        this._scoreTF.text = this._score + "分";
		this._scoreTF.fontFamily = "Microsoft YaHei"
        this.addChild(this._scoreTF);
				
		//倒计时提示
		this._scendsTF = new egret.TextField();
		this._scendsTF.x = this.stage.stageWidth*0.85;
		this._scendsTF.y = 35;
		this._scendsTF.width = this.stage.stageWidth*0.15;
		this._scendsTF.height = 55;
    	this._scendsTF.fontFamily = "Microsoft YaHei"
        this._scendsTF.textColor = 0xff6c14;
		this._scendsTF.textAlign =  egret.HorizontalAlign.CENTER;
        this._scendsTF.size = 40;
        this._scendsTF.text = this._scends;
        this.addChild(this._scendsTF);

		//游戏计时器
		this._gameTimer = new egret.Timer(1000, this._scends);
        this._gameTimer.addEventListener(egret.TimerEvent.TIMER, this.gameTimerFunc, this);
        this._gameTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.gameTimerCompleteFunc, this);
        this._gameTimer.start();
	}

	private _topBarrier = new Bitmap("bg1_png");
	private _bottomBarrier = new Bitmap("bg2_png");

	//添加障碍物
	private addBarrier() {
		//上边障碍物
		this._topBarrier.x = 0;
		this._topBarrier.y = 110;
		this._topBarrier.width = this._stageW;
		this._topBarrier.height = 144;
		this.addChild(this._topBarrier);

		this._bottomBarrier.x = 0;
		this._bottomBarrier.y = this._stageH- 144;
		this._bottomBarrier.width = this._stageW;
		this._bottomBarrier.height = 144;
		this.addChild(this._bottomBarrier);

		//随机障碍物
		if(this._barrierArray.length > 0) {
			for(var index = 0; index < 3; index++) {
				if(this._barrierArray[index] && this._barrierArray[index].parent) {
					this._barrierArray[index].parent.removeChild(this._barrierArray[index])
				};	
				this._barrierArray.splice(index, 1);
			}			
		}

		let splice = 3*this._stageW/4;
		for(var index = 0; index < 5; index++) {
			let _barrier  = new Bitmap("monster_png");
			_barrier.x = splice*index + 300;
			_barrier.y = Math.random()*(this._stageH - 600) + 300;
			_barrier.width = 80;
			_barrier.height = 80;
			this._background.addChild(_barrier);

			this._barrierArray.push(_barrier);
		}
	}

	//添加随机文字
	private addCharacter() {

		for(var index = 0; index < this._characterArray.length; index++) {

			let _characterTF  = new egret.TextField();
			_characterTF.x = Math.random()*(3*this._stageW - 800) + 300; //随机x 300 ~ 3W-600	
			_characterTF.y = Math.random()*(this._stageH - 400) + 200; //随机y 300 ~ H-600	
			_characterTF.width = 80;
			_characterTF.height = 80;
			_characterTF.text = this._characterArray[index];
			_characterTF.size = 35;
			_characterTF.textColor = 0xffffff;
			_characterTF.textAlign = egret.HorizontalAlign.CENTER;
			_characterTF.verticalAlign = egret.VerticalAlign.MIDDLE;

			let _charBg = new Bitmap("ball1_png");
			_charBg.x = _characterTF.x;
			_charBg.y = _characterTF.y;
			_charBg.width = 80;
			_charBg.height = 80;
			this._background.addChild(_charBg);

			this._background.addChild(_characterTF);

			//添加到数组
			this._characterTFArray.push(_characterTF);
			this._characterBgArray.push(_charBg);

			//和所有文字tf比较位置
			for(let index = 0; index < this._characterTFArray.length; index++) {
				let characterTF = this._characterTFArray[index];
				let characterBg = this._characterBgArray[index];
				let spaceX = Math.abs(characterTF.x - _characterTF.x);
				let spaceY = Math.abs(characterTF.y - _characterTF.y); 
				if(spaceX < 200 && spaceY < 200) {
					_characterTF.y += _characterTF.y > this._stageH/2 ? -200 : 200;
					_charBg.y += _charBg.y > this._stageH/2 ? -200 : 200;
				}
			}

			//和障碍物xy值比较,避免重叠
			for(let index = 0; index < this._barrierArray.length; index++) {
				let barrier = this._barrierArray[index];
				let spaceX = Math.abs(barrier.x - _characterTF.x);
				let spaceY = Math.abs(barrier.y - _characterTF.y); 
				if(spaceX < 200 && spaceY < 200) {
					_characterTF.y += _characterTF.y > this._stageH/2 ? -200 : 200;
					_charBg.y += _charBg.y > this._stageH/2 ? -200 : 200;
				}
			}

		}
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

		//触摸时添加帧事件
		this._person.addEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);

		//更新箭头方向
		this.rotationGuide();	
	}

	private touchMove(event: egret.TouchEvent) { 
		this._isFall = false;

		this._touchX = event.localX;
		this._touchY = event.localY;
		this._touchPersonX = this._person.x;
		this._touchPersonY = this._person.y;

		//更新箭头方向
		this.rotationGuide();
	}

	private touchEnd(event: egret.TouchEvent) { 
		this._isFall = true;
		this._guide.alpha = 0;
		//移除帧事件
		this._person.removeEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
	}

	//实时旋转引导箭头
	private rotationGuide() {
		//更改位置
		this._guide.alpha = 1;
		this._guide.x = this._touchX;
		this._guide.y = this._touchY;

		//计算触摸点和当前对象的点构成的连线的夹角弧度 Math.atan2(y2-y1,x2-x1)
		var radian = Math.atan2((this._touchPersonY+this._person.height/2)-this._touchY,(this._touchPersonX+this._person.width/2)-this._touchX);
		//把弧度转成角度
		var angle = radian * 180 / Math.PI;
		//旋转箭头图片
		this._guide.rotation = angle;
	}

	//触摸不松手或者移动时的帧事件
	private touchChangeLocation() {

		var ratioX = Math.cos((this._touchPersonY - this._touchY)/(this._touchPersonX - this._touchX));
		var ratioY = Math.sin((this._touchPersonY - this._touchY)/(this._touchPersonX - this._touchX));

		var baseX = (1+Math.abs(ratioX)) * 4; 
		var baseY = (1+Math.abs(ratioY)) * 4; 

		var x = this._touchX < this._touchPersonX ? baseX : -baseX;
		var y = this._touchY < this._touchPersonY ? baseY : -baseY;
		
		this._person.x += x;
		this._person.y += y;

		this._bubble.x = this._person.x - 20;
		this._bubble.y = this._person.y - 20;

		//改变对象位置时同时移动背景
		this.moveBackground(x > 0 ? false : true, y > 0 ? false : true);
	}

	//自由落体,改变对象和背景
	private freeFall() {

		console.log("freefall");
		//手指离开屏幕时x值改变
		if(this._isFall == true) {
			var x = this._touchX < this._touchPersonX ? 3 : -3;
			this._person.x += x;
			this._person.y += 7;
		} 
		
		this._person.y += 1;

		if(this._person.x < 150) {
			this._person.x = 150;
		}
		// if(this._person.y < 150)  this._person.y = 150;
		if(this._person.x > (this._stageW-this._person.width-150)) {
			this._person.x = this._stageW-this._person.width-150;
		}
		// if(this._person.y > (this._stageH-this._person.height-150)) {
		// 	this._person.y = this._stageH-this._person.height-150;
		// }
		
		this._bubble.x = this._person.x - 20;
		this._bubble.y = this._person.y - 20;

		//添加碰撞检测
		this.checkHit();

		//障碍物碰撞检测
		this.checkBarrierHit();

		//清空功能碰撞检测
		this.checkClear();
	}

	//背景左右移动方向,与对象相反
	private moveBackground(isRight:boolean ,isUp:boolean) {
			
		this._background.x += isRight ? 5 : -5;

		if(this._background.x > 0) this._background.x = 0;
		if(this._background.x < -2*this._stageW) this._background.x = -2*this._stageW;
	}

	//碰撞检测
	private checkHit() {

		for(let index = 0; index < this._characterTFArray.length; index++) {

			let _character = this._characterTFArray[index];
			let _isHit: boolean = _character.hitTestPoint(this._person.x+this._person.width/2, this._person.y+this._person.height);
			if(_isHit) {
				this.hitAction(index);
			} 
		}	
	}


	private hitAction(index:number) {

		this._currentTF.text += this._characterTFArray[index].text; 

		//删除该文字的相关数据
		this._background.removeChild(this._characterTFArray[index]);	//移除碰撞文字UI
		this._background.removeChild(this._characterBgArray[index]);	//移除碰撞文字UI
		this._characterTFArray.splice(index, 1);	//移除碰撞文字UI-数组
		this._characterBgArray.splice(index, 1);	//移除碰撞文字UI-数组
		this._characterArray.splice(index,1);		//移除碰撞文字-数组

		//判断是否吃对了
		if(this._currentTF.text.length == 4) {
			this.addNewCharacter();
		}
	}

	//吃对则删除 新增
	private addNewCharacter() {
	
		this.plusScore(1);
		this._score += 1;
		this._scoreTF.text = this._score + "分";

		var newCharacter = [];
		var currentString:string = this._currentTF.text;
		var newRemind = "";

		this._currentTF.text = "";

		var _isRight: boolean = false;

		//查看是否在当前成语数组
		for (let index = 0; index < this._currentIdiomArray.length; index++) {
			
			let string :string = this._currentIdiomArray[index];
			if(currentString == string) {
				console.log("吃对了");
				_isRight = true;

				this._currentIdiomArray.splice(index,1);	//移除该成语数据
				this._currentIdiomArray.push(this._allIdiomArray[0]);	//添加新数据

				//吃对成语增加新的, 吃错增加刚才吃过的
				let characterString = this._allIdiomArray[0].replace(/,/g,""); 	//将单词数组转为字符串,并且去掉所有逗号
				newCharacter = characterString.split("");	//将字母字符串转为数组
				Array.prototype.push.apply(this._characterArray, newCharacter); 	//追加到字母数组
				newRemind = this._allIdiomArray[0];	//新增加的提示成语
				this._allIdiomArray.splice(0,1); //添加第一个之后删除
				if(this._allIdiomArray.length < 5) {
					this.getWords(2);
				}

			}
		}

		if(_isRight == false) {
			console.log("吃错了");
			newCharacter =  currentString.split("");	//将字母字符串转为数组
			Array.prototype.push.apply(this._characterArray, newCharacter); 	//追加到字母数组
		}

		//吃对吃错都得添加新的文字
		for(let num = 0; num < newCharacter.length; num++) {
			let _characterTF  = new egret.TextField();
			_characterTF.x = Math.random()*(3*this._stageW - 800) + 300; //随机x 300 ~ 3W-600	
			_characterTF.y = Math.random()*(this._stageH - 600) + 300; //随机y 300 ~ H-600	
			_characterTF.width = 80;
			_characterTF.height = 80;
			_characterTF.text = newCharacter[num];
			_characterTF.size = 35;
			_characterTF.textColor = 0x000000;
			_characterTF.textAlign = egret.HorizontalAlign.CENTER;
			_characterTF.verticalAlign = egret.VerticalAlign.MIDDLE;

			let _charBg = new Bitmap("ball2_png");
			_charBg.x = _characterTF.x;
			_charBg.y = _characterTF.y;
			_charBg.width = 80;
			_charBg.height = 80;
			this._background.addChild(_charBg);

			this._background.addChild(_characterTF);

			//添加到数组
			this._characterTFArray.push(_characterTF);
			this._characterBgArray.push(_charBg);

			//和所有文字tf比较位置
			for(let index = 0; index < this._characterTFArray.length; index++) {
				let characterTF = this._characterTFArray[index];
				let characterBg = this._characterBgArray[index];
				let spaceX = Math.abs(characterTF.x - _characterTF.x);
				let spaceY = Math.abs(characterTF.y - _characterTF.y); 
				if(spaceX < 200 && spaceY < 200) {
					_characterTF.y += _characterTF.y > this._stageH/2 ? -300 : 300;
					_charBg.y += _charBg.y > this._stageH/2 ? -300 : 300;
				}
			}
			//和障碍物xy值比较,避免重叠
			for(let index = 0; index < this._barrierArray.length; index++) {
				let barrier = this._barrierArray[index];
				let spaceX = Math.abs(barrier.x - _characterTF.x);
				let spaceY = Math.abs(barrier.y - _characterTF.y); 
				if(spaceX < 200 && spaceY < 200) {
					_characterTF.y += _characterTF.y > this._stageH/2 ? -300 : 300;
					_charBg.y += _charBg.y > this._stageH/2 ? -300 : 300;
				}
			}
		}

		//遍历对应的提示, 移除当前吃到的提示成语, 新增提示  吃对才删
		// if(_isRight) {
		// 	for(let number = 0; number < this._remindTFArray.length; number++) {
		// 		let string :string = this._remindTFArray[number].text;
		// 		if(currentString == string) {
		// 			let currentTextField =  this._remindTFArray[number];
		// 			this.removeChild(this._remindTFArray[number]);
		// 			this._remindTFArray.splice(number,1);

		// 			let _remindTF = new egret.TextField;
		// 			_remindTF.x = 20;
		// 			_remindTF.y = currentTextField.y;
		// 			_remindTF.width = 200;
		// 			_remindTF.height = 25;
		// 			_remindTF.textColor = 0xff6600;
		// 			_remindTF.verticalAlign = egret.VerticalAlign.MIDDLE;
		// 			_remindTF.size = 20;
		// 			_remindTF.text = newRemind;
		// 			_remindTF.fontFamily = "Microsoft YaHei";
		// 			this.addChild(_remindTF);
		// 			this._remindTFArray.push(_remindTF);
		// 		}
		// 	}
		// }
	}

	private checkBarrierHit() {

		for(let index = 0; index < this._barrierArray.length; index++) {

			let _barrier = this._barrierArray[index];
			let _isHit: boolean = _barrier.hitTestPoint(this._person.x+this._person.width/2, this._person.y+this._person.height);

			if(_isHit) {
				if(this._isHitBarrier == false) {
					this.gameTimerCompleteFunc();
				}
				this._isHitBarrier = true;
			} 
		}	

		let _isTopHit: boolean = this._topBarrier.hitTestPoint(this._person.x+this._person.width/2, this._person.y+this._person.height);
		let _isBottomHit: boolean = this._bottomBarrier.hitTestPoint(this._person.x+this._person.width/2, this._person.y+this._person.height);
		if(_isTopHit || _isBottomHit) {
			if(this._isHitBarrier == false) {
				this.gameTimerCompleteFunc();
			}
			this._isHitBarrier = true;		
		}
	}


	private checkClear () {
		let _isHit: boolean = this._clear.hitTestPoint(this._person.x+this._person.width/2, this._person.y+this._person.height);
		if(_isHit) {
			this._clear.x = Math.random()*(3*this._stageW - 800) + 400; //随机x 300 ~ 3W-600	
			this._clear.y = Math.random()*(this._stageH - 600) + 300; //随机y 300 ~ H-600	
			this.addNewCharacter();
		} 
	}

	//每秒计时
	private gameTimerFunc () {
		this._scends--;
        this._scendsTF.text = this._scends;

		//剩5秒时播放倒计时音乐
		 if (this._scends == 5) {
         	let sound = new egret.Sound();
			sound.addEventListener(egret.Event.COMPLETE, function() {
        		this._countdownChannel = sound.play(0,0);
			}, this);
			sound.load("resource/sound/countdown.mp3");
        }
	}

		//游戏结束
	private gameTimerCompleteFunc () {
		this._person.removeEventListener(egret.Event.ENTER_FRAME, this.freeFall, this);
		this._person.removeEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);


		this.removeTouchEvent();
		//请求游戏结束接口
		this.gameOver();

        if (this._countdownChannel) this._countdownChannel.stop();
		if (this._backgroundChannel) this._backgroundChannel.stop();
		if (this._gameTimer) this._gameTimer.stop();
	}


	//接口-减游戏次数
	private minusGameCount() {
		let params = "?vuid=" + this._info._vuid +
					 "&key=" + this._info._key +
					 "&timenum=" + this._info._timenum +
					 "&activitynum=" + this._info._activitynum + 
					 "&isfrom=" + this._info._isfrom;
		// alert("减游戏次数接口 - "+this._info._getWord + params);

        let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._downnum + params, egret.HttpMethod.GET);
		console.log(this._info._downnum + params);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
            console.log(result);
            if (result["code"] == 0) {
				this._linnum = parseInt(result["data"]["linnum"]);
				this._rands = result["data"]["rands"].toString();
				this._tid = result["data"]["tid"].toString();

				//请求单词
				this.getWords(1);

			} else if(result["code"] == 2){

				let _overAlert = new Alert(Alert.GamePageShare, "", "", "",0,this._stageW,this._stageH);
				_overAlert.addEventListener(AlertEvent.Share, this.shareButtonClick, this);
				_overAlert.addEventListener(AlertEvent.Cancle, function() {
					window.location.reload();
				}, this);
				this.addChild(_overAlert);
			}
		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("post error : " + event);
        }, this);
	}


//接口-请求单词, 只在初次请求时添加UI
	private getWords(type: number) {

		let params = "?vuid=" + this._info._vuid + 
					 "&key=" + this._info._key +
					 "&rands=" + this._rands + 
					 "&isfrom=" + this._info._isfrom;
		// alert("请求单词接口 - "+this._info._getWord + params);
		let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
		console.log(this._info._getWord + params);
        // request.open(this._info._getWord + params, egret.HttpMethod.GET);
		request.open("http://ceshi.beisu100.com/beisuapp/typos/GetBallwords/activitynum/11/timenum/1", egret.HttpMethod.GET);

        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
			console.log(result);

	        if (result["code"] == 0) {
				//设置数组	
				let _idiomArray = [];

				for(let i = 0; i < result["data"].length; i++) {
					let text = result["data"][i]["right"];
					_idiomArray.push(text);
				}
					
				Array.prototype.push.apply(this._allIdiomArray, _idiomArray); 	//将请求到的单词添加到大数组

				//接口请求成功添加UI
				if (type == 1) {
					this._currentIdiomArray.push(this._allIdiomArray[0]);	//初次将前两个添加到数组
					this._currentIdiomArray.push(this._allIdiomArray[1]);
					this._allIdiomArray.splice(0,2);	//添加完后删除
					let characterString = this._currentIdiomArray.join().replace(/,/g,""); 	//将单词数组转为字符串,并且去掉所有逗号
					let character = characterString.split("");	//将字母字符串转为数组
					Array.prototype.push.apply(this._characterArray, character); 	//追加到字母数组

					this.setupViews();
					this.addTouchEvent();
				} 

			} else {
				alert(result["msg"]);
			}
		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("post error : " + event);
        }, this);
	}
	
	//接口-增加分数
	private plusScore(score: number) {
		let params = "?vuid=" + this._info._vuid + 
					 "&rands=" + this._rands + 
					 "&tid=" + this._tid + 
					 "&md5=" + score + 
					 "&timenum=" + this._info._timenum + 
					 "&activitynum=" + this._info._activitynum + 
					 "&isfrom=" + this._info._isfrom;
		let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
		// console.log(this._info._typosTempjump + params);
        request.open(this._info._typosTempjump+params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
			// alert(this._info._typosTempjump + "---"+ params + "---"+result["code"] + "---"+result["msg"]);
			// console.log(result);
		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("post error : " + event);
        }, this);
	}

	//接口-游戏结束
    private gameOver() {
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
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
            console.log(result);
			let highScore = result["data"]["score"];
			if(this._score > parseInt(highScore)){
				highScore = this._score;
			}
			this._normalAlert = new Alert(Alert.GamePageScore, this._score.toString(), highScore,result["data"]["order"], result["data"]["text"],this._stageW,this._stageH);
			this._normalAlert.addEventListener(AlertEvent.Ranking, this.checkRanking, this);
			this._normalAlert.addEventListener(AlertEvent.Restart, this.restartGame, this);
			this.addChild(this._normalAlert);

		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("post error : " + event);
        }, this);
    }

	//游戏结束alert-查看排名
	private checkRanking() {
		console.log("game 查看排名");

		if(this._normalAlert && this._normalAlert.parent) {
			this._normalAlert.parent.removeChild(this._normalAlert);
		} 

		// alert("查看排名 - "+this._info._rankUrl + this._info._timenum + "/activitynum/" + this._info._activitynum + "/vuid/" + this._info._vuid + "/key/" + this._info._key + "/isfrom/" + this._info._isfrom);
        window.location.href = this._info._rankUrl + this._info._timenum + "/activitynum/" + this._info._activitynum + "/vuid/" + this._info._vuid + "/key/" + this._info._key + "/isfrom/" + this._info._isfrom;
    }

	//游戏结束alert-重玩
    private restartGame() {

		//移动当前场景
        this.removeChildren();

		//重玩时清空数组
		this._allIdiomArray.splice(0, this._allIdiomArray.length);
		this._currentIdiomArray.splice(0, this._currentIdiomArray.length);
		this._characterArray.splice(0, this._characterArray.length);
		this._characterTFArray.splice(0, this._characterTFArray.length);
		this._characterBgArray.splice(0, this._characterBgArray.length);

		// this._remindTFArray.splice(0, this._remindTFArray.length);
		this._barrierArray.splice(0, this._barrierArray.length);

		//重新添加
		this._scends = 180;
        this._score = 0;
		this._isFall  = true;
 		this._isHitBarrier = false;

		this.minusGameCount();
    }

	private shareButtonClick() {
        //分享引导图
        let _shareGuide = new Bitmap("shareGui_png");
        _shareGuide.touchEnabled = true;
        _shareGuide.x =  0;
        _shareGuide.y =  0 ;
        _shareGuide.width = this.stage.stageWidth ;
        _shareGuide.height = this.stage.stageHeight ;
        _shareGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, function() {
            this.removeChild(_shareGuide);
        }, this);
		this.addChild(_shareGuide);
	}


}