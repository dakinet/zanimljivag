Projekat: Zanimljiva geografija - Multiplayer turn-based igra
Tehnologija i arhitektura
Frontend

HTML5/CSS3/Vanilla JavaScript - Minimalni pristup bez framework-a
Firebase SDK - Za komunikaciju sa bazom
Responsive design - Bootstrap 5 za brzo stilizovanje i podršku za desktop i mobilne uređaje
Font Awesome - Za ikonice
Google Fonts - Za tipografiju (Roboto i Montserrat)

Backend

Firebase Authentication - Za registraciju i login korisnika
Firebase Realtime Database - Za čuvanje podataka o igračima, igrama i rezultatima
Render - Za brzi i jednostavan deployment aplikacije

Stilizacija

Dark tema - Inspirisana Discord-om
Futuristički dizajn - Sa neonskim akcentima (tirkizna, ljubičasta)
Boje:

Pozadina: #1A1A1D (tamno siva)
Primarni elementi: #121212 (skoro crna)
Akcenti: #00FFCC (neon tirkizna), #9B59B6 (ljubičasta)
Tekst: #F5F5F5 (svetla)
Dugmad: gradient od #00FFCC do #1A1A1D


Animacije - Subtle transitions za promene stanja, pulsiranje za tajmer
Responsive breakpoints:

Desktop: >992px
Tablet: 768px-992px
Mobilni: <768px



Struktura stranica i tokovi
1. Početna stranica (index.html)

Elementi:

Logo "Zanimljiva geografija" sa animacijom
Input polje za korisničko ime
Dugme "Pridruži se igri"
Dugme "Kreiraj novu igru"
Footer sa informacijama o aplikaciji


Funkcionalnosti:

Validacija korisničkog imena (min 3 karaktera, max 15)
Redirect na odgovarajuću stranicu prema izboru


Stilizacija:

Centriran sadržaj
Logo koji pulsira svetlo tirkiznom bojom
Veliki, boldovani naslovi
Input polja sa neon bordurom na focus



2. Kreiranje igre (create-game.html)

Elementi:

Forma za kreiranje igre
Slider za podešavanje vremena po rundi (1-10 min)
Slider za broj rundi (3-10)
Lista slova za isključivanje iz igre (checkbox za svako slovo)
Dugme "Kreiraj i pozovi prijatelje"
Dugme "Nazad"


Funkcionalnosti:

Generisanje jedinstvenog ID-a igre
Čuvanje postavki u Firebase
Generisanje i prikaz linka za pozivanje drugih igrača


Stilizacija:

Slajderi sa tirkiznim akcentima
Checkbox-ovi za slova u grid rasporedu
Animacija za generisanje koda igre



3. Game Lobby (lobby.html)

Elementi:

ID sobe i opcija za kopiranje
Lista prijavljenih igrača sa statusom (spreman/nije spreman)
Prikaz postavki igre (vreme po rundi, broj rundi)
Dugme "Spreman sam" (toggleable)
Indikator ukupnog broja igrača i minimalnog potrebnog broja (2)
Chat za komunikaciju (opciono)


Funkcionalnosti:

Real-time ažuriranje liste igrača
Praćenje statusa spremnosti
Automatsko pokretanje igre kad su svi spremni
Copy-to-clipboard za ID sobe


Stilizacija:

Lista igrača sa avatarima (generisani na osnovu korisničkog imena)
Status indikatori (crveno/zeleno)
Pulsiranje dugmeta "Spreman sam" kad je aktivno



4. Igra - Runda (game.html)

Elementi:

Prikaz trenutnog slova (veliko, istaknuto)
Prikaz trenutne runde (npr. "Runda 2/7")
Tajmer koji odbrojava vreme
Lista kategorija sa formom za svaku:

Zastava države (grid sa slikama zastava za odabir)
Država (text input)
Grad (text input)
Planina (text input)
Reka (text input)
Jezero (text input)
More (text input)
Biljka (text input)
Životinja (text input)
Predmet (text input)


Dugme "Potvrdi odgovore"
Indikator progresa drugih igrača


Funkcionalnosti:

Nasumično generisanje slova (A-Š, izuzev onemogućenih)
Odbrojavanje vremena
Validacija unosa (da nije prazno)
Slanje odgovora u Firebase
Praćenje ko je završio odgovaranje


Stilizacija:

Veliko centralno slovo sa svetlećim efektom
Progress bar za vreme
Kartica za svaku kategoriju
Smooth scroll između kategorija na mobilnim uređajima
Vizuelni feedback kada je odgovor unesen



5. Verifikacija odgovora (verify.html)

Elementi:

Tabela sa svim igračima u kolonama i kategorijama u redovima
Checkbox pored svakog odgovora za označavanje tačnosti
Prikaz trenutnog slova i runde
Dugme "Potvrdi i boduj"


Funkcionalnosti:

Prikaz svih odgovora od svih igrača
Mogućnost označavanja tačnih/netačnih odgovora
Automatsko računanje bodova (10 po tačnom odgovoru)
Čuvanje rezultata u Firebase


Stilizacija:

Tabela sa alternating row colors
Checkboxovi sa animacijom
Scrollable horizontalno za više igrača
Highlight za trenutnog igrača



6. Rezultati runde (round-results.html)

Elementi:

Tabela sa rezultatima runde
Prikaz bodova svakog igrača za trenutnu rundu
Prikaz ukupnih bodova
Dugme "Sledeća runda" ili "Završi igru" (ako je poslednja runda)


Funkcionalnosti:

Prikaz bodova sortirano po rezultatu
Highlight za vodećeg igrača
Automatski prelazak na sledeću rundu nakon tajmauta ili klika


Stilizacija:

Animacija za prikaz rezultata (counting up)
Zlatna/srebrna/bronzana oznaka za top 3 igrača
Konfeti animacija za vodećeg



7. Konačni rezultati (final-results.html)

Elementi:

Podijum za top 3 igrača
Kompletna tabela rezultata
Detaljan prikaz bodova po rundama
Dugme "Nova igra"
Dugme "Podeli rezultat" (za društvene mreže)


Funkcionalnosti:

Prikaz konačnih rezultata
Opcija za pokretanje nove igre sa istim igračima
Čuvanje rezultata u Firebase za istoriju


Stilizacija:

Animirani podijum za pobednike
Konfeti za pobednika
Trofej ikonica za prvo mesto
Detaljni grafikon sa rezultatima po rundama



Struktura Firebase baze
Authentication

Koristićemo anonimnu autentifikaciju za jednostavnost

Realtime Database
Copyzanimljiva-geografija/
  ├── games/
  │   ├── [gameId]/
  │   │   ├── settings/
  │   │   │   ├── roundTime: number (minutes)
  │   │   │   ├── totalRounds: number
  │   │   │   ├── disabledLetters: array
  │   │   │   ├── status: string (lobby, active, finished)
  │   │   │   └── createdAt: timestamp
  │   │   ├── players/
  │   │   │   ├── [playerId]/
  │   │   │   │   ├── username: string
  │   │   │   │   ├── isReady: boolean
  │   │   │   │   ├── isFinished: boolean
  │   │   │   │   ├── joinedAt: timestamp
  │   │   │   │   └── totalScore: number
  │   │   ├── rounds/
  │   │   │   ├── [roundId]/
  │   │   │   │   ├── letter: string
  │   │   │   │   ├── startedAt: timestamp
  │   │   │   │   ├── finishedAt: timestamp
  │   │   │   │   ├── answers/
  │   │   │   │   │   ├── [playerId]/
  │   │   │   │   │   │   ├── flag: string
  │   │   │   │   │   │   ├── country: string
  │   │   │   │   │   │   ├── city: string
  │   │   │   │   │   │   ├── mountain: string
  │   │   │   │   │   │   ├── river: string
  │   │   │   │   │   │   ├── lake: string
  │   │   │   │   │   │   ├── sea: string
  │   │   │   │   │   │   ├── plant: string
  │   │   │   │   │   │   ├── animal: string
  │   │   │   │   │   │   ├── object: string
  │   │   │   │   │   │   ├── isFinished: boolean
  │   │   │   │   │   │   └── finishedAt: timestamp
  │   │   │   │   ├── verification/
  │   │   │   │   │   ├── verifiedBy: string (playerId)
  │   │   │   │   │   ├── [playerId]/
  │   │   │   │   │   │   ├── flag: boolean
  │   │   │   │   │   │   ├── country: boolean
  │   │   │   │   │   │   └── ...
  │   │   │   │   ├── scores/
  │   │   │   │   │   ├── [playerId]: number
  │   │   │   │   │   └── ...
  └── users/
      ├── [userId]/
          ├── username: string
          ├── gamesPlayed: number
          ├── totalScore: number
          └── gameHistory: array
Tok igre (detaljan)

Registracija/Pristup:

Korisnik unosi korisničko ime
Bira da kreira igru ili da se pridruži postojećoj
Ako kreira, podešava vreme runde i broj rundi
Ako se pridružuje, unosi kod igre


Game Lobby:

Igrači vide ko je sve pristupio igri
Kreator igre vidi dodatne opcije (mogućnost promene postavki)
Svaki igrač označava da je spreman
Kada su svi igrači spremni (min 2), pojavljuje se odbrojavanje od 5 sekundi


Početak runde:

Generiše se slovo (A-Š)
Prikazuje se ekran sa kategorijama i formom
Počinje odbrojavanje vremena


Tokom runde:

Igrači popunjavaju odgovore za svaku kategoriju
Za zastavu biraju između ponuđenih slika
Za ostale kategorije unose tekst
Mogu potvrditi odgovore pre isteka vremena
Vide indikator koliko je drugih igrača završilo


Kraj runde:

Kada svi završe ili istekne vreme
Prvi igrač (ili onaj ko je prvi završio) dobija ekran za verifikaciju
Označava tačne i netačne odgovore za sve igrače
Potvrđuje verifikaciju


Prikaz rezultata runde:

Svim igračima se prikazuju rezultati sa bodovima
Vidi se trenutni poredak
Nakon 10 sekundi ili klikom na dugme prelazi se na sledeću rundu


Nova runda:

Generiše se novo slovo (različito od prethodnih)
Proces se ponavlja


Završetak igre:

Nakon što se odigra predefinisani broj rundi
Prikazuje se konačni poredak i detaljna statistika
Opcija za pokretanje nove igre sa istim igračima



Responzivan dizajn - Specifičnosti
Desktop (>992px)

Prikaz svih kategorija istovremeno u grid layoutu
Chat prozor sa strane (opciono)
Horizontalna tabela za rezultate
Veće slike zastava

Tablet (768px-992px)

Kategorije organizovane u dve kolone
Skalirani elementi
Swipeable tabela rezultata

Mobilni (<768px)

Jedna kategorija vidljiva odjednom
Swipe/scroll za navigaciju između kategorija
Vertikalni prikaz rezultata
Tab navigacija između različitih sekcija igre
Prilagođeni tajmer koji zauzima manje prostora

Dodatne funkcionalnosti
Offline Mode

Keširanje podataka za slučaj prekida interneta
Sinhronizacija kada veza bude ponovo uspostavljena

Zvučni efekti

Zvuk za završetak odbrojavanja
Zvuk za tačan/netačan odgovor
Fanfare za pobednika

Notifikacije

Browser notifikacije kada je na redu novi igrač
Zvučno obaveštenje kada je ostalo malo vremena

Analitika

Praćenje najčešćih odgovora
Statistika po slovima i kategorijama

Plan implementacije

Faza 1: Osnovna struktura

Kreiranje HTML/CSS za sve stranice
Postavljanje Firebase projekta i Render-a za deployment
Implementacija osnovnog UI-a


Faza 2: Game Lobby

Registracija/login funkcionalnost
Kreiranje i pridruživanje igrama
Praćenje statusa igrača


Faza 3: Mehanika igre

Implementacija generisanja slova
Tajmer funkcionalnost
Forma za odgovore


Faza 4: Verifikacija i bodovanje

Sistem za verifikaciju odgovora
Računanje bodova
Prikaz rezultata


Faza 5: Finalni detalji

Responzivan dizajn
Optimizacija za mobilne uređaje
Testiranje i debugging
Deployment na Render platformu



Plan za implementaciju prikaza zastava
1. Koncept prikaza zastava

Prikaz svih zastava odjednom:

Svih 195 zastava prikazano u grid formatu
Igrač treba da pronađe i odabere zastavu zemlje koja počinje na zadato slovo
Nema filtriranja - test znanja je u prepoznavanju i pronalaženju prave zastave



2. Organizacija i učitavanje zastava

Struktura fajlova:

Korišćenje postojećih 195 GIF fajlova (format: xx-flag.gif)
Zadržavanje postojećih imena fajlova
Organizacija u folder /assets/flags/



3. UI implementacija

Grid raspored:

Responzivni grid layout za prikaz zastava
Desktop: 10-12 zastava po redu
Tablet: 6-8 zastava po redu
Mobilni: 3-4 zastave po redu



4. Interakcija sa zastavama

Selekcija zastave:

Klik/tap na zastavu je selektuje
Jasna vizuelna indikacija selektovane zastave
Prikaz imena zemlje koja je selektovana



5. Performanse i optimizacija

Optimizacija učitavanja:

Lazy loading za zastave koje nisu u početnom viewport-u
Optimalno učitavanje na mobilnim uređajima



6. Deployment na Render

Konfiguracija Render-a za statički sajt
Povezivanje sa GitHub/GitLab repozitorijumom
Automatski deployment pri pushovima u repo
Korišćenje globalnog CDN-a za brzo učitavanje slika
