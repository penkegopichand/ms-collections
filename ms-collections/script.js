// MS COLLECTIONS — static catalogue and WhatsApp enquiry form.
// This form opens WhatsApp with the customer's details. It does not store submissions in a database.

const WHATSAPP_NUMBER = "919347513231";
const SUPABASE_READY = window.supabase && window.MS_SUPABASE_URL &&
  !window.MS_SUPABASE_URL.includes("PASTE_") && window.MS_SUPABASE_ANON_KEY &&
  !window.MS_SUPABASE_ANON_KEY.includes("PASTE_");
const supabaseClient = SUPABASE_READY
  ? window.supabase.createClient(window.MS_SUPABASE_URL, window.MS_SUPABASE_ANON_KEY)
  : null;

function productImage(product) {
  return product.image_url || `images/products/${product.file}`;
}

let PRODUCTS = [
  {
    "file": "1.jpeg",
    "number": "01",
    "title": "Design 01"
  },
  {
    "file": "2.jpeg",
    "number": "02",
    "title": "Design 02"
  },
  {
    "file": "3.jpeg",
    "number": "03",
    "title": "Design 03"
  },
  {
    "file": "13.jpeg",
    "number": "04",
    "title": "Design 04"
  },
  {
    "file": "31.jpeg",
    "number": "05",
    "title": "Design 05"
  },
  {
    "file": "33.jpeg",
    "number": "06",
    "title": "Design 06"
  },
  {
    "file": "311.jpeg",
    "number": "07",
    "title": "Design 07"
  },
  {
    "file": "333.jpeg",
    "number": "08",
    "title": "Design 08"
  },
  {
    "file": "1312.jpeg",
    "number": "09",
    "title": "Design 09"
  },
  {
    "file": "31213.jpeg",
    "number": "10",
    "title": "Design 10"
  },
  {
    "file": "311132.jpeg",
    "number": "11",
    "title": "Design 11"
  },
  {
    "file": "12312131.jpeg",
    "number": "12",
    "title": "Design 12"
  },
  {
    "file": "b.jpeg",
    "number": "13",
    "title": "Design 13"
  },
  {
    "file": "c.jpeg",
    "number": "14",
    "title": "Design 14"
  },
  {
    "file": "cx.jpeg",
    "number": "15",
    "title": "Design 15"
  },
  {
    "file": "d.jpeg",
    "number": "16",
    "title": "Design 16"
  },
  {
    "file": "f.jpeg",
    "number": "17",
    "title": "Design 17"
  },
  {
    "file": "fd.jpeg",
    "number": "18",
    "title": "Design 18"
  },
  {
    "file": "fdsf.jpeg",
    "number": "19",
    "title": "Design 19"
  },
  {
    "file": "fsdfds.jpeg",
    "number": "20",
    "title": "Design 20"
  },
  {
    "file": "g.jpeg",
    "number": "21",
    "title": "Design 21"
  },
  {
    "file": "s.jpeg",
    "number": "22",
    "title": "Design 22"
  },
  {
    "file": "ss.jpeg",
    "number": "23",
    "title": "Design 23"
  },
  {
    "file": "vcx.jpeg",
    "number": "24",
    "title": "Design 24"
  },
  {
    "file": "vxvc.jpeg",
    "number": "25",
    "title": "Design 25"
  }
];
const grid=document.getElementById("productGrid");
const search=document.getElementById("search");
const count=document.getElementById("count");
const select=document.getElementById("photoSelect");
const viewer=document.getElementById("viewer");
const viewerImg=document.getElementById("viewerImg");
const viewerCaption=document.getElementById("viewerCaption");
const viewerEnquire=document.getElementById("viewerEnquire");
let visible=PRODUCTS.slice(),current=0,filter="all";

