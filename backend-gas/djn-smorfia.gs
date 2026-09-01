/****************************************************
 * DJN ALLIANCE HUB - Lotteria + Delete Player
 *
 * Secondo file del progetto Apps Script, da affiancare al file principale
 * (quello con doGet/doPost, War Room, Canyon e Storm).
 *
 * Copre le action che il frontend chiama e che il file principale non ha:
 *   GET   getWeeklyDraw
 *   GET   getMySmorfiapicks
 *   GET   getSmorfiaLeaderboard
 *   GET   getSmorfiaHallOfShame
 *   POST  saveSmorfiapicks
 *   POST  deletePlayer
 *
 * ── INSTALLAZIONE ──────────────────────────────────
 * 1. Apps Script → + → Script → chiamalo "Smorfia"
 * 2. Incolla tutto questo file
 * 3. Nel file principale, dentro doGet(e), PRIMA della riga finale
 *    `return createResponse(false, 'Unknown action');` aggiungi:
 *
 *        var djnGet = djnExtraDoGet(e);
 *        if (djnGet) return djnGet;
 *
 * 4. Nel file principale, dentro doPost(e), PRIMA della riga finale
 *    `return createResponse(false, 'Unknown action');` aggiungi:
 *
 *        var djnPost = djnExtraDoPost(payload);
 *        if (djnPost) return djnPost;
 *
 * 5. Menu ⚔️ Alliance Hub → Setup Completo (crea i fogli base)
 * 6. Esegui una volta a mano `setupSmorfia()` (crea i fogli lotteria)
 * 7. Deploy → Nuovo deployment → Web app → Execute as: Me,
 *    Who has access: Anyone
 *
 * ── COME SI GESTISCE L'ESTRAZIONE ──────────────────
 * Nel foglio "Smorfia Draws" scrivi una riga per settimana:
 *   WEEK ID | N1 | N2 | N3 | N4 | N5 | JOLLY | DRAWN AT
 * Il WEEK ID e` in formato ISO, es. 2026-W36. La cella A2 del foglio
 * mostra sempre la settimana corrente, cosi` sai quale scrivere.
 * Finche` non esiste la riga della settimana corrente, il gioco mostra
 * "nessuna estrazione" e accetta comunque le giocate.
 ****************************************************/

var SMORFIA_DRAWS_SHEET = 'Smorfia Draws';
var SMORFIA_PICKS_SHEET = 'Smorfia Picks';

/****************************************************
 * ROUTER - richiamati dal file principale
 ****************************************************/
function djnExtraDoGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';

  if (action === 'getWeeklyDraw') {
    return getWeeklyDrawAPI();
  }
  if (action === 'getMySmorfiapicks') {
    return getMySmorfiapicksAPI(e.parameter.playerName);
  }
  if (action === 'getSmorfiaLeaderboard') {
    return getSmorfiaLeaderboardAPI();
  }
  if (action === 'getSmorfiaHallOfShame') {
    return getSmorfiaHallOfShameAPI();
  }

  return null; // non e` roba nostra: lascia rispondere il file principale
}

function djnExtraDoPost(payload) {
  var action = payload ? payload.action : '';

  if (action === 'saveSmorfiapicks') {
    return saveSmorfiapicksAPI(payload);
  }
  if (action === 'deletePlayer') {
    return deletePlayerAPI(payload);
  }

  return null;
}

/****************************************************
 * SETUP FOGLI LOTTERIA
 ****************************************************/
function setupSmorfia() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var draws = ss.getSheetByName(SMORFIA_DRAWS_SHEET);
  if (!draws) {
    draws = ss.insertSheet(SMORFIA_DRAWS_SHEET);
    draws.getRange(1, 1, 1, 8).setValues([[
      'WEEK ID', 'N1', 'N2', 'N3', 'N4', 'N5', 'JOLLY', 'DRAWN AT'
    ]]);
    draws.getRange(1, 1, 1, 8)
      .setFontWeight('bold')
      .setFontSize(12)
      .setBackground('#6a1b9a')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    draws.setColumnWidth(1, 120);
    draws.setColumnWidth(8, 180);
    draws.setFrozenRows(1);

    draws.getRange('J1').setValue('SETTIMANA CORRENTE').setFontWeight('bold');
    draws.getRange('J2').setValue(isoWeekId_(new Date()));
    draws.getRange('J3').setValue('Scrivi qui sotto una riga con questo WEEK ID per pubblicare l\'estrazione.')
      .setFontSize(9).setFontColor('#666666');
    draws.setColumnWidth(10, 320);
  }

  var picks = ss.getSheetByName(SMORFIA_PICKS_SHEET);
  if (!picks) {
    picks = ss.insertSheet(SMORFIA_PICKS_SHEET);
    picks.getRange(1, 1, 1, 9).setValues([[
      'WEEK ID', 'PLAYER', 'N1', 'N2', 'N3', 'N4', 'N5', 'JOLLY', 'DICE TOTAL'
    ]]);
    picks.getRange(1, 1, 1, 9)
      .setFontWeight('bold')
      .setFontSize(12)
      .setBackground('#6a1b9a')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    picks.setColumnWidth(1, 120);
    picks.setColumnWidth(2, 200);
    picks.setFrozenRows(1);
  }

  ss.toast('✅ Fogli lotteria pronti. Scrivi l\'estrazione in "' + SMORFIA_DRAWS_SHEET + '".', 'DJN Hub', 5);
}

