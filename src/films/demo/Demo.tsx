import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SANS} from '../../lib/brand';
import {useFormat} from '../../lib/format';
import {sp} from '../../lib/motion';
import {Logo} from '../../components/Logo';
import type {DemoProps} from './schema';
import {T} from './timeline';

// Exemple pédagogique : aucune promesse produit, aucun écran client, aucun son.
export const Demo: React.FC<DemoProps> = ({titres}) => {
 const frame = useCurrentFrame(); const {fps} = useVideoConfig();
 const {kind, u, width, height} = useFormat();
 const section = frame < T.second ? 0 : frame < T.third ? 1 : 2;
 const local = frame - [0, T.second, T.third][section];
 const enter = sp(local, fps, 0, 'heavy');
 const opacity = interpolate(local, [0, T.transition], [0,1], {extrapolateRight:'clamp'});
 const layout = {
  vertical: {left:100, top:570, textWidth:780, size:78, shapeX:430, shapeY:1030},
  square: {left:90, top:250, textWidth:900, size:78, shapeX:540, shapeY:700},
  landscape: {left:140, top:350, textWidth:950, size:88, shapeX:1450, shapeY:540},
 }[kind];
 return <AbsoluteFill style={{background:C.white, fontFamily:SANS, color:C.dark}}>
  <div style={{position:'absolute',left:layout.left*u,top:layout.top*u,width:layout.textWidth*u}}>
   <div key={section} data-qa="caption" style={{fontSize:layout.size*u,fontWeight:600,lineHeight:1.2,opacity,transform:`translateY(${(1-enter)*24*u}px)`}}>{titres[section]}</div>
   <div style={{marginTop:50*u}}><Logo size={56*u} color="gradient"/></div>
  </div>
  <div data-motion="forme" style={{position:'absolute',left:layout.shapeX*u-110*u,top:layout.shapeY*u-110*u,width:220*u,height:220*u,background:C.blue,borderRadius:section===1?'50%':40*u,transform:`rotate(${frame*0.65}deg) scale(${1+0.08*Math.sin(frame/18)})`}}/>
  <div style={{position:'absolute',left:width*.08,bottom:height*.09,width:width*.84,height:8*u,background:C.grey10,borderRadius:8*u}}>
   <div style={{width:`${(frame+1)/300*100}%`,height:'100%',background:C.blue,borderRadius:8*u}}/>
  </div>
 </AbsoluteFill>;
};
