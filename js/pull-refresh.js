/**
 * Created by cgx on 14-3-2.
 */
function Sub(str, data) {
    return str.replace(/{(.*?)}/igm, function($, $1) {
        //                return data[$1] ? data[$1] : '';
        return data[$1] || '';
    });
}


//list
var myScroll,
    pullDownEl, pullDownOffset,
    pullUpEl, pullUpOffset,
    generatedCount = 0,
    currentPage = 2;

var tpl = '<a class="pro_item" href="#" id="{productId}"><div class="title">{name}</div>'+
   ' <div class="detail">{introduction}</div>'+
'<div class="price">'+
    '<div class="fr grey">'+
       ' <span>{viewCount}</span><span>人已购买</span>'+
    '</div>'+
    '<div class="fl">'+
    '<span>￥{realPrice}</span>'+
    '<span class="grey">￥{price}</span>'+
    '</div>'+
    '</div>'+
'</a>';



function getUrl(page,area){
	var area = 'guonei'
	return 'http://124.172.250.201/cms/wmall/'+ area +'/productlistjson.json?p='+page;
}


function pullDownAction() {
    setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
        var el, li, i,item,datas,innerHTML='';
//        el = document.getElementById('thelist');
//        el.insertBefore(item, el.childNodes[0]);
//        /ajax call....
        datas = [
            {
                "title":"1234",
                "detail":'58708',
                "count":"123",
                "price":"122",
                "old_price":"211",
				"href":"http:///123.com"
            },
            {
                "title":"地方阿凡达",
                "detail":'的啊',
                "count":"123",
                "price":"122",
                "old_price":"211"
            },
            {
                "title":"1234",
                "detail":'58708',
                "count":"123",
                "price":"122",
                "old_price":"211"
            }
        ];

        datas.forEach(function(data){
            innerHTML += Sub(tpl, data);
        });

        $('#thelist').prepend(innerHTML);

        myScroll.refresh();		// Remember to refresh when contents are loaded (ie: on ajax completion)
    }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
}

function pullUpAction() {
//  setTimeout(function () {	// <-- Simulate network congestion, remove setTimeout from production!
//      var el, li, i,item,datas,innerHTML='';
//
//      datas = [
//          {
//              "title":"地方法t66级的风格",
//              "detail":'58708',
//              "count":"123",
//              "price":"122",
//              "old_price":"211"
//          },
//          {
//              "title":"发帖",
//              "detail":'的啊',
//              "count":"123",
//              "price":"122",
//              "old_price":"211"
//          },
//          {
//              "title":"那就啊3i哦",
//              "detail":'58708',
//              "count":"123",
//              "price":"122",
//              "old_price":"211"
//          }
//      ];
//
//      datas.forEach(function(data){
//          innerHTML += Sub(tpl, data);
//      });
//
//      $('#thelist').append(innerHTML);
//      myScroll.refresh();		// Remember to refresh when contents are loaded (ie: on ajax completion)
//  }, 1000);	// <-- Simulate network congestion, remove setTimeout from production!
//  
//  
    var innerHTML='';
    var url = getUrl(currentPage);
    
	$.ajax({
		url : url,
		type : 'json',
		success : function(json) {
			json.forEach(function(data) {
				innerHTML += Sub(tpl, data);
			});

			$('#thelist').append(innerHTML);
			myScroll.refresh();
			currentPage+=1;
		}
	}); 

}

function loaded() {
    pullDownEl = document.getElementById('pullDown');
    pullDownOffset = pullDownEl.offsetHeight;
    pullUpEl = document.getElementById('pullUp');
    pullUpOffset = pullUpEl.offsetHeight;

    myScroll = new iScroll('wrapper', {
        useTransition: true,
        topOffset    : pullDownOffset,
        onRefresh    : function () {
            if (pullDownEl.className.match('loading')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新.';
            } else if (pullUpEl.className.match('loading')) {
                pullUpEl.className = '';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
            }
        },
        onScrollMove : function () {
            if (this.y > 5 && !pullDownEl.className.match('flip')) {
                pullDownEl.className = 'flip';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '松手刷新...';
                this.minScrollY = 0;
            } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新';
                this.minScrollY = -pullDownOffset;
            } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                pullUpEl.className = 'flip';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '松手刷新...';
                this.maxScrollY = this.maxScrollY;
            } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                pullUpEl.className = '';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多';
                this.maxScrollY = pullUpOffset;
            }
        },
        onScrollEnd  : function () {
            if (pullDownEl.className.match('flip')) {
                pullDownEl.className = 'loading';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '正在加载...';
                pullDownAction();	// Execute custom function (ajax call?)
            } else if (pullUpEl.className.match('flip')) {
                pullUpEl.className = 'loading';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '正在加载...';
                pullUpAction();	// Execute custom function (ajax call?)
            }
        }
    });

    setTimeout(function () {
        document.getElementById('wrapper').style.left = '0';
    }, 800);
}

document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(loaded, 200);
}, false);