/**
 * Created by admin on 2017/6/9.
 */

(function ($) {
  // Array.isArray() 的polyfill
  if (!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }

  // 可选的options的取值
  var option = {
    id: 0,
    url: '',     // 默认作为背景图

    // 默认的注册点
    position: 'center center',

    // 相对注册点的偏移量
    offset: {
      x: 0,
      y: 0
    },

    // 是否响应鼠标事件，默认为true
    mouseEnabled: true,

    // 是否添加mask
    mask: false
  }

  function Scale(options) {

    var self = this

    // 实例方法
    // 替换背景图
    this.changeBackgroundImage = function (img, offset) {
      this.removeImage(this.image)
      addImage(this, img, offset, function ($container, image) {
        addEvents($container, image)
      })
    }

    // 移除stage上的一张给定的图片
    this.removeImage = function (img) {
      if (img != null) {
        this.stage.removeChild(img);
      }
    }

    // 清空所有的图片--包含背景图和前景图
    this.removeAll = function () {
      this.stage.removeAllChildren()
    }

    // 返回所有的options
    this.getOptions = function (id) {
      var resultImage = null
      this.images.forEach(function (image, index) {
        if (image.id === id) {
          resultImage = image
        }
      })

      return resultImage
    }

    var $canvas = insertCanvas(self);
    this.stage = new createjs.Stage($canvas)
    this.face = new FaceTouch('canvas')
    this.stage.enableMouseOver(20);

    var images = options && options.images
    this.images = []                      // 实际的image对象集合
    this.imageConfigs = []                // 所有的image的配置项集合
    // 多张背景图
    if (images && Array.isArray(images)) {
      var allOptions = null;
      images.forEach(function (image, index) {
        // TODO: 抽取出非object的image字符串
        allOptions = $.extend({}, option, image, {
          id: index
        })
        console.log(allOptions)
        self.imageConfigs.push(allOptions)
        if (allOptions) {
          // 添加背景图
          addImage(self, allOptions)
        }
      })
    }

    return this;
  }

  function zoom(x1, y1, image) {
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

  // 在canvas容器中添加一张图片
  function addImage($container, image) {
    if (typeof image === 'string') {
      var imageElem = new Image()
      imageElem.onload = function () {
        createBitMap($container, imageElem, image)
      }
      imageElem.src = image
    } else if (typeof image === 'object') {

      // 如果直接传入的是一个img标签
      if (image.nodeType === 1) {
        createBitMap($container, image)
      } else if (image.url) {
        var imageElem2 = new Image()
        imageElem2.onload = function () {
          createBitMap($container, imageElem2, image)
        }
        imageElem2.src = image.url
      }
    }

    function createBitMap($container, image, options) {
      var stage = $container.stage
      var bm = new createjs.Bitmap(image)
      var position = options.position
      var offset = options.offset
      var container = new createjs.Container();
      container.width = stage.canvas.width
      container.height = stage.canvas.height;
      container.x = 10;
      container.y = 10;

      var positions = getPositions($container, position)
      var imageOffset = getDefaultOffsets(bm.image, position)
      // 默认图片的注册点是canvas的中心点
      var x = $container.width() / 2
      var y = $container.height() / 2
      var regX = imageOffset.x
      var regY = imageOffset.y

      // 如果传入了自定义的position
      if (positions) {
        x = positions.x
        y = positions.y

        // 替换图片时使用上一张图片的偏移值
      } else if ($container.image != null) {
        x = $container.image.x
        y = $container.image.y
      }
      bm.regX = offset ? offset.x + regX : regX
      bm.regY = offset ? offset.y + regY : regY
      bm.x = x
      bm.y = y

      if (options.mask) {
        var containerMask = new createjs.Shape();
        containerMask.width =  bm.image.width;
        containerMask.height = bm.image.height;
        containerMask.graphics.beginFill('#ffffff').drawRect(bm.x - bm.regX, bm.y - bm.regY, bm.image.width, bm.image.height);
        container.mask = containerMask;
      }




      container.addChild(bm)
      stage.addChild(container);
      stage.update()

      $container.images.push(bm)

      addEvents($container, bm)
    }
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
   * @param image 需要操作的BitMap实例
   */
  function addEvents($container, image) {
    var stage = $container.stage
    var face = $container.face
    image.on('mousedown', function (e) {
      if (e.primary && image) {
        image.offset = {
          x: image.x - e.stageX,
          y: image.y - e.stageY
        }
      }
    })

    image.on('pressmove', function (e) {
      if (e.primary && image && image.offset) {
        image.x = e.stageX + image.offset.x
        image.y = e.stageY + image.offset.y
      }

      stage.update()
    })

    image.on('pressup', function (e) {
      if (e.primary && image) {
        image.offset = null
      }

      stage.update()
    })

    // face.onmove = function (e) {
    //   if (image) {
    //     image.x -= e.offsetx
    //     image.y -= e.offsety
    //   }
    //
    //   stage.update()
    // }
    //
    // face.onrotate = function (e) {
    //   // 两指的中点坐标
    //   var centerPoint = {
    //     x: (face.points[0].x + face.points[1].x) / 2,
    //     y: (face.points[0].y + face.points[1].y) / 2
    //   }
    //   var sc = 0
    //   if (image.scaleX < 0) {
    //     sc = image.scaleX * -1 + e.scale
    //     sc = Math.max(sc, 0.1)
    //     sc *= -1
    //   } else {
    //     sc = image.scaleX + e.scale
    //     sc = Math.max(sc, 0.1)
    //   }
    //
    //   var newPos = zoom(centerPoint.x, centerPoint.y, image)
    //   image.x = newPos.x
    //   image.y = newPos.y
    //
    //   image.scaleX = sc
    //   image.scaleY = Math.abs(sc)
    //
    //   image.rotation += e.angle
    //
    //   stage.update()
    // }

    createjs.Ticker.addEventListener('tick', function () {
      stage.update()
    })

    return {
      stage: stage,
      face: face
    }
  }

  /**
   * 根据传入的position字符串值，生成相应的x,y定位值
   * @param $container
   * @param position
   * @returns {{x: number, y: number}}
   */
  function getPositions($container, position) {
    // 这里都放大1倍的原因是因为， 生成canvas时， 指定的width为设置其css的width的2倍
    var stageWidth = $container.width() * 2
    var stageHeight = $container.height() * 2
    var container = {
      width: stageWidth,
      height: stageHeight
    }
    position = position.toLowerCase()
    return matchPosition(container, position)
  }

  /**
   * 根据不同的position， 获取图片不同的偏移量
   * @param image
   * @param position
   * @returns {{x: number, y: number}}
   */
  function getDefaultOffsets(image, position) {
    var container = {
      width: image.width,
      height: image.height
    }
    position = position.toLowerCase()
    return matchPosition(container, position)
  }

  /**
   * 根据9个不同的位置，生成不同的x, y值
   * @param container 偏移值的参考元素， 可以是stage，或一张图片
   * @param position
   * @returns {{x: number, y: number}}
   */
  function matchPosition(container, position) {
    var px = 0,
      py = 0,
      width = container.width,
      height = container.height

    switch (position) {
      case 'top left':
      case 'left top':
        px = 0
        py = 0
        break
      case 'top center':
      case 'center top':
        px = width / 2
        py = 0
        break
      case 'top right':
      case 'right top':
        px = width
        py = 0
        break
      case 'center left':
      case 'left center':
        px = 0
        py = height / 2
        break
      case 'center center':
      case 'center':
        px = width / 2
        py = height / 2
        break
      case 'center right':
      case 'right center':
        px = width
        py = height / 2
        break
      case 'bottom left':
      case 'left bottom':
        px = 0
        py = height
        break
      case 'bottom center':
      case 'center bottom':
        px = width / 2
        py = height
        break
      case 'bottom right':
      case 'right bottom':
        px = width
        py = height
        break
      default:
        px = 0
        py = 0
    }

    return {
      x: px,
      y: py
    }
  }

  $.fn.extend({
    Scale: Scale
  })
})(jQuery)