/****************************************************
 * SETTIMANA ISO - stesso calcolo del frontend
 ****************************************************/
function isoWeekId_(d) {
  var date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  var dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return date.getUTCFullYear() + '-W' + (weekNo < 10 ? '0' : '') + weekNo;
}

/****************************************************
 * ESTRAZIONE
 ****************************************************/
function readDraw_(weekId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SMORFIA_DRAWS_SHEET);
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() !== weekId) continue;

    var numbers = [];
    for (var c = 1; c <= 5; c++) {
      var n = Number(data[i][c]);
      if (!n) return null; // riga incompleta: trattala come non pubblicata
      numbers.push(n);
    }
    var jolly = Number(data[i][6]);
    if (!jolly) return null;

    return { weekId: weekId, numbers: numbers, jolly: jolly };
  }
  return null;
}

function getWeeklyDrawAPI() {
  var weekId = isoWeekId_(new Date());
  var draw = readDraw_(weekId);

  if (!draw) {
    return createResponse(true, { weekId: weekId, numbers: null, jolly: null });
  }
  return createResponse(true, draw);
}

/****************************************************
 * GIOCATE
 ****************************************************/
function getPicksSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SMORFIA_PICKS_SHEET);
  if (!sheet) {
    setupSmorfia();
    sheet = ss.getSheetByName(SMORFIA_PICKS_SHEET);
  }
  return sheet;
}

function saveSmorfiapicksAPI(payload) {
  try {
    var name = String(payload.playerName || '').trim().toUpperCase();
    var numbers = payload.numbers || [];
    var jolly = Number(payload.jolly);
    var diceTotal = Number(payload.diceTotal) || 0;

    if (!name) {
      return createResponse(false, 'Nome richiesto');
    }
    if (!Array.isArray(numbers) || numbers.length !== 5 || !jolly) {
      return createResponse(false, 'Servono 5 numeri piu` il jolly');
    }

    // numeri validi, interi, tra 1 e 90, senza ripetizioni
    var clean = [];
    for (var i = 0; i < numbers.length; i++) {
      var n = Math.floor(Number(numbers[i]));
      if (!n || n < 1 || n > 90 || clean.indexOf(n) !== -1) {
        return createResponse(false, 'Numeri non validi');
      }
      clean.push(n);
    }
    jolly = Math.floor(jolly);
    if (jolly < 1 || jolly > 90) {
      return createResponse(false, 'Jolly non valido');
    }

    var weekId = isoWeekId_(new Date());
    var sheet = getPicksSheet_();
    var data = sheet.getDataRange().getValues();

    // una sola giocata per giocatore a settimana
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][0]).trim() === weekId &&
          String(data[r][1]).trim().toUpperCase() === name) {
        return createResponse(false, 'Hai gia` giocato questa settimana');
      }
    }

    sheet.appendRow([weekId, name, clean[0], clean[1], clean[2], clean[3], clean[4], jolly, diceTotal]);

    return createResponse(true, {
      weekId: weekId,
      playerName: name,
      numbers: clean,
      jolly: jolly,
      diceTotal: diceTotal
    });

  } catch (error) {
    return createResponse(false, 'Errore: ' + error.toString());
  }
}

function readPicks_(weekId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SMORFIA_PICKS_SHEET);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var out = [];

  for (var i = 1; i < data.length; i++) {
    if (weekId && String(data[i][0]).trim() !== weekId) continue;
    var name = String(data[i][1]).trim();
    if (!name) continue;

    out.push({
      weekId: String(data[i][0]).trim(),
      playerName: name,
      numbers: [Number(data[i][2]), Number(data[i][3]), Number(data[i][4]), Number(data[i][5]), Number(data[i][6])],
      jolly: Number(data[i][7]),
      diceTotal: Number(data[i][8]) || 0
    });
  }
  return out;
}

function getMySmorfiapicksAPI(playerName) {
  var name = String(playerName || '').trim().toUpperCase();
  if (!name) {
    return createResponse(false, 'Nome richiesto');
  }

  var weekId = isoWeekId_(new Date());
  var picks = readPicks_(weekId);

  for (var i = 0; i < picks.length; i++) {
    if (picks[i].playerName.toUpperCase() === name) {
      return createResponse(true, picks[i]);
    }
  }
  return createResponse(true, {});
}

/****************************************************
 * PUNTEGGIO E CLASSIFICA
 ****************************************************/
function scorePick_(pick, draw) {
  var matches = 0;
  if (draw) {
    for (var i = 0; i < pick.numbers.length; i++) {
      if (draw.numbers.indexOf(pick.numbers[i]) !== -1) matches++;
    }
  }
  return {
    matches: matches,
    jollyMatched: draw ? pick.jolly === draw.jolly : false
  };
}

