let method = ServerInstance.prototype;
const request = require('request');
const fetch = require('node-fetch');

let batchState = false;

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.round(Math.random() * possible.length));

    return text;
}

function ServerInstance(token, serverInstances) {
    //Gets a Unique ID
	let counter = 1;
	this.id = makeid();

	while (counter > 0) {
		counter = 0;
		for (var i = 0; i < serverInstances.length; i++) {
			if (serverInstances[i].id == this.id) {
				counter++;
			}
		}
		if (counter > 0) {
			this.id = makeid();
		}
	}
    //Gets the hosts data from Spotify
    this.host = {};
	this.host.token = token;
}

method.fetchData = async function() {

    let hostRequest = await fetch('https://api.spotify.com/v1/me', {
		headers: {
			"Authorization": "Bearer " + this.host.token
		}
	});
    let hostRequestData = await hostRequest.json();

    this.host.name = hostRequestData.display_name;
    this.host.id = hostRequestData.id;
    this.host.profileUrl = hostRequestData.external_urls.spotify;

    if (hostRequestData.images.length > 0) {
        this.host.image = hostRequestData.images[0].url;
    } else {
        this.host.image = 'https://openclipart.org/image/2400px/svg_to_png/247324/abstract-user-flat-1.png';
    }

    //Gets all the hosts playlists

    let playlistRequest = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
            "Authorization": "Bearer " + this.host.token
        }
    });
    let playlistRequestData = await playlistRequest.json();
    next = playlistRequestData.next;

    this.playlists = playlistRequestData.items;
    for (var i = 0; i < this.playlists.length; i++) {
        this.playlists[i].tracks = await this.loadSongs(this.playlists[i].id);
    }
    console.log(this.playlists);

    this.currentVotes = [];
    this.votingSongs = [];
    this.currentSong = [];

    this.user = [];
    this.currentState = 'vote';
}

method.getHostInfo = function() {
    return this.host;
}

method.getPlaylists = function() {
    return this.playlists;
}

method.getPlaylistById = function(playlistId) {
    for (var i = 0; i < this.playlists.length; i++) {
        if (this.playlists[i].id == playlistId)
            return this.playlists[i];
    }
    return null;
}

method.loadSongs = async function(playlistId) {
    let next = this.getPlaylistById(playlistId).href + '/tracks?fields=items(track(name%2Chref%2Calbum(images)%2Cartists(name)%2C%20id))%2Cnext%2Coffset%2Ctotal';
    let tracks = await this.loadOneBatch(next);
    return tracks;
}

method.loadOneBatch = async function(next) {
    let request = await fetch(next, {
        headers: {
            "Authorization": "Bearer " + this.host.token
        }
    });
    let fetchData = await request.json();
    next = fetchData.next;

    if (next !== null) {
        let prevTracks = await this.loadOneBatch(next);
        tracks = fetchData.items.concat(prevTracks);
    } else {
        tracks = fetchData.items;
    }
    return tracks;
}

method.getRandomTracks = async function(playlistId) {
    let playlist = this.getPlaylistById(playlistId);
    let indexi = [];

    for (var i = 0; i < 4; i++) {
        indexi[i] = Math.random(playlist.tracks.lenght);

        
    }

method.getVotedSong = function() {

}

method.vote = function() {

}

module.exports = ServerInstance;
