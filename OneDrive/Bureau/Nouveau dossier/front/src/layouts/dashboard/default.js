import { useEffect, memo, Fragment, useContext ,useState} from "react"; // <-- Added useContext import
import { useLocation, Outlet } from "react-router-dom";

// react-shepherd
import { ShepherdTourContext } from "react-shepherd";

// react-bootstrap
import { Button } from "react-bootstrap";

// header
import Header from "../../components/partials/dashboard/HeaderStyle/header";

// subheader
import SubHeader from "../../components/partials/dashboard/HeaderStyle/sub-header";

// sidebar
import Sidebar from "../../components/partials/dashboard/SidebarStyle/sidebar";

// footer
import Footer from "../../components/partials/dashboard/FooterStyle/footer";

// settingOffCanvas
import SettingOffCanvas from "../../components/setting/SettingOffCanvas";

import Loader from "../../components/Loader";

// Import selectors & action from setting store
import * as SettingSelector from "../../store/setting/selectors";

// Redux Selector / Action
import { useSelector } from "react-redux";
import webSocketService from '../../views/dashboard/app/socket';


const Tour = () => {
  const tour = useContext(ShepherdTourContext); // <-- Context used here
  const { pathname } = useLocation();
  useEffect(() => {
    if (
      pathname === "/dashboard" &&
      sessionStorage.getItem("tour") !== "true"
    ) {
      tour?.start();
    }
  });
  return <Fragment></Fragment>;
};

const Default = memo(() => {
  const { pathname } = useLocation();
  const appName = useSelector(SettingSelector.app_name);
   const [error, setError] = useState('');

  // Vérifie si l'utilisateur est sur la page unauthorized
  const isUnauthorizedPage = pathname === "/dashboard/app/unauthorized";

  const containerStyles = isUnauthorizedPage
    ? { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }
    : {};
   
    useEffect(() => {
      const userId = localStorage.getItem('userId'); // Assurez-vous de stocker cet identifiant lors du login
      const sessionId = localStorage.getItem('user_webrtc_session_id');
  
      // Établir la connexion WebSocket
      webSocketService.connect(userId, sessionId);
  
      // Cleanup à la déconnexion du composant
      return () => {
        webSocketService.disconnect();
      };
    }, []);

  return (
    <Fragment>
      <Loader />
      <div style={containerStyles}>
        {/* Conditionally render Sidebar, Header, SubHeader, and Footer */}
        {!isUnauthorizedPage && <Sidebar app_name={appName} />}
        <Tour />
        <main className="main-content" style={isUnauthorizedPage ? { width: "100%", padding: "0", margin: "0" } : {}}>
          <div className="position-relative">
            {!isUnauthorizedPage && <Header />}
            {!isUnauthorizedPage && <SubHeader />}
          </div>
          <div className="py-0 container-fluid content-inner mt-n5">
            <Outlet />
          </div>
          <div className="btn-download"></div>
          {!isUnauthorizedPage && <Footer />}
        </main>
        {!isUnauthorizedPage && <SettingOffCanvas />}
      </div>
    </Fragment>
  );
});

Default.displayName = "Default";
export default Default;
