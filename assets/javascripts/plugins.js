// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

/*!
 * jQuery Cycle Lite Plugin
 * http://malsup.com/jquery/cycle/lite/
 * Copyright (c) 2008-2012 M. Alsup
 * Version: 1.7 (20-FEB-2013)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.3.2 or later
 */
;(function($) {
"use strict";

var ver = 'Lite-1.7';
var msie = /MSIE/.test(navigator.userAgent);

$.fn.cycle = function(options) {
    return this.each(function() {
        options = options || {};
        
        if (this.cycleTimeout) 
            clearTimeout(this.cycleTimeout);

        this.cycleTimeout = 0;
        this.cyclePause = 0;
        
        var $cont = $(this);
        var $slides = options.slideExpr ? $(options.slideExpr, this) : $cont.children();
        var els = $slides.get();
        if (els.length < 2) {
            if (window.console)
                console.log('terminating; too few slides: ' + els.length);
            return; // don't bother
        }

        // support metadata plugin (v1.0 and v2.0)
        var opts = $.extend({}, $.fn.cycle.defaults, options || {}, $.metadata ? $cont.metadata() : $.meta ? $cont.data() : {});
        var meta = $.isFunction($cont.data) ? $cont.data(opts.metaAttr) : null;
        if (meta)
            opts = $.extend(opts, meta);
            
        opts.before = opts.before ? [opts.before] : [];
        opts.after = opts.after ? [opts.after] : [];
        opts.after.unshift(function(){ opts.busy=0; });
            
        // allow shorthand overrides of width, height and timeout
        var cls = this.className;
        opts.width = parseInt((cls.match(/w:(\d+)/)||[])[1], 10) || opts.width;
        opts.height = parseInt((cls.match(/h:(\d+)/)||[])[1], 10) || opts.height;
        opts.timeout = parseInt((cls.match(/t:(\d+)/)||[])[1], 10) || opts.timeout;

        if ($cont.css('position') == 'static') 
            $cont.css('position', 'relative');
        if (opts.width) 
            $cont.width(opts.width);
        if (opts.height && opts.height != 'auto') 
            $cont.height(opts.height);

        var first = 0;
        $slides.css({position: 'absolute', top:0}).each(function(i) {
            $(this).css('z-index', els.length-i);
        });
        
        $(els[first]).css('opacity',1).show(); // opacity bit needed to handle reinit case
        if (msie) 
            els[first].style.removeAttribute('filter');

        if (opts.fit && opts.width) 
            $slides.width(opts.width);
        if (opts.fit && opts.height && opts.height != 'auto') 
            $slides.height(opts.height);
        if (opts.pause) 
            $cont.hover(function(){this.cyclePause=1;}, function(){this.cyclePause=0;});

        var txFn = $.fn.cycle.transitions[opts.fx];
        if (txFn)
            txFn($cont, $slides, opts);
        
        $slides.each(function() {
            var $el = $(this);
            this.cycleH = (opts.fit && opts.height) ? opts.height : $el.height();
            this.cycleW = (opts.fit && opts.width) ? opts.width : $el.width();
        });

        if (opts.cssFirst)
            $($slides[first]).css(opts.cssFirst);

        if (opts.timeout) {
            // ensure that timeout and speed settings are sane
            if (opts.speed.constructor == String)
                opts.speed = {slow: 600, fast: 200}[opts.speed] || 400;
            if (!opts.sync)
                opts.speed = opts.speed / 2;
            while((opts.timeout - opts.speed) < 250)
                opts.timeout += opts.speed;
        }
        opts.speedIn = opts.speed;
        opts.speedOut = opts.speed;

        opts.slideCount = els.length;
        opts.currSlide = first;
        opts.nextSlide = 1;

        // fire artificial events
        var e0 = $slides[first];
        if (opts.before.length)
            opts.before[0].apply(e0, [e0, e0, opts, true]);
        if (opts.after.length > 1)
            opts.after[1].apply(e0, [e0, e0, opts, true]);
        
        if (opts.click && !opts.next)
            opts.next = opts.click;
        if (opts.next)
            $(opts.next).unbind('click.cycle').bind('click.cycle', function(){return advance(els,opts,opts.rev?-1:1);});
        if (opts.prev)
            $(opts.prev).unbind('click.cycle').bind('click.cycle', function(){return advance(els,opts,opts.rev?1:-1);});

        if (opts.timeout)
            this.cycleTimeout = setTimeout(function() {
                go(els,opts,0,!opts.rev);
            }, opts.timeout + (opts.delay||0));
    });
};

function go(els, opts, manual, fwd) {
    if (opts.busy) 
        return;
    var p = els[0].parentNode, curr = els[opts.currSlide], next = els[opts.nextSlide];
    if (p.cycleTimeout === 0 && !manual) 
        return;

    if (manual || !p.cyclePause) {
        if (opts.before.length)
            $.each(opts.before, function(i,o) { o.apply(next, [curr, next, opts, fwd]); });
        var after = function() {
            if (msie)
                this.style.removeAttribute('filter');
            $.each(opts.after, function(i,o) { o.apply(next, [curr, next, opts, fwd]); });
            queueNext(opts);
        };

        if (opts.nextSlide != opts.currSlide) {
            opts.busy = 1;
            $.fn.cycle.custom(curr, next, opts, after);
        }
        var roll = (opts.nextSlide + 1) == els.length;
        opts.nextSlide = roll ? 0 : opts.nextSlide+1;
        opts.currSlide = roll ? els.length-1 : opts.nextSlide-1;
    } else {
      queueNext(opts);
    }

    function queueNext(opts) {
        if (opts.timeout)
            p.cycleTimeout = setTimeout(function() { go(els,opts,0,!opts.rev); }, opts.timeout);
    }
}

// advance slide forward or back
function advance(els, opts, val) {
    var p = els[0].parentNode, timeout = p.cycleTimeout;
    if (timeout) {
        clearTimeout(timeout);
        p.cycleTimeout = 0;
    }
    opts.nextSlide = opts.currSlide + val;
    if (opts.nextSlide < 0) {
        opts.nextSlide = els.length - 1;
    }
    else if (opts.nextSlide >= els.length) {
        opts.nextSlide = 0;
    }
    go(els, opts, 1, val>=0);
    return false;
}

$.fn.cycle.custom = function(curr, next, opts, cb) {
    var $l = $(curr), $n = $(next);
    $n.css(opts.cssBefore);
    var fn = function() {$n.animate(opts.animIn, opts.speedIn, opts.easeIn, cb);};
    $l.animate(opts.animOut, opts.speedOut, opts.easeOut, function() {
        $l.css(opts.cssAfter);
        if (!opts.sync)
            fn();
    });
    if (opts.sync)
        fn();
};

$.fn.cycle.transitions = {
    fade: function($cont, $slides, opts) {
        $slides.not(':eq(0)').hide();
        opts.cssBefore = { opacity: 0, display: 'block' };
        opts.cssAfter  = { display: 'none' };
        opts.animOut = { opacity: 0 };
        opts.animIn = { opacity: 1 };
    },
    fadeout: function($cont, $slides, opts) {
        opts.before.push(function(curr,next,opts,fwd) {
            $(curr).css('zIndex',opts.slideCount + (fwd === true ? 1 : 0));
            $(next).css('zIndex',opts.slideCount + (fwd === true ? 0 : 1));
        });
        $slides.not(':eq(0)').hide();
        opts.cssBefore = { opacity: 1, display: 'block', zIndex: 1 };
        opts.cssAfter  = { display: 'none', zIndex: 0 };
        opts.animOut = { opacity: 0 };
        opts.animIn = { opacity: 1 };
    }
};

$.fn.cycle.ver = function() { return ver; };

// @see: http://malsup.com/jquery/cycle/lite/
$.fn.cycle.defaults = {
    animIn:        {},
    animOut:       {},
    fx:           'fade',
    after:         null,
    before:        null,
    cssBefore:     {},
    cssAfter:      {},
    delay:         0,
    fit:           0,
    height:       'auto',
    metaAttr:     'cycle',
    next:          null,
    pause:         false,
    prev:          null,
    speed:         1000,
    slideExpr:     null,
    sync:          true,
    timeout:       4000
};

})(jQuery);


