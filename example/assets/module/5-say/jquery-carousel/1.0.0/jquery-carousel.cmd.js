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


            playEvent   : 'carousel-next',
            activeIndex : 0,


            init : function (options, element) {

                var base = this;

                base.$elem       = $(element);
                base.options     = $.extend({}, $.fn.carousel.options, base.$elem.data(), options);
                base.userOptions = options;

                // 事件绑定
                base.$elem.on('carousel-autoplay', function () { base.autoplay(); });
                base.$elem.on('carousel-stop'    , function () { base.stop();     });
                base.$elem.on('carousel-next'    , function (event, stepItem) { base.next(stepItem); });
                base.$elem.on('carousel-prev'    , function (event, stepItem) { base.prev(stepItem); });
                base.$elem.on('carousel-goto'    , function (event, index)    { base.goto(index);    });

                base.animateInit().nextNavInit().prevNavInit().controlNavInit();

                // 自动播放
                if (base.options.autoplay) base.autoplay();
            },


            animateInit : function () {
                var base = this;

                // 子元素容器
                base.$childBox = base.$elem.children().first();
                // 子元素标记
                var $items = base.$childBox.children().each(function (i) {
                    $(this).attr('carousel-index', i);
                });

                if (base.options.animate.match(/^scroll.+/)) {
                    // 为无缝滚动做准备
                    var allWidth = allHeight = 0;
                    $items
                        .each(function (i) {
                            allWidth  += $(this).width();
                            allHeight += $(this).height();
                        });
                    if (base.options.animate.match(/^scroll[Left|Right]/))
                        base.$childBox.css({
                            width : allWidth+'px'
                        }).children().css({ float : 'left' });
                    else
                        base.$childBox.css({
                            height : allHeight+'px'
                        });
                }

                return base;
            },


            autoplay : function (repeat) {
                var base   = this;
                var repeat = repeat ? repeat : base.options.repeat;
                base.$elem.repeat(repeat).trigger(base.playEvent);
                return base;
            },


            stop : function () {
                var base = this;
                base.$elem.unrepeat();
                return base;
            },


            next : function (stepItem) {
                var base     = this;
                var stepItem = stepItem ? stepItem : base.options.stepItem;

                switch (base.options.animate) {
                    case 'scrollUp':
                        base.childScrollUp(stepItem);
                        break;
                    case 'scrollDown':
                        base.childScrollDown(stepItem);
                        break;
                    case 'scrollLeft':
                        base.childScrollLeft(stepItem);
                        break;
                    case 'scrollRight':
                        base.childScrollRight(stepItem);
                        break;
                    default:;
                }

                base.playEvent = 'carousel-next';
                return base;
            },


            prev : function (stepItem) {
                var base     = this;
                var stepItem = stepItem ? stepItem : base.options.stepItem;

                switch (base.options.animate) {
                    case 'scrollUp':
                        base.childScrollDown(stepItem);
                        break;
                    case 'scrollDown':
                        base.childScrollUp(stepItem);
                        break;
                    case 'scrollLeft':
                        base.childScrollRight(stepItem);
                        break;
                    case 'scrollRight':
                        base.childScrollLeft(stepItem);
                        break;
                    default:;
                }

                base.playEvent = 'carousel-prev';
                return base;
            },


            goto : function (targetIndex) {
                var base = this;

                
                if (base.options.animate.match(/^scroll.+/)) {
                    base.childScrollTo(targetIndex);
                }

                return base;
            },


            childScrollTo : function (targetIndex) {
                var base = this;

                if (targetIndex === base.activeIndex) return;

                var $childBox = base.$childBox.stop(true, true);
                if (base.options.animate.match(/^scroll[Left|Right]/)) {
                    if (targetIndex > base.activeIndex)
                        base.childScrollLeft(targetIndex - base.activeIndex);
                    else
                        base.childScrollRight(base.activeIndex - targetIndex);
                } else {
                    if (targetIndex > base.activeIndex)
                        base.childScrollUp(targetIndex - base.activeIndex);
                    else
                        base.childScrollDown(base.activeIndex - targetIndex);
                }

                return base;
            },


            childScrollUp : function (stepItem) {
                var base = this;

                var $childBox = base.$childBox;
                var original = $childBox.css('marginTop');

                var stepSize = 0;
                $childBox.children().slice(0, stepItem).each(function (i) {
                    stepSize += $(this).height();
                });
                var endSize  = parseInt(original) - stepSize;

                $childBox
                    .animate({marginTop : endSize+'px'}, base.options.speed, function(){
                        $(this)
                            .css('marginTop', original)
                            .children().slice(0, stepItem).appendTo($(this));
                        var activeIndex = base.$childBox.children().first().attr('carousel-index');    
                        base.controlNavActived(activeIndex).options.end(activeIndex, base);
                    });
            },


            childScrollDown : function (stepItem) {
                var base = this;

                var $childBox = base.$childBox;
                var original = $childBox.css('marginTop');

                var stepSize = 0;
                $childBox.children().slice(-stepItem).each(function (i) {
                    stepSize += $(this).height();
                });
                var endSize  = parseInt(original) + stepSize;

                $childBox
                    .css({marginTop : '-'+endSize+'px'})
                    .children().slice(-stepItem).prependTo($childBox);
                $childBox
                    .animate({marginTop : 0}, base.options.speed, function () {
                        var activeIndex = base.$childBox.children().first().attr('carousel-index');    
                        base.controlNavActived(activeIndex).options.end(activeIndex, base);
                    });
            },


            childScrollLeft : function (stepItem) {
                var base = this;

                var $childBox = base.$childBox;
                var original = $childBox.css('marginLeft');

                var stepSize = 0;
                $childBox.children().slice(0, stepItem).each(function (i) {
                    stepSize += $(this).width();
                });
                var endSize  = parseInt(original) - stepSize;

                $childBox
                    .animate({marginLeft : endSize+'px'}, base.options.speed, function () {
                        $(this)
                            .css('marginLeft', original)
                            .children().slice(0, stepItem).appendTo($(this));
                        var activeIndex = base.$childBox.children().first().attr('carousel-index');    
                        base.controlNavActived(activeIndex).options.end(activeIndex, base);
                    });
            },


            childScrollRight : function (stepItem) {
                var base = this;

                var $childBox = base.$childBox;
                var original = $childBox.css('marginLeft');

                var stepSize = 0;
                $childBox.children().slice(-stepItem).each(function (i) {
                    stepSize += $(this).width();
                });
                var endSize  = parseInt(original) + stepSize;

                $childBox
                    .css({marginLeft : '-'+endSize+'px'})
                    .children().slice(-stepItem).prependTo($childBox);
                $childBox
                    .animate({marginLeft : 0}, base.options.speed, function () {
                        var activeIndex = base.$childBox.children().first().attr('carousel-index');    
                        base.controlNavActived(activeIndex).options.end(activeIndex, base);
                    });
            },


            prevNavInit : function () {
                var base = this;

                if (base.options.prevNav) {

                    var $prevNav = base.options.prevNav.match(/^>.+/)
                        ? base.$elem.find(base.options.prevNav)
                        : $(base.options.prevNav);

                    $prevNav.on('click', function () {
                        base.stop().prev().autoplay();
                        return false;
                    });
                }
                
                return base;
            },


            nextNavInit : function () {
                var base = this;

                if (base.options.nextNav) {

                    var $nextNav = base.options.nextNav.match(/^>.+/)
                        ? base.$elem.find(base.options.nextNav)
                        : $(base.options.nextNav);

                    $nextNav.on('click', function () {
                        base.stop().next().autoplay();
                        return false;
                    });
                }
                
                return base;
            },


            controlNavInit : function () {
                var base = this;

                if (base.options.controlNav) {

                    var $controlNav = base.options.controlNav.match(/^>.+/)
                        ? base.$elem.find(base.options.controlNav)
                        : $(base.options.controlNav);

                    $controlNav
                        .on(base.options.controlNavEvent, function () {
                            $(this).addClass('active').siblings().removeClass('active');
                            base.stop().goto($(this).index()).autoplay();
                            return false;
                        })
                        .eq(base.activeIndex).addClass('active');
                }
                
                return base;
            },


            controlNavActived : function (index) {
                var base = this;

                base.activeIndex = index;
                if (base.options.controlNav) {

                    var $controlNav = base.options.controlNav.match(/^>.+/)
                        ? base.$elem.find(base.options.controlNav)
                        : $(base.options.controlNav);

                    $controlNav.removeClass('active').eq(index).addClass('active');
                }

                return base;
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
            nextNav : null,
            prevNav : null,
            controlNav : null,
            controlNavEvent : 'click',
            end : function (activeIndex, base) { },
            // seamless : true,       // 无缝切换：true | false
            other : null
        };


    }(jQuery, window, document));




return jQuery; });