$(function () {
  var canvas = $('#stage').Scale([
    {
      id: 'img1',
      url: './images/22.png  ',
      position: 'left bottom',
      offset: {
        x: 1,
        y: 1
      },
      interactive: true,
      mask: false,
      // maskShape: 'rect',
      scale: 0.5
    },
    {
      id: 'img2',
      url: './images/timg.jpg',
      position: 'left top',
      offset: {
        x: 0,
        y: 0
      },
      mask: false,
      interactive: true,
      scale: 0.5
    }
    // {
    //   id: 'img3',
    //   url: './images/img6.jpg',
    //   position: 'left center',
    //   offset: {
    //     x: 0,
    //     y: 0
    //   },
    //   mask: false,
    //   scale: 1,
    //   enabledMultiTouches: true
    // }
  ])

  // 添加一张图
  var addChild = $('.add-child')
  addChild.click(function (e) {
    // canvas.addChild('./images/img6.jpg')
    canvas.addChild({
      id: 'img6',
      url: './images/img6.jpg',
      position: 'right bottom',
      scale: 0.2,
      interactive: true
    })
  })

  // 在images数组的最前面添加一张照片
  var addChildAtBtn = $('.add-child-at')
  var index = $('.add-child-index')
  addChildAtBtn.click(function (e) {
    canvas.addChildAt({
      id: '1111111',
      url: './images/img6.jpg',
      position: 'top right',
      interactive: true,
      scale: 1
    }, Number(index.val()))
  })

  // 清空stage
  var clearBtn = $('.clear')
  clearBtn.click(function (e) {
    canvas.clear()
  })

  // 获取所有的图片
  var getAllBtn = $('.get-all')
  getAllBtn.click(function () {
    console.log(canvas.getAllImages())
  })

  // getData
  var getDataBtn = $('.get-data-btn')
  getDataBtn.click(function (e) {
    var imageSrc = canvas.toDataURL('image/jpeg', 0.5)
    var image = new Image()
    image.onload = function () {
      $('.container').empty().append(image)
    }
    image.src = imageSrc
  })

  // getOptions
  var getOptionsInput = $('.get-options')
  var getOptionsBtn = $('.get-options-btn')
  getOptionsBtn.click(function (e) {
    console.log(canvas.getOptions(getOptionsInput.val()))
  })

  // 移除一张图片
  var removeInput = $('.remove')
  var removeBtn = $('.remove-btn')
  removeBtn.click(function (e) {
    canvas.removeChild(removeInput.val().trim())
  })

  // 替换某张图
  var replaceInput = $('.replace')
  var replaceBtn = $('.replace-btn')
  replaceBtn.click(function (e) {
    // 如果传入的URL，则根据keepProperties的值决定是否保留目标图片的相应属性
    // canvas.replace(replaceInput.val().trim(), './images/img6.jpg', true)
    // 如果传入配置项，则忽视keepProperties的值，以配置项为准
    canvas.replace(replaceInput.val().trim(), {
      id: 'img6',
      url: './images/img6.jpg',
      mask: false,
      position: 'center right',
      interactive: true
    })
  })

  // setOptions
  var setOptionsBtn = $('.set-options-btn')
  setOptionsBtn.click(function (e) {
    canvas.setOption('img2', {
      id: 'img2222',
      position: 'center right',
      offset: {
        x: 11,
        y: 11
      },
      mask: false,
      interactive: true,
      scale: 0.5
    })
  })

  // setTransform
  var transformBtn = $('.set-transform-btn')
  var rotation = 5
  transformBtn.click(function (e) {
    rotation += 5
    canvas.setTransform('img6', {
      // x:  0,
      // y:  0,
      rotation: rotation
      // skewX:  0,
      // skewY:  0,
      // regX:  0,
      // regY:  0
    })
  })
})
