$(function () {
  var canvas = $('#stage').Scale([
    {
      id: 'img1',
      url: './images/22.png  ',
      position: 'center top',
      offset: {
        x: 1,
        y: 1
      },
      interactive: true,
      mask: true,
      maskShape: 'rect',
      scale: 1
    },
    {
      id: 'img2',
      url: './images/timg.jpg',
      position: 'center',
      offset: {
        x: 2,
        y: 2
      },
      mask: false,
      interactive: false,
      scale: 1.1
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

  // 添加背景
  var addBackgroundBtn = $('.add-child')
  addBackgroundBtn.click(function (e) {
    canvas.addChild({
      id: 'img6',
      url: './images/img6.jpg',
      position: 'top right',
      scale: 1
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


  // 获取所有的图片
  var getAllBtn = $('.get-all')
  getAllBtn.click(function () {
    console.log(canvas.getAllImages())
  })

  // 移除一张图片
  var removeInput = $('.remove')
  var removeBtn = $('.remove-btn')
  removeBtn.click(function (e) {
    canvas.removeImage(removeInput.val().trim())
  })

  // 清空stage
  var clearBtn = $('.clear')
  clearBtn.click(function (e) {
    canvas.clear()
  })

  // getData
  var getDataBtn = $('.get-data-btn')
  getDataBtn.click(function (e) {
    var imageSrc = canvas.toDataURL('image/jpeg', 0.5)
    var image = new Image()
    image.onload = function () {
      console.dir(image)
      $('.container').empty().append(image)
    }
    image.src = imageSrc
  })


  // getOptions
  var getOptionsInput = $('.get-options')
  var getOptionsBtn = $('.get-options-btn')
  getOptionsBtn.click(function(e) {
    console.log(canvas.getOptions(getOptionsInput.val()))
  })

  // 替换某张图
  var replaceInput = $('.replace')
  var replaceBtn= $('.replace-btn')
  replaceBtn.click(function (e) {
    // 如果传入的URL，则根据keepProperties的值决定是否保留目标图片的相应属性
    // canvas.replace(replaceInput.val().trim(), './images/img6.jpg', true)
    // 如果传入配置项，则忽视keepProperties的值，以配置项为准
    canvas.replace(replaceInput.val().trim(), {
      id: 'img6',
      url: './images/img6.jpg',
      mask: false,
      position: 'center right',
      interactive: false
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

})
