(() => {
 const $=id=>document.getElementById(id);
 const configured=window.MS_SUPABASE_URL && !window.MS_SUPABASE_URL.includes("PASTE_") && window.MS_SUPABASE_ANON_KEY && !window.MS_SUPABASE_ANON_KEY.includes("PASTE_");
 if(!configured){$("setupNotice").classList.remove("hidden");$("setupNotice").innerHTML="<b>Supabase setup required.</b><br>Open <code>supabase-config.js</code> and add your Project URL and anon/publishable key from Supabase → Project Settings → API Keys. Never use a service_role or secret key in this file.";}
 if(!window.supabase){$("loginStatus").textContent="Could not load Supabase library. Check your internet connection.";return;}
 const client=configured?window.supabase.createClient(window.MS_SUPABASE_URL,window.MS_SUPABASE_ANON_KEY):null;
 const bucket="ms-products";
 function status(id,msg){$(id).textContent=msg;}
 function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 async function showSession(){
  if(!client)return;
  const {data:{session}}=await client.auth.getSession();
  $("loginPanel").classList.toggle("hidden",!!session);
  $("dashboard").classList.toggle("hidden",!session);
  $("logoutBtn").classList.toggle("hidden",!session);
  if(session) await loadProducts();
 }
 $("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!client)return status("loginStatus","Add Supabase credentials first.");
  status("loginStatus","Signing in…");
  const {error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  if(error)return status("loginStatus",error.message);
  status("loginStatus","Signed in.");await showSession();
 });
 $("logoutBtn").addEventListener("click",async()=>{await client.auth.signOut();await showSession();});
 async function loadProducts(){
  status("listStatus","Loading designs…");
  const {data,error}=await client.from("products").select("*").order("created_at",{ascending:false});
  if(error){status("listStatus",error.message);return;}
  $("totalCount").textContent=data.length;
  $("productList").innerHTML=data.length?data.map(p=>`<article class="item"><img src="${safe(p.image_url)}" alt=""><div><strong>${safe(p.design_name)}</strong><small>${safe(p.category)} · ${p.is_active?"Active":"Hidden"}</small><br><small>${safe(p.description||"")}</small></div><div class="item-actions"><button class="outline" data-toggle="${p.id}" data-active="${p.is_active}">${p.is_active?"HIDE":"SHOW"}</button><button class="delete" data-delete="${p.id}" data-path="${safe(p.storage_path||"")}">DELETE</button></div></article>`).join(""):"<p>No designs yet. Upload your first design above.</p>";
  $("productList").querySelectorAll("[data-toggle]").forEach(b=>b.addEventListener("click",async()=>{const {error}=await client.from("products").update({is_active:b.dataset.active!=="true",updated_at:new Date().toISOString()}).eq("id",b.dataset.toggle);if(error)alert(error.message);else loadProducts();}));
  $("productList").querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",async()=>{if(!confirm("Delete this design and its uploaded photo?"))return;const path=b.dataset.path;if(path){const {error:storageError}=await client.storage.from(bucket).remove([path]);if(storageError){alert(storageError.message);return;}}const {error}=await client.from("products").delete().eq("id",b.dataset.delete);if(error)alert(error.message);else loadProducts();}));
  status("listStatus","");
 }
 $("photo").addEventListener("change",()=>{
  const files=Array.from($("photo").files||[]);
  $("filePreview").innerHTML=files.map(f=>`<div class="file-chip">${safe(f.name)} <small>${(f.size/1024/1024).toFixed(2)} MB</small></div>`).join("");
  status("uploadStatus",files.length?`${files.length} photo(s) selected.`:"");
 });
 $("productForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!client)return;
  const files=Array.from($("photo").files||[]);
  if(!files.length)return status("uploadStatus","Choose at least one photo.");
  const invalid=files.find(f=>f.size>5*1024*1024 || !["image/jpeg","image/png","image/webp"].includes(f.type));
  if(invalid)return status("uploadStatus",`${invalid.name}: use JPG, PNG or WebP up to 5 MB.`);
  $("uploadBtn").disabled=true;
  const prefix=$("designName").value.trim();
  const category=$("category").value;
  const description=$("description").value.trim()||null;
  let success=0,failed=[];
  for(let i=0;i<files.length;i++){
   const file=files[i];
   status("uploadStatus",`Uploading ${i+1} of ${files.length}: ${file.name}`);
   const ext=file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
   const path=`${Date.now()}-${crypto.randomUUID()}.${ext}`;
   const {error:upErr}=await client.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false});
   if(upErr){failed.push(`${file.name}: ${upErr.message}`);continue;}
   const {data:publicData}=client.storage.from(bucket).getPublicUrl(path);
   const generatedName=prefix?`${prefix} ${String(i+1).padStart(2,"0")}`:file.name.replace(/\\.[^.]+$/,"").replace(/[_-]+/g," ").trim();
   const {error:dbErr}=await client.from("products").insert({design_name:generatedName||`Design ${i+1}`,description,category,image_url:publicData.publicUrl,storage_path:path,is_active:true});
   if(dbErr){await client.storage.from(bucket).remove([path]);failed.push(`${file.name}: ${dbErr.message}`);}
   else success++;
  }
  $("productForm").reset();$("filePreview").innerHTML="";
  status("uploadStatus",`Completed: ${success} uploaded${failed.length?`; ${failed.length} failed: ${failed.join(" | ")}`:" successfully."}`);
  await loadProducts();$("uploadBtn").disabled=false;
 });
 $("refreshBtn").addEventListener("click",loadProducts);
 showSession();
})();
