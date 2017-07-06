# jquery-jquery-scale.js
基于easel.js的jQuery插件，可以实现在canvas中批量操作图片。
比如：
* 批量添加背景图
* 批量添加前景图
* 鼠标拖拽图片
* 支持移动端的touch操作(缩放，旋转，移动)
* 支持方便的图片定位（left，right，top，bottom，center等）
* 支持图片mask
* 方便的canvas数据导出 （待完成）
* 简单的图片替换       （待完成） 
* ...

## 依赖
* jquery
* easel.js

## 使用示例
```html
...
<div class="wrapper" id="stage"></div>
...
...
<script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
<script src="./dist/js/easeljs.min.js"></script>
<script src="./dist/js/jquery-scale.js"></script>
<script src="./examples/app.js"></script>
...
```
```javascript
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
      scale: 1,
      enabledMultiTouches: true
    }
  ]
})
```
## options
- **images** *Array* 所有背景图片的集合。可以是所有图片的URL字符串数组，或者是一个js对象数组，每一个对象包含对图片的配置（详细配置项，见下）。
- **foregrounds** *Array* 所有前景图的集合。可以是所有图片的URL字符串数组，或者是一个js对象数组，每一个对象包含对图片的配置（详细配置项，见下）。注意：前景图默认不允许执行交互操作，如：鼠标移动，移动端的touch。

example:
```javascript
  var canvas = $('#stage').Scale({
    images: [
      {
        id: 'img1',
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
        id: 'img2',
        url: './examples/images/timg.jpg',
        position: 'center',
        offset: {
          x: 0,
          y: 0
        },
        mask: false,
        scale: 1,
        enabledMultiTouches: false
      }
    ],
    /*foregrounds: [
      {
        url: './examples/images/img6.jpg',
        position: 'center',
        offset: {
          x: 0,
          y: 100
        },
        scale: 2
      },
      {
        url: './examples/images/timg.jpg',
        position: 'top right',
        offset: {
          x: 0,
          y: 0
        },
        scale: 1
      }
    ],*/
    foregrounds: ['./examples/images/timg.jpg']
  })
```


## image-options 
每一种图片可选的options值如下：
- **id** *string* 默认：以0递增的数字值.可选的图片的ID。值为合法的标识符。可选。
- **url** *string* 指定图片的URL。必选。
- **position** *string* 默认：*'center'* 指定图片在canvas中的初始位置。可选的值为：*left*，*right*，*top*，*bottom*，*center*中任意两个关键字的组合(以空格分隔)。关键词的顺序不重要，如：*'center left'*等价于*'left center'*。*'center center'*可以简写为*'center'*
- **offset** *object* 默认： *{ x: 0, y: 0 }*。指定相对于position所在位置的偏移值。可以为负。可选。
- **mask** *boolean*。默认： *false*。指示是否给图片添加mask。(作为前景图的图片此选项无效。)。 可选。
- **scale** *number|string* 默认：1。指示图片初始缩放的倍率。低于0的值视为1。另外两个合法的字符值为：*'contain'* 和 *'cover'*。*'contain'* 表示将图像等比缩放到宽度或高度与容器的宽度或高度相等，图像始终被包含在容器内。*'cover'* 表示将背景图像等比缩放到完全覆盖容器，图像有可能超出容器。可选。
- **enabledMultiTouches** *boolean* 默认：true。指示是否允许多指操作。如：双指的缩放和旋转。(作为前景图的图片此选项无效。)。 可选。

## methods
### addBackgroundImage(*options*)
添加一张背景图。默认显示在所有背景图之上，如果存在重叠。
- param *options* {*string*|*object*} options可以是图片*URL*，如： *'./examples/images/img6.jpg'*，也可以是image-options对象。必选。

example:
```javascript
    var addBackgroundBtn = $('.add-back')
    addBackgroundBtn.click(function(e) {
        canvas.addBackgroundImage({
          id: '1111111',
          url: './examples/images/img6.jpg',
          position: 'top right',
          mask: true
        })
    })
```
或者：
```javascript
    var addBackgroundBtn = $('.add-back')
    addBackgroundBtn.click(function(e) {
        canvas.addBackgroundImage('./examples/images/img6.jpg')
    })
```

### addForegroundImage(*options*)
添加一张前景图。默认显示在所有图片之上，如果存在重叠。
- param *options* {*string*|*object*} options可以是图片*URL*，如： *'./examples/images/img6.jpg'*，也可以是image-options对象。必选。

example:
```javascript
    var addForegroundImageBtn = $('.add-back')
    addForegroundImageBtn.click(function(e) {
        canvas.addForegroundImage({
          id: '1111111',
          url: './examples/images/img6.jpg',
          position: 'top right',
          scale: 'contain'
        })
    })
```
或者：
```javascript
    var addForegroundImageBtn = $('.add-back')
    addForegroundImageBtn.click(function(e) {
        canvas.addForegroundImage('./examples/images/img6.jpg')
    })
```

### removeImage(id [, context])
在stage上移除给定ID的图片。如果前景和背景有多张图有相同的ID，则所有与给定ID匹配的图片都会被移除。注意：应该始终保持所有图片具有唯一的ID。

- param **id** *{string|number}* 要移除的图片的ID。必选。
- param **context** *{string}* 指定要移除的图片是前景还是背景。值为：前景*'images'*, 背景 *'foregrounds'* 。可选。 

example: 
```javascript
  var removeInput = $('.remove')
  var removeBtn = $('.remove-btn')
  removeBtn.click(function(e) {
    canvas.removeImage(removeInput.val().trim())
  })
```


### removeBackgroundImage(id)
移除指定ID的背景图。此时如果前景和背景图中具有相同ID的图片，则只移除背景图中的。

- param **id** *{string|number}* 要移除的图片的ID。必选。

example: 
```javascript
  var removeBackInput = $('.remove-back')
  var removeBackBtn = $('.remove-back-btn')
  removeBackBtn.click(function(e) {
    canvas.removeBackgroundImage(removeBackInput.val().trim())
  })
```


### removeForegroundImage(id)
移除指定ID的前景图。此时如果前景和背景图中具有相同ID的图片，则只移除前景图中的。

- param **id** *{string|number}* 要移除的图片的ID。必选。

example: 
```javascript
  var removeForeInput = $('.remove-fore')
  var removeForeBtn = $('.remove-fore-btn')
  removeForeBtn.click(function(e) {
    console.log(removeForeInput.val().trim())
    canvas.removeForegroundImage(removeForeInput.val().trim())
  })
```
