import React from 'react';
import {C, SANS, BRAND} from '../../lib/brand';
import {Progress} from './Chrome';
// Maquette fictive pédagogique. À remplacer par les écrans réels de votre produit.
export const DemoScreen: React.FC<{progress?: number}> = ({progress=0.5}) => (
 <div style={{height:'100%',background:C.white,fontFamily:SANS,padding:'110px 24px',color:C.dark}}>
  <div style={{fontSize:28,fontWeight:600}}>{BRAND.name}</div>
  <p style={{fontSize:20}}>Votre projet</p>
  <div style={{background:C.blue05,padding:24,borderRadius:16}}>
   <p>Une étape à la fois</p><Progress value={progress}/>
  </div>
  <p style={{fontSize:14,color:C.grey60}}>Interface fictive de démonstration</p>
 </div>
);
