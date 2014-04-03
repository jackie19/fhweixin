/**
 * Created by cgx on 14-3-1.
 */
    //confirm
$.mobileConfirm = function (options) {
    var opts = $.extend({ }, $.mobileConfirm.defaults, options),
        htmlTpl = '<div class="ui-mask" data-role="footer" date-position="fixed"></div>' +
            '<div class="ui-confirm ui-transition" data-role="footer" date-position="fixed">' +
            '<header class="ui-confirm-header"> ' +
            '<div class="ui-title"></div>' +
            '</header>' +
            '<div class="ui-confirm-content"></div>' +
            '<footer class="ui-confirm-footer ui-confirm-btngroup ui-grid">' +
            '<a class="ui-btn ui-block cancel" > <span class="ui-btn-inner"> <span class="ui-btn-txt">取消</span></span></a>' +
            '<a class="ui-btn ui-block ok"> <span class="ui-btn-inner"> <span class="ui-btn-txt">确定</span></span></a>' +
            '</footer>' +
            '</div>';

    function Confirm() {
        var _this = this;

        //初始化事件
        this.init = function () {
            //todo 确认唯一性
            //弹出窗口,
            var $self = $(htmlTpl);
            $(opts.appendTo).append($self);

            _this.mask = $('.ui-mask', opts.appendTo);
            _this.confirm = $('.ui-confirm', opts.appendTo);
            _this.btn = $('.ui-btn', $self);
            _this.content = $('.ui-confirm-content', $self);
            _this.header = $('.ui-confirm-header', $self);
            _this.footer = $('.ui-confirm-footer', $self);
            if (!opts.title) {
                _this.header.hide();
            } else {
                $('.ui-title', _this.header).text(opts.title);
            }
            if (!opts.footer) {
                _this.footer.hide();
            }
//                set content
            if ($.isFunction(opts.content)) {
                opts.content.call(_this);
            } else {
                _this.content.append(opts.content);
            }

            //重置位置
            var marginTop = -(_this.confirm.height() / 2);
            _this.confirm.css('marginTop', marginTop);
            //bind btn
            _this.btn.bind('click', function () {
                if ($(this).hasClass('ok')) {
                    _this.result = true;
                } else {
                    _this.result = false;
                }
                if (opts.callback) {
                    opts.callback.call(_this);
                }

                this.stopPropagation;
                this.preventDefault;
                _this.destroy();
                return false;
            });
            if( ! options.abletouchmove ){
                document.addEventListener('touchmove', _this.handle, false);
            }
        }
        this.init();
    }

    $.extend(Confirm.prototype, {
        destroy:function () {
            this.btn.unbind();
            this.mask.fadeOut(201, function () {
                $(this).remove();
            });
            this.confirm.remove();
            document.removeEventListener('touchmove', this.handle, false);
        },
        handle :function (event) {
            event.preventDefault();
//                document.body.style.overflowY = document.body.style.overflowX = 'hidden';
        }
    });

    return new Confirm();
};
$.mobileConfirm.defaults = {
    appendTo     :'body', //String
    title        :null, //String
    footer       :true,
    abletouchmove:false,
    content      :null, //Function | String | DOM element
//        cancelBtnTxt:'取消',
//        okBtnTxt:'确定',
    callback     :null //Function
};

    //DatePicker
