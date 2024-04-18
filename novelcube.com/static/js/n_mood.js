/**
 * Created by fugongyu on 2016/7/13.
 */
//var tatol = 0;
var quit = false;
/*去除百分号*/
function percentReplace(x){
    return x.replace('%', '');
}
function pxReplace(x){
    return x.replace('px', '');
}

/*显示投票数*/
$.ajax({
    type: "get",
    async: false,
    url: "/article/mood",
    dataType : "json",
    data: "news_id="+typeid,
    success: function (data) {
        var html = "";
        for(var i=1;i<7;i++){
            var data_tmp = data[i];
            html += '<li onclick="faceClick(this)"><img src="/images/face_0'+i+'.png" rel="'+i+'" m_type="8"><span>'+data_tmp.num+'</span><div class="hide"></div></li>';
        }
        $("#mood ul").append(html);
    },
    error: function(data){
    }
});


function faceClick(obj){
    var m_type = $(obj).children("img").attr("m_type");
    var type_rel = $(obj).children("img").attr("rel");
    var value = $(obj).find("span").html();
    var val = parseInt(value) + 1;
    if(m_type==1){
        alert("您已经选过这个感受了");
    }else{
        setMoodCookie(typeid);
        if(!quit){
            $(obj).find("img").attr("m_type","1");
            $.ajax({
                type: "get",
                async: false,
                url: "/article/addMood",
                dataType : "json",
                data: "news_id="+typeid+"&type="+type_rel,
                success: function () {
                    $(obj).find("span").html(val);
                    $(obj).children('div').show().animate({bottom:10},function(){
                        $(this).hide().animate({bottom:6});
                    });
                },
                error: function(data){
                }
            });
        }
    }
}

/*设置点击心情COOKIE*/
function setMoodCookie(mood_id) {
    var num = 0;
    if ($.cookie("moodHistory") == null) {
        var mood_obj = {};
        mood_obj[mood_id] = num + 1;
        $.cookie("moodHistory", JSON.stringify([mood_obj]), {path: "/", expires: 1});
    } else {
        var mood_history = $.parseJSON($.cookie("moodHistory"));
        var exist = false;
        for (var i = 0; i < mood_history.length; i++) {
            var his_obj = mood_history[i];
            if (his_obj[mood_id]) {
                his_obj[mood_id] = his_obj[mood_id] + 1;
                if (his_obj[mood_id] > 3) {
                    alert("最多只能投三票哦～");
                    quit = true;
                    return false;
                }
                exist = true;
                break;
            }
        }
        if (!exist) {
            var mood_obj = {};
            mood_obj[mood_id] = num + 1;
            if (mood_obj[mood_id] > 3) {
                alert("最多只能投三票哦～");
                quit = true;
                return false;
            }
            mood_history.push(mood_obj);
        }
        $.cookie("moodHistory", JSON.stringify(mood_history), {path: "/", expires: 1})
    }
}
