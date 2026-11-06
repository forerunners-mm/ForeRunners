import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

// Prevent a stalled Auth/Data API request from leaving the learner login button disabled forever.
const SUPABASE_REQUEST_TIMEOUT_MS = 20000;
const fetchWithTimeout = (input, init = {}) => fetch(input, {
  ...init,
  signal: init.signal || AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS)
});
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { fetch: fetchWithTimeout },
  db: { timeout: SUPABASE_REQUEST_TIMEOUT_MS }
});
let language = localStorage.getItem("lvc-language") || "my";
let authMode = "login";
let currentUser = null;
let currentProfile = null;
let learningLessons = new Map();

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
    authError:"လုပ်ဆောင်မှု မအောင်မြင်ပါ။", authTimeout:"ချိတ်ဆက်မှု ကြာမြင့်နေပါသည်။ အင်တာနက်နှင့် Supabase ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။", authNetwork:"ဆာဗာသို့ ချိတ်ဆက်မရပါ။ အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။", authWorking:"အကောင့်ကို စစ်ဆေးနေပါသည်။ ခဏစောင့်ပါ...", appliedMsg:"သင်တန်းလျှောက်ထားမှုကို လက်ခံရရှိပါပြီ။",
    signUpSuccess:"အီးမေးလ်ကို အတည်ပြုပြီးမှ အကောင့်ဝင်ပါ။", courseBasic:"အခြေခံအဆင့်", courseAdvanced:"အဆင့်မြင့်",
    basicDesc:"အသက်မွေးဝမ်းကျောင်းအတွက် အခြေခံကျွမ်းကျင်မှု၊ ဘဝကျွမ်းကျင်မှုနှင့် ငွေကြေးစီမံမှု။",
    learningTitle:"ကျွန်ုပ်၏ သင်ယူမှု", learningIntro:"အတည်ပြုပြီးသော သင်တန်းများ၏ သင်ခန်းစာများကို လေ့လာပါ။", noLessons:"ဤသင်တန်းတွင် သင်ခန်းစာ မတင်ရသေးပါ။", openLesson:"သင်ခန်းစာ ဖတ်ရန်", markComplete:"သင်ခန်းစာ ပြီးဆုံးကြောင်း မှတ်သားရန်", completedLabel:"ပြီးဆုံးပြီး", inProgressLabel:"လေ့လာနေဆဲ", progressLabel:"တိုးတက်မှု", lessonBack:"သင်ခန်းစာစာရင်းသို့ ပြန်ရန်", quizTitle:"အသိပညာ စစ်ဆေးမှု", startQuiz:"Quiz စတင်ရန်", submitQuiz:"အဖြေတင်သွင်းရန်", quizPass:"အောင်မြင်ပါပြီ", quizFail:"ထပ်မံလေ့လာရန် လိုအပ်ပါသည်", quizScore:"ရမှတ်", quizLoading:"Quiz ဖွင့်နေပါသည်...", quizEmpty:"မေးခွန်းများ မရှိသေးပါ။", quizSubmitted:"Quiz တင်သွင်းပြီးပါပြီ။", quizError:"Quiz တင်သွင်းမှု မအောင်မြင်ပါ။",
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
    authError:"The action could not be completed.", authTimeout:"The server took too long to respond. Check your connection and try again.", authNetwork:"Could not connect to the server. Check your internet connection and try again.", authWorking:"Checking your account. Please wait...", appliedMsg:"Your course application has been received.",
    signUpSuccess:"Please verify your email before signing in.", courseBasic:"Basic Level", courseAdvanced:"Advanced Level",
    basicDesc:"Foundational vocational skills, life skills and basic financial literacy for livelihoods.",
    learningTitle:"My Learning", learningIntro:"Open lessons in the courses approved for you.", noLessons:"No lessons have been published for this course yet.", openLesson:"Open lesson", markComplete:"Mark lesson as complete", completedLabel:"Completed", inProgressLabel:"In progress", progressLabel:"Progress", lessonBack:"Back to lesson list", quizTitle:"Knowledge Check", startQuiz:"Start quiz", submitQuiz:"Submit answers", quizPass:"Passed", quizFail:"Keep learning and try again", quizScore:"Score", quizLoading:"Loading quiz...", quizEmpty:"No questions are available yet.", quizSubmitted:"Your quiz has been submitted.", quizError:"Quiz submission failed.",
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
el("lang-toggle").addEventListener("click",()=>{language=language==="my"?"en":"my";localStorage.setItem("lvc-language",language);applyLanguage();if(currentUser)handleSession({user:currentUser});});
function setAuthMode(mode){authMode=mode;el("login-tab").classList.toggle("active",mode==="login");el("signup-tab").classList.toggle("active",mode==="signup");applyLanguage();setMessage("auth-message","");}
el("login-tab").addEventListener("click",()=>setAuthMode("login"));
el("signup-tab").addEventListener("click",()=>setAuthMode("signup"));

el("auth-form").addEventListener("submit",async (event)=>{
  event.preventDefault();
  if(el("auth-submit").disabled)return;
  const email=el("email").value.trim();
  const password=el("password").value;
  const button=el("auth-submit");
  button.disabled=true;
  setMessage("auth-message",t("authWorking"));
  try{
    if(authMode==="signup"){
      const fullName=el("full-name").value.trim();
      if(!fullName) throw new Error(language==="my"?"အမည်ဖြည့်ပါ။":"Please enter your name.");
      const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName}}});
      if(error) throw error;
      setMessage("auth-message",t("signUpSuccess"));
    }else{
      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error)throw error;
    }
  }catch(error){
    const detail=String(error?.message||"");
    const timedOut=error?.name==="TimeoutError"||error?.name==="AbortError"||/timed out|timeout|aborted/i.test(detail);
    const networkFailure=/failed to fetch|networkerror|network request failed/i.test(detail);
    setMessage("auth-message",timedOut?t("authTimeout"):networkFailure?t("authNetwork"):(detail||t("authError")),true);
  }finally{
    button.disabled=false;
  }
});

