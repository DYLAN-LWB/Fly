/***
 *弹窗对话框
 */
class Alert extends egret.Sprite {
    public static HomePageShare = 1;    //首页没有挑战次数时提示分享
    public static GamePageScore = 2;    //游戏结束时的提示
    public static GamePageShare = 3;    //游戏结束点击重玩却没有次数时提示分享
    private type;   //弹窗类型
    private score;  //当前分数
    private highScore;  //最高分
    private ranking;    //排名
    private descstate;  //作弊提示
    private screenwith;     //舞台宽度
    private screenHeight;   //舞台高度

    public constructor(type:number, score:string, highScore:string, ranking:string, descstate:number,screenwith:number,screenHeight:number) {
        super();
        this.type = type;
        this.score = score;
        this.highScore = highScore;
        this.ranking = ranking;
        this.descstate = descstate;
        this.screenwith = screenwith;
        this.screenHeight = screenHeight;
        
        this.initView();
    }

    public initView() {
        var bg;
        // if(this.type == 3){
        //     bg = new Bitmap("black2_png");
        // } else {
            bg = new Bitmap("black_png");
        // }
        bg.height = this.screenHeight;
        bg.width = this.screenwith;
        bg.y = 0;

        // if(this.type == 2){
        //     bg.x = -250;
		//     bg.y = 100;
        //     bg.height = this.screenwith;
        //     bg.width = this.screenHeight;
        // }
        // if(this.type == 3){
        //     bg.height = this.screenwith;
        //     bg.width = this.screenHeight;
        // }
        this.addChild(bg);

        
        switch (this.type) {
            case 1:
                var alertbg = new Bitmap("gamebody_json.prompt_03");
                alertbg.x = 370;
                alertbg.y = 480;
                alertbg.anchorOffsetX = alertbg.width / 2;
                alertbg.anchorOffsetY = alertbg.height / 2;
                this.addChild(alertbg);

                var dec = new egret.TextField();
                dec.x = 370;
                dec.y = 460;
                dec.size = 30;
                dec.fontFamily = "Microsoft YaHei"
                dec.verticalAlign = egret.VerticalAlign.BOTTOM;
                dec.textColor = 0xff3153;
                dec.text = "五次机会已经用完了哦~分享给好友，让好友为你加油，就可以获得重玩的机会呦~";
                dec.lineSpacing = 10;
                dec.width = 400;
                dec.anchorOffsetX = dec.width / 2;
                dec.anchorOffsetY = dec.height / 2;
                this.addChild(dec);

                var canclebt = new Bitmap("gamebody_json.btn_03");
                canclebt.x = 230;
                canclebt.y = 610;
                canclebt.anchorOffsetX = canclebt.width / 2;
                canclebt.anchorOffsetY = canclebt.height / 2;
                canclebt.touchEnabled = true;
                canclebt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.cancleShareGame, this);
                this.addChild(canclebt);

                var sharebt = new Bitmap("gamebody_json.btn_05");
                sharebt.x = 510;
                sharebt.y = 610;
                sharebt.anchorOffsetX = sharebt.width / 2;
                sharebt.anchorOffsetY = sharebt.height / 2;
                sharebt.touchEnabled = true;
                sharebt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shareGame, this);
                this.addChild(sharebt);
                break;
            case 2:
                var gameover = new Bitmap("gamebody_json.tan");
                gameover.x = 370;
                gameover.y = 480;
                gameover.anchorOffsetX = gameover.width / 2;
                gameover.anchorOffsetY = gameover.height / 2;
                this.addChild(gameover);

                if(this.descstate==1){
                    var text = new egret.TextField();
                    text.x = 140;
                    text.y = 380;
                    text.size = 32;
                    text.fontFamily = "Microsoft YaHei"
                    text.verticalAlign = egret.VerticalAlign.BOTTOM;
                    text.textFlow = <Array<egret.ITextElement>>[
                        {
                            text: "防作弊系统检测:",
                            style: {"textColor": 0x7a2c47, "size": 22}
                        },
                        {text: "成绩无效,如有问题,请联系客服", style: {"textColor": 0xff1e00, "size": 22}}
                    ];
                    text.anchorOffsetY = text.height / 2;
                    this.addChild(text);
                }

                var score = new egret.TextField();
                score.x = 420;
                score.y = 420;
                score.size = 42;
                score.fontFamily = "Microsoft YaHei"
                score.verticalAlign = egret.VerticalAlign.BOTTOM;
                score.textColor = 0xff4665;
                score.text = this.score;
                score.anchorOffsetX = score.width / 2;
                score.anchorOffsetY = score.height / 2;
                this.addChild(score);

