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
    mask: false,

    // 图片缩放的比例， 可以是number|'cover'|'contain'
    scale: 1,

    // 是否允许多指操作，如双指的缩放、旋转
    enabledMultiTouches: true
  }

  function Scale(options) {

    var self = this

    // 实例方法
    // 替换背景图
    this.changeBackgroundImage = function (img, offset) {
      this.removeImage(this.image)
      // addImage(this, img, offset,)
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
    this.container = new createjs.Container();
    this.container.width = this.stage.canvas.width
    this.container.height = this.stage.canvas.height;
    this.stage.enableMouseOver(20);
    createjs.Touch.enable(this.stage);
    createjs.Ticker.addEventListener('tick', function () {
      self.stage.update()
    })

    var images = options && options.images           // 背景图
    var foregrounds = options && options.foregrounds // 前景图
    this.images = []                                 // 实例上所有的背景图
    this.foregrounds = []                            // 实例上所有的前景图

    // 多张背景图
    if (images && Array.isArray(images) && images.length >= 1) {
      var allOptions = null;
      images.forEach(function (image, index) {
        // TODO: 抽取出非object的image字符串
        allOptions = $.extend({}, option, image, {
          id: index
        })
        if (allOptions) {
          (function (option) {
            // 添加背景图
            addImage(self, allOptions, function (bm) {
              self.images.push(bm)
              drawContainerImage(self, self.images)
              addEvents(self, bm, option)
            })
          }) (allOptions)
        }
      })
    }

    // 添加前景图
    if (foregrounds && Array.isArray(foregrounds) && foregrounds.length >= 1) {
      allOptions = null;
      foregrounds.forEach(function (image, index) {
        // TODO: 抽取出非object的image字符串
        allOptions = $.extend({}, option, image, {
          id: index
        })
        if (allOptions) {
          // 添加背景图
          addImage(self, allOptions, function (bm) {
            self.foregrounds.push(bm)
            bm.zIndex = 9999
            drawForegroundImages(self, self.foregrounds)
          })
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

  // 在canvas容器中添加一张背景图
  function addImage($container, image, cb) {
    var bm = null
    if (typeof image === 'string') {
      var imageElem = new Image()
      imageElem.onload = function () {
        bm = createBitMap($container, imageElem, image)
        cb(bm)
      }
      imageElem.src = image
    } else if (typeof image === 'object') {

      // 如果直接传入的是一个img标签
      if (image.nodeType === 1) {
        bm = createBitMap($container, image)
        cb(bm)
      } else if (image.url) {
        var imageElem2 = new Image()
        imageElem2.onload = function () {
          bm = createBitMap($container, imageElem2, image)
          cb(bm)
        }
        imageElem2.src = image.url
      }
    }

    /**
     * 生成一个createjs的BitMap实例
     * @param $container
     * @param image
     * @param options
     * @returns {*}
     */
    function createBitMap($container, image, options) {
      var bm = new createjs.Bitmap(image)
      var position = options.position
      var offset = options.offset

      var positions = getPositions($container, position)
      var imageOffset = getDefaultOffsets(bm.image, position)
      var scale = getScale($container, bm.image, options.scale)

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
      bm.scaleX = scale.scaleX
      bm.scaleY = scale.scaleY

      if (options.mask) {
        var containerMask = new createjs.Shape()
        containerMask.width = bm.image.width * scale.scaleX
        containerMask.height = bm.image.height * scale.scaleY
        containerMask
          .graphics
          .beginFill('#ffffff')
          .drawRect(bm.x - bm.regX * scale.scaleX, bm.y - bm.regY * scale.scaleY,
            bm.image.width * scale.scaleX, bm.image.height * scale.scaleY)
        bm.mask = containerMask
      }
      // 假定， 所有container中的image都有相同的z-index
      bm.zIndex = 1
      return bm
    }
  }

  // 插入canvas, 并初始化stage
  function insertCanvas($container) {
    var canvas = $('<canvas id="canvas" width="' + $container.width() * 2 + '" height="' + $container.height() * 2 + '">').get(0)
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
   * @param options 图片的配置选项
   */
  function addEvents($container, image, options) {
    var stage = $container.stage
    var touchpoints
    var newTouchpoints
    var touchResult
    var initDis
    var initrotation
    image.on('mousedown', function (e) {
      console.log(options)
      if (e.primary && image) {
        image.offset = {
          x: image.x - e.stageX,
          y: image.y - e.stageY
        }
        image.zIndex = 99
      }

      if(options.enabledMultiTouches) {
        var ne = e.nativeEvent
        var targetTouches = ne.targetTouches

        if (targetTouches) {
          var touchnum = targetTouches.length;

          switch (touchnum) {
            case 1:
              touchpoints = [{
                'x': targetTouches[0].pageX,
                'y': targetTouches[0].pageY
              }];
              break;
            case 2:
              touchpoints = [{
                'x': targetTouches[0].pageX,
                'y': targetTouches[0].pageY
              },
                {
                  'x': targetTouches[1].pageX,
                  'y': targetTouches[1].pageY
                }];
              initDis = caculatepointsDistance(touchpoints[0], touchpoints[1]).offsetdistance;
              initrotation = caculatepointsDistance(touchpoints[0], touchpoints[1]).angle / Math.PI * 180;
          }
        }
        else {
          touchpoints = [{
            'x': ne.pageX,
            'y': ne.pageY
          }];
        }
      }
    })

    image.on('pressmove', function (e) {
      var currentTarget = e.currentTarget

      if (e.primary && image && image.offset) {
        image.x = e.stageX + image.offset.x
        image.y = e.stageY + image.offset.y
      }

      // 开启多指操作，才允许缩放和旋转
      if(options && options.enabledMultiTouches) {
        var ne = e.nativeEvent
        var targetTouches = ne.targetTouches

        if (targetTouches) {
          var touchnum = targetTouches.length;

          switch (touchnum) {
            case 1:
              newTouchpoints = [{
                'x': targetTouches[0].pageX,
                'y': targetTouches[0].pageY
              }]
              break
            case 2:
              newTouchpoints = [
                {
                  'x': targetTouches[0].pageX,
                  'y': targetTouches[0].pageY
                },
                {
                  'x': targetTouches[1].pageX,
                  'y': targetTouches[1].pageY
                }]

              touchResult = handleTouchsByMultiPoints(newTouchpoints, touchpoints, initDis)
              break
          }
        }

        touchpoints = newTouchpoints;

        if (newTouchpoints && newTouchpoints.length > 1) {
          var centerPoint = {
            x: (newTouchpoints[0].x + newTouchpoints[1].x) / 2 * 2,  // * 2的原因依旧是因为canvas的画布尺寸是元素尺寸的2倍
            y: (newTouchpoints[0].y + newTouchpoints[1].y) / 2 * 2
          }

          var sc = 0
          if (image.scaleX < 0) {
            sc = image.scaleX * -1 + touchResult.scale
            sc = Math.max(sc, 0.1)
            sc *= -1
          } else {
            sc = image.scaleX + touchResult.scale
            sc = Math.max(sc, 0.1)
          }
          var newPos = zoom(centerPoint.x, centerPoint.y, image)

          image.x = newPos.x
          image.y = newPos.y

          image.scaleX = sc
          image.scaleY = Math.abs(sc)
          image.rotation += touchResult.angle
        }
      }

      drawContainerImage($container, $container.images)
      drawForegroundImages($container, $container.foregrounds)
    })

    image.on('pressup', function (e) {
      if (e.primary && image) {
        image.offset = null
        image.zIndex = 1
      }

      // stage.update()
      drawContainerImage($container, $container.images)
      drawForegroundImages($container, $container.foregrounds)
    })

    return {
      stage: stage,
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

  /**
   * 根据配置项scale，获取相应的scale值
   * @param $container
   * @param image
   * @param scale
   * @returns {{scaleX: number, scaleY: number}}
   */
  function getScale($container, image, scale) {
    var scaleX = 1
    var scaleY = 1
    // 直接使用指定的缩放比例，等比缩放
    if (scale && typeof scale === 'number') {
      scaleX = scale
      scaleY = scale

    } else if (scale && typeof scale === 'string') {
      // 'contain'--表示将图像等比缩放到宽度或高度与容器的宽度或高度相等，图像始终被包含在容器内。
      if (scale === 'contain') {
        // 'contain'按较长边等比缩放
        if (image.width >= image.height) {
          scaleX = $container.stage.canvas.width / image.width
          scaleY = $container.stage.canvas.width / image.width
        } else {
          scaleX = $container.stage.canvas.height / image.height
          scaleY = $container.stage.canvas.height / image.height
        }

        // 'cover'--表示将背景图像等比缩放到完全覆盖容器，图像有可能超出容器。
      } else if (scale === 'cover') {
        // 'cover'按较短边缩放
        if (image.width >= image.height) {
          scaleX = $container.stage.canvas.height / image.height
          scaleY = $container.stage.canvas.height / image.height
        } else {
          scaleX = $container.stage.canvas.width / image.width
          scaleY = $container.stage.canvas.width / image.width
        }
      }
    }

    return {
      scaleX: scaleX,
      scaleY: scaleY
    }
  }

  /**
   * 把所有stage.container里的BitMap添加到stage上
   * @param $container
   * @param images
   */
  function drawContainerImage($container, images) {
    var stage = $container.stage
    var container = $container.container
    images = images.sort(function (x, y) {
      return x.zIndex - y.zIndex
    })
    images.forEach(function (bm, i) {
      container.addChild(bm)
    })
    stage.addChild(container)
    stage.update()
  }

  /**
   * 把所有的前景图都画到stage上
   * @param $container
   * @param images
   */
  function drawForegroundImages($container, images) {
    var stage = $container.stage
    images.forEach(function (bm, i) {
      stage.addChild(bm)
    })
    stage.update()
  }


  function caculatepointsDistance(point1, point2) {
    var result = {}
    var movex = point2.x - point1.x
    var movey = point2.y - point1.y
    var distance = Math.sqrt(movex * movex + movey * movey)
    var angle1,
      angle2,
      anglebe
    angle1 = Math.atan2(movey, movex)
    result.offsetx = movex
    result.offsety = movey
    result.offsetdistance = distance
    result.angle = angle1
    return result
  }

  function handleTouchsByMultiPoints(points1, points2, initDis) {
    var result1 = caculatepointsDistance(points1[0], points1[1])
    var result2 = caculatepointsDistance(points2[0], points2[1])
    var dis = result2.offsetdistance - result1.offsetdistance
    var ang = result2.angle - result1.angle
    var sc = -dis / initDis / 2
    var mainresult = {}
    mainresult.angle = -ang / Math.PI * 180
    mainresult.scale = sc
    mainresult.points = points1
    return mainresult
  }

  $.fn.extend({
    Scale: Scale
  })
})(jQuery)
