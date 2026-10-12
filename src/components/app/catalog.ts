import type React from 'react';
import {DemoScreen} from './Screens';
// Ajouter les captures réelles dans references/product-ui et déclarer leur chemin ici.
// La seule entrée initiale est explicitement fictive : aucune capture produit n'est prétendue.
export type ScreenEntry = {id:string; capture:string; label:string; component:React.FC<any>; states:{label:string;props:Record<string,unknown>}[]};
export const SCREENS: ScreenEntry[] = [
 {id:'demo',capture:'README.md',label:'Maquette fictive — à remplacer',component:DemoScreen,states:[
  {label:'début',props:{progress:0.1}}, {label:'en cours',props:{progress:0.5}}, {label:'terminé',props:{progress:1}},
 ]},
];
