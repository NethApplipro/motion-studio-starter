import React from 'react';
import {C, GRADIENT, SANS} from '../../lib/brand';
import {LogoMark} from '../Logo';
import {Icon, IconName} from './Icons';

export const AppMark: React.FC<{size?: number}> = ({size = 32}) => (
	<div style={{width: size, height: size, borderRadius: size * 0.28, background: GRADIENT, display: 'grid', placeItems: 'center'}}>
		<LogoMark size={size * 0.62} />
	</div>
);

export const TopBar: React.FC = () => (
	<div style={{position: 'absolute', top: 54, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
		<AppMark />
		<div style={{width: 34, height: 34, borderRadius: 10, background: '#FFFFFF', boxShadow: '0 1px 4px rgba(14,14,82,.08)', display: 'grid', placeItems: 'center', color: C.black}}>
			<Icon name="bell" size={18} />
		</div>
	</div>
);

const tabs: {label: string; icon: IconName}[] = [
	{label: 'Accueil', icon: 'home'},
	{label: 'Projets', icon: 'book'},
	{label: 'Activité', icon: 'news'},
	{label: 'Messages', icon: 'chat'},
	{label: 'Outils', icon: 'tools'},
	{label: 'Profil', icon: 'user'},
];

export const TabBar: React.FC<{active: string}> = ({active}) => (
	<div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 84, background: '#FFFFFF', borderTop: `1px solid ${C.grey10}`, display: 'flex', justifyContent: 'space-around', paddingTop: 10, fontFamily: SANS}}>
		{tabs.map(({label, icon}) => {
			const on = label === active;
			return (
				<div key={label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: on ? C.blue : C.grey40, fontSize: 10, fontWeight: on ? 600 : 500}}>
					<Icon name={icon} size={21} />
					{label}
				</div>
			);
		})}
	</div>
);

export const Progress: React.FC<{value: number; height?: number}> = ({value, height = 6}) => (
	<div style={{height, borderRadius: 99, background: C.blue05, overflow: 'hidden'}}>
		<div style={{width: `${Math.max(3, value * 100)}%`, height: '100%', borderRadius: 99, background: C.blue}} />
	</div>
);

export const Button: React.FC<{children: React.ReactNode; pressed?: number}> = ({children, pressed = 0}) => (
	<div style={{background: C.blue, color: '#FFFFFF', fontWeight: 600, fontSize: 13.5, borderRadius: 10, padding: '10px 18px', transform: `scale(${1 - pressed * 0.06})`}}>{children}</div>
);
