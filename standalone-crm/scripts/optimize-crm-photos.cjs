const sharp=require('../../node_modules/sharp');
const fs=require('fs');
const mapping=require('./crm-photo-sources.json');
const photos=[...Object.values(mapping),['lounge','feedback-learning-lounge.jpg']];
(async()=>{
 let before=0,desktop=0,mobile=0;
 for(const [slug,file] of photos){
  before+=fs.statSync(`public/images/crm-scenes/${slug}.webp`).size;
  for(const [suffix,width,quality] of [['light',1400,45],['mobile',800,40]]){
   const input=`../public/images/${file}`,base=`public/images/crm-scenes/${slug}-${suffix}`;
   await sharp(input).resize({width,withoutEnlargement:true}).avif({quality,effort:5}).toFile(base+'.avif');
   await sharp(input).resize({width,withoutEnlargement:true}).webp({quality:65,effort:5}).toFile(base+'.webp');
  }
  desktop+=fs.statSync(`public/images/crm-scenes/${slug}-light.avif`).size;
  mobile+=fs.statSync(`public/images/crm-scenes/${slug}-mobile.avif`).size;
 }
 console.log(JSON.stringify({photos:photos.length,previousBytes:before,desktopBytes:desktop,mobileBytes:mobile,desktopReduction:Math.round((1-desktop/before)*100),mobileReduction:Math.round((1-mobile/before)*100)}));
})();
