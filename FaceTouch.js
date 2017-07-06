/*
 author:shin
 explain:
 facetouch is used at situtation that user interactive by its finguer on mobile or mouse on pc;
 excute at the moment of moving ,touching, rotating with two finguers, scaleing with two finguers.
 code demo:
 var ft=new FaceTouch('content')//content stands for the id of a div;
 ft.onmove=function(obj){
 console.log(obj.offsetx);
 console.log(obj.offsety);
 }
 ft.onrotate=function(obj)
 {
 console.log(obj.scale);
 console.log(obj.angle);
 }
 ft.ontouchend=function(obj)
 {
 console.log(obj.offsetx);
 console.log(obj.offsety);
 }

 */


var facetouchAd = {
  TOUCH_START: 'touchstart',
  TOUCH_MOVE: 'touchmove',
  TOUCH_END: 'touchend',
  devicetype: 'mobile',
  check: function () {
    var mydeviceinfotmation = navigator.userAgent.toLowerCase();
    if (mydeviceinfotmation.match(/ipad/i) == 'ipad') {
    }
    else if (mydeviceinfotmation.match(/iphone/i) == 'iphone') {
    }
    else if (mydeviceinfotmation.match(/android/i) == 'android') {
    }
    else if (mydeviceinfotmation.match(/windows mobile/i) == 'windows mobile') {
      this.TOUCH_START = 'mousedown';
      this.TOUCH_MOVE = 'mousemove';
      this.TOUCH_END = 'mouseup';
    }
    else {
      this.TOUCH_START = 'mousedown';
      this.TOUCH_MOVE = 'mousemove';
      this.TOUCH_END = 'mouseup';
    }

    //alert(mydeviceinfotmation);
  }
}
facetouchAd.check();
function FaceTouch(targetElement) {

  this.element = document.getElementById(targetElement) || document.body;
  //show($(this.element));
  var isTouch = false;

  var touchpoints;
  this.name = 'xiaoxin';
  this.onmove = function () {
  };
  this.onrotate = function () {
  };
  this.ontouchend = function () {
  };
  this.initdis = 0;
  this.initrotation = 0;
  this.points = [];
  var pointsnumber = 0;
  var lastp;
  this.lastdis = 0;
  this.lastrotation = 0;
  var self = this;

  this.handleTouchBegin = function (e) {
    e.preventDefault();
    isTouch = true;
    var str = '';
    for (var o in e) {
      str += o + '=' + e[o] + '\n';
    }
    if (e.targetTouches) {
      var touchnum = e.targetTouches.length;
      pointsnumber++;

      switch (touchnum) {
        case 1:
          lastp = touchpoints = [{
            'x': e.targetTouches[0].pageX,
            'y': e.targetTouches[0].pageY
          }];
          break;
        case 2:
          touchpoints = [{
            'x': e.targetTouches[0].pageX,
            'y': e.targetTouches[0].pageY
          },
            {
              'x': e.targetTouches[1].pageX,
              'y': e.targetTouches[1].pageY
            }];
          self.initdis = caculatepointsDistance(touchpoints[0], touchpoints[1]).offsetdistance;
          self.initrotation = caculatepointsDistance(touchpoints[0], touchpoints[1]).angle / Math.PI * 180;
      }
      self.element.addEventListener('touchmove', self.handleTouchMove);
    }
    else {
      touchpoints = lastp = [{
        'x': e.pageX,
        'y': e.pageY
      }];
      self.element.addEventListener('mousemove', self.handleTouchMove);
    }
  };

  this.handleMouchMove = function (e) {
    //e.preventDefault();
    if (isTouch) {
      var newtouch;
      consoloe.log(e.clientX);
      newtouchs = [{
        'x': e.clientX,
        'y': e.clientY
      }];
      handleTouchesByOnePoint(newtouchs, touchpoints);
    }
  }
  this.handleMouseBegin = function (e) {
    isTouch = true;
    touchpoints = [{
      'x': e.clientX,
      'y': e.clientY
    }];
  }
  this.handleTouchMove = function (e) {
    //e.preventDefault();

    if (isTouch) {
      if (e.targetTouches) {
        var touchnum = e.targetTouches.length;
        var newtouchs;

        switch (touchnum) {
          case 1:
            newtouchs = [{
              'x': e.targetTouches[0].pageX,
              'y': e.targetTouches[0].pageY
            }];
            handleTouchesByOnePoint(newtouchs, touchpoints);
            break;
          case 2:
            newtouchs = [{
              'x': e.targetTouches[0].pageX,
              'y': e.targetTouches[0].pageY
            },
              {
                'x': e.targetTouches[1].pageX,
                'y': e.targetTouches[1].pageY
              }];

            self.points = newtouchs;

            handleTouchsByMultiPoints(newtouchs, touchpoints);

            break;
        }
      }
      else {

        newtouchs = [{
          'x': e.pageX,
          'y': e.pageY
        }];

        handleTouchesByOnePoint(newtouchs, touchpoints);
      }
    }
    touchpoints = newtouchs;
  }

  this.handleTouchEnd = function (e) {

    isTouch = false;
    pointsnumber = 0;
    self.initdis = self.lastdis;
    self.initrotation = self.lastrotation;
    self.ontouchend(lastp);
    self.element.removeEventListener(facetouchAd.TOUCH_MOVE, self.handleTouchMove);
  };

  function handleTouchesByOnePoint(points1, points2) {
    var p = caculatepointsDistance(points1[0], points2[0]);
    lastp = p;
    if (self.onmove) {
      self.onmove(p);
    }
  }

  function handleTouchsByMultiPoints(points1, points2) {
    var result1 = caculatepointsDistance(points1[0], points1[1]);
    var result2 = caculatepointsDistance(points2[0], points2[1]);
    var dis = result2.offsetdistance - result1.offsetdistance;
    var ang = result2.angle - result1.angle;
    var sc = -dis / self.initdis / 2;
    var mainresult = {};
    mainresult.angle = -ang / Math.PI * 180;
    mainresult.scale = sc;
    mainresult.points = points1;
    self.onrotate(mainresult);
  }

  function show(str) {
    console.log(str + ' is ready');
  }

  function caculatepointsDistance(point1, point2) {
    var resultp = {};
    var movex = point2.x - point1.x;
    var movey = point2.y - point1.y;
    var distance = Math.sqrt(movex * movex + movey * movey);
    var angle1,
      angle2,
      anglebe;
    angle1 = Math.atan2(movey, movex);
    resultp.offsetx = movex;
    resultp.offsety = movey;
    resultp.offsetdistance = distance;
    resultp.angle = angle1;
    return resultp;
  }

  this.element.addEventListener(facetouchAd.TOUCH_START, this.handleTouchBegin);
  this.element.addEventListener(facetouchAd.TOUCH_MOVE, this.handleTouchMove);
  this.element.addEventListener(facetouchAd.TOUCH_END, this.handleTouchEnd);
  document.addEventListener(facetouchAd.TOUCH_END, function () {
    self.element.removeEventListener(facetouchAd.TOUCH_MOVE, self.handleTouchMove);
  });

}
