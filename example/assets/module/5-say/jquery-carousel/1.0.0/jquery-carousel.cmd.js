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


            $items : function () {
                var base = this;
                return base.options.$items(base.$itemBox);
            },


            init : function (options, element) {

                var base = this;

                base.$elem       = $(element);
                base.options     = $.extend({}, $.fn.carousel.options, base.$elem.data(), options);
                base.userOptions = options;
                base.$itemBox    = base.options.$itemBox(base.$elem);


                // 事件绑定
                base.$elem.on('carousel-stop'    , function () { base.stop(); return false; });
                base.$elem.on('carousel-autoplay', function (event, repeat)   { base.autoplay(repeat); return false; });
                base.$elem.on('carousel-next'    , function (event, stepItem) { base.next(stepItem);   return false; });
                base.$elem.on('carousel-prev'    , function (event, stepItem) { base.prev(stepItem);   return false; });
                base.$elem.on('carousel-goto'    , function (event, index)    { base.goto(index);      return false; });

                base.animateInit().nextNavInit().prevNavInit().controlNavInit();

                // 自动播放
                if (base.options.autoplay) base.autoplay();
            },


            animateInit : function () {
                var base     = this,
                    $itemBox = base.$itemBox,
                    $items   = base.$items();

                // 子元素标记
                $items.each(function (i) {
                    $(this).attr('carousel-index', i);
                });

                if (base.options.animate.match(/^scroll.+/)) {
                    // 为无缝滚动做准备
                    var allWidth = allHeight = 0;
                    $items.each(function (i) {
                        allWidth  += $(this).width();
                        allHeight += $(this).height();
                    });

                    if (base.options.animate.match(/^scroll[Left|Right]/)) {
                        $itemBox
                            .css({ width : allWidth+'px' });
                        $items
                            .css({ float : 'left' });
                    } else {
                        $itemBox
                            .css({ height : allHeight+'px' });
                    }
                } else if (base.options.animate === 'fade') {
                    $itemBox
                        .css({
                            position : 'relative',
                            zIndex   : 0
                        });
                    $items
                        .css({
                            position : 'absolute',
                            zIndex   : 1
                        })
                        .hide()
                    .first()
                        .css({
                            zIndex   : 2
                        })
                        .show();
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
                    case 'fade':
                        base.childFadePrev();
                        break;
                    default:;
                }

                base.playEvent = 'carousel-prev';
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
                    case 'fade':
                        base.childFadeNext();
                        break;
                    default:;
                }

                base.playEvent = 'carousel-next';
                return base;
            },


            goto : function (targetIndex) {
                var base = this;

                if (base.options.animate.match(/^scroll.+/)) {
                    base.childScrollTo(targetIndex);
                } else if (base.options.animate === 'fade') {
                    base.childFadeTo(targetIndex);
                }

                return base;
            },


        // childScroll - begin
        
            childScrollTo : function (targetIndex) {
                var base = this;
                base.$itemBox.stop(true, true);

                if (targetIndex === base.activeIndex) return base;
                
                var nextStepItem = base.$items().siblings('[carousel-index="'+targetIndex+'"]').index(),
                    prevStepItem = base.$items().length - nextStepItem;

                if (base.options.animate.match(/^scroll[Left|Right]/)) {
                    if (nextStepItem < prevStepItem)
                        base.childScrollLeft(nextStepItem);
                    else
                        base.childScrollRight(prevStepItem);
                } else {
                    if (nextStepItem < prevStepItem)
                        base.childScrollUp(nextStepItem);
                    else
                        base.childScrollDown(prevStepItem);
                }

                return base;
            },

            childScrollUp : function (stepItem) {
                var base     = this,
                    $itemBox = base.$itemBox.stop(true, true),
                    $items   = base.$items(),
                    original = $itemBox.css('marginTop');

                base.controlNavActived($items.eq(stepItem).attr('carousel-index'));

                var stepSize  = 0;
                $items.slice(0, stepItem).each(function (i) {
                    stepSize += $(this).height();
                });
                var endSize   = parseInt(original) - stepSize;

                $itemBox
                    .animate({marginTop : endSize+'px'}, base.options.speed, function(){
                        $(this).css('marginTop', original);
                        $items.slice(0, stepItem).appendTo($(this));
                        base.activeIndex += stepItem;
                        base.options.end(base.activeIndex, base);
                    });
            },

            childScrollDown : function (stepItem) {
                var base     = this,
                    $itemBox = base.$itemBox.stop(true, true),
                    $items   = base.$items(),
                    original = $itemBox.css('marginTop');
                base.controlNavActived($items.slice(-stepItem).eq(0).attr('carousel-index'));

                var stepSize  = 0;
                $items.slice(-stepItem).each(function (i) {
                    stepSize += $(this).height();
                });
                var endSize   = parseInt(original) + stepSize;

                $itemBox
                    .css({marginTop : '-'+endSize+'px'});
                $items.slice(-stepItem).prependTo($itemBox);
                $itemBox
                    .animate({marginTop : original}, base.options.speed, function () {
                        base.activeIndex += stepItem;
                        base.options.end(base.activeIndex, base);
                    });
            },

            childScrollLeft : function (stepItem) {
                var base     = this,
                    $itemBox = base.$itemBox.stop(true, true),
                    $items   = base.$items(),
                    original = $itemBox.css('marginLeft');

                base.controlNavActived($items.eq(stepItem).attr('carousel-index'));

                var stepSize  = 0;
                $items.slice(0, stepItem).each(function (i) {
                    stepSize += $(this).width();
                });
                var endSize   = parseInt(original) - stepSize;

                $itemBox
                    .animate({marginLeft : endSize+'px'}, base.options.speed, function () {
                        $(this).css('marginLeft', original);
                        $items.slice(0, stepItem).appendTo($(this));
                        base.activeIndex += stepItem;
                        base.options.end(base.activeIndex, base);
                    });
            },

            childScrollRight : function (stepItem) {
                var base     = this,
                    $itemBox = base.$itemBox.stop(true, true),
                    $items   = base.$items(),
                    original = $itemBox.css('marginLeft');
                base.controlNavActived($items.slice(-stepItem).eq(0).attr('carousel-index'));

                var stepSize  = 0;
                $items.slice(-stepItem).each(function (i) {
                    stepSize += $(this).width();
                });
                var endSize   = parseInt(original) + stepSize;

                $itemBox.css({marginLeft : '-'+endSize+'px'});
                $items.slice(-stepItem).prependTo($itemBox);
                $itemBox
                    .animate({marginLeft : original}, base.options.speed, function () {
                        base.activeIndex += stepItem;
                        base.options.end(base.activeIndex, base);
                    });
            },

        // childScroll - end


        // childFade - begin

            childFadePrev : function () {
                var base = this;

                var $items = base.$items().stop(true, true);
                base.controlNavActived($items.last().attr('carousel-index'));

                $items.eq(0).css({ zIndex : 1 }).fadeOut(base.options.speed);
                $items.last().prependTo(base.$itemBox).hide().css({ zIndex : 3 }).fadeIn(base.options.speed, function () {
                    $(this).css({ zIndex : 2 });
                    base.activeIndex = $(this).attr('carousel-index');
                    base.options.end(base.activeIndex, base);
                });
            },

            childFadeNext : function () {
                var base = this;

                var $items = base.$items().stop(true, true);
                base.controlNavActived($items.eq(1).attr('carousel-index'));

                $items.eq(0).css({ zIndex : 1 }).appendTo(base.$itemBox).fadeOut(base.options.speed);
                $items.eq(1).hide().css({ zIndex : 3 }).fadeIn(base.options.speed, function () {
                    $(this).css({ zIndex : 2 });
                    base.activeIndex = $(this).attr('carousel-index');
                    base.options.end(base.activeIndex, base);
                });
            },

            childFadeTo : function (targetIndex) {
                var base   = this;
                var $items = base.$items().stop(true, true);

                if (base.activeIndex === targetIndex) return base;

                var $itemBox     = base.$itemBox;
                var $targetIndex = $items.siblings('[carousel-index="'+targetIndex+'"]');

                $items.slice(0, $targetIndex.index()).appendTo($itemBox).fadeOut(base.options.speed);
                $targetIndex.hide().css({ zIndex : 3 }).fadeIn(base.options.speed, function () {
                    $items.eq(0).css({ zIndex : 1 });
                    $(this).css({ zIndex : 2 });
                    base.options.end(targetIndex, base);
                    base.activeIndex = targetIndex;
                });
            },

        // childFade - end


            prevNavInit : function () {
                var base = this;

                if (base.options.prevNav) {

                    var $prevNav = base.options.prevNav.match(/^>.+/)
                        ? base.$elem.find(base.options.prevNav)
                        : $(base.options.prevNav);

                    $prevNav.on('click', function () {
                        base.stop().prev();
                        if (! base.options.stopOnAction) base.autoplay();
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
                        base.stop().next();
                        if (! base.options.stopOnAction) base.autoplay();
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
                            base.stop().goto($(this).index());
                            if (! base.options.stopOnAction) base.autoplay();
                            return false;
                        })
                        .eq(base.activeIndex).addClass('active');
                }
                
                return base;
            },


            controlNavActived : function (index) {
                var base = this;

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

            animate         : 'scrollLeft', // 动画：预定义动画
                                            // scrollLeft、scrollRight、scrollUp、scrollDown
                                            // fade

            stepItem        : 1,            // 步进项目数量
            speed           : 900,          // 动画速度：ms
            repeat          : 3000,         // 重复间隔：ms
            autoplay        : true,         // 自动播放：true | false
            stopOnAction    : true,         // 控制交互后停止自动播放：true | false

            // 默认全局选择器，支持首字符为 '>' 的子元素选择器
            prevNav         : null,         // 选择器，上一个
            nextNav         : null,         // 选择器，下一个
            controlNav      : null,         // 选择器，控制导航
            controlNavEvent : 'click',      // 控制导航触发事件

            $itemBox : function ($baseElement) {
                return $baseElement.children().not($('script, style')).first();
            },

            $items   : function ($itemBox) {
                return $itemBox.children().not($('script, style'));
            },

            end      : function (activeIndex, base) { }, // 切换完成后的回调函数

            other : null
        };


    }(jQuery, window, document));




return jQuery; });