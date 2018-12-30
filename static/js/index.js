function test(original, key, bpm, energy) {
	url = '/matchSong'
	data = {
		"key": key,
		"bpm": bpm,
		"energy": energy,
		"flags": {
			"filter_key": document.getElementById("key_filter").checked,
			"filter_bpm": document.getElementById("bpm_filter").checked,
			"filter_energy": document.getElementById("energy_filter").checked
		}
	}

	$.ajax({
		type: "POST",
		url: url,
		data: data,
		success: function(res) {
			res = JSON.parse(res)
			document.getElementById("suggestions-list").innerHTML = "";
			$("#suggestions-table tr").remove(); 

			for (let i = 0, length1 = res.length; i < length1; i++) {
				if (original != res[i][1]) {

					title = res[i][1].split('|')[0];
					key = res[i][2];
					bpm = res[i][3];
					energy = res[i][4];

					var node = document.createElement("TR");
					title_cell = node.insertCell(0);
					key_cell = node.insertCell(1);
					bpm_cell = node.insertCell(2);
					energy_cell = node.insertCell(3);

					title_cell.innerHTML = title;
					key_cell.innerHTML = key;
					bpm_cell.innerHTML = bpm;
					energy_cell.innerHTML = energy;

					title_cell.style.width = '50%';

					document.getElementById("suggestions-table").appendChild(node);

				}
			}
		},
	});

	window.original = original;
	window.key = key;
	window.bpm = bpm;
	window.energy = energy;

	querystring = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&safeSearch=strict&order=relevance&key=AIzaSyA2d08Q0a-O9KZkyCCFXsTd-NgAYEhALfY&q=' + original + ' lyrics';
	$.get(querystring,
        function(data, status) {
            if (data.items.length == 0) {
                Materialize.Toast.removeAll();
                Materialize.toast('No results found.', 4000)
            } else {
                for (let i = 0; i < 1; i++) {
                    if (typeof data.items[i] != 'undefined' && data.items[i].id.kind === 'youtube#video') {
                        video_title = data.items[i].snippet.title;
                        video_id = data.items[i].id.videoId;
                        video_description = data.items[i].snippet.description;

                        document.getElementById("video_title").innerHTML = video_title;
                        document.getElementById("video_iframe").src = 'https://www.youtube.com/embed/' + video_id + '?autoplay=1';
                    }
                }
            }
        }
    );
}

function redo() {
	url = '/matchSong'
	data = {
		"key": window.key,
		"bpm": window.bpm,
		"energy": window.energy,
		"flags": {
			"filter_key": document.getElementById("key_filter").checked,
			"filter_bpm": document.getElementById("bpm_filter").checked,
			"filter_energy": document.getElementById("energy_filter").checked
		}
	}

	$.ajax({
		type: "POST",
		url: url,
		data: data,
		success: function(res) {
			res = JSON.parse(res)
			document.getElementById("suggestions-list").innerHTML = "";
			$("#suggestions-table tr").remove(); 

			for (let i = 0, length1 = res.length; i < length1; i++) {
				if (window.original != res[i][1]) {

					title = res[i][1].split('|')[0];
					key = res[i][2];
					bpm = res[i][3];
					energy = res[i][4];

					var node = document.createElement("TR");
					title_cell = node.insertCell(0);
					key_cell = node.insertCell(1);
					bpm_cell = node.insertCell(2);
					energy_cell = node.insertCell(3);

					title_cell.innerHTML = title;
					key_cell.innerHTML = key;
					bpm_cell.innerHTML = bpm;
					energy_cell.innerHTML = energy;

					title_cell.style.width = '50%';

					document.getElementById("suggestions-table").appendChild(node);

				}
			}
		},
	});
}

function search() {
	// Declare variables 
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("myInput");
	filter = input.value.toUpperCase();
	table = document.getElementById("myTable");
	tr = table.getElementsByTagName("tr");

	// Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[1];
		if (td) {
			txtValue = td.textContent || td.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				tr[i].style.display = "block";
			} else {
				tr[i].style.display = "none";
			}
		}
	}
}