var WxShareData = {
    desc: "",
    title: "",
    link: "", //"" + sharelink,
    imgUrl: ""
};
var _baseUrl = "//www.beisu100.com";
// var _baseUrl = "//ceshi.beisu100.com";

var sharelink = window.location.href;
function share(shareconfig) {
    if (shareconfig.title !== undefined) {
        WxShareData.title = shareconfig.title;
    }
    if (shareconfig.link !== undefined) {
        WxShareData.link = shareconfig.link;
    }
    if (shareconfig.desc !== undefined) {
        WxShareData.desc = shareconfig.desc;
    }
    if (shareconfig.imgUrl !== undefined) {
        WxShareData.imgUrl = shareconfig.imgUrl;
    }
    sharegame();
}
function sharegame() {
    $.ajax({
        type: "get",
        url: _baseUrl + "/site/wxjs",
        dataType: "json",
        json: "callback",
        data: {url: sharelink},
        jsonpCallback: "success_jsonpCallback",
        success: function (D) {
            console.log(D);
            wx.config({
                appId: D.data.appId,
                timestamp: D.data.timestamp,
                nonceStr: D.data.nonceStr,
                signature: D.data.signature,
                jsApiList: [
                    "onMenuShareTimeline",
                    "onMenuShareAppMessage"
                ]
            });
            wx.ready(function () {
                var shareData = {
                    title: WxShareData.title, //"疯狂记忆力,等你来挑战！挑战拿红包！",
                    desc: WxShareData.desc,
                    link: WxShareData.link,
                    imgUrl: WxShareData.imgUrl
                };
                wx.onMenuShareTimeline({
                    title: shareData.title,
                    desc: shareData.desc,
                    link: shareData.link,
                    imgUrl: shareData.imgUrl,
                    trigger: function (res) {
                        //alert('用户点击分享到朋友圈');
                    },
                    success: function (res) {
                        //alert('已分享');
                        //alreadyShare();
                    },
                    cancel: function (res) {
                        //alert('已取消');
                    },
                    fail: function (res) {
                        //alert('wx.onMenuShareTimeline:fail: '+JSON.stringify(res));
                    }
                });

                wx.onMenuShareAppMessage({
                    title: shareData.desc,
                    link: shareData.link,
                    desc: shareData.title,
                    imgUrl: shareData.imgUrl,
                    trigger: function (res) {
                        //alert('用户点击分享到朋友圈');
                    },
                    success: function (res) {
                        //alert('已分享');
                        //alreadyShare();
                    },
                    cancel: function (res) {
                        //alert('已取消');
                    },
                    fail: function (res) {
                        //alert('wx.onMenuShareTimeline:fail: '+JSON.stringify(res));
                    }
                });
                //wx.onMenuShareAppMessage(shareFriendData);
            });
        },
        error: function (data) {
            alert("wrong", data);
        }
    });
}
//接口请求获取参数
function geturldata(){
    var data = GetRequest();
    getShareData(data.timenum,data.activitynum,data.uid);
};
geturldata();
function GetRequest() {
    var url1 = location.search; //获取url中"?"符后的字串
    var url = decodeURIComponent(url1);
    var theRequest = new Object();
    if(url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
function getShareData(timenum,activitynum,vuid) {
    $.ajax({
        type: "get",
        url: _baseUrl + "/beisuapp/gamerank/share2",
        dataType: "json",
        json: "callback",
        data: {
            "timenum": timenum,
            "activitynum": activitynum,
            "vuid": vuid
        },
        jsonpCallback: "success_jsonpCallback",
        success: function (D) {
            console.log(D);
            share(D.data);
        },
        error: function (data) {
            alert("分享错误");
          
        }
    });
}
