
var canvas = $('#stage').Scale({
  images: [
    {
      url: './timg.jpg',
      position: 'center',
      offset: {
        x: 0,
        y: 0
      },
      mask: true,
    },
    {
      url: './img3.png',
      position: 'bottom center',
      offset: {
        x: 0,
        y: 0
      },
      mask: false,
    }
  ],
  foregrounds: {

  }
})

var $imgLists = $('.img')
$imgLists.each(function(index, img) {
  $(img).on('click', function(e) {
    canvas.changeBackgroundImage(img)
  })
})