function sortEntries_(entries) {
  entries.sort(function (a, b) {
    if (b.matches !== a.matches) return b.matches - a.matches;
    if (a.jollyMatched !== b.jollyMatched) return a.jollyMatched ? -1 : 1;
    if (b.diceTotal !== a.diceTotal) return b.diceTotal - a.diceTotal;
    return a.playerName.localeCompare(b.playerName);
  });
  return entries;
}

function getSmorfiaLeaderboardAPI() {
  var weekId = isoWeekId_(new Date());
  var draw = readDraw_(weekId);
  var picks = readPicks_(weekId);
  var entries = [];

  for (var i = 0; i < picks.length; i++) {
    var score = scorePick_(picks[i], draw);
    entries.push({
      playerName: picks[i].playerName,
      numbers: picks[i].numbers,
      jolly: picks[i].jolly,
      diceTotal: picks[i].diceTotal,
      matches: score.matches,
      jollyMatched: score.jollyMatched,
      display: picks[i].numbers.join(' · ') + ' | J' + picks[i].jolly
    });
  }

  sortEntries_(entries);

  return createResponse(true, {
    weekId: weekId,
    drawnNumbers: draw ? draw.numbers : null,
    drawnJolly: draw ? draw.jolly : null,
    entries: entries
  });
}

/****************************************************
 * HALL OF SHAME - il Culone di ogni settimana chiusa
 ****************************************************/
function getSmorfiaHallOfShameAPI() {
  var currentWeek = isoWeekId_(new Date());
  var allPicks = readPicks_(null);

  // raggruppa per settimana, saltando quella in corso
  var byWeek = {};
  for (var i = 0; i < allPicks.length; i++) {
    var w = allPicks[i].weekId;
    if (!w || w === currentWeek) continue;
    if (!byWeek[w]) byWeek[w] = [];
    byWeek[w].push(allPicks[i]);
  }

  var shame = [];
  for (var week in byWeek) {
    var draw = readDraw_(week);
    if (!draw) continue; // settimana mai estratta: nessun Culone

    var scored = byWeek[week].map(function (pick) {
      var score = scorePick_(pick, draw);
      return {
        weekId: week,
        playerName: pick.playerName,
        matches: score.matches,
        jollyMatched: score.jollyMatched,
        diceTotal: pick.diceTotal
      };
    });

    // il peggiore: meno numeri presi, niente jolly, dado piu` basso
    scored.sort(function (a, b) {
      if (a.matches !== b.matches) return a.matches - b.matches;
      if (a.jollyMatched !== b.jollyMatched) return a.jollyMatched ? 1 : -1;
      return a.diceTotal - b.diceTotal;
    });

    if (scored.length) shame.push(scored[0]);
  }

  // settimane piu` recenti in cima
  shame.sort(function (a, b) { return b.weekId.localeCompare(a.weekId); });

  return createResponse(true, shame.slice(0, 20));
}

/****************************************************
 * DELETE PLAYER - richiede codice R4
 ****************************************************/
function deletePlayerAPI(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName(DATA_SHEET_NAME);

    if (!dataSheet) {
      return createResponse(false, 'War Room Data non trovato');
    }

    var storedCode = String(dataSheet.getRange(R4_CODE_CELL).getValue()).trim().toUpperCase().replace(/\s+/g, '');
    var providedCode = String(payload.r4Code || '').trim().toUpperCase().replace(/\s+/g, '');

    if (!providedCode || storedCode !== providedCode) {
      return createResponse(false, 'Codice R4 non valido');
    }

    var name = String(payload.playerName || '').trim().toUpperCase();
    if (!name) {
      return createResponse(false, 'Nome richiesto');
    }

    var removed = 0;

    // War Room Data: tutte le rilevazioni del giocatore
    removed += deleteRowsByName_(dataSheet, 0, name);

    // Latest Players: la riga di riepilogo
    var latestSheet = ss.getSheetByName(LATEST_PLAYERS_SHEET);
    if (latestSheet) removed += deleteRowsByName_(latestSheet, 0, name);

    // PIN: cosi` il giocatore puo` registrarsi di nuovo da zero
    var pinSheet = ss.getSheetByName(PIN_SHEET_NAME);
    if (pinSheet) removed += deleteRowsByName_(pinSheet, 0, name);

    if (removed === 0) {
      return createResponse(false, 'Giocatore non trovato');
    }

    return createResponse(true, { playerName: name, rowsRemoved: removed });

  } catch (error) {
    return createResponse(false, 'Errore: ' + error.toString());
  }
}

/** Cancella dal basso verso l'alto, cosi` gli indici restano validi. */
function deleteRowsByName_(sheet, nameColumnIndex, upperCaseName) {
  var data = sheet.getDataRange().getValues();
  var removed = 0;

  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][nameColumnIndex]).trim().toUpperCase() === upperCaseName) {
      sheet.deleteRow(i + 1);
      removed++;
    }
  }
  return removed;
}
