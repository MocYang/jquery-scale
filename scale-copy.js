/**
 * Created by admin on 2017/6/9.
 */

(function ($) {
  /**
   * @constructor
   */
  function Scale(options) {

    var self = this
    var $canvas = insertCanvas(self);

    this.stage = new createjs.Stage($canvas)
    this.face = new FaceTouch('canvas')
    var defaults = {
      url: '',     // 默认作为背景图
      offset: {
        x: 0,
        y: 0
      },

      // 添加前景图片
      addForegroundImage: []
    }

    // 根据实际传入的options，扩展默认配置
    var optionsIndeed = $.extend(defaults, options)
    addImage(this, this.stage, optionsIndeed.url, function($container, image) {
      addEvents($container, image)
    })
  }

  function zoom (x1, y1, image) {
    if (image.scaledSize == undefined) {
      image.scaledSize = image.image.width
    }
    var scaledSize = image.image.width * image.scaleX
    var scaled = (scaledSize - image.scaledSize) / image.scaledSize
    image.scaledSize = scaledSize

    var x2 = image.x
    var y2 = image.y

    var hGap = x2 - x1
    var vGap = y2 - y1

    var xD = hGap >= 0 ? 1 : -1
    var yD = vGap >= 0 ? 1 : -1

    hGap = Math.abs(hGap)
    vGap = Math.abs(vGap)

    return {
      x: x2 + xD * hGap * scaled,
      y: y2 + yD * vGap * scaled
    }
  }

  function addImage($container,stage, src, cb) {
    var image = new Image()
    var stageWidth = $(self).width()
    var stageHeight = $(self).height()
    image.onload = function () {
      var bm,
        shape
      bm = new createjs.Bitmap(image)
      bm.regX = this.width / 2
      bm.regY = this.height / 2
      bm.x = stageWidth / 2
      bm.y = stageHeight / 2
      stage.addChild(bm)

      shape = new createjs.Shape()
      shape.graphics.beginFill('#ff0000').drawCircle(0, 0, 1)
      shape.x = bm.x
      shape.y = bm.y
      stage.addChild(shape)
      stage.update()

      cb($container, bm)
    }
    image.src = src
  }

  Scale.prototype.addImage = addImage
  Scale.prototype.removeImage = function(stage, img) {

  }

  // 插入canvas, 并初始化stage
  function insertCanvas($container) {
    var canvas = $('<canvas id="canvas" width="' + $container.width() * 2 + '" height="' + $container.height() * 2 + '">').get(0);
    var ctx = canvas.getContext('2d')

    ctx.imageSmoothingEnabled = false

    canvas.style.width = $container.width() + 'px'
    canvas.style.height = $container.height() + 'px'

    $container.empty().append(canvas)
    return canvas
  }

  /**
   * 给image添加事件
   * @param $container 父容器
   */
  function addEvents($container, image) {
    var stage = $container.stage
    var face = $container.face
    console.log(image )
    stage.on('stagemousedown', function (e) {
      var image = image
      if (e.primary && image) {
        image.offset = {
          x: image.x - e.stageX,
          y: image.y - e.stageY
        }
      }
      stage.update()
    })

    stage.on('stagemousemove', function (e) {
      var image = image
      if (e.primary && image && image.offset) {
        image.x = e.stageX + image.offset.x
        image.y = e.stageY + image.offset.y
      }

      stage.update()
    })

    stage.on('stagemouseup', function (e) {
      var image = image
      if (e.primary && image) {
        image.offset = null
      }

      stage.update()
    })

    face.onmove = function (e) {
      var image = image
      if (image) {
        image.x -= e.offsetx
        image.y -= e.offsety
      }

      stage.update()
    }

    face.onrotate = function (e) {
      var image = image

      // 两指的中点坐标
      var centerPoint = {
        x: (face.points[0].x + face.points[1].x) / 2,
        y: (face.points[0].y + face.points[1].y) / 2
      }
      var sc = 0
      if (image.scaleX < 0) {
        sc = image.scaleX * -1 + e.scale
        sc = Math.max(sc, 0.1)
        sc *= -1
      } else {
        sc = image.scaleX + e.scale
        sc = Math.max(sc, 0.1)
      }

      var newPos = zoom(centerPoint.x, centerPoint.y, image)
      image.x = newPos.x
      image.y = newPos.y

      image.scaleX = sc
      image.scaleY = Math.abs(sc)

      image.rotation += e.angle

      stage.update()
    }

    createjs.Ticker.addEventListener('tick', function () {
      stage.update()
    })

    return {
      stage: stage,
      face: face
    }
  }

  $.fn.extend({
    Scale: Scale
  })
})(jQuery)
