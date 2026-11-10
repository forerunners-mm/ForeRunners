/**
 * SRHR Learning Myanmar — privacy-minimal pilot
 * Lead: Nway Htway Eain Organization (NHE)
 * Technical partner: ForeRunners Organization (FR)
 *
 * No learner accounts, age collection, learner IDs, progress records,
 * quiz histories, question-text storage, or individual activity logs.
 * Existing legacy sheets are NOT deleted by this migration.
 * Not production-ready until safeguarding/content/security review is signed off.
 */
const APP = Object.freeze({
  title: 'SRHR Learning Myanmar',
  totalLevels: 100,
  passMark: 70,
  maxQuizQuestions: 10
});

const SCHEMA = {
  Levels: ['LevelID','Stage','TitleMM','TitleEN','DescriptionMM','DescriptionEN','ContentMM','ContentEN','IsPublished'],
  QuizQuestions: ['QuestionID','LevelID','QuestionMM','QuestionEN','OptionAMM','OptionAEN','OptionBMM','OptionBEN','OptionCMM','OptionCEN','OptionDMM','OptionDEN','CorrectAnswer','ExplanationMM','ExplanationEN','IsPublished'],
  Analytics: ['Date','Metric','Topic','Count']
};
const SRHR_TOPICS = [
  'Menstrual Health','Puberty & Body Changes','Reproductive Health',
  'Contraception & Family Planning','Pregnancy','STI/HIV',
  'Consent & Healthy Relationships','Gender-based Violence & Safety',
  'Mental Health','Other'
];

function doGet() {
  try { recordMetric_('VISIT', ''); } catch (err) { Logger.log('Visit metric unavailable: ' + err.message); }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(APP.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Read-only preflight: returns sheet names and header rows only.
 * It never reads or returns learner records.
 */
function inspectDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open Apps Script from the project Google Sheet.');
  return ss.getSheets().map(sh => ({
    name: sh.getName(),
    lastRow: sh.getLastRow(),
    headers: sh.getLastColumn()
      ? sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0]
      : []
  }));
}

/** Run once from the bound Google Sheet's Apps Script editor. */
function setupProject() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open Apps Script from the project Google Sheet.');
  PropertiesService.getScriptProperties().setProperty('DATABASE_ID', ss.getId());
  Object.keys(SCHEMA).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1,1,1,SCHEMA[name].length).setValues([SCHEMA[name]]);
      sh.setFrozenRows(1);
      return;
    }
    const actual = sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1)).getValues()[0].map(String);
    const expected = SCHEMA[name];
    // Never delete or rewrite existing columns automatically.
    // If legacy headers differ, setup stops so an administrator can inspect first.
    if (actual.length !== expected.length ||
        expected.some((h,i) => actual[i] !== h)) {
      throw new Error('Unexpected headers in ' + name + '. Stop and review this sheet; no existing records were cleared.');
    }
    sh.setFrozenRows(1);
  });
  seedLevels_();
  return 'Privacy-minimal setup complete. Legacy learner sheets, if present, were left untouched and are no longer used by this code.';
}

function db_() {
  const id = PropertiesService.getScriptProperties().getProperty('DATABASE_ID');
  if (!id) throw new Error('Database not configured. Run setupProject() first.');
  return SpreadsheetApp.openById(id);
}
function sheetRows_(name) {
  const sh = db_().getSheetByName(name);
  if (!sh) throw new Error('Missing database sheet: ' + name);
  return sh.getDataRange().getValues();
}
function recordMetric_(metric, topic) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = db_().getSheetByName('Analytics');
    if (!sh) throw new Error('Analytics sheet missing. Run setupProject().');
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const keyTopic = topic || '';
    const values = sh.getDataRange().getValues();
    for (let i=1;i<values.length;i++) {
      if (String(values[i][0])===today && values[i][1]===metric && values[i][2]===keyTopic) {
        sh.getRange(i+1,4).setValue(Number(values[i][3]||0)+1);
        return;
      }
    }
    sh.appendRow([today,metric,keyTopic,1]);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Called internally only after a future, reviewed AI-answer flow classifies
 * a topic. It accepts a fixed topic label, never the user's question.
 */
function recordTopicAggregate_(topic) {
  if (SRHR_TOPICS.indexOf(topic) === -1) topic = 'Other';
  recordMetric_('TOPIC', topic);
}

function getPublishedLevels() {
  return sheetRows_('Levels').slice(1)
    .filter(r => r[8] === true || String(r[8]).toUpperCase() === 'TRUE')
    .map(r => ({
      id:Number(r[0]), stage:String(r[1]||''),
      titleMM:String(r[2]||''), titleEN:String(r[3]||''),
      descriptionMM:String(r[4]||''), descriptionEN:String(r[5]||'')
    }));
}

