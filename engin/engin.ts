 class canvas2d{
    x:number=0;
    y:number=0;
    width:number;
    height:number;
    ctx:any;
    displayFrameRate:boolean=true;
    rate:number=0;
    root:any;
    canvas:any;
    lastTime:number=0;
    maxTime:number=1/30;
    offScreen:any[]=[];
    t:any;
    interval:number=0;
    gameBoard:any[]=[];
    background:any[]=[];
    frameRate(dt:number){
        this.interval+=dt;
        if(this.interval>2){
        this.interval=0;
        this.rate=~~(1/dt);
        }
        this.ctx.fillStyle="rgb(0,255,0)"
        this.ctx.font="40px Verdana";
        this.ctx.fillText("FPS:"+this.rate,40,40)
       
    }

    push(obj:any,type?:string):void{
        if(type==="bg"){
            this.background.push()
        }
        this.gameBoard.push(obj)
    }
    removeBg(obj:any){
        let p=this.background.indexOf(obj)
        this.background.splice(p,1);
    }
    remove(obj:any,index?:number):void{
        if(index!==undefined){
            this.gameBoard.splice(index,1);
        }else{
            let p=this.gameBoard.indexOf(obj)
            this.gameBoard.splice(p,1);
        }
    }
    createGameObj(type:string,info:object,sprite?:any):object{
    var obj:object={}
    if(type==="round"){
       this.offScreen.push(new offscreenCanvas(document.createElement('canvas')))
       obj=new roundObject(info,this.offScreen.length-1)
    }else if(type==="spite"&&sprite!==undefined){
        if(sprite.targerFrame){
            obj=new seqSpriteObject(info,sprite)

        }else{
            this.offScreen.push(new offscreenCanvas(document.createElement('canvas')))
            obj=new spriteObject(info,sprite,this.offScreen.length-1)
        }
    }else if(type==="rect"){
        obj=new rectangleObject(info)
    }else if(type==="triangel"){
        obj=new rectangleObject(info)
    }else if(type==="text"){
        obj=new textObject(info)
    }
      return obj
    }
    constructor(el:string,width:number,height:number){
        this.canvas=document.createElement("canvas");
        this.canvas.width=width;
        this.canvas.height=height;
        this.width=width;
        this.height=height;
        this.root=document.getElementById(el)
        this.root.appendChild(this.canvas)
        this.ctx=this.canvas.getContext('2d')
     }
    // preload(){
    //     for(let j=0;j<this.background.length;j++){
    //         this.background[j].createCache(this);
    //     }
    //     for(let i=0;i<this.gameBoard.length;i++){
    //         this.gameBoard[i].createCache(this);
    //     }
    //  }
     loop(){
        var dt=this.lastTime
        this.lastTime = new Date().getTime()
        dt=(this.lastTime-dt)/ 1000;
        let tempDt=dt;
        if (dt > this.maxTime) {
            dt = this.maxTime
        }
        this.canvas.width=this.width;
        for(let j=0;j<this.background.length;j++){
            this.background[j].draw(this);
            this.background[j].step(dt,this)
        }
        for(let i=0;i<this.gameBoard.length;i++){
            this.gameBoard[i].draw(this);
            this.gameBoard[i].step(dt,this);
        }
        if(this.displayFrameRate){
            this.frameRate(tempDt);
        }
        this.t=requestAnimationFrame(()=>{
            this.loop()
        })

     }
}
abstract class gameObject{
    width:number;
    height:number;
    x:number;
    y:number;
    Vx:number;
    Vy:number;
    abstract draw(that:any):void;
    move(dt:number){
        this.x+=~~(this.Vx*dt);
        this.y+=~~(this.Vy*dt);
    }
    abstract step(dt:number,that:any):void;
    constructor(info:any){
        this.width=info.w||100;
        this.height=info.h||100;
        this.Vx=info.Vx||100
        this.Vy=info.Vy||100
        this.x=info.x||0;
        this.y=info.y||0;
    }
    end( gameObj:any,that:any,addObj?:any){
        if(addObj!==undefined){
            let temp:any=new addObj();
            temp.x=this.x;
            temp.y=this.y;
            temp.Vx=this.Vx;
            temp.Vy=this.Vy;
            that.push(temp);
            that.remove(gameObj)
        }

    }

}
 class roundObject extends gameObject{
    color:string;
    r:number=10;
    offscreen:number;
    CreatCache:number=0;
    // createCache(that:any){
       
    // }
    draw(that:any){
        if(!that.offScreen[this.offscreen].isBuild){
            that.offScreen[this.offscreen].isBuild=true
            that.offScreen[this.offscreen].canvas.width=this.width;
            that.offScreen[this.offscreen].canvas.height=this.height;
            that.offScreen[this.offscreen].canvas.getContext('2d').save()
            that.offScreen[this.offscreen].canvas.getContext('2d').fillStyle=this.color;
            that.offScreen[this.offscreen].canvas.getContext('2d').beginPath();
            that.offScreen[this.offscreen].canvas.getContext('2d').arc(this.r, this.r, this.r, 0, 2 * Math.PI, true)
            that.offScreen[this.offscreen].canvas.getContext('2d').stroke()
            that.offScreen[this.offscreen].canvas.getContext('2d').closePath()
            that.offScreen[this.offscreen].canvas.getContext('2d').fill()
            that.offScreen[this.offscreen].canvas.getContext('2d').restore()
            }
        that.ctx.drawImage(that.offScreen[this.offscreen],this.x,this.y)
    }
    step(dt:number,that:any){
        this.move(dt);
    }
    constructor(info:any,offscreen:number){
        super(info)
        this.offscreen=offscreen;
        this.r=info.r||20;
        this.color=info.color||"rgb(0, 100, 0)"
        this.width=info.r*2||10;
        this.height=info.r*2||10;
    }

 }
 class rectangleObject extends gameObject{
    color:string;
    TargetLifeCycle:number=Infinity;
    lifeCycle:number=0;
    draw(that:any){

        that.ctx.fillStyle=this.color;
        that.ctx.rect(this.x,this.y,this.width,this.height)
        that.ctx.fill()
    }
    step(dt:number,that:any){
   }
    end(that:any){
        that.remove(this)
    }
    constructor(info:any){
        super(info)
        this.color=info.color||"rgb(245, 240, 240)"
    }
 }
 class triangleObject extends gameObject{
    color:string;
    TargetLifeCycle:number=Infinity;
    lifeCycle:number=0;
    draw(that:any){
        that.ctx.fillStyle=this.color;
        that.ctx.rect(this.x,this.y,this.width,this.height)
        that.ctx.fill()
    }
    step(dt:number,that:any){
   }
    constructor(info:any){
        super(info)
        this.color=info.color||"rgb(245, 240, 240)"
    }
 }
 class spriteObject extends gameObject{
    sprite:any;
    offscreen:number;
    draw(that:any){
        if(!that.offScreen[this.offscreen].isBuild){
            that.offScreen[this.offscreen].isBuild=true;
            that.offScreen[this.offscreen].canvas.width=this.width;
            that.offScreen[this.offscreen].canvas.height=this.height;
            that.offScreen[this.offscreen].canvas.getContext('2d').drawImage(this.sprite.Img, this.sprite.sx, this.sprite.sy,
            this.sprite.w, this.sprite.h, 0,0, this.width, this.height);
        }
        that.ctx.drawImage(that.offScreen[this.offscreen].canvas,this.x,this.y)
    }
    step(dt:number){
        this.move(dt)
    }
    constructor(info:any,sprite:any,offscreen:number){
        super(info);
        this.offscreen=offscreen;
        this.sprite=sprite;
    }
 }
 class seqSpriteObject extends gameObject{
    interval:number;
    targerFrame:number;
    nowFrame:number=0;
    loop:boolean;
    sx:number;
    sy:number;
    count:number=0;
    sprite:any;
    draw(that:any){
       that.ctx.drawImage(this.sprite.Img, this.sprite.sx, this.sprite.sy,
        this.sprite.w, this.sprite.h, this.x, this.y, this.width, this.height);
        this.count++;
        if(this.count===this.interval){
            this.count=0
            this.nowFrame++;
            this.sx+=this.sprite.width;
            this.sy+=this.sprite.height;
            if(this.loop&&this.nowFrame>=this.targerFrame){
                this.nowFrame=0;
                this.sx=this.sprite.sx;
                this.sy=this.sprite.sy;

            }
        }
    }
    step(dt:number){
        this.move(dt)
    }
    constructor(info:any,sprite:any){
        super(info)
        this.sprite=sprite;
        this.loop=sprite.loop||false;
        this.interval=sprite.inveral||1;
        this.targerFrame=sprite.targerFrame||1;
        this.sx=sprite.sx||0;
        this.sy=sprite.sy||0;

    }
 }
 class textObject extends gameObject{
      
    draw(that:any):void{

    }
    step(that :any):void{

    }
     constructor(info:any){
        super(info)
     }
 }
 class audio{
    el:any;
    currentTime:number=0;
    playTime:number=0;
    sustainTime:number=-1;
    loop:boolean=false;
    volume:number=1;
    constructor(src:string,currentTime?:number,sustainTime?:number){
        this.el=new Audio();
        this.el.src=src;
        if(currentTime!==undefined){
            this.currentTime=currentTime
        }
        if(sustainTime!==undefined){
            this.sustainTime=sustainTime
        }
    }
    play():void{
        this.el.currentTime=this.currentTime;
        this.playTime=0
        if(this.loop){
            this.el.loop=true;
        }
        // this.el.fastSeek(1)
        this.el.play()
    }
    pause():void{
        this.el.pause()
    }
 }
 class control{
     
 }
 class collision{
     type:number;
     mode:string;
     Collision:any[]=[];
     isCollision:boolean;
     overlape(obj1:any,obj2:any):boolean{
         return !((obj1.x+obj1.width)<obj2.x||(obj1.y+obj1.height)<obj2.y||
         (obj2.x+obj2.width)<obj1.x||(obj2.y+obj2.height)<obj1.y)
     }
     checkCollision(obj1:any,that:any):void{
            for(let i=0;i<that.gameBoard.length;i++){
                if(that.gameBoard[i].col&&obj1.col.type===that.gameBoard[i].col.type&&obj1!==that.gameBoard[i]){
                    if(this.overlape(obj1,that.gameBoard[i])){
                        obj1.col.isCollision=true
                        that.gameBoard[i].col.isCollision=true;
                        // this.Collision.push(that.gameBoard[i])
                        if(this.mode==="single"){
                            break;
                        }
                    }
                    else{
                        obj1.col.isCollision=false

                    }
                }

            }
     }
     constructor(type:number,mode?:string){
        this.type=type;
        this.mode=mode||"single";
        this.isCollision=false;
     }
 }
 class offscreenCanvas{
      canvas:any;
      isBuild:boolean=false
      constructor(canvas:any){
          this.canvas=canvas;
      }
 }


 
