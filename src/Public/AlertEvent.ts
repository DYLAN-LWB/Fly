class AlertEvent extends egret.Event {

    public static Share:string = "share";
    public static Ranking:string = "ranking";
    public static Restart:string = "restart";
    public static Cancle:string = "cancle";


    public constructor(type:string, bubbles:boolean = false, cancelable:boolean = false) {
        super(type, bubbles, cancelable);
    }
}