/*
* EASYDROPDOWN - A Drop-down Builder for Styleable Inputs and Menus
* Version: 2.1.4
* License: Creative Commons Attribution 3.0 Unported - CC BY 3.0
* http://creativecommons.org/licenses/by/3.0/
* This software may be used freely on commercial and non-commercial projects with attribution to the author/copyright holder.
* Author: Patrick Kunka
* Copyright 2013 Patrick Kunka, All Rights Reserved
*/


(function($){
    
    function EasyDropDown(){
        this.isField = true,
        this.down = false,
        this.inFocus = false,
        this.disabled = false,
        this.cutOff = false,
        this.hasLabel = false,
        this.keyboardMode = false,
        this.nativeTouch = true,
        this.wrapperClass = 'dropdown',
        this.onChange = null;
    };
    
    EasyDropDown.prototype = {
        constructor: EasyDropDown,
        instances: {},
        init: function(domNode, settings){
            var self = this;
            
            $.extend(self, settings);
            self.$select = $(domNode);
            self.id = domNode.id;
            self.options = [];
            self.$options = self.$select.find('option');
            self.isTouch = 'ontouchend' in document;
            self.$select.removeClass(self.wrapperClass+' dropdown');
            if(self.$select.is(':disabled')){
                self.disabled = true;
            };
            if(self.$options.length){
                self.$options.each(function(i){
                    var $option = $(this);
                    if($option.is(':selected')){
                        self.selected = {
                            index: i,
                            title: $option.text()
                        }
                        self.focusIndex = i;
                    };
                    if($option.hasClass('label') && i == 0){
                        self.hasLabel = true;
                        self.label = $option.text();
                        $option.attr('value','');
                    } else {
                        self.options.push({
                            domNode: $option[0],
                            title: $option.text(),
                            value: $option.val(),
                            selected: $option.is(':selected')
                        });
                    };
                });
                if(!self.selected){
                    self.selected = {
                        index: 0,
                        title: self.$options.eq(0).text()
                    }
                    self.focusIndex = 0;
                };
                self.render();
            };
        },
    
        render: function(){
            var self = this,
                touchClass = self.isTouch && self.nativeTouch ? ' touch' : '',
                disabledClass = self.disabled ? ' disabled' : '';
            
            self.$container = self.$select.wrap('<div class="'+self.wrapperClass+touchClass+disabledClass+'"><span class="old"/></div>').parent().parent();
            self.$active = $('<span class="selected">'+self.selected.title+'</span>').appendTo(self.$container);
            self.$carat = $('<span class="carat"/>').appendTo(self.$container);
            self.$scrollWrapper = $('<div><ul/></div>').appendTo(self.$container);
            self.$dropDown = self.$scrollWrapper.find('ul');
            self.$form = self.$container.closest('form');
            $.each(self.options, function(){
                var option = this,
                    active = option.selected ? ' class="active"':'';
                self.$dropDown.append('<li'+active+'>'+option.title+'</li>');
            });
            self.$items = self.$dropDown.find('li');
            
            if(self.cutOff && self.$items.length > self.cutOff)self.$container.addClass('scrollable');
            
            self.getMaxHeight();
    
            if(self.isTouch && self.nativeTouch){
                self.bindTouchHandlers();
            } else {
                self.bindHandlers();
            };
        },
        
        getMaxHeight: function(){
            var self = this;
            
            self.maxHeight = 0;
            
            for(i = 0; i < self.$items.length; i++){
                var $item = self.$items.eq(i);
                self.maxHeight += $item.outerHeight();
                if(self.cutOff == i+1){
                    break;
                };
            };
        },
        
        bindTouchHandlers: function(){
            var self = this;
            self.$container.on('click.easyDropDown',function(){
                self.$select.focus();
            });
            self.$select.on({
                change: function(){
                    var $selected = $(this).find('option:selected'),
                        title = $selected.text(),
                        value = $selected.val();
                        
                    self.$active.text(title);
                    if(typeof self.onChange === 'function'){
                        self.onChange.call(self.$select[0],{
                            title: title, 
                            value: value
                        });
                    };
                },
                focus: function(){
                    self.$container.addClass('focus');
                },
                blur: function(){
                    self.$container.removeClass('focus');
                }
            });
        },
    
        bindHandlers: function(){
            var self = this;
            self.query = '';
            self.$container.on({
                'click.easyDropDown': function(){
                    if(!self.down && !self.disabled){
                        self.open();
                    } else {
                        self.close();
                    };
                },
                'mousemove.easyDropDown': function(){
                    if(self.keyboardMode){
                        self.keyboardMode = false;
                    };
                }
            });
            
            $('body').on('click.easyDropDown.'+self.id,function(e){
                var $target = $(e.target),
                    classNames = self.wrapperClass.split(' ').join('.');

                if(!$target.closest('.'+classNames).length && self.down){
                    self.close();
                };
            });

            self.$items.on({
                'click.easyDropDown': function(){
                    var index = $(this).index();
                    self.select(index);
                    self.$select.focus();
                },
                'mouseover.easyDropDown': function(){
                    if(!self.keyboardMode){
                        var $t = $(this);
                        $t.addClass('focus').siblings().removeClass('focus');
                        self.focusIndex = $t.index();
                    };
                },
                'mouseout.easyDropDown': function(){
                    if(!self.keyboardMode){
                        $(this).removeClass('focus');
                    };
                }
            });

            self.$select.on({
                'focus.easyDropDown': function(){
                    self.$container.addClass('focus');
                    self.inFocus = true;
                },
                'blur.easyDropDown': function(){
                    self.$container.removeClass('focus');
                    self.inFocus = false;
                },
                'keydown.easyDropDown': function(e){
                    if(self.inFocus){
                        self.keyboardMode = true;
                        var key = e.keyCode;

                        if(key == 38 || key == 40 || key == 32){
                            e.preventDefault();
                            if(key == 38){
                                self.focusIndex--
                                self.focusIndex = self.focusIndex < 0 ? self.$items.length - 1 : self.focusIndex;
                            } else if(key == 40){
                                self.focusIndex++
                                self.focusIndex = self.focusIndex > self.$items.length - 1 ? 0 : self.focusIndex;
                            };
                            if(!self.down){
                                self.open();
                            };
                            self.$items.removeClass('focus').eq(self.focusIndex).addClass('focus');
                            if(self.cutOff){
                                self.scrollToView();
                            };
                            self.query = '';
                        };
                        if(self.down){
                            if(key == 9 || key == 27){
                                self.close();
                            } else if(key == 13){
                                e.preventDefault();
                                self.select(self.focusIndex);
                                self.close();
                                return false;
                            } else if(key == 8){
                                e.preventDefault();
                                self.query = self.query.slice(0,-1);
                                self.search();
                                clearTimeout(self.resetQuery);
                                return false;
                            } else if(key != 38 && key != 40){
                                var letter = String.fromCharCode(key);
                                self.query += letter;
                                self.search();
                                clearTimeout(self.resetQuery);
                            };
                        };
                    };
                },
                'keyup.easyDropDown': function(){
                    self.resetQuery = setTimeout(function(){
                        self.query = '';
                    },1200);
                }
            });
            
            self.$dropDown.on('scroll.easyDropDown',function(e){
                if(self.$dropDown[0].scrollTop >= self.$dropDown[0].scrollHeight - self.maxHeight){
                    self.$container.addClass('bottom');
                } else {
                    self.$container.removeClass('bottom');
                };
            });
            
            if(self.$form.length){
                self.$form.on('reset.easyDropDown', function(){
                    var active = self.hasLabel ? self.label : self.options[0].title;
                    self.$active.text(active);
                });
            };
        },
        
        unbindHandlers: function(){
            var self = this;
            
            self.$container
                .add(self.$select)
                .add(self.$items)
                .add(self.$form)
                .add(self.$dropDown)
                .off('.easyDropDown');
            $('body').off('.'+self.id);
        },
        
        open: function(){
            var self = this,
                scrollTop = window.scrollY || document.documentElement.scrollTop,
                scrollLeft = window.scrollX || document.documentElement.scrollLeft,
                scrollOffset = self.notInViewport(scrollTop);

            self.closeAll();
            self.getMaxHeight();
            self.$select.focus();
            window.scrollTo(scrollLeft, scrollTop+scrollOffset);
            self.$container.addClass('open');
            self.$scrollWrapper.css('height',self.maxHeight+'px');
            self.down = true;
        },
        
        close: function(){
            var self = this;
            self.$container.removeClass('open');
            self.$scrollWrapper.css('height','0px');
            self.focusIndex = self.selected.index;
            self.query = '';
            self.down = false;
        },
        
        closeAll: function(){
            var self = this,
                instances = Object.getPrototypeOf(self).instances;
            for(var key in instances){
                var instance = instances[key];
                instance.close();
            };
        },
    
        select: function(index){
            var self = this;
            
            if(typeof index === 'string'){
                index = self.$select.find('option[value='+index+']').index() - 1;
            };
            
            var option = self.options[index],
                selectIndex = self.hasLabel ? index + 1 : index;
            self.$items.removeClass('active').eq(index).addClass('active');
            self.$active.text(option.title);
            self.$select
                .find('option')
                .removeAttr('selected')
                .eq(selectIndex)
                .prop('selected',true)
                .parent()
                .trigger('change');
                
            self.selected = {
                index: index,
                title: option.title
            };
            self.focusIndex = i;
            if(typeof self.onChange === 'function'){
                self.onChange.call(self.$select[0],{
                    title: option.title, 
                    value: option.value
                });
            };
        },
        
        search: function(){
            var self = this,
                lock = function(i){
                    self.focusIndex = i;
                    self.$items.removeClass('focus').eq(self.focusIndex).addClass('focus');
                    self.scrollToView();    
                },
                getTitle = function(i){
                    return self.options[i].title.toUpperCase();
                };
                
            for(i = 0; i < self.options.length; i++){
                var title = getTitle(i);
                if(title.indexOf(self.query) == 0){
                    lock(i);
                    return;
                };
            };
            
            for(i = 0; i < self.options.length; i++){
                var title = getTitle(i);
                if(title.indexOf(self.query) > -1){
                    lock(i);
                    break;
                };
            };
        },
        
        scrollToView: function(){
            var self = this;
            if(self.focusIndex >= self.cutOff){
                var $focusItem = self.$items.eq(self.focusIndex),
                    scroll = ($focusItem.outerHeight() * (self.focusIndex + 1)) - self.maxHeight;
            
                self.$dropDown.scrollTop(scroll);
            };
        },
        
        notInViewport: function(scrollTop){
            var self = this,
                range = {
                    min: scrollTop,
                    max: scrollTop + (window.innerHeight || document.documentElement.clientHeight)
                },
                menuBottom = self.$dropDown.offset().top + self.maxHeight;
                
            if(menuBottom >= range.min && menuBottom <= range.max){
                return 0;
            } else {
                return (menuBottom - range.max) + 5;
            };
        },
        
        destroy: function(){
            var self = this;
            self.unbindHandlers();
            self.$select.unwrap().siblings().remove();
            self.$select.unwrap();
            delete Object.getPrototypeOf(self).instances[self.$select[0].id];
        },
        
        disable: function(){
            var self = this;
            self.disabled = true;
            self.$container.addClass('disabled');
            self.$select.attr('disabled',true);
            if(!self.down)self.close();
        },
        
        enable: function(){
            var self = this;
            self.disabled = false;
            self.$container.removeClass('disabled');
            self.$select.attr('disabled',false);
        }
    };
    
    var instantiate = function(domNode, settings){
            domNode.id = !domNode.id ? 'EasyDropDown'+rand() : domNode.id;
            var instance = new EasyDropDown();
            if(!instance.instances[domNode.id]){
                instance.instances[domNode.id] = instance;
                instance.init(domNode, settings);
            };
        },
        rand = function(){
            return ('00000'+(Math.random()*16777216<<0).toString(16)).substr(-6).toUpperCase();
        };
    
    $.fn.easyDropDown = function(){
        var args = arguments,
            dataReturn = [],
            eachReturn;
            
        eachReturn = this.each(function(){
            if(args && typeof args[0] === 'string'){
                var data = EasyDropDown.prototype.instances[this.id][args[0]](args[1], args[2]);
                if(data)dataReturn.push(data);
            } else {
                instantiate(this, args[0]);
            };
        });
        
        if(dataReturn.length){
            return dataReturn.length > 1 ? dataReturn : dataReturn[0];
        } else {
            return eachReturn;
        };
    };
    
    $(function(){
        if(typeof Object.getPrototypeOf !== 'function'){
            if(typeof 'test'.__proto__ === 'object'){
                Object.getPrototypeOf = function(object){
                    return object.__proto__;
                };
            } else {
                Object.getPrototypeOf = function(object){
                    return object.constructor.prototype;
                };
            };
        };
        
        $('select.dropdown').each(function(){
            var json = $(this).attr('data-settings');
                settings = json ? $.parseJSON(json) : {}; 
            instantiate(this, settings);
        });
    });
})(jQuery);
