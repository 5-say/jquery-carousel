define(function (require) {

    var jQuery = require('timing');


    if (typeof Object.create !== "function") {
        Object.create = function (obj) {
            function F() {}
            F.prototype = obj;
            return new F();
        };
    }


    (function ($, window, document) {

        /**
         * 多组子元素轮序切换
         */
        var Carousel = {


            playEvent : 'carousel-next',


            init : function (options, element) {

                var base = this;

                base.$elem       = $(element);
                base.options     = $.extend({}, $.fn.carousel.options, base.$elem.data(), options);
                base.userOptions = options;

                // 事件绑定
                base.$elem.on('carousel-next'    , function () { base.next();     });
                base.$elem.on('carousel-prev'    , function () { base.prev();     });
                base.$elem.on('carousel-autoplay', function () { base.autoplay(); });
                base.$elem.on('carousel-stop'    , function () { base.stop();     });

                // 自动播放
                if (base.options.autoplay) base.autoplay();

            },


            autoplay : function () {
                var base = this;
                base.$elem.repeat(base.options.repeat).trigger(base.playEvent);
                return base;
            },


            stop : function () {
                var base = this;
                base.$elem.unrepeat();
                return base;
            },


            next : function () {
                var base = this;

                switch (base.options.animate) {
                    case 'scrollUp':
                        base.childScrollUp();
                        break;
                    case 'scrollDown':
                        base.childScrollDown();
                        break;
                    case 'scrollLeft':
                        base.childScrollLeft();
                        break;
                    case 'scrollRight':
                        base.childScrollRight();
                        break;
                    default:;
                }

                base.playEvent = 'carousel-next';
                return base;
            },


            prev : function () {
                var base = this;

                switch (base.options.animate) {
                    case 'scrollUp':
                        base.childScrollDown();
                        break;
                    case 'scrollDown':
                        base.childScrollUp();
                        break;
                    case 'scrollLeft':
                        base.childScrollRight();
                        break;
                    case 'scrollRight':
                        base.childScrollLeft();
                        break;
                    default:;
                }

                base.playEvent = 'carousel-prev';
                return base;
            },


            goto : function (index) {
                var base = this;
                // seamless 无缝
            },


            childScrollUp : function () {
                var base = this;

                var childBox = base.$elem.children().first().stop(true, true);
                var original = childBox.css('marginTop');

                var stepSize = 0;
                childBox.children().slice(0, base.options.stepItem).each(function (i) {
                    stepSize += $(this).height();
                });
                var endSize  = parseInt(original) - stepSize;

                childBox
                    .animate({marginTop : endSize + 'px'}, base.options.speed, function(){
                        $(this)
                            .css('marginTop', original)
                            .children().slice(0, base.options.stepItem).appendTo($(this));
                    });
            },


            childScrollDown : function () {
                var base = this;

                var childBox = base.$elem.children().first().stop(true, true);
                var original = childBox.css('marginTop');

                var stepSize = 0;
                childBox.children().slice(-base.options.stepItem).each(function (i) {
                    stepSize += $(this).height();
                });
                var endSize  = parseInt(original) + stepSize;

                childBox
                    .css({marginTop : '-' + endSize + 'px'})
                    .children().slice(-base.options.stepItem).prependTo(childBox);
                childBox
                    .animate({marginTop : 0}, base.options.speed);
            },


            childScrollLeft : function () {
                var base = this;

                var childBox = base.$elem.children().first().stop(true, true);
                var original = childBox.css('marginLeft');

                var stepSize = 0;
                childBox.children().slice(0, base.options.stepItem).each(function (i) {
                    stepSize += $(this).width();
                });
                var endSize  = parseInt(original) - stepSize;

                childBox
                    .animate({marginLeft : endSize + 'px'}, base.options.speed, function(){
                        $(this)
                            .css('marginLeft', original)
                            .children().slice(0, base.options.stepItem).appendTo($(this));
                    });
            },


            childScrollRight : function () {
                var base = this;

                var childBox = base.$elem.children().first().stop(true, true);
                var original = childBox.css('marginLeft');

                var stepSize = 0;
                childBox.children().slice(-base.options.stepItem).each(function (i) {
                    stepSize += $(this).width();
                });
                var endSize  = parseInt(original) + stepSize;

                childBox
                    .css({marginLeft : '-' + endSize + 'px'})
                    .children().slice(-base.options.stepItem).prependTo(childBox);
                childBox
                    .animate({marginLeft : 0}, base.options.speed);
            },


            other : null
        };


        $.fn.carousel = function (options) {
            return this.each(function () {
                // 防止重复初始化
                if ($(this).data('carousel-init') === true) return false;
                $(this).data('carousel-init', true);
                // 初始化操作
                var carousel = Object.create(Carousel);
                carousel.init(options, this);
                $.data(this, "carousel", carousel);
                
            });
        };


        $.fn.carousel.options = {
            stepItem : 1,          // 步进项目数量
            animate  : 'scrollUp', // 动画：预定义动画
            speed    : 900,        // 动画速度：ms
            repeat   : 3000,       // 重复间隔：ms
            autoplay : true,       // 自动播放：true | false
            seamless : true,       // 无缝切换：true | false
            other : null
        };


    }(jQuery, window, document));




return jQuery; });