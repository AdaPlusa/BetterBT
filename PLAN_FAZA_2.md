Faza 2: Frontend (React) - Budujemy Interfejs (Wersja Bootstrap)

Cel: Stworzenie strony internetowej, na której można się zalogować, klikać po słownikach i (docelowo) złożyć wniosek o delegację.

🛠 KROK 0: Instalacja i Start 

W tym kroku stworzymy "pustą" aplikację React obok Twojego folderu backend.

Terminal:

Otwórz terminal w głównym folderze projektu (C:\BetterBT).

Nie wchodź do backend! Masz być w głównym folderze.

Komenda startowa (Vite):

Wpisz: npm create vite@latest frontend -- --template react

To stworzy folder frontend z gotowym Reactem.

Instalacja bibliotek:

Wejdź do folderu: cd frontend

Zainstaluj zależności: npm install

Zainstaluj Router (nawigacja), Axios (zapytania) i Bootstrapa (wygląd):

npm install react-router-dom axios bootstrap


Podłączenie Bootstrapa (WAŻNE!):

Otwórz plik src/main.jsx (lub src/index.js w zależności od wersji).

Na samej górze dodaj linię:

import 'bootstrap/dist/css/bootstrap.min.css';


Bez tego style nie będą działać!

Pierwsze uruchomienie:

Wpisz: npm run dev

Kliknij w link w terminalu (zazwyczaj http://localhost:5173).

Jeśli widzisz logo Reacta – działa!

🔌 KROK 1: Konfiguracja połączenia z Backendem 

Musimy nauczyć Reacta, gdzie jest Twój serwer (localhost:3000) i jak wysyłać Token.

W folderze frontend/src stwórz nowy folder services.

W środku stwórz plik api.js.

Wklej ten kod (Twój "most" do backendu):

import axios from 'axios';

// Tworzymy instancję axios z adresem Twojego serwera
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatyczne dodawanie Tokena do każdego zapytania (Interceptor)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


🧭 KROK 2: Routing i Puste Strony

Stworzymy szkielet aplikacji z nawigacją.

W folderze src stwórz folder pages.

Stwórz w nim 4 puste pliki (wpisz w każdym proste <h1>Hello</h1>):

LoginPage.jsx

RegisterPage.jsx

DashboardPage.jsx (Strona główna po zalogowaniu)

CountriesPage.jsx (Test słowników)

Edytuj App.jsx i ustaw nawigację:

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CountriesPage from './pages/CountriesPage';

// Prosta funkcja sprawdzająca czy user jest zalogowany
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* Pasek nawigacji (Navbar) widoczny zawsze - możesz go potem ukryć na ekranie logowania */}
      <nav className="navbar navbar-dark bg-primary px-3 mb-3">
        <span className="navbar-brand mb-0 h1">Better BT</span>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Trasy chronione */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/countries" element={
            <ProtectedRoute>
              <CountriesPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


🔐 KROK 3: Logowanie i Rejestracja 

Tworzymy formularz w stylu Bootstrap.

Zadanie:

W LoginPage.jsx stwórz formularz HTML.

Użyj klas Bootstrapa: form-control (dla inputów), btn btn-primary (dla przycisku).

Przykład wyglądu:

<div className="card p-4" style={{ maxWidth: '400px', margin: 'auto' }}>
  <h2 className="text-center mb-3">Logowanie</h2>
  <input className="form-control mb-2" placeholder="Email" />
  <input className="form-control mb-3" type="password" placeholder="Hasło" />
  <button className="btn btn-primary w-100">Zaloguj się</button>
</div>


Podepnij logikę:

Przy kliknięciu wywołaj api.post('/auth/login', { email, password }).

Zapisz token w localStorage.

Przekieruj (Maps('/')).

Pamiętaj: Backend musi działać w drugim terminalu!

📋 KROK 4: Słowniki - Masowa Produkcja 

Nabijamy liczbę widoków używając klasycznych tabel.

Strategia:

Zrób porządnie CountriesPage.jsx:

Użyj useEffect, żeby pobrać dane (api.get('/countries')).

Wyświetl je w tabeli HTML:

<table className="table table-striped table-hover">
  <thead className="table-dark">
    <tr><th>ID</th><th>Nazwa</th><th>Kod</th></tr>
  </thead>
  <tbody>
    {/* Tu zrób mapowanie po danych */}
  </tbody>
</table>


Kopiuj-Wklej:

Skopiuj plik -> Zmień na CitiesPage.jsx (podmień endpoint na /cities).

Skopiuj -> HotelsPage.jsx itd.

🧙‍♂️ KROK 5: Wizard Delegacji (Kreator) 

Bootstrap nie ma gotowego "Steppera", więc zrobimy go sami.

Stwórz komponent TripWizard.jsx.

Użyj zmiennej stanu step (np. const [step, setStep] = useState(1)).

Wyświetlaj inny formularz w zależności od kroku:

{step === 1 && <KrokPierwszy />}

{step === 2 && <KrokDrugi />}

Na dole daj przyciski nawigacji:

<div className="d-flex justify-content-between mt-3">
  <button className="btn btn-secondary" onClick={prevStep} disabled={step === 1}>Wstecz</button>
  <button className="btn btn-success" onClick={nextStep}>Dalej</button>
</div>


Na górze możesz dodać prosty pasek postępu:

<div className="progress mb-4">
  <div className="progress-bar" style={{ width: `${step * 25}%` }}>Krok {step}/4</div>
</div>


💡 Porady dla Studenta

Dwa terminale:

Terminal 1 (Backend): npx nodemon index.js

Terminal 2 (Frontend): npm run dev

Dokumentacja: Korzystaj ze strony getbootstrap.com. Szukaj w sekcji "Docs" -> "Components". Kopiuj gotowe kody HTML (Cards, Tables, Forms) i zamieniaj tylko class="..." na className="..." (bo to React).

Debugowanie: Jak coś nie działa, wciśnij F12 -> Console.