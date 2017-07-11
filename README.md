# jquery-scale.js
基于easel.js的jQuery插件，可以实现在canvas中批量操作图片。
比如：
* 批量添加背景图
* 批量添加前景图
* 鼠标拖拽图片
* 支持移动端的touch操作(缩放，旋转，移动)
* 支持方便的图片定位（left，right，top，bottom，center等）
* 支持图片mask
* 方便的canvas数据导出
* 简单的图片替换
* 处理了canvas中图片会模糊的问题 
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
<script src="./src/js/easeljs.min.js"></script>
<script src="./src/js/jquery-scale.js"></script>
<script src="./app.js"></script>
...
```
```javascript
var canvas = $('#stage').Scale([
    {
      url: './images/22.png  ',
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
      url: './images/timg.jpg',
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
      url: './images/img6.jpg',
      position: 'left center',
      offset: {
        x: 0,
        y: 0
      },
      mask: false,
      scale: 1,
      enabledMultiTouches: true
    }
  ])
```
## params
- **images** {*Array*} 所有图片的集合。可以是所有图片的URL字符串数组，或者是一个js对象数组，每一个对象包含对图片的配置（详细配置项，见下）。

## image-options 
每一种图片可选的options值如下：
- **id** {*string*|*object*} 默认：以0递增的数字值.可选的图片的ID。值为合法的标识符。可选。
- **url** {*string*} 指定图片的URL。必选。
- **position** {*string*} 默认：*'center'*。 指定图片在canvas中的初始位置。可选的值为：*left*，*right*，*top*，*bottom*，*center*中任意两个关键字的组合(以空格分隔)。关键词的顺序不重要，如：*'center left'*等价于*'left center'*。*'center center'*可以简写为*'center'*
- **offset** {*object*} 默认： *{ x: 0, y: 0 }*。指定相对于position所在位置的偏移值。可以为负。可选。
- **mask** {*boolean*} 默认： *false*。指示是否给图片添加mask。(作为前景图的图片此选项无效。)。 可选。
- **maskShape** {*string*} 默认：*'rect'*。指定mask的形状，只在mask取值*true*时生效。可选的值为：*'rect'*，*circle*。
- **maskSize** {*object*} 默认：*{w: 200, h:200}*。指定mask的尺寸。当*maskShape*为 *'rect'* 是，需要指定mask的宽度(*w*)和高度(*h*)。当*maskShape*为 *'circle'* 时，需要指定mask的圆心点*x*, *y* ，和半径*radius* 。默认 *{x: 0, y:0, radius: 200}*
- **scale** {*number|string*} 默认：*1*。指示图片初始缩放的倍率。低于0的值视为1。另外两个合法的字符值为：*'contain'* 和 *'cover'*。*'contain'* 表示将图像等比缩放到宽度或高度与容器的宽度或高度相等，图像始终被包含在容器内。*'cover'* 表示将背景图像等比缩放到完全覆盖容器，图像有可能超出容器。可选。
- **enabledMultiTouches** {*boolean*} 默认：*true*。指示是否允许多指操作。如：双指的缩放和旋转。(作为前景图的图片此选项无效。)。 可选。
- **interactive** {*boolean*} 默认：*false*。指定是否允许对图片进行交互操作。

## methods
### addChild(options)
在stage中添加一张图片，默认显示在最上层。

- param **options** {*object*|*string*} options可以是图片*URL*，如： *'./images/img6.jpg'*，也可以是image-options对象。必选。

example：
```javascript
var addChild = $('.add-child')
  addChild.click(function (e) {
    canvas.addChild({
      id: 'img6',
      url: './images/img6.jpg',
      position: 'top right',
      scale: 0.5,
      interactive: true
    })
  })
```
或者：
```javascript
var addChild = $('.add-child')
  addChild.click(function (e) {
    // 此时图片的所有options均为默认值，URL为传入的值
    canvas.addChild('./images/img6.jpg')
  })
```

### addChildAt(*options*，*position*)
在指定的位置添加一张图片
- param *options* {*string*|*object*} options可以是图片*URL*，如： *'./images/img6.jpg'*，也可以是image-options对象。必选。
- param *position* {*number*} 在所有的图片数组（初始化时传入的数组）中插入的索引。超出数组大小时，添加到末尾。必选

example:
```javascript
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
        }, 111)
      })
```

### clear()
清空stage。移除了stage和container里的所有元素。

example:
```javascript
  canvas.clear()
```

### getAllImages()
获取所有的图片。

example: 
```javascript
// 获取所有的图片
  var getAllBtn = $('.get-all')
  getAllBtn.click(function () {
    console.log(canvas.getAllImages())
  })
```

### getOptions(*id*, *context*)
返回指定ID的图片的scale配置项,如果只有一个匹配，则返回该对象，如果有多个匹配则返回一个数组，包含所有匹配项。

- param **id** {*string*|*number*} 图片的ID。必选。
example:
```javascript
// 获取所有背景图片中，ID值为'img1'的图片的配置项
  canvas.getOptions('img1')
```

### removeChild(id)
在stage上移除给定ID的图片。如果有多张图有相同的ID，则所有与给定ID匹配的图片都会被移除。注意：应该始终保持所有图片具有唯一的ID。

- param **id** *{string|number}* 要移除的图片的ID。必选。

example: 
```javascript
   // 移除一张图片
    var removeInput = $('.remove')
    var removeBtn = $('.remove-btn')
    removeBtn.click(function (e) {
      canvas.removeChild(removeInput.val().trim())
    })
```

### replace(id, options[, keepProperties])
替换给定ID的图片。
- param **id** {*number*|*string*} 要替换的图片的ID。必选
- param **options** {*object*|*string*} 如果传入的URL，则根据keepProperties的值决定是否保留目标图片的相应属性。如果传入配置项，则忽视keepProperties的值，以配置项为准。必选。
- param **keepProperties** 是否保留目标图片的属性。默认为false。可选
example: 
```javascript
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
      interactive: true
    })
  })
```

### setOption(id, options)
更改指定ID的图片的配置项。
- param **id** {*number*|*string*} 更改的图片的ID。必选。
- param **options** 新的配置项
example: 
```javascript
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
```

### toDataURL([*mimeType*，*quality*])
返回以stage内容生成的base64格式的URL。可以作为img的*src*属性值，或者提交到服务器。默认的图片格式为：*image/png*。注意：导出的图片大小为指定的canvas容器的*css*尺寸的两倍。
- param **mimeType** {*string*} 图片的格式，支持的格式为：image/png(默认)，image/jpeg, image/webp(chrome支持)。可选。
- param **quality** {*number*} 在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略。可选。

example: 
```javascript
  var getDataBtn = $('.get-data-btn')
    getDataBtn.click(function (e) {
      var imageSrc = canvas.toDataURL('image/jpeg', 0.5)
      var image = new Image()
      image.onload = function () {
        $('.container').empty().append(image)
      }
      image.src = imageSrc
    })
```

## license
MIT


