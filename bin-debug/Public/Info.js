var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var Info = (function () {
    function Info() {
        this._url = "//www.beisu100.com/beisuapp/"; // 线上环境
        // public _url = "http://ceshi.beisu100.com/beisuapp/";	//测试环境
        this._hasAttention = this._url + "uservote/isguanzhu"; //是否关注
        this._canPalyNumber = this._url + "typos/num"; //剩余挑战次数
        this._downnum = this._url + "typos/numdown5"; //减游戏次数
        this._gameover = this._url + "typos/GameOver"; //游戏结束
        this._typosTempjump = this._url + "typos/typostempjump"; //加分
        this._getWord = this._url + "typos/getjumpwords"; //获取单词
        // public _searchWord = "http://ceshi.beisu100.com/querylist/getwordslist/l/";
        this._rankUrl = this._url + "gamerank/rank/timenum/";
    }
    return Info;
}());
__reflect(Info.prototype, "Info");
//# sourceMappingURL=Info.js.map