import React, { useEffect, useState } from 'react';
import { Row, Col, Modal, Button, Form, Card as RBCard } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Card from '../../../components/Card';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaCopy, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const UserList = () => {
  // User list and loading states
  const [userlist, setUserlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const currentUserRole = localStorage.getItem('userRole'); 
  const navigate = useNavigate();
  


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal state and coordinates for address modal
  const [showModal, setShowModal] = useState(false);
  const [modalCoordinates, setModalCoordinates] = useState({ lat: 33.8869, lng: 9.5375 });
  const [selectedAddress, setSelectedAddress] = useState('');

  // States for editing user info
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: '',
    name: '',
    lastName: '',
    tel: '',
    email: '',
    adresse: '',
    role:'',
    lat: 0,
    lng: 0,
    verified: 0,
  });
  const [sendedUser, setSendedUser] = useState({
    nom: '',
    prenom: '',
    tel: '',
    email: '',
    adresse: '',
  });
   useEffect(() => {
          // If the user does not have ADMIN_DISPATCHER role, redirect them to another page
          if (currentUserRole !== "ADMIN_DISPATCHER") {
             navigate("./unauthorized");  // Redirect to an "unauthorized" page
          }
       }, [currentUserRole, navigate]); 

  // New state for devices info (initialized as empty)
  const [devices, setDevices] = useState([]);



  // Reverse geocoding for a human-readable address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || 'Adresse non disponible';
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      return 'Adresse non disponible';
    }
  };

  // Returns a badge class based on user verification status
  const getUserStatusColor = (userStatus) => {
    switch (userStatus) {
      case -1:
        return 'bg-danger'; // Deleted
      case 1:
        return 'bg-success'; // Verified
      case 0:
        return 'bg-warning'; // Not Verified
      default:
        return 'bg-secondary';
    }
  };


  const fetchUserByEmail = async (email) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/email/${email}`);
      if (!response.ok) {
        alert("Utilisateur non trouvé");
        setUserlist([]);
        return;
      }
      const data = await response.json();

      if (data && data.id) {
        setUserlist([{
          id: data.id,
          name: data.nom || 'Nom non disponible',
          lastName: data.prenom || 'Prénom non disponible',
          tel: data.tel || 'Contact non disponible',
          email: data.email || 'Email non disponible',
          adresse: data.adresse || 'Inconnu',
          role: data.role,
          verified: data.verified !== undefined ? data.verified : data.status,
          joindate: data.joinDate || '2023/01/01',
          lat: data.lat || 0,
          lng: data.lng || 0,
        }]);
      } else {
        alert("Aucun utilisateur trouvé avec cet email");
        setUserlist([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur par email:", error);
      setUserlist([]);
      alert("Erreur de recherche");
    } finally {
      setLoading(false);
    }
  };

 

  const fetchUsers = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/users');
        const data = await response.json();

        // Récupérer l'email de l'utilisateur connecté
        const currentUserEmail = localStorage.getItem('email');

        // Vérifier si le localStorage est vide
        const isLocalStorageEmpty = !currentUserEmail;

        // Filtrer pour exclure l'utilisateur connecté
        const filteredData = data.filter(user => user.email !== currentUserEmail);

        // Formatter les données
        const formattedData = filteredData.map((user, index) => ({
            id: user.id,
            name: user.nom || 'Nom non disponible',
            lastName: user.prenom || 'Prénom non disponible',
            tel: user.tel || 'Contact non disponible',
            email: user.email || 'Email non disponible',
            adresse: user.adresse || 'Inconnu',
            verified: user.verified !== undefined ? user.verified : user.status,
            joindate: user.joinDate || '2023/01/01',
            role: user.role,
            lat: user.lat || 0,
            lng: user.lng || 0,
            color: index % 2 === 0 ? 'bg-primary' : 'bg-secondary',
            onlineStatus: isLocalStorageEmpty ? 'offline' : (user.status === 1 ? 'online' : 'offline'),
        }));

        setUserlist(formattedData);
        setLoading(false);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setLoading(false);
    }
};

// Handle search when button is clicked
  // State for filtered users
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(userlist); // Show all users if search is empty
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = userlist.filter(user =>
        Object.values(user).some(value =>
          typeof value === "string" && value.toLowerCase().includes(lowercasedQuery)
        )
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, userlist]);
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagination: compute current items to display
  const totalPages = Math.ceil(userlist.length / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Delete user (update status to -1)
  const deleteUser = async (id) => {
    try {
        const response = await fetch(`http://localhost:8080/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ verified: -1 }),
        });

        if (response.status === 200) {
            await fetchUsers();
            toast.success('Utilisateur marqué comme supprimé', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            toast.error('Échec de la mise à jour du statut', {
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
        console.error('Erreur lors de la mise à jour du statut de l’utilisateur:', error);
        toast.error('Une erreur est survenue', {
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

  // Show modal with full address and map
  const handleShowAddress = (fullAddress, lat, lng, name, lastName, tel, email) => {
    setSelectedAddress(fullAddress || 'Adresse complète indisponible');
    setModalCoordinates({
      lat: lat || 33.8869,
      lng: lng || 9.5375,
      tel: tel || 'Non disponible',
      email: email || 'Non disponible',
    });
    setShowModal(true);
  };

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Texte copié dans le presse-papiers !');
      })
      .catch((err) => {
        console.error('Erreur lors de la copie : ', err);
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAddress('');
  };

  // Prepare edit modal with user data
  const handleEditUser = (user) => {
    setCurrentUser({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        tel: user.tel,
        email: user.email,
        adresse: user.adresse,
        role: user.role,
        lat: user.lat,
        lng: user.lng,
        verified: user.verified,
    });
    setShowEditModal(true);
};

  // Save changes to the user via API
  const handleSaveChanges = async () => {
    try {
        sendedUser.nom = currentUser.name;
        sendedUser.prenom = currentUser.lastName;
        sendedUser.tel = currentUser.tel;
        sendedUser.email = currentUser.email;
        sendedUser.adresse = currentUser.adresse;
        const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendedUser),
        });

        if (response.ok) {
            setUserlist(
                userlist.map((user) =>
                    user.id === currentUser.id ? { ...user, ...currentUser } : user
                )
            );
            toast.success("Utilisateur mis à jour avec succès", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setShowEditModal(false);
        } else {
            toast.error("Échec de la mise à jour de l'utilisateur", {
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
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        toast.error("Une erreur est survenue", {
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

  // Handle location selection on the map
  function LocationMarker({ currentUser, setCurrentUser }) {
    useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng;
        reverseGeocode(lat, lng).then((address) => {
          setCurrentUser({ ...currentUser, lat, lng, adresse: address });
        });
      },
    });

    return (
      <Marker position={[currentUser.lat, currentUser.lng]}>
        <Popup>{currentUser.adresse}</Popup>
      </Marker>
    );
  }

  // Modified getComputerInfo to populate the devices table
  const getComputerInfo = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/apps/user/${userId}`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
            setDevices(data);
        } else {
            setDevices([]);
            toast.info("Aucun appareil trouvé pour cet utilisateur", {
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
        console.error("Erreur lors de la récupération des infos de l'appareil :", error);
        toast.error(`Erreur: ${error.message}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        setDevices([]);
    }
};
  if (loading) {
    return <div>Chargement des données...</div>;
  }

  return (
    <>
      <div>
        <Row>
          <Col sm="12">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="header-title">
                  <h4 className="card-title">User List</h4>
               <Row>
                    <Col>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    {/* <Col className="d-flex align-items-end">
                      <Button variant="primary" onClick={handleSearchChange}>
                        Search
                      </Button>
                    </Col> */}
                  </Row>
                </div>
                {/* Add User button on top of the table with routing */}
               
                <div>
                  <Link to="../dashboard/app/user-add">
                    <Button variant="primary">Add User</Button>
                  </Link>
                  
                </div>
              </Card.Header>
              <Card.Body className="px-0">
                <div className="table-responsive">
                  <table
                    id="user-list-table"
                    className="table table-striped"
                    role="grid"
                    data-toggle="data-table"
                  >
                    <thead>
                      <tr className="ligth">
                        <th>Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>E-mail</th>
                        <th>Address</th>
                        <th>Role</th>
                        <th>Account Status</th>
                        <th>Disponnibility</th>
                        <th>Join Date</th>
                        <th min-width="100px">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.length > 0 ? (
                        currentUsers.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.lastName}</td>
                            <td>{item.tel.replace(/^\+?\d{1,3}\s?/, '')}</td>
                            <td>{item.email}</td>
                            <td>
                              {(item.adresse || 'Inconnu')
                                .split(' ')
                                .slice(0, 3)
                                .join(' ') +
                                ((item.adresse || 'Inconnu').split(' ').length > 3
                                  ? ' ...'
                                  : '')}{' '}
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() =>
                                  handleShowAddress(
                                    item.adresse,
                                    item.lat,
                                    item.lng,
                                    item.name,
                                    item.lastName,
                                    item.tel,
                                    item.email
                                  )
                                }
                              >
                                View more
                              </Button>
                            </td>
                            <td>
                            {item.role}
                            </td>
                            <td>
                              <span className={`badge ${getUserStatusColor(item.verified)}`}>
                                {item.verified === -1
                                  ? 'Deleted'
                                  : item.verified === 0
                                  ? 'Not Verified'
                                  : item.verified === 1
                                  ? 'Verified'
                                  : 'Unknown'}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${item.onlineStatus === 'online' ? 'bg-success' : 'bg-danger'}`}
                              >
                                {item.onlineStatus === 'online' ? 'Online' : 'Offline'}
                              </span>
                            </td>
                            <td>{item.joindate}</td>
                            <td>
                              <div className="flex align-items-center list-user-action">
                                <Link
                                  className="btn btn-sm btn-icon btn-warning"
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title="Edit"
                                  to="#"
                                  onClick={() => handleEditUser(item)}
                                >
                                  <span className="btn-inner">
                                    <i className="fas fa-edit"></i>
                                  </span>
                                </Link>{' '}
                                <button
                                  className="btn btn-sm btn-icon btn-danger"
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title="Delete"
                                  onClick={() => deleteUser(item.id)}
                                >
                                  <span className="btn-inner">
                                    <i className="fas fa-trash-alt"></i>
                                  </span>
                                </button>{' '}
                                {/* Device Info Button (no popover) */}
                                <button
                                  className="btn btn-sm btn-icon btn-info"
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title="Device Info"
                                  onClick={() => getComputerInfo(item.id)}
                                >
                                  <FaInfoCircle />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Minimalist Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                  <div>
                    <span>Items per page:&nbsp;</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="form-select form-select-sm"
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <span>
                      {" "}
                      Page {currentPage} of {totalPages}{" "}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Device Info Table (initialized empty) */}
        <Row className="mt-4">
          <Col sm="12">
            <RBCard>
              <RBCard.Header>
                <h4 className="card-title">Device Info</h4>
              </RBCard.Header>
              <RBCard.Body>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Adresse IP</th>
                        <th>MAC</th>
                        <th>Périphérique</th>
                        <th>OS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.length > 0 ? (
                        devices.map((device, idx) => (
                          <tr key={idx}>
                            <td>{device.adresseIp || 'Non disponible'}</td>
                            <td>{device.mac || 'Non disponible'}</td>
                            <td>{device.nomPeripherique || 'Non disponible'}</td>
                            <td>{device.osName || 'Non disponible'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            Select a user !
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </RBCard.Body>
            </RBCard>
          </Col>
        </Row>
      </div>

      {/* Modal for full address and map */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update the user</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p>
              <strong>Phone : </strong>
              {modalCoordinates.tel || 'Non disponible'}{' '}
              {modalCoordinates.tel && (
                <a href={`tel:${modalCoordinates.tel}`} className="btn btn-link btn-sm">
                  call
                </a>
              )}
            </p>
            <p>
              <strong>E-mail : </strong>
              {modalCoordinates.email || 'Non disponible'}{' '}
              <Button
                variant="link"
                size="sm"
                onClick={() => copyToClipboard(modalCoordinates.email)}
              >
                Copy
              </Button>
            </p>
            <p>
              <strong>Address: </strong>
              {selectedAddress || 'Non disponible'}{' '}
              <Button
                variant="link"
                size="sm"
                onClick={() => copyToClipboard(selectedAddress)}
              >
                Copy
              </Button>
            </p>
          </div>
          <div style={{ height: '400px', width: '100%' }}>
            <MapContainer
              center={[modalCoordinates.lat, modalCoordinates.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[modalCoordinates.lat, modalCoordinates.lng]}>
                <Popup>{selectedAddress}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for editing a user */}
      {currentUser && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>User Info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.lastName}
                  onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formPhone">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.tel}
                  onChange={(e) => setCurrentUser({ ...currentUser, tel: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formAdresse">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.adresse}
                  onChange={(e) => setCurrentUser({ ...currentUser, adresse: e.target.value })}
                />
              </Form.Group>
              <MapContainer
                center={[
                  currentUser.lat !== 0 ? currentUser.lat : 33.8869,
                  currentUser.lng !== 0 ? currentUser.lng : 9.5375
                ]}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker currentUser={currentUser} setCurrentUser={setCurrentUser} />
              </MapContainer>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default UserList;
