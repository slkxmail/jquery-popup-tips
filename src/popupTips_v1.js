/**
 * jQuery Window Plugin v.1
 *
 * Copyright (c) 2011 Zapp-East llc.
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * @copyright 2011 Zapp-East llc.
 * @author Киселев Ярослав <slkxmail@gmail.com> main contributor and maintainer
 * @since 5 december 2011
 */

/**
 * @todo
 *
 * Добавить слой подложку под подсказку перекрывающий всю странику
 *
 */
(function($) {

    $.popupTips =function(settingsList)
    {
        if ( !$.isEmptyObject(settingsList)) {
            this.init(settingsList);
        }
    }

    $.popupTips.prototype = {

        init: function (settingsList) {

            //console.log(settingsList);
            if ( !$.isEmptyObject(settingsList) && !$.isEmptyObject(settingsList.tips)) {

                this.eventList = settingsList.tips;

            }

            //this.eventList = eventList;
            //this.layout = this;
            //this.settings    = $.extend(true, {}, $.jqWindow.defaults, options);

            this.settings = {
                popupLayoutClass: 'popup_tips_layout',  // Класс шаблона
                closeButtonClass: 'popup_tips_close',   // Класс кнопки закрыть

                onBeforShow     : function() { return true; },
                onAfterShow     : function() { return true; },
                onBeforClose     : function() { return true; },
                onAfterClose     : function() { return true; },

                singleton: true,
                linked: 'window',
                width           : 300,                 // Ширина окна подсказки
                height          : 50                   // Высота окна подсказки
            }

            if ( !$.isEmptyObject(settingsList) && !$.isEmptyObject(settingsList.tips)) {
                $.extend( this.settings, settingsList.settings );
            }

            if ($.isArray(this.eventList)) {
                this.parseTipList(this.eventList);
            }
        },

        // Загрузить события из JSON 
        loadFromJson: function (jsonString) {
            var settingObj = jQuery.parseJSON(jsonString);
            //console.log(settingObj);
            this.init(settingObj);
        },

        parseTipList: function(eventList) {
            var popupTips = this;

            if ($.isArray(eventList)) {
                $.each(eventList, function(index, value){
                    //popupTips.create(this);

                    // Если подсказа отображается по событию
                    if (this.showType == 'event' || this.showType == 'time') {
                        popupTips.create(this);
                    } else if(this.showType == 'now') {
                        popupTips.show(this);
                    }

                });
            }
        },

        // Создать событи появление подсказки
        create: function (tipObj) {
            var popupTips = this;
            var tip = {};

            $.extend(tip, this.settings, tipObj);
            console.log(tip.left);
            if(tip.showType == 'event') {
                $(tip.eventObject).bind(tip.event, function(e) {

                    popupTips.show(tip, e);
                    if (tip.singleton) {
                        // Удалить событие запускающее текущую подсказку
                        $(tip.eventObject).unbind(tip.event)
                    }
                });
            } else if(tip.showType == 'time') {

                     setTimeout(function(){
                        popupTips.show(tip);
                        //$(tip.eventObject).unbind('unload')

                    }, tip.timeDelay * 1000);

            }

        },

        // Закрыть подсказку
        close: function(layout, tip){
            var popupTips = this;
            tip.onBeforClose();

            layout.remove();
            if (!$.isEmptyObject(tip.mask)) {
                this.expose.remove();
            }

            if ($.isArray(tip.childs)) {
                popupTips.parseTipList(tip.childs);
            }
            tip.isShow = false;
            tip.onAfterClose();
        },

        // Показать подсказку
        show: function(tip, event){
            if (tip.isShow) {
                return;
            }
            var layout = this.layout;
            var popupTips = this;
            var w = $(window);

            var top     = tip.top,
                left    = tip.left,
                bottom  = tip.bottom,
                right   = tip.right;
            switch (tip.linked) {
                case 'cursor':
                    if (event.clientY >= (w.height() - tip.height)) {
                        top = w.height() - tip.height - 10;
                    } else {
                        top = event.clientY
                    }

                    if (event.clientX >= (w.width() - tip.width)) {
                        left = w.width() - tip.width - 10;
                    } else {
                        left = event.clientX
                    }
                    break;

                case 'object':
                    var oTop = $(tip.linkedObject).offset().top,
                        oLeft = $(tip.linkedObject).offset().left,
                        oWidth = $(tip.linkedObject).width(),
                        oHeight = $(tip.linkedObject).height();

                    if (typeof top == 'string') {
                        top = top == 'center' ? oTop + Math.max(oHeight/2, 0) : oTop - parseInt(top, 10);
                        console.log(top);
                    } else if (typeof top == 'number'){
                        top = oTop - top + Math.max(oHeight/2, 0);
                    } else if (typeof bottom == 'string') {
                        top = bottom == 'center' ? oTop + Math.max(oHeight/2, 0): oTop + parseInt(bottom, 10);
                    } else if(typeof bottom == 'number') {
                        top = oTop + bottom + Math.max(oHeight/2, 0);
                    }

                    if (typeof left == 'string') {
                        left = left == 'center' ? oLeft + Math.max(oWidth/2, 0) : oLeft - parseInt(left, 10);
                    } else if (typeof left == 'number'){
                        left = oLeft - left  + Math.max(oWidth/2, 0);
                    } else if (typeof right == 'string') {
                        left = right == 'center' ? oLeft + Math.max(oWidth/2, 0): oLeft + parseInt(right, 10);
                    } else if(typeof right == 'number') {
                        left = oLeft + right + Math.max(oWidth/2, 0);
                    }

                    console.log('object top=' + oTop + ', left=' + oLeft);
                    console.log('tip top=' + top + 'left=' + left );
                    break;

                case 'window':
                    if (typeof top == 'string') {
                        top = top == 'center' ? Math.max((w.height() - tip.height)/2, 0) : parseInt(top, 10) / 100 * w.height();
                    } else if (typeof top != 'number' && typeof bottom == 'string') {
                        top = bottom == 'center' ? Math.max((w.height() - tip.height)/2, 0): w.height() - parseInt(bottom, 10) / 100 * w.height() - tip.height;
                    } else if (typeof top != 'number' && typeof bottom == 'number'){
                        top =  w.height() - bottom - tip.height;
                    }

                    if (typeof left == 'string') {
                        left = left == 'center' ? Math.max((w.width() - tip.width)/2, 0) : parseInt(left, 10) /100 * w.width();
                    } else if(typeof left != 'number' && typeof right == 'string') {
                        left = right == 'center' ? Math.max((w.width() - tip.width)/2, 0) : w.width() - parseInt(right, 10) /100 * w.width() - tip.width;
                    } else if (typeof left != 'number' && typeof right == 'number') {
                        top =  w.width() - right - tip.width;
                    }
                    console.log('top=' + top + ', left=' + left);
                    break;
            }

            tip.onBeforShow();
            layout = $('<div></div>').addClass(popupTips.settings.popupLayoutClass)
                .appendTo($('body'))
                .html(tip.content);

            layout.css('width', tip.width)
                  .css('height', tip.height)
                  .css('position', 'absolute')
                  .css('top', top)
                  .css('left', left)
                  .css('z-index', 9999);

            if (!$.isEmptyObject(tip.mask)) {
                this.expose = $('<div id="exposeMask"></div>')
                    .css('width', w.width())
                    .css('height', w.height())
                    .css('position', 'absolute')
                    .css('top', 0)
                    .css('left', 0)
                    .css('background-color', tip.mask.color)
                    .css('opacity', tip.mask.opacity)
                    .css('z-index', 9998);

                layout.after(this.expose);
            }

            $('<div><a href="#"></a></div>').addClass(tip.closeButtonClass)
                .addClass('close')
                .appendTo(layout)
                .bind('click', function(){
                    popupTips.close(layout, tip);
                });
            tip.isShow = true;
            tip.onAfterShow();
        }


    };
})(jQuery);