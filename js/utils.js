'use strict';

window.chartColors = {

    transparent:   'transparent',

    category_0_start:  '#A8C302',
    category_0_finish: '#24A304',
    category_1_start:  '#FD810F',
    category_1_finish: '#C6450E',
    category_2_start:  '#00DDDA',
    category_2_finish: '#00AC69',
    category_3_start:  '#EA07E2',
    category_3_finish: '#A50B83',
    category_4_start:  '#6804AE',
    category_4_finish: '#0AA2D6',
    category_5_start:  '#7002C3',
    category_5_finish: '#A70EED',
    category_6_start:  '#A8C302',
    category_6_finish: '#C0D347',





    empty_graphs:  '#272B39',


    graph_line: '#009624',
    graph_fill: '#00d62e',

    grad_ws_month_100_border_0: 'rgba(255, 255, 255, 0)',
    grad_ws_month_100_border_034: 'rgba(255, 255, 255, 0.6)',
    grad_ws_month_100_border_035: 'rgba(255, 255, 255, 0)',
    grad_ws_month_100_border_066: 'rgba(255, 255, 255, 0)',
    grad_ws_month_100_border_067: 'rgba(255, 255, 255, 0.6)',
    grad_ws_month_100_border_1: 'rgba(255, 255, 255, 0)',

    grad_ws_quarter_100_border_0: 'rgba(3, 196, 156, 0)',
    grad_ws_quarter_100_border_034: 'rgba(3, 196, 156, 0.6)',
    grad_ws_quarter_100_border_035: 'rgba(3, 196, 156, 0)',
    grad_ws_quarter_100_border_066: 'rgba(3, 196, 156, 0)',
    grad_ws_quarter_100_border_067: 'rgba(3, 196, 156, 0.6)',
    grad_ws_quarter_100_border_1: 'rgba(3, 196, 156, 0)',

    grad_ws_year_0: '#F54F5A',
    grad_ws_year_1: '#CC78FF',
    grad_ws_year_100_0: '#F54F5C',
    grad_ws_year_100_05: '#D72C82',
    grad_ws_year_100_1: '#6D0009',
    grad_ws_year_100_border_0: 'rgba(249, 242, 55, 0)',
    grad_ws_year_100_border_034: 'rgba(249, 242, 55, 0.6)',
    grad_ws_year_100_border_035: 'rgba(249, 242, 55, 0)',
    grad_ws_year_100_border_066: 'rgba(249, 242, 55, 0)',
    grad_ws_year_100_border_067: 'rgba(249, 242, 55, 0.6)',
    grad_ws_year_100_border_1: 'rgba(249, 242, 55, 0)',

    order_status_12: '#F36D09',
    order_status_34: '#8C60CE',
    order_status_55: '#18E899',
    order_status_6: '#F36D09',
    order_status_7: '#18E899',
    order_status_10: '#AA0A8A',

    project_status_2: '#96BD05',
    project_status_3: '#A80A88',
    project_status_4: '#760EC8',

    apple: '#00AC69',
    orange: '#C6450E',
    lemon: '#A8C302',

    line_color: '#fff271',
    line_color_2: '#ff984f',

    tons_old: '#651fff',
    tons_raf: 'rgba(178, 178, 178, 0.96)',
    tons_new: '#9d46ff',

    cash_old: '#009624',
    cash_raf: 'rgba(178, 178, 178, 0.96)',
    cash_new: '#5efc82',

    red: 'rgb(255, 99, 132)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',

    graph_ws_cash: '#3CC89E',
    graph_ws_tons: '#462888',
    chartBorderColor: '#191c24',

    grad_start_tons_f1: '#2b3e62',
    grad_end_tons_f1: '#5d3e6b',
    grad_start_tons_p2: '#a62903',
    grad_end_tons_p2: '#ffaf87',
    grad_start_tons_f2: '#502BB8',
    grad_end_tons_f2: '#1096D3',
    // grad_start_monthes_weight_4: '#FD810F',
    // grad_end_monthes_weight_4: '#C6450E',
    // grad_start_monthes_weight_5: '#FFFFFF',
    // grad_end_monthes_weight_5: '#A8C302',

    grad_start_cash_f1: '#1f402a',
    grad_end_cash_f1: '#5bba7c',
    grad_start_cash_p2: '#a62903',
    grad_end_cash_p2: '#ffaf87',
    grad_start_cash_f2: '#35704a',
    grad_end_cash_f2: '#00D8D0',
    // grad_start_monthes_money_4: '#EA07E2',
    // grad_end_monthes_money_4: '#A50B83',
    // grad_start_monthes_money_5: '#FFFFFF',
    // grad_end_monthes_money_5: '#A8C302',

};

(function(global) {
    var MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    var COLORS = [
        '#4dc9f6',
        '#f67019',
        '#f53794',
        '#537bc4',
        '#acc236',
        '#166a8f',
        '#00a950',
        '#58595b',
        '#8549ba'
    ];

    var Samples = global.Samples || (global.Samples = {});
    var Color = global.Color;

    Samples.utils = {
        // Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
        srand: function(seed) {
            this._seed = seed;
        },

        rand: function(min, max) {
            var seed = this._seed;
            min = min === undefined ? 0 : min;
            max = max === undefined ? 1 : max;
            this._seed = (seed * 9301 + 49297) % 233280;
            return min + (this._seed / 233280) * (max - min);
        },

        numbers: function(config) {
            var cfg = config || {};
            var min = cfg.min || 0;
            var max = cfg.max || 1;
            var from = cfg.from || [];
            var count = cfg.count || 8;
            var decimals = cfg.decimals || 8;
            var continuity = cfg.continuity || 1;
            var dfactor = Math.pow(10, decimals) || 0;
            var data = [];
            var i, value;

            for (i = 0; i < count; ++i) {
                value = (from[i] || 0) + this.rand(min, max);
                if (this.rand() <= continuity) {
                    data.push(Math.round(dfactor * value) / dfactor);
                } else {
                    data.push(null);
                }
            }

            return data;
        },

        labels: function(config) {
            var cfg = config || {};
            var min = cfg.min || 0;
            var max = cfg.max || 100;
            var count = cfg.count || 8;
            var step = (max - min) / count;
            var decimals = cfg.decimals || 8;
            var dfactor = Math.pow(10, decimals) || 0;
            var prefix = cfg.prefix || '';
            var values = [];
            var i;

            for (i = min; i < max; i += step) {
                values.push(prefix + Math.round(dfactor * i) / dfactor);
            }

            return values;
        },

        months: function(config) {
            var cfg = config || {};
            var count = cfg.count || 12;
            var section = cfg.section;
            var values = [];
            var i, value;

            for (i = 0; i < count; ++i) {
                value = MONTHS[Math.ceil(i) % 12];
                values.push(value.substring(0, section));
            }

            return values;
        },

        color: function(index) {
            return COLORS[index % COLORS.length];
        },

        transparentize: function(color, opacity) {
            var alpha = opacity === undefined ? 0.5 : 1 - opacity;
            return Color(color).alpha(alpha).rgbString();
        }
    };

    // DEPRECATED
    window.randomScalingFactor = function() {
        return Math.round(Samples.utils.rand(-100, 100));
    };

    // INITIALIZATION

    Samples.utils.srand(Date.now());

    // Google Analytics
    /* eslint-disable */
    if (document.location.hostname.match(/^(www\.)?chartjs\.org$/)) {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-28909194-3', 'auto');
        ga('send', 'pageview');
    }
    /* eslint-enable */

}(this));
