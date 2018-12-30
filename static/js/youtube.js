function getId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}

$('.pause_video').click(function(){
    $('iframe')[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
});


$('#youtubeinput').keydown(function(event) {
    if (event.which == 13) {
        youtubeSearch($('#youtubeinput').val());
    }
});

function youtubeSearch(note) {
    window.stopGaLoop('vimeo');
    if (note.length === 0 || !note.trim()) {
        clearAndShowTable();
        showHistory();
    } else {
        clearAndShowTable();
        var search_query = YOUTUBE_BASE + note;
        getVideoInfo(search_query,undefined,true);
    }
}

function clearAndShowTable() {
    var table = document.getElementById("suggested_vids_table");
    for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    document.getElementById('myCode').style.display = 'none';
    document.getElementById('myCode').innerHTML = '';
    document.getElementById('suggested_vids').style.display = 'block';
}

function showHistory() {
    var unique_youtube_links = ["https://www.youtube.com/watch?v=6p_yaNFSYao"];

    $.each(youtube_links, function(i, el){
        if($.inArray(el, unique_youtube_links) === -1 && el != "Guided Meditation - Blissful Deep Relaxation") unique_youtube_links.unshift(el);
    });

    for (var i = 0; i < unique_youtube_links.length; i++) {
        var query = unique_youtube_links[i];
        var youtube_api_url = YOUTUBE_BASE + query;

        getVideoInfo(youtube_api_url,1,false);
    }
}

function getVideoInfo(querystring,results,show_pops) {
    if (typeof results == "undefined") {
        results = 15;
    }
    $.get(querystring,
        function(data, status) {
            if (data.items.length == 0 && show_pops) {
                Materialize.Toast.removeAll();
                Materialize.toast('No results found.', 4000)
            } else {
                for (let i = 0; i < results; i++) {
                    if (typeof data.items[i] != 'undefined' && data.items[i].id.kind === 'youtube#video') {
                        video_title = data.items[i].snippet.title;
                        video_pic = data.items[i].snippet.thumbnails.high.url;
                        video_id = data.items[i].id.videoId;
                        video_description = data.items[i].snippet.description;
                        addVidToTable(video_title,video_pic,video_id,video_description);
                    }
                }
            }
        }
    );
}

function addVidToTable(name,pic,url,description) {

    var table = document.getElementById("suggested_vids_table");
    var row = table.insertRow(table.rows.length);
    row.style.cursor = "pointer";
    row.classList.add('suggested_vid');
    row.dataset.link = url;

    var cell1 = row.insertCell(0);
    cell1.innerHTML = "<img src='" + pic + "' height='100px'>";

    var cell2 = row.insertCell(1);
    cell2.innerHTML = "<h6 class='flow-text' style='font-weight: bolder;'>"+name+"</h6><h6>" + description + "</h6><br>";

    row.addEventListener("click", function(){
        showVideoPreloader();

        $('#myCode').html('<iframe onload="hideVideoPreloader()" src="https://www.youtube.com/embed/'
                            + url
                            + '?enablejsapi=1&version=3" frameborder="0" allowfullscreen></iframe>');

            watched_vids.push(name);
            watched_vids_urls.push('https://www.youtube.com/watch?v=' + url);

        document.getElementById('myCode').style.display = 'block';
        document.getElementById('suggested_vids').style.display = 'none';
    });
}

function youtubeParser(url){
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return false;
    }
}

$(document).ready(function() {
    $('.collapsible').collapsible();

    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal({
        opacity: .5, // Opacity of modal background
    });

    $('select').material_select();

    $('.collapsible').collapsible();

    $('.modal').modal({
        opacity: .5, // Opacity of modal background
    });

    $('select').material_select();

    $('#betaSurvey').modal({
        dismissible: false
    });

    showHistory();

    $('.collapsible').collapsible();

    noSleep = new NoSleep();
    enableNoSleep();

    start_time = new Date().getTime();
    watched_vids = [];
    watched_vids_urls = [];
    listened_audio = [];
    saved_session_yet = false;
    populated = false;

    assigned_video_link = getQueryStringValue("video_link");
    assigned_video_id = youtubeParser(assigned_video_link);
    if (assigned_video_link && assigned_video_id) {
        showVideoPreloader();

        $('#myCode').html('<iframe style="width: 100%; height:54vh;" onload="hideVideoPreloader()" src="https://www.youtube.com/embed/'
                            + assigned_video_id
                            + '?enablejsapi=1&version=3" frameborder="0" allowfullscreen></iframe>');

        document.getElementById('myCode').style.display = 'block';
        document.getElementById('suggested_vids').style.display = 'none';

        querystring = "https://www.googleapis.com/youtube/v3/videos?id=" + assigned_video_id + "&safeSearch=strict&key=AIzaSyA2d08Q0a-O9KZkyCCFXsTd-NgAYEhALfY&fields=items(snippet(title))&part=snippet";
        $.get(querystring, function(data, status) {watched_vids.push(data.items[0].snippet.title);})

        watched_vids_urls.push(assigned_video_link);
    }

    var secondsOnPage = 0;

    var checkBreathingGuideHw = function(hwId) {
        $.ajax({
            type: 'GET',
            url: bust('/api/patients/homework/' + hwId),
            success: function(data) {
                if (data.homework_type === 'breathing_homework') {
                    // Remove autofocus from video search
                    document.activeElement.blur();

                    document.getElementById('breathing-timer').classList.remove('hidden');

                    exerciseSeconds = data.breathing_length_in_seconds;
                    goalSeconds = exerciseSeconds/2;

                    window.setInterval(function() {
                        secondsOnPage += 1;

                        var minutes = Math.floor(secondsOnPage/60);
                        // using this instead of substr() method is longer but allows minutes to go into triple digits
                        var displayMinutes = minutes >= 10 ? minutes.toString() : ('0' + minutes.toString())
                        var displaySeconds = ('0' + (secondsOnPage % 60).toString()).substr(-2);
                        var displayTime = displayMinutes + ':' + displaySeconds;
                        document.getElementById('breathing-timer-time').innerText = displayTime;

                        if (secondsOnPage === exerciseSeconds) {
                            document.getElementById('breathing-timer').classList.add('with-timer-complete');
                            document.getElementById('breathing-timer-complete').innerText = 'Activity complete!';
                        }
                    }, 1000)
                }
            },
            error: function(err) {
                Materialize.Toast.removeAll();
                Materialize.toast('Could not retrieve information for this homework, please refresh to try again.', 4000);
            }
        })
    }

    // Variable is set in video_session.html script
    if (hw_id) {
        checkBreathingGuideHw(hw_id);
    }

});

$(window).on("beforeunload", function() {
    saveSession();
    return undefined;
})