function whatsappUrl(message){return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;}
function enquiryText(product){return `Hello MS COLLECTIONS, I am interested in Photo ${product.number} (${product.title}). Please share the price and availability.`;}
function render(){
 const q=search.value.trim().toLowerCase();
 visible=PRODUCTS.filter(p=>{
  const cat=filter==="all"||filter==="other"; // Actual category labels can be assigned later after checking each image.
  return cat&&(`${p.number} ${p.title} ${p.file}`.toLowerCase().includes(q));
 });
 grid.innerHTML=visible.length?visible.map((p,i)=>`
 <article class="product-card" style="animation-delay:${Math.min(i*22,280)}ms">
  <div class="product-photo" data-view="${i}" role="button" tabindex="0" aria-label="Enlarge photo ${p.number}">
   <span class="number">${p.number}</span><img src="${productImage(p)}" alt="MS Collections photo ${p.number}" loading="lazy">
  </div>
  <div class="product-info"><strong>${p.title}</strong><span>PHOTO ${p.number}</span></div>
  <button class="ask" type="button" data-enquire="${p.number}">ASK ABOUT THIS DESIGN ↗</button>
 </article>`).join(""):`<div class="empty">No matching photos. Try another number.</div>`;
 grid.querySelectorAll("[data-view]").forEach(el=>{
  const open=()=>openViewer(Number(el.dataset.view));
  el.addEventListener("click",open);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
 });
 grid.querySelectorAll("[data-enquire]").forEach(btn=>btn.addEventListener("click",()=>{
  const p=PRODUCTS.find(x=>x.number===btn.dataset.enquire);
  window.open(whatsappUrl(enquiryText(p)),"_blank","noopener");
 }));
}
function openViewer(i){current=i;updateViewer();viewer.classList.add("open");viewer.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function updateViewer(){const p=visible[current];if(!p)return;viewerImg.src=productImage(p);viewerImg.alt=`MS Collections photo ${p.number}`;viewerCaption.textContent=`PHOTO ${p.number} · ${p.title}`;viewerEnquire.href=whatsappUrl(enquiryText(p));}
function closeViewer(){viewer.classList.remove("open");viewer.setAttribute("aria-hidden","true");document.body.style.overflow="";}
function moveViewer(step){if(!visible.length)return;current=(current+step+visible.length)%visible.length;updateViewer();}
search.addEventListener("input",render);
function rebuildPhotoSelect(){
 select.innerHTML='<option value="Not selected">Select a photo (optional)</option>';
 PRODUCTS.forEach(p=>{
  const o=document.createElement("option");
  o.value=p.number;
  o.textContent=`Photo ${p.number} — ${p.title}`;
  select.appendChild(o);
 });
}

async function loadCloudProducts(){
 if(!supabaseClient){rebuildPhotoSelect();render();return;}
 try{
  const {data,error}=await supabaseClient.from("products")
    .select("id,design_name,description,category,image_url,created_at")
    .eq("is_active",true).order("created_at",{ascending:false});
  if(error) throw error;
  // Keep the original 25 local designs and append cloud-uploaded designs.
  // Cloud numbering starts after the existing local catalogue to avoid duplicate photo numbers.
  if(Array.isArray(data) && data.length){
   const localProducts=PRODUCTS.filter(p=>p.file);
   const cloudProducts=data.map((p,index)=>({
    id:p.id,
    number:String(localProducts.length+index+1).padStart(2,"0"),
    title:p.design_name,
    description:p.description||"",
    category:p.category||"Other",
    image_url:p.image_url
   }));
   PRODUCTS=[...localProducts,...cloudProducts];
  }
 }catch(error){
  console.warn("MS COLLECTIONS cloud catalogue could not be loaded; showing the built-in gallery.",error);
 }
 rebuildPhotoSelect();
 render();
}

document.getElementById("enquiryForm").addEventListener("submit",e=>{
 e.preventDefault();const f=e.currentTarget;
 if(!f.reportValidity())return;
 const data=new FormData(f);
 const name=String(data.get("customerName")).trim();
 const phone=String(data.get("customerPhone")).trim();
 const category=String(data.get("category"));
 const photo=String(data.get("photo"));
 const message=String(data.get("message")).trim();
 const text=[
  "Hello MS COLLECTIONS! I would like to make an enquiry.",
  `Name: ${name}`,`My mobile number: ${phone}`,`Interested in: ${category}`,
  `Photo: ${photo==="Not selected"?"Not selected":`Photo ${photo}`}`,
  `Message: ${message||"No additional message"}`
 ].join("\\n");
 document.getElementById("formStatus").textContent="Opening WhatsApp with your enquiry. Please press Send in WhatsApp to submit it.";
 window.open(whatsappUrl(text),"_blank","noopener");
});
document.getElementById("viewerClose").addEventListener("click",closeViewer);
document.getElementById("prev").addEventListener("click",()=>moveViewer(-1));
document.getElementById("next").addEventListener("click",()=>moveViewer(1));
viewer.addEventListener("click",e=>{if(e.target===viewer)closeViewer();});
document.addEventListener("keydown",e=>{if(!viewer.classList.contains("open"))return;if(e.key==="Escape")closeViewer();if(e.key==="ArrowLeft")moveViewer(-1);if(e.key==="ArrowRight")moveViewer(1);});
document.getElementById("year").textContent=new Date().getFullYear();
loadCloudProducts();
