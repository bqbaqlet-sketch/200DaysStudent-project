const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'assets/television');
const rate=24000,beat=60/78,length=Math.round(8*4*beat*rate),samples=new Float64Array(length);
const chords=[[45,52,57,60,64,69],[41,48,53,57,60,65],[48,52,55,60,64,67],[43,50,55,59,62,67]];
const progression=[0,1,2,3,0,1,3,0],picking=[0,3,2,4,1,3,2,5];let seed=731219;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
for(let bar=0;bar<8;bar++)for(let pick=0;pick<8;pick++){
 const note=chords[progression[bar]][picking[pick]],frequency=440*2**((note-69)/12),period=Math.round(rate/frequency),string=new Float64Array(period);
 const offset=Math.round((bar*4+pick*.5)*beat*rate),amplitude=(pick===0?.40:.24)*( .94+.12*random());
 for(let i=0;i<period;i++)string[i]=(random()*2-1)*Math.sin(Math.PI*i/period);
 for(let pass=0;pass<3;pass++)for(let i=0;i<period;i++)string[i]=(string[i]+string[(i+1)%period])*.5;
 let previous=0;
 for(let i=0;i<Math.round(3.8*rate);i++){
  const at=i%period,value=string[at],next=string[(at+1)%period];string[at]=(value+next)*.4982;
  const t=i/rate,body=.06*Math.sin(2*Math.PI*frequency*t)*Math.exp(-t*2.4),attack=Math.min(1,i/65);
  previous=.70*(value+body)+.30*previous;samples[(offset+i)%length]+=previous*amplitude*attack;
 }
}
const dry=Float64Array.from(samples);for(let i=0;i<length;i++)for(const [seconds,gain] of [[.053,.12],[.097,.08],[.173,.055]])samples[i]+=dry[(i-Math.round(seconds*rate)+length)%length]*gain;
let peak=0;for(const x of samples)peak=Math.max(peak,Math.abs(x));const pcm=Buffer.alloc(length*2);let square=0;
for(let i=0;i<length;i++){const value=Math.tanh(samples[i]/peak*1.3)/Math.tanh(1.3)*.78;square+=value*value;pcm.writeInt16LE(Math.round(value*32767),i*2)}
const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
fs.writeFileSync(path.join(folder,'mom-guitar.wav'),Buffer.concat([header,pcm]));
const metadata={source:'Procedurally composed fingerpicked guitar; Karplus-Strong string synthesis',duration:length/rate,sampleRate:rate,channels:1,tempo:78,progression:'Am F C G / Am F G Am',peak:.78,rms:Math.sqrt(square/length),loop:true,picture:'mom-screen.jpg',pictureSource:'User attachment codex-clipboard-7fa644b9-8f6f-45fe-8fbb-b850fb6fc35e.jpg'};
fs.writeFileSync(path.join(folder,'mom-media.json'),JSON.stringify(metadata,null,2)+'\n');console.log(JSON.stringify(metadata,null,2));