el("signout-btn").addEventListener("click",async()=>{await supabase.auth.signOut();});
let trainerWorkspace={assignments:[],courses:[],modules:[],lessons:[],assessments:[],learners:[],stageAssignments:[],activitySubmissions:[],stageReviewError:null};
async function loadTrainerWorkspace(){
 const {data:assignments,error}=await supabase.from("course_trainers").select("id,course_id,courses(id,title_my,title_en,level)").eq("trainer_id",currentUser.id);
 if(error)throw error;trainerWorkspace.assignments=assignments||[];
 await loadTrainerStageReviews();
 const ids=trainerWorkspace.assignments.map(x=>x.course_id);
 if(!ids.length){el("trainer-course-list").innerHTML='<p class="muted">No courses assigned yet. Please contact the administrator.</p>';el("trainer-module").innerHTML="";return;}
 const [m,l]=await Promise.all([
  supabase.from("modules").select("id,course_id,title_my,title_en,sort_order").in("course_id",ids).order("sort_order"),
  supabase.from("lessons").select("id,module_id,title_my,title_en,content_my,content_en,video_url,content_status,version_no,is_published,sort_order").order("sort_order")
 ]);
 if(m.error||l.error)throw m.error||l.error;
 trainerWorkspace.courses=assignments.map(x=>x.courses).filter(Boolean);trainerWorkspace.modules=m.data||[];
 const courseSelect=el("assessment-course"),keepCourse=courseSelect.value;
 courseSelect.innerHTML=trainerWorkspace.courses.map(c=>'<option value="'+c.id+'">'+adminEsc(language==="my"?c.title_my:c.title_en)+'</option>').join("");
 if(trainerWorkspace.courses.some(c=>c.id===keepCourse))courseSelect.value=keepCourse;
 await loadTrainerAssessmentLearners();
 const {data:myAssessments,error:assessmentError}=await supabase.from("learner_evaluations").select("id,course_id,learner_id,assessment_type,overall_score,status,assessed_at,learner:profiles!learner_evaluations_learner_id_fkey(full_name),courses(title_my,title_en)").eq("trainer_id",currentUser.id).order("assessed_at",{ascending:false}).limit(50);
 if(assessmentError)throw assessmentError;
 trainerWorkspace.assessments=myAssessments||[];
 renderTrainerAssessments();
 el("assessment-course").onchange=loadTrainerAssessmentLearners;
 el("trainer-assessment-form").onsubmit=saveTrainerAssessment;

 const moduleIds=trainerWorkspace.modules.map(x=>x.id);
 trainerWorkspace.lessons=(l.data||[]).filter(x=>moduleIds.includes(x.module_id));
 el("trainer-course-list").innerHTML=trainerWorkspace.courses.map(c=>'<article class="panel"><h3>'+adminEsc(language==="my"?c.title_my:c.title_en)+'</h3><p>'+adminEsc(c.level)+'</p>'+trainerWorkspace.modules.filter(m=>m.course_id===c.id).map(m=>'<h4>'+adminEsc(language==="my"?m.title_my:m.title_en)+'</h4>'+trainerWorkspace.lessons.filter(l=>l.module_id===m.id).map(l=>'<p>'+adminEsc(language==="my"?l.title_my:l.title_en)+' · '+adminEsc(l.content_status||"draft")+' '+((l.is_published||l.content_status==="published")?'<small class="muted">Published — Admin managed</small>':'<button class="small-btn" data-trainer-edit="'+l.id+'">Edit</button>')+'</p>').join("")).join("")+'</article>').join("");
 el("trainer-module").innerHTML=trainerWorkspace.modules.map(m=>'<option value="'+m.id+'">'+adminEsc(language==="my"?m.title_my:m.title_en)+'</option>').join("");
 document.querySelectorAll("[data-trainer-edit]").forEach(b=>b.onclick=()=>{const l=trainerWorkspace.lessons.find(x=>x.id===b.dataset.trainerEdit);if(!l)return;el("trainer-lesson-id").value=l.id;el("trainer-module").value=l.module_id;el("trainer-title-my").value=l.title_my;el("trainer-title-en").value=l.title_en;el("trainer-content-my").value=l.content_my||"";el("trainer-content-en").value=l.content_en||"";el("trainer-video-url").value=l.video_url||"";el("trainer-change-note").value="";});
}
async function loadTrainerAssessmentLearners(){
 const courseId=el("assessment-course").value;if(!courseId)return;
 const {data,error}=await supabase.rpc("get_assigned_course_learners",{p_course_id:courseId});
 if(error)throw error;
 trainerWorkspace.learners=data||[];
 el("assessment-learner").innerHTML=trainerWorkspace.learners.map(x=>'<option value="'+x.learner_id+'">'+adminEsc(x.full_name||"Learner")+'</option>').join("");
 if(!trainerWorkspace.learners.length)el("assessment-learner").innerHTML='<option value="">No approved learners enrolled</option>';
}
async function loadTrainerStageReviews(){
 const host=el("trainer-stage-activity-reviews");if(!host)return;
 const [assigned,submissions,names]=await Promise.all([
  supabase.from("livelihood_stage_trainers").select("id,stage_no,livelihood_stages(title_my,title_en)").eq("trainer_id",currentUser.id).order("stage_no"),
  supabase.from("livelihood_activity_submissions").select("id,learner_id,stage_progress_id,activity_id,evidence_text,status,score,reviewer_feedback,submitted_at,livelihood_stage_activities(activity_no,title_my,title_en)").order("submitted_at",{ascending:false}).limit(100),
  supabase.functions.invoke("trainer-assigned-learner-names")
 ]);
 trainerWorkspace.stageAssignments=assigned.data||[];trainerWorkspace.stageReviewError=assigned.error?.message||submissions.error?.message||names.error?.message||null;trainerWorkspace.activitySubmissions=submissions.data||[];
 const learnerNameById=new Map((names.data?.learners||[]).map(x=>[x.learner_id,x.full_name]));
 const stageProgressById=new Map((names.data?.stage_progress||[]).map(x=>[x.stage_progress_id,x]));
 if(trainerWorkspace.stageReviewError){host.innerHTML='<p class="muted">Stage review is not available yet. The required database migration must be deployed first. / လိုအပ်သော Database Migration မတင်ရသေးသဖြင့် Stage Review ကို လောလောဆယ် အသုံးမပြုနိုင်သေးပါ။</p>';return;}
 const allowed=new Set(trainerWorkspace.stageAssignments.map(x=>Number(x.stage_no)));
 const rows=trainerWorkspace.activitySubmissions.filter(s=>allowed.has(Number(stageProgressById.get(s.stage_progress_id)?.stage_no)));
 host.innerHTML='<p class="muted">'+(language==="my"?"မိမိတာဝန်ယူထားသော Journey Stage များအတွက်သာ Evidence များကို စစ်ဆေးနိုင်ပါသည်။":"You can review evidence only for your assigned journey stages.")+'</p>'+
 (trainerWorkspace.stageAssignments.length?'<p><strong>Assigned stages:</strong> '+trainerWorkspace.stageAssignments.map(s=>adminEsc(language==="my"?s.livelihood_stages?.title_my:s.livelihood_stages?.title_en)).join(" · ")+'</p>':'<p class="muted">No journey stages assigned yet. Contact the Admin. / Stage တာဝန်မပေးရသေးပါ။ Admin ကို ဆက်သွယ်ပါ။</p>')+
 adminTable(["Learner","Stage / Activity","Evidence","Score","Decision & feedback"],rows.map(s=>{
  const stage=trainerWorkspace.stageAssignments.find(x=>Number(x.stage_no)===Number(stageProgressById.get(s.stage_progress_id)?.stage_no));
  const activity=s.livelihood_stage_activities||{},learner=learnerNameById.get(s.learner_id)||"Learner";
  return '<tr><td>'+adminEsc(learner)+'</td><td>'+adminEsc(language==="my"?stage?.livelihood_stages?.title_my:stage?.livelihood_stages?.title_en)+'<br>'+adminEsc(language==="my"?activity.title_my:activity.title_en)+'</td><td><details><summary>View evidence</summary><p>'+adminEsc(s.evidence_text)+'</p></details></td><td><input type="number" min="0" max="100" step="0.5" data-trainer-activity-score="'+s.id+'" value="'+(s.score??"")+'" placeholder="0–100"></td><td><select data-trainer-activity-status="'+s.id+'"><option value="reviewing" '+(s.status==="reviewing"?"selected":"")+'>Reviewing</option><option value="needs_revision" '+(s.status==="needs_revision"?"selected":"")+'>Needs revision</option><option value="approved" '+(s.status==="approved"?"selected":"")+'>Approved</option></select><textarea rows="2" maxlength="3000" data-trainer-activity-feedback="'+s.id+'" placeholder="Feedback">'+adminEsc(s.reviewer_feedback||"")+'</textarea><button type="button" class="small-btn approve" data-trainer-activity-save="'+s.id+'">Save review</button></td></tr>';
 })); 
 document.querySelectorAll("[data-trainer-activity-save]").forEach(button=>button.onclick=()=>saveTrainerActivityReview(button.dataset.trainerActivitySave,button));
}
async function saveTrainerActivityReview(id,button){
 const scoreText=document.querySelector('[data-trainer-activity-score="'+id+'"]').value,score=scoreText===""?null:Number(scoreText);
 const status=document.querySelector('[data-trainer-activity-status="'+id+'"]').value,feedback=document.querySelector('[data-trainer-activity-feedback="'+id+'"]').value.trim();
 if(score!==null&&(!Number.isFinite(score)||score<0||score>100)){alert("Score must be between 0 and 100.");return;}
 if(status==="needs_revision"&&!feedback){alert("Feedback is required when requesting a revision.");return;}
 button.disabled=true;
 const {error}=await supabase.from("livelihood_activity_submissions").update({score,status,reviewer_feedback:feedback||null,reviewed_by:currentUser.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id);
 if(error){alert(error.message);button.disabled=false;return;}await loadTrainerStageReviews();
}
function renderTrainerAssessments(){
 el("trainer-assessment-list").innerHTML=adminTable(["Learner","Course","Type","Score","Status","Date"],trainerWorkspace.assessments.map(a=>'<tr><td>'+adminEsc(a.learner?.full_name||"Learner")+'</td><td>'+adminEsc(language==="my"?a.courses?.title_my:a.courses?.title_en)+'</td><td>'+adminEsc(a.assessment_type)+'</td><td>'+Number(a.overall_score).toFixed(1)+'%</td><td>'+adminEsc(a.status)+'</td><td>'+new Date(a.assessed_at).toLocaleDateString()+'</td></tr>'));
}
async function saveTrainerAssessment(event){
 event.preventDefault();const msg=el("assessment-message");msg.textContent="";msg.classList.remove("error");
 const fields=[["practical_skills_score","assessment-practical"],["task_completion_score","assessment-task"],["problem_solving_score","assessment-problem"],["communication_score","assessment-communication"],["participation_score","assessment-participation"]];
 const payload={course_id:el("assessment-course").value,learner_id:el("assessment-learner").value,trainer_id:currentUser.id,assessment_type:el("assessment-type").value,strengths:el("assessment-strengths").value.trim()||null,improvement_areas:el("assessment-improve").value.trim()||null,evidence_notes:el("assessment-evidence").value.trim()||null,recommendation:el("assessment-recommendation").value||null,status:"submitted"};
 for(const [key,id] of fields){const value=Number(el(id).value);if(el(id).value===""||!Number.isFinite(value)||value<0||value>100){msg.textContent="All five scores must be between 0 and 100.";msg.classList.add("error");return;}payload[key]=value;}
 if(!payload.learner_id){msg.textContent="Select an enrolled learner.";msg.classList.add("error");return;}
 const {error}=await supabase.from("learner_evaluations").insert(payload);
 if(error){msg.textContent=error.message;msg.classList.add("error");return;}
 msg.textContent="Assessment saved. The learner and Admin can view it.";
 event.currentTarget.reset();await loadTrainerWorkspace();
}
async function saveTrainerLesson(event){
 event.preventDefault();const msg=el("trainer-lesson-message");msg.textContent="";msg.classList.remove("error");
 const id=el("trainer-lesson-id").value;
 const payload={module_id:el("trainer-module").value,title_my:el("trainer-title-my").value.trim(),title_en:el("trainer-title-en").value.trim(),content_my:el("trainer-content-my").value.trim(),content_en:el("trainer-content-en").value.trim(),video_url:el("trainer-video-url").value.trim()||null,content_status:"in_review",is_published:false,updated_at:new Date().toISOString()};
 if(!payload.title_my||!payload.title_en){msg.textContent="Both language titles are required.";msg.classList.add("error");return;}
 try{
  if(id){
   const old=trainerWorkspace.lessons.find(x=>x.id===id);
   if(old){const {error:re}=await supabase.from("lesson_revisions").insert({lesson_id:id,version_no:old.version_no||1,title_my:old.title_my,title_en:old.title_en,content_my:old.content_my,content_en:old.content_en,video_url:old.video_url,changed_by:currentUser.id,change_note:el("trainer-change-note").value.trim()||"Trainer update"});if(re)throw re;}
   const {error}=await supabase.from("lessons").update({...payload,version_no:(old?.version_no||1)+1}).eq("id",id);if(error)throw error;
  }else{
   const {data:created,error}=await supabase.from("lessons").insert({...payload,content_status:"draft",created_by:currentUser.id,sort_order:trainerWorkspace.lessons.filter(l=>l.module_id===payload.module_id).length+1}).select("id").single();if(error)throw error;
   const {error:submitError}=await supabase.from("lessons").update({content_status:"in_review",updated_at:new Date().toISOString()}).eq("id",created.id);if(submitError)throw submitError;
  }
  msg.textContent="Submitted for admin review. Learners cannot see it until an admin publishes it.";
  el("trainer-lesson-form").reset();el("trainer-lesson-id").value="";await loadTrainerWorkspace();
 }catch(error){msg.textContent=error.message||"Unable to save lesson.";msg.classList.add("error");}
}
async function loadProfile(){
  const {data,error}=await supabase.from("profiles").select("*").eq("id",currentUser.id).single();
  if(error) throw error;currentProfile=data;
  show("auth-section",false);show("signout-btn",true);
  if(data.account_status!=="approved"){
    show("pending-section",true);show("learner-section",false);show("trainer-section",false);show("admin-section",false);return;
  }
  show("pending-section",false);el("learner-name").textContent=data.full_name||currentUser.email;
  show("learner-section",data.role==="learner");show("trainer-section",data.role==="trainer");show("admin-section",data.role==="admin");
  if(data.role==="admin"){await loadAdmin();}
  else if(data.role==="trainer"){await loadTrainerWorkspace();el("trainer-lesson-form").onsubmit=saveTrainerLesson;el("trainer-lesson-reset").onclick=()=>{el("trainer-lesson-form").reset();el("trainer-lesson-id").value="";};}
  else{await renderLearnerJourney();await loadCourses();await loadEnrollments();await loadLearning();await loadCareerPortfolio();await loadCareerOpportunities();await loadGraduateFollowups();await loadLearnerNotifications();el("learner-initial-assessment-form").onsubmit=submitLearnerInitialAssessment;await loadLearnerInitialAssessments();el("career-referral-form").onsubmit=submitCareerReferral;await loadLearnerReferrals();el("skill-profile-form").onsubmit=saveSkillProfile;el("portfolio-item-form").onsubmit=addPortfolioItem;el("career-readiness-form").onsubmit=submitCareerReadiness;el("career-print-cv").onclick=printLearnerCV;el("career-opportunity-list").addEventListener("click",applyForCareerOpportunity);el("graduate-followup-form").onsubmit=submitGraduateFollowup;}
}

async function loadLearnerInitialAssessments(){
 const {data,error}=await supabase.from("learner_initial_assessments").select("id,status,submitted_at,reviewer_summary").eq("learner_id",currentUser.id).order("submitted_at",{ascending:false}).limit(5);
 if(error){const box=el("initial-assessment-history");if(box)box.textContent="Assessment history is not available yet.";return;}
 el("initial-assessment-history").innerHTML=(data||[]).map(a=>'<article class="assignment-card"><b>'+escapeHtml(a.status.replaceAll("_"," "))+'</b><p>'+new Date(a.submitted_at).toLocaleString()+'</p>'+(a.reviewer_summary?'<p>'+escapeHtml(a.reviewer_summary)+'</p>':'')+'</article>').join("")||'<p class="muted">No initial assessment submitted yet. / ကနဦးအကဲဖြတ်ချက် မပေးပို့ရသေးပါ။</p>';
}
async function submitLearnerInitialAssessment(event){
 event.preventDefault();const message=el("initial-assessment-message");message.textContent="";message.classList.remove("error");
 const value=id=>el(id).value.trim();
 const responses={
  education_status:value("ia-education"),work_status:value("ia-work"),weekly_learning_time:value("ia-time")||null,
  digital_access:value("ia-digital")||null,experience:value("ia-experience")||null,strengths:value("ia-strengths")||null,
  interests:value("ia-interests"),three_to_six_month_goal:value("ia-goal"),preferred_pathway:value("ia-pathway"),
  barriers:value("ia-barriers")||null,support_requested:value("ia-support"),additional_notes:value("ia-notes")||null
 };
 if(!el("ia-consent").checked){message.textContent="Please confirm the privacy and use notice before submitting.";message.classList.add("error");return;}
 const {error}=await supabase.from("learner_initial_assessments").insert({learner_id:currentUser.id,responses,consent_given:true,consent_text_version:"2026-11-05-v2"});
 if(error){message.textContent=error.message;message.classList.add("error");return;}
 message.textContent=language==="my"?"ကနဦးအကဲဖြတ်ချက်ကို ပေးပို့ပြီးပါပြီ။":"Initial assessment submitted successfully.";
 event.currentTarget.reset();await loadLearnerInitialAssessments();
}

async function loadLearnerReferrals(){
 const {data,error}=await supabase.from("career_guidance_referrals").select("id,referral_type,status,learner_message,provider_name,provider_contact,meeting_mode,meeting_at,meeting_location,learner_visible_summary,created_at,updated_at").eq("learner_id",currentUser.id).order("created_at",{ascending:false}).limit(20);
 const box=el("learner-referral-history");
 if(error){box.textContent="Referral history is not available yet.";return;}
 const labels={career_counselor:"Career Counselor",business_mentor:"Business Mentor",vocational_guidance:"Vocational Training Guidance",digital_skills:"Digital Skills Guidance",other:"Other guidance"};
 box.innerHTML=(data||[]).map(r=>'<article class="assignment-card"><b>'+escapeHtml(labels[r.referral_type]||r.referral_type)+'</b><p>Status: '+escapeHtml(r.status.replaceAll("_"," "))+'</p>'+(r.provider_name?'<p>Assigned person: '+escapeHtml(r.provider_name)+'</p>':'')+(r.provider_contact?'<p>Contact: '+escapeHtml(r.provider_contact)+'</p>':'')+(r.meeting_at?'<p>Meeting: '+new Date(r.meeting_at).toLocaleString()+'</p>':'')+(r.meeting_mode?'<p>Mode: '+escapeHtml(r.meeting_mode.replaceAll("_"," "))+'</p>':'')+(r.meeting_location?'<p>Location / link: '+escapeHtml(r.meeting_location)+'</p>':'')+(r.learner_visible_summary?'<p>'+escapeHtml(r.learner_visible_summary)+'</p>':'')+'<small>'+new Date(r.created_at).toLocaleString()+'</small></article>').join("")||'<p class="muted">You have not requested a referral yet.</p>';
}
async function submitCareerReferral(event){
 event.preventDefault();const msg=el("referral-message-status");msg.textContent="";msg.classList.remove("error");
 if(!el("referral-consent").checked){msg.textContent="Please provide consent before submitting.";msg.classList.add("error");return;}
 const {error}=await supabase.from("career_guidance_referrals").insert({learner_id:currentUser.id,referral_type:el("referral-type").value,learner_message:el("referral-message").value.trim()||null,consent_given:true,consent_text_version:"2026-11-05-v1"});
 if(error){msg.textContent=error.message;msg.classList.add("error");return;}
 msg.textContent=language==="my"?"Referral တောင်းဆိုချက် ပေးပို့ပြီးပါပြီ။ Admin မှ ဆက်သွယ်ပေးပါမည်။":"Referral request submitted. An Admin will follow up.";
 event.currentTarget.reset();await loadLearnerReferrals();
}

async function loadLearnerNotifications(){
 const {data:rows,error}=await supabase.from("learner_notifications")
  .select("id,title_my,title_en,body_my,body_en,metadata,read_at,created_at")
  .eq("learner_id",currentUser.id).order("created_at",{ascending:false}).limit(20);
 if(error)throw error;
 const notifications=rows||[];
 const unread=notifications.filter(x=>!x.read_at).length;
 el("notification-count").textContent=String(unread);
 el("notification-count").classList.toggle("hidden",unread===0);
 el("learner-notification-list").innerHTML=notifications.map(n=>
  '<article class="notification-card '+(n.read_at?'is-read':'is-unread')+'"><div><b>'+escapeHtml(language==="my"?n.title_my:n.title_en)+'</b><p>'+escapeHtml(language==="my"?n.body_my:n.body_en)+'</p><small>'+new Date(n.created_at).toLocaleString()+'</small></div><button type="button" class="small-btn" data-open-followup="'+n.id+'" data-enrollment="'+escapeHtml(n.metadata?.enrollment_id||'')+'" data-period="'+escapeHtml(n.metadata?.followup_period||'')+'">'+(language==="my"?"စစ်တမ်းဖြည့်ရန်":"Open follow-up")+'</button></article>'
 ).join("")||'<p class="muted">No notifications yet. / သတိပေးချက် မရှိသေးပါ။</p>';
 el("learner-notification-list").onclick=async event=>{
  const button=event.target.closest("[data-open-followup]");if(!button)return;
  button.disabled=true;
  const {error:updateError}=await supabase.from("learner_notifications").update({read_at:new Date().toISOString()}).eq("id",button.dataset.openFollowup).eq("learner_id",currentUser.id);
  if(updateError){button.disabled=false;alert(updateError.message);return;}
  const enrollment=button.dataset.enrollment,period=button.dataset.period;
  await loadLearnerNotifications();
  const courseSelect=el("graduate-enrollment");
  if(enrollment&&[...courseSelect.options].some(o=>o.value===enrollment)){courseSelect.value=enrollment;courseSelect.dispatchEvent(new Event("change"));}
  const periodSelect=el("graduate-period");
  if(period&&[...periodSelect.options].some(o=>o.value===period&&!o.disabled))periodSelect.value=period;
  el("graduate-followup").scrollIntoView({behavior:"smooth",block:"start"});
 };
}
async function loadGraduateFollowups(){
 const [{data:enrollments,error:enError},{data:rows,error:rowError}]=await Promise.all([
  supabase.from("enrollments").select("id,course_id,status,completed_at,courses(title_my,title_en,level)").eq("learner_id",currentUser.id).eq("status","completed"),
  supabase.from("graduate_followups").select("id,enrollment_id,followup_period,employment_status,pathway,status,submitted_at,key_outcome").eq("learner_id",currentUser.id).order("submitted_at",{ascending:false})
 ]);
 if(enError)throw enError;if(rowError)throw rowError;
 const existing=new Set((rows||[]).map(x=>x.enrollment_id+"|"+x.followup_period));
 el("graduate-enrollment").innerHTML=(enrollments||[]).map(e=>'<option value="'+e.id+'">'+escapeHtml(language==="my"?(e.courses?.title_my||e.courses?.title_en):(e.courses?.title_en||e.courses?.title_my))+'</option>').join("");
 const form=el("graduate-followup-form");
 if(!(enrollments||[]).length){form.classList.add("hidden");el("graduate-message").textContent="Follow-up forms appear after an Admin marks your course enrollment completed. / သင်တန်းပြီးဆုံးကြောင်း Admin မှ သတ်မှတ်ပြီးနောက် စစ်တမ်းဖြည့်နိုင်ပါမည်။";}
 else form.classList.remove("hidden");
 function refreshPeriod(){const enrollment=el("graduate-enrollment").value,record=(enrollments||[]).find(x=>x.id===enrollment),completed=record?.completed_at?new Date(record.completed_at):new Date();Array.from(el("graduate-period").options).forEach(o=>{const days=Number(o.value.split("_")[0]),due=new Date(completed);due.setDate(due.getDate()+days);o.disabled=existing.has(enrollment+"|"+o.value)||new Date()<due;o.textContent=days+" days"+(new Date()<due?" (due "+due.toLocaleDateString()+")":"");});if(el("graduate-period").selectedOptions[0]?.disabled){const next=Array.from(el("graduate-period").options).find(o=>!o.disabled);if(next)el("graduate-period").value=next.value;}}
 el("graduate-enrollment").onchange=refreshPeriod;refreshPeriod();
 el("graduate-history").innerHTML=(rows||[]).map(x=>'<article class="assignment-card"><b>'+escapeHtml(x.followup_period.replace("_"," "))+'</b><p>'+escapeHtml(x.employment_status)+' · '+escapeHtml(x.pathway)+' · '+escapeHtml(x.status)+'</p><p>'+escapeHtml(x.key_outcome||"")+'</p><small>'+new Date(x.submitted_at).toLocaleDateString()+'</small></article>').join("")||'<p class="muted">No follow-ups submitted yet.</p>';
}
async function submitGraduateFollowup(event){
 event.preventDefault();const msg=el("graduate-message");msg.textContent="";
 const consent=el("graduate-story-consent").checked,story=el("graduate-story").value.trim();
 if(story&&!consent){msg.textContent="Please provide separate consent before submitting a story.";msg.classList.add("error");return;}
 const number=(id)=>el(id).value===""?null:Number(el(id).value);
 const payload={enrollment_id:el("graduate-enrollment").value,learner_id:currentUser.id,followup_period:el("graduate-period").value,employment_status:el("graduate-employment").value,pathway:el("graduate-pathway").value,job_or_business_title:el("graduate-title").value.trim()||null,sector:el("graduate-sector").value.trim()||null,monthly_income:number("graduate-income"),previous_monthly_income:number("graduate-previous-income"),income_currency:el("graduate-currency").value,skills_used:csvText(el("graduate-skills").value),training_relevance:number("graduate-relevance"),key_outcome:el("graduate-outcome").value.trim()||null,challenges:el("graduate-challenges").value.trim()||null,support_needed:el("graduate-support").value.trim()||null,consent_to_contact:el("graduate-contact-consent").checked,consent_to_story:consent,story_text:consent?(story||null):null};
 const {error}=await supabase.from("graduate_followups").insert(payload);
 if(error){msg.textContent=error.message;msg.classList.add("error");return;}
 msg.textContent="Thank you. Your follow-up has been submitted.";msg.classList.remove("error");await supabase.from("learner_notifications").update({read_at:new Date().toISOString()}).eq("learner_id",currentUser.id).eq("notification_key",payload.enrollment_id+":"+payload.followup_period);event.currentTarget.reset();await loadGraduateFollowups();await loadLearnerNotifications();
}
function renderAdminGraduateFollowups(){
 const rows=adminCache.graduateFollowups||[],n=rows.length,employed=rows.filter(x=>["employed","self_employed","apprenticeship"].includes(x.employment_status)).length,stories=rows.filter(x=>x.consent_to_story&&x.story_text).length;
 el("admin-graduate-summary").innerHTML=[["Responses",n],["Working / self-employed / apprentice",employed],["Consent-based story drafts",stories],["30-day",rows.filter(x=>x.followup_period==="30_day").length],["90-day",rows.filter(x=>x.followup_period==="90_day").length],["180-day",rows.filter(x=>x.followup_period==="180_day").length]].map(([k,v])=>'<article class="admin-stat"><span>'+k+'</span><strong>'+v+'</strong></article>').join("");
 el("admin-graduate-table").innerHTML=adminTable(["Learner","Course","Period","Status","Pathway","Income (private)","Outcome","Story consent","Review"],rows.map(x=>'<tr><td>'+adminEsc(x.profiles?.full_name||"Learner")+'</td><td>'+adminEsc(x.enrollments?.courses?.title_en||x.enrollments?.courses?.title_my||"—")+'</td><td>'+adminEsc(x.followup_period)+'</td><td>'+adminEsc(x.employment_status)+'</td><td>'+adminEsc(x.pathway)+'</td><td>'+((x.monthly_income===null||x.monthly_income===undefined)?"—":adminEsc(x.monthly_income+" "+x.income_currency))+'</td><td>'+adminEsc(x.key_outcome||"—")+'</td><td>'+(x.consent_to_story&&x.story_text?"Yes":"No")+'</td><td><select data-grad-status="'+x.id+'"><option value="submitted" '+(x.status==="submitted"?"selected":"")+'>Submitted</option><option value="reviewed" '+(x.status==="reviewed"?"selected":"")+'>Reviewed</option><option value="follow_up_needed" '+(x.status==="follow_up_needed"?"selected":"")+'>Follow-up needed</option></select><textarea data-grad-notes="'+x.id+'" rows="2" placeholder="Internal notes">'+adminEsc(x.admin_notes||"")+'</textarea><button class="small-btn" data-grad-save="'+x.id+'">Save</button></td></tr>'));
 document.querySelectorAll("[data-grad-save]").forEach(b=>b.onclick=async()=>{const id=b.dataset.gradSave,status=document.querySelector('[data-grad-status="'+id+'"]').value,admin_notes=document.querySelector('[data-grad-notes="'+id+'"]').value.trim()||null;const {error}=await supabase.from("graduate_followups").update({status,admin_notes,reviewed_at:new Date().toISOString(),reviewed_by:currentUser.id,updated_at:new Date().toISOString()}).eq("id",id);if(error){alert(error.message);return;}await loadAdmin();});
}
function exportGraduateFollowupsCSV(){
 const rows=adminCache.graduateFollowups||[];const headers=["learner","course","period","employment_status","pathway","monthly_income","income_currency","training_relevance","key_outcome","challenges","support_needed","story_consent","submitted_at"];
 const quote=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const data=[headers,...rows.map(x=>[x.profiles?.full_name,x.enrollments?.courses?.title_en||x.enrollments?.courses?.title_my,x.followup_period,x.employment_status,x.pathway,x.monthly_income,x.income_currency,x.training_relevance,x.key_outcome,x.challenges,x.support_needed,x.consent_to_story,x.submitted_at])].map(r=>r.map(quote).join(",")).join("\r\n");
 const url=URL.createObjectURL(new Blob(["\ufeff"+data],{type:"text/csv;charset=utf-8;"})),a=document.createElement("a");a.href=url;a.download="graduate-followups.csv";a.click();URL.revokeObjectURL(url);
}
async function loadCareerOpportunities(){
 const [{data:opportunities,error:opError},{data:applications,error:appError}]=await Promise.all([
  supabase.from("career_opportunities").select("*").eq("status","published").order("application_deadline",{ascending:true}),
  supabase.from("career_opportunity_applications").select("id,opportunity_id,status,cover_note,applied_at,reviewed_at,career_opportunities(title,title_my,title_en,organization_name,opportunity_type,application_deadline)").eq("learner_id",currentUser.id).order("applied_at",{ascending:false})
 ]);
 if(opError)throw opError;if(appError)throw appError;
 const applied=new Set((applications||[]).map(a=>a.opportunity_id));
 const {data:skillProfile,error:profileError}=await supabase.from("learner_skill_profiles").select("skills,career_pathway").eq("learner_id",currentUser.id).maybeSingle();if(profileError)throw profileError;
 const learnerSkills=new Set((skillProfile?.skills||[]).map(s=>s.toLowerCase().trim()));
 const scored=(opportunities||[]).map(o=>{const required=(o.required_skills||[]).map(s=>s.toLowerCase().trim()).filter(Boolean),preferred=(o.preferred_skills||[]).map(s=>s.toLowerCase().trim()).filter(Boolean);const reqMatch=required.filter(s=>learnerSkills.has(s)).length,prefMatch=preferred.filter(s=>learnerSkills.has(s)).length;const score=required.length?Math.round((reqMatch/required.length)*80+(preferred.length?prefMatch/preferred.length*20:20)):preferred.length?Math.round(prefMatch/preferred.length*100):0;const pathwayMatch=!skillProfile?.career_pathway||skillProfile.career_pathway==="undecided"||skillProfile.career_pathway===o.pathway;return {...o,matchScore:score,pathwayMatch};}).sort((a,b)=>(Number(b.pathwayMatch)-Number(a.pathwayMatch))||b.matchScore-a.matchScore);
 el("career-opportunity-list").innerHTML=scored.map(o=>'<article class="assignment-card"><h3>'+escapeHtml(language==="my"?(o.title_my||o.title): (o.title_en||o.title))+'</h3><p><b>'+escapeHtml(o.organization_name||"Opportunity")+'</b> · '+escapeHtml(o.opportunity_type)+'</p><p><b>Skills match:</b> '+o.matchScore+'% '+(o.pathwayMatch?'· Pathway match':'')+'</p><p>'+escapeHtml(language==="my"?(o.description_my||o.description):(o.description_en||o.description))+'</p><p><small>'+escapeHtml(o.location_text||"Location not specified")+' · '+escapeHtml(o.work_mode)+' · '+escapeHtml(o.compensation_text||"Compensation not specified")+'</small></p><p><b>Required skills:</b> '+escapeHtml((o.required_skills||[]).join(", ")||"Not specified")+'</p><p><b>Deadline:</b> '+escapeHtml(o.application_deadline||"Not specified")+'</p>'+(o.application_url?'<p><a href="'+escapeHtml(o.application_url)+'" target="_blank" rel="noopener">External application details</a></p>':'')+(applied.has(o.id)?'<span class="muted">Application submitted</span>':'<button class="primary-btn" data-apply-opportunity="'+o.id+'">Apply / လျှောက်ထားရန်</button>')+'</article>').join("")||'<p class="muted">No opportunities are currently published.</p>';
 el("my-career-applications").innerHTML=(applications||[]).map(a=>'<article class="assignment-card"><b>'+escapeHtml(language==="my"?(a.career_opportunities?.title_my||a.career_opportunities?.title):(a.career_opportunities?.title_en||a.career_opportunities?.title)||"Opportunity")+'</b><p>'+escapeHtml(a.career_opportunities?.organization_name||"")+'</p><p>Status: '+escapeHtml(a.status)+'</p><small>Applied: '+new Date(a.applied_at).toLocaleDateString()+'</small>'+(a.status==="submitted"?'<button class="small-btn reject" data-withdraw-application="'+a.id+'">Withdraw</button>':'')+'</article>').join("")||'<p class="muted">You have not applied for any opportunities yet.</p>';
 el("my-career-applications").querySelectorAll("[data-withdraw-application]").forEach(b=>b.onclick=async()=>{if(!confirm("Withdraw this application?"))return;const {error}=await supabase.from("career_opportunity_applications").update({status:"withdrawn"}).eq("id",b.dataset.withdrawApplication);if(error){alert(error.message);return;}await loadCareerOpportunities();});
}
async function applyForCareerOpportunity(event){
 const b=event.target.closest("[data-apply-opportunity]");if(!b)return;
 const note=prompt("Add a short cover note (optional):");if(note===null)return;
 b.disabled=true;
 const {error}=await supabase.from("career_opportunity_applications").insert({opportunity_id:b.dataset.applyOpportunity,learner_id:currentUser.id,cover_note:note.trim()||null});
 if(error){alert(error.message);b.disabled=false;return;}await loadCareerOpportunities();
}
function csvText(value){return (value||"").split(",").map(x=>x.trim()).filter(Boolean);}
async function loadCareerPortfolio(){
 const {data:profile,error}=await supabase.from("learner_skill_profiles").select("*").eq("learner_id",currentUser.id).maybeSingle();if(error)throw error;
 if(profile){el("career-pathway").value=profile.career_pathway||"employment";el("career-goal").value=profile.career_goal||"";el("career-summary").value=profile.professional_summary||"";el("career-education").value=profile.education_history||"";el("career-experience").value=profile.work_experience||"";el("career-skills").value=(profile.skills||[]).join(", ");el("career-languages").value=(profile.languages||[]).join(", ");el("career-location").value=profile.location_text||"";}
 const [{data:items,error:itemError},{data:assessments,error:assessmentError}]=await Promise.all([
  supabase.from("learner_portfolio_items").select("*").eq("learner_id",currentUser.id).order("created_at",{ascending:false}),
  supabase.from("career_readiness_assessments").select("*").eq("learner_id",currentUser.id).order("created_at",{ascending:false})
 ]);
 if(itemError)throw itemError;if(assessmentError)throw assessmentError;
 el("portfolio-items").innerHTML=(items||[]).map(x=>'<article class="assignment-card"><b>'+escapeHtml(x.title)+'</b><p>'+escapeHtml(x.description||"")+'</p><small>'+escapeHtml(x.item_type)+' · '+escapeHtml((x.skills||[]).join(", "))+'</small>'+(x.evidence_url?'<p><a href="'+escapeHtml(x.evidence_url)+'" target="_blank" rel="noopener">View evidence</a></p>':'')+'<button class="small-btn reject" data-portfolio-delete="'+x.id+'">Delete</button></article>').join("")||'<p class="muted">No portfolio items added yet.</p>';
 el("portfolio-items").querySelectorAll("[data-portfolio-delete]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this portfolio item?"))return;const {error}=await supabase.from("learner_portfolio_items").delete().eq("id",b.dataset.portfolioDelete).eq("learner_id",currentUser.id);if(error){alert(error.message);return;}await loadCareerPortfolio();});
 el("readiness-history").innerHTML=(assessments||[]).map(a=>'<article class="assignment-card"><b>'+escapeHtml(a.pathway)+'</b><p>Readiness score: '+Number(a.overall_score).toFixed(1)+'% · '+escapeHtml(a.status)+'</p><p>'+escapeHtml(a.career_interest||"")+'</p><small>'+new Date(a.created_at).toLocaleDateString()+'</small></article>').join("")||'<p class="muted">No self-assessment submitted yet.</p>';
}
async function saveSkillProfile(event){
 event.preventDefault();const message=el("career-profile-message");message.textContent="";
 const payload={learner_id:currentUser.id,career_pathway:el("career-pathway").value,career_goal:el("career-goal").value.trim()||null,professional_summary:el("career-summary").value.trim()||null,education_history:el("career-education").value.trim()||null,work_experience:el("career-experience").value.trim()||null,skills:csvText(el("career-skills").value),languages:csvText(el("career-languages").value),location_text:el("career-location").value.trim()||null,updated_at:new Date().toISOString()};
 const {error}=await supabase.from("learner_skill_profiles").upsert(payload,{onConflict:"learner_id"});message.textContent=error?error.message:"Skills profile saved.";if(error)message.classList.add("error");else message.classList.remove("error");
}
async function addPortfolioItem(event){
 event.preventDefault();const message=el("portfolio-message");message.textContent="";
 const url=el("portfolio-url").value.trim();if(url&&!/^https?:\/\//i.test(url)){message.textContent="Evidence URL must begin with https:// or http://";message.classList.add("error");return;}
 const payload={learner_id:currentUser.id,title:el("portfolio-title").value.trim(),description:el("portfolio-description").value.trim()||null,item_type:el("portfolio-type").value,skills:csvText(el("portfolio-skills").value),evidence_url:url||null};
 const {error}=await supabase.from("learner_portfolio_items").insert(payload);message.textContent=error?error.message:"Portfolio item added.";if(error){message.classList.add("error");return;}message.classList.remove("error");event.currentTarget.reset();await loadCareerPortfolio();
}
async function submitCareerReadiness(event){
 event.preventDefault();const message=el("readiness-message");message.textContent="";
 const fields=[["skill_confidence","readiness-skills"],["communication_confidence","readiness-communication"],["digital_readiness","readiness-digital"],["problem_solving","readiness-problem"],["job_search_or_business_planning","readiness-planning"]];
 const payload={learner_id:currentUser.id,pathway:el("readiness-pathway").value,career_interest:el("readiness-interest").value.trim()||null,support_needs:el("readiness-support").value.trim()||null,next_steps:el("readiness-next").value.trim()||null};
 for(const [key,id] of fields){const raw=el(id).value,n=Number(raw);if(raw===""||!Number.isFinite(n)||n<0||n>100){message.textContent="Enter all five scores between 0 and 100.";message.classList.add("error");return;}payload[key]=n;}
 const {error}=await supabase.from("career_readiness_assessments").insert(payload);message.textContent=error?error.message:"Self-assessment submitted.";if(error){message.classList.add("error");return;}message.classList.remove("error");event.currentTarget.reset();await loadCareerPortfolio();
}
function printLearnerCV(){
 const v=id=>el(id).value.trim();const esc=s=>escapeHtml(s);
 const skills=csvText(v("career-skills")),langs=csvText(v("career-languages"));
 const html='<!doctype html><html><head><meta charset="utf-8"><title>CV</title><style>body{font:14px Arial,sans-serif;max-width:800px;margin:40px auto;color:#222;line-height:1.5}h1{margin-bottom:4px}h2{border-bottom:1px solid #aaa;padding-bottom:4px;margin-top:24px}p{white-space:pre-wrap}@media print{button{display:none}}</style></head><body><h1>'+esc(currentProfile?.full_name||"Learner")+'</h1><p>'+esc(v("career-location"))+'</p><h2>Professional Summary</h2><p>'+esc(v("career-summary"))+'</p><h2>Career Objective</h2><p>'+esc(v("career-goal"))+'</p><h2>Skills</h2><p>'+esc(skills.join(" · "))+'</p><h2>Education</h2><p>'+esc(v("career-education"))+'</p><h2>Experience</h2><p>'+esc(v("career-experience"))+'</p><h2>Languages</h2><p>'+esc(langs.join(" · "))+'</p><script>window.onload=()=>window.print()<\/script></body></html>';
 const w=window.open("","_blank");if(!w){alert("Allow pop-ups to print your CV.");return;}w.document.write(html);w.document.close();
}

const LIVELIHOOD_STAGE_COPY=[
{no:1,my:"မိမိကိုယ်ကို သိရှိနားလည်ခြင်း",en:"Self-Discovery & Assessment",outMy:"မိမိ၏ အားသာချက်၊ လိုအပ်ချက်နှင့် ရည်မှန်းချက်ကို ရှင်းလင်းစွာ ဖော်ပြနိုင်ခြင်း။",outEn:"Describe personal strengths, development needs and goals."},
{no:2,my:"အခြေခံအရည်အချင်း တည်ဆောက်ခြင်း",en:"Foundation & Life Skills",outMy:"နေ့စဉ်ဘဝနှင့် အလုပ်တွင် အသုံးချနိုင်သော အခြေခံကျွမ်းကျင်မှုများ ရရှိခြင်း။",outEn:"Demonstrate foundational skills for daily life and work."},
{no:3,my:"ကျွမ်းကျင်မှု ဖွံ့ဖြိုးတည်ဆောက်ခြင်း",en:"Skill Development",outMy:"ရွေးချယ်ထားသော လုပ်ငန်းနယ်ပယ်တွင် အခြေခံလုပ်ငန်းတာဝန်များကို လုပ်ဆောင်နိုင်ခြင်း။",outEn:"Perform foundational tasks in a chosen skill area."},
{no:4,my:"လက်တွေ့အသုံးချခြင်း",en:"Practical Application",outMy:"စစ်ဆေးအကဲဖြတ်နိုင်သော လက်တွေ့လုပ်ဆောင်မှု သို့မဟုတ် Portfolio အထောက်အထား ရှိခြင်း။",outEn:"Provide assessable practical work or portfolio evidence."},
{no:5,my:"ဝင်ငွေဖန်တီးခြင်း",en:"Income Generation",outMy:"ရွေးချယ်ထားသော ဝင်ငွေလမ်းကြောင်းအတွက် လက်တွေ့စတင်ဆောင်ရွက်ထားခြင်း။",outEn:"Take practical steps into a chosen income pathway."},
{no:6,my:"တိုးတက်မှုနှင့် တည်ငြိမ်မှု",en:"Growth & Stability",outMy:"ဝင်ငွေနှင့် လုပ်ငန်းတည်ငြိမ်မှုကို ပိုမိုကောင်းမွန်စေရန် အစီအစဉ်နှင့် လုပ်ဆောင်ချက် ရှိခြင်း။",outEn:"Have a plan and actions to strengthen income and livelihood stability."},
{no:7,my:"ဦးဆောင်မှုနှင့် ရေရှည်တည်တံ့မှု",en:"Leadership & Sustainability",outMy:"ရေရှည်တည်တံ့သော ကိုယ်ပိုင်တိုးတက်မှုနှင့် လူမှုအသိုင်းအဝိုင်းအကျိုးပြုမှုကို ပြသနိုင်ခြင်း။",outEn:"Demonstrate sustainable personal progress and community contribution."}
];
async function renderLearnerJourney(){
 const root=el("learner-journey");if(!root)return;
 root.innerHTML='<p class="muted">Loading your development journey… / တိုးတက်မှုလမ်းကြောင်းကို ဖွင့်နေပါသည်။</p>';
 const [sr,pr,mr,ar,subr]=await Promise.all([
  supabase.from("livelihood_stages").select("stage_no,title_my,title_en,outcome_my,outcome_en").eq("is_active",true).order("sort_order"),
  supabase.from("learner_stage_progress").select("id,stage_no,status,evidence_summary,reviewer_feedback").eq("learner_id",currentUser.id).order("stage_no"),
  supabase.from("modules").select("stage_no,title_my,title_en").not("stage_no","is",null).order("sort_order"),
  supabase.from("livelihood_stage_activities").select("id,stage_no,activity_no,title_my,title_en,instructions_my,instructions_en,evidence_prompt_my,evidence_prompt_en,assessment_criteria,estimated_minutes").eq("is_active",true).order("sort_order"),
  supabase.from("livelihood_activity_submissions").select("id,stage_progress_id,activity_id,evidence_text,status,score,reviewer_feedback,submitted_at,reviewed_at").eq("learner_id",currentUser.id).order("submitted_at",{ascending:false})
 ]);
 if(sr.error||pr.error||mr.error||ar.error||subr.error){root.innerHTML='<p class="muted">The development journey is being prepared. Please check again after the platform update. / တိုးတက်မှုလမ်းကြောင်းစနစ်ကို ပြင်ဆင်နေဆဲဖြစ်ပါသည်။';console.warn("Learner journey unavailable",sr.error||pr.error||mr.error||ar.error||subr.error);return;}
 const stages=sr.data?.length?sr.data:LIVELIHOOD_STAGE_COPY.map(x=>({stage_no:x.no,title_my:x.my,title_en:x.en,outcome_my:x.outMy,outcome_en:x.outEn}));
 const progress=new Map((pr.data||[]).map(x=>[x.stage_no,x])),modules=new Map(),activities=new Map();
 (mr.data||[]).forEach(x=>{if(!modules.has(x.stage_no))modules.set(x.stage_no,[]);modules.get(x.stage_no).push(x);});
 (ar.data||[]).forEach(x=>{if(!activities.has(x.stage_no))activities.set(x.stage_no,[]);activities.get(x.stage_no).push(x);});
 const submissionsByActivity=new Map();
 (subr.data||[]).forEach(x=>{if(!submissionsByActivity.has(x.activity_id))submissionsByActivity.set(x.activity_id,[]);submissionsByActivity.get(x.activity_id).push(x);});
 const verified=stages.filter(x=>progress.get(x.stage_no)?.status==="verified").length,pct=Math.round(verified/7*100);
 const label=s=>({in_progress:language==="my"?"လေ့လာနေဆဲ":"In progress",submitted:language==="my"?"စစ်ဆေးရန် ပေးပို့ထားသည်":"Submitted for review",verified:language==="my"?"အတည်ပြုပြီး":"Verified",needs_support:language==="my"?"ထပ်မံပံ့ပိုးမှု လိုအပ်":"Support needed"}[s]||s);
 root.innerHTML='<div class="journey-summary"><div><strong>'+(language==="my"?"သင်၏ တိုးတက်မှု":"Your progress")+'</strong><p>'+verified+' / 7 '+(language==="my"?"အဆင့် ပြီးမြောက်":"stages verified")+'</p></div><div class="journey-progress"><span style="width:'+pct+'%"></span></div><b>'+pct+'%</b></div>'+
 stages.map(s=>{
  const n=s.stage_no,p=progress.get(n),done=p?.status==="verified",ready=!p&&(n===1||progress.get(n-1)?.status==="verified");
  let action="";
  if(ready)action='<button class="small-btn primary-btn" type="button" data-stage-start="'+n+'">'+(language==="my"?"ဒီအဆင့်ကို စတင်မယ်":"Start this stage")+'</button>';
  if(p?.status==="in_progress"||p?.status==="needs_support")action=(p?.status==="needs_support"?'<p class="journey-note">'+(language==="my"?"အကြံပြုချက်အတိုင်း ပြင်ဆင်ပြီး အထောက်အထားကို ထပ်မံတင်သွင်းနိုင်ပါသည်။":"Please revise your evidence using the reviewer feedback and resubmit it.")+'</p>':"")+'<form class="journey-evidence-form" data-stage-evidence="'+p.id+'"><label>'+(language==="my"?"လက်တွေ့လုပ်ဆောင်ခဲ့သည့်အရာနှင့် အထောက်အထားကို ဖော်ပြပါ (အနည်းဆုံး စာလုံး ၂၀)":"Describe your practice and evidence (at least 20 characters)")+'<textarea name="evidence" rows="3" minlength="20" maxlength="5000" required>'+escapeHtml(p.evidence_summary||"")+'</textarea></label><button class="small-btn" type="submit">'+(language==="my"?(p.status==="needs_support"?"ပြင်ဆင်ပြီး ပြန်လည်တင်သွင်းမယ်":"စစ်ဆေးရန် ပေးပို့မယ်"):(p.status==="needs_support"?"Resubmit revised evidence":"Submit evidence for review"))+'</button></form>';
  if(p?.status==="submitted")action='<p class="journey-note">'+(language==="my"?"Admin စစ်ဆေးမှုကို စောင့်ဆိုင်းနေပါသည်။":"Waiting for Admin review.")+'</p>';
  if(p?.reviewer_feedback)action+='<p class="journey-feedback"><b>'+(language==="my"?"စစ်ဆေးသူ၏ အကြံပြုချက်":"Reviewer feedback")+':</b> '+escapeHtml(p.reviewer_feedback)+'</p>';
  const linked=modules.get(n)||[],tasks=activities.get(n)||[];
  const taskHtml=(done||ready||p)?(tasks.length?'<div class="journey-activities"><h5>'+(language==="my"?"လက်တွေ့လုပ်ငန်းများ":"Practical activities")+'</h5>'+tasks.map(t=>{
   const criteria=Array.isArray(t.assessment_criteria)?t.assessment_criteria:[];
   const history=submissionsByActivity.get(t.id)||[],latest=history[0];
   const statusText=x=>({submitted:language==="my"?"တင်သွင်းပြီး":"Submitted",reviewing:language==="my"?"စစ်ဆေးနေဆဲ":"Under review",needs_revision:language==="my"?"ပြင်ဆင်ရန်လိုအပ်":"Revision needed",approved:language==="my"?"အတည်ပြုပြီး":"Approved"}[x]||x);
   const historyHtml=history.length?'<details class="activity-history"><summary>'+(language==="my"?"တင်သွင်းမှုမှတ်တမ်း":"Submission history")+' ('+history.length+')</summary>'+history.map((h,i)=>'<div class="journey-note"><b>#'+(history.length-i)+' · '+statusText(h.status)+'</b>'+(h.score!==null&&h.score!==undefined?' · '+Number(h.score).toFixed(1)+'%':'')+'<p>'+escapeHtml(h.evidence_text)+'</p>'+(h.reviewer_feedback?'<p><b>'+(language==="my"?"အကြံပြုချက်":"Feedback")+':</b> '+escapeHtml(h.reviewer_feedback)+'</p>':'')+'<small>'+new Date(h.submitted_at).toLocaleString()+'</small></div>').join("")+'</details>':"";
   const canSubmit=!latest||latest.status==="needs_revision";
   const submitHtml=canSubmit&&p&&(p.status==="in_progress"||p.status==="needs_support")?'<form class="activity-evidence-form" data-activity-submit="'+t.id+'" data-stage-progress="'+p.id+'"><label>'+(language==="my"?"သင်လုပ်ဆောင်ခဲ့သည့်အရာနှင့် အထောက်အထားကို ရေးသားပါ (အနည်းဆုံး စာလုံး ၂၀)":"Describe what you did and the evidence (20–5000 characters)")+'<textarea name="activityEvidence" minlength="20" maxlength="5000" rows="3" required>'+(latest?.status==="needs_revision"?escapeHtml(latest.evidence_text):"")+'</textarea></label><button class="small-btn" type="submit">'+(latest?.status==="needs_revision"?(language==="my"?"ပြင်ဆင်ပြီး ပြန်တင်ရန်":"Resubmit revised evidence"):(language==="my"?"လက်တွေ့အထောက်အထား တင်သွင်းရန်":"Submit activity evidence"))+'</button></form>':(latest&&latest.status!=="needs_revision"?'<p class="journey-note">'+statusText(latest.status)+(latest.status==="approved"&&latest.score!==null?' · '+Number(latest.score).toFixed(1)+'%':"")+'</p>':"");
   return '<section class="journey-activity"><div class="journey-activity-heading"><b>'+t.activity_no+'. '+escapeHtml(language==="my"?t.title_my:t.title_en)+'</b><span>'+t.estimated_minutes+' '+(language==="my"?"မိနစ်":"min")+'</span></div><p>'+escapeHtml(language==="my"?t.instructions_my:t.instructions_en)+'</p><p class="journey-evidence-prompt"><b>'+(language==="my"?"တင်ပြရမည့်အထောက်အထား":"Evidence to provide")+':</b> '+escapeHtml(language==="my"?t.evidence_prompt_my:t.evidence_prompt_en)+'</p>'+(criteria.length?'<details><summary>'+(language==="my"?"အကဲဖြတ်စံနှုန်းများ":"Assessment criteria")+'</summary><ul>'+criteria.map(c=>'<li>'+escapeHtml(language==="my"?c.my:c.en)+'</li>').join("")+'</ul></details>':"")+historyHtml+submitHtml+'</section>';
  }).join("")+'</div>':'<p class="muted">'+(language==="my"?"ဤအဆင့်အတွက် လက်တွေ့လုပ်ငန်းများကို ထည့်သွင်းနေဆဲဖြစ်ပါသည်။":"Practical activities for this stage are being prepared.")+'</p>'):'<p class="journey-note">'+(language==="my"?"ယခင်အဆင့်ကို အတည်ပြုပြီးမှ ဤအဆင့်၏ လက်တွေ့လုပ်ငန်းများကို ဖွင့်လှစ်ပေးပါမည်။":"Practical activities unlock after the previous stage is verified.")+'</p>';
  return '<article class="journey-stage '+(done?"is-verified":p?"is-active":ready?"is-ready":"is-locked")+'"><div class="journey-stage-head"><span class="journey-stage-number">'+n+'</span><div class="journey-stage-title"><h4>'+escapeHtml(language==="my"?s.title_my:s.title_en)+'</h4><small>'+escapeHtml(p?label(p.status):ready?(language==="my"?"စတင်နိုင်သည်":"Ready to start"):(language==="my"?"ယခင်အဆင့်ကို စောင့်ဆိုင်းနေသည်":"Locked until previous stage is verified"))+'</small></div>'+(done?'<span class="journey-check">✓</span>':"")+'</div><p>'+escapeHtml(language==="my"?s.outcome_my:s.outcome_en)+'</p>'+(linked.length?'<div class="journey-modules"><b>'+(language==="my"?"ဆက်စပ်သင်ခန်းစာများ":"Related learning modules")+'</b><ul>'+linked.map(m=>'<li>'+escapeHtml(language==="my"?m.title_my:m.title_en)+'</li>').join("")+'</ul></div>':"")+taskHtml+action+'</article>';
 }).join("");
 root.querySelectorAll("[data-stage-start]").forEach(btn=>btn.addEventListener("click",async()=>{btn.disabled=true;const {error}=await supabase.from("learner_stage_progress").insert({learner_id:currentUser.id,stage_no:Number(btn.dataset.stageStart),status:"in_progress"});if(error){alert(error.message);btn.disabled=false;return;}await renderLearnerJourney();}));
 root.querySelectorAll("[data-stage-evidence]").forEach(form=>form.addEventListener("submit",async e=>{e.preventDefault();const evidence=form.elements.evidence.value.trim(),button=form.querySelector("button");if(evidence.length<20){alert("Please provide at least 20 characters of evidence.");return;}button.disabled=true;const {error}=await supabase.from("learner_stage_progress").update({evidence_summary:evidence,status:"submitted",reviewer_feedback:null,reviewed_by:null,reviewed_at:null,updated_at:new Date().toISOString()}).eq("id",form.dataset.stageEvidence).eq("learner_id",currentUser.id);if(error){alert(error.message);button.disabled=false;return;}await renderLearnerJourney();}));
 root.querySelectorAll("[data-activity-submit]").forEach(form=>form.addEventListener("submit",async e=>{
  e.preventDefault();const evidence=form.elements.activityEvidence.value.trim(),button=form.querySelector("button");
  if(evidence.length<20||evidence.length>5000){alert(language==="my"?"အထောက်အထားကို စာလုံး ၂၀ မှ ၅၀၀၀ အတွင်း ရေးပါ။":"Evidence must be between 20 and 5000 characters.");return;}
  button.disabled=true;
  const {error}=await supabase.from("livelihood_activity_submissions").insert({learner_id:currentUser.id,stage_progress_id:form.dataset.stageProgress,activity_id:form.dataset.activitySubmit,evidence_text:evidence});
  if(error){alert(error.message||String(error));button.disabled=false;return;}
  await renderLearnerJourney();
 }));
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

async function loadLearning(){
  const {data:enrollments,error}=await supabase.from("enrollments")
    .select("course_id,courses(id,title_my,title_en,level)")
    .eq("learner_id",currentUser.id).in("status",["approved","completed"]);
  if(error)throw error;
  const courseRows=(enrollments||[]).filter(x=>x.courses);
  const root=el("learning-course-list");
  const pane=el("lesson-reader");
  learningLessons=new Map();
  if(!courseRows.length){
    root.innerHTML='<p class="muted">'+(language==="my"?"သင်ခန်းစာများကို ဖွင့်ရန် သင်တန်းဝင်ခွင့် အတည်ပြုချက် လိုအပ်ပါသည်။":"An approved course enrollment is required to access lessons.")+'</p>';
    pane.classList.add("hidden");return;
  }
  const courseBlocks=[];
  for(const row of courseRows){
    const course=row.courses;
    const [{data:modules,error:moduleError},{data:progress,error:progressError}]=await Promise.all([
      supabase.from("modules").select("id,title_my,title_en,sort_order,lessons(id,title_my,title_en,content_my,content_en,sort_order,is_published)").eq("course_id",course.id).order("sort_order"),
      supabase.from("lesson_progress").select("lesson_id,status").eq("learner_id",currentUser.id)
    ]);
    if(moduleError)throw moduleError;if(progressError)throw progressError;
    const progressMap=new Map((progress||[]).map(p=>[p.lesson_id,p.status]));
    let total=0,done=0;
    const moduleHtml=(modules||[]).map(module=>{
      const lessons=(module.lessons||[]).filter(l=>l.is_published).sort((a,b)=>a.sort_order-b.sort_order);
      const lessonHtml=lessons.map(lesson=>{
        total++;const status=progressMap.get(lesson.id)||"not_started";if(status==="completed")done++;
        learningLessons.set(lesson.id,{...lesson,moduleTitleMy:module.title_my,moduleTitleEn:module.title_en,status});
        const title=language==="my"?lesson.title_my:lesson.title_en;
        const statusText=status==="completed"?t("completedLabel"):status==="in_progress"?t("inProgressLabel"):"";
        return '<button class="lesson-link" data-open-lesson="'+lesson.id+'"><span>'+escapeHtml(title)+'</span><small>'+escapeHtml(statusText)+'</small></button>';
      }).join("");
      return '<div class="module-block"><h4>'+escapeHtml(language==="my"?module.title_my:module.title_en)+'</h4>'+(lessonHtml||'<p class="muted">'+t("noLessons")+'</p>')+'</div>';
    }).join("");
    const {data:quizzes,error:quizError}=await supabase.from("quizzes")
      .select("id,title_my,title_en,pass_mark").eq("course_id",course.id).eq("is_published",true);
    if(quizError)throw quizError;
    const quizCards=(quizzes||[]).map(quiz=>
      '<div class="quiz-card"><div><b>'+escapeHtml(language==="my"?quiz.title_my:quiz.title_en)+'</b><small>'+t("quizTitle")+' · '+t("quizScore")+' '+Number(quiz.pass_mark)+'%</small></div><button class="small-btn" data-start-quiz="'+quiz.id+'">'+t("startQuiz")+'</button></div>'
    ).join("");
    const percent=total?Math.round(done/total*100):0;
    courseBlocks.push('<article class="learning-course"><div class="learning-course-head"><div><span class="level">'+escapeHtml(course.level)+'</span><h3>'+escapeHtml(language==="my"?course.title_my:course.title_en)+'</h3></div><div class="progress-wrap"><strong>'+percent+'%</strong><small>'+t("progressLabel")+'</small><div class="progress-track"><span style="width:'+percent+'%"></span></div></div></div>'+moduleHtml+(quizCards?'<div class="quiz-list"><h4>'+t("quizTitle")+'</h4>'+quizCards+'</div>':'')+'</article>');
  }
  root.innerHTML=courseBlocks.join("");
  root.querySelectorAll("[data-open-lesson]").forEach(button=>button.addEventListener("click",()=>openLesson(button.dataset.openLesson)));
  root.querySelectorAll("[data-start-quiz]").forEach(button=>button.addEventListener("click",()=>openQuiz(button.dataset.startQuiz)));
  await renderLearnerAssignments(courseRows);
  await renderLearnerEvaluations();
  await loadLearnerCertificates();
  await loadLearnerSupport();

  pane.classList.add("hidden");
  el("quiz-runner").classList.add("hidden");
}

async function renderLearnerEvaluations(){
 const root=el("learner-evaluations");if(!root)return;
 const {data,error}=await supabase.from("learner_evaluations").select("id,course_id,assessment_type,overall_score,strengths,improvement_areas,evidence_notes,recommendation,trainer_feedback,status,assessed_at,trainer:profiles!learner_evaluations_trainer_id_fkey(full_name),courses(title_my,title_en)").eq("learner_id",currentUser.id).order("assessed_at",{ascending:false});
 if(error)throw error;
 root.innerHTML=(data||[]).map(a=>'<article class="panel"><h4>'+adminEsc(language==="my"?a.courses?.title_my:a.courses?.title_en)+' · '+adminEsc(a.assessment_type)+'</h4><p><strong>Overall competency: '+Number(a.overall_score).toFixed(1)+'%</strong> · '+adminEsc(a.status)+'</p><p><b>Strengths:</b> '+adminEsc(a.strengths||"—")+'</p><p><b>Improvement:</b> '+adminEsc(a.improvement_areas||"—")+'</p><p><b>Evidence:</b> '+adminEsc(a.evidence_notes||"—")+'</p><p><b>Recommendation:</b> '+adminEsc(a.recommendation||"—")+'</p><p><b>Trainer feedback:</b> '+adminEsc(a.trainer_feedback||"Pending Admin review")+'</p><small class="muted">'+adminEsc(a.trainer?.full_name||"Trainer")+' · '+new Date(a.assessed_at).toLocaleDateString()+'</small></article>').join("")||'<p class="muted">No trainer assessments yet.</p>';
}
async function renderLearnerAssignments(courseRows){
 const root=el("learner-assignments");if(!root)return;
 const courseIds=courseRows.map(x=>x.course_id);
 const {data:assignments,error}=await supabase.from("assignments").select("id,course_id,title_my,title_en,instructions_my,instructions_en,due_at").in("course_id",courseIds).eq("is_published",true).order("created_at");
 if(error)throw error;
 const {data:submissions,error:subError}=await supabase.from("assignment_submissions").select("assignment_id,status,score,feedback,file_path").eq("learner_id",currentUser.id);
 if(subError)throw subError;
 const submitted=new Map((submissions||[]).map(x=>[x.assignment_id,x]));
 root.innerHTML=(assignments||[]).map(a=>{
  const s=submitted.get(a.id),title=language==="my"?a.title_my:a.title_en,inst=language==="my"?a.instructions_my:a.instructions_en;
  const state=s?(s.status==="approved"?"Approved":s.status==="needs_revision"?"Needs revision":"Submitted"):"Not submitted";
  const form=s?"":'<form class="assignment-submit-form" data-assignment-submit="'+a.id+'"><label>Written response / စာဖြင့်ဖြေဆိုရန်<textarea name="response" rows="3" placeholder="Write your response / လုပ်ဆောင်ချက်ရေးပါ"></textarea></label><label>Attach file (optional) / ဖိုင်တွဲရန်<input name="attachment" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png" /></label><small class="muted">Maximum 10 MB. PDF, Office documents and images.</small><button class="small-btn" type="submit">Submit / တင်သွင်းရန်</button></form>';
  return '<article class="assignment-card"><h4>'+escapeHtml(title)+'</h4><p>'+escapeHtml(inst||"")+'</p><small class="muted">'+(a.due_at?new Date(a.due_at).toLocaleString():"No due date")+' · '+state+'</small>'+(s?'<p>'+((s.score===null||s.score===undefined)?"":"Score: "+Number(s.score)+"/100")+'</p><p>'+escapeHtml(s.feedback||"")+'</p>':form)+'</article>';
 }).join("")||'<p class="muted">No assignments available / လက်တွေ့လုပ်ငန်း မရှိသေးပါ။</p>';
 root.querySelectorAll("[data-assignment-submit]").forEach(form=>form.addEventListener("submit",submitLearnerAssignment));
}
async function submitLearnerAssignment(event){
 event.preventDefault();const form=event.currentTarget,button=form.querySelector("button"),response=form.elements.response.value.trim(),file=form.elements.attachment.files[0];
 if(!response&&!file){alert("Write a response or attach a file before submitting.");return;}
 const allowed=["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation","image/jpeg","image/png"];
 if(file&&file.size>10*1024*1024){alert("File must be 10 MB or smaller.");return;}
 if(file&&!allowed.includes(file.type)){alert("Unsupported file type. Please upload PDF, Office document or JPG/PNG.");return;}
 button.disabled=true;let filePath=null;
 try{
  if(file){
   const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(-100);
   filePath=currentUser.id+"/assignments/"+form.dataset.assignmentSubmit+"/"+Date.now()+"_"+safeName;
   const {error:uploadError}=await supabase.storage.from("lvc-learning-files").upload(filePath,file,{upsert:false,contentType:file.type});
   if(uploadError)throw uploadError;
  }
  const {error}=await supabase.from("assignment_submissions").insert({assignment_id:form.dataset.assignmentSubmit,learner_id:currentUser.id,text_response:response||null,file_path:filePath});
  if(error){if(filePath)await supabase.storage.from("lvc-learning-files").remove([filePath]);throw error;}
  alert(language==="my"?"လုပ်ငန်းတင်သွင်းပြီးပါပြီ။":"Assignment submitted.");await loadLearning();
 }catch(error){alert(error.message||String(error));button.disabled=false;}
}
async function openLesson(id){
  const lesson=learningLessons.get(id);if(!lesson)return;
  const {error}=await supabase.from("lesson_progress").upsert(
    {learner_id:currentUser.id,lesson_id:id,status:lesson.status==="completed"?"completed":"in_progress",updated_at:new Date().toISOString()},
    {onConflict:"learner_id,lesson_id"}
  );
  if(error){alert(error.message);return;}
  lesson.status=lesson.status==="completed"?"completed":"in_progress";
  const title=language==="my"?lesson.title_my:lesson.title_en;
  const content=language==="my"?lesson.content_my:lesson.content_en;
  el("lesson-reader-title").textContent=title;
  el("lesson-reader-module").textContent=language==="my"?lesson.moduleTitleMy:lesson.moduleTitleEn;
  el("lesson-reader-content").innerHTML=escapeHtml(content||"").replace(/\n/g,"<br>");
  el("lesson-reader").classList.remove("hidden");
  el("lesson-reader").scrollIntoView({behavior:"smooth",block:"start"});
  el("lesson-complete-btn").textContent=lesson.status==="completed"?t("completedLabel"):t("markComplete");
  el("lesson-complete-btn").disabled=lesson.status==="completed";
  el("lesson-complete-btn").onclick=()=>completeLesson(id);
}
async function completeLesson(id){
  const {error}=await supabase.from("lesson_progress").upsert(
    {learner_id:currentUser.id,lesson_id:id,status:"completed",completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},
    {onConflict:"learner_id,lesson_id"}
  );
  if(error){alert(error.message);return;}
  await loadLearning();
  alert(language==="my"?"သင်ခန်းစာ ပြီးဆုံးကြောင်း မှတ်တမ်းတင်ပြီးပါပြီ။":"Lesson marked as completed.");
}

let activeQuiz = null;
async function openQuiz(quizId){
  const runner=el("quiz-runner");
  runner.classList.remove("hidden");
  runner.innerHTML='<p class="muted">'+t("quizLoading")+'</p>';
  runner.scrollIntoView({behavior:"smooth",block:"start"});
  const [{data:quiz,error:quizError},{data:questions,error:questionError}]=await Promise.all([
    supabase.from("quizzes").select("id,title_my,title_en,pass_mark").eq("id",quizId).single(),
    supabase.from("quiz_questions").select("id,question_my,question_en,options,sort_order").eq("quiz_id",quizId).order("sort_order")
  ]);
  if(quizError||questionError){runner.innerHTML='<p class="error">'+escapeHtml((quizError||questionError).message)+'</p>';return;}
  if(!questions?.length){runner.innerHTML='<p class="muted">'+t("quizEmpty")+'</p>';return;}
  activeQuiz={quiz,questions};
  const questionHtml=questions.map((q,index)=>{
    const prompt=language==="my"?q.question_my:q.question_en;
    const options=Array.isArray(q.options)?q.options:[];
    const choices=options.map((option,optionIndex)=>{
      let label=option;
      if(option&&typeof option==="object")label=language==="my"?(option.my||option.label_my||option.en||option.label_en||""):(option.en||option.label_en||option.my||option.label_my||"");
      return '<label class="quiz-option"><input type="radio" name="question-'+q.id+'" value="'+optionIndex+'" required><span>'+escapeHtml(label)+'</span></label>';
    }).join("");
    return '<fieldset class="quiz-question"><legend>'+(index+1)+'. '+escapeHtml(prompt||"")+'</legend>'+choices+'</fieldset>';
  }).join("");
  runner.innerHTML='<div class="quiz-runner-head"><div><p class="eyebrow">'+t("quizTitle")+'</p><h3>'+escapeHtml(language==="my"?quiz.title_my:quiz.title_en)+'</h3></div><button type="button" class="ghost" id="close-quiz">×</button></div><form id="quiz-form">'+questionHtml+'<button class="primary-btn" type="submit">'+t("submitQuiz")+'</button><p id="quiz-result" class="message" role="status"></p></form>';
  el("close-quiz").addEventListener("click",()=>runner.classList.add("hidden"));
  el("quiz-form").addEventListener("submit",submitQuiz);
}
async function submitQuiz(event){
  event.preventDefault();
  if(!activeQuiz)return;
  const form=event.currentTarget;
  const submitButton=form.querySelector('button[type="submit"]');
  submitButton.disabled=true;
  const answers={};
  for(const question of activeQuiz.questions){
    const selected=form.querySelector('input[name="question-'+question.id+'"]:checked');
    if(!selected){submitButton.disabled=false;return;}
    answers[question.id]=Number(selected.value);
  }
  const {data,error}=await supabase.rpc("submit_quiz_attempt",{p_quiz_id:activeQuiz.quiz.id,p_answers:answers});
  const result=el("quiz-result");
  if(error){
    result.textContent=error.message||t("quizError");result.classList.add("error");submitButton.disabled=false;return;
  }
  const attempt=Array.isArray(data)?data[0]:data;
  if(!attempt){result.textContent=t("quizError");result.classList.add("error");submitButton.disabled=false;return;}
  const score=Number(attempt.score);
  result.classList.remove("error");
  result.textContent=(attempt.passed?t("quizPass"):t("quizFail"))+' — '+t("quizScore")+': '+score+'%';
  submitButton.textContent=t("quizSubmitted");
  submitButton.disabled=true;
}
el("lesson-back-btn").addEventListener("click",()=>el("lesson-reader").classList.add("hidden"));


const adminCache={users:[],enrollments:[],courses:[],modules:[],lessons:[],quizzes:[],questions:[],progress:[],attempts:[],assignments:[],submissions:[],certificates:[],attendance:[],announcements:[],supportRequests:[],supportMessages:[],courseTrainers:[],evaluations:[],careerAssessments:[],skillProfiles:[],opportunities:[],careerApplications:[],graduateFollowups:[],initialAssessments:[],referrals:[],stageProgress:[],stageProgressError:null,activitySubmissions:[],activitySubmissionsError:null,stageTrainers:[]};
const adminEsc=v=>escapeHtml(v??"");
function adminTable(headers,rows){return rows.length?'<table class="admin-data-table"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>':'<p class="muted">No records found / မှတ်တမ်းမရှိသေးပါ။</p>';}
function setAdminTab(tab){document.querySelectorAll("[data-admin-tab]").forEach(b=>b.classList.toggle("active",b.dataset.adminTab===tab));document.querySelectorAll("[data-admin-view]").forEach(v=>v.classList.toggle("hidden",v.dataset.adminView!==tab));}
document.querySelectorAll("[data-admin-tab]").forEach(b=>b.addEventListener("click",()=>setAdminTab(b.dataset.adminTab)));
const verifyForm=el("certificate-verify-form");if(verifyForm){verifyForm.onsubmit=e=>{e.preventDefault();verifyCertificate(el("certificate-verify-code").value.trim());};const code=new URLSearchParams(window.location.search).get("verify");if(code){el("certificate-verification").classList.remove("hidden");el("certificate-verify-code").value=code;verifyCertificate(code);}}
async function loadAdmin(){
 const rs=await Promise.all([
  supabase.from("profiles").select("id,full_name,phone,role,account_status,created_at").order("created_at",{ascending:false}),
  supabase.from("enrollments").select("id,learner_id,course_id,status,applied_at,completed_at,profiles(full_name,phone),courses(title_my,title_en,level)").order("applied_at",{ascending:false}),
  supabase.from("courses").select("id,title_my,title_en,level,is_published,sort_order").order("sort_order"),
  supabase.from("modules").select("id,course_id,title_my,title_en,sort_order").order("sort_order"),
  supabase.from("lessons").select("id,module_id,title_my,title_en,content_my,content_en,video_url,resource_path,is_published,content_status,version_no,updated_at,sort_order").order("sort_order"),
  supabase.from("quizzes").select("id,course_id,title_my,title_en,pass_mark,is_published,created_at"),
  supabase.from("quiz_questions").select("id,quiz_id"),
  supabase.from("lesson_progress").select("id,learner_id,lesson_id,status"),
  supabase.from("quiz_attempts").select("*"),
  supabase.from("assignments").select("id,course_id,title_my,title_en,due_at,is_published,created_at").order("created_at",{ascending:false}),
  supabase.from("assignment_submissions").select("id,assignment_id,learner_id,text_response,file_path,status,feedback,score,submitted_at,profiles(full_name),assignments(title_my,title_en,course_id)").order("submitted_at",{ascending:false}),
  supabase.from("certificates").select("id,learner_id,course_id,certificate_code,issued_at,file_path,profiles(full_name),courses(title_my,title_en,level)").order("issued_at",{ascending:false}),
  supabase.from("attendance_records").select("id,learner_id,course_id,batch_id,session_date,status,notes,profiles(full_name),courses(title_my,title_en)").order("session_date",{ascending:false}),
  supabase.from("announcements").select("id,title_my,title_en,body_my,body_en,is_published,published_at").order("created_at",{ascending:false}),
  supabase.from("support_requests").select("id,learner_id,subject,category,status,created_at,updated_at,profiles(full_name)").order("updated_at",{ascending:false}),
  supabase.from("support_messages").select("id,request_id,sender_id,body,created_at").order("created_at"),
  supabase.from("course_trainers").select("id,course_id,trainer_id,assigned_at,trainer:profiles!course_trainers_trainer_id_fkey(full_name,phone),courses(title_my,title_en,level)").order("assigned_at",{ascending:false}),
  supabase.from("learner_evaluations").select("id,course_id,learner_id,trainer_id,assessment_type,practical_skills_score,task_completion_score,problem_solving_score,communication_score,participation_score,overall_score,strengths,improvement_areas,evidence_notes,recommendation,trainer_feedback,status,assessed_at,reviewed_at,learner:profiles!learner_evaluations_learner_id_fkey(full_name),trainer:profiles!learner_evaluations_trainer_id_fkey(full_name),courses(title_my,title_en,level)").order("assessed_at",{ascending:false}),
  supabase.from("career_readiness_assessments").select("id,learner_id,pathway,career_interest,overall_score,support_needs,next_steps,status,created_at,learner:profiles!career_readiness_assessments_learner_id_fkey(full_name)").order("created_at",{ascending:false}),
  supabase.from("learner_skill_profiles").select("learner_id,career_pathway,career_goal,skills,languages,location_text,learner:profiles!learner_skill_profiles_learner_id_fkey(full_name)").order("updated_at",{ascending:false}),
  supabase.from("career_opportunities").select("*").order("created_at",{ascending:false}),
  supabase.from("career_opportunity_applications").select("id,opportunity_id,learner_id,cover_note,status,applied_at,admin_notes,career_opportunities(title,organization_name),profiles!career_opportunity_applications_learner_id_fkey(full_name)").order("applied_at",{ascending:false}),
  supabase.from("graduate_followups").select("id,enrollment_id,learner_id,followup_period,employment_status,pathway,job_or_business_title,sector,monthly_income,previous_monthly_income,income_currency,skills_used,training_relevance,key_outcome,challenges,support_needed,consent_to_contact,consent_to_story,story_text,status,admin_notes,submitted_at,profiles!graduate_followups_learner_id_fkey(full_name),enrollments(courses(title_my,title_en,level))").order("submitted_at",{ascending:false}),
  supabase.from("learner_initial_assessments").select("id,learner_id,responses,status,reviewer_summary,reviewed_by,reviewed_at,submitted_at,consent_text_version").order("submitted_at",{ascending:false}),
  supabase.from("career_guidance_referrals").select("id,learner_id,referral_type,status,learner_message,provider_name,provider_contact,meeting_mode,meeting_at,meeting_location,learner_visible_summary,created_at,updated_at,consent_given").order("created_at",{ascending:false})
 ]);
 const names=["profiles","enrollments","courses","modules","lessons","quizzes","questions","progress","attempts","assignments","submissions","certificates","attendance","announcements","support requests","support messages","course trainer assignments","learner evaluations","career readiness assessments","learner skill profiles","career opportunities","career opportunity applications","graduate follow-ups","initial assessments","career guidance referrals"];
 rs.forEach((r,i)=>{if(r.error)throw new Error(names[i]+": "+r.error.message);});
 [adminCache.users,adminCache.enrollments,adminCache.courses,adminCache.modules,adminCache.lessons,adminCache.quizzes,adminCache.questions,adminCache.progress,adminCache.attempts,adminCache.assignments,adminCache.submissions,adminCache.certificates,adminCache.attendance,adminCache.announcements,adminCache.supportRequests,adminCache.supportMessages,adminCache.courseTrainers,adminCache.evaluations,adminCache.careerAssessments,adminCache.skillProfiles,adminCache.opportunities,adminCache.careerApplications,adminCache.graduateFollowups,adminCache.initialAssessments,adminCache.referrals]=rs.map(r=>r.data||[]);
 const stageResult=await supabase.from("learner_stage_progress").select("id,learner_id,stage_no,status,evidence_summary,reviewer_feedback,started_at,updated_at,reviewed_at,reviewed_by").order("updated_at",{ascending:false});
 adminCache.stageProgress=stageResult.data||[];adminCache.stageProgressError=stageResult.error?.message||null;
 const activityResult=await supabase.from("livelihood_activity_submissions").select("id,learner_id,stage_progress_id,activity_id,evidence_text,status,score,criterion_results,reviewer_feedback,submitted_at,reviewed_at,profiles(full_name),livelihood_stage_activities(activity_no,title_my,title_en,assessment_criteria),learner_stage_progress(stage_no)").order("submitted_at",{ascending:false});
 adminCache.activitySubmissions=activityResult.data||[];adminCache.activitySubmissionsError=activityResult.error?.message||null;
 renderAdmin();
}

let adminQuizQuestionCount = 0;
function addAdminQuizQuestion(){
 const n=adminQuizQuestionCount++;
 const wrap=document.createElement("fieldset");
 wrap.className="quiz-question admin-question-editor";
 wrap.innerHTML='<legend>Question '+(n+1)+' / မေးခွန်း '+(n+1)+'</legend><div class="field"><label>Question (မြန်မာ)</label><textarea data-q-my required rows="2"></textarea></div><div class="field"><label>Question (English)</label><textarea data-q-en required rows="2"></textarea></div><div class="admin-option-grid">'+[0,1,2,3].map(i=>'<div class="field"><label>Option '+(i+1)+' (မြန်မာ)</label><input data-opt-my="'+i+'" required></div><div class="field"><label>Option '+(i+1)+' (English)</label><input data-opt-en="'+i+'" required></div>').join("")+'</div><div class="field"><label>Correct answer / အဖြေမှန်</label><select data-q-correct><option value="0">Option 1</option><option value="1">Option 2</option><option value="2">Option 3</option><option value="3">Option 4</option></select></div><button type="button" class="small-btn reject" data-remove-question>Remove / ဖယ်ရှားရန်</button>';
 el("quiz-question-editor").appendChild(wrap);
}
function renderAdminQuizForm(){
 const select=el("quiz-course"),keep=select.value;
 select.innerHTML=adminCache.courses.map(c=>'<option value="'+c.id+'">'+adminEsc(c.level)+' — '+adminEsc(language==="my"?c.title_my:c.title_en)+'</option>').join("");
 if(adminCache.courses.some(c=>c.id===keep))select.value=keep;
 if(!el("quiz-question-editor").children.length)addAdminQuizQuestion();
}
async function submitAdminQuiz(event){
 event.preventDefault();
 const msg=el("quiz-form-message");msg.textContent="";msg.classList.remove("error");
 const blocks=[...el("quiz-question-editor").querySelectorAll(".admin-question-editor")];
 if(!blocks.length||blocks.length>50){msg.textContent="Add between 1 and 50 questions.";msg.classList.add("error");return;}
 const questions=blocks.map(b=>({question_my:b.querySelector("[data-q-my]").value.trim(),question_en:b.querySelector("[data-q-en]").value.trim(),options:[0,1,2,3].map(i=>({my:b.querySelector('[data-opt-my="'+i+'"]').value.trim(),en:b.querySelector('[data-opt-en="'+i+'"]').value.trim()})),correct_option_index:Number(b.querySelector("[data-q-correct]").value)}));
 if(questions.some(q=>!q.question_my||!q.question_en||q.options.some(o=>!o.my||!o.en))){msg.textContent="Complete all Myanmar and English question and option fields.";msg.classList.add("error");return;}
 const btn=el("admin-quiz-form").querySelector('button[type="submit"]');btn.disabled=true;
 try{
  const {data,error}=await supabase.rpc("create_admin_quiz",{p_course_id:el("quiz-course").value,p_title_my:el("quiz-title-my").value.trim(),p_title_en:el("quiz-title-en").value.trim(),p_pass_mark:Number(el("quiz-pass-mark").value),p_questions:questions});
  if(error)throw error;
  msg.textContent=(language==="my"?"Quiz မူကြမ်းကို သိမ်းဆည်းပြီးပါပြီ။ ID: ":"Quiz draft saved. ID: ")+data;
  el("admin-quiz-form").reset();el("quiz-pass-mark").value="70";el("quiz-question-editor").innerHTML="";adminQuizQuestionCount=0;addAdminQuizQuestion();
  await loadAdmin();
 }catch(err){msg.textContent=err.message||"Could not save quiz.";msg.classList.add("error");}
 finally{btn.disabled=false;}
}

function renderAdminAssignments(){
 const sel=el("assignment-course"),keep=sel.value;
 sel.innerHTML=adminCache.courses.map(c=>'<option value="'+c.id+'">'+adminEsc(c.level)+' — '+adminEsc(language==="my"?c.title_my:c.title_en)+'</option>').join("");
 if(adminCache.courses.some(c=>c.id===keep))sel.value=keep;
 el("admin-assignments").innerHTML=adminTable(["Assignment","Course","Due","Status","Action"],adminCache.assignments.map(a=>{
  const course=adminCache.courses.find(c=>c.id===a.course_id);
  return '<tr><td>'+adminEsc(language==="my"?a.title_my:a.title_en)+'</td><td>'+adminEsc(course?.level||"—")+'</td><td>'+adminEsc(a.due_at?new Date(a.due_at).toLocaleString():"—")+'</td><td>'+(a.is_published?"Published":"Draft")+'</td><td><button class="small-btn" data-assignment-publish="'+a.id+'" data-next="'+(!a.is_published)+'">'+(a.is_published?"Unpublish":"Publish")+'</button></td></tr>';
 }));
 el("admin-submissions").innerHTML=adminTable(["Learner","Assignment","Submitted","Work","Score","Review"],adminCache.submissions.map(s=>{
  return '<tr><td>'+adminEsc(s.profiles?.full_name||"Learner")+'</td><td>'+adminEsc(language==="my"?s.assignments?.title_my:s.assignments?.title_en)+'</td><td>'+new Date(s.submitted_at).toLocaleDateString()+'</td><td><details><summary>View</summary><p>'+adminEsc(s.text_response||"")+'</p>'+(s.file_path?'<button type="button" class="small-btn" data-submission-file="'+adminEsc(s.file_path)+'">Open attachment</button>':'')+'</details></td><td><input type="number" min="0" max="100" step="0.5" data-score="'+s.id+'" value="'+(s.score??"")+'" placeholder="0–100"></td><td><select data-status="'+s.id+'"><option value="submitted" '+(s.status==="submitted"?"selected":"")+'>Submitted</option><option value="reviewing" '+(s.status==="reviewing"?"selected":"")+'>Reviewing</option><option value="needs_revision" '+(s.status==="needs_revision"?"selected":"")+'>Needs revision</option><option value="approved" '+(s.status==="approved"?"selected":"")+'>Approved</option></select><textarea rows="2" data-feedback="'+s.id+'" placeholder="Feedback">'+adminEsc(s.feedback||"")+'</textarea><button class="small-btn" data-review="'+s.id+'">Save</button></td></tr>';
 }));
}
async function createAdminAssignment(event){
 event.preventDefault();const msg=el("assignment-form-message"),due=el("assignment-due").value;
 msg.textContent="";
 const payload={course_id:el("assignment-course").value,title_my:el("assignment-title-my").value.trim(),title_en:el("assignment-title-en").value.trim(),instructions_my:el("assignment-instructions-my").value.trim(),instructions_en:el("assignment-instructions-en").value.trim(),due_at:due?new Date(due).toISOString():null,is_published:false};
 const {error}=await supabase.from("assignments").insert(payload);
 if(error){msg.textContent=error.message;msg.classList.add("error");return;}
 msg.textContent=language==="my"?"မူကြမ်းအဖြစ် သိမ်းဆည်းပြီးပါပြီ။":"Assignment saved as draft.";
 event.currentTarget.reset();await loadAdmin();
}
async function saveAdminReview(id){
 const scoreText=document.querySelector('[data-score="'+id+'"]').value,score=scoreText===""?null:Number(scoreText);
 if(score!==null&&(!Number.isFinite(score)||score<0||score>100)){alert("Score must be between 0 and 100.");return;}
 const status=document.querySelector('[data-status="'+id+'"]').value,feedback=document.querySelector('[data-feedback="'+id+'"]').value.trim();
 const {error}=await supabase.from("assignment_submissions").update({score,status,feedback,reviewed_at:new Date().toISOString(),reviewed_by:currentUser.id}).eq("id",id);
 if(error){alert(error.message);return;}
 el("admin-alert").textContent=language==="my"?"အမှတ်နှင့် Feedback သိမ်းဆည်းပြီးပါပြီ။":"Review saved.";
 await loadAdmin();
}
function renderAdminCertificates(){
 const issued=new Map(adminCache.certificates.map(c=>[c.learner_id+"|"+c.course_id,c]));
 const rows=adminCache.enrollments.filter(e=>["approved","completed"].includes(e.status)).map(e=>{
  const cert=issued.get(e.learner_id+"|"+e.course_id),name=e.profiles?.full_name||"Learner",course=e.courses?.[language==="my"?"title_my":"title_en"]||"Course";
  return '<tr><td>'+adminEsc(name)+'</td><td>'+adminEsc(course)+'</td><td>'+(cert?adminEsc(cert.certificate_code):"Not issued")+'</td><td>'+(cert?new Date(cert.issued_at).toLocaleDateString():"—")+'</td><td>'+(cert?'<button class="small-btn" data-cert-print="'+adminEsc(cert.certificate_code)+'" data-cert-name="'+adminEsc(name)+'" data-cert-course="'+adminEsc(course)+'">Print</button>':'<button class="small-btn approve" data-cert-issue="'+e.learner_id+'" data-course="'+e.course_id+'">Check & issue</button>')+'</td></tr>';
 });
 el("admin-certificates").innerHTML=adminTable(["Learner","Course","Certificate code","Issued","Action"],rows);
}
async function issueAdminCertificate(learnerId,courseId,button){
 button.disabled=true;
 try{
  const {data,error}=await supabase.rpc("issue_course_certificate",{p_learner_id:learnerId,p_course_id:courseId});
  if(error)throw error;
  el("admin-alert").textContent="Certificate issued: "+(Array.isArray(data)?data[0]?.certificate_code:"");
  await loadAdmin();
 }catch(error){alert(error.message||String(error));button.disabled=false;}
}
function openCertificatePrint(code,name,course){
 const verifyUrl=window.location.origin+window.location.pathname+"?verify="+encodeURIComponent(code);
 const qr="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data="+encodeURIComponent(verifyUrl);
 const w=window.open("","_blank");if(!w){alert("Please allow pop-ups to print the certificate.");return;}
 w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>ForeRunners Certificate</title><style>body{font-family:Georgia,serif;margin:0;padding:36px;color:#24332c}.cert{border:8px double #496c59;min-height:650px;padding:48px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center}h1{font-size:38px;margin:10px}h2{font-size:28px}p{font-size:18px}.code{font:14px monospace;margin-top:18px}img{width:125px;height:125px;margin-top:10px}@media print{button{display:none}}</style></head><body><main class="cert"><p>FORERUNNERS ORGANIZATION</p><h1>CERTIFICATE OF COMPLETION</h1><h2>သင်တန်းပြီးမြောက်ကြောင်း အသိအမှတ်ပြုလွှာ</h2><p>This certificate is proudly presented to</p><h2>'+escapeHtml(name)+'</h2><p>for successfully completing</p><h2>'+escapeHtml(course)+'</h2><p>ForeRunners Livelihood & Vocational Learning Center</p><p class="code">'+escapeHtml(code)+'</p><img src="'+qr+'" alt="Certificate verification QR code"><p>Scan to verify this certificate</p><button onclick="window.print()">Print / Save as PDF</button></main></body></html>');
 w.document.close();
}
async function loadLearnerCertificates(){
 const root=el("learner-certificates");if(!root)return;
 const {data,error}=await supabase.from("certificates").select("certificate_code,issued_at,courses(title_my,title_en)").eq("learner_id",currentUser.id).order("issued_at",{ascending:false});
 if(error)throw error;
 const certificateCards=(data||[]).map(c=>'<article class="assignment-card"><b>'+escapeHtml(language==="my"?c.courses?.title_my:c.courses?.title_en)+'</b><p>'+escapeHtml(c.certificate_code)+'</p><button class="small-btn" data-learner-cert="'+escapeHtml(c.certificate_code)+'" data-course="'+escapeHtml(language==="my"?c.courses?.title_my:c.courses?.title_en)+'">Print certificate</button></article>').join("");
 root.innerHTML='<div class="panel"><h3>My certificates / ကျွန်ုပ်၏ သင်တန်းဆင်းလက်မှတ်များ</h3>'+(certificateCards||'<p class="muted">No certificates issued yet / လက်မှတ်မရှိသေးပါ။</p>')+'</div>';
 root.querySelectorAll("[data-learner-cert]").forEach(b=>b.onclick=()=>openCertificatePrint(b.dataset.learnerCert,currentUser.user_metadata?.full_name||"Learner",b.dataset.course));
}
async function verifyCertificate(code){
 const result=el("certificate-verify-result");result.textContent="Checking…";
 const {data,error}=await supabase.rpc("verify_course_certificate",{p_certificate_code:code});
 if(error){result.textContent=error.message;return;}
 const cert=Array.isArray(data)?data[0]:null;
 result.innerHTML=cert?'<h3>Valid certificate / မှန်ကန်သောလက်မှတ်</h3><p><b>'+escapeHtml(cert.learner_name)+'</b></p><p>'+escapeHtml(language==="my"?cert.course_title_my:cert.course_title_en)+'</p><p>'+new Date(cert.issued_at).toLocaleDateString()+'</p><p>'+escapeHtml(cert.certificate_code)+'</p>':'<h3>Certificate not found / လက်မှတ်မတွေ့ပါ</h3>';
}

function getDonorOutcomeMetrics(courseId){
 const today=new Date();today.setHours(23,59,59,999);
 const enrollments=adminCache.enrollments.filter(e=>e.status==="completed"&&e.completed_at&& (courseId==="all"||e.course_id===courseId));
 const rows=adminCache.graduateFollowups.filter(r=>courseId==="all"||enrollments.some(e=>e.id===r.enrollment_id));
 const periods=["30_day","90_day","180_day"].map(period=>{
  const days=Number(period.split("_")[0]),eligible=enrollments.filter(e=>new Date(new Date(e.completed_at).getTime()+days*86400000)<=today);
  const responses=rows.filter(r=>r.followup_period===period&&eligible.some(e=>e.id===r.enrollment_id));
  const n=responses.length,work=responses.filter(r=>["employed","self_employed"].includes(r.employment_status)).length,self=responses.filter(r=>r.employment_status==="self_employed").length,apprentices=responses.filter(r=>r.employment_status==="apprenticeship").length;
  const paired=responses.filter(r=>r.monthly_income!==null&&r.monthly_income!==undefined&&r.previous_monthly_income!==null&&r.previous_monthly_income!==undefined&&Number(r.previous_monthly_income)>0&&r.income_currency==="MMK");
  const increases=paired.filter(r=>Number(r.monthly_income)>Number(r.previous_monthly_income)).length;
  const skillUsers=responses.filter(r=>Array.isArray(r.skills_used)&&r.skills_used.length>0).length;
  const relevance=responses.filter(r=>r.training_relevance!==null&&r.training_relevance!==undefined);
  const safe=n>=5;
  return {period,eligible:eligible.length,responses:n,responseRate:eligible.length>=5?Math.round(n/eligible.length*100):null,work,self,apprentices,workRate:safe?Math.round(work/n*100):null,selfRate:safe?Math.round(self/n*100):null,skillUsers,skillRate:safe?Math.round(skillUsers/n*100):null,paired:paired.length,increases,increaseRate:paired.length>=5?Math.round(increases/paired.length*100):null,avgRelevance:relevance.length>=5?(relevance.reduce((s,r)=>s+Number(r.training_relevance),0)/relevance.length).toFixed(1):null};
 });
 return {enrollments:enrollments.length,rows,periods};
}
function renderDonorOutcomeDashboard(){
 const filter=el("donor-course-filter"),keep=filter.value;
 filter.innerHTML='<option value="all">All courses / သင်တန်းအားလုံး</option>'+adminCache.courses.map(c=>'<option value="'+c.id+'">'+adminEsc(c.level)+' — '+adminEsc(language==="my"?c.title_my:c.title_en)+'</option>').join("");
 if(keep==="all"||adminCache.courses.some(c=>c.id===keep))filter.value=keep;else filter.value="all";
 const metrics=getDonorOutcomeMetrics(filter.value),latest=metrics.periods.find(p=>p.period==="180_day")||metrics.periods[0];
 const stat=(label,value)=>'<article class="admin-stat"><span>'+label+'</span><strong>'+value+'</strong></article>';
 el("donor-outcome-stats").innerHTML=[stat("Completed enrollments",metrics.enrollments>=5?metrics.enrollments:"Withheld (n<5)"),stat("180-day work outcome",latest?.workRate===null?"Withheld (n<5)":latest?.workRate+"%"),stat("180-day self-employment",latest?.selfRate===null?"Withheld (n<5)":latest?.selfRate+"%"),stat("180-day skill use",latest?.skillRate===null?"Withheld (n<5)":latest?.skillRate+"%")].join("");
 el("donor-outcome-periods").innerHTML=adminTable(["Follow-up","Due graduates","Responses","Response rate","Employed / self-employed","Self-employed","Apprenticeship","Skills used","Income increased*","Training relevance"],metrics.periods.map(p=>'<tr><td>'+p.period.replace("_"," ")+'</td><td>'+(p.eligible>=5?p.eligible:"Withheld (n<5)")+'</td><td>'+(p.responses>=5?p.responses:"Withheld (n<5)")+'</td><td>'+(p.responseRate===null?"Withheld (n<5)":p.responseRate+"%")+'</td><td>'+(p.workRate===null?"Withheld (n<5)":p.workRate+"%")+'</td><td>'+(p.selfRate===null?"Withheld (n<5)":p.selfRate+"%")+'</td><td>'+(p.apprentices>=5?p.apprentices:"Withheld (n<5)")+'</td><td>'+(p.skillRate===null?"Withheld (n<5)":p.skillRate+"%")+'</td><td>'+(p.increaseRate===null?"Withheld / insufficient paired data":p.increaseRate+"%")+'</td><td>'+(p.avgRelevance===null?"Withheld (n<5)":p.avgRelevance+"/5")+'</td></tr>'));
 el("donor-outcome-notes").textContent="* Income increase is calculated only for paired MMK income records with a previous income greater than zero. Response rate = submitted follow-ups / graduates due for that period. Employment outcome excludes apprenticeship. Rates are withheld where the response sample is below 5. All outcomes are self-reported.";
}
function exportDonorOutcomeCSV(){
 const m=getDonorOutcomeMetrics(el("donor-course-filter").value),headers=["followup_period","eligible_graduates_due","responses","response_rate_percent","employed_or_self_employed_count","work_outcome_rate_percent","self_employed_count","self_employment_rate_percent","apprenticeship_count","skills_used_count","skills_used_rate_percent","paired_MMK_income_records","income_increased_count","income_increase_rate_percent","average_training_relevance_1_to_5"];
 const rows=[headers,...m.periods.map(p=>[p.period,p.eligible>=5?p.eligible:"Withheld (n<5)",p.responses>=5?p.responses:"Withheld (n<5)",p.responseRate,p.workRate===null?"Withheld (n<5)":p.workRate,p.workRate===null?"Withheld (n<5)":p.work,p.selfRate===null?"Withheld (n<5)":p.self,p.selfRate,p.apprentices>=5?p.apprentices:"Withheld (n<5)",p.skillRate===null?"Withheld (n<5)":p.skillUsers,p.skillRate,p.paired>=5?p.paired:"Withheld (n<5)",p.increaseRate===null?"Withheld (n<5)":p.increases,p.increaseRate,p.avgRelevance])];
 const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n"),blob=new Blob(["\\uFEFF",csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="forerunners-donor-outcomes-aggregated.csv";a.click();URL.revokeObjectURL(url);
}
function renderMEL(){
 renderDonorOutcomeDashboard();
 const courseSel=el("attendance-course"),keep=courseSel.value;
 courseSel.innerHTML=adminCache.courses.map(c=>'<option value="'+c.id+'">'+adminEsc(c.level)+' — '+adminEsc(language==="my"?c.title_my:c.title_en)+'</option>').join("");
 if(adminCache.courses.some(c=>c.id===keep))courseSel.value=keep;
 if(!el("attendance-date").value){const now=new Date();el("attendance-date").value=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");}
 const courseId=courseSel.value,date=el("attendance-date").value;
 const enroll=adminCache.enrollments.filter(e=>e.course_id===courseId&&["approved","completed"].includes(e.status));
 const existing=new Map(adminCache.attendance.filter(a=>a.course_id===courseId&&a.session_date===date).map(a=>[a.learner_id,a]));
 el("attendance-register").innerHTML=adminTable(["Learner","Attendance","Notes","Save"],enroll.map(e=>{
  const old=existing.get(e.learner_id),status=old?.status||"present";
  return '<tr><td>'+adminEsc(e.profiles?.full_name||"Learner")+'</td><td><select data-att-status="'+e.learner_id+'"><option value="present" '+(status==="present"?"selected":"")+'>Present</option><option value="late" '+(status==="late"?"selected":"")+'>Late</option><option value="absent" '+(status==="absent"?"selected":"")+'>Absent</option><option value="excused" '+(status==="excused"?"selected":"")+'>Excused</option></select></td><td><input data-att-notes="'+e.learner_id+'" value="'+adminEsc(old?.notes||"")+'" placeholder="Optional"></td><td><button class="small-btn approve" data-att-save="'+e.learner_id+'">Save</button></td></tr>';
 }));
 document.querySelectorAll("[data-att-save]").forEach(b=>b.onclick=()=>saveAttendance(b.dataset.attSave,b));
 const learners=adminCache.users.filter(u=>u.role!=="admin").length;
 const approved=adminCache.enrollments.filter(e=>["approved","completed"].includes(e.status)).length;
 const completed=adminCache.progress.filter(p=>p.status==="completed").length;
 const totalSub=adminCache.submissions.length,reviewed=adminCache.submissions.filter(s=>["approved","needs_revision"].includes(s.status)).length;
 const present=adminCache.attendance.filter(a=>a.status==="present"||a.status==="late").length;
 const attCount=adminCache.attendance.length;
 const stats=[["Learner accounts",learners],["Approved enrollments",approved],["Completed lesson records",completed],["Assignments submitted",totalSub],["Reviewed submissions",reviewed],["Attendance rate",attCount?Math.round(present/attCount*100)+"%":"—"]];
 el("mel-summary").innerHTML=stats.map(([k,v])=>'<article class="admin-stat"><span>'+k+'</span><strong>'+v+'</strong></article>').join("");
 el("mel-course-report").innerHTML=adminTable(["Course","Enrolled","Lesson completion","Quiz pass rate","Assignments"],adminCache.courses.map(c=>{
  const mids=adminCache.modules.filter(m=>m.course_id===c.id).map(m=>m.id),lids=adminCache.lessons.filter(l=>mids.includes(l.module_id)&&l.is_published).map(l=>l.id);
  const enrolled=adminCache.enrollments.filter(e=>e.course_id===c.id&&["approved","completed"].includes(e.status)).length;
  const possible=enrolled*lids.length,done=adminCache.progress.filter(p=>lids.includes(p.lesson_id)&&p.status==="completed").length;
  const qids=adminCache.quizzes.filter(q=>q.course_id===c.id&&q.is_published).map(q=>q.id),attempts=adminCache.attempts.filter(a=>qids.includes(a.quiz_id)),passes=attempts.filter(a=>a.passed).length;
  const submissions=adminCache.submissions.filter(s=>s.assignments?.course_id===c.id).length;
  return '<tr><td>'+adminEsc(language==="my"?c.title_my:c.title_en)+'</td><td>'+enrolled+'</td><td>'+(possible?Math.min(100,Math.round(done/possible*100))+"%":"—")+'</td><td>'+(attempts.length?Math.round(passes/attempts.length*100)+"%":"—")+'</td><td>'+submissions+'</td></tr>';
 }));
}
async function saveAttendance(learnerId,button){
 const courseId=el("attendance-course").value,date=el("attendance-date").value;
 const status=document.querySelector('[data-att-status="'+learnerId+'"]').value;
 const notes=document.querySelector('[data-att-notes="'+learnerId+'"]').value.trim();
 button.disabled=true;
 const {error}=await supabase.from("attendance_records").upsert({learner_id:learnerId,course_id:courseId,session_date:date,status,notes:notes||null,recorded_by:currentUser.id},{onConflict:"learner_id,course_id,session_date"});
 if(error){alert(error.message);button.disabled=false;return;}
 await loadAdmin();
}
function exportMELCSV(){
 const rows=[["Course","Learner","Session date","Attendance status","Notes"],...adminCache.attendance.map(a=>[a.courses?.title_en||"",a.profiles?.full_name||"",a.session_date,a.status,a.notes||""])];
 const csv=rows.map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");
 const blob=new Blob(["\\uFEFF",csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="forerunners-mel-attendance.csv";a.click();URL.revokeObjectURL(url);
}
async function loadLearnerSupport(){
 const [a,r,m]=await Promise.all([
  supabase.from("announcements").select("id,title_my,title_en,body_my,body_en,published_at").eq("is_published",true).order("published_at",{ascending:false}),
  supabase.from("support_requests").select("id,subject,category,status,created_at,updated_at").eq("learner_id",currentUser.id).order("updated_at",{ascending:false}),
  supabase.from("support_messages").select("id,request_id,sender_id,body,created_at").order("created_at")
 ]);
 if(a.error||r.error||m.error)throw a.error||r.error||m.error;
 el("learner-announcements").innerHTML=(a.data||[]).map(x=>'<article class="assignment-card"><b>'+escapeHtml(language==="my"?x.title_my:x.title_en)+'</b><p>'+escapeHtml(language==="my"?x.body_my:x.body_en)+'</p></article>').join("")||'<p class="muted">No announcements yet.</p>';
 el("learner-support-requests").innerHTML=(r.data||[]).map(x=>'<article class="assignment-card"><b>'+escapeHtml(x.subject)+'</b><small>'+escapeHtml(x.category)+' · '+escapeHtml(x.status)+'</small><div>'+((m.data||[]).filter(z=>z.request_id===x.id).map(z=>'<p><b>'+(z.sender_id===currentUser.id?'You':'Support team')+':</b> '+escapeHtml(z.body)+'</p>').join(""))+'</div><form data-support-reply="'+x.id+'"><textarea name="body" rows="2" required maxlength="10000" placeholder="Reply / ပြန်လည်ဖြေကြားရန်"></textarea><button class="small-btn" type="submit">Reply</button></form></article>').join("")||'<p class="muted">No support requests yet.</p>';
 document.querySelectorAll("[data-support-reply]").forEach(form=>form.onsubmit=async e=>{e.preventDefault();const body=new FormData(form).get("body").trim();if(!body)return;const {error}=await supabase.from("support_messages").insert({request_id:form.dataset.supportReply,sender_id:currentUser.id,body});if(error){alert(error.message);return;}await loadLearnerSupport();});
 el("support-request-form").onsubmit=async e=>{e.preventDefault();const subject=el("support-subject").value.trim(),category=el("support-category").value,body=el("support-message").value.trim();const {data,error}=await supabase.from("support_requests").insert({learner_id:currentUser.id,subject,category}).select("id").single();if(error){el("support-form-message").textContent=error.message;return;}const msg=await supabase.from("support_messages").insert({request_id:data.id,sender_id:currentUser.id,body});if(msg.error){el("support-form-message").textContent=msg.error.message;return;}el("support-request-form").reset();el("support-form-message").textContent="Request submitted.";await loadLearnerSupport();};
}
function renderAdminSupport(){
 el("admin-announcements").innerHTML=adminTable(["Announcement","Status","Action"],adminCache.announcements.map(a=>'<tr><td>'+adminEsc(a.title_en)+'</td><td>'+(a.is_published?"Published":"Draft")+'</td><td><button class="small-btn" data-ann-toggle="'+a.id+'" data-next="'+(!a.is_published)+'">'+(a.is_published?"Unpublish":"Publish")+'</button></td></tr>'));
 el("admin-support-requests").innerHTML=adminTable(["Learner","Subject","Category","Status","Action"],adminCache.supportRequests.map(r=>'<tr><td>'+adminEsc(r.profiles?.full_name||"Learner")+'</td><td>'+adminEsc(r.subject)+'</td><td>'+adminEsc(r.category)+'</td><td>'+adminEsc(r.status)+'</td><td><button class="small-btn" data-support-open="'+r.id+'">Open thread</button></td></tr>'));
 document.querySelectorAll("[data-ann-toggle]").forEach(b=>b.onclick=()=>adminSave(supabase.from("announcements").update({is_published:b.dataset.next==="true",published_at:b.dataset.next==="true"?new Date().toISOString():null}).eq("id",b.dataset.annToggle)));
 document.querySelectorAll("[data-support-open]").forEach(b=>b.onclick=()=>renderAdminSupportThread(b.dataset.supportOpen));
}
function renderAdminSupportThread(id){
 const req=adminCache.supportRequests.find(r=>r.id===id);if(!req)return;
 const messages=adminCache.supportMessages.filter(m=>m.request_id===id);
 el("admin-support-thread").innerHTML='<h4>'+adminEsc(req.subject)+' — '+adminEsc(req.profiles?.full_name||"Learner")+'</h4>'+messages.map(m=>'<p><b>'+adminEsc(m.sender_id===currentUser.id?"Admin":"Learner")+'</b>: '+adminEsc(m.body)+'</p>').join("")+'<form id="admin-support-reply"><textarea id="admin-support-body" rows="3" required maxlength="10000"></textarea><button class="primary-btn" type="submit">Reply</button><button class="small-btn" type="button" id="support-resolve">Resolve</button></form>';
 el("admin-support-reply").onsubmit=async e=>{e.preventDefault();const body=el("admin-support-body").value.trim();const {error}=await supabase.from("support_messages").insert({request_id:id,sender_id:currentUser.id,body});if(error){alert(error.message);return;}await supabase.from("support_requests").update({updated_at:new Date().toISOString(),status:"in_progress"}).eq("id",id);await loadAdmin();renderAdminSupportThread(id);};
 el("support-resolve").onclick=async()=>{await adminSave(supabase.from("support_requests").update({status:"resolved",updated_at:new Date().toISOString()}).eq("id",id));};
}
function setupLessonEditor(){
 const sel=el("lesson-module"),keep=sel.value;
 sel.innerHTML=adminCache.modules.map(m=>'<option value="'+m.id+'">'+adminEsc(language==="my"?m.title_my:m.title_en)+'</option>').join("");
 if(adminCache.modules.some(m=>m.id===keep))sel.value=keep;
 el("lesson-editor-reset").onclick=()=>{el("lesson-editor-form").reset();el("lesson-edit-id").value="";el("lesson-revision-history").innerHTML="";};
 el("lesson-editor-form").onsubmit=saveLessonDraft;
 document.querySelectorAll("[data-lesson-edit]").forEach(b=>b.onclick=()=>editLesson(b.dataset.lessonEdit));
 document.querySelectorAll("[data-lesson-status]").forEach(b=>b.onclick=()=>changeLessonStatus(b.dataset.lessonStatus,b.dataset.next));
}
function editLesson(id){
 const l=adminCache.lessons.find(x=>x.id===id);if(!l)return;
 el("lesson-edit-id").value=l.id;el("lesson-module").value=l.module_id;
 el("lesson-title-my").value=l.title_my;el("lesson-title-en").value=l.title_en;
 el("lesson-content-my").value=l.content_my||"";el("lesson-content-en").value=l.content_en||"";
 el("lesson-video-url").value=l.video_url||"";el("lesson-change-note").value="";
 loadLessonRevisions(id);
}
async function loadLessonRevisions(id){
 const root=el("lesson-revision-history");
 const {data,error}=await supabase.from("lesson_revisions").select("version_no,change_note,created_at,profiles:changed_by(full_name)").eq("lesson_id",id).order("version_no",{ascending:false});
 if(error){root.textContent=error.message;return;}
 root.innerHTML="<h4>Version history / ပြင်ဆင်မှုမှတ်တမ်း</h4>"+(data||[]).map(v=>'<p>v'+v.version_no+' · '+adminEsc(v.change_note||"Updated")+' · '+new Date(v.created_at).toLocaleString()+'</p>').join("")||"<p>No revision history.</p>";
}
async function saveLessonDraft(event){
 event.preventDefault();const msg=el("lesson-editor-message");msg.textContent="";
 const id=el("lesson-edit-id").value;
 const payload={module_id:el("lesson-module").value,title_my:el("lesson-title-my").value.trim(),title_en:el("lesson-title-en").value.trim(),content_my:el("lesson-content-my").value.trim(),content_en:el("lesson-content-en").value.trim(),video_url:el("lesson-video-url").value.trim()||null,content_status:"draft",is_published:false,updated_at:new Date().toISOString()};
 if(!payload.title_my||!payload.title_en){msg.textContent="Myanmar and English titles are required.";return;}
 try{
  if(id){
   const old=adminCache.lessons.find(x=>x.id===id);const nextVersion=(old.version_no||1)+1;
   const rev={lesson_id:id,version_no:old.version_no||1,title_my:old.title_my,title_en:old.title_en,content_my:old.content_my,content_en:old.content_en,resource_path:old.resource_path,video_url:old.video_url,changed_by:currentUser.id,change_note:el("lesson-change-note").value.trim()||"Updated lesson"};
   const {error:re}=await supabase.from("lesson_revisions").insert(rev);if(re)throw re;
   const {error}=await supabase.from("lessons").update({...payload,version_no:nextVersion}).eq("id",id);if(error)throw error;
  }else{
   const {error}=await supabase.from("lessons").insert({...payload,sort_order:adminCache.lessons.filter(x=>x.module_id===payload.module_id).length+1,created_by:currentUser.id});if(error)throw error;
  }
  msg.textContent="Saved as draft. It is not visible to learners.";
  el("lesson-editor-form").reset();el("lesson-edit-id").value="";el("lesson-revision-history").innerHTML="";
  await loadAdmin();
 }catch(error){msg.textContent=error.message||"Could not save lesson.";msg.classList.add("error");}
}
async function changeLessonStatus(id,status){
 const l=adminCache.lessons.find(x=>x.id===id);if(!l)return;
 if(status==="published"&&(!l.content_my?.trim()||!l.content_en?.trim())){alert("Both Myanmar and English content are required before publishing.");return;}
 const patch={content_status:status,is_published:status==="published",updated_at:new Date().toISOString(),reviewed_by:currentUser.id,reviewed_at:new Date().toISOString()};
 const {error}=await supabase.from("lessons").update(patch).eq("id",id);
 if(error){alert(error.message);return;}await loadAdmin();
}
function renderAdminStageTrainers(){
 const trainerSelect=el("stage-trainer-user-select"),keep=trainerSelect.value;
 trainerSelect.innerHTML=adminCache.users.filter(u=>u.role==="trainer"&&u.account_status==="approved").map(u=>'<option value="'+u.id+'">'+adminEsc(u.full_name||"Trainer")+'</option>').join("");
 if([...trainerSelect.options].some(o=>o.value===keep))trainerSelect.value=keep;
 const stageSelect=el("stage-trainer-stage-select");
 stageSelect.innerHTML=Array.from({length:7},(_,i)=>{const n=i+1,labels=["Self-Discovery & Assessment","Foundation & Life Skills","Skill Development","Practical Application","Income Generation","Growth & Stability","Leadership & Sustainability"],my=["မိမိကိုယ်ကို သိရှိနားလည်ခြင်း","အခြေခံအရည်အချင်း တည်ဆောက်ခြင်း","ကျွမ်းကျင်မှု ဖွံ့ဖြိုးတည်ဆောက်ခြင်း","လက်တွေ့အသုံးချခြင်း","ဝင်ငွေဖန်တီးခြင်း","တိုးတက်မှုနှင့် တည်ငြိမ်မှု","ဦးဆောင်မှုနှင့် ရေရှည်တည်တံ့မှု"];return '<option value="'+n+'">'+n+'. '+adminEsc(language==="my"?my[i]:labels[i])+'</option>';}).join("");
 el("admin-stage-trainer-assignments").innerHTML=adminTable(["Stage","Trainer","Assigned","Action"],adminCache.stageTrainers.map(x=>'<tr><td>'+Number(x.stage_no)+'. '+adminEsc(language==="my"?x.livelihood_stages?.title_my:x.livelihood_stages?.title_en)+'</td><td>'+adminEsc(x.trainer?.full_name||"Trainer")+'</td><td>'+new Date(x.assigned_at).toLocaleDateString()+'</td><td><button class="small-btn reject" data-stage-trainer-remove="'+x.id+'">Remove</button></td></tr>'));
 document.querySelectorAll("[data-stage-trainer-remove]").forEach(b=>b.onclick=async()=>{const {error}=await supabase.from("livelihood_stage_trainers").delete().eq("id",b.dataset.stageTrainerRemove);if(error){alert(error.message);return;}await loadAdmin();});
}
async function assignStageTrainer(event){
 event.preventDefault();const msg=el("stage-trainer-assignment-message");msg.textContent="";
 const {error}=await supabase.from("livelihood_stage_trainers").insert({stage_no:Number(el("stage-trainer-stage-select").value),trainer_id:el("stage-trainer-user-select").value,assigned_by:currentUser.id});
 if(error){msg.textContent=error.message;msg.classList.add("error");return;}
 msg.textContent=language==="my"?"Journey Stage တာဝန်ပေးပြီးပါပြီ။":"Journey stage assigned.";event.currentTarget.reset();await loadAdmin();
}
function renderAdminTrainers(){
 const trainers=adminCache.users.filter(u=>u.role==="trainer"&&u.account_status==="approved");
 el("trainer-user-select").innerHTML=trainers.map(u=>'<option value="'+u.id+'">'+adminEsc(u.full_name||u.phone||u.id)+'</option>').join("");
 el("trainer-course-select").innerHTML=adminCache.courses.map(c=>'<option value="'+c.id+'">'+adminEsc(c.level)+' — '+adminEsc(language==="my"?c.title_my:c.title_en)+'</option>').join("");
 el("admin-trainer-assignments").innerHTML=adminTable(["Trainer","Course","Assigned","Action"],adminCache.courseTrainers.map(x=>'<tr><td>'+adminEsc(x.trainer?.full_name||"Trainer")+'</td><td>'+adminEsc(x.courses?.[language==="my"?"title_my":"title_en"]||"—")+'</td><td>'+new Date(x.assigned_at).toLocaleDateString()+'</td><td><button class="small-btn reject" data-trainer-unassign="'+x.id+'">Remove</button></td></tr>'));
 document.querySelectorAll("[data-trainer-unassign]").forEach(b=>b.onclick=()=>adminSave(supabase.from("course_trainers").delete().eq("id",b.dataset.trainerUnassign)));
}
async function assignTrainer(event){
 event.preventDefault();const msg=el("trainer-assignment-message");
 const {error}=await supabase.from("course_trainers").insert({trainer_id:el("trainer-user-select").value,course_id:el("trainer-course-select").value,assigned_by:currentUser.id});
 msg.textContent=error?error.message:"Trainer assigned to course.";
 if(error)msg.classList.add("error");else{msg.classList.remove("error");await loadAdmin();}
}
function renderAdminCareerOpportunities(){
 el("admin-career-opportunities").innerHTML=adminTable(["Opportunity","Type","Pathway","Deadline","Status","Actions"],adminCache.opportunities.map(o=>'<tr><td>'+adminEsc(language==='my'?(o.title_my||o.title):(o.title_en||o.title))+'<br><small>'+adminEsc(o.organization_name||"")+'</small></td><td>'+adminEsc(o.opportunity_type)+'</td><td>'+adminEsc(o.pathway)+'</td><td>'+adminEsc(o.application_deadline||"—")+'</td><td>'+adminEsc(o.status)+'</td><td>'+['draft','published','closed','archived'].filter(s=>s!==o.status).map(s=>'<button class="small-btn" data-op-status="'+o.id+'" data-status="'+s+'">'+s+'</button>').join(" ")+'</td></tr>'));
 document.querySelectorAll("[data-op-status]").forEach(b=>b.onclick=async()=>{const {error}=await supabase.from("career_opportunities").update({status:b.dataset.status,updated_at:new Date().toISOString()}).eq("id",b.dataset.opStatus);if(error){alert(error.message);return;}await loadAdmin();});
 el("admin-career-applications").innerHTML=adminTable(["Learner","Opportunity","Cover note","Applied","Status","Admin notes"],adminCache.careerApplications.map(a=>'<tr><td>'+adminEsc(a.profiles?.full_name||"Learner")+'</td><td>'+adminEsc(a.career_opportunities?.title||"")+'</td><td>'+adminEsc(a.cover_note||"—")+'</td><td>'+new Date(a.applied_at).toLocaleDateString()+'</td><td><select data-career-app-status="'+a.id+'">'+["submitted","under_review","shortlisted","accepted","rejected","withdrawn"].map(s=>'<option value="'+s+'" '+(a.status===s?"selected":"")+'>'+s+'</option>').join("")+'</select></td><td><textarea data-career-app-notes="'+a.id+'" rows="2">'+adminEsc(a.admin_notes||"")+'</textarea><button class="small-btn" data-save-career-app="'+a.id+'">Save</button></td></tr>'));
 document.querySelectorAll("[data-save-career-app]").forEach(b=>b.onclick=async()=>{const id=b.dataset.saveCareerApp,status=document.querySelector('[data-career-app-status="'+id+'"]').value,admin_notes=document.querySelector('[data-career-app-notes="'+id+'"]').value.trim()||null;const {error}=await supabase.from("career_opportunity_applications").update({status,admin_notes,reviewed_at:new Date().toISOString(),reviewed_by:currentUser.id}).eq("id",id);if(error){alert(error.message);return;}await loadAdmin();});
}
async function saveCareerOpportunity(event){
 event.preventDefault();const msg=el("op-message");msg.textContent="";
 const url=el("op-url").value.trim();if(url&&!/^https?:\/\//i.test(url)){msg.textContent="Application URL must start with http:// or https://";msg.classList.add("error");return;}
 const deadline=el("op-deadline").value||null;if(deadline&&deadline<new Date().toISOString().slice(0,10)&&el("op-status").value==="published"){msg.textContent="A published opportunity cannot have a past deadline.";msg.classList.add("error");return;}
 const payload={title:el("op-title-en").value.trim(),title_my:el("op-title-my").value.trim()||el("op-title-en").value.trim(),title_en:el("op-title-en").value.trim(),description:el("op-description-en").value.trim(),description_my:el("op-description-my").value.trim()||el("op-description-en").value.trim(),description_en:el("op-description-en").value.trim(),organization_name:el("op-org").value.trim()||null,opportunity_type:el("op-type").value,pathway:el("op-pathway").value,description:el("op-description").value.trim(),location_text:el("op-location").value.trim()||null,work_mode:el("op-mode").value,compensation_text:el("op-compensation").value.trim()||null,application_deadline:deadline,application_url:url||null,required_skills:csvText(el("op-required-skills").value),preferred_skills:csvText(el("op-preferred-skills").value),status:el("op-status").value,created_by:currentUser.id};
 const {error}=await supabase.from("career_opportunities").insert(payload);if(error){msg.textContent=error.message;msg.classList.add("error");return;}msg.textContent="Opportunity saved.";msg.classList.remove("error");event.currentTarget.reset();await loadAdmin();
}


function renderAdminReferrals(){
 const labels={career_counselor:"Career Counselor",business_mentor:"Business Mentor",vocational_guidance:"Vocational Training Guidance",digital_skills:"Digital Skills Guidance",other:"Other guidance"};
 const rows=adminCache.referrals.map(r=>{
  const learner=adminCache.users.find(u=>u.id===r.learner_id);
  const dt=r.meeting_at?new Date(r.meeting_at).toISOString().slice(0,16):"";
  return '<article class="panel"><div class="section-heading"><div><h4>'+adminEsc(learner?.full_name||"Learner")+' · '+adminEsc(labels[r.referral_type]||r.referral_type)+'</h4><p class="muted">Requested '+new Date(r.created_at).toLocaleString()+' · Consent: '+(r.consent_given?"Yes":"No")+'</p></div><span class="chip">'+adminEsc(r.status.replaceAll("_"," "))+'</span></div><p>'+adminEsc(r.learner_message||"No additional message")+'</p><div class="field"><label>Assigned Counselor / Mentor name</label><input id="ref-provider-'+r.id+'" maxlength="180" value="'+adminEsc(r.provider_name||"")+'"></div><div class="field"><label>Contact details (shared with learner)</label><input id="ref-contact-'+r.id+'" maxlength="500" value="'+adminEsc(r.provider_contact||"")+'"></div><div class="field"><label>Meeting mode</label><select id="ref-mode-'+r.id+'"><option value="">Not set</option><option value="online" '+(r.meeting_mode==="online"?"selected":"")+'>Online</option><option value="in_person" '+(r.meeting_mode==="in_person"?"selected":"")+'>In person</option><option value="phone" '+(r.meeting_mode==="phone"?"selected":"")+'>Phone</option></select></div><div class="field"><label>Meeting date and time</label><input type="datetime-local" id="ref-date-'+r.id+'" value="'+dt+'"></div><div class="field"><label>Location or meeting link</label><input id="ref-location-'+r.id+'" maxlength="500" value="'+adminEsc(r.meeting_location||"")+'"></div><div class="field"><label>Learner-visible update / သင်တန်းသားထံ ပြသမည့် အကြောင်းကြားချက်</label><textarea id="ref-summary-'+r.id+'" rows="2" maxlength="2000">'+adminEsc(r.learner_visible_summary||"")+'</textarea></div><div class="row-actions"><select id="ref-status-'+r.id+'"><option value="requested" '+(r.status==="requested"?"selected":"")+'>Requested</option><option value="under_review" '+(r.status==="under_review"?"selected":"")+'>Under review</option><option value="accepted" '+(r.status==="accepted"?"selected":"")+'>Accepted</option><option value="scheduled" '+(r.status==="scheduled"?"selected":"")+'>Scheduled</option><option value="completed" '+(r.status==="completed"?"selected":"")+'>Completed</option><option value="cancelled" '+(r.status==="cancelled"?"selected":"")+'>Cancelled</option><option value="declined" '+(r.status==="declined"?"selected":"")+'>Declined</option></select><button type="button" class="small-btn approve" data-referral-save="'+r.id+'">Save referral</button></div></article>';
 });
 el("admin-referrals").innerHTML=rows.join("")||'<p class="muted">No referral requests yet.</p>';
 document.querySelectorAll("[data-referral-save]").forEach(b=>b.onclick=()=>saveAdminReferral(b.dataset.referralSave,b));
}
async function saveAdminReferral(id,button){
 const status=el("ref-status-"+id).value,meeting=el("ref-date-"+id).value,mode=el("ref-mode-"+id).value,provider=el("ref-provider-"+id).value.trim();
 if(status==="scheduled"&&(!meeting||!mode||!provider)){el("admin-alert").textContent="To mark as scheduled, enter the assigned person, meeting mode and date/time.";el("admin-alert").classList.add("error");return;}
 button.disabled=true;
 const payload={status,provider_name:provider||null,provider_contact:el("ref-contact-"+id).value.trim()||null,meeting_mode:mode||null,meeting_at:meeting?new Date(meeting).toISOString():null,meeting_location:el("ref-location-"+id).value.trim()||null,learner_visible_summary:el("ref-summary-"+id).value.trim()||null,updated_at:new Date().toISOString()};
 const {error}=await supabase.from("career_guidance_referrals").update(payload).eq("id",id);
 button.disabled=false;
 if(error){el("admin-alert").textContent="Unable to save referral: "+error.message;el("admin-alert").classList.add("error");return;}
 el("admin-alert").textContent="Referral updated. The learner can see the update in their dashboard.";
 el("admin-alert").classList.remove("error");await loadAdmin();
}

function guidanceField(summary,label){
 const match=String(summary||"").match(new RegExp("^"+label+":\\s*(.*)$","mi"));
 return match?match[1].trim():"";
}
function guidanceNotes(summary){
 return String(summary||"").split("\n").filter(line=>!/^((Recommended pathway|Learning priorities|Support needed|Next action):)/i.test(line)).join("\n").replace(/^Learner-facing summary:\s*/i,"").trim();
}

function renderAdminStageProgress(){
 const root=el("admin-stage-progress");if(!root)return;
 if(adminCache.stageProgressError){root.innerHTML='<p class="muted">Journey database migration is not available yet. Apply the reviewed migrations before using this workspace. / Database Migration မလုပ်ရသေးပါ။</p>';return;}
 const rows=adminCache.stageProgress||[];
 const counts={submitted:rows.filter(x=>x.status==="submitted").length,verified:rows.filter(x=>x.status==="verified").length,needs_support:rows.filter(x=>x.status==="needs_support").length};
 el("admin-stage-progress-summary").innerHTML=[["Awaiting review",counts.submitted],["Verified stages",counts.verified],["Support needed",counts.needs_support]].map(([k,v])=>'<article class="admin-stat"><span>'+k+'</span><strong>'+v+'</strong></article>').join("");
 root.innerHTML=rows.map(p=>{
  const learner=adminCache.users.find(u=>u.id===p.learner_id),stage=LIVELIHOOD_STAGE_COPY.find(x=>x.no===p.stage_no);
  const title=stage?(language==="my"?stage.my:stage.en):"Stage "+p.stage_no;
  const submitted=p.status==="submitted";
  return '<article class="panel stage-review-card"><div class="section-heading"><div><h4>'+adminEsc(learner?.full_name||"Learner")+' · '+adminEsc(title)+'</h4><p class="muted">Started '+new Date(p.started_at).toLocaleString()+' · Updated '+new Date(p.updated_at).toLocaleString()+'</p></div><span class="chip">'+adminEsc(p.status.replaceAll("_"," "))+'</span></div><h5>Practical evidence / လက်တွေ့အထောက်အထား</h5><p class="stage-review-evidence">'+adminEsc(p.evidence_summary||"No evidence submitted yet.")+'</p><div class="field"><label for="stage-feedback-'+p.id+'">Reviewer feedback / စစ်ဆေးသူ၏ အကြံပြုချက်</label><textarea id="stage-feedback-'+p.id+'" rows="3" maxlength="3000">'+adminEsc(p.reviewer_feedback||"")+'</textarea></div><div class="row-actions"><select id="stage-status-'+p.id+'"><option value="submitted" '+(p.status==="submitted"?"selected":"")+'>Submitted</option><option value="verified" '+(p.status==="verified"?"selected":"")+'>Verified</option><option value="needs_support" '+(p.status==="needs_support"?"selected":"")+'>Needs support</option><option value="in_progress" '+(p.status==="in_progress"?"selected":"")+'>In progress / Reopen</option></select><button type="button" class="small-btn approve" data-stage-review-save="'+p.id+'">Save review</button></div>'+(p.reviewed_at?'<small class="muted">Last reviewed: '+new Date(p.reviewed_at).toLocaleString()+'</small>':"")+'</article>';
 }).join("")||'<p class="muted">No learner stage records yet. / သင်ယူသူများ Stage မစတင်ရသေးပါ။</p>';
 root.querySelectorAll("[data-stage-review-save]").forEach(button=>button.onclick=()=>saveAdminStageReview(button.dataset.stageReviewSave,button));
}
async function saveAdminStageReview(id,button){
 const record=adminCache.stageProgress.find(x=>x.id===id);if(!record)return;
 const status=el("stage-status-"+id).value,feedback=el("stage-feedback-"+id).value.trim();
 if(status==="verified"&&(!record.evidence_summary||record.evidence_summary.trim().length<20)){el("admin-alert").textContent="A stage can only be verified after the learner submits practical evidence.";el("admin-alert").classList.add("error");return;}
 if(status==="needs_support"&&!feedback){el("admin-alert").textContent="Please explain what additional support or evidence is needed.";el("admin-alert").classList.add("error");return;}
 button.disabled=true;
 const reviewed=status==="verified";
 const {error}=await supabase.from("learner_stage_progress").update({status,reviewer_feedback:feedback||null,reviewed_by:reviewed?currentUser.id:null,reviewed_at:reviewed?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",id);
 button.disabled=false;
 if(error){el("admin-alert").textContent="Unable to save stage review: "+error.message;el("admin-alert").classList.add("error");return;}
 el("admin-alert").textContent=reviewed?"Stage verified. The learner can now begin the next stage.":"Stage review updated.";
 el("admin-alert").classList.remove("error");await loadAdmin();
}

function renderAdminInitialAssessments(){
 const rows=adminCache.initialAssessments.map(a=>{
  const learner=adminCache.users.find(u=>u.id===a.learner_id);
  const fields=Object.entries(a.responses||{}).map(([k,v])=>'<div class="assessment-response"><b>'+adminEsc(k.replaceAll("_"," "))+'</b><p>'+adminEsc(Array.isArray(v)?v.join(", "):v||"—")+'</p></div>').join("");
  const summary=a.reviewer_summary||"";
  const pathway=guidanceField(summary,"Recommended pathway");
  return '<article class="panel initial-assessment-review"><div class="section-heading"><div><h4>'+adminEsc(learner?.full_name||"Learner")+'</h4><p class="muted">'+new Date(a.submitted_at).toLocaleString()+' · '+adminEsc(learner?.role||"")+'</p></div><span class="chip">'+adminEsc(a.status.replaceAll("_"," "))+'</span></div><div class="assessment-response-grid">'+fields+'</div><h4>Guidance outcome / လမ်းညွှန်အကြံပြုချက်</h4><p class="muted">Recommendations are discussion points, not a final decision. Confirm them with the learner.</p><div class="field"><label for="ia-guidance-pathway-'+a.id+'">Recommended pathway / အကြံပြုလမ်းကြောင်း</label><select id="ia-guidance-pathway-'+a.id+'"><option value="">Not decided / မဆုံးဖြတ်ရသေး</option><option value="employment" '+(pathway==="employment"?"selected":"")+'>Employment / အလုပ်အကိုင်</option><option value="self_employment" '+(pathway==="self_employment"?"selected":"")+'>Self-employment / ကိုယ်ပိုင်လုပ်ငန်း</option><option value="apprenticeship" '+(pathway==="apprenticeship"?"selected":"")+'>Apprenticeship / အလုပ်သင်</option><option value="further_training" '+(pathway==="further_training"?"selected":"")+'>Further training / ဆက်လက်သင်ယူရေး</option><option value="exploring" '+(pathway==="exploring"?"selected":"")+'>Exploring / စူးစမ်းလေ့လာရန်</option></select></div><div class="field"><label for="ia-guidance-learning-'+a.id+'">Learning priorities / လိုအပ်သည့် သင်ယူမှုနှင့် ကျွမ်းကျင်မှု</label><textarea id="ia-guidance-learning-'+a.id+'" rows="2" maxlength="1200">'+adminEsc(guidanceField(summary,"Learning priorities"))+'</textarea></div><div class="field"><label for="ia-guidance-support-'+a.id+'">Support needed / လိုအပ်သည့် ပံ့ပိုးမှု</label><textarea id="ia-guidance-support-'+a.id+'" rows="2" maxlength="1000">'+adminEsc(guidanceField(summary,"Support needed"))+'</textarea></div><div class="field"><label for="ia-guidance-next-'+a.id+'">Next action / နောက်တစ်ဆင့် လုပ်ဆောင်ရန်</label><textarea id="ia-guidance-next-'+a.id+'" rows="2" maxlength="1000">'+adminEsc(guidanceField(summary,"Next action"))+'</textarea></div><div class="field"><label for="ia-review-summary-'+a.id+'">Learner-facing summary / သင်ယူသူထံ ပြသမည့် အနှစ်ချုပ်</label><textarea id="ia-review-summary-'+a.id+'" rows="3" maxlength="2000" placeholder="Explain the recommendation in clear, respectful language.">'+adminEsc(guidanceNotes(summary))+'</textarea></div><div class="row-actions"><select id="ia-review-status-'+a.id+'"><option value="submitted" '+(a.status==="submitted"?"selected":"")+'>Submitted</option><option value="reviewing" '+(a.status==="reviewing"?"selected":"")+'>Reviewing</option><option value="reviewed" '+(a.status==="reviewed"?"selected":"")+'>Reviewed</option><option value="needs_follow_up" '+(a.status==="needs_follow_up"?"selected":"")+'>Needs follow-up</option></select><button type="button" class="small-btn approve" data-initial-assessment-save="'+a.id+'">Save guidance</button></div><p class="muted">'+(a.reviewed_at?'Last reviewed: '+new Date(a.reviewed_at).toLocaleString():'Not yet reviewed')+'</p></article>';
 });
 el("admin-initial-assessments").innerHTML=rows.join("")||'<p class="muted">No learner initial assessments have been submitted yet.</p>';
 document.querySelectorAll("[data-initial-assessment-save]").forEach(button=>button.onclick=()=>saveInitialAssessmentReview(button.dataset.initialAssessmentSave,button));
}
async function saveInitialAssessmentReview(id,button){
 const status=el("ia-review-status-"+id).value;
 const pathway=el("ia-guidance-pathway-"+id).value;
 const learning=el("ia-guidance-learning-"+id).value.trim();
 const support=el("ia-guidance-support-"+id).value.trim();
 const next=el("ia-guidance-next-"+id).value.trim();
 const notes=el("ia-review-summary-"+id).value.trim();
 if(status!=="submitted"&&!notes&&!next&&!learning&&!support){el("admin-alert").textContent="Please add learner-facing guidance before marking this assessment as reviewed or follow-up.";el("admin-alert").classList.add("error");return;}
 const summary=[
  pathway?"Recommended pathway: "+pathway:"",
  learning?"Learning priorities: "+learning:"",
  support?"Support needed: "+support:"",
  next?"Next action: "+next:"",
  notes?"Learner-facing summary: "+notes:""
 ].filter(Boolean).join("\n");
 button.disabled=true;
 const payload={status,reviewer_summary:summary||null,reviewed_by:status==="submitted"?null:currentUser.id,reviewed_at:status==="submitted"?null:new Date().toISOString(),updated_at:new Date().toISOString()};
 const {error}=await supabase.from("learner_initial_assessments").update(payload).eq("id",id);
 button.disabled=false;
 if(error){el("admin-alert").textContent="Unable to save assessment guidance: "+error.message;el("admin-alert").classList.add("error");return;}
 el("admin-alert").textContent="Learner guidance saved. The learner can view it in their assessment history.";
 el("admin-alert").classList.remove("error");
 await loadAdmin();
}

function renderAdminCareerReadiness(){
 const rows=adminCache.careerAssessments.map(a=>'<tr><td>'+adminEsc(a.learner?.full_name||"Learner")+'</td><td>'+adminEsc(a.pathway)+'</td><td>'+adminEsc(a.career_interest||"—")+'</td><td>'+Number(a.overall_score).toFixed(1)+'%</td><td>'+adminEsc(a.support_needs||"—")+'</td><td>'+adminEsc(a.next_steps||"—")+'</td><td>'+adminEsc(a.status)+'</td></tr>');
 el("admin-career-readiness").innerHTML=adminTable(["Learner","Pathway","Interest","Score","Support needs","Next steps","Status"],rows);
 el("admin-skill-profiles").innerHTML=adminTable(["Learner","Pathway","Goal","Skills","Languages","Location"],adminCache.skillProfiles.map(p=>'<tr><td>'+adminEsc(p.learner?.full_name||"Learner")+'</td><td>'+adminEsc(p.career_pathway)+'</td><td>'+adminEsc(p.career_goal||"—")+'</td><td>'+adminEsc((p.skills||[]).join(", "))+'</td><td>'+adminEsc((p.languages||[]).join(", "))+'</td><td>'+adminEsc(p.location_text||"—")+'</td></tr>'));
}
function renderAdminEvaluations(){
 el("admin-evaluations").innerHTML=adminTable(["Learner","Course","Trainer","Type","Score","Recommendation","Status","Review"],adminCache.evaluations.map(a=>'<tr><td>'+adminEsc(a.learner?.full_name||"Learner")+'</td><td>'+adminEsc(language==="my"?a.courses?.title_my:a.courses?.title_en)+'</td><td>'+adminEsc(a.trainer?.full_name||"Trainer")+'</td><td>'+adminEsc(a.assessment_type)+'</td><td>'+Number(a.overall_score).toFixed(1)+'%</td><td>'+adminEsc(a.recommendation||"—")+'</td><td>'+adminEsc(a.status)+'</td><td>'+(a.status==="submitted"?'<textarea data-evaluation-feedback="'+a.id+'" rows="2" placeholder="Admin review feedback"></textarea><button class="small-btn approve" data-evaluation-review="'+a.id+'">Mark reviewed</button>':'<small>'+adminEsc(a.trainer_feedback||"Reviewed")+'</small>')+'</td></tr>'));
 document.querySelectorAll("[data-evaluation-review]").forEach(b=>b.onclick=async()=>{const id=b.dataset.evaluationReview,feedback=document.querySelector('[data-evaluation-feedback="'+id+'"]').value;const {error}=await supabase.rpc("admin_review_learner_evaluation",{p_evaluation_id:id,p_feedback:feedback});if(error){el("admin-alert").textContent=error.message;el("admin-alert").classList.add("error");return;}await loadAdmin();});
}

function renderAdminActivitySubmissions(){
 const root=el("admin-activity-submissions");if(!root)return;
 if(adminCache.activitySubmissionsError){root.innerHTML='<p class="muted">Activity submissions are not available yet. Apply and validate the migration in a test environment first. / Activity Submission ဇယားကို Test Environment တွင် စစ်ဆေးပြီးမှ အသုံးပြုနိုင်ပါမည်။</p><small class="muted">'+adminEsc(adminCache.activitySubmissionsError)+'</small>';return;}
 const pending=adminCache.activitySubmissions.filter(s=>["submitted","reviewing"].includes(s.status));
 if(!pending.length){root.innerHTML='<p class="muted">No activity submissions are waiting for review. / စစ်ဆေးရန် တင်သွင်းထားသော လက်တွေ့အထောက်အထား မရှိသေးပါ။</p>';return;}
 root.innerHTML=pending.map(s=>{
  const a=s.livelihood_stage_activities||{},criteria=Array.isArray(a.assessment_criteria)?a.assessment_criteria:[],results=s.criterion_results&&typeof s.criterion_results==="object"?s.criterion_results:{};
  const fields=criteria.map((x,i)=>'<div class="field"><label>'+adminEsc(language==="my"?(x.my||x.en||("စံနှုန်း "+(i+1))):(x.en||x.my||("Criterion "+(i+1))))+'</label><input type="number" min="0" max="100" step="0.5" data-activity-criterion="'+i+'" value="'+adminEsc(results[String(i)]?.score??"")+'" placeholder="0–100"></div>').join("");
  return '<article class="panel" data-activity-review-card="'+s.id+'"><div class="section-heading"><div><h4>'+adminEsc(s.profiles?.full_name||"Learner")+' · '+adminEsc(language==="my"?(a.title_my||a.title_en):(a.title_en||a.title_my))+'</h4><p class="muted">Stage '+adminEsc(s.learner_stage_progress?.stage_no||"—")+' · Activity '+adminEsc(a.activity_no||"—")+' · '+new Date(s.submitted_at).toLocaleString()+'</p></div><span class="chip">'+adminEsc(s.status.replaceAll("_"," "))+'</span></div><details><summary>View learner evidence / သက်သေခံအထောက်အထား</summary><p class="journey-note">'+adminEsc(s.evidence_text)+'</p></details><div class="field"><label>Overall score / စုစုပေါင်းအမှတ် (0–100)</label><input type="number" min="0" max="100" step="0.5" data-activity-score value="'+(s.score??"")+'" placeholder="0–100"></div>'+(fields?'<h5>Criteria assessment / စံနှုန်းအလိုက် အကဲဖြတ်ခြင်း</h5>'+fields:'<p class="muted">No rubric criteria were provided for this activity.</p>')+'<div class="field"><label>Feedback for learner / သင်ယူသူထံ ပေးမည့် အကြံပြုချက်</label><textarea rows="3" maxlength="3000" data-activity-feedback>'+adminEsc(s.reviewer_feedback||"")+'</textarea></div><div class="field"><label>Decision / ဆုံးဖြတ်ချက်</label><select data-activity-status><option value="reviewing" '+(s.status==="reviewing"?"selected":"")+'>Reviewing / စစ်ဆေးနေဆဲ</option><option value="needs_revision">Needs revision / ပြင်ဆင်ရန်လိုအပ်</option><option value="approved">Approved / အတည်ပြု</option></select></div><button class="small-btn primary-btn" type="button" data-activity-save="'+s.id+'">Save assessment / အကဲဖြတ်ချက် သိမ်းရန်</button></article>';
 }).join("");
 root.querySelectorAll("[data-activity-save]").forEach(button=>button.addEventListener("click",async()=>{
  const id=button.dataset.activitySave,card=root.querySelector('[data-activity-review-card="'+id+'"]'),scoreText=card.querySelector("[data-activity-score]").value.trim(),score=scoreText===""?null:Number(scoreText),status=card.querySelector("[data-activity-status]").value,feedback=card.querySelector("[data-activity-feedback]").value.trim();
  if(score===null||!Number.isFinite(score)||score<0||score>100){alert("Enter an overall score from 0 to 100.");return;}
  if(status==="needs_revision"&&!feedback){alert("Feedback is required when requesting a revision.");return;}
  const criterionResults={};card.querySelectorAll("[data-activity-criterion]").forEach(input=>{if(input.value.trim()!=="")criterionResults[input.dataset.activityCriterion]={score:Number(input.value)};});
  if(Object.values(criterionResults).some(x=>!Number.isFinite(x.score)||x.score<0||x.score>100)){alert("Each criterion score must be between 0 and 100.");return;}
  button.disabled=true;
  const {error}=await supabase.from("livelihood_activity_submissions").update({score,status,reviewer_feedback:feedback||null,criterion_results:criterionResults,reviewed_by:currentUser.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id);
  if(error){alert(error.message);button.disabled=false;return;}
  el("admin-alert").textContent="Activity assessment saved. / အကဲဖြတ်ချက် သိမ်းဆည်းပြီးပါပြီ။";await loadAdmin();
 }));
}

function renderAdmin(){
 const pending=adminCache.users.filter(x=>x.account_status==="pending"),apps=adminCache.enrollments.filter(x=>x.status==="pending");
 const stats=[["Total learners",adminCache.users.filter(x=>x.role!=="admin").length],["Pending accounts",pending.length],["Applications",adminCache.enrollments.length],["Published courses",adminCache.courses.filter(x=>x.is_published).length],["Lessons",adminCache.lessons.length],["Published quizzes",adminCache.quizzes.filter(x=>x.is_published).length]];
 el("admin-stats").innerHTML=stats.map(([k,v])=>'<article class="admin-stat"><span>'+k+'</span><strong>'+v+'</strong></article>').join("");
 el("pending-users").innerHTML=pending.slice(0,8).map(u=>'<div class="admin-row"><span><b>'+adminEsc(u.full_name||"Learner")+'</b><br><small class="muted">'+adminEsc(u.phone||"")+'</small></span><div class="row-actions"><button class="small-btn approve" data-user-approve="'+u.id+'">'+t("approve")+'</button><button class="small-btn reject" data-user-reject="'+u.id+'">'+t("reject")+'</button></div></div>').join("")||'<p class="muted">'+t("noPending")+'</p>';
 el("pending-enrollments").innerHTML=apps.slice(0,8).map(a=>'<div class="admin-row"><span><b>'+adminEsc(a.profiles?.full_name||"Learner")+'</b><br><small class="muted">'+adminEsc(a.courses?.[language==="my"?"title_my":"title_en"]||"Course")+'</small></span><div class="row-actions"><button class="small-btn approve" data-app-approve="'+a.id+'">'+t("approve")+'</button><button class="small-btn reject" data-app-reject="'+a.id+'">'+t("reject")+'</button></div></div>').join("")||'<p class="muted">'+t("noPending")+'</p>';
 const userRows=adminCache.users.filter(u=>u.role!=="admin").map(u=>'<tr><td>'+adminEsc(u.full_name||"—")+' <small class="muted">'+adminEsc(u.role)+'</small></td><td>'+adminEsc(u.phone||"—")+'</td><td>'+adminEsc(u.account_status)+'</td><td>'+new Date(u.created_at).toLocaleDateString()+'</td><td><select data-user-role="'+u.id+'"><option value="learner" '+(u.role==="learner"?"selected":"")+'>Learner</option><option value="trainer" '+(u.role==="trainer"?"selected":"")+'>Trainer</option></select> <button class="small-btn" data-user-role-save="'+u.id+'">Save role</button> '+(u.account_status==="pending"?'<button class="small-btn approve" data-user-approve="'+u.id+'">'+t("approve")+'</button> <button class="small-btn reject" data-user-reject="'+u.id+'">'+t("reject")+'</button>':u.account_status==="approved"?'<button class="small-btn reject" data-user-suspend="'+u.id+'">Suspend</button>':'<button class="small-btn approve" data-user-approve="'+u.id+'">Approve</button>')+'</td></tr>');
 el("admin-learners").innerHTML=adminTable(["Name / Role","Phone","Status","Joined","Role & Status"],userRows);
 el("admin-enrollments").innerHTML=adminTable(["Learner","Course","Status","Action"],adminCache.enrollments.map(a=>'<tr><td>'+adminEsc(a.profiles?.full_name||"Learner")+'</td><td>'+adminEsc(a.courses?.[language==="my"?"title_my":"title_en"]||"—")+'</td><td>'+adminEsc(a.status)+'</td><td>'+(a.status==="pending"?'<button class="small-btn approve" data-app-approve="'+a.id+'">'+t("approve")+'</button> <button class="small-btn reject" data-app-reject="'+a.id+'">'+t("reject")+'</button>':"—")+'</td></tr>'));
 el("admin-courses").innerHTML=adminTable(["Level","Course","Status","Action"],adminCache.courses.map(q=>'<tr><td>'+adminEsc(q.level)+'</td><td>'+adminEsc(language==="my"?q.title_my:q.title_en)+'</td><td>'+(q.is_published?"Published":"Draft")+'</td><td><button class="small-btn" data-course-publish="'+q.id+'" data-next="'+(!q.is_published)+'">'+(q.is_published?"Unpublish":"Publish")+'</button></td></tr>'));
 const mods=new Map(adminCache.modules.map(m=>[m.id,m]));
 el("admin-lessons").innerHTML=adminTable(["Module","Lesson","Version","Status","Actions"],adminCache.lessons.map(l=>'<tr><td>'+adminEsc(mods.get(l.module_id)?.[language==="my"?"title_my":"title_en"]||"—")+'</td><td>'+adminEsc(language==="my"?l.title_my:l.title_en)+'</td><td>v'+(l.version_no||1)+'</td><td>'+adminEsc(l.content_status|| (l.is_published?"published":"draft"))+'</td><td><button class="small-btn" data-lesson-edit="'+l.id+'">Edit</button> <button class="small-btn approve" data-lesson-status="'+l.id+'" data-next="in_review">Submit review</button> <button class="small-btn approve" data-lesson-status="'+l.id+'" data-next="published">Publish</button> <button class="small-btn reject" data-lesson-status="'+l.id+'" data-next="archived">Archive</button></td></tr>'));
 const qc=new Map();adminCache.questions.forEach(q=>qc.set(q.quiz_id,(qc.get(q.quiz_id)||0)+1));
 el("admin-quizzes").innerHTML=adminTable(["Quiz","Level","Questions","Pass mark","Status","Action"],adminCache.quizzes.map(q=>'<tr><td>'+adminEsc(language==="my"?q.title_my:q.title_en)+'</td><td>'+adminEsc(adminCache.courses.find(x=>x.id===q.course_id)?.level||"—")+'</td><td>'+(qc.get(q.id)||0)+'</td><td>'+Number(q.pass_mark)+'%</td><td>'+(q.is_published?"Published":"Draft")+'</td><td><button class="small-btn" data-quiz-publish="'+q.id+'" data-next="'+(!q.is_published)+'" '+((qc.get(q.id)||0)===0&&!q.is_published?"disabled":"")+'>'+(q.is_published?"Unpublish":"Publish")+'</button></td></tr>'));
 el("admin-report-progress").innerHTML=adminTable(["Course","Approved learners","Lessons","Completed records"],adminCache.courses.map(q=>{const mids=adminCache.modules.filter(m=>m.course_id===q.id).map(m=>m.id),lids=adminCache.lessons.filter(l=>mids.includes(l.module_id)).map(l=>l.id),en=adminCache.enrollments.filter(e=>e.course_id===q.id&&["approved","completed"].includes(e.status)).length,done=adminCache.progress.filter(p=>lids.includes(p.lesson_id)&&p.status==="completed").length;return '<tr><td>'+adminEsc(language==="my"?q.title_my:q.title_en)+'</td><td>'+en+'</td><td>'+lids.length+'</td><td>'+done+'</td></tr>';}));
 const attempts=adminCache.attempts,passed=attempts.filter(a=>a.passed===true).length;
 el("admin-report-quizzes").innerHTML='<div class="admin-stats"><article class="admin-stat"><span>Total attempts</span><strong>'+attempts.length+'</strong></article><article class="admin-stat"><span>Passed</span><strong>'+passed+'</strong></article><article class="admin-stat"><span>Pass rate</span><strong>'+(attempts.length?Math.round(passed/attempts.length*100):0)+'%</strong></article></div>';
 bindAdminActions();
}
function bindAdminActions(){
 renderAdminActivitySubmissions();
 renderAdminStageProgress();
 renderAdminReferrals();
 renderAdminInitialAssessments();
 setupLessonEditor();
 renderAdminTrainers();
 el("trainer-assignment-form").onsubmit=assignTrainer;
 renderAdminSupport();
 renderAdminEvaluations();
 renderAdminCareerReadiness();
 renderAdminCareerOpportunities();
 renderAdminGraduateFollowups();
 el("graduate-export").onclick=exportGraduateFollowupsCSV;
 el("career-opportunity-form").onsubmit=saveCareerOpportunity;
 el("admin-announcement-form").onsubmit=async e=>{e.preventDefault();const {error}=await supabase.from("announcements").insert({title_my:el("announce-title-my").value.trim(),title_en:el("announce-title-en").value.trim(),body_my:el("announce-body-my").value.trim(),body_en:el("announce-body-en").value.trim(),is_published:true,published_at:new Date().toISOString(),created_by:currentUser.id});el("announce-form-message").textContent=error?error.message:"Announcement published.";if(!error){e.target.reset();await loadAdmin();}};
 renderMEL();
 el("attendance-course").onchange=renderMEL;el("attendance-date").onchange=renderMEL;el("mel-export").onclick=exportMELCSV;el("donor-course-filter").onchange=renderDonorOutcomeDashboard;el("donor-outcome-export").onclick=exportDonorOutcomeCSV;
 renderAdminCertificates();
 document.querySelectorAll("[data-cert-issue]").forEach(b=>b.onclick=()=>issueAdminCertificate(b.dataset.certIssue,b.dataset.course,b));
 document.querySelectorAll("[data-cert-print]").forEach(b=>b.onclick=()=>openCertificatePrint(b.dataset.certPrint,b.dataset.certName,b.dataset.certCourse));
 renderAdminAssignments();
 el("admin-assignment-form").onsubmit=createAdminAssignment;
 document.querySelectorAll("[data-assignment-publish]").forEach(b=>b.onclick=()=>adminSave(supabase.from("assignments").update({is_published:b.dataset.next==="true"}).eq("id",b.dataset.assignmentPublish)));
 document.querySelectorAll("[data-review]").forEach(b=>b.onclick=()=>saveAdminReview(b.dataset.review));
 document.querySelectorAll("[data-submission-file]").forEach(b=>b.onclick=async()=>{b.disabled=true;try{const {data,error}=await supabase.storage.from("lvc-learning-files").createSignedUrl(b.dataset.submissionFile,120);if(error)throw error;window.open(data.signedUrl,"_blank","noopener,noreferrer");}catch(error){alert(error.message||String(error));}finally{b.disabled=false;}});

 renderAdminQuizForm();
 el("admin-quiz-form").onsubmit=submitAdminQuiz;
 el("quiz-add-question").onclick=()=>{if(el("quiz-question-editor").children.length<50)addAdminQuizQuestion();};
 el("quiz-question-editor").onclick=e=>{const b=e.target.closest("[data-remove-question]");if(b&&el("quiz-question-editor").children.length>1)b.closest(".admin-question-editor").remove();};

 document.querySelectorAll("[data-user-approve]").forEach(b=>b.onclick=()=>reviewUser(b.dataset.userApprove,"approved"));
 document.querySelectorAll("[data-user-reject]").forEach(b=>b.onclick=()=>reviewUser(b.dataset.userReject,"rejected"));
 document.querySelectorAll("[data-user-suspend]").forEach(b=>b.onclick=()=>updateAdminProfile(b.dataset.userSuspend,null,"suspended"));
 document.querySelectorAll("[data-user-role-save]").forEach(b=>b.onclick=()=>updateAdminProfile(b.dataset.userRoleSave,document.querySelector('[data-user-role="'+b.dataset.userRoleSave+'"]').value,null));
 document.querySelectorAll("[data-app-approve]").forEach(b=>b.onclick=()=>reviewEnrollment(b.dataset.appApprove,"approved"));
 document.querySelectorAll("[data-app-reject]").forEach(b=>b.onclick=()=>reviewEnrollment(b.dataset.appReject,"rejected"));
 document.querySelectorAll("[data-course-publish]").forEach(b=>b.onclick=()=>adminSave(supabase.from("courses").update({is_published:b.dataset.next==="true"}).eq("id",b.dataset.coursePublish)));
 document.querySelectorAll("[data-quiz-publish]").forEach(b=>b.onclick=()=>adminSave(supabase.from("quizzes").update({is_published:b.dataset.next==="true"}).eq("id",b.dataset.quizPublish)));
}
async function adminSave(p){const {error}=await p;if(error){el("admin-alert").textContent=error.message;el("admin-alert").classList.add("error");return;}el("admin-alert").textContent=language==="my"?"သိမ်းဆည်းပြီးပါပြီ။":"Changes saved.";el("admin-alert").classList.remove("error");await loadAdmin();}
async function reviewUser(id,status){await updateAdminProfile(id,null,status);}
async function updateAdminProfile(id,role,status){const user=adminCache.users.find(u=>u.id===id);if(!user)return;const {error}=await supabase.rpc("admin_update_profile",{p_user_id:id,p_role:role||user.role,p_account_status:status||user.account_status});if(error){el("admin-alert").textContent=error.message;el("admin-alert").classList.add("error");return;}await loadAdmin();}
async function reviewEnrollment(id,status){await adminSave(supabase.from("enrollments").update({status,reviewed_at:new Date().toISOString(),reviewed_by:currentUser.id}).eq("id",id));}
el("learner-search").addEventListener("input",()=>{
 const q=el("learner-search").value.toLowerCase().trim();
 const users=adminCache.users.filter(u=>u.role!=="admin"&&((u.full_name||"").toLowerCase().includes(q)||(u.phone||"").toLowerCase().includes(q)));
 const rows=users.map(u=>'<tr><td>'+adminEsc(u.full_name||"—")+' <small class="muted">'+adminEsc(u.role)+'</small></td><td>'+adminEsc(u.phone||"—")+'</td><td>'+adminEsc(u.account_status)+'</td><td>'+new Date(u.created_at).toLocaleDateString()+'</td><td><select data-user-role="'+u.id+'"><option value="learner" '+(u.role==="learner"?"selected":"")+'>Learner</option><option value="trainer" '+(u.role==="trainer"?"selected":"")+'>Trainer</option></select> <button class="small-btn" data-user-role-save="'+u.id+'">Save role</button> '+(u.account_status==="pending"?'<button class="small-btn approve" data-user-approve="'+u.id+'">'+t("approve")+'</button> <button class="small-btn reject" data-user-reject="'+u.id+'">'+t("reject")+'</button>':u.account_status==="approved"?'<button class="small-btn reject" data-user-suspend="'+u.id+'">Suspend</button>':'<button class="small-btn approve" data-user-approve="'+u.id+'">Approve</button>')+'</td></tr>');
 el("admin-learners").innerHTML=adminTable(["Name / Role","Phone","Status","Joined","Role & Status"],rows);
 bindAdminActions();
});
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

async function handleSession(session){
  currentUser=session?.user||null;
  if(!currentUser){currentProfile=null;show("auth-section",true);show("pending-section",false);show("learner-section",false);show("trainer-section",false);show("admin-section",false);show("signout-btn",false);return;}
  try{await loadProfile();}catch(error){setMessage("auth-message",error.message||t("authError"),true);}
}
applyLanguage();
const {data:{session}}=await supabase.auth.getSession();
await handleSession(session);
document.documentElement.dataset.lvcReady = "true";
supabase.auth.onAuthStateChange((_event,nextSession)=>{queueMicrotask(()=>handleSession(nextSession));});
