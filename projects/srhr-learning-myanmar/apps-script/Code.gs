/**
 * SRHR Learning Myanmar — restricted Google Apps Script pilot
 * Lead: Nway Htway Eain Organization (NHE)
 * Technical partner: ForeRunners Organization (FR)
 *
 * NOT PRODUCTION READY. Do not use with real children until all
 * safeguarding, privacy, content, referral and security gates are signed off.
 */

const APP = Object.freeze({
  title: 'SRHR Learning Myanmar',
  totalLevels: 100,
  passMark: 70,
  maxQuizQuestions: 10,
  sessionHours: 12
});

const SCHEMA = {
  Users: ['LearnerID', 'TokenHash', 'CreatedAt', 'Status', 'AgeGroup', 'ExpiresAt'],
  Levels: ['LevelID', 'Stage', 'TitleMM', 'TitleEN', 'DescriptionMM', 'DescriptionEN', 'ContentMM', 'ContentEN', 'IsPublished', 'AgeGroup'],
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
      return;
    }
    const existingWidth = Math.max(sh.getLastColumn(), 1);
    const actual = sh.getRange(1, 1, 1, existingWidth).getValues()[0].map(String);
    const expected = SCHEMA[name];
    for (let i = 0; i < Math.min(actual.length, expected.length); i++) {
      if (actual[i] !== expected[i]) {
        throw new Error('Unexpected header in ' + name + ' column ' + (i + 1) + '. Stop and review the sheet; no data was overwritten.');
      }
    }
    if (actual.length > expected.length) {
      throw new Error('Unexpected extra columns in ' + name + '. Review the sheet before continuing.');
    }
    if (actual.length < expected.length) {
      sh.getRange(1, actual.length + 1, 1, expected.length - actual.length)
        .setValues([expected.slice(actual.length)]);
    }
    sh.setFrozenRows(1);
  });
  seedLevels_();
  const settings = db_().getSheetByName('Settings');
  if (settings.getLastRow() === 1) {
    settings.appendRow(['APP_NAME', APP.title]);
    settings.appendRow(['PASS_MARK', APP.passMark]);
    settings.appendRow(['CONTENT_STATUS', 'PLACEHOLDER']);
  }
  return 'Setup/migration complete. Existing sessions must sign in again. Configure access codes in Script Properties before pilot testing.';
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

function safeEqual_(a, b) {
  const x = digest_(String(a || ''));
  const y = digest_(String(b || ''));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/**
 * Access codes are configured manually in Apps Script > Project Settings >
 * Script Properties. Required keys:
 * ACCESS_CODE_10_14 and ACCESS_CODE_15_19.
 * Never commit real codes to GitHub or place them in the Sheet.
 */
function createAnonymousAccount(accessCode) {
  if (typeof accessCode !== 'string' || accessCode.length < 32 || accessCode.length > 128) {
    throw new Error('Facilitator Access Code မမှန်ကန်ပါ။ Please check with your facilitator.');
  }

  const props = PropertiesService.getScriptProperties();
  const code10 = props.getProperty('ACCESS_CODE_10_14');
  const code15 = props.getProperty('ACCESS_CODE_15_19');
  if (!code10 || !code15 || code10.length < 32 || code15.length < 32 || code10.length > 128 || code15.length > 128) {
    throw new Error('Access Code များကို စနစ်တွင် မသတ်မှတ်ရသေးပါ။ Facilitator/Administrator ထံ ဆက်သွယ်ပါ။');
  }

  let ageGroup = '';
  if (safeEqual_(accessCode, code10)) ageGroup = '10-14';
  else if (safeEqual_(accessCode, code15)) ageGroup = '15-19';
  if (!ageGroup) {
    throw new Error('Facilitator Access Code မမှန်ကန်ပါ။ Please check with your facilitator.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const token = Utilities.getUuid() + Utilities.getUuid();
    const learnerId = 'SRHR-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + APP.sessionHours * 60 * 60 * 1000);
    db_().getSheetByName('Users').appendRow([
      learnerId, digest_(token), new Date(), 'ACTIVE', ageGroup, expiresAt
    ]);
    return { learnerId: learnerId, token: token, ageGroup: ageGroup, expiresAt: expiresAt.toISOString() };
  } finally {
    lock.releaseLock();
  }
}

function session_(token) {
  if (typeof token !== 'string' || token.length < 40 || token.length > 100) {
    throw new Error('Session is invalid. Please create a new anonymous learner account.');
  }
  const hash = digest_(token);
  const rows = sheetRows_('Users');
  for (let i = 1; i < rows.length; i++) {
    const expiresAt = rows[i][5] instanceof Date ? rows[i][5] : new Date(rows[i][5]);
    if (rows[i][1] === hash && rows[i][3] === 'ACTIVE') {
      if (!expiresAt || isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
        throw new Error('Session သက်တမ်းကုန်သွားပါပြီ။ Access Code ဖြင့် ပြန်လည်ဝင်ရောက်ပါ။');
      }
      if (rows[i][4] !== '10-14' && rows[i][4] !== '15-19') {
        throw new Error('Age pathway မသတ်မှတ်ရသေးပါ။ Facilitator ထံ ဆက်သွယ်ပါ။');
      }
      return { learnerId: String(rows[i][0]), ageGroup: String(rows[i][4]) };
    }
  }
  throw new Error('Learner session not found or revoked.');
}

function learnerId_(token) {
  return session_(token).learnerId;
}

function revokeSession(token) {
  const learner = session_(token);
  const hash = digest_(token);
  const sh = db_().getSheetByName('Users');
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === hash && rows[i][0] === learner.learnerId) {
      sh.getRange(i + 1, 4).setValue('REVOKED');
      return { success: true };
    }
  }
  return { success: false };
}

