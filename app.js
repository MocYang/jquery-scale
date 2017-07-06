
var canvas = $('#stage').Scale({
  images: [
    {
      url: './22.png  ',
      position: 'center top',
      offset: {
        x: 0,
        y: 0
      },
      mask: false,
      scale: 1,
      enabledMultiTouches: false
    },
    {
      url: './timg.jpg',
      position: 'center',
      offset: {
        x: 0,
        y: 0
      },
      mask: false,
      scale: 1,
      enabledMultiTouches: false
    },
    {
      url: './img6.jpg',
      position: 'left center',
      offset: {
        x: 0,
        y: 0
      },
      mask: false,
      scale: 1,
      enabledMultiTouches: true
    }
  ],
  foregrounds: [
    // {
    //   url: './img6.jpg',
    //   position: 'center',
    //   offset: {
    //     x: 0,
    //     y: 100
    //   },
    //   scale: 2
    // },
    // {
    //   url: './timg.jpg',
    //   position: 'top right',
    //   offset: {
    //     x: 0,
    //     y: 0
    //   },
    //   mask: true,
    //   scale: 1
    // }
  ]
})

var $imgLists = $('.img')
$imgLists.each(function(index, img) {
  $(img).on('click', function(e) {
    canvas.changeBackgroundImage(img)
  })
})
