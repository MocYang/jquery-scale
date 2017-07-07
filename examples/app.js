$(function () {
  var canvas = $('#stage').Scale(
    /*{
    images: [
      {
        id: 'img1',
        url: './examples/images/22.png  ',
        position: 'center bottom',
        offset: {
          x: 1,
          y: 1
        },
        mask: false,
        scale: 1
      },
      {
        id: 'img2',
        url: './examples/images/timg.jpg',
        position: 'center',
        offset: {
          x: 2,
          y: 2
        },
        mask: false,
        scale: 1
      }
      /!*{
       id: 'img3',
       url: './examples/images/img6.jpg',
       position: 'left center',
       offset: {
       x: 0,
       y: 0
       },
       mask: false,
       scale: 0,
       enabledMultiTouches: true
       }*!/
    ],
    foregrounds: [
      // {
      //   id: 'img3',
      //   url: './examples/images/img6.jpg',
      //   position: 'center',
      //   offset: {
      //     x: 0,
      //     y: 100
      //   },
      //   scale: 2
      // },
      // {
      //   id: 'img2',
      //   url: './examples/images/timg.jpg',
      //   position: 'top right',
      //   offset: {
      //     x: 0,
      //     y: 0
      //   },
      //   scale: 1
      // }
    ]
    // foregrounds: ['./examples/images/img6.jpg']
  }*/
  )

  // 添加背景
  var addBackgroundBtn = $('.add-back')
  addBackgroundBtn.click(function (e) {
    canvas.addBackgroundImage({
      id: 'img6',
      url: './examples/images/img6.jpg',
      position: 'top right',
      scale: 1
    })
  })

  // 添加前景
  var addForegroundBtn = $('.add-fore')
  addForegroundBtn.click(function (e) {
    canvas.addForegroundImage({
      id: '1111111',
      url: './examples/images/img6.jpg',
      position: 'top right',
      scale: 1
    })
  })


  // 移除一张背景
  var removeBackInput = $('.remove-back')
  var removeBackBtn = $('.remove-back-btn')
  removeBackBtn.click(function (e) {
    canvas.removeBackgroundImage(removeBackInput.val().trim())
  })

  // 移除一张前景景
  var removeForeInput = $('.remove-fore')
  var removeForeBtn = $('.remove-fore-btn')
  removeForeBtn.click(function (e) {
    canvas.removeForegroundImage(removeForeInput.val().trim())
  })

  // 移除一张图片
  var removeInput = $('.remove')
  var removeBtn = $('.remove-btn')
  removeBtn.click(function (e) {
    canvas.removeImage(removeInput.val().trim())
  })

  // 替换某张背景图
  var exchangeBackInput = $('.exchange-back')
  var exchangeBackBtn = $('.exchange-back-btn')
  exchangeBackBtn.click(function (e) {
    canvas.exchangeBackgroundImage(exchangeBackInput.val().trim(), './examples/images/img6.jpg')
    // canvas.exchangeBackgroundImage(exchangeBackInput.val().trim(), {
    //   id: 'img6',
    //   url: './examples/images/img6.jpg',
    //   position: 'top center',
    //   scale: 'contain',
    //   mask: true
    // })
  })

  // 替换某张前景图景图
  var exchangeForeInput = $('.exchange-fore')
  var exchangeForeBtn = $('.exchange-fore-btn')
  exchangeForeBtn.click(function (e) {
    canvas.exchangeForegroundImage(exchangeForeInput.val().trim(), './examples/images/img6.jpg')
  })

  // 清空stage
  var clearBtn = $('.clear')
  clearBtn.click(function(e) {
    canvas.clearStage()
  })

  // getData
  var getDataBtn = $('.get-data-btn')
  getDataBtn.click(function(e) {
   var imageSrc =  canvas.toDataURL('#cc0090', 'image/jpg')
    var image = new Image()
    image.onload = function () {
      $('.container').empty().append(image)
    }
    image.src = imageSrc
  })

})
