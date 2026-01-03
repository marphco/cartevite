import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import NewEvent from "./pages/NewEvent";
import EventPublic from "./pages/EventPublic";
import EventEditor from "./pages/EventEditor";
import EventRsvps from "./pages/EventRsvps.jsx";
import Login from "./pages/Login";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/new" element={<NewEvent />} />
      <Route path="/e/:slug" element={<EventPublic />} />
      <Route path="/edit/:slug" element={<EventEditor />} />
      <Route path="/rsvps/:slug" element={<EventRsvps />} />
    </Routes>
  );
}

export default App;