function ageGroup_(token) {
  return session_(token).ageGroup;
}

function levelAllowed_(row, ageGroup) {
  const assigned = String(row[9] || '').trim();
  return assigned === ageGroup;
}

function getPublishedLevels(token) {
  const learner = session_(token);
  return sheetRows_('Levels').slice(1)
    .filter(r => (r[8] === true || String(r[8]).toUpperCase() === 'TRUE') && levelAllowed_(r, learner.ageGroup))
    .map(r => ({
      id: Number(r[0]), stage: String(r[1] || ''),
      titleMM: String(r[2] || ''), titleEN: String(r[3] || ''),
      descriptionMM: String(r[4] || ''), descriptionEN: String(r[5] || '')
    }));
}

function getLevelContent(token, levelId) {
  const learner = session_(token);
  const id = validLevel_(levelId);
  const levels = sheetRows_('Levels').slice(1).filter(r =>
    (r[8] === true || String(r[8]).toUpperCase() === 'TRUE') && levelAllowed_(r, learner.ageGroup)
  ).sort((a, b) => Number(a[0]) - Number(b[0]));
  const index = levels.findIndex(r => Number(r[0]) === id);
  if (index < 0) throw new Error('ဤသင်ခန်းစာကို သင့်သင်ယူမှုလမ်းကြောင်းတွင် မထုတ်ဝေရသေးပါ။');
  if (index > 0 && !isCompleted_(learner.learnerId, Number(levels[index - 1][0]))) {
    throw new Error('ယခင်အဆင့်ကို အရင်ပြီးမြောက်အောင် လေ့လာပါ။ Please complete the previous level first.');
  }
  const row = levels[index];
  return {
    id: Number(row[0]), stage: String(row[1] || ''),
    titleMM: String(row[2] || ''), titleEN: String(row[3] || ''),
    descriptionMM: String(row[4] || ''), descriptionEN: String(row[5] || ''),
    contentMM: String(row[6] || ''), contentEN: String(row[7] || '')
  };
}

