# Backend Apps Script - DJN

Il backend vive dentro il Google Sheet dell'alleanza, non in questo repo. Qui
restano solo le istruzioni di montaggio e i valori da compilare.

**Stato**: deployment attivo e raggiungibile, `getConfig` risponde JSON.

## Montaggio, in ordine

### 1. Foglio

Google Sheet `Alliance Hub - DJN`. Non creare i fogli a mano: li crea il setup.

### 2. Script

Estensioni → Apps Script, incolla il codice del progetto NGC. **Copia tutti i
file** della colonna di sinistra, non solo quello con `doGet`: lotteria e
`deletePlayer` stanno negli altri.

Il codice non contiene nessun ID di foglio — usa `getActiveSpreadsheet()`, quindi
si aggancia da solo al foglio in cui vive. Nessuna modifica da fare.

Attenzione all'ultimo blocco di commento del file principale: nel sorgente NGC
la riga finale di asterischi non chiude il commento (`*/` mancante) e Apps Script
rifiuta di salvare con `SyntaxError: Unexpected token '**'`.

### 3. Setup

- Salva, ricarica il foglio
- Menu `⚔️ Alliance Hub` → `🚀 Setup Completo`

### 4. Valori DJN

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
| `alliance_name` | `DJN` — oggi e` ancora `My Alliance` |
| `server` | numero server DJN |
| `language` | `it`, `en`, `fr` o `de` |
| `announcement` | messaggio in home |

Nome, colori e annunci arrivano da qui, non dall'HTML: si cambiano nel foglio
senza toccare il codice e senza rifare il deploy.

### 5. Deploy

Deploy → Web app → *Execute as:* **Me**, *Who has access:* **Anyone**.

`Anyone` e` obbligatorio: con qualsiasi altro valore l'endpoint risponde con la
pagina di login Google al posto del JSON e nessuna pagina dell'hub carica.

L'URL `/exec` e` gia` scritto nelle 5 costanti del frontend:

| File | Costante |
|---|---|
| `index.html` | `API_URL` |
| `war-room-defense-tracker.html` | `NGC_SCRIPT_URL` |
| `alliance-strategy-ENHANCED.html` | `GOOGLE_SCRIPT_URL` |
| `ngc-personal-stats.html` | `SCRIPT_URL` |
| `smorfia-game.html` | `GAS_URL` |

Se rifai un deployment **nuovo** l'URL cambia e vanno aggiornate tutte e cinque.
Modificando quello esistente, invece, l'URL resta.