$.mobileDatePicker = function (options) {
    var htmlTpl = '<ul class="ui-date-top ui-grid">\
                <li class="ui-date-li ui-block">年</li>\
                <li class="ui-date-li ui-block">月</li>\
                <li class="ui-date-li ui-block">日</li>\
                <li class="ui-date-li ui-block" id="txt-hour">时</li>\
                <li class="ui-date-li ui-block" id="txt-min">分</li>\
                </ul>\
                <div class="ui-datepicker ui-grid">\
                    <div class="ui-date-selectbox ui-block">\
                        <ul class="ui-date-list" id="year"> </ul>\
                    </div>\
                    <div class="ui-date-selectbox ui-block">\
                        <ul class="ui-date-list" id="month"></ul>\
                    </div>\
                    <div class="ui-date-selectbox ui-block">\
                        <ul class="ui-date-list" id="day"></ul>\
                    </div>\
                    <div class="ui-date-selectbox ui-block" id="hour">\
                        <ul class="ui-date-list"></ul>\
                    </div>\
                    <div class="ui-date-selectbox ui-block" id="minute">\
                        <ul class="ui-date-list"></ul>\
                    </div>\
                </div>',
        opts = $.extend({html:htmlTpl}, $.mobileDatePicker.defaults, options);

    function Datepicker(options) {
        var _this = this;
        _this.options = options;
        if (options.onBeforeCreate) {
//                options.onBeforeCreate(_this);
            options.onBeforeCreate.call(_this);
        }


        var arr_id = [],
            arr_mday = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            _defaultTime = [],
            obj_date;

        var year = document.getElementById(options.yearId),
            month = document.getElementById(options.monthId),
            day = document.getElementById(options.dayId),
            hour = document.getElementById(options.hourId),
            minute = document.getElementById(options.minuteId);

        arr_id.push(year, month, day);

        if(options.hasHour){
            arr_id.push(hour);
        } else{
            $('#hour').hide();
            $('#txt-hour').hide();
        }
        if(options.hasMinute){
            arr_id.push(minute);
        } else{
            $('#minute').hide();
            $('#txt-min').hide();
        }

        var boxHeight = $(year).closest('.ui-date-selectbox').height(), //容器高
            itemHeight = Math.floor(boxHeight / 3);//数字高

        document.documentElement.style.webkitUserSelect = 'none';
        //插入 li
        function AppendHtml(from, to, appendTo) {
            appendTo.innerHTML = '';
            var i,
                li,
                html = '';
            for (i = from; i <= to; i++) {
                li = document.createElement("li");
                li.className = 'ui-date-li';
                if (i < 10) {
                    i = '0' + i;
                }
                li.innerHTML = i;
                html += li.outerHTML;
            }
            appendTo.innerHTML = html;
        }

        //获取当月天数
        function GetMDay(year, month) {
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                arr_mday[1] = 29;
            } else {
                arr_mday[1] = 28;
            }
            return arr_mday[month - 1];
        }

        function ToString(str) {
            return str < 10 ? '0' + str : str.toString();
        }

        //todo 增加格式
        var DateFormat = {};
        $.extend(DateFormat, {
            init:function (formatString, dateObj) {
                this._str = formatString;
                this._date = dateObj ? dateObj : new Date();
                return this;
            },
            Y   :function () {
                return ToString(this._date.getFullYear());
            },
            m   :function () {
                return ToString(this._date.getMonth() + 1);
            },
            d   :function () {
                return ToString(this._date.getDate());
            },
            H   :function () {
                return ToString(this._date.getHours());
            },
            i   :function () {
                return ToString(this._date.getMinutes());
            },
            _get:function (match) {
                return DateFormat[match]();
            },
            get :function () { //return  string of date
                return this._str.replace(/\b(\w+)\b/g, this._get);
            }
        });
        var SetDate = {};
        $.extend(SetDate, {
            init  :function () {
                this._date = new Date();
                return this;
            },
            year  :function (newYear) {
                this._date.setFullYear(newYear);
            },
            month :function (newMonth) {
                var val = newMonth - 1;
                this._date.setMonth(val);
            },
            day   :function (newDay) {
                this._date.setDate(newDay);
            },
            hour  :function (newHour) {
                this._date.setHours(newHour);
            },
            minute:function (newMinute) {
                this._date.setMinutes(newMinute);
            },
            get   :function () {
                return this._date;
            }
        });
        this._pushDefault = function (match) {
            _defaultTime.push(match);
        };
        this.getNewDate = function () {
            return SetDate.get();
        }
        this.init = function () {
            _this.html = options.html;

            if (typeof options.setDate == "object") {
//                    DateFormat.init(options.format, options.setDate); // 'Y/m/d H:i' , Date Object
                this.date = DateFormat.init(options.format, options.setDate).get();  //this.date = "2013/04/15 10:41";
            } else if (typeof options.setDate == "string") {
                this.date = options.setDate //this.date = "2013/04/15 10:41";
            }
            SetDate.init();

            this.date.replace(/\b(\w+)\b/g, _this._pushDefault);

            for (var i = 0; i < arr_id.length; i++) {
                defaulTime = _defaultTime[i];

                arr_id[i].dataset.v = defaulTime;
                SetDate[arr_id[i].id](defaulTime);

                switch (arr_id[i].id) {
                    case options.yearId:
                        AppendHtml(options.yearRange[0], options.yearRange[1], year);
                        break;
                    case options.monthId:
                        AppendHtml(1, 12, month);
                        break;
                    case options.dayId:
                        AppendHtml(1, GetMDay(year.dataset.v, month.dataset.v), day);
                        break;
                    case options.hourId:
                        AppendHtml(0, 24, hour);
                        break;
                    case options.minuteId:
                        AppendHtml(0, 59, minute);
                        break;
                }
                _this[arr_id[i].id] = new iScroll($(arr_id[i]).parent()[0], {
                    hScrollbar         :false,
                    vScrollbar         :false,
                    hScroll            :false,
                    onBeforeScrollStart:function () { //onBeforeScrollStart  onBeforeScrollMove
                        this.stop();
                        return false;
                        var _tthis = this;
                        var end = function () {
                            if (_tthis.distY != undefined) {
//                                    _tthis.distY = undefined;
                                var scrollTo = _tthis.scroller.dataset.v;
                                var scrollTo1 = _this.getNewDate();
                                console.log(scrollTo);
                                console.log(scrollTo1);
                                return;
                                $.each($('.ui-date-li', _tthis.scroller), function (idx, v) {
                                    if (scrollTo == v) {
                                        scrollTo *= itemHeight;
                                    }
                                });
                                _this[_tthis.scroller.id].scrollTo(0, -parseInt(scrollTo), 20, false);
                                console.log(scrollTo);
                            }
                        }
                        setTimeout(end, 500);
                    },
                    onScrollMove       :function () {
                        $('li', this.scroller).removeClass('ui-active');
                    },
                    onScrollEnd        :function () {

                        if (this.distY != undefined) {
                            var current,
                                currentElement,
                                $ui_list = $(this.scroller),
                                top = parseInt(this.y),
                                itemSize;

                            if (this.distY > 0) { //由上向下滚动
                                itemSize = Math.ceil(top / itemHeight);
                                if (Math.abs(top % itemHeight) > itemHeight / 4 && top < 0) {
                                    itemSize -= 1;
                                }
                            } else {//由下向上滚动
                                itemSize = parseInt(top / itemHeight);
                                if (Math.abs(top % itemHeight) > itemHeight / 4 && itemSize * itemHeight > this.maxScrollY) {
                                    itemSize -= 1;
                                }
                            }

                            top = itemSize * itemHeight > 0 ? 0 : itemSize * itemHeight;

                            current = ( top > 0 ? 0 : Math.ceil(Math.abs(top / itemHeight)));
                            currentElement = $('.ui-date-li', $ui_list).get(current);
                            $(currentElement).addClass('ui-active');

                            this.scroller.dataset.v = currentElement.innerHTML;
                            SetDate[this.scroller.id](this.scroller.dataset.v);

                            this.distY = undefined;
                            _this[this.scroller.id].scrollTo(0, top, 110, false);

                            if (this.scroller.id == options.monthId || this.scroller.id == options.yearId) {
                                var tempDay = day.dataset.v,
                                    index,
                                    scrollTo,
                                    day_index;
                                AppendHtml(1, GetMDay(year.dataset.v, month.dataset.v), day);
                                $('.ui-date-li', day).each(function (idx, v) {
                                    if (this.innerHTML == tempDay) {
                                        index = idx;
                                    }
                                });
                                if (_this['day']) {
                                    _this['day'].refresh();
                                    day_index = GetMDay(year.dataset.v || '', month.dataset.v || '') - 1;
                                    scrollTo = -parseInt(( index || day_index ) * itemHeight);
                                    _this['day'].scrollTo(0, scrollTo);
                                    $($('.ui-date-li', day)[index || day_index]).addClass('ui-active');
                                    SetDate.day($('.ui-date-li', day)[index || day_index].innerHTML);
                                    day.dataset.v = $('.ui-date-li', day)[index || day_index].innerHTML;
                                }
                                SetDate[this.scroller.id](this.scroller.dataset.v);
                            }
                            _this.date = DateFormat.init(options.format, _this.getNewDate()).get();  //this.date = "2013/04/15 10:41";
                            if (options.onChange) {
                            }
                        }
                    }
                });

                $('.ui-date-li', arr_id[i]).each(function (index, v) {
                    if (this.innerHTML == defaulTime) {
                        $(this).addClass('ui-active');
                        var to = -parseInt($(this).index() * itemHeight);
                        _this[arr_id[i].id].scrollTo(0, to, 1, false);
                    }
                });
            }
        };
        this.init();

    }

    $.extend(Datepicker.prototype, {
        destroy:function () {

        }
    });
    new Datepicker(opts);
};
$.mobileDatePicker.defaults = {
    yearId        :'year', //DOM id
    monthId       :'month',
    dayId         :'day',
    hourId        :'hour',
    minuteId      :'minute',
    setDate       :new Date(),
    format        :'Y/m/d H:i',
    yearRange     :[2013, 2040], //年范围
    onBeforeCreate:null,
    onChange      :null
}


