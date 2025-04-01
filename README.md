Projekat: Zanimljiva geografija - Multiplayer turn-based igra
Tehnologija i arhitektura
Frontend
    • HTML5/CSS3/Vanilla JavaScript - Minimalni pristup bez framework-a 
    • Firebase SDK - Za komunikaciju sa bazom 
    • Responsive design - Bootstrap 5 za brzo stilizovanje i podršku za desktop i mobilne uređaje 
    • Font Awesome - Za ikonice 
    • Google Fonts - Za tipografiju (Roboto i Montserrat) 
Backend
    • Firebase Authentication - Za registraciju i login korisnika 
    • Firebase Realtime Database - Za čuvanje podataka o igračima, igrama i rezultatima 
    • Firebase Hosting - Za deploy aplikacije 
Stilizacija
    • Dark tema - Inspirisana Discord-om 
    • Futuristički dizajn - Sa neonskim akcentima (tirkizna, ljubičasta) 
    • Boje: 
        ◦ Pozadina: #1A1A1D (tamno siva) 
        ◦ Primarni elementi: #121212 (skoro crna) 
        ◦ Akcenti: #00FFCC (neon tirkizna), #9B59B6 (ljubičasta) 
        ◦ Tekst: #F5F5F5 (svetla) 
        ◦ Dugmad: gradient od #00FFCC do #1A1A1D 
    • Animacije - Subtle transitions za promene stanja, pulsiranje za tajmer 
    • Responsive breakpoints: 
        ◦ Desktop: >992px 
        ◦ Tablet: 768px-992px 
        ◦ Mobilni: <768px 
Struktura stranica i tokovi
1. Početna stranica (index.html)
    • Elementi: 
        ◦ Logo "Zanimljiva geografija" sa animacijom 
        ◦ Input polje za korisničko ime 
        ◦ Dugme "Pridruži se igri" 
        ◦ Dugme "Kreiraj novu igru" 
        ◦ Footer sa informacijama o aplikaciji 
    • Funkcionalnosti: 
        ◦ Validacija korisničkog imena (min 3 karaktera, max 15) 
        ◦ Redirect na odgovarajuću stranicu prema izboru 
    • Stilizacija: 
        ◦ Centriran sadržaj 
        ◦ Logo koji pulsira svetlo tirkiznom bojom 
        ◦ Veliki, boldovani naslovi 
        ◦ Input polja sa neon bordurom na focus 
2. Kreiranje igre (create-game.html)
    • Elementi: 
        ◦ Forma za kreiranje igre 
        ◦ Slider za podešavanje vremena po rundi (1-10 min) 
        ◦ Slider za broj rundi (3-10) 
        ◦ Lista slova za isključivanje iz igre (checkbox za svako slovo) 
        ◦ Dugme "Kreiraj i pozovi prijatelje" 
        ◦ Dugme "Nazad" 
    • Funkcionalnosti: 
        ◦ Generisanje jedinstvenog ID-a igre 
        ◦ Čuvanje postavki u Firebase 
        ◦ Generisanje i prikaz linka za pozivanje drugih igrača 
    • Stilizacija: 
        ◦ Slajderi sa tirkiznim akcentima 
        ◦ Checkbox-ovi za slova u grid rasporedu 
        ◦ Animacija za generisanje koda igre 
3. Game Lobby (lobby.html)
    • Elementi: 
        ◦ ID sobe i opcija za kopiranje 
        ◦ Lista prijavljenih igrača sa statusom (spreman/nije spreman) 
        ◦ Prikaz postavki igre (vreme po rundi, broj rundi) 
        ◦ Dugme "Spreman sam" (toggleable) 
        ◦ Indikator ukupnog broja igrača i minimalnog potrebnog broja (2) 
        ◦ Chat za komunikaciju (opciono) 
    • Funkcionalnosti: 
        ◦ Real-time ažuriranje liste igrača 
        ◦ Praćenje statusa spremnosti 
        ◦ Automatsko pokretanje igre kad su svi spremni 
        ◦ Copy-to-clipboard za ID sobe 
    • Stilizacija: 
        ◦ Lista igrača sa avatarima (generisani na osnovu korisničkog imena) 
        ◦ Status indikatori (crveno/zeleno) 
        ◦ Pulsiranje dugmeta "Spreman sam" kad je aktivno 
