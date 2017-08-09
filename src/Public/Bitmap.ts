class Bitmap extends egret.Bitmap {

    public constructor(name: string) {
        super();
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}