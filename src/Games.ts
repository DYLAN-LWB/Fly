class Games extends egret.DisplayObjectContainer {
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

	private _backgroundChannel: egret.SoundChannel;	//游戏背景音乐

	private _background; 	//游戏背景

	//this game
	private _person = new Bitmap("person_png");	//对象
	private _bubble = new Bitmap("papaw_png");
	private _isFall = false;	//判断自由落体时是否需要改变x
	private _guide;		//触摸点提示箭头

	private _allIdiomArray = [];	//所有成语数组
	private _characterArray = [];	//成语拆分成单个文字
	private _characterTFArray = [];	//textField数组
	private _characterBgArray = [];	//textField背景数组
	private _barrierArray = [];
	private _currentTF;	//当前吃到的成语

	private _isHitBarrier = false;

	private _clear = new Bitmap("magic_png");	//对象


	private createGameScene() {

		//常量设置
		this._stageW = this.stage.stageWidth;
		this._stageH = this.stage.stageHeight;
        this._score = 0;
		this._isFall  = true;

		this._info._vuid = localStorage.getItem("vuid").replace(/"/g,"");
		this._info._key = localStorage.getItem("key").replace(/"/g,"");
		this._info._isfrom = localStorage.getItem("isfrom").replace(/"/g,"");
		this._info._timenum = localStorage.getItem("timenum").replace(/"/g,"");
		this._info._activitynum = localStorage.getItem("activitynum").replace(/"/g,"");

		//减游戏次数
		this.minusGameCount();
	}

	private setupViews() {

		let sound = new egret.Sound();
		sound.addEventListener(egret.Event.COMPLETE, function() {
			this._backgroundChannel = sound.play(0,1);
			this._backgroundChannel.volume = 0.8;
		}, this);
		sound.load("resource/sound/bg.mp3");

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
		this._person.x = 200;
		this._person.y = 500;
		this._person.width = 80;
		this._person.height = 80;
		this.addChild(this._person);

		this._bubble.texture = RES.getRes("papaw_png");
		this._bubble.x = 180;
		this._bubble.y = 480;
		this._bubble.anchorOffsetX = 0;
		this._bubble.anchorOffsetY = 0;
		this._bubble.width = 120;
		this._bubble.height = 120;
		this.addChild(this._bubble);

		//提示箭头
		this._guide = new Movie();
        this._guide.init("guide_json","guide_png","guide",-1);
        this._guide.x = 200;
		this._guide.y = 200;
		this._guide.width = 100;
		this._guide.height = 60;
		this._guide.alpha = 0;
		this.addChild(this._guide);

		//自由落体
		this._person.addEventListener(egret.Event.ENTER_FRAME, this.freeFall, this);

		//清空
		this._clear.x =  300; //随机x 300 ~ 3W-600	
		this._clear.y = 300; //随机y 300 ~ H-600	
		this._clear.width = 80;
		this._clear.height = 80;
		this._background.addChild(this._clear);



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



	}

	//添加随机文字
	private addCharacter() {

		this._characterArray.sort();
		for(var index = 0; index < this._characterArray.length; index++) {
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

	private _touchY;	//触摸点y
	private _touchPersonY;	//触摸时对象的y值

	private touchBegin(event: egret.TouchEvent) {
		this._isFall = false;

		this._touchY = event.localY;
		this._touchPersonY = this._person.y;

		//触摸时添加帧事件
		this._person.addEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);

		//更新箭头方向
		this.rotationGuide();	
	}

	private touchMove(event: egret.TouchEvent) { 
		this._isFall = false;

		this._touchY = event.localY;
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
		this._guide.y = this._touchY;

		//计算触摸点和当前对象的点构成的连线的夹角弧度 Math.atan2(y2-y1,x2-x1)
		var radian = Math.atan2((this._touchPersonY+this._person.height/2)-this._touchY,this._person.width/2);
		//把弧度转成角度
		var angle = radian * 180 / Math.PI;
		//旋转箭头图片
		this._guide.rotation = angle;
	}

	//触摸不松手或者移动时的帧事件
	private touchChangeLocation() {

		//上下移动的速度
		this._person.y += (this._touchY < this._touchPersonY ? 10 : -8);
		this._bubble.y = this._person.y - 20;

	}

	//自由落体,改变对象和背景
	private freeFall() {

		//手指离开屏幕时x值改变
		if(this._isFall == true) {
			this._person.y += 6;
			this._bubble.y = this._person.y - 20;

		} else {
			// this._person.y += 3;
		}
		


		this._bubble.y = this._person.y - 20;

		//添加碰撞检测
		this.checkHit();

		//障碍物碰撞检测
		this.checkBarrierHit();

		//清空功能碰撞检测
		this.checkClear();
	}


	//碰撞检测
	private checkHit() {

		for(let index = 0; index < this._characterBgArray.length; index++) {

			let _character = this._characterBgArray[index];
			let _isHit: boolean = _character.hitTestPoint(this._person.x+this._person.width/2, this._person.y+this._person.height);
			if(_isHit) {
				this.hitAction(index);
			} 
		}	
	}


	private hitAction(index:number) {

 		let sound = new egret.Sound();
		sound.addEventListener(egret.Event.COMPLETE, function() {
			let channel:egret.SoundChannel = sound.play(0,1);
			channel.volume = 0.9;
		}, this);
		sound.load("resource/sound/jump.mp3");


	}

	//新增
	private addNewCharacter() {
	
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

		} 
	}



	//游戏结束
	private gameTimerCompleteFunc () {
		this._person.removeEventListener(egret.Event.ENTER_FRAME, this.freeFall, this);
		this._person.removeEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
		this.removeTouchEvent();

		if (this._backgroundChannel) this._backgroundChannel.stop();

		//气泡爆炸动画
		this._bubble.texture = RES.getRes("baozha1_png");
		this._bubble.width = 300;
		this._bubble.height = 300;
		this._bubble.anchorOffsetX = 180/2;
		this._bubble.anchorOffsetY = 200/2;
		this._bubble.x = this._person.x-110;
		this._bubble.y = this._person.y-110;

		let timer1: egret.Timer = new egret.Timer(200, 1);
		timer1.addEventListener(egret.TimerEvent.TIMER_COMPLETE,function() {

			this._bubble.texture = RES.getRes("baozha2_png");
			let timer2: egret.Timer = new egret.Timer(200, 1);
			timer2.addEventListener(egret.TimerEvent.TIMER_COMPLETE,function(){
				this._bubble.texture = RES.getRes("baozha3_png");
			},this);
			timer2.start();
		},this);
		timer1.start();

		//请求游戏结束接口
		let over: egret.Timer = new egret.Timer(400, 1);
		over.addEventListener(egret.TimerEvent.TIMER_COMPLETE,function(){
			this.gameOver();
		},this);
		over.start();
	}

	//接口-减游戏次数
	private minusGameCount() {
		let params = "?vuid=" + this._info._vuid +
					 "&key=" + this._info._key +
					 "&timenum=" + this._info._timenum +
					 "&activitynum=" + this._info._activitynum + 
					 "&isfrom=" + this._info._isfrom;
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
			} else {
				alert(result["msg"]);
			}
		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("numdown5　post error : " + event);
        }, this);
	}


	//接口-请求单词, 只在初次请求时添加UI
	private getWords(type: number) {

		let params = "?vuid=" + this._info._vuid + 
					 "&key=" + this._info._key +
					 "&timenum=" + this._info._timenum +
					 "&activitynum=" + this._info._activitynum + 
					 "&rands=" + this._rands + 
					 "&isfrom=" + this._info._isfrom;
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
				let _idiomArray = [];

				for(let i = 0; i < result["data"].length; i++) {
					let text = result["data"][i]["right"];
					_idiomArray.push(text);
				}
					
				Array.prototype.push.apply(this._allIdiomArray, _idiomArray); 	//将请求到的单词添加到大数组

				//接口请求成功添加UI
				if (type == 1) {
		
					let characterString = this._allIdiomArray.join().replace(/,/g,""); 	//将单词数组转为字符串,并且去掉所有逗号
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
            alert("GetBallwords　post error : " + event);
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
        request.open(this._info._typosTempjump+params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
		request.addEventListener(egret.Event.COMPLETE, function() {
			let result = JSON.parse(request.response);
			console.log(result);
		}, this);
		request.addEventListener(egret.IOErrorEvent.IO_ERROR, function() {
            alert("typostempjump　post error : " + event);
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
            alert("GameOver　post error : " + event);
        }, this);
    }

	//游戏结束alert-查看排名
	private checkRanking() {
		if(this._normalAlert && this._normalAlert.parent) {
			this._normalAlert.parent.removeChild(this._normalAlert);
		} 
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
		this._characterBgArray.splice(0, this._characterBgArray.length);

		this._barrierArray.splice(0, this._barrierArray.length);

		//重新添加
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