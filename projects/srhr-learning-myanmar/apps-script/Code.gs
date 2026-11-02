/**
 * SRHR Learning Myanmar — Google Apps Script pilot
 * Lead: Nway Htway Eain Organization (NHE)
 * Technical partner: ForeRunners Organization (FR)
 *
 * PILOT ONLY. Do not use with real children until the safeguarding,
 * privacy, security, content-review and referral requirements in
 * docs/SAFEGUARDING-AND-DATA.md have been completed.
 */

const APP = Object.freeze({
  title: 'SRHR Learning Myanmar',
  totalLevels: 100,
  passMark: 70,
  maxQuizQuestions: 10
});

const SCHEMA = {
  Users: ['LearnerID', 'TokenHash', 'CreatedAt', 'Status'],
  Levels: ['LevelID', 'Stage', 'TitleMM', 'TitleEN', 'DescriptionMM', 'DescriptionEN', 'ContentMM', 'ContentEN', 'IsPublished'],
  QuizQuestions: ['QuestionID', 'LevelID', 'QuestionMM', 'QuestionEN', 'OptionAMM', 'OptionAEN', 'OptionBMM', 'OptionBEN', 'OptionCMM', 'OptionCEN', 'OptionDMM', 'OptionDEN', 'CorrectAnswer', 'ExplanationMM', 'ExplanationEN', 'IsPublished'],
  UserProgress: ['LearnerID', 'LevelID', 'LessonRead', 'QuizScore', 'LevelCompleted', 'UpdatedAt'],
  ActivityLog: ['ActivityID', 'LearnerID', 'LevelID', 'ActivityType', 'Score', 'CreatedAt'],
  Settings: ['Key', 'Value']
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(APP.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
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
      sh.getRange(1, 1, 1, SCHEMA[name].length).setValues([SCHEMA[name]]);
      sh.setFrozenRows(1);
    } else {
      const actual = sh.getRange(1, 1, 1, SCHEMA[name].length).getValues()[0];
      if (actual.join('|') !== SCHEMA[name].join('|')) {
        throw new Error('Unexpected header structure in sheet: ' + name + '. Do not overwrite existing data; review it first.');
      }
    }
  });
  seedLevels_();
  const settings = db_().getSheetByName('Settings');
  if (settings.getLastRow() === 1) {
    settings.appendRow(['APP_NAME', APP.title]);
    settings.appendRow(['PASS_MARK', APP.passMark]);
    settings.appendRow(['CONTENT_STATUS', 'PLACEHOLDER']);
  }
  return 'Setup complete. Add expert-reviewed lessons and quiz questions, then publish them in the sheet.';
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

function digest_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return bytes.map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
}

/** Anonymous pilot account. Do not ask learners for names, phone numbers or addresses. */
function createAnonymousAccount() {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const learnerId = 'SRHR-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  db_().getSheetByName('Users').appendRow([learnerId, digest_(token), new Date(), 'ACTIVE']);
  return { learnerId: learnerId, token: token };
}

function learnerId_(token) {
  if (typeof token !== 'string' || token.length < 40 || token.length > 100) {
    throw new Error('Session is invalid. Create a new anonymous learner account.');
  }
  const hash = digest_(token);
  const rows = sheetRows_('Users');
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === hash && rows[i][3] === 'ACTIVE') return String(rows[i][0]);
  }
  throw new Error('Learner session not found.');
}

function getPublishedLevels(token) {
  learnerId_(token);
  return sheetRows_('Levels').slice(1)
    .filter(r => r[8] === true || String(r[8]).toUpperCase() === 'TRUE')
    .map(r => ({
      id: Number(r[0]), stage: String(r[1] || ''),
      titleMM: String(r[2] || ''), titleEN: String(r[3] || ''),
      descriptionMM: String(r[4] || ''), descriptionEN: String(r[5] || '')
    }));
}

function getLevelContent(token, levelId) {
  const learnerId = learnerId_(token);
  const id = validLevel_(levelId);
  if (id > 1 && !isCompleted_(learnerId, id - 1)) {
    throw new Error('ယခင်အဆင့်ကို အရင်ပြီးမြောက်အောင် လေ့လာပါ။ Please complete the previous level first.');
  }
  const row = sheetRows_('Levels').slice(1).find(r =>
    Number(r[0]) === id && (r[8] === true || String(r[8]).toUpperCase() === 'TRUE'));
  if (!row) throw new Error('ဤသင်ခန်းစာကို မထုတ်ဝေရသေးပါ။ This lesson is not published yet.');
  return {
    id: Number(row[0]), stage: String(row[1] || ''),
    titleMM: String(row[2] || ''), titleEN: String(row[3] || ''),
    descriptionMM: String(row[4] || ''), descriptionEN: String(row[5] || ''),
    contentMM: String(row[6] || ''), contentEN: String(row[7] || '')
  };
}

