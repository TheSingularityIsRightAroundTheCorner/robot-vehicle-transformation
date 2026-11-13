/* Small uncompressed ZIP writer for browser-authored PNG passes. No dependencies. */
(function(global){'use strict';
 const encoder=new TextEncoder(),table=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 function crc32(bytes){let crc=0xffffffff;for(const b of bytes)crc=table[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
 function header(length,values){const bytes=new Uint8Array(length),view=new DataView(bytes.buffer);for(const [offset,size,value] of values)view['setUint'+size](offset,value,true);return bytes;}
 function zip(files){const body=[],directory=[];let offset=0,directorySize=0;
  for(const {name,bytes} of files){const path=encoder.encode(name),crc=crc32(bytes),local=header(30,[[0,32,0x04034b50],[4,16,20],[6,16,0x800],[12,16,33],[14,32,crc],[18,32,bytes.length],[22,32,bytes.length],[26,16,path.length]]),central=header(46,[[0,32,0x02014b50],[4,16,20],[6,16,20],[8,16,0x800],[14,16,33],[16,32,crc],[20,32,bytes.length],[24,32,bytes.length],[28,16,path.length],[42,32,offset]]);body.push(local,path,bytes);directory.push(central,path);offset+=local.length+path.length+bytes.length;directorySize+=central.length+path.length;
  }
  return new Blob([...body,...directory,header(22,[[0,32,0x06054b50],[8,16,files.length],[10,16,files.length],[12,32,directorySize],[16,32,offset]])],{type:'application/zip'});
 }
 global.DowntownParallaxExport={zip};
})(window);
