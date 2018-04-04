import React, {Component} from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faHeadphones} from '@fortawesome/fontawesome-free-solid';

let defaultStyle = {
	height: '300px',
	width: '250px',
	position: 'absolute',
	top: 0
}

let imgStyle = {
	height: '150px',
	width: '150px',
	marginLeft: 'auto',
	marginRight: 'auto',
	marginTop: '15px',
	marginBottom: '20px',
	backgroundPosition: 'center',
	backgroundRepeat: 'no-repeat',
	backgroundSize: 'cover',
	border: '1px solid black'
}

let nameContainer = {
	marginTop: '10px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center'
}

let centerContainer = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	marginTop: '10px',
	marginBottom: '5px'
}

class Infos extends Component {
	constructor() {
		super();
		this.state = {
			playlistData: {
				playlists: []
			}

		}
	}

	componentDidMount() {
		let access_token = this.props.token;

		fetch('http://localhost:8888/instance/playlists?id='+window.location.pathname.split('/')[2], {
	    }).then((response) => response.json().then(data => {
			this.setState({
				playlistData: {
					playlists: data
				}
			});
	    })).catch(function() {
			window.location.reload;
		});
	}

	render() {
		return (<div style={defaultStyle}>
			<div style={{
					...centerContainer,
					fontWeight: 'bold',
					fontSize: '18px'
				}}>ROOMNAME</div>
			<div style={{
					...centerContainer,
					fontSize: '14px'
				}}>
				<select style={{
						width: '200px'
					}} onChange={this.props.playlistHandler}>
					<option>Select a Playlist</option>
					{this.state.playlistData.playlists.map((playlist) => <option key={playlist.id} id={playlist.id} img={playlist.images[0].url} url={playlist.external_urls.spotify} href={playlist.href}>{playlist.name}</option>)}
				</select>
			</div>
			<a href={this.props.playlistUrl || window.location.href}>
				<img alt="Current Playlist" src={this.props.playlistCover || 'http://via.placeholder.com/152x152'} style={{
						...imgStyle,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}/>
			</a>
			<div style={nameContainer}>
				<FontAwesomeIcon icon={faHeadphones} size="2x"/>
				<div style={{
						marginLeft: '10px'
					}}>
					{this.props.users.name || this.props.users.id}
				</div>
			</div>
		</div>);
	}
}
export default Infos;
