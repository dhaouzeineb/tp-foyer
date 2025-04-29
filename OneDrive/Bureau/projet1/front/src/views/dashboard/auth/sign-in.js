import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Image, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../../components/Card';

// img
import auth1 from '../../../assets/images/auth/01.png';

const SignIn = () => {
   const navigate = useNavigate();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [mac, setMac] = useState(''); // State for mac address input
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [deviceInfo, setDeviceInfo] = useState({ ip: '', device: '', os: '', type: '' });

   // Function to detect device type
   const getDeviceType = () => {
      return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Mobile' : 'PC';
   };

   // Fonction pour obtenir le nom du système d'exploitation
   const getOSName = () => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Win')) return 'Windows';
      if (userAgent.includes('Mac')) return 'macOS';
      if (userAgent.includes('Linux')) return 'Linux';
      if (userAgent.includes('Android')) return 'Android';
      if (userAgent.includes('iOS')) return 'iOS';
      return 'Inconnu';
   };

   // Fonction pour estimer le nom du périphérique
   const getDeviceName = () => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Windows')) return 'Windows PC';
      if (userAgent.includes('Macintosh')) return 'MacBook';
      if (userAgent.includes('Linux')) return 'Linux Machine';
      if (userAgent.includes('iPhone')) return 'iPhone';
      if (userAgent.includes('Android')) return 'Android Device';
      return 'Appareil inconnu';
   };

   useEffect(() => {
      const fetchDeviceInfo = async () => {
         try {
            const res = await axios.get('https://api64.ipify.org?format=json');
            const userAgent = navigator.userAgent;
   
            const updatedDeviceInfo = {
               ip: res.data.ip,
               device: userAgent,
               os: getOSName(),
               type: getDeviceType(),
               nomPeripherique: getDeviceName(),

            };
   
            setDeviceInfo(updatedDeviceInfo);
            console.log('Device Info:', updatedDeviceInfo); // Vérifier les valeurs
         } catch (error) {
            setError('Error fetching device information');
            console.error('Error fetching device info:', error);
         }
      };
   
      fetchDeviceInfo();
   }, []);
   

   const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);
   
      if (!deviceInfo.ip) {
         setError('Erreur : Les informations du périphérique ne sont pas encore chargées.');
         setIsLoading(false);
         return;
      }
   
      try {
         const response = await axios.post(
            'http://localhost:8080/auth/login',
            {
               email: email,
               password: password,
               mac: mac,
               app: {
                  mac: mac,
                  nomPeripherique: deviceInfo.nomPeripherique,
                  type: deviceInfo.type,
                  adresseIp: deviceInfo.ip,
                  osName: deviceInfo.os,
                  deviceInfo: deviceInfo.device
               }
            },
            {
               headers: {
                  'Content-Type': 'application/json',
               },
            }
         );
   
         const { token, message } = response.data;
   
         if (token) {
            // Store the token in localStorage and sessionStorage
            localStorage.setItem('authToken', token);
            sessionStorage.setItem('authToken', token);
            
   
            // Now, fetch the user data using the email, including the token in headers
            const userResponse = await axios.get(
               `http://localhost:8080/api/users/email/${email}`,
               {
                  headers: {
                     'Authorization': `Bearer ${token}`, // Add Authorization header with Bearer token
                  },
               }
            );
   
            // Create a user object with the data from the response
            const userData = userResponse.data;
   
            // Store the email and other necessary user data in localStorage
            localStorage.setItem('email', userData.email);
            localStorage.setItem('userName', userData.nom);
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('user_webrtc_session_id', userData.webrtcSessionId);
            localStorage.setItem('userId', userData.id);


   
            setIsLoading(false);
            navigate('/dashboard');  // Redirect to the dashboard
         } else {
            setError(message || 'Login failed. Please try again.');
         }
      } catch (err) {
         setIsLoading(false);
         const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
         setError(errorMessage);
         console.error('Login Error:', err.response?.data || err.message);
      }
   };
   
   
   return (
      <section className="login-content">
         <Row className="m-0 align-items-center bg-white vh-100">
            <Col md="6">
               <Row className="justify-content-center">
                  <Col md="10">
                     <Card className="card-transparent shadow-none d-flex justify-content-center mb-0 auth-card">
                        <Card.Body>
                           <Link to="/dashboard" className="navbar-brand d-flex align-items-center mb-3">
                              <svg
                                 width="30"
                                 className="text-primary"
                                 viewBox="0 0 30 30"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                              >
                                 <rect
                                    x="-0.757324"
                                    y="19.2427"
                                    width="28"
                                    height="4"
                                    rx="2"
                                    transform="rotate(-45 -0.757324 19.2427)"
                                    fill="currentColor"
                                 />
                                 <rect
                                    x="7.72803"
                                    y="27.728"
                                    width="28"
                                    height="4"
                                    rx="2"
                                    transform="rotate(-45 7.72803 27.728)"
                                    fill="currentColor"
                                 />
                                 <rect
                                    x="10.5366"
                                    y="16.3945"
                                    width="16"
                                    height="4"
                                    rx="2"
                                    transform="rotate(45 10.5366 16.3945)"
                                    fill="currentColor"
                                 />
                                 <rect
                                    x="10.5562"
                                    y="-0.556152"
                                    width="28"
                                    height="4"
                                    rx="2"
                                    transform="rotate(45 10.5562 -0.556152)"
                                    fill="currentColor"
                                 />
                              </svg>
                              <h4 className="logo-title ms-3">Dispatcher </h4>
                           </Link>
                           <h2 className="mb-2 text-center">Sign In</h2>
                           <p className="text-center">Login to stay connected.</p>

                           {error && <div className="alert alert-danger text-center mb-3">{error}</div>}

                           <Form onSubmit={handleLogin}>
                              <Row>
                                 <Col lg="12">
                                    <Form.Group className="form-group">
                                       <Form.Label htmlFor="email">Email</Form.Label>
                                       <Form.Control
                                          type="email"
                                          id="email"
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                          placeholder="Enter your email"
                                          required
                                       />
                                    </Form.Group>
                                 </Col>
                                 <Col lg="12">
                                    <Form.Group className="form-group">
                                       <Form.Label htmlFor="password">Password</Form.Label>
                                       <Form.Control
                                          type="password"
                                          id="password"
                                          value={password}
                                          onChange={(e) => setPassword(e.target.value)}
                                          placeholder="Enter your password"
                                          required
                                       />
                                    </Form.Group>
                                 </Col>
                                 <Col lg="12">
                                    <Form.Group className="form-group">
                                       <Form.Label htmlFor="mac">MAC Address</Form.Label>
                                       <Form.Control
                                          type="text"
                                          id="mac"
                                          value={mac}
                                          onChange={(e) => setMac(e.target.value)}
                                          placeholder="Enter MAC Address"
                                          required
                                       />
                                    </Form.Group>
                                 </Col>
                              </Row>
                              <div className="d-flex justify-content-center">
                                 <Button type="submit" variant="btn btn-primary" disabled={isLoading}>
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                 </Button>
                              </div>
                           </Form>
                        </Card.Body>
                     </Card>
                  </Col>
               </Row>
               <div className="sign-bg">
                  <svg width="280" height="230" viewBox="0 0 431 398" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <g opacity="0.05">
                        <rect
                           x="-157.085"
                           y="193.773"
                           width="543"
                           height="77.5714"
                           rx="38.7857"
                           transform="rotate(-45 -157.085 193.773)"
                           fill="#3B8AFF"
                        />
                        <rect
                           x="7.46875"
                           y="358.327"
                           width="543"
                           height="77.5714"
                           rx="38.7857"
                           transform="rotate(-45 7.46875 358.327)"
                           fill="#3B8AFF"
                        />
                     </g>
                  </svg>
               </div>
            </Col>
            <Col md="6" className="d-md-block d-none bg-primary p-0 mt-n1 vh-100 overflow-hidden">
               <Image src={auth1} className="Image-fluid gradient-main animated-scaleX" alt="images" />
            </Col>
         </Row>
      </section>
   );
};

export default SignIn;

