/**
 * SRHR Learning Myanmar — starter prototype
 * Lead: Nway Htway Eain Organization (NHE)
 * Technical support: ForeRunners Organization (FR)
 *
 * IMPORTANT:
 * This starter is for restricted testing only. It is not
 * production-ready for children or sensitive SRHR data.
 * Complete expert review, privacy/security review, and
 * safeguarding workflows before any public pilot.
 */

const APP_CONFIG = {
  title: 'SRHR Learning Myanmar',
  totalLevels: 100,
  passMark: 70
};

const HEADERS = {
  Users: ['LearnerID', 'TokenHash', 'CreatedAt', 'Status'],
  Levels: ['LevelID', 'Stage', 'TitleMM', 'TitleEN', 'DescriptionMM', 'DescriptionEN', 'ContentMM', 'ContentEN', 'IsPublished'],
  QuizQuestions: ['QuestionID', 'LevelID', 'QuestionMM', 'OptionAMM', 'OptionBMM', 'OptionCMM', 'OptionDMM', 'CorrectAnswer', 'ExplanationMM', 'IsPublished'],
  GameLibrary: ['GameID', 'LevelID', 'GameType', 'TitleMM', 'InstructionsMM', 'IsPublished'],
  UserProgress: ['LearnerID', 'LevelID', 'LessonCompleted', 'QuizCompleted', 'QuizScore', 'GameCompleted', 'LevelCompleted', 'UpdatedAt'],
  ActivityLog: ['ActivityID', 'LearnerID', 'LevelID', 'ActivityType', 'Points', 'CreatedAt'],
  Settings: ['Key', 'Value']
};

function setupProject() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open Apps Script from a dedicated Google Sheet.');

  PropertiesService.getScriptProperties().setProperty('DATABASE_ID', ss.getId());

  Object.keys(HEADERS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[name]);
      sheet.setFrozenRows(1);
    }
  });

  seedLevels_();
  const settings = ss.getSheetByName('Settings');
  if (settings.getLastRow() === 1) {
    settings.appendRow(['APP_NAME', APP_CONFIG.title]);
    settings.appendRow(['TOTAL_LEVELS', APP_CONFIG.totalLevels]);
  }
  return 'Setup complete. Populate and review content before publishing.';
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(APP_CONFIG.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function db_() {
  const id = PropertiesService.getScriptProperties().getProperty('DATABASE_ID');
  if (!id) throw new Error('Run setupProject() first.');
  return SpreadsheetApp.openById(id);
}

/**
 * Create an anonymous account. Only the token hash is stored
 * in the sheet; the learner must keep the returned token safe.
 * This is still a prototype and needs abuse/rate-limit controls
 * before any public deployment.
 */
function createAnonymousAccount() {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const tokenHash = digest_(token);
  const learnerId = 'SRHR-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  db_().getSheetByName('Users').appendRow([
    learnerId, tokenHash, new Date(), 'ACTIVE'
  ]);
  return { learnerId: learnerId, token: token };
}

function digest_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
}

function verifyLearner_(token) {
  if (typeof token !== 'string' || token.length < 40 || token.length > 100) {
    throw new Error('Invalid session. Please sign in again.');
  }
  const wanted = digest_(token);
  const rows = db_().getSheetByName('Users').getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === wanted && rows[i][3] === 'ACTIVE') {
      return String(rows[i][0]);
    }
  }
  throw new Error('Learner session not found.');
}

function getDashboard(token) {
  const learnerId = verifyLearner_(token);
  const rows = db_().getSheetByName('UserProgress').getDataRange().getValues();
  let completed = 0;
  rows.slice(1).forEach(row => {
    if (row[0] === learnerId && row[6] === true) completed++;
  });
  const activity = db_().getSheetByName('ActivityLog').getDataRange().getValues();
  let points = 0;
  activity.slice(1).forEach(row => {
    if (row[1] === learnerId) points += Number(row[4]) || 0;
  });
  return {
    learnerId: learnerId,
    completedLevels: completed,
    totalLevels: APP_CONFIG.totalLevels,
    currentLevel: Math.min(completed + 1, APP_CONFIG.totalLevels),
    points: points
  };
}

function getPublishedLevels() {
  const rows = db_().getSheetByName('Levels').getDataRange().getValues();
  return rows.slice(1).filter(row => row[8] === true).map(row => ({
    id: Number(row[0]), stage: row[1], titleMM: row[2], titleEN: row[3],
    descriptionMM: row[4], descriptionEN: row[5]
  }));
}

function getLevelContent(token, levelId) {
  const learnerId = verifyLearner_(token);
  const id = Number(levelId);
  if (!Number.isInteger(id) || id < 1 || id > APP_CONFIG.totalLevels) {
    throw new Error('Invalid level.');
  }
  if (id > 1 && !isLevelCompleted_(learnerId, id - 1)) {
    throw new Error('Complete the previous level first.');
  }
  const rows = db_().getSheetByName('Levels').getDataRange().getValues();
  const row = rows.slice(1).find(r => Number(r[0]) === id && r[8] === true);
  if (!row) throw new Error('This lesson is not published yet.');
  return {
    id: Number(row[0]), stage: row[1], titleMM: row[2], titleEN: row[3],
    descriptionMM: row[4], descriptionEN: row[5],
    contentMM: row[6], contentEN: row[7]
  };
}

function isLevelCompleted_(learnerId, levelId) {
  const rows = db_().getSheetByName('UserProgress').getDataRange().getValues();
  return rows.slice(1).some(r => r[0] === learnerId &&
    Number(r[1]) === Number(levelId) && r[6] === true);
}

function seedLevels_() {
  const sheet = db_().getSheetByName('Levels');
  if (sheet.getLastRow() > 1) return;
  const stages = ['Discover', 'Understand', 'Learn', 'Empower', 'Champion'];
  const rows = [];
  for (let id = 1; id <= 100; id++) {
    const stage = stages[Math.floor((id - 1) / 20)];
    rows.push([
      id, stage, 'သင်ခန်းစာ ' + id, 'Lesson ' + id,
      'အကြောင်းအရာကို ကျွမ်းကျင်သူစစ်ဆေးပြီးမှ ထည့်သွင်းပါမည်။',
      'Content will be added after expert review.', '', '', false
    ]);
  }
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}
