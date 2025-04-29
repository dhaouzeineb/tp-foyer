import React, { useState,useEffect } from 'react';
import { Row, Col, Form, Image, Button } from 'react-bootstrap';
import Card from '../../../components/Card';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import bcrypt from 'bcryptjs';
import { FaGear } from "react-icons/fa6";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Updated to useNavigate

import avatars1 from '../../../assets/images/avatars/01.png';


// Fix the default icon issue for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
   iconUrl: require('leaflet/dist/images/marker-icon.png'),
   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const UserAdd = () => {
   const [nom, setNom] = useState('');
   const [prenom, setPrenom] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [role, setUserRole] = useState('');
   const [tel, setPhone] = useState('');
   const [adresse, setAddress] = useState('');
   const [macAddress, setMacAddress] = useState('');
   const [position, setPosition] = useState([36.8065, 10.1815]); // Default to Tunis coordinates
   const [showPassword, setShowPassword] = useState(false);
   const [errors, setErrors] = useState({});
   const navigate = useNavigate(); // Using useNavigate instead of useHistory
     const currentUserRole = localStorage.getItem('userRole');  // Retrieve from localStorage
   // Validation errors
   useEffect(() => {
      // If the user does not have ADMIN_DISPATCHER role, redirect them to another page
      if (currentUserRole !== "ADMIN_DISPATCHER") {
         navigate("/dashboard/app/unauthorized");  // Redirect to an "unauthorized" page
      }
   }, [currentUserRole, navigate]); 

   const fetchAddress = async (lat, lng) => {
      try {
         const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            params: {
               lat,
               lon: lng,
               format: 'json',
            },
         });
         setAddress(response.data.display_name || 'Address not found');
      } catch (error) {
         console.error('Error fetching address:', error);
         setAddress('Unable to fetch address');
      }
   };

   // Map events to capture user click
   const MapClickHandler = () => {
      useMapEvents({
         click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            fetchAddress(lat, lng);
         },
      });
      return null;
   };

   // Generate random password
   const generateRandomPassword = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let randomPassword = '';
      for (let i = 0; i < 12; i++) {
         randomPassword += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      setPassword(randomPassword);
   };

   // Validate inputs
   const validateInputs = () => {
      const newErrors = {};

      if (!nom.trim()) newErrors.nom = 'Le nom est requis';
      if (!prenom.trim()) newErrors.prenom = 'Le prénom est requis';

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!email.trim() || !emailRegex.test(email)) newErrors.email = 'Email invalide';

      if (!role) newErrors.role = 'Le rôle est requis';

      if (tel && !/^\d+$/.test(tel)) newErrors.tel = 'Le numéro de téléphone doit contenir uniquement des chiffres';

      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
      if (!macAddress || !macRegex.test(macAddress)) newErrors.macAddress = 'Adresse MAC invalide';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleAddUser = async (e) => {
      e.preventDefault();
  
      if (!validateInputs()) {
          return;
      }
  
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
  
      try {
          const response = await axios.post(
              `http://localhost:8080/api/users/addUser?mac=${encodeURIComponent(macAddress)}`,
              {
                  nom,
                  prenom,
                  email,
                  password: hashedPassword,
                  role,
                  tel,
                  adresse
              }
          );
  
          if (response.status === 200) {
              toast.success('User added successfully!', {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
              });
              resetForm();
          } else {
              toast.error('Error adding user', {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
              });
          }
      } catch (error) {
          console.error('Error:', error);
          toast.error('Server connection error', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
          });
      }
  };
   
  

   const resetForm = () => {
      setNom('');
      setPrenom('');
      setEmail('');
      setPassword('');
      setUserRole('');
      setPhone('');
      setAddress('');
      setMacAddress('');
      setPosition([36.8065, 10.1815]);
      setErrors({});
   };

   return (
      <>
         <div>
            <Row>
               <Col xl="3" lg="4">
                  <Card>
                     <Card.Header className="d-flex justify-content-between">
                        <div className="header-title">
                           <h4 className="card-title">Add New User</h4>
                        </div>
                     </Card.Header>
                     <Card.Body>
                        <Form>
                           <Form.Group className="form-group">
                              <div className="profile-img-edit position-relative">
                                 <Image className="theme-color-default-img profile-pic rounded avatar-100" src={avatars1} alt="profile-pic" />
                                 <div className="upload-icone bg-primary">
                                    <svg className="upload-button" width="14" height="14" viewBox="0 0 24 24">
                                       <path fill="#ffffff" d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" />
                                    </svg>
                                    <Form.Control className="file-upload" type="file" accept="image/*" />
                                 </div>
                              </div>
                           </Form.Group>
                           <Form.Group className="form-group">
                              <Form.Label>User Role <span className="text-danger">*</span>:</Form.Label>
                              <select
                                 name="role"
                                 className="selectpicker form-control"
                                 data-style="py-0"
                                 value={role}
                                 onChange={(e) => setUserRole(e.target.value)}
                              >
                                 <option value="">Select</option>
                                 <option value="AGENT_DISPATCHER">AGENT_DISPATCHER</option>
                                 <option value="ADMIN_DISPATCHER">ADMIN_DISPATCHER</option>
                                 <option value="CLIENT_DISPATCHER">CLIENT_DISPATCHER</option>
                              </select>
                              {errors.role && <span className="text-danger">{errors.role}</span>}
                           </Form.Group>
                        </Form>
                     </Card.Body>
                  </Card>
               </Col>
               <Col xl="9" lg="8">
               <Card>
   <Card.Header className="d-flex justify-content-between">
      <div className="header-title">
         <h4 className="card-title">New User Information</h4>
      </div>
   </Card.Header>
   <Card.Body>
      <div className="new-user-info">
         <Form onSubmit={handleAddUser}>
            <div className="row">
               <Form.Group className="col-md-6 form-group">
                  <Form.Label>Name <span className="text-danger">*</span>:</Form.Label>
                  <Form.Control
                     type="text"
                     placeholder="Name"
                     value={nom}
                     onChange={(e) => setNom(e.target.value)}
                     required
                  />
                  {errors.nom && <span className="text-danger">{errors.nom}</span>}
               </Form.Group>
               <Form.Group className="col-md-6 form-group">
                  <Form.Label>Last Name <span className="text-danger">*</span>:</Form.Label>
                  <Form.Control
                     type="text"
                     placeholder="Last Name"
                     value={prenom}
                     onChange={(e) => setPrenom(e.target.value)}
                     required
                  />
                  {errors.prenom && <span className="text-danger">{errors.prenom}</span>}
               </Form.Group>
               <Form.Group className="col-md-6 form-group">
                  <Form.Label>E-mail <span className="text-danger">*</span>:</Form.Label>
                  <Form.Control
                     type="email"
                     placeholder="E-mail"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
                  {errors.email && <span className="text-danger">{errors.email}</span>}
               </Form.Group>
               <Form.Group className="col-md-6 form-group">
                  <Form.Label>MAC Address <span className="text-danger">*</span>:</Form.Label>
                  <Form.Control
                     type="text"
                     placeholder="MAC Address "
                     value={macAddress}
                     onChange={(e) => setMacAddress(e.target.value)}
                     required
                  />
                  {errors.macAddress && <span className="text-danger">{errors.macAddress}</span>}
               </Form.Group>
               <Form.Group className="col-md-6 form-group">
                  <Form.Label>Phone:</Form.Label>
                  {/* Label for Phone Input above the map */}
                  <PhoneInput
                     country={'tn'}
                     value={tel}
                     onChange={(tel) => {
                        const numericValue = tel.replace(/\D/g, '');
                        setPhone(numericValue);
                     }}
                  />
                  {errors.tel && <span className="text-danger">{errors.tel}</span>}
               </Form.Group>
               <Form.Group className="col-md-6 form-group">
                  <Form.Label>Address:</Form.Label>
                  <Form.Control
                     type="text"
                     placeholder="Address"
                     value={adresse}
                     readOnly
                  />
               </Form.Group>
            </div>

            {/* MapContainer adjustment */}
            <div className="col-md-12 form-group map-container">
               <MapContainer
                  className="map-container"
                  center={position}
                  zoom={13}
                  style={{
                     height: '400px',
                     width: '100%',
                     borderRadius: '10px',
                     marginTop: '40px', // Added space between form and map
                  }}
               >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler />
                  <Marker position={position} />
               </MapContainer>
            </div>

            <hr />
            <h5 className="mb-3">Security</h5>
            <div className="row">
               <Form.Group className="col-md-6 form-group">
                  <Form.Label htmlFor="pass">Password <span className="text-danger">*</span>:</Form.Label>
                  <div className="d-flex align-items-center">
                     <div className="flex-grow-1">
                        <Form.Control
                           type={showPassword ? "text" : "password"}
                           id="pass"
                           placeholder="Password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                        />
                     </div>
                     <div>
                        <Button
                           variant="outline-info"
                           onClick={() => setShowPassword(!showPassword)}
                        >
                           {showPassword ? <IoEyeOff /> : <IoEye />}
                        </Button>
                     </div>
                     <div>
                        <Button
                           variant="outline-success"
                           onClick={generateRandomPassword}
                        >
                           <FaGear />
                        </Button>
                     </div>
                  </div>
               </Form.Group>
            </div>
            <Button type="submit" variant="primary">
               Add User
            </Button>
         </Form>
      </div>
   </Card.Body>
</Card>


               </Col>
            </Row>
         </div>
      </>
   );
};

export default UserAdd;
