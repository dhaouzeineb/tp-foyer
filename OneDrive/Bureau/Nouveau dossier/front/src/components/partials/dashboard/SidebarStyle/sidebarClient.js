import React, { useState, useContext, useEffect, memo, Fragment } from 'react';
import { Link, useLocation ,useNavigate  } from 'react-router-dom';
import{startVideoCall } from '../../../../views/dashboard/app/videoCall';
import { Accordion, useAccordionButton, AccordionContext } from 'react-bootstrap';
import SimplePeer from 'simple-peer';  // For managing WebRTC connections
import { startVoiceCall } from '../../../../views/dashboard/app/VoiceCall';



// Custom Accordion Toggle Component
function CustomToggle({ children, eventKey, onClick }) {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(eventKey, (active) => onClick({ state: !active, eventKey }));
  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <Link
      to="#"
      aria-expanded={isCurrentEventKey ? 'true' : 'false'}
      className="nav-link"
      role="button"
      onClick={(e) => {
        decoratedOnClick(isCurrentEventKey);
      }}
    >
      {children}
    </Link>
  );
}

const VerticalNav = memo((props) => {
  const [activeMenu, setActiveMenu] = useState(false);
  const [active, setActive] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);

  const location = useLocation();

  // Récupérer les utilisateurs connectés depuis le serveur
  useEffect(() => {
    fetch('http://localhost:8080/api/users/api/connected-users')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Connected users:', data);
        setConnectedUsers(data);
      })
      .catch((error) => {
        console.error('Error fetching connected users:', error);
      });
  }, []);

  const currentUserName = localStorage.getItem('userName');
  console.log('Current userName from localStorage:', currentUserName);

  // Filtrer pour ne pas afficher l'utilisateur courant (comparaison insensible à la casse)
  const filteredConnectedUsers = connectedUsers.filter((user) => {
    if (!user.nom || !currentUserName) return true;
    return user.nom.toLowerCase() !== currentUserName.toLowerCase();
  });

  const handleVoiceCall = (targetUser) => {
    // Récupérer les informations de l'utilisateur appelant depuis le localStorage
    const currentUserId = localStorage.getItem('userId');
    const currentUserName = localStorage.getItem('userName');
    const currentUserWebrtcSessionId = localStorage.getItem('user_webrtc_session_id');
  
    if (!currentUserId || !currentUserName || !currentUserWebrtcSessionId) {
      console.error("Informations de l'utilisateur appelant manquantes.");
      return;
    }
  
  
    // Appel à startVoiceCall(targetUserId, userId, userName, webrtcSessionId)
    startVoiceCall(
      targetUser.id,              // targetUserId : l'ID du destinataire
      currentUserId,              // userId : l'ID de l'appelant
      currentUserName,            // userName : le nom de l'appelant
      currentUserWebrtcSessionId  // webrtcSessionId : le sessionId WebRTC de l'appelant
    );
  };
  
