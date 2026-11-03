import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
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
    authError:"လုပ်ဆောင်မှု မအောင်မြင်ပါ။", appliedMsg:"သင်တန်းလျှောက်ထားမှုကို လက်ခံရရှိပါပြီ။",
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
    authError:"The action could not be completed.", appliedMsg:"Your course application has been received.",
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
  await loadCourses();await loadEnrollments();await loadLearning();
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
  await loadLearnerCertificates();
  await loadLearnerSupport();

  pane.classList.add("hidden");
  el("quiz-runner").classList.add("hidden");
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


const adminCache={users:[],enrollments:[],courses:[],modules:[],lessons:[],quizzes:[],questions:[],progress:[],attempts:[],assignments:[],submissions:[],certificates:[],attendance:[],announcements:[],supportRequests:[],supportMessages:[]};
const adminEsc=v=>escapeHtml(v??"");
function adminTable(headers,rows){return rows.length?'<table class="admin-data-table"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>':'<p class="muted">No records found / မှတ်တမ်းမရှိသေးပါ။</p>';}
function setAdminTab(tab){document.querySelectorAll("[data-admin-tab]").forEach(b=>b.classList.toggle("active",b.dataset.adminTab===tab));document.querySelectorAll("[data-admin-view]").forEach(v=>v.classList.toggle("hidden",v.dataset.adminView!==tab));}
document.querySelectorAll("[data-admin-tab]").forEach(b=>b.addEventListener("click",()=>setAdminTab(b.dataset.adminTab)));
const verifyForm=el("certificate-verify-form");if(verifyForm){verifyForm.onsubmit=e=>{e.preventDefault();verifyCertificate(el("certificate-verify-code").value.trim());};const code=new URLSearchParams(window.location.search).get("verify");if(code){el("certificate-verification").classList.remove("hidden");el("certificate-verify-code").value=code;verifyCertificate(code);}}
async function loadAdmin(){
 const rs=await Promise.all([
  supabase.from("profiles").select("id,full_name,phone,role,account_status,created_at").order("created_at",{ascending:false}),
  supabase.from("enrollments").select("id,learner_id,course_id,status,applied_at,profiles(full_name,phone),courses(title_my,title_en,level)").order("applied_at",{ascending:false}),
  supabase.from("courses").select("id,title_my,title_en,level,is_published,sort_order").order("sort_order"),
  supabase.from("modules").select("id,course_id,title_my,title_en,sort_order").order("sort_order"),
  supabase.from("lessons").select("id,module_id,title_my,title_en,is_published,sort_order").order("sort_order"),
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
  supabase.from("support_messages").select("id,request_id,sender_id,body,created_at").order("created_at")
 ]);
 const names=["profiles","enrollments","courses","modules","lessons","quizzes","questions","progress","attempts","assignments","submissions","certificates","attendance","announcements","support requests","support messages"];
 rs.forEach((r,i)=>{if(r.error)throw new Error(names[i]+": "+r.error.message);});
 [adminCache.users,adminCache.enrollments,adminCache.courses,adminCache.modules,adminCache.lessons,adminCache.quizzes,adminCache.questions,adminCache.progress,adminCache.attempts,adminCache.assignments,adminCache.submissions,adminCache.certificates,adminCache.attendance,adminCache.announcements,adminCache.supportRequests,adminCache.supportMessages]=rs.map(r=>r.data||[]);
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
 root.innerHTML='<div class="panel"><h3>My certificates / ကျွန်ုပ်၏ သင်တန်းဆင်းလက်မှတ်များ</h3>'+(data||[]).map(c=>'<article class="assignment-card"><b>'+escapeHtml(language==="my"?c.courses?.title_my:c.courses?.title_en)+'</b><p>'+escapeHtml(c.certificate_code)+'</p><button class="small-btn" data-learner-cert="'+escapeHtml(c.certificate_code)+'" data-course="'+escapeHtml(language==="my"?c.courses?.title_my:c.courses?.title_en)+'">Print certificate</button></article>').join("")||'<p class="muted">No certificates issued yet / လက်မှတ်မရှိသေးပါ။</p>')+'</div>';
 root.querySelectorAll("[data-learner-cert]").forEach(b=>b.onclick=()=>openCertificatePrint(b.dataset.learnerCert,currentUser.user_metadata?.full_name||"Learner",b.dataset.course));
}
async function verifyCertificate(code){
 const result=el("certificate-verify-result");result.textContent="Checking…";
 const {data,error}=await supabase.rpc("verify_course_certificate",{p_certificate_code:code});
 if(error){result.textContent=error.message;return;}
 const cert=Array.isArray(data)?data[0]:null;
 result.innerHTML=cert?'<h3>Valid certificate / မှန်ကန်သောလက်မှတ်</h3><p><b>'+escapeHtml(cert.learner_name)+'</b></p><p>'+escapeHtml(language==="my"?cert.course_title_my:cert.course_title_en)+'</p><p>'+new Date(cert.issued_at).toLocaleDateString()+'</p><p>'+escapeHtml(cert.certificate_code)+'</p>':'<h3>Certificate not found / လက်မှတ်မတွေ့ပါ</h3>';
}
function renderMEL(){
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
 document.querySelectorAll("[data-support-reply]").forEach(form=>form.onsubmit=async e=>{e.preventDefault();const body=new FormData(form).get("body").trim();if(!body)return;const {error}=await supabase.from("support_messages").insert({request_id:form.dataset.supportReply,sender_id:currentUser.id,body});if(error){alert(error.message);return;}await supabase.from("support_requests").update({updated_at:new Date().toISOString()}).eq("id",form.dataset.supportReply);await loadLearnerSupport();});
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
function renderAdmin(){
 const pending=adminCache.users.filter(x=>x.account_status==="pending"),apps=adminCache.enrollments.filter(x=>x.status==="pending");
 const stats=[["Total learners",adminCache.users.filter(x=>x.role!=="admin").length],["Pending accounts",pending.length],["Applications",adminCache.enrollments.length],["Published courses",adminCache.courses.filter(x=>x.is_published).length],["Lessons",adminCache.lessons.length],["Published quizzes",adminCache.quizzes.filter(x=>x.is_published).length]];
 el("admin-stats").innerHTML=stats.map(([k,v])=>'<article class="admin-stat"><span>'+k+'</span><strong>'+v+'</strong></article>').join("");
 el("pending-users").innerHTML=pending.slice(0,8).map(u=>'<div class="admin-row"><span><b>'+adminEsc(u.full_name||"Learner")+'</b><br><small class="muted">'+adminEsc(u.phone||"")+'</small></span><div class="row-actions"><button class="small-btn approve" data-user-approve="'+u.id+'">'+t("approve")+'</button><button class="small-btn reject" data-user-reject="'+u.id+'">'+t("reject")+'</button></div></div>').join("")||'<p class="muted">'+t("noPending")+'</p>';
 el("pending-enrollments").innerHTML=apps.slice(0,8).map(a=>'<div class="admin-row"><span><b>'+adminEsc(a.profiles?.full_name||"Learner")+'</b><br><small class="muted">'+adminEsc(a.courses?.[language==="my"?"title_my":"title_en"]||"Course")+'</small></span><div class="row-actions"><button class="small-btn approve" data-app-approve="'+a.id+'">'+t("approve")+'</button><button class="small-btn reject" data-app-reject="'+a.id+'">'+t("reject")+'</button></div></div>').join("")||'<p class="muted">'+t("noPending")+'</p>';
 const userRows=adminCache.users.filter(u=>u.role!=="admin").map(u=>'<tr><td>'+adminEsc(u.full_name||"—")+'</td><td>'+adminEsc(u.phone||"—")+'</td><td>'+adminEsc(u.account_status)+'</td><td>'+new Date(u.created_at).toLocaleDateString()+'</td><td>'+(u.account_status==="pending"?'<button class="small-btn approve" data-user-approve="'+u.id+'">'+t("approve")+'</button> <button class="small-btn reject" data-user-reject="'+u.id+'">'+t("reject")+'</button>':"—")+'</td></tr>');
 el("admin-learners").innerHTML=adminTable(["Name","Phone","Status","Joined","Action"],userRows);
 el("admin-enrollments").innerHTML=adminTable(["Learner","Course","Status","Action"],adminCache.enrollments.map(a=>'<tr><td>'+adminEsc(a.profiles?.full_name||"Learner")+'</td><td>'+adminEsc(a.courses?.[language==="my"?"title_my":"title_en"]||"—")+'</td><td>'+adminEsc(a.status)+'</td><td>'+(a.status==="pending"?'<button class="small-btn approve" data-app-approve="'+a.id+'">'+t("approve")+'</button> <button class="small-btn reject" data-app-reject="'+a.id+'">'+t("reject")+'</button>':"—")+'</td></tr>'));
 el("admin-courses").innerHTML=adminTable(["Level","Course","Status","Action"],adminCache.courses.map(q=>'<tr><td>'+adminEsc(q.level)+'</td><td>'+adminEsc(language==="my"?q.title_my:q.title_en)+'</td><td>'+(q.is_published?"Published":"Draft")+'</td><td><button class="small-btn" data-course-publish="'+q.id+'" data-next="'+(!q.is_published)+'">'+(q.is_published?"Unpublish":"Publish")+'</button></td></tr>'));
 const mods=new Map(adminCache.modules.map(m=>[m.id,m]));
 el("admin-lessons").innerHTML=adminTable(["Module","Lesson","Status"],adminCache.lessons.map(l=>'<tr><td>'+adminEsc(mods.get(l.module_id)?.[language==="my"?"title_my":"title_en"]||"—")+'</td><td>'+adminEsc(language==="my"?l.title_my:l.title_en)+'</td><td>'+(l.is_published?"Published":"Draft")+'</td></tr>'));
 const qc=new Map();adminCache.questions.forEach(q=>qc.set(q.quiz_id,(qc.get(q.quiz_id)||0)+1));
 el("admin-quizzes").innerHTML=adminTable(["Quiz","Level","Questions","Pass mark","Status","Action"],adminCache.quizzes.map(q=>'<tr><td>'+adminEsc(language==="my"?q.title_my:q.title_en)+'</td><td>'+adminEsc(adminCache.courses.find(x=>x.id===q.course_id)?.level||"—")+'</td><td>'+(qc.get(q.id)||0)+'</td><td>'+Number(q.pass_mark)+'%</td><td>'+(q.is_published?"Published":"Draft")+'</td><td><button class="small-btn" data-quiz-publish="'+q.id+'" data-next="'+(!q.is_published)+'" '+((qc.get(q.id)||0)===0&&!q.is_published?"disabled":"")+'>'+(q.is_published?"Unpublish":"Publish")+'</button></td></tr>'));
 el("admin-report-progress").innerHTML=adminTable(["Course","Approved learners","Lessons","Completed records"],adminCache.courses.map(q=>{const mids=adminCache.modules.filter(m=>m.course_id===q.id).map(m=>m.id),lids=adminCache.lessons.filter(l=>mids.includes(l.module_id)).map(l=>l.id),en=adminCache.enrollments.filter(e=>e.course_id===q.id&&["approved","completed"].includes(e.status)).length,done=adminCache.progress.filter(p=>lids.includes(p.lesson_id)&&p.status==="completed").length;return '<tr><td>'+adminEsc(language==="my"?q.title_my:q.title_en)+'</td><td>'+en+'</td><td>'+lids.length+'</td><td>'+done+'</td></tr>';}));
 const attempts=adminCache.attempts,passed=attempts.filter(a=>a.passed===true).length;
 el("admin-report-quizzes").innerHTML='<div class="admin-stats"><article class="admin-stat"><span>Total attempts</span><strong>'+attempts.length+'</strong></article><article class="admin-stat"><span>Passed</span><strong>'+passed+'</strong></article><article class="admin-stat"><span>Pass rate</span><strong>'+(attempts.length?Math.round(passed/attempts.length*100):0)+'%</strong></article></div>';
 bindAdminActions();
}
function bindAdminActions(){
 renderAdminSupport();
 el("admin-announcement-form").onsubmit=async e=>{e.preventDefault();const {error}=await supabase.from("announcements").insert({title_my:el("announce-title-my").value.trim(),title_en:el("announce-title-en").value.trim(),body_my:el("announce-body-my").value.trim(),body_en:el("announce-body-en").value.trim(),is_published:true,published_at:new Date().toISOString(),created_by:currentUser.id});el("announce-form-message").textContent=error?error.message:"Announcement published.";if(!error){e.target.reset();await loadAdmin();}};
 renderMEL();
 el("attendance-course").onchange=renderMEL;el("attendance-date").onchange=renderMEL;el("mel-export").onclick=exportMELCSV;
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
 document.querySelectorAll("[data-app-approve]").forEach(b=>b.onclick=()=>reviewEnrollment(b.dataset.appApprove,"approved"));
 document.querySelectorAll("[data-app-reject]").forEach(b=>b.onclick=()=>reviewEnrollment(b.dataset.appReject,"rejected"));
 document.querySelectorAll("[data-course-publish]").forEach(b=>b.onclick=()=>adminSave(supabase.from("courses").update({is_published:b.dataset.next==="true"}).eq("id",b.dataset.coursePublish)));
 document.querySelectorAll("[data-quiz-publish]").forEach(b=>b.onclick=()=>adminSave(supabase.from("quizzes").update({is_published:b.dataset.next==="true"}).eq("id",b.dataset.quizPublish)));
}
async function adminSave(p){const {error}=await p;if(error){el("admin-alert").textContent=error.message;el("admin-alert").classList.add("error");return;}el("admin-alert").textContent=language==="my"?"သိမ်းဆည်းပြီးပါပြီ။":"Changes saved.";el("admin-alert").classList.remove("error");await loadAdmin();}
async function reviewUser(id,status){await adminSave(supabase.from("profiles").update({account_status:status,updated_at:new Date().toISOString()}).eq("id",id));}
async function reviewEnrollment(id,status){await adminSave(supabase.from("enrollments").update({status,reviewed_at:new Date().toISOString(),reviewed_by:currentUser.id}).eq("id",id));}
el("learner-search").addEventListener("input",()=>{const q=el("learner-search").value.toLowerCase().trim(),users=adminCache.users.filter(u=>u.role!=="admin"&&((u.full_name||"").toLowerCase().includes(q)||(u.phone||"").toLowerCase().includes(q)));el("admin-learners").innerHTML=adminTable(["Name","Phone","Status","Joined","Action"],users.map(u=>'<tr><td>'+adminEsc(u.full_name||"—")+'</td><td>'+adminEsc(u.phone||"—")+'</td><td>'+adminEsc(u.account_status)+'</td><td>'+new Date(u.created_at).toLocaleDateString()+'</td><td>'+(u.account_status==="pending"?'<button class="small-btn approve" data-user-approve="'+u.id+'">'+t("approve")+'</button> <button class="small-btn reject" data-user-reject="'+u.id+'">'+t("reject")+'</button>':"—")+'</td></tr>'));bindAdminActions();});
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