$.fn.autogrow = function (options) {
    var opts = $.extend({}, options);

    return this.each(function () {
        var o = $.extend({}, opts);
//            var input = $('.ui-textarea');
        var input = $(this),
            self = this;
        var extraLineHeight = 15,
            keyupTimeoutBuffer = 100,
            keyupTimeout;

        this._keyup = function () {
            var scrollHeight = input[ 0 ].scrollHeight,
                clientHeight = input[ 0 ].clientHeight;

            if (clientHeight < scrollHeight) {
                input.height(scrollHeight + extraLineHeight);
//                    if (o.callback) o.callback.call(self);
                window.scrollTo(0, 9999);
            }
        };

        this._on = function(){
            clearTimeout(keyupTimeout);
            keyupTimeout = setTimeout(self._keyup, keyupTimeoutBuffer);
        };
        if (o.callback) o.callback.call(self);
        input.bind("keyup change input paste", this._on);
    })
};
$.fn.inputNumber = function (opts) {

    return this.each(function () {
        var o = $.extend({
            input  : 'input',
            proUp  : '.up', //增加按钮
            proDown: '.down', //减少按钮
            max    : 99999, //最大值
            min    : 1,  //最小值
            grid   : 1, //步进
            speed  : 150 //按住后增加（减少）的速度
        }, opts || {});

        var _this = this , t;
        console.log($(o.proUp, _this));

        _this.changeValue = function (type) {
            if (!$(o.input, _this).val()) {
                $(o.input, _this).val(o.min);
            }
            switch (type) {
                case 'add':
                    $(o.input, _this).val(function (index, value) {
                        return parseInt(value) + parseInt(o.grid);
                    });
                    break;
                case 'subtract':
                    $(o.input, _this).val(function (index, value) {
                        return parseInt(value) - parseInt(o.grid);
                    });

                    break;
            }
            _this.check();
        };
        _this.check = function () {
            var _val = parseInt($(o.input, _this).val().replace(/[^\d]/g, ''));
            $(o.input, _this).val(_val);
            if (typeof(_val) != 'number' || _val < o.min || !_val) {
                $(o.input, _this).val(o.min);
            }
            if (_val > o.max) {
                $(o.input, _this).val(o.max);
            }
        };
        $(o.proUp, _this).mouseup(function () {
            _this.check();
            clearTimeout(t);
            _this.changeValue('add');
            return false;
        });
        $(o.proUp, _this).mousedown(function () {
            var add = function () {
                _this.check();
                _this.changeValue('add');
                t = setTimeout(add, o.speed);
            };
            t = setTimeout(add, 250);
            return false;
        });
        $(o.proDown, _this).mouseup(function () {
            clearTimeout(t);
            _this.check();
            _this.changeValue('subtract');
            return false;
        });
        $(o.proDown, _this).mousedown(function () {
            var subtract = function () {
                _this.check();
                _this.changeValue('subtract');
                t = setTimeout(subtract, o.speed);
            };
            t = setTimeout(subtract, 250);
            return false;
        });

        $(o.input, _this).blur(function () {
            _this.check();
        });
//    $(o.input,_this).mousewheel(function(e,d){
//        $(this).focus();
//        if(d > 0){
//            _this.changeValue('add');
//        } else {
//            _this.changeValue('subtract');
//        }
//        return false;
//    });
        _this.arr = [];
        _this.arr.push($(o.input).val());
        _this.getValue = function () {
            return _this.arr;
        };
        return this;
    });
};