function markLessonRead(token, levelId) {
  const learnerId = learnerId_(token);
  const id = validLevel_(levelId);
  getLevelContent(token, id); // confirms publication and prerequisite
  const row = progressRow_(learnerId, id);
  const sh = db_().getSheetByName('UserProgress');
  if (row) {
    sh.getRange(row, 3).setValue(true);
    sh.getRange(row, 6).setValue(new Date());
  } else {
    sh.appendRow([learnerId, id, true, '', false, new Date()]);
  }
  logActivity_(learnerId, id, 'LESSON_READ', 0);
  return { success: true };
}

function getQuizQuestions(token, levelId) {
  const learnerId = learnerId_(token);
  const id = validLevel_(levelId);
  getLevelContent(token, id);
  const rows = sheetRows_('QuizQuestions').slice(1).filter(r =>
    Number(r[1]) === id && (r[15] === true || String(r[15]).toUpperCase() === 'TRUE'));
  return rows.slice(0, APP.maxQuizQuestions).map(r => ({
    id: String(r[0]),
    questionMM: String(r[2] || ''), questionEN: String(r[3] || ''),
    options: [
      { key: 'A', mm: String(r[4] || ''), en: String(r[5] || '') },
      { key: 'B', mm: String(r[6] || ''), en: String(r[7] || '') },
      { key: 'C', mm: String(r[8] || ''), en: String(r[9] || '') },
      { key: 'D', mm: String(r[10] || ''), en: String(r[11] || '') }
    ]
  }));
}

function submitQuiz(token, levelId, answers) {
  const learnerId = learnerId_(token);
  const id = validLevel_(levelId);
  getLevelContent(token, id);
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > APP.maxQuizQuestions) {
    throw new Error('Quiz answers are missing or invalid.');
  }
  const published = sheetRows_('QuizQuestions').slice(1).filter(r =>
    Number(r[1]) === id && (r[15] === true || String(r[15]).toUpperCase() === 'TRUE'));
  if (!published.length) throw new Error('No reviewed quiz questions have been published for this lesson.');

  const answerMap = {};
  answers.forEach(a => {
    if (a && typeof a.id === 'string' && /^[ABCD]$/.test(String(a.answer))) answerMap[a.id] = String(a.answer);
  });
  let correct = 0;
  const feedback = published.slice(0, APP.maxQuizQuestions).map(r => {
    const isCorrect = answerMap[String(r[0])] === String(r[12]).toUpperCase();
    if (isCorrect) correct++;
    return {
      id: String(r[0]), correct: isCorrect,
      explanationMM: String(r[13] || ''),
      explanationEN: String(r[14] || '')
    };
  });
  const total = feedback.length;
  const score = Math.round((correct / total) * 100);
  const passed = score >= APP.passMark;
  const progressRow = progressRow_(learnerId, id);
  const sh = db_().getSheetByName('UserProgress');
  const old = progressRow ? sh.getRange(progressRow, 1, 1, 6).getValues()[0] : null;
  const lessonRead = old ? old[2] === true : false;
  const completed = passed && lessonRead;
  const record = [learnerId, id, lessonRead, score, completed, new Date()];
  if (progressRow) sh.getRange(progressRow, 1, 1, 6).setValues([record]);
  else sh.appendRow(record);
  logActivity_(learnerId, id, 'QUIZ_SUBMITTED', score);
  return { score: score, passed: passed, levelCompleted: completed, passMark: APP.passMark, feedback: feedback };
}

function getDashboard(token) {
  const learnerId = learnerId_(token);
  const rows = sheetRows_('UserProgress').slice(1).filter(r => r[0] === learnerId);
  const completed = rows.filter(r => r[4] === true).length;
  return {
    learnerId: learnerId,
    completedLevels: completed,
    totalLevels: APP.totalLevels,
    currentLevel: Math.min(completed + 1, APP.totalLevels)
  };
}

function validLevel_(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1 || id > APP.totalLevels) throw new Error('Invalid lesson level.');
  return id;
}

function progressRow_(learnerId, levelId) {
  const sh = db_().getSheetByName('UserProgress');
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === learnerId && Number(values[i][1]) === Number(levelId)) return i + 1;
  }
  return 0;
}

function isCompleted_(learnerId, levelId) {
  const row = progressRow_(learnerId, levelId);
  return row ? db_().getSheetByName('UserProgress').getRange(row, 5).getValue() === true : false;
}

function logActivity_(learnerId, levelId, type, score) {
  db_().getSheetByName('ActivityLog').appendRow([
    Utilities.getUuid(), learnerId, levelId, type, score, new Date()
  ]);
}

function seedLevels_() {
  const sh = db_().getSheetByName('Levels');
  if (sh.getLastRow() > 1) return;
  const stages = ['Puberty and Body Awareness', 'Menstrual Health and Hygiene', 'Reproductive Health', 'Consent and Personal Safety', 'SRHR and Informed Decisions'];
  const rows = [];
  for (let id = 1; id <= APP.totalLevels; id++) {
    rows.push([
      id, stages[Math.floor((id - 1) / 20)],
      'သင်ခန်းစာ ' + id, 'Lesson ' + id,
      'ကျွမ်းကျင်သူစစ်ဆေးပြီးမှ အကြောင်းအရာထည့်သွင်းမည်။',
      'Content will be added after qualified review.',
      '', '', false
    ]);
  }
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}
