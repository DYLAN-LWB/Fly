class Info  {
    // public  _url = "//www.beisu100.com/beisuapp/";	// 线上环境
    public _url = "//ceshi.beisu100.com/beisuapp/";	//测试环境
    
    public _hasAttention      = this._url + "uservote/isguanzhu";	     //是否关注
    public _canPalyNumber     = this._url + "typos/num";	             //剩余挑战次数
    public _downnum           = this._url + "typos/numdown5";            //减游戏次数
    public _gameover          = this._url + "typos/GameOver";            //游戏结束
    public _typosTempjump     = this._url + "typos/typostempjump";       //加分
    public _getWord           = "//www.beisu100.com/beisuapp/" + "typos/GetBallwords";        //获取单词
    public _rankUrl           = this._url + "gamerank/rank/timenum/";    //查看排名

    public _vuid:string;    //用户id
    public _key:string;     //用户key
    public _isfrom:string;	//页面来源 微信=0 app=1
    public _timenum;        //第几期
    public _activitynum;    //活动编号
}