                var highScore = new egret.TextField();
                highScore.x = 415;
                highScore.y = 470;
                highScore.size = 32;
                highScore.fontFamily = "Microsoft YaHei"
                highScore.verticalAlign = egret.VerticalAlign.BOTTOM;
                highScore.textColor = 0xb64e0f;
                highScore.text = this.highScore;
                highScore.anchorOffsetX = highScore.width / 2;
                highScore.anchorOffsetY = highScore.height / 2;
                this.addChild(highScore);

                var ranking = new egret.TextField();
                ranking.x = 400;
                ranking.y = 520;
                ranking.size = 32;
                ranking.fontFamily = "Microsoft YaHei"
                ranking.verticalAlign = egret.VerticalAlign.BOTTOM;
                ranking.textColor = 0xb64e0f;
                ranking.text = this.ranking;
                ranking.anchorOffsetY = ranking.height / 2;
                this.addChild(ranking);

                var rankings = new Bitmap("gamebody_json.list");
                rankings.x = 230;
                rankings.y = 610;
                rankings.anchorOffsetX = rankings.width / 2;
                rankings.anchorOffsetY = rankings.height / 2;
                rankings.touchEnabled = true;
                rankings.addEventListener(egret.TouchEvent.TOUCH_TAP, this.gotoRanking, this);
                this.addChild(rankings);

                var reastgame = new Bitmap("gamebody_json.return");
                reastgame.x = 510;
                reastgame.y = 610;
                reastgame.anchorOffsetX = reastgame.width / 2;
                reastgame.anchorOffsetY = reastgame.height / 2;
                reastgame.touchEnabled = true;
                reastgame.addEventListener(egret.TouchEvent.TOUCH_TAP, this.reastGame, this);
                this.addChild(reastgame);
                break;
            case 3:
                var alertbggame = new Bitmap("gamebody_json.prompt_03");
                alertbggame.x = 370;
                alertbggame.y = 480;
                alertbggame.anchorOffsetX = alertbggame.width / 2;
                alertbggame.anchorOffsetY = alertbggame.height / 2;
                this.addChild(alertbggame);

                var decgame = new egret.TextField();
                decgame.x = 370;
                decgame.y = 460;
                decgame.size = 30;
                decgame.fontFamily = "Microsoft YaHei"
                decgame.verticalAlign = egret.VerticalAlign.BOTTOM;
                decgame.textColor = 0xff3153;
                decgame.text = "五次机会已经用完了哦~分享给好友，让好友为你加油，就可以获得重玩的机会呦~";
                decgame.lineSpacing = 10;
                decgame.width = 400;
                decgame.anchorOffsetX = decgame.width / 2;
                decgame.anchorOffsetY = decgame.height / 2;
                this.addChild(decgame);

                var canclebtgame = new Bitmap("gamebody_json.btn_03");
                canclebtgame.x = 230;
                canclebtgame.y = 610;
                canclebtgame.anchorOffsetX = canclebtgame.width / 2;
                canclebtgame.anchorOffsetY = canclebtgame.height / 2;
                canclebtgame.touchEnabled = true;
                canclebtgame.addEventListener(egret.TouchEvent.TOUCH_TAP, this.cancleShareGame, this);
                this.addChild(canclebtgame);

                var sharebtgame = new Bitmap("gamebody_json.btn_05");
                sharebtgame.x = 510;
                sharebtgame.y = 610;
                sharebtgame.anchorOffsetX = sharebtgame.width / 2;
                sharebtgame.anchorOffsetY = sharebtgame.height / 2;
                sharebtgame.touchEnabled = true;
                sharebtgame.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shareGame, this);
                this.addChild(sharebtgame);

                break;
        }
    }

    public gotoRanking() {
        let event:AlertEvent = new AlertEvent(AlertEvent.Ranking);
        this.dispatchEvent(event);
    }

    public reastGame() {
        let event:AlertEvent = new AlertEvent(AlertEvent.Restart);
        this.dispatchEvent(event);
    }

    public shareGame() {
        let event:AlertEvent = new AlertEvent(AlertEvent.Share);
        this.dispatchEvent(event);
    }

    public cancleShareGame() {
        let event:AlertEvent = new AlertEvent(AlertEvent.Cancle);
        this.dispatchEvent(event);
    }
}