4. Igra - Runda (game.html)
    • Elementi: 
        ◦ Prikaz trenutnog slova (veliko, istaknuto) 
        ◦ Prikaz trenutne runde (npr. "Runda 2/7") 
        ◦ Tajmer koji odbrojava vreme 
        ◦ Lista kategorija sa formom za svaku: 
            1. Zastava države (grid sa slikama zastava za odabir) 
            2. Država (text input) 
            3. Grad (text input) 
            4. Planina (text input) 
            5. Reka (text input) 
            6. Jezero (text input) 
            7. More (text input) 
            8. Biljka (text input) 
            9. Životinja (text input) 
            10. Predmet (text input) 
        ◦ Dugme "Potvrdi odgovore" 
        ◦ Indikator progresa drugih igrača 
    • Funkcionalnosti: 
        ◦ Nasumično generisanje slova (A-Š, izuzev onemogućenih) 
        ◦ Odbrojavanje vremena 
        ◦ Validacija unosa (da nije prazno) 
        ◦ Slanje odgovora u Firebase 
        ◦ Praćenje ko je završio odgovaranje 
    • Stilizacija: 
        ◦ Veliko centralno slovo sa svetlećim efektom 
        ◦ Progress bar za vreme 
        ◦ Kartica za svaku kategoriju 
        ◦ Smooth scroll između kategorija na mobilnim uređajima 
        ◦ Vizuelni feedback kada je odgovor unesen 
5. Verifikacija odgovora (verify.html)
    • Elementi: 
        ◦ Tabela sa svim igračima u kolonama i kategorijama u redovima 
        ◦ Checkbox pored svakog odgovora za označavanje tačnosti 
        ◦ Prikaz trenutnog slova i runde 
        ◦ Dugme "Potvrdi i boduj" 
    • Funkcionalnosti: 
        ◦ Prikaz svih odgovora od svih igrača 
        ◦ Mogućnost označavanja tačnih/netačnih odgovora 
        ◦ Automatsko računanje bodova (10 po tačnom odgovoru) 
        ◦ Čuvanje rezultata u Firebase 
    • Stilizacija: 
        ◦ Tabela sa alternating row colors 
        ◦ Checkboxovi sa animacijom 
        ◦ Scrollable horizontalno za više igrača 
        ◦ Highlight za trenutnog igrača 
6. Rezultati runde (round-results.html)
    • Elementi: 
        ◦ Tabela sa rezultatima runde 
        ◦ Prikaz bodova svakog igrača za trenutnu rundu 
        ◦ Prikaz ukupnih bodova 
        ◦ Dugme "Sledeća runda" ili "Završi igru" (ako je poslednja runda) 
    • Funkcionalnosti: 
        ◦ Prikaz bodova sortirano po rezultatu 
        ◦ Highlight za vodećeg igrača 
        ◦ Automatski prelazak na sledeću rundu nakon tajmauta ili klika 
    • Stilizacija: 
        ◦ Animacija za prikaz rezultata (counting up) 
        ◦ Zlatna/srebrna/bronzana oznaka za top 3 igrača 
        ◦ Konfeti animacija za vodećeg 
7. Konačni rezultati (final-results.html)
    • Elementi: 
        ◦ Podijum za top 3 igrača 
        ◦ Kompletna tabela rezultata 
        ◦ Detaljan prikaz bodova po rundama 
        ◦ Dugme "Nova igra" 
        ◦ Dugme "Podeli rezultat" (za društvene mreže) 
    • Funkcionalnosti: 
        ◦ Prikaz konačnih rezultata 
        ◦ Opcija za pokretanje nove igre sa istim igračima 
        ◦ Čuvanje rezultata u Firebase za istoriju 
    • Stilizacija: 
        ◦ Animirani podijum za pobednike 
        ◦ Konfeti za pobednika 
        ◦ Trofej ikonica za prvo mesto 
        ◦ Detaljni grafikon sa rezultatima po rundama 
Struktura Firebase baze
Authentication
    • Koristićemo anonimnu autentifikaciju za jednostavnost 
Realtime Database
Copy
zanimljiva-geografija/
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
    1. Registracija/Pristup: 
        ◦ Korisnik unosi korisničko ime 
        ◦ Bira da kreira igru ili da se pridruži postojećoj 
        ◦ Ako kreira, podešava vreme runde i broj rundi 
        ◦ Ako se pridružuje, unosi kod igre 
    2. Game Lobby: 
        ◦ Igrači vide ko je sve pristupio igri 
        ◦ Kreator igre vidi dodatne opcije (mogućnost promene postavki) 
        ◦ Svaki igrač označava da je spreman 
        ◦ Kada su svi igrači spremni (min 2), pojavljuje se odbrojavanje od 5 sekundi 
    3. Početak runde: 
        ◦ Generiše se slovo (A-Š) 
        ◦ Prikazuje se ekran sa kategorijama i formom 
        ◦ Počinje odbrojavanje vremena 
    4. Tokom runde: 
        ◦ Igrači popunjavaju odgovore za svaku kategoriju 
        ◦ Za zastavu biraju između ponuđenih slika 
        ◦ Za ostale kategorije unose tekst 
        ◦ Mogu potvrditi odgovore pre isteka vremena 
        ◦ Vide indikator koliko je drugih igrača završilo 
    5. Kraj runde: 
        ◦ Kada svi završe ili istekne vreme 
        ◦ Prvi igrač (ili onaj ko je prvi završio) dobija ekran za verifikaciju 
        ◦ Označava tačne i netačne odgovore za sve igrače 
        ◦ Potvrđuje verifikaciju 
    6. Prikaz rezultata runde: 
        ◦ Svim igračima se prikazuju rezultati sa bodovima 
        ◦ Vidi se trenutni poredak 
        ◦ Nakon 10 sekundi ili klikom na dugme prelazi se na sledeću rundu 
    7. Nova runda: 
        ◦ Generiše se novo slovo (različito od prethodnih) 
        ◦ Proces se ponavlja 
    8. Završetak igre: 
        ◦ Nakon što se odigra predefinisani broj rundi 
        ◦ Prikazuje se konačni poredak i detaljna statistika 
        ◦ Opcija za pokretanje nove igre sa istim igračima 
