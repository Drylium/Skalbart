Skalbart – Bokningssystem
Om projektet

Skalbart är ett bokningssystem där jag har byggt ett REST API med Node.js, Express och PostgreSQL. Tanken är att det ska gå att skapa, hämta, uppdatera och ta bort bokningar. Projektet är grunden för en större applikation som jag senare vill bygga vidare på med en frontend.

Jag använder Docker för att köra applikationen och databasen. För att kunna hantera flera instanser av API:et har jag även lagt till Nginx som lastbalanserare. Den fördelar inkommande anrop mellan tre API-instanser.

Tekniker jag använder
Node.js och Express för att bygga REST API:et.
PostgreSQL för att spara bokningar i en databas.
Docker och Docker Compose för att starta och hantera applikationens olika delar.
Nginx för att fördela trafiken mellan tre API-instanser.
Bruno för att testa API:ets endpoints.
Artillery för att göra enklare belastningstester.
Komma igång

För att köra projektet behöver du ha Node.js, Docker Desktop och Git installerat. Jag använder även Bruno för att testa API:et.

1. Hämta projektet

Klona repot från GitHub och gå till servermappen:

bash
git clone <DIN-GITHUB-REPO-URL>
cd Skalbart/server


Byt ut <DIN-GITHUB-REPO-URL> mot adressen till ditt eget repository.

Om du redan har projektet på datorn kan du öppna terminalen direkt i mappen server.

2. Installera paketen

Kör följande kommando för att installera de paket som projektet behöver:

bash
npm install

3. Ställ in miljövariabler

Skapa en .env-fil genom att kopiera .env.example.

I Windows PowerShell använder du:

powershell
Copy-Item .env.example .env


På macOS eller Linux använder du:

bash
cp .env.example .env


Öppna sedan .env och ange ett eget lösenord för databasen. Filen innehåller inställningar för bland annat port, databas och användarnamn.

Jag har valt att använda miljövariabler så att inställningar kan ändras utan att jag behöver ändra i själva koden.

Den riktiga .env-filen ska inte laddas upp till GitHub eftersom den innehåller känsliga uppgifter.

4. Starta applikationen

Kontrollera att Docker Desktop är igång. Kör sedan följande kommando i server-mappen:

bash
docker compose up --build -d


Docker bygger applikationen och startar de tjänster som behövs.

Projektet består av tre API-instanser, en Nginx-lastbalanserare och en PostgreSQL-databas. Nginx tar emot anropen och skickar dem vidare till någon av API-instanserna.

För att kontrollera att allt har startat kan du köra:

bash
docker compose ps


Om något inte fungerar kan du se loggarna med:

bash
docker compose logs -f


När allt fungerar nås API:et via:

http://localhost:8080

API:ets endpoints

Jag har byggt följande endpoints för att hantera bokningar:

Metod	Endpoint	Vad den gör
GET	/bookings	Hämtar alla bokningar
GET	/bookings/:id	Hämtar en specifik bokning
POST	/bookings	Skapar en ny bokning
PUT	/bookings/:id	Uppdaterar en befintlig bokning
DELETE	/bookings/:id	Tar bort en bokning
GET	/instance	Visar vilken API-instans som svarar

API:et använder lämpliga HTTP-statuskoder, till exempel 200 OK vid lyckade hämtningar, 201 Created när en bokning skapas och 404 Not Found när en bokning inte finns.

En bokning innehåller namn, e-postadress, datum och tid, antal personer samt status. Statusen kan vara PENDING, CONFIRMED eller CANCELLED.

Testa API:et med Bruno

Jag använder Bruno för att kontrollera att alla endpoints fungerar.

Öppna Bruno och skapa en collection för Skalbart. Lägg till en miljövariabel som heter baseUrl med värdet:

text
http://localhost:8080


Då kan jag använda {{baseUrl}} i mina requests.

Jag testar bland annat att:

Hämta alla bokningar.
Skapa en ny bokning.
Hämta bokningen med dess ID.
Uppdatera bokningen.
Ta bort bokningen.
Kontrollera vilken instans som svarar via /instance.

Jag testar även att API:et ger rimliga felmeddelanden när jag skickar ogiltiga uppgifter eller försöker hämta en bokning som inte finns.

Lastbalansering med Nginx

Jag har lagt till Nginx för att kunna köra tre instanser av samma API samtidigt. Nginx fördelar inkommande anrop mellan instanserna api1, api2 och api3.

För att se vilken instans som hanterar ett anrop använder jag:

text
GET http://localhost:8080/instance


Varje instans har ett eget namn som styrs av en miljövariabel. Det gör det enklare att kontrollera att lastbalanseringen fungerar.

Jag kan också stoppa en av instanserna och testa om Nginx kan fortsätta skicka anrop till de andra.

Databasen och sparad data

Alla tre API-instanser använder samma PostgreSQL-databas. Det betyder att bokningar som skapas via en instans också kan hämtas via de andra.

Jag använder en Docker-volym för databasen så att bokningarna finns kvar även när containrarna startas om.

För att kontrollera att datan sparas permanent kan jag skapa en bokning, starta om tjänsterna och sedan hämta bokningarna igen.

Jag kan även kontrollera innehållet direkt i databasen med:

bash
docker compose exec postgres psql -U skalbart -d skalbart


Därefter kör jag:

sql
SELECT * FROM bookings;


För att avsluta PostgreSQL-terminalen skriver jag \q.

Belastningstester med Artillery

Jag använder Artillery för att göra enklare belastningstester mot API:et.

Testerna kan köras med:

bash
npm run test:load


Det hjälper mig att undersöka hur API:et svarar när flera anrop skickas under en kortare period.

Stoppa applikationen

När jag vill stoppa tjänsterna kör jag:

bash
docker compose down


Om jag vill starta dem igen använder jag:

bash
docker compose up -d


Databasen sparas i Docker-volymen och bokningarna finns kvar efter en vanlig omstart. Jag undviker därför docker compose down -v, eftersom det kommandot även tar bort databasvolymen.

Fortsatt utveckling

Det här projektet är grunden till ett större bokningssystem. Nästa steg är att bygga vidare med en frontend i en separat mapp och utveckla fler funktioner.

Jag vill också kunna använda projektet för att lära mig mer om hur REST API:er, databaser, Docker och lastbalansering fungerar tillsammans.