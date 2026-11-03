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
  pane.classList.add("hidden");
  el("quiz-runner").classList.add("hidden");
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
