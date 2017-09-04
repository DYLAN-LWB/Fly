/**
 * Created by Mac_c on 15/10/8.
 */
class Movie extends egret.Sprite
{
    private  mcf:egret.MovieClipDataFactory;
    private  mc:egret.MovieClip;
    public  constructor()
    {
        super();
        //      this.init();
    }
    public init(str1:string,str2:string,str3:string,str4:number):void
    {

        var data = RES.getRes(str1);
        var tex =  RES.getRes(str2);
        this.mcf = new egret.MovieClipDataFactory(data, tex);
        this.mc = new egret.MovieClip();
        this.mc.movieClipData = this.mcf.generateMovieClipData(str3);
        this.mc.play(str4);  //playTimes:number — 播放次数。 参数为整数，可选参数，>=1：设定播放次数，<0：循环播放，默认值 0：不改变播放次数(MovieClip初始播放次数设置为1)，
        this.addChild(this.mc);
        this.mc.addEventListener(egret.Event.COMPLETE, this.removeBomb, this);
    }
    private  removeBomb(evt:egret.Event):void
    {
        if(this.parent!=null)
        {
            this.parent.removeChild(this);
        }
    }
}