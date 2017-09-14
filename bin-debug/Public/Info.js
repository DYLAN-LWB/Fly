var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var Info = (function () {
    function Info() {
        // public  _url = "//www.beisu100.com/beisuapp/";	// 线上环境
        this._url = "//ceshi.beisu100.com/beisuapp/"; //测试环境
        this._hasAttention = this._url + "uservote/isguanzhu"; //是否关注
        this._canPalyNumber = this._url + "typos/num"; //剩余挑战次数
        this._downnum = this._url + "typos/numdown5"; //减游戏次数
        this._gameover = this._url + "typos/GameOver"; //游戏结束
        this._typosTempjump = this._url + "typos/typostempjump"; //加分
        this._getWord = "//www.beisu100.com/beisuapp/" + "typos/GetBallwords"; //获取单词
        this._rankUrl = this._url + "gamerank/rank/timenum/"; //查看排名
    }
    return Info;
}());
__reflect(Info.prototype, "Info");
//# sourceMappingURL=Info.js.map