Responzivan dizajn - Specifičnosti
Desktop (>992px)
    • Prikaz svih kategorija istovremeno u grid layoutu 
    • Chat prozor sa strane (opciono) 
    • Horizontalna tabela za rezultate 
    • Veće slike zastava 
Tablet (768px-992px)
    • Kategorije organizovane u dve kolone 
    • Skalirani elementi 
    • Swipeable tabela rezultata 
Mobilni (<768px)
    • Jedna kategorija vidljiva odjednom 
    • Swipe/scroll za navigaciju između kategorija 
    • Vertikalni prikaz rezultata 
    • Tab navigacija između različitih sekcija igre 
    • Prilagođeni tajmer koji zauzima manje prostora 
Dodatne funkcionalnosti
Offline Mode
    • Keširanje podataka za slučaj prekida interneta 
    • Sinhronizacija kada veza bude ponovo uspostavljena 
Zvučni efekti
    • Zvuk za završetak odbrojavanja 
    • Zvuk za tačan/netačan odgovor 
    • Fanfare za pobednika 
Notifikacije
    • Browser notifikacije kada je na redu novi igrač 
    • Zvučno obaveštenje kada je ostalo malo vremena 
Analitika
    • Praćenje najčešćih odgovora 
    • Statistika po slovima i kategorijama 
Plan implementacije
    1. Faza 1: Osnovna struktura 
        ◦ Kreiranje HTML/CSS za sve stranice 
        ◦ Postavljanje Firebase projekta 
        ◦ Implementacija osnovnog UI-a 
    2. Faza 2: Game Lobby 
        ◦ Registracija/login funkcionalnost 
        ◦ Kreiranje i pridruživanje igrama 
        ◦ Praćenje statusa igrača 
    3. Faza 3: Mehanika igre 
        ◦ Implementacija generisanja slova 
        ◦ Tajmer funkcionalnost 
        ◦ Forma za odgovore 
    4. Faza 4: Verifikacija i bodovanje 
        ◦ Sistem za verifikaciju odgovora 
        ◦ Računanje bodova 
        ◦ Prikaz rezultata 
    5. Faza 5: Finalni detalji 
        ◦ Responzivan dizajn 
        ◦ Optimizacija za mobilne uređaje 
        ◦ Testiranje i debugging



Plan za implementaciju prikaza zastava u igri "Zanimljiva geografija"
1. Koncept prikaza zastava
    • Prikaz svih zastava odjednom: 
        ◦ Svih 195 zastava prikazano u grid formatu 
        ◦ Igrač treba da pronađe i odabere zastavu zemlje koja počinje na zadato slovo 
        ◦ Nema filtriranja - test znanja je u prepoznavanju i pronalaženju prave zastave 
    • Format zadatka: 
        ◦ Prikazano slovo runde (npr. "A") 
        ◦ Instrukcija: "Pronađi zastavu zemlje koja počinje na slovo A" 
        ◦ Grid sa svim zastavama 
        ◦ Potvrda izbora 
2. Organizacija i učitavanje zastava
    • Struktura fajlova: 
        ◦ Korišćenje postojećih 195 GIF fajlova (format: xx-flag.gif) 
        ◦ Zadržavanje postojećih imena fajlova 
        ◦ Organizacija u folder /assets/flags/ 
    • Mapiranje podataka: 
        ◦ JSON fajl sa mapiranjem dvoslovnih kodova i imena zemalja: 
      json
      Copy
      {
        "us": {
          "name": "Sjedinjene Američke Države",
          "startLetter": "S"
        },
        "uk": {
          "name": "Ujedinjeno Kraljevstvo",
          "startLetter": "U"
        },
        "fr": {
          "name": "Francuska",
          "startLetter": "F"
        }
        // ... itd za svih 195 zemalja
      }