// Fonction pour lancer un appel vidéo
const handleVideoCall = (targetUser) => {
  // Récupérer les informations de l'utilisateur appelant depuis le localStorage
  const currentUserId = localStorage.getItem('userId');
  const currentUserName = localStorage.getItem('userName');
  const currentUserWebrtcSessionId = localStorage.getItem('user_webrtc_session_id');

  if (!currentUserId || !currentUserName || !currentUserWebrtcSessionId) {
    console.error("Informations de l'utilisateur appelant manquantes.");
    return;
  }

  // Appel à startVideoCall(targetUserId, userId, userName, webrtcSessionId)
  startVideoCall(
    targetUser.id,              // targetUserId : l'ID du destinataire
    currentUserId,              // userId : l'ID de l'appelant
    currentUserName,            // userName : le nom de l'appelant
    currentUserWebrtcSessionId  // webrtcSessionId : la session WebRTC de l'appelant
  );
};

  

    return (
       <Fragment>
            <Accordion as="ul" className="navbar-nav iq-main-menu">
                <li className="nav-item static-item">
                    <Link className="nav-link static-item disabled" to="#" tabIndex="-1">
                        <span className="default-icon">Home</span>
                        <span className="mini-icon">-</span>
                    </Link>
                </li>
                <li className={`${location.pathname === '/dashboard' ? 'active' : ''} nav-item `}>
                    <Link className={`${location.pathname === '/dashboard' ? 'active' : ''} nav-link `} aria-current="page" to="/dashboard" onClick={() => {}}>
                        <i className="icon">
                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.4" d="M16.0756 2H19.4616C20.8639 2 22.0001 3.14585 22.0001 4.55996V7.97452C22.0001 9.38864 20.8639 10.5345 19.4616 10.5345H16.0756C14.6734 10.5345 13.5371 9.38864 13.5371 7.97452V4.55996C13.5371 3.14585 14.6734 2 16.0756 2Z" fill="currentColor"></path>
                                <path fillRule="evenodd" clipRule="evenodd" d="M4.53852 2H7.92449C9.32676 2 10.463 3.14585 10.463 4.55996V7.97452C10.463 9.38864 9.32676 10.5345 7.92449 10.5345H4.53852C3.13626 10.5345 2 9.38864 2 7.97452V4.55996C2 3.14585 3.13626 2 4.53852 2ZM4.53852 13.4655H7.92449C9.32676 13.4655 10.463 14.6114 10.463 16.0255V19.44C10.463 20.8532 9.32676 22 7.92449 22H4.53852C3.13626 22 2 20.8532 2 19.44V16.0255C2 14.6114 3.13626 13.4655 4.53852 13.4655ZM19.4615 13.4655H16.0755C14.6732 13.4655 13.537 14.6114 13.537 16.0255V19.44C13.537 20.8532 14.6732 22 16.0755 22H19.4615C20.8637 22 22 20.8532 22 19.44V16.0255C22 14.6114 20.8637 13.4655 19.4615 13.4655Z" fill="currentColor"></path>
                            </svg>
                        </i>
                        <span className="item-name">Dashboard</span>
                    </Link>
                </li>
                <Accordion.Item as="li" eventKey="sidebar-user" bsPrefix={`nav-item ${active === 'user' ? 'active' : ''} `} onClick={() => setActive('user')}>
   
                  
                    <CustomToggle eventKey="sidebar-reclamation" onClick={(activeKey) => setActiveMenu(activeKey)}>
                        <i className="icon">
                            <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.9488 14.54C8.49884 14.54 5.58789 15.1038 5.58789 17.2795C5.58789 19.4562 8.51765 20.0001 11.9488 20.0001C15.3988 20.0001 18.3098 19.4364 18.3098 17.2606C18.3098 15.084 15.38 14.54 11.9488 14.54Z" fill="currentColor"></path>
                                <path opacity="0.4" d="M11.949 12.467C14.2851 12.467 16.1583 10.5831 16.1583 8.23351C16.1583 5.88306 14.2851 4 11.949 4C9.61293 4 7.73975 5.88306 7.73975 8.23351C7.73975 10.5831 9.61293 12.467 11.949 12.467Z" fill="currentColor"></path>
                                <path opacity="0.4" d="M21.0881 9.21923C21.6925 6.84176 19.9205 4.70654 17.664 4.70654C17.4187 4.70654 17.1841 4.73356 16.9549 4.77949C16.9244 4.78669 16.8904 4.802 16.8725 4.82902C16.8519 4.86324 16.8671 4.90917 16.8895 4.93889C17.5673 5.89528 17.9568 7.0597 17.9568 8.30967C17.9568 9.50741 17.5996 10.6241 16.9728 11.5508C16.9083 11.6462 16.9656 11.775 17.0793 11.7948C17.2369 11.8227 17.3981 11.8371 17.5629 11.8416C19.2059 11.8849 20.6807 10.8213 21.0881 9.21923Z" fill="currentColor"></path>
                                <path d="M22.8094 14.817C22.5086 14.1722 21.7824 13.73 20.6783 13.513C20.1572 13.3851 18.747 13.205 17.4352 13.2293C17.4155 13.232 17.4048 13.2455 17.403 13.2545C17.4003 13.2671 17.4057 13.2887 17.4316 13.3022C18.0378 13.6039 20.3811 14.916 20.0865 17.6834C20.074 17.8032 20.1698 17.9068 20.2888 17.8888C20.8655 17.8059 22.3492 17.4853 22.8094 16.4866C23.0637 15.9589 23.0637 15.3456 22.8094 14.817Z" fill="currentColor"></path>
                                <path opacity="0.4" d="M7.04459 4.77973C6.81626 4.7329 6.58077 4.70679 6.33543 4.70679C4.07901 4.70679 2.30701 6.84201 2.9123 9.21947C3.31882 10.8216 4.79355 11.8851 6.43661 11.8419C6.60136 11.8374 6.76343 11.8221 6.92013 11.7951C7.03384 11.7753 7.09115 11.6465 7.02668 11.551C6.3999 10.6234 6.04263 9.50765 6.04263 8.30991C6.04263 7.05904 6.43303 5.89462 7.11085 4.93913C7.13234 4.90941 7.14845 4.86348 7.12696 4.82926C7.10906 4.80135 7.07593 4.78694 7.04459 4.77973Z" fill="currentColor"></path>
                                <path d="M3.32156 13.5127C2.21752 13.7297 1.49225 14.1719 1.19139 14.8167C0.936203 15.3453 0.936203 15.9586 1.19139 16.4872C1.65163 17.4851 3.13531 17.8066 3.71195 17.8885C3.83104 17.9065 3.92595 17.8038 3.91342 17.6832C3.61883 14.9167 5.9621 13.6046 6.56918 13.3029C6.59425 13.2885 6.59962 13.2677 6.59694 13.2542C6.59515 13.2452 6.5853 13.2317 6.5656 13.2299C5.25294 13.2047 3.84358 13.3848 3.32156 13.5127Z" fill="currentColor"></path>
                            </svg>
                        </i>
                        <span className="item-name">Reclamation</span>
                        <i className="right-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </i>
                    </CustomToggle>
                    <Accordion.Collapse eventKey="sidebar-reclamation">
                        <ul>
                    
                                <Link className={`${location.pathname === '/dashboard/app/Reclamation-add' ? 'active' : ''} nav-link`} to="/dashboard/app/Reclamation-add">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> E </i>
                                    <span className="item-name">Add Reclamation</span>
                                </Link>
                            
                            
                                <Link className={`${location.pathname === '/dashboard/app/ReclamationClient' ? 'active' : ''} nav-link`} to="/dashboard/app/ReclamationClient">
                                    <i className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="currentColor">
                                            <g>
                                            <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                    </i>
                                    <i className="sidenav-mini-icon"> E </i>
                                    <span className="item-name">Reclamation List</span>
                                </Link>
                            
                            </ul>
                    </Accordion.Collapse>
                </Accordion.Item>
                <Accordion.Item as="li" eventKey="sidebar-users" bsPrefix={`nav-item ${active === 'users' ? 'active' : ''}`} onClick={() => setActive('users')}>
  <CustomToggle eventKey="sidebar-users" onClick={(activeKey) => setActiveMenu(activeKey)}>
    <i className="icon">
      <svg width="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-5 4c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm5 0c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm5-8c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm0 0c-1.65 0-3 1.34-3 3 0 .54.15 1.05.41 1.5C17.46 12.53 17 13.2 17 14c0 1.6 1.39 3 3 3 1.61 0 2.94-1.3 2.99-2.9-.04-.36-.13-.72-.27-1.04C19.35 11.91 19 11.23 19 10.5c0-.77.34-1.45.89-1.89C19.46 8.29 19 7.51 19 6.5z" fill="currentColor"></path>
      </svg>
    </i>
    <span className="item-name">Users</span>
  </CustomToggle>
  <Accordion.Collapse eventKey="sidebar-users">
        <ul>
          {filteredConnectedUsers.length > 0 ? (
            filteredConnectedUsers.map((user) => (
              <li key={user.id} className="user-item">
                <div className="user-info">
                  <span className="user-name">{user.nom}</span>
                </div>
                <div className="user-actions">
                  <button onClick={() => handleVoiceCall(user)} className="btn btn-info btn-sm ml-2">
                    📱 Voice Call
                  </button>
                  <button className="btn btn-success btn-sm ml-2">
                    💬 Send Message
                  </button>
                  <button onClick={() => handleVideoCall(user)} className="btn btn-primary btn-sm ml-2">
                🎥 Video Call
              </button>
                </div>
              </li>
            ))
          ) : (
            <li>No users connected</li>
          )}
        </ul>
      </Accordion.Collapse>
</Accordion.Item>

            </Accordion>
       </Fragment>
    )
})

export default VerticalNav
