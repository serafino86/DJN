# Backend Apps Script - DJN

Il backend vive dentro il Google Sheet dell'alleanza, non qui. Questa cartella
tiene solo il pezzo che va aggiunto a mano e le istruzioni per montarlo.

## Montaggio, in ordine

### 1. Foglio

Nuovo Google Sheet, nome `Alliance Hub - DJN`. Non creare fogli a mano: li crea
il setup.

### 2. Script principale

Estensioni → Apps Script. Incolla il codice del progetto NGC.
**Copiali tutti**: nell'editor NGC guarda la colonna file a sinistra, se ci sono
piu` file servono tutti, non solo quello con `doGet`.

Il codice non contiene nessun ID di foglio: usa `getActiveSpreadsheet()`, quindi
si aggancia da solo al foglio in cui vive. Nessuna modifica da fare.

### 3. File Smorfia

Se nel progetto NGC **non** trovi le funzioni della lotteria (`saveSmorfiapicks`,
`getWeeklyDraw`, `getSmorfiaLeaderboard`, `getSmorfiaHallOfShame`,
`getMySmorfiapicks`) e `deletePlayer`, aggiungi `djn-smorfia.gs` come nuovo file
e applica la patch del punto 4. Se invece le trovi, salta questo file: gli
originali NGC hanno la precedenza.

### 4. Patch al file principale

Due righe, una per handler.

Dentro `doGet(e)`, subito **prima** di `return createResponse(false, 'Unknown action');`:

```javascript
var djnGet = djnExtraDoGet(e);
if (djnGet) return djnGet;
```

Dentro `doPost(e)`, subito **prima** di `return createResponse(false, 'Unknown action');`:

```javascript
var djnPost = djnExtraDoPost(payload);
if (djnPost) return djnPost;
```

### 5. Setup

- Salva, ricarica il foglio
- Menu `⚔️ Alliance Hub` → `🚀 Setup Completo`
- Esegui a mano la funzione `setupSmorfia()` dall'editor

### 6. Valori DJN

Foglio `War Room Data`:

| Cella | Cosa | Nota |
|---|---|---|
| **H1** | codice alleanza | default `ALLIANCE2024` — **cambialo**, e` pubblico su GitHub |
| **H2** | codice R4 | default `R4ADMIN` — **cambialo**, stesso motivo |

I codici DJN devono essere diversi da quelli NGC, altrimenti chi sta in NGC entra
anche qui.

Foglio `Alliance Config`, colonna VALORE:

| Parametro | Valore |
|---|---|
| `alliance_name` | `DJN` |
| `server` | numero server DJN |
| `language` | `it`, `en`, `fr` o `de` |
| `announcement` | messaggio in home |

Nome, colori e annunci arrivano da qui: non sono nell'HTML.

### 7. Deploy

Deploy → Nuovo deployment → Web app → *Execute as:* **Me**, *Who has access:*
**Anyone** → Autorizza → copia l'URL che finisce in `/exec`.

Quell'URL va sostituito nelle 5 costanti del frontend, oggi ferme sul
placeholder `REPLACE_WITH_DJN_DEPLOYMENT_ID`:

| File | Costante |
|---|---|
| `index.html` | `API_URL` |
| `war-room-defense-tracker.html` | `NGC_SCRIPT_URL` |
| `alliance-strategy-ENHANCED.html` | `GOOGLE_SCRIPT_URL` |
| `ngc-personal-stats.html` | `SCRIPT_URL` |
| `smorfia-game.html` | `GAS_URL` |

## Come si pubblica l'estrazione settimanale

Foglio `Smorfia Draws`, una riga per settimana:

```
WEEK ID | N1 | N2 | N3 | N4 | N5 | JOLLY | DRAWN AT
2026-W36 | 7 | 22 | 45 | 67 | 88 | 3 | 2026-09-06
```

Il `WEEK ID` e` la settimana ISO; la cella J2 dello stesso foglio mostra sempre
quella corrente, cosi` non devi calcolarla. Finche` la riga non c'e`, il gioco
dice "nessuna estrazione" ma accetta lo stesso le giocate.

La Hall of Shame prende, per ogni settimana gia` estratta, chi ha indovinato meno
numeri — a parita`, chi non ha preso il jolly, poi il dado piu` basso.

## Regole applicate dalla lotteria

- 5 numeri da 1 a 90, senza ripetizioni, piu` un jolly
- una sola giocata per giocatore a settimana
- classifica per numeri indovinati, poi jolly, poi dado

`deletePlayer` richiede il codice R4 e cancella il giocatore da `War Room Data`,
`Latest Players` e `Player PINs` — cosi` puo` registrarsi di nuovo da zero.
