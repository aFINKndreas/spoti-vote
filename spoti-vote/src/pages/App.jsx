import React, {Component} from 'react';
import MediaQuery from 'react-responsive';
// import queryString from 'query-string';
import io from 'socket.io-client'
import Cookies from 'universal-cookie';
import swal from 'sweetalert2';
import Footer from '../components/App/Footer.jsx';
import Sidebar from '../components/App/Sidebar.jsx';
import CardContainer from '../components/App/Cards/CardContainer.jsx';

const constants = require('../js/constants');
const ipAddress = window.location.host || 'localhost';
const port = window.location.port || 443;
const backendExtension = '/b';

const cookies = new Cookies();

class App extends Component {
	constructor() {
		super();
		this.socket = io('https://' + ipAddress + ':' + port);
		let token = cookies.get('token');
		if (token === undefined) {
			token = null;
		}

		this.state = {
			token: token,
			roomId: window.location.pathname.split('/')[2],
			loginPage: 'https://' + ipAddress + ':' + port,
			isHost: false,
			connectedUser: [],
			playlists: [],
			host: {
				img: '',	//You now have the user icon in here
				name: null,
				voted: null
			},
			activePlaylist: {name: 'Loading', external_urls:{spotify: ''}, images:[{url: ''}]},
			activeTracks: {},
			activePlayer: null
		}
	}

	componentDidMount() {
		//When the server asks for the id, it will return the id and the token
		this.socket.on('roomId', data => {
			this.socket.emit('roomId', {
				roomId: this.state.roomId,
				token: this.state.token
			});
		});

		//When the server asks for what room to delete, it will return the answer of the user
		this.socket.on('twoRooms', data => {
			swal({
				title: 'You are already hosting a room.',
				text: 'You are currently hosting room ['+data.oldRoom+']. Do you want to delete it?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes, delete it!',
				cancelButtonText: 'No, dont do it!',
			}).then((result) => {
				this.socket.emit('twoRooms', {
					value: result.value,
					roomId: data.oldRoom
				});
			});

		});

		//When the server asks for a name, the user is prompted with popups
		this.socket.on('nameEvent', data => { // SWAL
			swal({
				title: data.title,
				type: 'question',
				allowOutsideClick: false,
				allowEscapeKey: false,
				input: 'text',
				inputPlaceholder: 'Enter your name or nickname',
				inputValidator: (value) => {
					return new Promise((resolve) => {return resolve();});
				}
			}).then((result) => {
				this.socket.emit('nameEvent', {name: result.value});
			})
		});

		this.socket.on('initData', data => {

			//Would be nice to have a loading screen until this is called -> then the user wont see the voting page until he has choosen to delete the old room ...

			if (data.token !== null && data.token !== undefined) {
				cookies.set('token', data.token, {path: '/'});

				this.setState({
					playlists: data.playlists,
					isHost: data.isHost,
					token: data.token,
					host: data.host,
					activeTracks: data.activeTracks,
					activePlaylist: data.activePlaylist,
					connectedUser: data.connectedUser,
					activePlayer: data.activePlayer,
				});
			} else {
				this.setState({
					playlists: data.playlists,
					isHost: data.isHost,
					token: data.token,
					host: data.host,
					activeTracks: data.activeTracks,
					activePlaylist: data.activePlaylist,
					connectedUser: data.connectedUser,
					activePlayer: data.activePlayer,
				});
			}
		});

		this.socket.on('update', data => {
			if (data !== null && data !== undefined) {
				let newState = {};
				if (data.host !== null && data.host !== undefined) {
					newState.host = {
						name: this.state.host.name,
						img: this.state.host.img,
						voted: data.host.voted
					}
				}

				if (data.activeTracks !== null && data.activeTracks !== undefined) {
					newState.activeTracks = [];
					for (var i = 0; i < data.activeTracks.length; i++) {
						if (data.activeTracks[i] !== null && data.activeTracks[i] !== undefined) {
							if (data.activeTracks[i].id === null || data.activeTracks[i].id === undefined) {
								newState.activeTracks[i] = {
									id: this.state.activeTracks[i].id,
									name: this.state.activeTracks[i].name,
									album: this.state.activeTracks[i].album,
									votes: data.activeTracks[i].votes,
									artists: this.state.activeTracks[i].artists
								}
							} else {
								newState.activeTracks[i] = data.activeTracks[i];
							}
						} else {
							newState.activeTracks[i] = this.state.activeTracks[i];
						}
					}
				}

				if (data.activePlaylist !== null && data.activePlaylist !== undefined) {
					newState.activePlaylist = data.activePlaylist;
				}

				if (data.connectedUser !== null && data.connectedUser !== undefined) {
					newState.connectedUser = data.connectedUser;
				}

				if (data.activePlayer !== null && data.activePlayer !== undefined) {
					if (data.activePlayer.track !== null && data.activePlayer.track !== undefined) {
						newState.activePlayer = data.activePlayer;
					} else {
						newState.activePlayer = {
							progress: data.activePlayer.progress,
							track: this.state.activePlayer.track
						}
					}
				}

				if (Object.keys(newState).length > 0) {
					this.setState({
						host: newState.host || this.state.host,
						activeTracks: newState.activeTracks || this.state.activeTracks,
						activePlaylist: newState.activePlaylist || this.state.activePlaylist,
						connectedUser: newState.connectedUser || this.state.connectedUser,
						activePlayer: newState.activePlayer || this.state.activePlayer
					})
				}
			}
		});

		this.socket.on('errorEvent', data => {
			if (data.message !== null && data.message !== undefined) {
				swal({type: 'error', title: 'Oops...', text: data.message}).then((value) => {
				  window.location.pathname = '/';
				});
			}
		});
	}

	selectPlaylist(event) {
		let playlistId = event.target.options[event.target.selectedIndex].getAttribute('id');
		if (playlistId !== null && playlistId !== 'none') {
			this.socket.emit('changePlaylist', {playlistId: playlistId});
		}
	}

	render() {
		return (<section style={{
				backgroundColor: constants.colors.background,
				height: '100vh',
				width: '100vw'
			}}>
			<MediaQuery minWidth={constants.breakpoints.medium}>{
					(matches) => {
						if (matches) {
							return (<Sidebar isPhone={false} socket={this.socket} isHost={this.state.isHost} connectedUser={this.state.connectedUser} host={this.state.host} playlistHandler={this.selectPlaylist.bind(this)} activePlaylist={this.state.activePlaylist} activeTracks={this.state.activeTracks} playlists={this.state.playlists}/>);
						} else {
							return (<Sidebar isPhone={true} socket={this.socket} isHost={this.state.isHost} connectedUser={this.state.connectedUser} host={this.state.host} playlistHandler={this.selectPlaylist.bind(this)} activePlaylist={this.state.activePlaylist} activeTracks={this.state.activeTracks} playlists={this.state.playlists}/>);
						}
					}
				}
			</MediaQuery>
			<MediaQuery minWidth={constants.breakpoints.medium}>{
					(matches) => {
						if (matches) { // = tablet^
							return <CardContainer isPhone={false} room={this.state.roomId} name={this.state.name} isHost={this.state.isHost} activeTracks={this.state.activeTracks} socket={this.socket}/>
						} else { // = phone
							return <CardContainer isPhone={true} room={this.state.roomId} name={this.state.name} isHost={this.state.isHost} activeTracks={this.state.activeTracks} socket={this.socket}/>
						}
					}
				}
			</MediaQuery>
			<Footer isHost={this.state.isHost} activePlayer={this.state.activePlayer} socket={this.socket}/>
		</section>);
	}
}

export default App;