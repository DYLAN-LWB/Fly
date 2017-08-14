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
	private _isFall = false;	//判断自由落体时是否需要改变x
	private _guide;		//触摸点提示箭头

	private _allIdiomArray = [];	//所有成语数组
	private _currentIdiomArray = [];
	private _characterArray = [];	//成语拆分成单个文字
	private _characterTFArray = [];	//textField数组
	private _remindTFArray = [];	//成语提词器
	private _barrierArray = [];
	private _currentTF;	//当前吃到的成语

	private _isHitBarrier = false;

	private createGameScene() {

		//常量设置
		this._stageW = this.stage.stageWidth;
		this._stageH = this.stage.stageHeight;
		this._scends = 60;
        this._score = 0;
		this._isFall  = true;

		this._info._vuid = localStorage.getItem("vuid").replace(/"/g,"");
		this._info._key = localStorage.getItem("key").replace(/"/g,"");
		this._info._isfrom = localStorage.getItem("isfrom").replace(/"/g,"");
		this._info._timenum = localStorage.getItem("timenum").replace(/"/g,"");
		this._info._activitynum = localStorage.getItem("activitynum").replace(/"/g,"");

		//test
		let _idiomArray = ["倍速课堂","万向思维","在线教育","哈哈哈哈","1哈哈哈","2哈哈哈","3哈哈哈"];
		Array.prototype.push.apply(this._allIdiomArray, _idiomArray); 	//将请求到的单词添加到大数组
		this._currentIdiomArray.push(this._allIdiomArray[0]);	//将前两个添加到数组
		this._currentIdiomArray.push(this._allIdiomArray[1]);
		this._allIdiomArray.splice(0,2);	//添加完后删除
		let characterString = this._currentIdiomArray.join().replace(/,/g,""); 	//将单词数组转为字符串,并且去掉所有逗号
		let character = characterString.split("");	//将字母字符串转为数组
		Array.prototype.push.apply(this._characterArray, character); 	//追加到字母数组
		this.setupViews();
		this.addTouchEvent();

		//http://ceshi.beisu100.com/liweibin/Fly/index.html
		//减游戏次数
		// this.minusGameCount();
	}

	private setupViews() {

		let sound = new egret.Sound();
		sound.addEventListener(egret.Event.COMPLETE, function() {
			this._backgroundChannel = sound.play(0,0);
			this._backgroundChannel.volume = 0.8;
		}, this);
		// sound.load("resource/sound/bg.mp3");

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


		//提示当前的成语
		for(var index = 0; index < this._currentIdiomArray.length; index++) {
			let _remindTF = new egret.TextField;
			_remindTF.x = 20;
			_remindTF.y = 400 + 25*index;
			_remindTF.width = 200;
			_remindTF.height = 25;
			_remindTF.textColor = 0xff6600;
			_remindTF.verticalAlign = egret.VerticalAlign.MIDDLE;
			_remindTF.size = 20;
			_remindTF.text = this._currentIdiomArray[index];
			_remindTF.fontFamily = "Microsoft YaHei";
			this.addChild(_remindTF);

			this._remindTFArray.push(_remindTF);
		}

		//已经吃的提示
		this._currentTF  = new egret.TextField;
		this._currentTF.x = 0;
		this._currentTF.y = 20;
		this._currentTF.width = this._stageW;
		this._currentTF.height = 50;
		this._currentTF.textColor = 0xff6600;
		this._currentTF.verticalAlign = egret.VerticalAlign.MIDDLE;
		this._currentTF.textAlign = egret.HorizontalAlign.CENTER;
		this._currentTF.size = 35;
		this._currentTF.fontFamily = "Microsoft YaHei";
		this.addChild(this._currentTF);

		//分数提示
		this._scoreTF = new egret.TextField();
		this._scoreTF.x = 33;
		this._scoreTF.y = 20;
		this._scoreTF.width = 333;
		this._scoreTF.height = 55;
        this._scoreTF.textColor = 0x20544a;
		this._scoreTF.textAlign =  egret.HorizontalAlign.CENTER;
        this._scoreTF.size = 30;
        this._scoreTF.text = this._score + "分";
		this._scoreTF.fontFamily = "Microsoft YaHei"
        this.addChild(this._scoreTF);
				
		//倒计时提示
		this._scendsTF = new egret.TextField();
		this._scendsTF.x = this.stage.stageWidth*0.75;
		this._scendsTF.y = 20;
		this._scendsTF.width = this.stage.stageWidth*0.25;
		this._scendsTF.height = 55;
    	this._scendsTF.fontFamily = "Microsoft YaHei"
        this._scendsTF.textColor = 0xff6c14;
		this._scendsTF.textAlign =  egret.HorizontalAlign.CENTER;
        this._scendsTF.size = 50;
        this._scendsTF.text = this._scends + "秒";
        this.addChild(this._scendsTF);

		//游戏计时器
		this._gameTimer = new egret.Timer(1000, this._scends);
        this._gameTimer.addEventListener(egret.TimerEvent.TIMER, this.gameTimerFunc, this);
        this._gameTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.gameTimerCompleteFunc, this);
        this._gameTimer.start();
	}

	//添加障碍物
	private addBarrier() {
		if(this._barrierArray.length > 0) {
			for(var index = 0; index < 5; index++) {
				if(this._barrierArray[index] && this._barrierArray[index].parent) {
					this._barrierArray[index].parent.removeChild(this._barrierArray[index])
				};	
				this._barrierArray.splice(index, 1);
			}			
		}

		let splice = 3*this._stageW/6;
		for(var index = 0; index < 5; index++) {
			let _barrier  = new Bitmap("zhadan_test_png");
			_barrier.x = splice*index + 300;
			_barrier.y = Math.random()*(this._stageH - 600) + 300;
			_barrier.width = 80;
			_barrier.height = 66;
			this._background.addChild(_barrier);

			this._barrierArray.push(_barrier);
		}
	}

	//添加随机文字
	private addCharacter() {

		for(var index = 0; index < this._characterArray.length; index++) {
			let _characterTF  = new egret.TextField();
			_characterTF.x = Math.random()*(3*this._stageW - 800) + 300; //随机x 300 ~ 3W-600	
			_characterTF.y = Math.random()*(this._stageH - 600) + 300; //随机y 300 ~ H-600	
			_characterTF.width = 80;
			_characterTF.height = 80;
			_characterTF.text = this._characterArray[index];
			_characterTF.size = 35;
			_characterTF.textColor = 0x000000;
			_characterTF.textAlign = egret.HorizontalAlign.CENTER;
			_characterTF.verticalAlign = egret.VerticalAlign.MIDDLE;
			_characterTF.background = true;
			_characterTF.backgroundColor = 0xff0000;
			this._background.addChild(_characterTF);

			//添加到数组
			this._characterTFArray.push(_characterTF);

			//和所有文字tf比较位置
			for(let index = 0; index < this._characterTFArray.length; index++) {

				let characterTF = this._characterTFArray[index];
				let spaceX = Math.abs(characterTF.x - _characterTF.x);
				let spaceY = Math.abs(characterTF.y - _characterTF.y); 
				if(spaceX < 100 && spaceY < 100) {
					_characterTF.x += 100;
				}
			}

			//和障碍物xy值比较,避免重叠
			for(let index = 0; index < this._barrierArray.length; index++) {

				let barrier = this._barrierArray[index];
				let spaceX = Math.abs(barrier.x - _characterTF.x);
				let spaceY = Math.abs(barrier.y - _characterTF.y); 
				if(spaceX < 100 && spaceY < 100) {
					_characterTF.x += 100;
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

		//改变对象位置时同时移动背景
		this.moveBackground(x > 0 ? false : true, y > 0 ? false : true);
	}

	//自由落体,改变对象和背景
	private freeFall() {
		//手指离开屏幕时x值改变
		if(this._isFall == true) {
			var x = this._touchX < this._touchPersonX ? 3 : -3;
			this._person.x += x;
			this._person.y += 7;
		} 
		
		this._person.y += 1;

		if(this._person.x < 150)  this._person.x = 150;
		if(this._person.y < 150)  this._person.y = 150;
		if(this._person.x > (this._stageW-this._person.width-150)) this._person.x = this._stageW-this._person.width-150;
		if(this._person.y > (this._stageH-this._person.height-150)) {
			this._person.y = this._stageH-this._person.height-150;
		}
		
		//添加碰撞检测
		this.checkHit();

		//障碍物碰撞检测
		this.checkBarrierHit();
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
		//test
		this.plusScore(1);
		this._score += 1;
		this._scoreTF.text = this._score + "分";

		this._currentTF.text += this._characterTFArray[index].text; 

		this._background.removeChild(this._characterTFArray[index]);	//移除碰撞文字UI
		this._characterTFArray.splice(index, 1);	//移除碰撞文字UI-数组
		this._characterArray.splice(index,1);		//移除碰撞文字-数组

		//判断是否吃对了
		if(this._currentTF.text.length == 4) {

			//查看是否在当前成语数组
			for (let index = 0; index <  this._currentIdiomArray.length; index++) {

				if(this._currentTF.text == this._currentIdiomArray[index]) {
					this._currentIdiomArray.splice(index,1);	//移除该成语数据
					this._currentIdiomArray.push(this._allIdiomArray[0]);	//添加新数据

					//遍历对应的提示
					//移除当前吃到的提示成语, 新增提示
					for(let number = 0; number < this._remindTFArray.length; number++) {

						console.log(this._currentTF.text);
						console.log( this._remindTFArray[index].text);

						if(this._currentTF.text === this._remindTFArray[index].text) {

							let currentTextField =  this._remindTFArray[number];
							this._remindTFArray.splice(number,1);
							this.removeChild(this._remindTFArray[number]);

							let _remindTF = new egret.TextField;
							_remindTF.x = 20;
							_remindTF.y = currentTextField.y;
							_remindTF.width = 200;
							_remindTF.height = 25;
							_remindTF.textColor = 0xff6600;
							_remindTF.verticalAlign = egret.VerticalAlign.MIDDLE;
							_remindTF.size = 20;
							_remindTF.text = this._allIdiomArray[0];
							_remindTF.fontFamily = "Microsoft YaHei";
							this.addChild(_remindTF);

							this._remindTFArray.push(_remindTF);
						}
					}

				}
			}

			this._currentTF.text = "";

			let characterString = this._allIdiomArray[0].replace(/,/g,""); 	//将单词数组转为字符串,并且去掉所有逗号
			let newCharacter = characterString.split("");	//将字母字符串转为数组
			Array.prototype.push.apply(this._characterArray, newCharacter); 	//追加到字母数组
			
			//添加第一个之后删除
			this._allIdiomArray.splice(0,1);

			//添加新增加的文字
			for(var index = 0; index < newCharacter.length; index++) {
				let _characterTF  = new egret.TextField();
				_characterTF.x = Math.random()*(3*this._stageW - 800) + 300; //随机x 300 ~ 3W-600	
				_characterTF.y = Math.random()*(this._stageH - 600) + 300; //随机y 300 ~ H-600	
				_characterTF.width = 80;
				_characterTF.height = 80;
				_characterTF.text = newCharacter[index];
				_characterTF.size = 35;
				_characterTF.textColor = 0x000000;
				_characterTF.textAlign = egret.HorizontalAlign.CENTER;
				_characterTF.verticalAlign = egret.VerticalAlign.MIDDLE;
				_characterTF.background = true;
				_characterTF.backgroundColor = 0xff0000;
				this._background.addChild(_characterTF);

				//添加到数组
				this._characterTFArray.push(_characterTF);

				//和所有文字tf比较位置
				for(let index = 0; index < this._characterTFArray.length; index++) {

					let characterTF = this._characterTFArray[index];
					let spaceX = Math.abs(characterTF.x - _characterTF.x);
					let spaceY = Math.abs(characterTF.y - _characterTF.y); 
					if(spaceX < 100 && spaceY < 100) {
						_characterTF.x += 100;
					}
				}

				//和障碍物xy值比较,避免重叠
				for(let index = 0; index < this._barrierArray.length; index++) {

					let barrier = this._barrierArray[index];
					let spaceX = Math.abs(barrier.x - _characterTF.x);
					let spaceY = Math.abs(barrier.y - _characterTF.y); 
					if(spaceX < 100 && spaceY < 100) {
						_characterTF.x += 100;
					}
				}
			}
		}
	}


	private checkBarrierHit() {

		for(let index = 0; index < this._barrierArray.length; index++) {

			let _barrier = this._barrierArray[index];
			let _isHit: boolean = _barrier.hitTestPoint(this._person.x+this._person.width/2, this._person.y+this._person.height);

			if(_isHit) {
				this.hitBarrierAction(index);
			} 
		}	
	}

	private hitBarrierAction(index) {
		if(this._isHitBarrier == false) {
			alert("hitBarrierAction");
		}
		this._isHitBarrier = true;
	}

	//每秒计时
	private gameTimerFunc () {
		this._scends--;
        this._scendsTF.text = this._scends + "秒";

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
        request.open(this._info._getWord + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
			console.log(result);

	        if (result["code"] == 0) {
			
				//设置数组		
				let _idiomArray = ["金蝉脱壳"];
				let characterString = _idiomArray.join().replace(/,/g,""); 	//将单词数组转为字符串,并且去掉所有逗号
				let character = characterString.split("");	//将字母字符串转为数组
				Array.prototype.push.apply(this._characterArray, character); 	//追加到字母数组
				Array.prototype.push.apply(this._allIdiomArray, _idiomArray); 	//将请求到的单词添加到大数组

				//接口请求成功添加UI
				if (type == 1) {
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
		console.log(this._info._typosTempjump + params);
        request.open(this._info._typosTempjump+params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
			// alert(this._info._typosTempjump + "---"+ params + "---"+result["code"] + "---"+result["msg"]);
			console.log(result);
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
		this._characterArray.splice(0, this._characterArray.length);
		this._characterTFArray.splice(0, this._characterTFArray.length);
		this._remindTFArray.splice(0, this._remindTFArray.length);

		//重新添加
		this._scends = 60;
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