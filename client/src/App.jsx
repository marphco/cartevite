import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import MarketingLanding from "./pages/MarketingLanding.jsx";
import NewEvent from "./pages/NewEvent";
import TemplateCatalog from "./pages/TemplateCatalog";
import EventPublic from "./pages/EventPublic";
import EventEditor from "./pages/EventEditor";
import EventRsvps from "./pages/EventRsvps.jsx";
import EventInvites from "./pages/EventInvites.jsx";
import MobileImport from "./pages/MobileImport";
import Login from "./pages/Login";

import RequireAuth from "./components/RequireAuth";
import RedirectIfAuth from "./components/RedirectIfAuth";

function App() {
  return (
    <Routes>
      {/* ✅ login: se già loggato → redirect dashboard */}
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <Login />
          </RedirectIfAuth>
        }
      />

      {/* ✅ pubblica landing marketing */}
      <Route path="/" element={<MarketingLanding />} />

      {/* ✅ pagina pubblica evento */}
      <Route path="/e/:slug" element={<EventPublic />} />

      {/* ✅ rotta pubblica scan mobile per import contatti */}
      <Route path="/import/:slug" element={<MobileImport />} />

      {/* ✅ catalogo template pubblico */}
      <Route path="/templates" element={<TemplateCatalog />} />

      {/* ✅ rotta pubblica editor demo */}
      <Route path="/edit/demo" element={<EventEditor />} />

      {/* ✅ tutte le pagine protette */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewEvent />} />
        <Route path="/edit/:slug" element={<EventEditor />} />
        <Route path="/rsvps/:slug" element={<EventRsvps />} />
        <Route path="/invites/:slug" element={<EventInvites />} />
      </Route>
    </Routes>
  );
}

export default App;
