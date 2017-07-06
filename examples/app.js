$(function() {

  var canvas = $('#stage').Scale({
    images: [
      {
        url: './examples/images/22.png  ',
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
        url: './examples/images/timg.jpg',
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
        url: './examples/images/img6.jpg',
        position: 'left center',
        offset: {
          x: 0,
          y: 0
        },
        mask: false,
        scale: 0,
        enabledMultiTouches: true
      }
    ],
    foregrounds: [
      // {
      //   url: './examples/images/img6.jpg',
      //   position: 'center',
      //   offset: {
      //     x: 0,
      //     y: 100
      //   },
      //   scale: 2
      // },
      // {
      //   url: './examples/images/timg.jpg',
      //   position: 'top right',
      //   offset: {
      //     x: 0,
      //     y: 0
      //   },
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

})