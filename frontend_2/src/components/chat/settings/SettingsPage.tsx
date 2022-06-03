import React from 'react';
import { AiOutlineUserAdd, AiOutlineUserDelete, AiOutlineAudioMuted, } from 'react-icons/ai';
import { GoMute, GoUnmute } from 'react-icons/go';
import { RiRotateLockFill, RiAdminLine } from 'react-icons/ri';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import Popup from 'reactjs-popup';
import './SettingsPage.css'

import { Link } from 'react-router-dom';

// 1 = owner 2 = admin 3 = password=true


const SettingsPage = () => {

		return (
		<div className='new-user'>
			<h1>
				<u>
					SETTINGS : <p/>
				</u> 
			</h1>
		<h2>
			Add user : &nbsp;&nbsp;
				<Popup trigger={<button>
					<AiOutlineUserAdd /></button>} modal nested>
				{(close: any) => (
				<div className='modal2'>
					<button className="close" onClick={close}>
					&times;
					</button>
					<div className="header"> Add user</div>
					<div className="content">
					{' '}
					<pre>      Select user to add      </pre>
					</div>
					<div className="actions">
					<Popup
						trigger={<button className="button-return"> Select user </button>}
						modal nested>
						<div className="menu-settings">
							<div className="menu-item-settings"> item 1</div>
							<div className="menu-item-settings"> item 2</div>
							<div className="menu-item-settings"> item 3</div>
						</div>
					</Popup>
					</div>
				</div>
				)}
			</Popup>
		</h2>
		{ 1 && (
			<h2>
				Make a chat user admin : &nbsp;&nbsp;
				<Popup trigger={<button>
					<RiAdminLine /></button>} modal nested>
				{(close: any) => (
				<div className='modal2'>
					<button className="close" onClick={close}>
					&times;
					</button>
					<div className="header"> Make user admin</div>
					<div className="content">
					{' '}
					<pre>  Select a user to give him administrator role  </pre>
					</div>
					<div className="actions">
					<Popup
						trigger={<button className="button-return"> Select user </button>}
						modal nested>
						<div className="menu-settings">
							<div className="menu-item-settings"> item 1</div>
							<div className="menu-item-settings"> item 2</div>
							<div className="menu-item-settings"> item 3</div>
						</div>
					</Popup>
					</div>
				</div>
				)}
			</Popup>
			</h2>)
		}
		{ (1 || 2) && (
			<h2>
				Ban user : &nbsp;&nbsp;
				<Popup trigger={<button>
					<AiOutlineUserDelete /></button>} modal nested>
				{(close: any) => (
				<div className='modal2'>
					<button className="close" onClick={close}>
					&times;
					</button>
					<div className="header"> Ban user</div>
					<div className="content">
					{' '}
					<pre>      Select user to ban from the chanel     </pre>
					</div>
					<div className="actions">
					<Popup
						trigger={<button className="button-return"> Select user </button>}
						modal nested>
						<div className="menu-settings">
							<div className="menu-item-settings"> item 1</div>
							<div className="menu-item-settings"> item 2</div>
							<div className="menu-item-settings"> item 3</div>
						</div>
					</Popup>
					</div>
				</div>
				)}
			</Popup>
			</h2>)
		}
		{ 1 && 3 && (
			<h2>
				Add password : &nbsp;&nbsp;
				<Popup trigger={<button>
					<GiPadlock /></button>} modal nested>
				{(close: any) => (
				<div className='modal2'>
					<button className="close" onClick={close}>
						&times;
					</button>
					<div className="header"> Add password to channel</div>
					<div className="content">
						{' '}
						<pre>   Please enter a new password   </pre>
					</div>
					<div className="actions">
						<input className="input-width" id='new password' type="text" ></input><button className="button-return">Set password</button>
					</div>
				</div>
				)}
			</Popup>
			</h2>)
		}
		{ 1 && 3 && (
			<h2>
				Modify password : &nbsp;&nbsp;
				<Popup trigger={<button>
					<RiRotateLockFill /></button>} modal nested>
				{(close: any) => (
				<div className='modal2'>
					<button className="close" onClick={close}>
					&times;
					</button>
					<div className="header"> Modify password</div>
					<div className="content">
					{' '}
					<pre>      Enter a new password      </pre>
					</div>
					<div className="actions"><div className="actions">
						<input className="input-width" id='new password' type="text" ></input><button className="button-return">Set new password</button>
					</div>
					</div>
				</div>
				)}
			</Popup>
			</h2>)
		}
		{ 1 && 3 && (
			<h2>
				Remove password : &nbsp;&nbsp;
				<Popup trigger={<button>
					<GiPadlockOpen /></button>} modal nested>
				{(close: any) => (
				<div className='modal2'>
					<button className="close" onClick={close}>
					&times;
					</button>
					<div className="header"> Remove password</div>
					<div className="content">
					{' '}
					<pre>    Remove the password   </pre>
					</div>
					<div className="actions">
						<button className="button-return"> Remove password </button>
					</div>
				</div>
				)}
			</Popup>
			</h2>)
		}
		{ (1 || 2) && (
			<h2>
				Mute user : &nbsp;&nbsp;
				<Popup trigger={<button>
					<GoMute /></button>} modal nested>
				{(close: any) => (
				<div className='modal2'>
					<button className="close" onClick={close}>
					&times;
					</button>
					<div className="header"> Mute user</div>
					<div className="content">
					{' '}
					<pre>      Select user to mute      </pre>
					</div>
					<div className="actions">
					<Popup
						trigger={<button className="button-return"> Select user </button>}
						modal nested>
						<div className="menu-settings">
							<div className="menu-item-settings"> item 1</div>
							<div className="menu-item-settings"> item 2</div>
							<div className="menu-item-settings"> item 3</div>
						</div>
					</Popup>
					</div>
				</div>
				)}
			</Popup>
			</h2>)
		}
		{ (1 || 2) && (
			<h2>
				Unmute user : &nbsp;&nbsp;
				<Popup trigger={<button>
					<GoUnmute /></button>} modal nested>
				{(close: any) => (
				<div className='modal2'>
					<button className="close" onClick={close}>
					&times;
					</button>
					<div className="header"> Unmute user</div>
					<div className="content">
					{' '}
					<pre>      Select user to unmute      </pre>
					</div>
					<div className="actions">
					<Popup
						trigger={<button className="button-return"> Select user </button>}
						modal nested>
						<div className="menu-settings">
							<div className="menu-item-settings"> item 1</div>
							<div className="menu-item-settings"> item 2</div>
							<div className="menu-item-settings"> item 3</div>
						</div>
					</Popup>
					</div>
				</div>
				)}
			</Popup>
			</h2>)
		}
		<Link to="/chat" className="button-return">Return</Link>
		</div>

	)
};

export default SettingsPage;