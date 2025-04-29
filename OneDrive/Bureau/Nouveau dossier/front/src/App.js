import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSetting } from "./store/setting/actions";
import DOMPurify from "dompurify"; // 🔒 Protection XSS
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importation du CSS de react-toastify

import "./assets/scss/hope-ui.scss";
import "./assets/scss/custom.scss";
import "./assets/scss/dark.scss";
import "./assets/scss/rtl.scss";
import "./assets/scss/customizer.scss";

function App({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSetting());

    localStorage.setItem("isTabOpen", "true");

    let inactivityTimer;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        localStorage.clear();
      }, 3000000); // 30 secondes
    };

    window.addEventListener("click", resetInactivityTimer);
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      localStorage.removeItem("isTabOpen");
    };
  }, [dispatch]);

  return (
    <div className="App">
      <ToastContainer /> {/* ✅ Ajout du conteneur pour afficher les notifications */}
      {children}
    </div>
  );
}

export default App;
