import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let language = localStorage.getItem("lvc-language") || "my";
let authMode = "login";
let currentUser = null;
let currentProfile = null;

const translations = {
  my: {
    eyebrow:"FORE RUNNERS ORGANIZATION", heroTitle:"ကျွမ်းကျင်မှု တည်ဆောက်ပါ။ အသက်မွေးဝမ်းကျောင်း ဖန်တီးပါ။",
    heroText:"အခြေခံမှ အဆင့်မြင့်အထိ လက်တွေ့အခြေပြု သင်ယူမှုဖြင့် မိမိအသက်မွေးဝမ်းကျောင်းကို တည်ဆောက်ပါ။",
    access:"LEARNER ACCESS", welcome:"သင်ယူမှုစတင်ရန် ဝင်ရောက်ပါ", approvalNote:"သင်တန်းဝင်ခွင့်ကို ForeRunners အဖွဲ့မှ အတည်ပြုပေးရပါမည်။",
    loginTab:"အကောင့်ဝင်ရန်", signupTab:"အကောင့်ဖွင့်ရန်", fullName:"အမည်", email:"အီးမေးလ်", password:"စကားဝှက်",
    login:"အကောင့်ဝင်ရန်", signup:"အကောင့်ဖွင့်ရန်", signout:"ထွက်ရန်", pendingTitle:"အတည်ပြုရန် စောင့်ဆိုင်းနေပါသည်",
    pendingText:"သင့်အကောင့်ကို အဖွဲ့မှ စစ်ဆေးအတည်ပြုပြီးနောက် သင်တန်းလျှောက်ထားနိုင်ပါမည်။",
    learnerSpace:"LEARNER SPACE", hello:"မင်္ဂလာပါ", coursesTitle:"သင်တန်းများ",
    coursesText:"သင်ယူလိုသော အဆင့်ကို ရွေးချယ်ပြီး လျှောက်ထားပါ။ အတည်ပြုပြီးမှ သင်ခန်းစာများကို ဝင်ရောက်နိုင်ပါမည်။",
    myEnrollments:"ကျွန်ုပ်၏ သင်တန်းလျှောက်ထားမှုများ", noEnrollments:"လျှောက်ထားမှု မရှိသေးပါ။",
    adminTitle:"သင်တန်းစီမံခန့်ခွဲမှု", pendingLearners:"အတည်ပြုရန် အကောင့်များ", pendingApps:"သင်တန်းလျှောက်ထားမှုများ",
    basicInfo:"BASIC — အခြေခံကျွမ်းကျင်မှု", advancedInfo:"ADVANCED — တိုးတက်ဖွံ့ဖြိုးမှု", capacityInfo:"စီစဉ်ထားသော သင်တန်းသားဦးရေ",
    apply:"လျှောက်ထားရန်", applied:"လျှောက်ထားပြီး", approved:"အတည်ပြုပြီး", pending:"စောင့်ဆိုင်းဆဲ", rejected:"ပယ်ချထားသည်",
    approve:"အတည်ပြု", reject:"ပယ်ချ", noPending:"စောင့်ဆိုင်းနေသော အရာမရှိပါ။", accountApproved:"အကောင့်အတည်ပြုပြီးပါပြီ။",
    authError:"လုပ်ဆောင်မှု မအောင်မြင်ပါ။", appliedMsg:"သင်တန်းလျှောက်ထားမှုကို လက်ခံရရှိပါပြီ။",
    signUpSuccess:"အီးမေးလ်ကို အတည်ပြုပြီးမှ အကောင့်ဝင်ပါ။", courseBasic:"အခြေခံအဆင့်", courseAdvanced:"အဆင့်မြင့်",
    basicDesc:"အသက်မွေးဝမ်းကျောင်းအတွက် အခြေခံကျွမ်းကျင်မှု၊ ဘဝကျွမ်းကျင်မှုနှင့် ငွေကြေးစီမံမှု။",
    advancedDesc:"အသက်မွေးဝမ်းကျောင်း တိုးချဲ့ခြင်း၊ စီးပွားရေးစီမံမှုနှင့် ဈေးကွက်ချိတ်ဆက်မှု။"
  },
  en: {
    eyebrow:"FORE RUNNERS ORGANIZATION", heroTitle:"Build Skills. Create Livelihoods.",
    heroText:"Develop your livelihood through practical learning, from foundational skills to advanced growth.",
    access:"LEARNER ACCESS", welcome:"Sign in to start learning", approvalNote:"Course access is granted after approval by the ForeRunners team.",
    loginTab:"Sign in", signupTab:"Create account", fullName:"Full name", email:"Email", password:"Password",
    login:"Sign in", signup:"Create account", signout:"Sign out", pendingTitle:"Your account is awaiting approval",
    pendingText:"The ForeRunners team will review your account. You can apply for a course after approval.",
    learnerSpace:"LEARNER SPACE", hello:"Welcome,", coursesTitle:"Available courses",
    coursesText:"Choose a level and submit an application. Lessons become available after your course enrollment is approved.",
    myEnrollments:"My course applications", noEnrollments:"You have not applied for a course yet.",
    adminTitle:"Learning Center Administration", pendingLearners:"Accounts awaiting approval", pendingApps:"Course applications",
    basicInfo:"BASIC — Foundation Skills", advancedInfo:"ADVANCED — Growth Stage", capacityInfo:"Planned learner capacity",
    apply:"Apply", applied:"Applied", approved:"Approved", pending:"Pending", rejected:"Rejected",
    approve:"Approve", reject:"Reject", noPending:"Nothing is waiting for review.", accountApproved:"Account approved.",
    authError:"The action could not be completed.", appliedMsg:"Your course application has been received.",
    signUpSuccess:"Please verify your email before signing in.", courseBasic:"Basic Level", courseAdvanced:"Advanced Level",
    basicDesc:"Foundational vocational skills, life skills and basic financial literacy for livelihoods.",
    advancedDesc:"Livelihood growth, business management, financial planning and market linkages."
  }
};
const t = (key) => translations[language][key] || key;
const el = (id) => document.getElementById(id);
const show = (id, visible=true) => el(id).classList.toggle("hidden", !visible);
const setMessage = (id, text, error=false) => { el(id).textContent=text; el(id).classList.toggle("error",error); };

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach(node => {
    const key=node.dataset.i18n;
    if (translations[language][key]) node.textContent=translations[language][key];
  });
  el("lang-toggle").textContent = language === "my" ? "English" : "မြန်မာ";
  el("login-tab").textContent=t("loginTab");
  el("signup-tab").textContent=t("signupTab");
  el("auth-submit").textContent=t(authMode);
  el("name-field").classList.toggle("hidden",authMode!=="signup");
}
el("lang-toggle").addEventListener("click",()=>{language=language==="my"?"en":"my";localStorage.setItem("lvc-language",language);applyLanguage();});
function setAuthMode(mode){authMode=mode;el("login-tab").classList.toggle("active",mode==="login");el("signup-tab").classList.toggle("active",mode==="signup");applyLanguage();setMessage("auth-message","");}
el("login-tab").addEventListener("click",()=>setAuthMode("login"));
el("signup-tab").addEventListener("click",()=>setAuthMode("signup"));

