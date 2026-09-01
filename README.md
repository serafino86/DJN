# DJN Alliance Hub 🎯

**Alliance Management System for Last War: Survival**

Hub multilingue (IT / EN / FR / DE) per l'alleanza DJN.

---

## 🌟 Moduli

| Card | File | Cosa fa |
|---|---|---|
| 📊 Personal Stats | `ngc-personal-stats.html` | Potenza totale, dettaglio squadre (missili/aerei/carri), grafici crescita |
| ⚔️ War Room | `war-room-defense-tracker.html` | Tracking potenza in tempo reale, statistiche alleanza |
| 🗺️ Strategy Manager | `alliance-strategy-ENHANCED.html` | Canyon (12 edifici) + Desert Storm (11), team A/B, Kill Swat, riserve, storico formazioni |
| 🎰 Lotteria DJN | `smorfia-game.html` | 5 numeri + jolly a settimana, classifica |
| 🧭 Menu Pianificazione | link esterno | Planner S5, lista server, calcolatore Ammo Bonanza, guida Season 5 |

Tutti i testi esistono in 4 lingue: **IT, EN, FR, DE**. Ogni nuova stringa va aggiunta in tutte e quattro.

---

## 🔌 Backend

Google Apps Script + Google Sheet (dati di proprietà dell'alleanza, zero costi infrastruttura).

Endpoint attivo (deployment DJN):

```
https://script.google.com/macros/s/AKfycbzMghSyLP_.../exec
```

Le 5 costanti del frontend (`API_URL`, `NGC_SCRIPT_URL`, `GOOGLE_SCRIPT_URL`,
`SCRIPT_URL`, `GAS_URL`) puntano gia` a questo deployment.

Montaggio e valori da compilare: [backend-gas/README.md](backend-gas/README.md).
⚠️ `INSTALLATION.md` e` il documento originale NGC e su alcuni punti non corrisponde
al codice (dice foglio `Data` e codice in B2; sono `War Room Data` e H1/H2).

Nome alleanza, colori, annunci e codice R4 arrivano dal backend (`?action=getConfig`), non dall'HTML.

---

## 🚀 Hosting

GitHub Pages → https://serafino86.github.io/DJN/

---

## 📜 Licenza

CC BY-NC-ND 4.0 — uso libero per l'alleanza. Licenze commerciali: serafino.ngc@gmail.com

**Tecnologia**: NGC Alliance Hub System · **Sviluppo**: Serafino
