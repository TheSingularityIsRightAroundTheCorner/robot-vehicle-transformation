(function(g){'use strict';
 g.WeaponProfiles={
  gemini:{label:'Gemini / Flash blades',states:['twin','docked','hilts'],defaultState:'twin',height:1.83,colors:{shell:'#168bd1',dark:'#20242c',metal:'#acbbc8'},beamColors:{red:'#ff4a3e',yellow:'#ffd648',green:'#48e286',blue:'#58b7ff'},dimensions:{grip:.22,blade:.93}},
  claude:{label:'Claude / Session claws',states:['retracted','drawn','complete'],defaultState:'drawn',height:1.88,colors:{shell:'#c94c48',dark:'#292f3a',metal:'#a4afb8'},dimensions:{cowl:.47,cowlWidth:.19,claw:.39,portProjection:.045,strapCount:3}},
  gpt:{label:'GPT / Constellation shield',states:['held','thrown','wall','sphere'],defaultState:'held',height:1.73,colors:{shell:'#747d8b',dark:'#303844',metal:'#bac5ce'},dimensions:{height:1.10,width:.60,depth:.045}}
 };
})(window);
