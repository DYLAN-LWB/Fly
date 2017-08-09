class Advert extends egret.Sprite{
	public constructor(stageW:number, stageH:number, isPortrait:boolean) {
		 super();

		 //跨域问题
		 egret.ImageLoader.crossOrigin = "anonymous";

		 this.graphics.beginFill(0xffffff);
         this.graphics.drawRect(0, 0, isPortrait? stageW :stageH, 200);
         this.graphics.endFill();
		 this.x = isPortrait? 0 : stageW - 200;
		 this.y = isPortrait? stageH-200 : stageH;
		 this.rotation = isPortrait? 0 :-90;

		 //请求广告数据
		 this.getAdvertData();
	}

	private data = [];
	private index = 0; //随机到的第几个商品
	private getAdvertData() {
        let request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open("https://www.beisu100.com/beisuapp/shop/goodshopone", egret.HttpMethod.GET); 
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function() {
            let result = JSON.parse(request.response);
            console.log(result);
            if (result["code"] == 0) { 
				this.data = result["data"];

				this.setupAdvertView();
				this.commodityChange();

				//设置定时器,每隔几秒更换一次商品
				let timer: egret.Timer = new egret.Timer(3000, 999);
				timer.addEventListener(egret.TimerEvent.TIMER,function() {
					this.commodityChange();
				},this);
				timer.start();
            } 
        }, this);
	}

	private commodityChange() {
		let random = Math.random()*10;
		this.index = parseInt(random.toString());



		RES.getResByUrl(this.data[this.index]["imgurl"], function(texture:egret.Texture){
			this._image.texture = texture;
			this._title.text = this.data[this.index]["name"];
			this._oldPrice.text = "原价：" + this.data[this.index]["shopprice"] + "元";
			this._newPrice.text = "券后价：" + this.data[this.index]["shopdisprice"] + "元";
			this._coupon.text = "券：" +　this.data[this.index]["discount"] + "元";
			//剪贴板input赋值
			document.getElementById("code").value = this.data[this.index]["code"];

		},this, RES.ResourceItem.TYPE_IMAGE);
	}

	private _image;
	private _title;
	private _oldPrice;
	private _newPrice;
	private _coupon;

	private setupAdvertView() {

		//倍速小店链接		
		let href = this.textField(0,10,this.width,30,0x545454);
        href.text = "倍速小店分享点此进店";
		href.textColor = 0xCFCFCF;
		href.textAlign = egret.HorizontalAlign.CENTER;
		href.verticalAlign = egret.VerticalAlign.MIDDLE;
		href.size = 21;
        this.addChild(href);
		href.addEventListener(egret.TouchEvent.TOUCH_TAP, function() {
			window.location.href = "http://www.beisu100.com/weixinbeisu/shop.html";
		}, this);


		let leftLine = new egret.Shape;
   		leftLine.graphics.beginFill(0xD6D6D6);
		leftLine.graphics.drawRect(30, 25, this.width*0.3, 1);
        leftLine.graphics.endFill();
		leftLine.alpha = 0.5;
        this.addChild(leftLine);

		let rightLine = new egret.Shape;
   		rightLine.graphics.beginFill(0xD6D6D6);
        rightLine.graphics.drawRect(this.width*0.7-30, 25, this.width*0.3, 1);
        rightLine.graphics.endFill();
		rightLine.alpha = 0.5;
        this.addChild(rightLine);


		//商品图片
		this._image = new Bitmap("");
		this._image.x = 30;
		this._image.y = 60;
		this._image.width = 120;
		this._image.height = 120;
		this.addChild(this._image);

		//商品名称
		this._title = this.textField(160,60,380,30,0x545454);
        this.addChild(this._title);

		//商品原价
		this._oldPrice = this.textField(160,90,380,30,0x545454);
		this.addChild(this._oldPrice);

		//添加删除线
		let line = new egret.Shape;
   		line.graphics.beginFill(0x545454);
        line.graphics.drawRect(165, 105, 150, 1);
        line.graphics.endFill();
        this.addChild(line);

		//商品卷后价
		this._newPrice = this.textField(160,120,380,30,0x545454);
		this._newPrice.textColor = 0xed4112;
		this.addChild(this._newPrice);

		//优惠券
		this._coupon = this.textField(160,152,150,33,0x545454);
		this._coupon.textColor = 0xed4112;
		this._coupon.border = true;
		this._coupon.borderColor = 0xed4112;
		this._coupon.borderWidth = 2;
		this._coupon.verticalAlign = egret.VerticalAlign.MIDDLE;
		this._coupon.textAlign = egret.HorizontalAlign.CENTER;
		this.addChild(this._coupon);

		//右边按钮背景
		let rightBg = new egret.Sprite;
		rightBg.graphics.beginFill(0xd1021c);
        rightBg.graphics.drawRect(560, 60, 130, 130);
        rightBg.graphics.endFill();
		this.addChild(rightBg);

		//右边按钮背景右边图片
		let rightImg = new Bitmap("yy_png");
		rightImg.x = 690;
		rightImg.y = 60;
		rightImg.width = 20;
		rightImg.height = 130;
		this.addChild(rightImg);

		//立即领券按钮
		let getCoupon = this.textField(560,90,130,40,0x545454);
        getCoupon.text = "立即领券";
		getCoupon.textColor = 0xffffff;
		getCoupon.textAlign = egret.HorizontalAlign.CENTER;
        this.addChild(getCoupon);

		//购买按钮
		let buyBg = new egret.Shape;
   		buyBg.graphics.beginFill(0xa40014);
		buyBg.graphics.drawRoundRect(580,  130, 90, 47, 30,  30);
        buyBg.graphics.endFill();
        this.addChild(buyBg);

		let buy = this.textField(580,130,90,45,0x545454);
        buy.text = "购买";
		buy.textColor = 0xffffff;
		buy.textAlign = egret.HorizontalAlign.CENTER;
		buy.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.addChild(buy);

  		this._image.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showToast, this);
  		this._title.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showToast, this);
  		this._oldPrice.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showToast, this);
  		this._newPrice.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showToast, this);
  		this._coupon.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showToast, this);
  		getCoupon.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showToast, this);
		buy.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showToast, this);
	}

	private showToast() {

		//复制到剪切板
		copyCode();

		//添加提示框
		var _toast1 = this.textField(200,60,350,50,0x545454);
        _toast1.text = "淘口令已复制，打开";
		_toast1.textColor = 0xffffff;
		_toast1.textAlign = egret.HorizontalAlign.CENTER;
		_toast1.verticalAlign = egret.VerticalAlign.BOTTOM;
		_toast1.background = true;
		_toast1.backgroundColor = 0x000000;
		_toast1.alpha = 0.8;
		_toast1.lineSpacing = 8;
        this.addChild(_toast1);
		
		var _toast2 = this.textField(200,110,350,70,0x545454);
        _toast2.text = "【手机淘宝】即可购买。";
		_toast2.textColor = 0xffffff;
		_toast2.textAlign = egret.HorizontalAlign.CENTER;
		_toast2.verticalAlign = egret.VerticalAlign.MIDDLE;
		_toast2.background = true;
		_toast2.backgroundColor = 0x000000;
		_toast2.alpha = 0.8;
		_toast2.lineSpacing = 8;
        this.addChild(_toast2);


		//延时之后移除
		let timer: egret.Timer = new egret.Timer(1500, 1);
		timer.addEventListener(egret.TimerEvent.TIMER_COMPLETE,function() {
			this.removeChild(_toast1);
			this.removeChild(_toast2);
		},this);
		timer.start();
	}

	//创建文字控件
	private textField(x:number, y:number, width: number, height:number, textColor:any) {

		let textField = new egret.TextField();
		textField.x = x;
		textField.y = y;
		textField.width = width;
		textField.height = height;
        textField.textColor = textColor;
        textField.size = 23;
		textField.fontFamily = "Microsoft YaHei";
		textField.touchEnabled = true;
		return textField;
	}
	
}