el("auth-form").addEventListener("submit",async (event)=>{
  event.preventDefault(); const email=el("email").value.trim(); const password=el("password").value;
  const button=el("auth-submit");button.disabled=true;setMessage("auth-message","");
  try{
    if(authMode==="signup"){
      const fullName=el("full-name").value.trim();
      if(!fullName) throw new Error(language==="my"?"အမည်ဖြည့်ပါ။":"Please enter your name.");
      const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName}}});
      if(error) throw error;setMessage("auth-message",t("signUpSuccess"));
    }else{
      const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
    }
  }catch(error){setMessage("auth-message",error.message||t("authError"),true);}
  finally{button.disabled=false;}
});

el("signout-btn").addEventListener("click",async()=>{await supabase.auth.signOut();});
async function loadProfile(){
  const {data,error}=await supabase.from("profiles").select("*").eq("id",currentUser.id).single();
  if(error) throw error;currentProfile=data;
  show("auth-section",false);show("signout-btn",true);
  if(data.account_status!=="approved"){
    show("pending-section",true);show("learner-section",false);show("admin-section",false);return;
  }
  show("pending-section",false);el("learner-name").textContent=data.full_name||currentUser.email;
  show("learner-section",true);
  if(data.role==="admin"){show("admin-section",true);await loadAdmin();}
  await loadCourses();await loadEnrollments();
}
async function loadCourses(){
  const {data,error}=await supabase.from("courses").select("id,title_my,title_en,description_my,description_en,level").eq("is_published",true).order("sort_order");
  if(error)throw error;
  const {data:enrols}=await supabase.from("enrollments").select("course_id").eq("learner_id",currentUser.id);
  const applied=new Set((enrols||[]).map(x=>x.course_id));
  el("course-list").innerHTML=(data||[]).map(c=>{
    const title=language==="my"?c.title_my:c.title_en;const desc=language==="my"?c.description_my:c.description_en;
    const label=c.level==="BASIC"?t("courseBasic"):t("courseAdvanced");
    return `<article class="course-card"><span class="level">${c.level}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(desc||"")}</p><button class="small-btn" data-apply="${c.id}" ${applied.has(c.id)?"disabled":""}>${applied.has(c.id)?t("applied"):t("apply")}</button></article>`;
  }).join("")||`<p class="muted">${t("noPending")}</p>`;
  document.querySelectorAll("[data-apply]").forEach(btn=>btn.addEventListener("click",()=>applyCourse(btn.dataset.apply,btn)));
}
async function applyCourse(courseId,button){
  button.disabled=true;
  const {error}=await supabase.from("enrollments").insert({learner_id:currentUser.id,course_id:courseId,status:"pending"});
  if(error){button.disabled=false;alert(error.message);return;}
  alert(t("appliedMsg"));await loadCourses();await loadEnrollments();
}
async function loadEnrollments(){
  const {data,error}=await supabase.from("enrollments").select("id,status,applied_at,courses(title_my,title_en,level),batches(name)").eq("learner_id",currentUser.id).order("applied_at",{ascending:false});
  if(error)throw error;
  el("enrollment-list").innerHTML=(data||[]).map(row=>{
    const course=row.courses?.[language==="my"?"title_my":"title_en"]||"Course";
    const status=t(row.status)||row.status;
    return `<div class="enrol-row"><span><b>${escapeHtml(course)}</b><br><small class="muted">${row.batches?.name||""}</small></span><span class="chip">${escapeHtml(status)}</span></div>`;
  }).join("")||`<div class="list-empty muted">${t("noEnrollments")}</div>`;
}
async function loadAdmin(){
  const [{data:users,error:userErr},{data:apps,error:appErr}]=await Promise.all([
    supabase.from("profiles").select("id,full_name,phone,created_at").eq("account_status","pending").order("created_at"),
    supabase.from("enrollments").select("id,status,applied_at,profiles(full_name),courses(title_my,title_en,level)").eq("status","pending").order("applied_at")
  ]);
  if(userErr)throw userErr;if(appErr)throw appErr;
  el("pending-users").innerHTML=(users||[]).map(u=>`<div class="admin-row"><span><b>${escapeHtml(u.full_name||"Learner")}</b><br><small class="muted">${escapeHtml(u.phone||"")}</small></span><div class="row-actions"><button class="small-btn approve" data-user-approve="${u.id}">${t("approve")}</button><button class="small-btn reject" data-user-reject="${u.id}">${t("reject")}</button></div></div>`).join("")||`<p class="muted">${t("noPending")}</p>`;
  el("pending-enrollments").innerHTML=(apps||[]).map(a=>`<div class="admin-row"><span><b>${escapeHtml(a.profiles?.full_name||"Learner")}</b><br><small class="muted">${escapeHtml(a.courses?.[language==="my"?"title_my":"title_en"]||"Course")}</small></span><div class="row-actions"><button class="small-btn approve" data-app-approve="${a.id}">${t("approve")}</button><button class="small-btn reject" data-app-reject="${a.id}">${t("reject")}</button></div></div>`).join("")||`<p class="muted">${t("noPending")}</p>`;
  document.querySelectorAll("[data-user-approve]").forEach(b=>b.addEventListener("click",()=>reviewUser(b.dataset.userApprove,"approved")));
  document.querySelectorAll("[data-user-reject]").forEach(b=>b.addEventListener("click",()=>reviewUser(b.dataset.userReject,"rejected")));
  document.querySelectorAll("[data-app-approve]").forEach(b=>b.addEventListener("click",()=>reviewEnrollment(b.dataset.appApprove,"approved")));
  document.querySelectorAll("[data-app-reject]").forEach(b=>b.addEventListener("click",()=>reviewEnrollment(b.dataset.appReject,"rejected")));
}
async function reviewUser(id,status){
  const {error}=await supabase.from("profiles").update({account_status:status,updated_at:new Date().toISOString()}).eq("id",id);
  if(error){alert(error.message);return;}await loadAdmin();
}
async function reviewEnrollment(id,status){
  const {error}=await supabase.from("enrollments").update({status,reviewed_at:new Date().toISOString(),reviewed_by:currentUser.id}).eq("id",id);
  if(error){alert(error.message);return;}await loadAdmin();
}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

async function handleSession(session){
  currentUser=session?.user||null;
  if(!currentUser){currentProfile=null;show("auth-section",true);show("pending-section",false);show("learner-section",false);show("admin-section",false);show("signout-btn",false);return;}
  try{await loadProfile();}catch(error){setMessage("auth-message",error.message||t("authError"),true);}
}
applyLanguage();
const {data:{session}}=await supabase.auth.getSession();
await handleSession(session);
supabase.auth.onAuthStateChange((_event,nextSession)=>{queueMicrotask(()=>handleSession(nextSession));});
