import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import MarketingLanding from "./pages/Marketing/MarketingLanding";
import NewEvent from "./pages/Dashboard/NewEvent";
import TemplateCatalog from "./pages/PublicView/TemplateCatalog";
import EventPublic from "./pages/PublicView/EventPublic";
import EventEditor from "./pages/Editor/EventEditor";
import EventRsvps from "./pages/Rsvps/EventRsvps";
import EventDonations from "./pages/Donations/EventDonations";
import EventInvites from "./pages/PublicView/EventInvites";
import DigitalGiftsInfo from "./pages/Legal/DigitalGiftsInfo";
import MobileImport from "./pages/Dashboard/MobileImport";
import Login from "./pages/Login/Login";

import RequireAuth from "./components/auth/RequireAuth";
import RedirectIfAuth from "./components/auth/RedirectIfAuth";

function App() {
  return (
    <Routes>
      {/* login: se già loggato → redirect dashboard */}
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <Login />
          </RedirectIfAuth>
        }
      />

      {/* pubblica landing marketing */}
      <Route path="/" element={<MarketingLanding />} />

      {/* pagina pubblica evento */}
      <Route path="/e/:slug" element={<EventPublic />} />

      {/* rotta pubblica scan mobile per import contatti */}
      <Route path="/import/:slug" element={<MobileImport />} />

      {/* catalogo template pubblico */}
      <Route path="/templates" element={<TemplateCatalog />} />

      {/* pagina informativa regali digitali (pubblica) */}
      <Route path="/regali-digitali" element={<DigitalGiftsInfo />} />
      <Route path="/legal/digital-gifts" element={<DigitalGiftsInfo />} />

      {/* rotta pubblica editor demo */}
      <Route path="/edit/demo" element={<EventEditor />} />

      {/* tutte le pagine protette */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewEvent />} />
        <Route path="/edit/:slug" element={<EventEditor />} />
        <Route path="/rsvps/:slug" element={<EventRsvps />} />
        <Route path="/donations/:slug" element={<EventDonations />} />
        <Route path="/events/:slug/donations" element={<EventDonations />} />
        <Route path="/gifts/:slug" element={<EventDonations />} />
        <Route path="/events/:slug/gifts" element={<EventDonations />} />
        <Route path="/invites/:slug" element={<EventInvites />} />
      </Route>
    </Routes>
  );
}

export default App;
