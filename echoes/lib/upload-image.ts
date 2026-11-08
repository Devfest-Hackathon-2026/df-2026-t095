import sharp from 'sharp';
export const maxUploadBytes=8*1024*1024;
export class InputError extends Error{status:number;constructor(message:string,status=400){super(message);this.status=status;}}
export async function readLimitedBody(request:Request,limit:number){
 if(Number(request.headers.get('content-length'))>limit)throw new InputError('写真は8 MB以内にしてください。',413);
 const reader=request.body?.getReader();if(!reader)throw new InputError('写真を選んでください。');const chunks:Uint8Array[]=[];let size=0;
 while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>limit){await reader.cancel();throw new InputError('写真は8 MB以内にしてください。',413);}chunks.push(part.value);}return Buffer.concat(chunks);
}
export async function prepareUpload(bytes:Buffer,declaredMime:string){
 if(!bytes.length||bytes.length>maxUploadBytes)throw new InputError('写真は8 MB以内にしてください。',413);
 if(!['image/jpeg','image/png','image/webp'].includes(declaredMime))throw new InputError('JPEG・PNG・WebPの写真を選んでください。');
 const format=bytes[0]===0xff&&bytes[1]===0xd8?'jpeg':bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'?'webp':null;
 if(!format||declaredMime!==`image/${format==='jpeg'?'jpeg':format}`)throw new InputError('写真の形式を確認できませんでした。画像として保存し直してください。');
 try{const image=sharp(bytes,{limitInputPixels:24_000_000,failOn:'warning'});const metadata=await image.metadata();if(!metadata.width||!metadata.height||metadata.width<32||metadata.height<32||(metadata.pages||1)>1)throw new Error('invalid image');
 // メタデータを付け直さずに再エンコード。EXIF/GPSを出力へ渡さない。
 const data=await image.rotate().resize({width:1536,height:1536,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:85}).toBuffer();return{data,mime:'image/jpeg' as const};
 }catch{throw new InputError('写真を読み込めませんでした。2,400万画素以内のJPEG・PNG・WebPを選んでください。');}
}
