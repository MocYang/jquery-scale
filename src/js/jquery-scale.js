/**
 * Created by admin on 2017/6/9.
 */

(function ($) {
  // Array.isArray() 的polyfill
  if (!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]'
    }
  }

  // 可选的options的取值
  var option = {
    _id: 0,
    id: 0,
    url: '',     // 默认作为背景图

    // 默认的注册点
    position: 'center center',

    // 相对注册点的偏移量
    offset: {
      x: 0,
      y: 0
    },

    // 是否允许交互操作
    interactive: false,

    // 是否添加mask
    mask: false,

    // mask的形状，只支持矩形'rect',圆形'circle'
    maskShape: 'rect',

    // maskSize
    /*
     maskShape为'circle'时，maskSize: { x: 0, y: 0, radius: 100 }
     */
    maskSize: {
      w: 200,
      h: 200
    },
    // 图片缩放的比例， 可以是number|'cover'|'contain'
    scale: 1,

    // 是否允许多指操作，如双指的缩放、旋转
    enabledMultiTouches: true
  }
  // 维护全局的ID，保持所有图片的ID唯一
  var id = 1

  function Scale (images) {
    var self = this
    // 辅助函数
    /**
     * 根据给定的图片options和bm，生成scale的专用对象
     * @param options image的配置项集合
     * @param bm      image对应的BigMap实例
     * @return {object}        返回一个scale专用的对象
     */
    function createScaleObj (options, bm) {
      return $.extend({}, options, {
        bm: bm
      })
    }

    /**
     * 使用已有的scale对象和新的配置对象，组合得到新的scale对象
     * @param imageOptions 图片的scale对象
     * @param exitOptions  目标图片的scale对象
     * @param bm           使用新图片的URL生成的BitMap实例
     * @return {*}
     */
    function combineScaleObjectWidthOld (imageOptions, exitOptions, bm) {
      var newScaleObj = null
      if (exitOptions) {
        var exitBmCopy = exitOptions.bm
        delete exitBmCopy.image

        bm = $.extend(true, {}, exitBmCopy, bm)
        newScaleObj = createScaleObj(imageOptions, bm)
      } else {
        newScaleObj = createScaleObj(imageOptions, bm)
      }

      return newScaleObj
    }

    /**
     * 生成图片的配置对象
     * @param options {string|object}
     * @param exitOptions {object} 执行替换时，目标图片的配置对象
     * @return {*}
     */
    function generateOptions (options, exitOptions) {
      var index = id++
      var imageOptions = null
      if (typeof options === 'string') {
        imageOptions = $.extend({}, option, {
          _id: exitOptions ? exitOptions._id : index,
          id: index
        }, {
          url: options
        })

        // 替换图片时，如果只传入图片URL则使用目标图片的配置项来拓展新的配置项
        if (exitOptions) {
          delete exitOptions.url
          imageOptions = extendExitOptions(imageOptions, exitOptions)
        }
      } else if (typeof options === 'object') {
        imageOptions = $.extend(true, {}, option, {
          _id: exitOptions ? exitOptions._id : index,
          id: index
        }, options)

        // 替换图片时，如果只传入图片URL则使用目标图片的配置项来拓展新的配置项
        if (exitOptions) {
          imageOptions = extendExitOptions(exitOptions, imageOptions)
        }
      }

      if (imageOptions.mask) {
        if (imageOptions.maskShape === 'rect') {
          imageOptions.maskSize = options.maskSize || {
              w: 200,
              h: 200
            }
        } else if (imageOptions.maskShape === 'circle') {
          imageOptions.maskSize = options.maskSize || {
              x: 0,
              y: 0,
              radius: 100
            }
        }
      } else {
        if (exitOptions) {
          exitOptions.bm.mask = null
        }
        delete imageOptions.maskSize
        delete imageOptions.maskShape
      }

      return imageOptions
    }

    /**
     *
     * @param imageOptions
     * @param exitOptions
     * @return {void|*}
     */
    function extendExitOptions (exitOptions, imageOptions) {
      var newOptions
      var oldOptionsCopy = $.extend(true, {}, exitOptions)
      if (imageOptions.url) {
        delete oldOptionsCopy.url
        delete oldOptionsCopy.id
        delete oldOptionsCopy.bm
      }
      newOptions = $.extend(true, {}, oldOptionsCopy, imageOptions)
      return newOptions
    }

    /**
     * 在给定位置添加一张片图，没有指定position时，默认添加到数组末尾
     * @param options 一张图片的URL，或image-options对象
     * @param position 指定图片应该在images数组中的那个位置添加
     * @param exitOptions
     */
    function addChild (options, position, exitOptions) {
      var imageOptions = generateOptions(options, exitOptions)
      var images = self.images
      position = position && Number(position)
      if (position >= images.length) {
        position = images.length
      }
      if (imageOptions) {
        addImage(self, imageOptions, function (bm) {
          var newScaleObj = combineScaleObjectWidthOld(imageOptions, exitOptions, bm)
          if (typeof position === 'number') {
            self.images = images.slice(0, position).concat(newScaleObj).concat(images.slice(position))
          } else {
            self.images.push(newScaleObj)
          }
          self.images = self.images.sort(function (a, b) {return a._id - b._id})
          draw(self, self.images)
          if (typeof imageOptions.interactive === 'boolean' && imageOptions.interactive) {
            addEvents(self, newScaleObj.bm, newScaleObj)
          }
        })
      }
    }

    /**
     * 在给定位置添加一张片图，没有指定position时，默认添加到数组末尾
     * @param options 一张图片的URL，或image-options对象
     * @param position 指定图片应该在images数组中的那个位置添加
     * @param exitOptions
     */
    function replaceChild (options, position, exitOptions, cb) {
      var imageOptions = generateOptions(options, exitOptions)
      var images = self.images
      position = position && Number(position)
      if (position >= images.length) {
        position = images.length
      }
      if (imageOptions) {
        addImage(self, imageOptions, function (bm) {
          var newScaleObj = combineScaleObjectWidthOld(imageOptions, exitOptions, bm)
          if (typeof position === 'number') {
            self.images.splice(position, 1, newScaleObj)
          }
          draw(self, self.images)
          if (typeof imageOptions.interactive === 'boolean' && imageOptions.interactive) {
            addEvents(self, newScaleObj.bm, newScaleObj)
          }
          cb && cb(newScaleObj)
        })
      }
    }

    /**
     * 移除数组中的一个item，并返回
     * @param array
     * @param key
     * @param value
     * @return {*}
     */
    function removeItemInArray (array, key, value) {
      for (var i = 0; i < array.length; i++) {
        if (value === array[i][key]) {
          if (array[i].bm) {
            array[i].bm.removeAllEventListeners()
          }
          array = array.slice(0, i).concat(array.slice(i + 1))
          i--
        }
      }

      return array
    }

    /* 实例方法 */
    // 添加一张图片，默认添加到stage的最上层
    this.addChild = function (options) {
      addChild(options)
    }

    /**
     * 在位置positions处添加一张图片
     * @param options
     * @param index
     */
    this.addChildAt = function (options, index) {
      addChild(options, index)
    }

    // 清空stage
    this.clear = function () {
      self.images.length = 0
      draw(self, self.images)
    }

    /**
     * 返回当前所有的images的数组副本
     * @return {Array.<T>|*|Array}
     */
    this.getAllImages = function () {
      return self.images.slice()
    }

    /**
     * 返回指定ID的图片的scale配置项,如果只有一个匹配，则返回该对象，如果有多个匹配则返回一个数组，包含所有匹配项
     * @param id
     * @return {*}
     */
    this.getOptions = function (id, cb) {
      var resultImage = []
      var images = self.images
      images.forEach(function (image, index) {
        if (image.id === id) {
          resultImage.push(image)
        }
      })

      cb(resultImage.length === 1 ? resultImage[0] : resultImage)
    }

    // 移除stage上的一张给定的图片
    this.removeChild = function (id) {
      var images = self.images.slice()
      images = removeItemInArray(images, 'id', id)

      self.clear()

      self.images = images.slice()

      draw(self, self.images)

      return this
    }

    /**
     * 替换一张图片
     * @param id
     * @param img
     * @param keepProperties 是否保留目标元素的属性，默认保留原属性
     * @return {object}
     */
    this.replace = function (id, img, keepProperties, cb) {
      var options = null
      keepProperties = keepProperties || true
      var images = self.images
      for (var i = 0; i < images.length; i++) {
        if (images[i].id === id) {
          if (keepProperties) {
            options = images[i]
          }
          replaceChild(img, i, options, cb)
        }
      }
      return this
    }

    /**
     * 设置图片的位置偏移等属性 [x=0]  [y=0]  [scaleX=1]  [scaleY=1]  [rotation=0]  [skewX=0]  [skewY=0]  [regX=0]  [regY=0]
     * @param id
     * @param options
     */
    this.setTransform = function (id, options) {
      var images = self.images.slice()
      var newImages = []
      images.forEach(function (image, i) {
        if (image.id === id) {
          var bm = image.bm
          var transform = {
            x: options.x || bm.x,
            y: options.y || bm.y,
            scaleX: options.scaleX || bm.scaleX,
            scaleY: options.scaleY || bm.scaleY,
            rotation: options.rotation || bm.rotation,
            skewX: options.skewX || bm.skewX,
            skewY: options.skewY || bm.skewY,
            regX: options.regX || bm.regX,
            regY: options.regY || bm.regY
          }
          bm.setTransform(
            transform.x,
            transform.y,
            transform.scaleX,
            transform.scaleY,
            transform.rotation,
            transform.skewX,
            transform.skewY,
            transform.regX,
            transform.regY)
        }
        newImages.push(image)
      })
      self.images = newImages
      draw(self, self.images)
      return this
    }

    /**
     *
     * @param id
     * @param cb
     */
    this.getTransform = function (id, cb) {
      var images = self.images
      var resultArr = []
      var transform = null
      for (var i = 0; i < images.length; i++) {
        if (images[i].id === id) {
          var bm = images[i].bm
          transform = {
            x: bm.x,
            y: bm.y,
            scaleX: bm.scaleX,
            scaleY: bm.scaleY,
            rotation: bm.rotation,
            skewX: bm.skewX,
            skewY: bm.skewY,
            regX: bm.regX,
            regY: bm.regY
          }
          resultArr.push(transform)
        }
      }
      cb(resultArr.length > 1 ? resultArr : transform)
    }

    /**
     * 设置指定ID的图片options
     * @param id
     * @param options
     */
    this.setOption = function (id, options) {
      var images = self.images.slice()
      var selectedId = id
      images.forEach(function (image, i) {
        if (image.id === selectedId) {
          options = $.extend(true, {}, options, {
            url: options.url || image.url
          })
          self.replace(selectedId, options, true)
        }
      })

      return this
    }

    /**
     * 返回stage的图片数据，以base64的格式
     * @param mime 图片的格式，支持的格式为：image/png(默认)，image/jpeg, image/webp(chrome支持)
     * @param quality 在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。
     *                如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略
     * @return {string} base64 url
     */
    this.toDataURL = function (mime, quality) {
      var stage = self.stage
      var canvas = stage.canvas
      mime = mime || 'image/png'
      quality = quality || 0.92
      return canvas.toDataURL(mime, quality)
    }

    var $canvas = insertCanvas(self)
    this.stage = new createjs.Stage($canvas)
    this.container = new createjs.Container()
    this.container.width = this.stage.canvas.width
    this.container.height = this.stage.canvas.height
    this.stage.enableMouseOver(20)
    createjs.Touch.enable(this.stage)
    createjs.Ticker.addEventListener('tick', function () {
      self.stage.update()
    })

    this.images = []         // 所有的scale图片集合

    // 添加图片
    if (images && Array.isArray(images) && images.length >= 1) {
      images.forEach(function (image) {
        (function (img) {
          addChild(img)
        })(image)
      })
    }

    return this
  }

  function zoom (x1, y1, image) {
    if (image.scaledSize === undefined) {
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
  function addImage ($container, image, cb) {
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
    function createBitMap ($container, image, options) {
      var bm = new createjs.Bitmap(image)
      var position = options.position
      var offset = options.offset

      var scale = getScale($container, bm.image, options.scale)
      var positions = getPositions($container, position, bm, scale)
      var imageOffset = getDefaultOffsets(bm.image, position, bm, scale)

      // 默认图片的注册点是canvas的中心点
      var x = $container.width() / 2
      var y = $container.height() / 2
      var regX = imageOffset.x
      var regY = imageOffset.y
      // 如果传入了自定义的position
      if (positions) {
        x = positions.x
        y = positions.y

        // TODO: 替换图片时使用上一张图片的偏移值
      }
      /*else if ($container.image != null) {
        var images = $container.images
        x = $container.image.x
        y = $container.image.y
      }*/

      bm.regX = offset ? offset.x + regX : regX
      bm.regY = offset ? offset.y + regY : regY
      bm.x = x
      bm.y = y
      bm.scaleX = scale.scaleX
      bm.scaleY = scale.scaleY

      if (options.mask) {
        bm.mask = createMask(options.maskShape, options.maskSize, bm, scale, options)
      }

      return bm
    }
  }

  // 插入canvas, 并初始化stage
  function insertCanvas ($container) {
    var canvas = $('<canvas id="canvas" width="' +
      $container.width() * 2 + '" height="' + $container.height() * 2 + '">').get(0)
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
  function addEvents ($container, image, options) {
    var stage = $container.stage
    var touchpoints
    var newTouchpoints
    var touchResult
    var initDis
    var isMultiTouch = false

    image.on('mousedown', function (e) {
      if (e.primary && image) {
        image.offset = {
          x: image.x - e.stageX,
          y: image.y - e.stageY
        }
      }

      if (options.enabledMultiTouches) {
        var ne = e.nativeEvent
        var targetTouches = ne.targetTouches

        if (targetTouches) {
          var touchnum = targetTouches.length

          switch (touchnum) {
            case 1:
              touchpoints = [{
                'x': targetTouches[0].pageX,
                'y': targetTouches[0].pageY
              }]
              break
            case 2:
              touchpoints = [
                {
                  'x': targetTouches[0].pageX,
                  'y': targetTouches[0].pageY
                },
                {
                  'x': targetTouches[1].pageX,
                  'y': targetTouches[1].pageY
                }]
              initDis = caculatepointsDistance(touchpoints[0], touchpoints[1]).offsetdistance
              isMultiTouch = true
          }
        } else {
          touchpoints = [{
            'x': ne.pageX,
            'y': ne.pageY
          }]
        }
      }
    })

    image.on('pressmove', function (e) {
      if (!isMultiTouch) {
        if (e.primary && image && image.offset) {
          image.x = e.stageX + image.offset.x
          image.y = e.stageY + image.offset.y
        }
      } else {
        // 开启多指操作，才允许缩放和旋转
        if (options && options.enabledMultiTouches) {
          var ne = e.nativeEvent
          var targetTouches = ne.targetTouches
          if (targetTouches) {
            var touchnum = targetTouches.length

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

          touchpoints = newTouchpoints

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
      }

      draw($container, $container.images)
    })

    image.on('pressup', function (e) {
      if (e.primary && image) {
        image.offset = null
      }

      var targetTouches = e.nativeEvent.targetTouches
      isMultiTouch = targetTouches && targetTouches.length === 1

      draw($container, $container.images)
    })

    return {
      stage: stage
    }
  }

  /**
   * 根据传入的position字符串值，生成相应的x,y定位值
   * @param $container stage容器
   * @param position   配置中的position值
   * @param bm      BitMap实例
   * @returns {{x: number, y: number}}
   */
  function getPositions ($container, position, bm, scale) {
    // 这里都放大1倍的原因是因为， 生成canvas时， 指定的width为设置其css的width的2倍
    var stageWidth = $container.width() * 2
    var stageHeight = $container.height() * 2
    var container = {
      width: stageWidth,
      height: stageHeight
    }
    position = position.toLowerCase()
    var reg = matchPosition(container, position, bm, scale)
    return {
      x: reg.x,
      y: reg.y
    }
  }

  /**
   * 根据不同的position， 获取图片不同的偏移量
   * @param image
   * @param position
   * @returns {{x: number, y: number}}
   */
  function getDefaultOffsets (image, position, bm, scale) {
    var container = {
      width: image.width,
      height: image.height
    }
    position = position.toLowerCase()
    var reg = matchPosition(container, position, bm, scale)
    return {
      x: reg.regX,
      y: reg.regY
    }
  }

  /**
   * 根据9个不同的位置，生成不同的x, y值
   * @param container 偏移值的参考元素， 可以是stage，或一张片
   * @param position
   * @param bm
   * @returns {{x: number, y: number}}
   */
  function matchPosition (container, position, bm, scale) {
    var width = container.width
    var height = container.height
    var image = bm && bm.image
    var imageWidth = (image && image.width * scale.scaleX) || 0
    var imageHeight = (image && image.height * scale.scaleY) || 0
    var positionNum = 5
    switch (position) {
      case 'top left':
      case 'left top':
        positionNum = 1
        break
      case 'top center':
      case 'center top':
        positionNum = 2
        break
      case 'top right':
      case 'right top':
        positionNum = 3
        break
      case 'center left':
      case 'left center':
        positionNum = 4
        break
      case 'center center':
      case 'center':
        positionNum = 5
        break
      case 'center right':
      case 'right center':
        positionNum = 6
        break
      case 'bottom left':
      case 'left bottom':
        positionNum = 7
        break
      case 'bottom center':
      case 'center bottom':
        positionNum = 8
        break
      case 'bottom right':
      case 'right bottom':
        positionNum = 9
        break
      default:
        positionNum = 5
    }
    var positions = {
      // left top | top left
      1: {
        x: imageWidth / 2,
        y: imageHeight / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleY
      },
      // left center | center left
      2: {
        x: width / 2,
        y: imageHeight / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleX
      },
      // top right | right top
      3: {
        x: width - imageWidth / 2,
        y: imageHeight / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleY
      },
      // left center | center left
      4: {
        x: imageWidth / 2,
        y: height / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleY
      },
      // center center | center
      5: {
        x: width / 2,
        y: height / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleX
      },
      // right center | center right
      6: {
        x: width - imageWidth / 2,
        y: height / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleY
      },
      // bottom left | left bottom
      7: {
        x: imageWidth / 2,
        y: height - imageHeight / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleY
      },
      // bottom center | center bottom
      8: {
        x: width / 2,
        y: height - imageHeight / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleY
      },
      // bottom right | right bottom
      9: {
        x: width - imageWidth / 2,
        y: height - imageHeight / 2,
        regX: imageWidth / 2 / scale.scaleX,
        regY: imageHeight / 2 / scale.scaleX
      }
    }

    return positions[positionNum]
  }

  /**
   * 根据配置项scale，获取相应的scale值
   * @param $container
   * @param image
   * @param scale
   * @returns {{scaleX: number, scaleY: number}}
   */
  function getScale ($container, image, scale) {
    var scaleX = 1
    var scaleY = 1
    var containerWidth = $container.stage.canvas.width
    var containerHeight = $container.stage.canvas.height

    // 直接使用指定的缩放比例，等比缩放
    if (scale && typeof scale === 'number') {
      scaleX = scale
      scaleY = scale
    } else if (scale && typeof scale === 'string') {
      // 'contain'--表示将图像等比缩放到宽度或高度与容器的宽度或高度相等，图像始终被包含在容器内。
      if (scale === 'contain') {
        // 'contain'按较长边等比缩放
        if (image.width >= image.height) {
          scaleX = containerWidth / image.width
          scaleY = containerWidth / image.width
        } else {
          scaleX = containerHeight / image.height
          scaleY = containerHeight / image.height
        }

        // 'cover'--表示将背景图像等比缩放到完全覆盖容器，图像有可能超出容器。
      } else if (scale === 'cover') {
        // 'cover'按较短边缩放
        if (image.width >= image.height) {
          scaleX = containerHeight / image.height
          scaleY = containerHeight / image.height
        } else {
          scaleX = containerWidth / image.width
          scaleY = containerWidth / image.width
        }
      }
    } else if (Object.prototype.toString.call(scale) === '[object Array]') {
      scaleX = scale[0]
      scaleY = scale[1]
    }

    return {
      scaleX: scaleX,
      scaleY: scaleY
    }
  }

  /**
   * 生成图片mask
   * @param shape mask的shape 'rect'或者'circle'
   * @param size  mask的大小 {w: 100, h: 100}或者 {x: 0, y: 0, radius: 50}
   * @param bm 图片 BitMap实例
   * @param scale 图片缩放的比例
   */
  function createMask (shape, size, bm, scale) {
    var containerMask = new createjs.Shape()
    containerMask.width = bm.image.width * scale.scaleX
    containerMask.height = bm.image.height * scale.scaleY
    if (shape === 'rect') {
      containerMask
        .graphics
        .beginFill('#ffffff')
        .drawRect(bm.x - size.w / 2, bm.y - size.h / 2, size.w, size.h)
    } else if (shape === 'circle') {
      size = {
        x: bm.x + size.x,
        y: bm.y + size.y,
        radius: size.radius
      }

      containerMask
        .graphics
        .beginFill('#ffffff')
        .drawCircle(size.x, size.y, size.radius)
    }
    return containerMask
  }

  /**
   * 把所有stage.container里的BitMap添加到stage上
   * @param $container
   * @param images
   */
  function draw ($container, images) {
    var stage = $container.stage
    var container = $container.container
    stage.removeAllChildren()
    container.removeAllChildren()
    images.forEach(function (img, i) {
      container.addChild(img.bm)
    })
    stage.addChild(container)
    stage.update()
  }

  function caculatepointsDistance (point1, point2) {
    var result = {}
    var movex = point2.x - point1.x
    var movey = point2.y - point1.y
    var distance = Math.sqrt(movex * movex + movey * movey)
    var angle1,
      angle1 = Math.atan2(movey, movex)
    result.offsetx = movex
    result.offsety = movey
    result.offsetdistance = distance
    result.angle = angle1
    return result
  }

  function handleTouchsByMultiPoints (points1, points2, initDis) {
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
