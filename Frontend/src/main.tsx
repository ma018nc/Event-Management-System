import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import "leaflet/dist/leaflet.css"


import axios from "axios"

axios.defaults.withCredentials = true

createRoot(document.getElementById("root")!).render(
  <App />
)
