var _layout_gridlist_params = {
    url: '',
    data: null,
    rowData: function (rowData, rowIndex, dataStore) { },
    rowElement: function (rowHtml, rowIndex, dataStore) { },
    complete: function (dataStore) { }
};

$.fn.foreachRg = /\<([a-z]+)\s+([^\<]*)foreach\=((\"([^\"]+)\")|(\'([^\']+)\'))/i;
$.fn.extend({
    showElement: function () {
        var dtM1 = $(this);
        var style1 = dtM1.attr('style');
        if (null == style1) return;
        style1 = style1.replace(/display\s*\:\s*none\s*\;/i, '');
        var s1 = style1.replace(/\s/g, '');
        if (0 == s1.length) {
            dtM1.attr('style', null);
        }
        else {
            dtM1.attr('style', style1);
        }
    },
    clearRenderDataArea: function (startSign, endSign) {
        var dataArea = $(this);
        var rgs = $.fn.foreachRg;
        var txt = dataArea[0].outerHTML;
        var arr = null;
        var tagN = '';
        var dtsTag = '';
        var st = '';

        txt += '';
        var n1 = txt.indexOf(startSign);
        var n2 = txt.indexOf(endSign);
        n2 += endSign.length;
        var s1 = txt.substring(n1, n2);
        txt = txt.replace(s1, '');

        arr = rgs.exec(txt);
        if (null == arr) return;

        var span1 = $('<span></span>');
        span1.insertBefore(dataArea);

        dataArea.remove();
        dataArea = $(txt);
        dataArea.insertBefore(span1);
        span1.remove();

        tagN = arr[1];
        dtsTag = arr[5];
        dtsTag = null == dtsTag ? arr[7] : dtsTag;

        if (null == tagN) return;
        if (null == dtsTag) return;

        st = tagN + '[foreach="' + dtsTag + '"]';
        var dtM1 = dataArea.find(st);
        dtM1.showElement();

        return txt;
    },
    gridlist: function (options) {
        var params = $.extend({}, _layout_gridlist_params, options);
        var sourceapi = $(this).attr('sourceapi');
        var dataArea = $(this);
        var txt = dataArea[0].outerHTML;

        var startSign = '<!--grid-list-foreach-start-->';
        var endSign = '<!--grid-list-foreach-end-->';

        var rgs = $.fn.foreachRg;
        var arr = null;
        var tagN = '';
        var dtsTag = '';
        var st = '';

        if (-1 != txt.indexOf(startSign)) {
            txt = dataArea.clearRenderDataArea(startSign, endSign);
        }

        arr = rgs.exec(txt);
        if (null == arr) return;

        tagN = arr[1];
        dtsTag = arr[5];
        dtsTag = null == dtsTag ? arr[7] : dtsTag;

        if (null == tagN) return;
        if (null == dtsTag) return;

        st = tagN + '[foreach="' + dtsTag + '"]';
        var dtM = dataArea.find(st);
        if (null == dtM[0]) return;

        dtM.showElement();
        var dtms = dtM[0].outerHTML;
        dtM.css({ 'display': 'none' });
        ExtAjax.prototype.options.complete();

        dataArea[0].setValueByField = function (fn, fv) {
            var fn1 = fn.replace('$', '\\$');
            var txt = this + '';
            var s = '\\$\\{\\s*(([^\\{\\}\\+\\-\\*\\/\\%]+)\\s*([\\+\\-\\*\\/\\%])){0,1}\\s*(' + fn1 + ')\\s*(([\\+\\-\\*\\/\\%])\\s*([^\\{\\}\\+\\-\\*\\/\\%]+)){0,1}\\s*\\}';
            var rg = new RegExp(s);
            var arr = rg.exec(txt);
            if (null == arr) return txt;

            while (null != arr) {
                var v1 = arr[2];
                v1 = null == v1 ? arr[7] : v1;

                var sign = arr[3];
                sign = null == sign ? arr[6] : sign;

                var v2 = null;
                var v_1 = null;
                var v_2 = null;
                if (isNaN(fv) || isNaN(v1)) {
                    if (null != arr[3]) {
                        v_1 = v1;
                        v_2 = fv;
                    }
                    else {
                        v_1 = fv;
                        v_2 = v1;
                    }

                    if ('+' != sign) {
                        v2 = fv;
                    }
                    else {
                        v2 = v_1 + v_2;
                    }
                }
                else {
                    if (null != arr[3]) {
                        v_1 = parseInt(v1);
                        v_2 = parseInt(fv);

                        if (-1 != v1.indexOf('.')) v_1 = parseFloat(v1);
                        if (-1 != fv.toString().indexOf('.')) v_2 = parseFloat(fv);
                    }
                    else {
                        v_1 = parseInt(fv);
                        v_2 = parseInt(v1);

                        if (-1 != v1.indexOf('.')) v_1 = parseFloat(fn);
                        if (-1 != fv.toString().indexOf('.')) v_2 = parseFloat(v1);
                    }

                    switch (sign) {
                        case '+':
                            v2 = v_1 + v_2;
                            break;
                        case '-':
                            v2 = v_1 - v_2;
                            break;
                        case '*':
                            v2 = v_1 * v_2;
                            break;
                        case '/':
                            v2 = v_1 / v_2;
                            break;
                        case '%':
                            v2 = v_1 % v_2;
                            break;
                    }
                }

                txt = txt.replace(rg, v2);
                arr = rg.exec(txt);
            }

            return txt;
        }

        params = null == params ? {} : params;

        sourceapi = null != params.url ? (0 < params.url.length ? params.url : sourceapi) : sourceapi;
        if (null != params.rowData) {
            if (params.rowData instanceof Function) {
                dataArea[0].rowData = params.rowData;
            }
        }

        if (null != params.complete) {
            if (params.complete instanceof Function) {
                dataArea[0].complete = params.complete;
            }
        }

        if (null != params.rowElement) {
            if (params.rowElement instanceof Function) {
                dataArea[0].rowElement = params.rowElement;
            }
        }

        params.url = sourceapi;

        var para = {
            dtsTag: dtsTag,
            dataArea: dataArea,
            startSign: startSign,
            endSign: endSign,
            success: function (dt, callback) {
                var dataArea = this.dataArea;
                var dtsTag = this.dtsTag;
                if (null == dt) {
                    if (null != dataArea[0].complete) {
                        try {
                            dataArea[0].complete.apply(params, [dt]);
                        } catch (e) {

                        }
                    }
                    return;
                }

                if (null == dt[dtsTag]) {
                    if (null != dataArea[0].complete) {
                        try {
                            dataArea[0].complete.apply(params, [dt]);
                        } catch (e) {

                        }
                    }
                    return;
                }

                var zs = $(startSign);
                zs.insertBefore(dtM);

                var arr = dt[dtsTag];
                var len = arr.length;
                for (var i = 0; i < len; i++) {
                    var ele = arr[i];
                    if (null != dataArea[0].rowData) {
                        var ele1 = dataArea[0].rowData.apply(params, [ele, i, arr]);
                        if (null != ele1) ele = ele1;
                    }
                    var dtms1 = dtms;
                    dtms1 = dataArea[0].setValueByField.apply(dtms1, ['$index', i]);
                    for (var k in ele) {
                        dtms1 = dataArea[0].setValueByField.apply(dtms1, [k, ele[k]]);
                    }
                    dtms1 = $(dtms1);
                    if (null != dataArea[0].rowElement) {
                        dataArea[0].rowElement.apply(params, [dtms1[0], i, arr]);
                    }
                    dtms1.insertBefore(dtM);
                }
                
                zs = $(endSign);
                zs.insertBefore(dtM);

                if (null != dataArea[0].complete) {
                    try {
                        dataArea[0].complete.apply(params, [dt]);
                    } catch (e) {

                    }
                }

                if (null != callback) {
                    callback.apply(this, [dt]);
                }
            }
        };

        for (var k in params) {
            if ('success' == k.toLowerCase()) continue;
            if ('complete' == k.toLowerCase()) continue;
            if ('rowdata' == k.toLowerCase()) continue;
            if ('rowelement' == k.toLowerCase()) continue;
            para[k] = params[k];
        }

        ExtAjax(para);

    }
});

var ExtAjax = function (options) {
    var params = $.extend({}, ExtAjax.prototype.options, options);
    $.post(params.url, params.data, function (data) {
        var result = data;
        try {
            result = eval('(' + data + ')');
        } catch (e) {

        }
        params.before.apply(params, [result]);
        params.success.apply(params, [result]);
        params.complete.apply(params, [result]);
    });
}

ExtAjax.prototype.options = {
    url: '',
    data: null,
    api: true,
    success: function (result) { },
    before: function () { },
    complete: function (result) { }
}

$(document).ready(function () {
    var rgs = $.fn.foreachRg;
    var arr = null;
    var html = $(document.body).html();
    var arr1 = []; //{tagN:'',dtsTag:''}

    arr = rgs.exec(html);
    while (null != arr) {
        arr1[arr1.length] = { tagN: arr[1], dtsTag: (null == arr[5] ? arr[7] : arr[5]) };
        html = html.replace(rgs, '');
        arr = rgs.exec(html);
    }

    var len = arr1.length;
    for (var i = 0; i < len; i++) {
        var s = arr1[i].tagN + '[foreach="' + arr1[i].dtsTag + '"]';
        $(document.body).find(s).each(function () {
            $(this).css({ 'display': 'none' });
        });
    }

});