3. UI implementacija
    • Grid raspored: 
        ◦ Responzivni grid layout za prikaz zastava 
        ◦ Desktop: 10-12 zastava po redu 
        ◦ Tablet: 6-8 zastava po redu 
        ◦ Mobilni: 3-4 zastave po redu 
    • Struktura HTML-a: 
      html
      Copy
      <div class="question-container">
        <h3 class="question-text">Pronađi zastavu zemlje koja počinje na slovo <span class="current-letter">A</span></h3>
        
        <div class="flags-container">
          <div class="flags-grid">
            <!-- 195 zastava dinamički generisano -->
            <div class="flag-item" data-country-code="af" data-country-name="Avganistan">
              <img src="assets/flags/af-flag.gif" alt="Zastava">
            </div>
            <!-- ... ostale zastave ... -->
          </div>
        </div>
        
        <div class="selection-info">
          <p>Izabrana zemlja: <span id="selected-country">Nijedna</span></p>
          <button id="confirm-selection" class="action-button">Potvrdi izbor</button>
        </div>
      </div>
4. Interakcija sa zastavama
    • Selekcija zastave: 
        ◦ Klik/tap na zastavu je selektuje 
        ◦ Jasna vizuelna indikacija selektovane zastave 
        ◦ Prikaz imena zemlje koja je selektovana 
    • Potvrda izbora: 
        ◦ Dugme za potvrdu postaje aktivno nakon selekcije 
        ◦ Nakon potvrde, validacija da li izabrana zemlja počinje na traženo slovo 
        ◦ Feedback o tačnosti izbora 
    • JavaScript logika za interakciju: 
      javascript
      Copy
      // Primer logike za selekciju zastave
      document.querySelectorAll('.flag-item').forEach(flag => {
        flag.addEventListener('click', () => {
          // Ukloni prethodnu selekciju
          document.querySelector('.flag-item.selected')?.classList.remove('selected');
          
          // Selektuj novu zastavu
          flag.classList.add('selected');
          
          // Prikaži ime zemlje
          document.getElementById('selected-country').textContent = flag.dataset.countryName;
          
          // Aktiviraj dugme za potvrdu
          document.getElementById('confirm-selection').disabled = false;
        });
      });
5. Responzivan dizajn i optimizacija
    • Responzivan grid layout: 
      css
      Copy
      .flags-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 10px;
        padding: 15px;
      }
      
      @media (max-width: 1200px) {
        .flags-grid {
          grid-template-columns: repeat(10, 1fr);
        }
      }
      
      @media (max-width: 992px) {
        .flags-grid {
          grid-template-columns: repeat(8, 1fr);
        }
      }
      
      @media (max-width: 768px) {
        .flags-grid {
          grid-template-columns: repeat(6, 1fr);
        }
      }
      
      @media (max-width: 576px) {
        .flags-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
      }
      
      @media (max-width: 400px) {
        .flags-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    • Optimizacija za mobilne uređaje: 
        ◦ Implementacija "virtualnog" scrollable grida (učitavanje samo vidljivih zastava) 
        ◦ Manje dimenzije zastava na mobilnim uređajima 
        ◦ Touch-friendly veličina za laku selekciju 
6. Performanse i optimizacija
    • Optimizacija učitavanja: 
        ◦ Lazy loading za zastave koje nisu u početnom viewport-u 
        ◦ Optimalno učitavanje na mobilnim uređajima 
    • Upravljanje memorijom: 
        ◦ Efikasno upravljanje DOM elementima za bolju performansu 
        ◦ Optimizacija event listenera 
    • Optimizacija slika: 
        ◦ Proveriti veličine GIF fajlova 
        ◦ Razmotriti opcije za progresivno učitavanje 
7. Vizuelni stil i UX
    • Stilizacija zastava: 
      css
      Copy
      .flag-item {
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 1px solid #333;
        aspect-ratio: 3/2; /* održava proporcije zastave */
      }
      
      .flag-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      
      .flag-item:hover {
        transform: scale(1.05);
        box-shadow: 0 0 8px rgba(0, 255, 204, 0.4);
        z-index: 5;
      }
      
      .flag-item.selected {
        border: 2px solid #00FFCC;
        transform: scale(1.08);
        box-shadow: 0 0 15px rgba(0, 255, 204, 0.7);
        z-index: 10;
      }
    • Feedback za igrača: 
        ◦ Vizuelna indikacija selektovane zastave 
        ◦ Feedback o tačnosti nakon potvrde (zeleni/crveni okvir) 
        ◦ Informacija o tačnom odgovoru ako je izbor netačan
