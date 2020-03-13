"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var canvas2d = /** @class */ (function () {
    function canvas2d(el, width, height) {
        this.x = 0;
        this.y = 0;
        this.displayFrameRate = true;
        this.rate = 0;
        this.lastTime = 0;
        this.maxTime = 1 / 30;
        this.offScreen = [];
        this.interval = 0;
        this.gameBoard = [];
        this.background = [];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.root = document.getElementById(el);
        this.root.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }
    canvas2d.prototype.frameRate = function (dt) {
        this.interval += dt;
        if (this.interval > 2) {
            this.interval = 0;
            this.rate = ~~(1 / dt);
        }
        this.ctx.fillStyle = "rgb(0,255,0)";
        this.ctx.font = "40px Verdana";
        this.ctx.fillText("FPS:" + this.rate, 40, 40);
    };
    canvas2d.prototype.push = function (obj, type) {
        if (type === "bg") {
            this.background.push();
        }
        this.gameBoard.push(obj);
    };
    canvas2d.prototype.removeBg = function (obj) {
        var p = this.background.indexOf(obj);
        this.background.splice(p, 1);
    };
    canvas2d.prototype.remove = function (obj, index) {
        if (index !== undefined) {
            this.gameBoard.splice(index, 1);
        }
        else {
            var p = this.gameBoard.indexOf(obj);
            this.gameBoard.splice(p, 1);
        }
    };
    canvas2d.prototype.createGameObj = function (type, info, sprite) {
        var obj = {};
        if (type === "round") {
            this.offScreen.push(new offscreenCanvas(document.createElement('canvas')));
            obj = new roundObject(info, this.offScreen.length - 1);
        }
        else if (type === "spite" && sprite !== undefined) {
            if (sprite.targerFrame) {
                obj = new seqSpriteObject(info, sprite);
            }
            else {
                this.offScreen.push(new offscreenCanvas(document.createElement('canvas')));
                obj = new spriteObject(info, sprite, this.offScreen.length - 1);
            }
        }
        else if (type === "rect") {
            obj = new rectangleObject(info);
        }
        else if (type === "triangel") {
            obj = new rectangleObject(info);
        }
        else if (type === "text") {
            obj = new textObject(info);
        }
        return obj;
    };
    // preload(){
    //     for(let j=0;j<this.background.length;j++){
    //         this.background[j].createCache(this);
    //     }
    //     for(let i=0;i<this.gameBoard.length;i++){
    //         this.gameBoard[i].createCache(this);
    //     }
    //  }
    canvas2d.prototype.loop = function () {
        var _this = this;
        var dt = this.lastTime;
        this.lastTime = new Date().getTime();
        dt = (this.lastTime - dt) / 1000;
        var tempDt = dt;
        if (dt > this.maxTime) {
            dt = this.maxTime;
        }
        this.canvas.width = this.width;
        for (var j = 0; j < this.background.length; j++) {
            this.background[j].draw(this);
            this.background[j].step(dt, this);
        }
        for (var i = 0; i < this.gameBoard.length; i++) {
            this.gameBoard[i].draw(this);
            this.gameBoard[i].step(dt, this);
        }
        if (this.displayFrameRate) {
            this.frameRate(tempDt);
        }
        this.t = requestAnimationFrame(function () {
            _this.loop();
        });
    };
    return canvas2d;
}());
var gameObject = /** @class */ (function () {
    function gameObject(info) {
        this.width = info.w || 100;
        this.height = info.h || 100;
        this.Vx = info.Vx || 100;
        this.Vy = info.Vy || 100;
        this.x = info.x || 0;
        this.y = info.y || 0;
    }
    gameObject.prototype.move = function (dt) {
        this.x += ~~(this.Vx * dt);
        this.y += ~~(this.Vy * dt);
    };
    gameObject.prototype.end = function (gameObj, that, addObj) {
        if (addObj !== undefined) {
            var temp = new addObj();
            temp.x = this.x;
            temp.y = this.y;
            temp.Vx = this.Vx;
            temp.Vy = this.Vy;
            that.push(temp);
            that.remove(gameObj);
        }
    };
    return gameObject;
}());
var roundObject = /** @class */ (function (_super) {
    __extends(roundObject, _super);
    function roundObject(info, offscreen) {
        var _this = _super.call(this, info) || this;
        _this.r = 10;
        _this.CreatCache = 0;
        _this.offscreen = offscreen;
        _this.r = info.r || 20;
        _this.color = info.color || "rgb(0, 100, 0)";
        _this.width = info.r * 2 || 10;
        _this.height = info.r * 2 || 10;
        return _this;
    }
    // createCache(that:any){
    // }
    roundObject.prototype.draw = function (that) {
        if (!that.offScreen[this.offscreen].isBuild) {
            that.offScreen[this.offscreen].isBuild = true;
            that.offScreen[this.offscreen].canvas.width = this.width;
            that.offScreen[this.offscreen].canvas.height = this.height;
            that.offScreen[this.offscreen].canvas.getContext('2d').save();
            that.offScreen[this.offscreen].canvas.getContext('2d').fillStyle = this.color;
            that.offScreen[this.offscreen].canvas.getContext('2d').beginPath();
            that.offScreen[this.offscreen].canvas.getContext('2d').arc(this.r, this.r, this.r, 0, 2 * Math.PI, true);
            that.offScreen[this.offscreen].canvas.getContext('2d').stroke();
            that.offScreen[this.offscreen].canvas.getContext('2d').closePath();
            that.offScreen[this.offscreen].canvas.getContext('2d').fill();
            that.offScreen[this.offscreen].canvas.getContext('2d').restore();
        }
        that.ctx.drawImage(that.offScreen[this.offscreen], this.x, this.y);
    };
    roundObject.prototype.step = function (dt, that) {
        this.move(dt);
    };
    return roundObject;
}(gameObject));
var rectangleObject = /** @class */ (function (_super) {
    __extends(rectangleObject, _super);
    function rectangleObject(info) {
        var _this = _super.call(this, info) || this;
        _this.TargetLifeCycle = Infinity;
        _this.lifeCycle = 0;
        _this.color = info.color || "rgb(245, 240, 240)";
        return _this;
    }
    rectangleObject.prototype.draw = function (that) {
        that.ctx.fillStyle = this.color;
        that.ctx.rect(this.x, this.y, this.width, this.height);
        that.ctx.fill();
    };
    rectangleObject.prototype.step = function (dt, that) {
    };
    rectangleObject.prototype.end = function (that) {
        that.remove(this);
    };
    return rectangleObject;
}(gameObject));
var triangleObject = /** @class */ (function (_super) {
    __extends(triangleObject, _super);
    function triangleObject(info) {
        var _this = _super.call(this, info) || this;
        _this.TargetLifeCycle = Infinity;
        _this.lifeCycle = 0;
        _this.color = info.color || "rgb(245, 240, 240)";
        return _this;
    }
    triangleObject.prototype.draw = function (that) {
        that.ctx.fillStyle = this.color;
        that.ctx.rect(this.x, this.y, this.width, this.height);
        that.ctx.fill();
    };
    triangleObject.prototype.step = function (dt, that) {
    };
    return triangleObject;
}(gameObject));
var spriteObject = /** @class */ (function (_super) {
    __extends(spriteObject, _super);
    function spriteObject(info, sprite, offscreen) {
        var _this = _super.call(this, info) || this;
        _this.offscreen = offscreen;
        _this.sprite = sprite;
        return _this;
    }
    spriteObject.prototype.draw = function (that) {
        if (!that.offScreen[this.offscreen].isBuild) {
            that.offScreen[this.offscreen].isBuild = true;
            that.offScreen[this.offscreen].canvas.width = this.width;
            that.offScreen[this.offscreen].canvas.height = this.height;
            that.offScreen[this.offscreen].canvas.getContext('2d').drawImage(this.sprite.Img, this.sprite.sx, this.sprite.sy, this.sprite.w, this.sprite.h, 0, 0, this.width, this.height);
        }
        that.ctx.drawImage(that.offScreen[this.offscreen].canvas, this.x, this.y);
    };
    spriteObject.prototype.step = function (dt) {
        this.move(dt);
    };
    return spriteObject;
}(gameObject));
var seqSpriteObject = /** @class */ (function (_super) {
    __extends(seqSpriteObject, _super);
    function seqSpriteObject(info, sprite) {
        var _this = _super.call(this, info) || this;
        _this.nowFrame = 0;
        _this.count = 0;
        _this.sprite = sprite;
        _this.loop = sprite.loop || false;
        _this.interval = sprite.inveral || 1;
        _this.targerFrame = sprite.targerFrame || 1;
        _this.sx = sprite.sx || 0;
        _this.sy = sprite.sy || 0;
        return _this;
    }
    seqSpriteObject.prototype.draw = function (that) {
        that.ctx.drawImage(this.sprite.Img, this.sprite.sx, this.sprite.sy, this.sprite.w, this.sprite.h, this.x, this.y, this.width, this.height);
        this.count++;
        if (this.count === this.interval) {
            this.count = 0;
            this.nowFrame++;
            this.sx += this.sprite.width;
            this.sy += this.sprite.height;
            if (this.loop && this.nowFrame >= this.targerFrame) {
                this.nowFrame = 0;
                this.sx = this.sprite.sx;
                this.sy = this.sprite.sy;
            }
        }
    };
    seqSpriteObject.prototype.step = function (dt) {
        this.move(dt);
    };
    return seqSpriteObject;
}(gameObject));
var textObject = /** @class */ (function (_super) {
    __extends(textObject, _super);
    function textObject(info) {
        return _super.call(this, info) || this;
    }
    textObject.prototype.draw = function (that) {
    };
    textObject.prototype.step = function (that) {
    };
    return textObject;
}(gameObject));
var audio = /** @class */ (function () {
    function audio(src, currentTime, sustainTime) {
        this.currentTime = 0;
        this.playTime = 0;
        this.sustainTime = -1;
        this.loop = false;
        this.volume = 1;
        this.el = new Audio();
        this.el.src = src;
        if (currentTime !== undefined) {
            this.currentTime = currentTime;
        }
        if (sustainTime !== undefined) {
            this.sustainTime = sustainTime;
        }
    }
    audio.prototype.play = function () {
        this.el.currentTime = this.currentTime;
        this.playTime = 0;
        if (this.loop) {
            this.el.loop = true;
        }
        // this.el.fastSeek(1)
        this.el.play();
    };
    audio.prototype.pause = function () {
        this.el.pause();
    };
    return audio;
}());
var control = /** @class */ (function () {
    function control() {
    }
    return control;
}());
var collision = /** @class */ (function () {
    function collision(type, mode) {
        this.Collision = [];
        this.type = type;
        this.mode = mode || "single";
        this.isCollision = false;
    }
    collision.prototype.overlape = function (obj1, obj2) {
        return !((obj1.x + obj1.width) < obj2.x || (obj1.y + obj1.height) < obj2.y ||
            (obj2.x + obj2.width) < obj1.x || (obj2.y + obj2.height) < obj1.y);
    };
    collision.prototype.checkCollision = function (obj1, that) {
        for (var i = 0; i < that.gameBoard.length; i++) {
            if (that.gameBoard[i].col && obj1.col.type === that.gameBoard[i].col.type && obj1 !== that.gameBoard[i]) {
                if (this.overlape(obj1, that.gameBoard[i])) {
                    obj1.col.isCollision = true;
                    that.gameBoard[i].col.isCollision = true;
                    // this.Collision.push(that.gameBoard[i])
                    if (this.mode === "single") {
                        break;
                    }
                }
                else {
                    obj1.col.isCollision = false;
                }
            }
        }
    };
    return collision;
}());
var offscreenCanvas = /** @class */ (function () {
    function offscreenCanvas(canvas) {
        this.isBuild = false;
        this.canvas = canvas;
    }
    return offscreenCanvas;
}());