function getLevelContent(levelId) {
  const id = validLevel_(levelId);
  const row = sheetRows_('Levels').slice(1).find(r =>
    Number(r[0])===id && (r[8]===true || String(r[8]).toUpperCase()==='TRUE')
  );
  if (!row) throw new Error('ဤသင်ခန်းစာကို မထုတ်ဝေရသေးပါ။');
  return {
    id:Number(row[0]), stage:String(row[1]||''),
    titleMM:String(row[2]||''), titleEN:String(row[3]||''),
    descriptionMM:String(row[4]||''), descriptionEN:String(row[5]||''),
    contentMM:String(row[6]||''), contentEN:String(row[7]||'')
  };
}

/** No individual read/progress record is created. */
function markLessonRead() {
  return {success:true, saved:false};
}

function getQuizQuestions(levelId) {
  const id = validLevel_(levelId);
  getLevelContent(id);
  return sheetRows_('QuizQuestions').slice(1).filter(r =>
    Number(r[1])===id && (r[15]===true || String(r[15]).toUpperCase()==='TRUE')
  ).slice(0,APP.maxQuizQuestions).map(r => ({
    id:String(r[0]),
    questionMM:String(r[2]||''), questionEN:String(r[3]||''),
    options:[
      {key:'A',mm:String(r[4]||''),en:String(r[5]||'')},
      {key:'B',mm:String(r[6]||''),en:String(r[7]||'')},
      {key:'C',mm:String(r[8]||''),en:String(r[9]||'')},
      {key:'D',mm:String(r[10]||''),en:String(r[11]||'')}
    ]
  }));
}

/** Scores are returned to the current page only; no answers or scores are stored. */
function submitQuiz(levelId, answers) {
  const id = validLevel_(levelId);
  getLevelContent(id);
  if (!Array.isArray(answers) || !answers.length || answers.length>APP.maxQuizQuestions)
    throw new Error('Quiz answers are missing or invalid.');
  const published = sheetRows_('QuizQuestions').slice(1).filter(r =>
    Number(r[1])===id && (r[15]===true || String(r[15]).toUpperCase()==='TRUE')
  ).slice(0,APP.maxQuizQuestions);
  if (!published.length) throw new Error('No reviewed quiz questions have been published for this lesson.');
  if (answers.length!==published.length) throw new Error('မေးခွန်းအားလုံးကို ဖြေဆိုပြီးမှ တင်ပြပါ။');
  const answerMap=Object.create(null);
  answers.forEach(a=>{
    if(!a || typeof a.id!=='string' || !/^[ABCD]$/.test(String(a.answer)))
      throw new Error('Quiz answer format is invalid.');
    if(Object.prototype.hasOwnProperty.call(answerMap,a.id)) throw new Error('Duplicate quiz answer detected.');
    answerMap[a.id]=String(a.answer);
  });
  const ids=published.map(r=>String(r[0]));
  if(ids.some(x=>!x) || new Set(ids).size!==ids.length ||
     Object.keys(answerMap).length!==ids.length ||
     ids.some(x=>!Object.prototype.hasOwnProperty.call(answerMap,x)))
    throw new Error('Quiz question IDs do not match the published quiz.');
  let correct=0;
  const feedback=published.map(r=>{
    const key=String(r[12]||'').toUpperCase();
    if(!/^[ABCD]$/.test(key)) throw new Error('A published quiz question has an invalid answer key.');
    const ok=answerMap[String(r[0])]===key;
    if(ok) correct++;
    return {id:String(r[0]),correct:ok,explanationMM:String(r[13]||''),explanationEN:String(r[14]||'')};
  });
  const score=Math.round(correct/feedback.length*100);
  return {score,passed:score>=APP.passMark,passMark:APP.passMark,feedback,
    saved:false,notice:'ဤရလဒ်ကို ဤစာမျက်နှာတွင်သာ ပြသပြီး မှတ်တမ်းမသိမ်းပါ။'};
}

function validLevel_(value) {
  const id=Number(value);
  if(!Number.isInteger(id)||id<1||id>APP.totalLevels) throw new Error('Invalid lesson level.');
  return id;
}

function seedLevels_() {
  const sh=db_().getSheetByName('Levels');
  if(sh.getLastRow()>1) return;
  const stages=['Puberty and Body Awareness','Menstrual Health and Hygiene','Reproductive Health','Consent and Personal Safety','SRHR and Informed Decisions'];
  const rows=[];
  for(let id=1;id<=APP.totalLevels;id++) rows.push([
    id,stages[Math.floor((id-1)/20)],'သင်ခန်းစာ '+id,'Lesson '+id,
    'ကျွမ်းကျင်သူစစ်ဆေးပြီးမှ အကြောင်းအရာထည့်သွင်းမည်။',
    'Content will be added after qualified review.','','',false
  ]);
  sh.getRange(2,1,rows.length,rows[0].length).setValues(rows);
}
