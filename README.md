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

⚠️ **Da configurare**: le pagine puntano a un placeholder. Sostituire in tutti i file:

```
https://script.google.com/macros/s/REPLACE_WITH_DJN_DEPLOYMENT_ID/exec
```

Costanti da aggiornare:

| File | Costante |
|---|---|
| `index.html` | `API_URL` |
| `war-room-defense-tracker.html` | `NGC_SCRIPT_URL` |
| `alliance-strategy-ENHANCED.html` | `GOOGLE_SCRIPT_URL` |
| `ngc-personal-stats.html` | `SCRIPT_URL` |
| `smorfia-game.html` | `GAS_URL` |

Procedura completa: [INSTALLATION.md](INSTALLATION.md).

Nome alleanza, colori, annunci e codice R4 arrivano dal backend (`?action=getConfig`), non dall'HTML.

---

## 🚀 Hosting

GitHub Pages → https://serafino86.github.io/DJN/

---

## 📜 Licenza

CC BY-NC-ND 4.0 — uso libero per l'alleanza. Licenze commerciali: serafino.ngc@gmail.com

**Tecnologia**: NGC Alliance Hub System · **Sviluppo**: Serafino
