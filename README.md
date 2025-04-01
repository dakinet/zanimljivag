# Zanimljiva Geografija - Multiplayer Turn-Based Igra

Zanimljiva Geografija je multiplayer turn-based igra bazirana na popularnoj igri geografija, gdje igrači moraju unijeti pojmove koji počinju na određeno slovo u različitim kategorijama.

## Tehnologija i arhitektura

### Frontend
- HTML5/CSS3/Vanilla JavaScript - Minimalni pristup bez framework-a
- Firebase SDK - Za komunikaciju sa bazom
- Responsive design - Bootstrap 5 za brzo stilizovanje i podršku za desktop i mobilne uređaje
- Font Awesome - Za ikonice
- Google Fonts - Za tipografiju (Roboto i Montserrat)

### Backend
- Firebase Authentication - Za registraciju i login korisnika (anonimno)
- Firebase Realtime Database - Za čuvanje podataka o igračima, igrama i rezultatima
- Render - Za brzi i jednostavan deployment aplikacije

### Stilizacija
- Dark tema - Inspirisana Discord-om
- Futuristički dizajn - Sa neonskim akcentima (tirkizna, ljubičasta)
- Responsive breakpoints:
  - Desktop: >992px
  - Tablet: 768px-992px
  - Mobilni: <768px

## Struktura projekta

```
zanimljiva-geografija/
├── assets/
│   ├── css/
│   │   ├── style.css               # Glavni CSS fajl
│   │   └── bootstrap.min.css       # Bootstrap biblioteka
│   ├── js/
│   │   ├── main.js                 # Opšte funkcije
│   │   ├── firebase-config.js      # Firebase konfiguracija
│   │   ├── game.js                 # Logika igre
│   │   ├── lobby.js                # Logika lobija
│   │   ├── create-game.js          # Logika kreiranja igre
│   │   ├── flags-data.js           # Podaci o zastavama država
│   │   ├── flags-handler.js        # Funkcije za rad sa zastavama
│   │   ├── verify.js               # Logika verifikacije odgovora
│   │   ├── round-results.js        # Prikaz rezultata runde
│   │   └── final-results.js        # Prikaz konačnih rezultata
│   ├── flags/
│   │   └── [country-code].gif      # Zastave država (195 fajlova)
│   ├── sounds/
│   │   ├── countdown.mp3           # Zvuk odbrojavanja
│   │   ├── correct.mp3             # Zvuk tačnog odgovora
│   │   └── victory.mp3             # Zvuk pobede
│   └── fonts/                      # Fontovi (opciono)
├── index.html                      # Početna stranica
├── create-game.html               # Stranica za kreiranje igre
├── lobby.html                     # Stranica za čekaonicu
├── game.html                      # Stranica za igru
├── verify.html                    # Stranica za verifikaciju odgovora
├── round-results.html             # Stranica za rezultate runde
├── final-results.html             # Stranica za konačne rezultate
└── README.md                      # Dokumentacija projekta
```

## Tok igre

1. **Početna stranica:**
   - Korisnik unosi korisničko ime
   - Bira da kreira novu igru ili da se pridruži postojećoj

2. **Kreiranje igre:**
   - Podešavanje vremena po rundi (1-10 min)
   - Podešavanje broja rundi (3-10)
   - Izbor slova za isključivanje

3. **Lobi:**
   - Prikaz koda igre za pozivanje prijatelja
   - Lista igrača sa statusom spremnosti
   - Dugme "Spreman sam" za označavanje spremnosti

4. **Igra:**
   - Prikaz trenutnog slova
   - Brojač vremena
   - Forma za unos odgovora po kategorijama
   - Prikaz progresa drugih igrača

5. **Verifikacija:**
   - Prvi igrač koji završi dobija prikaz svih odgovora
   - Označavanje tačnih/netačnih odgovora
   - Računanje bodova

6. **Rezultati runde:**
   - Prikaz bodova po igraču za trenutnu rundu
   - Prikaz ukupnih bodova
   - Automatski prelazak na sledeću rundu

7. **Konačni rezultati:**
   - Podijum za najbolje igrače
   - Detaljna statistika igre
   - Mogućnost pokretanja nove igre sa istim igračima

## Postavljanje i pokretanje

### Preduslovi
- Node.js i npm (za lokalni razvoj)
- Firebase nalog (za bazu podataka)
- Render nalog (za hosting, opciono)

### Koraci za postavljanje

1. **Klonirajte repozitorij:**
   ```
   git clone https://github.com/vas-korisnicko-ime/zanimljiva-geografija.git
   cd zanimljiva-geografija
   ```

2. **Postavite Firebase:**
   - Kreirajte novi projekat na [Firebase Console](https://console.firebase.google.com/)
   - Omogućite Realtime Database i Anonymous Authentication
   - Kopirajte Firebase konfiguraciju u `assets/js/firebase-config.js` fajl

3. **Lokalno pokretanje:**
   - Koristite lokalni server (npr. Live Server u VS Code ili http-server)
   - Otvorite `index.html` u browseru

4. **Deployment na Render:**
   - Povežite GitHub repozitorij sa Render-om
   - Postavite kao Static Site
   - Konfigurišite build komandu ako je potrebno

## Firebase struktura baze

```
zanimljiva-geografija/
  ├── games/
  │   ├── [gameId]/
  │   │   ├── settings/              # Postavke igre
  │   │   ├── players/               # Igrači u igri
  │   │   └── rounds/                # Runde igre sa odgovorima
  └── users/                        # Korisnici (opciono)
```

## Prilagođavanje

- Zastave: Postavite GIF fajlove u `assets/flags/` direktorijum. Format imena fajla je `xx.gif` gde je `xx` kod države u malim slovima.
- Zvukovi: Postavite MP3 fajlove u `assets/sounds/` direktorijum.
- Stilovi: Prilagodite boje i dizajn u `assets/css/style.css` fajlu.

## Licenca

Ovaj projekat je otvorenog koda i dostupan je pod [MIT licencom](https://opensource.org/licenses/MIT).