function markLessonRead(token, levelId) {
  const learner = session_(token);
  const id = validLevel_(levelId);
  getLevelContent(token, id);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const row = progressRow_(learner.learnerId, id);
    const sh = db_().getSheetByName('UserProgress');
    if (row) {
      sh.getRange(row, 3).setValue(true);
      sh.getRange(row, 6).setValue(new Date());
    } else {
      sh.appendRow([learner.learnerId, id, true, '', false, new Date()]);
    }
    logActivity_(learner.learnerId, id, 'LESSON_READ', 0);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function getQuizQuestions(token, levelId) {
  const learner = session_(token);
  const id = validLevel_(levelId);
  getLevelContent(token, id);
  const rows = sheetRows_('QuizQuestions').slice(1).filter(r =>
    Number(r[1]) === id && (r[15] === true || String(r[15]).toUpperCase() === 'TRUE')
  );
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
  const learner = session_(token);
  const id = validLevel_(levelId);
  getLevelContent(token, id);
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > APP.maxQuizQuestions) {
    throw new Error('Quiz answers are missing or invalid.');
  }

  const published = sheetRows_('QuizQuestions').slice(1).filter(r =>
    Number(r[1]) === id && (r[15] === true || String(r[15]).toUpperCase() === 'TRUE')
  ).slice(0, APP.maxQuizQuestions);
  if (!published.length) throw new Error('No reviewed quiz questions have been published for this lesson.');
  if (answers.length !== published.length) throw new Error('မေးခွန်းအားလုံးကို ဖြေဆိုပြီးမှ တင်ပြပါ။');

  const answerMap = Object.create(null);
  answers.forEach(a => {
    if (!a || typeof a.id !== 'string' || !/^[ABCD]$/.test(String(a.answer))) {
      throw new Error('Quiz answer format is invalid.');
    }
    if (Object.prototype.hasOwnProperty.call(answerMap, a.id)) {
      throw new Error('Duplicate quiz answer detected.');
    }
    answerMap[a.id] = String(a.answer);
  });
  const expectedIds = published.map(r => String(r[0]));
  if (expectedIds.some(id => !id) || new Set(expectedIds).size !== expectedIds.length) {
    throw new Error('Published quiz contains missing or duplicate question IDs. Please contact the facilitator.');
  }
  if (Object.keys(answerMap).length !== expectedIds.length ||
      expectedIds.some(questionId => !Object.prototype.hasOwnProperty.call(answerMap, questionId))) {
    throw new Error('Quiz question IDs do not match the published quiz.');
  }

  let correct = 0;
  const feedback = published.map(r => {
    const correctKey = String(r[12] || '').toUpperCase();
    if (!/^[ABCD]$/.test(correctKey)) throw new Error('A published quiz question has an invalid answer key. Please contact the facilitator.');
    const isCorrect = answerMap[String(r[0])] === correctKey;
    if (isCorrect) correct++;
    return {
      id: String(r[0]), correct: isCorrect,
      explanationMM: String(r[13] || ''),
      explanationEN: String(r[14] || '')
    };
  });

  const score = Math.round((correct / feedback.length) * 100);
  const passed = score >= APP.passMark;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const progressRow = progressRow_(learner.learnerId, id);
    const sh = db_().getSheetByName('UserProgress');
    const old = progressRow ? sh.getRange(progressRow, 1, 1, 6).getValues()[0] : null;
    const lessonRead = old ? old[2] === true : false;
    const completed = passed && lessonRead;
    const record = [learner.learnerId, id, lessonRead, score, completed, new Date()];
    if (progressRow) sh.getRange(progressRow, 1, 1, 6).setValues([record]);
    else sh.appendRow(record);
    logActivity_(learner.learnerId, id, 'QUIZ_SUBMITTED', score);
    return { score: score, passed: passed, levelCompleted: completed, passMark: APP.passMark, feedback: feedback };
  } finally {
    lock.releaseLock();
  }
}

function getDashboard(token) {
  const learner = session_(token);
  const levels = sheetRows_('Levels').slice(1).filter(r =>
    (r[8] === true || String(r[8]).toUpperCase() === 'TRUE') && levelAllowed_(r, learner.ageGroup)
  ).sort((a, b) => Number(a[0]) - Number(b[0]));
  const progress = sheetRows_('UserProgress').slice(1).filter(r => r[0] === learner.learnerId);
  const completedIds = new Set(progress.filter(r => r[4] === true).map(r => Number(r[1])));
  const completedLevels = levels.filter(r => completedIds.has(Number(r[0]))).length;
  const next = levels.find(r => !completedIds.has(Number(r[0])));
  return {
    learnerId: learner.learnerId,
    ageGroup: learner.ageGroup,
    completedLevels: completedLevels,
    totalLevels: levels.length,
    currentLevel: next ? Number(next[0]) : null
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
      '', '', false, ''
    ]);
  }
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}