function slider() {
    $('.scroll_position_bg').css({
        width:$('#scroll_position').width()
    });

    var slider = Swipe(document.getElementById('scroll_img'), {
        auto : 3000,
        continuous : true,
        callback : function(pos) {
            var i = bullets.length;
            while (i--) {
                bullets[i].className = ' ';
            }
            bullets[pos].className = 'on';
        }
    });
    var bullets = document.getElementById('scroll_position').getElementsByTagName('li');
}


$(function () {

    if($('.scroll_position_bg')[0]){
        slider();
    }

    $('.input_step').inputNumber({ });
    $('.textarea').autogrow({ });

    $('.footer').delegate('a','click',function(event){
        var parent = $(this).parent();
        if(parent.index() == 3){
            history.go(-1);
            return false;
        } else {
//        	event.stopPropagation();
//        	event.preventDefault();
        }
    });



    //日历组件
    $('#date-picker').bind('click touchstart',function (event) {
        event.preventDefault();
        var input = $('.yellow',this)[0];
        var value;
        var datePicker;
//        $(input).blur();
//        弹出 Confirm
        $.mobileConfirm({
            content :function () { //填充 confirm content 的内容并绑定事件
                var dt = this; //get Confirm
                //时间选择插件
                $.mobileDatePicker({
                    setDate       :input.innerHTML || new Date(),
                    format        :'Y-m-d ',
                    onBeforeCreate:function () {
                        datePicker = this;
                        dt.content.html(this.options.html); //set Confirm content Dom
                    },
                    onChange      :function () {
                        value = this.date;
//                        console.log('this.date is ===' + this.date);
//                        console.log('month is ===' + datePicker.getNewDate().getMonth());
                    }
                });
            },
            callback:function () {

                if(this.result){
                    input.innerHTML = value || datePicker.date;
//                    console.log(datePicker.getNewDate().getMonth());
                }
                datePicker.destroy();
            }
        })
    })

});
