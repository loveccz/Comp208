// JavaScript Document
/**
 * 获取类型html
 * @param type_str
 * @returns {string}
 */
function getHtmlTypeString(type_str)
{
    if (!type_str) {
        return '';
    }

    var html_str = '';
    var type_arr = type_str.split("/");
    for (var i = 0; i < type_arr.length; i++) {
        html_str += '<span class="pd">' + type_arr[i] + '</span>';
    }
    return html_str;
}

//排行类型－时间－分类－页码
var flag_data = [0, 0, 0, 0];


var request_rank_func = function(){
    var document_height = $(document).height();
    if($(window).scrollTop()+$(window).height()>=(document_height-nc_global.document_hei)) {
        flag_data[flag_data.length - 1]++;
        $("#loadding").show();
        requestRankData();

    }
};
$(window).bind('scroll', request_rank_func);

/**
 * 请求排行榜数据
 */
function requestRankData() {
    $(window).unbind('scroll', request_rank_func);
    var page_index = flag_data[flag_data.length - 1];
    var url = '/rank/'+ flag_data.join('-') + '.json';
    T.restGet(url, {}, function(data) {
        var html = "";
        for (var i = 0; i < data.length; i++) {
            var comic = data[i];
            var update_timestamp = comic.last_updatetime;
            var update_date = new Date(update_timestamp*1000);
            var comic_cover = "https://images.dmzj.com/" + comic.cover;
            var is_end = comic.status == "已完结" ? true : false;
            var end_str = is_end ? '<span class="wan"></span>' : '';

            html +=
                '<div class="itemBox">' +
                '<div class="itemImg">' + '<a href="/info/'+comic['comic_py']+'.html" title=""><img src="' + comic_cover + '" width="100%"></a>' + end_str + '</div>' +
                '<div class="itemTxt">' +
                '<a class="title"' + ' href="/info/'+comic['comic_py']+'.html" title="">' + comic.name + '</a>' +
                '<p class="txtItme">' + comic.authors + '<span class="icon icon01"></span></p>' +
                '<p class="txtItme">' + getHtmlTypeString(comic.types) + '<span class="icon icon02"></span></p>' +
                '<p class="txtItme"><span class="date">' + update_date.format("yyyy-MM-dd hh:mm") +'</span><span class="icon icon03"></span></p>' +
                '</div>' +
                '<div class="number">' + (page_index * 10 + (i + 1)) + '</div>';

            if(flag_data[0] == 1) {
                //吐槽
                html += '<div class="guild">' +
                '<a class="comi" href="/view/'+comic['id']+'/'+comic['chaper_id']+'.html">'+comic['chapter_name']+'</a>' +
                '<p class="Tucao">' + comic['vote_num'] + '吐槽</p>' +
                '</div>';
            } else if (flag_data[0] == 2) {
                //订阅
                html += '<p class="scripSize">'+comic['sub_num']+'订阅</p>';
                var is_exist = false;
                if(localStorage.mySubscribeData){
                    var subScribeArry = JSON.parse(localStorage.mySubscribeData);
                    for(var sub=0;sub<subScribeArry.length;sub++){
                        if(subScribeArry[sub]['sub_id'] == comic["id"]){
                            is_exist=true;
                            break;
                        }
                    }
                }
                if(is_exist){
                    html += '<a href="javascript:void(0);" id="mysub_'+comic["id"]+'" onClick="unSubscribe(' + comic["id"] + ')" class="scripBtn">取消订阅</a>'

                }else{
                    html += '<a href="javascript:void(0);" id="mysub_'+comic["id"]+'" onClick="addSubscribe(' + comic["id"] + ')" class="scripBtn">订阅漫画</a>'
                }
                html +='</div>';
            }

            html += '</div>';
        }
        if(page_index > 0) {
            $("#topImgCon").append(html);
        } else {
            $("#topImgCon").html(html);
        }
        $("#topImgCon .itemBox").eq(0).find(".number").addClass("number1");
        $("#topImgCon .itemBox").eq(1).find(".number").addClass("number2");
        $("#topImgCon .itemBox").eq(2).find(".number").addClass("number3");
        nc_global.character("title",10);
        if(data.length==0){
            $("#loadding").show().text("已经没有了");
            $(window).unbind('scroll', request_rank_func);
            return false
        }else{
            $(window).bind('scroll', request_rank_func);
            $("#loadding").hide();

        }


    }, function(data) {
        $(window).bind('scroll', request_rank_func);
        console.log(data);
    });
}

function itemClickAction(idx, value){
    flag_data[idx] = value;
    flag_data[flag_data.length-1] = 0;//页码重置
    requestRankData();
}

function typeClickAction(flag){
    $('.FilterBox').hide();
    $('.show_c').hide();
    flag_data[flag_data.length-1] = 0;//页码重置
    flag_data = flag.split('-');

    var rankType = parseInt(flag_data[0]);
    switch (rankType) {
        case 0:
            $("#topImgCon").html('');
            $(".rq").addClass("cur").siblings().removeClass("cur");
            break;
        case 1:
            $("#topImgCon").html('');
            $(".tc").addClass("cur").siblings().removeClass("cur");
            break;
        case 2:
            $("#topImgCon").html('');
            $(".dy").addClass("cur").siblings().removeClass("cur");
            break;
    }
    $("#loadding").text("正在加载中...");
    $("#loadding").hide();
    requestRankData();
}


//初始化
$(function () {
    $("#topImgCon .itemBox").eq(0).find(".number").addClass("number1");
    $("#topImgCon .itemBox").eq(1).find(".number").addClass("number2");
    $("#topImgCon .itemBox").eq(2).find(".number").addClass("number3");
    nc_global.navStyle(3);
    nc_global.character("title",10);
    $('#FilterCon ul li').click(function () {
        $("#loadding").text("正在加载中...");
        if($(this).find("em").length==0){
            $(this).addClass("Hov").find('a').append('<em></em>').parent("li").siblings().removeClass("Hov").find("em").remove();
        }
        $(".FilterBox").hide();
        $(".show_c").hide();
    });

    //打开筛选 更新样式
    $('.FilterBtn').click(function () {
        var rankType = parseInt(flag_data[0]);
        switch (rankType) {
            case 0:
                $("#topImgCon").attr("class", "rand_rq");
                if ($("#topImgCon").hasClass("rand_rq")) {
                    $("#FilterTit li").eq(0).addClass("cur").show();
                    $("#FilterCon ul").eq(0).addClass("select");
                    $("#FilterTit li").eq(1).removeClass("cur");
                    $("#FilterCon ul").eq(1).removeClass("select");
                }
                break;

            case 1:

            case 2:
                $("#topImgCon").attr("class", "rand_tc");
                if ($("#topImgCon").hasClass("rand_tc")) {
                    $("#FilterTit li").eq(0).removeClass("cur").hide();
                    $("#FilterCon ul").eq(0).removeClass("select");
                    $("#FilterTit li").eq(1).addClass("cur");
                    $("#FilterCon ul").eq(1).addClass("select");
                }
                break;
        }

        if ($(".FilterBox").is(":hidden")) {
            $(".FilterBox").show();
            $('.show_c').show();
        } else{
            $(".FilterBox").hide();
            $('.show_c').hide();
        }
    });

    tab('FilterTit', 'FilterCon', 'cur', 'select', 'show_c', 1);
});
