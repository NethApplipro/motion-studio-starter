import React from 'react';
import {C, SANS} from '../lib/brand';
import {Icon} from './app/Icons';

// Les éléments du « premier jour à l'ancienne » : mails, PDF, message vague du manager.
export const CHAOS_ITEMS = [
	{kind: 'mail', title: 'Bienvenue parmi nous ! (1/3)', meta: 'Service RH · 08:12'},
	{kind: 'pdf', title: 'Livret_accueil_v4_FINAL.pdf', meta: '12,4 Mo'},
	{kind: 'mail', title: 'Documents à renvoyer avant lundi', meta: 'Service RH · 09:47'},
	{kind: 'pdf', title: 'Mutuelle_formulaire_2026.pdf', meta: '3,1 Mo'},
	{kind: 'mail', title: 'RE: RE: RE: Infos pratiques', meta: 'Accueil · 17:03'},
	{kind: 'note', title: 'Tu verras avec ton manager lundi matin', meta: 'Message'},
] as const;

export const ChaosCard: React.FC<{item: (typeof CHAOS_ITEMS)[number]; u: number}> = ({item, u}) => {
	const icon = item.kind === 'pdf' ? 'pdf' : item.kind === 'mail' ? 'mail' : 'chat';
	return (
		<div style={{width: 440 * u, background: '#FFFFFF', borderRadius: 18 * u, padding: `${18 * u}px ${20 * u}px`, display: 'flex', gap: 14 * u, alignItems: 'center', fontFamily: SANS, boxShadow: `0 ${2 * u}px ${6 * u}px rgba(14,14,82,.06), 0 ${18 * u}px ${40 * u}px -${16 * u}px rgba(14,14,82,.22)`, border: `1px solid ${C.grey10}`}}>
			<div style={{width: 48 * u, height: 48 * u, flex: 'none', borderRadius: 12 * u, background: C.grey05, color: C.grey60, display: 'grid', placeItems: 'center'}}>
				<Icon name={icon} size={26 * u} />
			</div>
			<div style={{minWidth: 0}}>
				<div style={{fontSize: 21 * u, fontWeight: 600, color: C.black, whiteSpace: item.kind === 'note' ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3, fontStyle: item.kind === 'note' ? 'italic' : 'normal'}}>
					{item.kind === 'note' ? `« ${item.title} »` : item.title}
				</div>
				<div style={{fontSize: 16 * u, color: C.grey40, marginTop: 2 * u}}>{item.meta}</div>
			</div>
		</div>
	);
};
