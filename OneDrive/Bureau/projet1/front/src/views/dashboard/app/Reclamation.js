import React, { useEffect, useState } from 'react';
import { Row, Col, Modal, Button, Form } from 'react-bootstrap';
import Card from '../../../components/Card';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Fonction de géocodage inverse
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

// Composant pour rendre la carte interactive (uniquement en mode ajout)
function LocationMarker({ setCurrentReclamation }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;

      // Vérification que lat et lng sont définis et sont des nombres
      if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {

        reverseGeocode(lat, lng).then((lieu) => {
          setCurrentReclamation((prev) => ({
            ...prev,
            lat,
            lng,
            lieu, // Mise à jour du lieu dynamiquement
          }));
        }).catch((error) => {
          console.error('Erreur lors de la géocodification inverse:', error);
        });
      } else {
        console.error('Coordonnées invalides:', lat, lng); // Log si lat et lng sont invalides
      }
    },
  });

  return null; // ou votre composant JSX ici
}



const ReclamationList = ({ role }) => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMoreData, setViewMoreData] = useState(null);
  const [filteredReclamations, setFilteredReclamations] = useState([]);

  const [modalCoordinates, setModalCoordinates] = useState({ lat: 33.8869, lng: 9.5375 });
  const [currentReclamation, setCurrentReclamation] = useState({
    id: '',
    title: '',
    description: '',
    status: '',
    cin: '',
    dateCreation: '',
    nom: '',
    prenom: '',
    tel: '',
    lieu: '',
    image: '',
    video: '',
    voice: '',
    lat: 51.505,
    lng: -0.09,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8080/reclamations/all';

      if (searchQuery.trim()) {
        let queryParam = '';

        if (!isNaN(searchQuery)) {
          if (searchQuery.length === 8) {
            queryParam = `cin=${searchQuery}`;
          } else if (searchQuery.length >= 6 && searchQuery.length <= 15) {
            let formattedTel = searchQuery.replace(/^0*/, '0');
            console.log("Numéro de téléphone formaté:", formattedTel);
            queryParam = `tel=${formattedTel}`;
          } else {
            queryParam = `id=${searchQuery}`;
          }
        } else {
          queryParam = `nom=${encodeURIComponent(searchQuery)}`;
        }

        url = `http://localhost:8080/reclamations/search?${queryParam}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.length === 0) {
        console.warn("Aucune réclamation trouvée.");
      } else {
      }

      setReclamations(data);
      setCurrentPage(1); // Reset to first page on new search
    } catch (error) {
      console.error('Erreur lors de la récupération des réclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les réclamations au démarrage
  useEffect(() => {
    fetchReclamations();
  }, []);

  // Apply search logic whenever searchQuery or reclamations change
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredReclamations(reclamations); // Show all reclamations if search is empty
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = reclamations.filter(reclamation =>
        Object.values(reclamation).some(value =>
          typeof value === "string" && value.toLowerCase().includes(lowercasedQuery)
        )
      );
      setFilteredReclamations(filtered);
    }
  }, [searchQuery, reclamations]);


  const handleShowLieu = (fullLieu, lat, lng) => {
    setViewMoreData({
      lieu: fullLieu || 'Adresse complète indisponible',
      lat: lat || 33.8869,
      lng: lng || 9.5375,
    });
  };

  const handleAddReclamation = async () => {
    // Vérifiez que lat et lng sont valides avant de faire le POST
    if (currentReclamation.lat && currentReclamation.lng) {
        try {
            const response = await fetch('http://localhost:8080/api/reclamations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentReclamation),
            });

            if (response.ok) {
                toast.success('Réclamation ajoutée avec succès!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                fetchReclamations();
                setShowModal(false);
            } else {
                toast.error('Erreur lors de l\'ajout de la réclamation.', {
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
            toast.error('Impossible d\'ajouter la réclamation. Veuillez réessayer.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    } else {
        toast.error("Erreur: coordonnées invalides", {
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

const handleEditReclamation = async () => {
    // Vérifiez que lat et lng sont valides avant de faire le PUT
    if (currentReclamation.lat && currentReclamation.lng) {
        try {
            const response = await fetch(`http://localhost:8080/reclamations/${currentReclamation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentReclamation),
            });

            if (response.ok) {
                toast.success('Réclamation mise à jour avec succès!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                fetchReclamations();
                setShowModal(false);
            } else {
                toast.error('Erreur lors de la mise à jour de la réclamation.', {
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
            toast.error('Impossible de mettre à jour la réclamation. Veuillez réessayer.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    } else {
        toast.error("Erreur: coordonnées invalides", {
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

const handleDeleteReclamation = async (id) => {
    try {
        const response = await fetch(`http://localhost:8080/api/reclamations/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            toast.success('Réclamation supprimée avec succès!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            fetchReclamations();
        } else {
            toast.error('Erreur lors de la suppression de la réclamation.', {
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
        toast.error('Impossible de supprimer la réclamation. Veuillez réessayer.', {
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

const handleEditClick = (item) => {
    setCurrentReclamation(item);
    setModalCoordinates({ lat: item.lat, lng: item.lng });
    setShowModal(true);
};

  // Calculate pagination values
  const totalPages = Math.ceil(filteredReclamations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReclamations = filteredReclamations.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div>Loading data...</div>;

  return (
    <>
      <div>
        <Row>
          <Col sm="12">
            <Card>
              <Card.Header className="d-flex justify-content-between">
                <div className="header-title">
                  <h4 className="card-title">List of Complaints</h4>
                </div>
                {role === 'agent' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setCurrentReclamation({
                        id: '',
                        title: '',
                        description: '',
                        status: 'Open',
                        cin: '',
                        dateCreation: '',
                        nom: '',
                        prenom: '',
                        tel: '',
                        lieu: '',
                        image: '',
                        video: '',
                        voice: '',
                        lat: 51.505,
                        lng: -0.09,
                      });
                      setModalCoordinates({ lat: 51.505, lng: -0.09 });
                      setShowModal(true);
                    }}
                  >
                    Add a complaint
                  </Button>
                )}
               <div>
                  <Link to="../dashboard/app/Reclamation-add">
                    <Button variant="primary">Add reclamation</Button>
                  </Link>
              </div>
              </Card.Header>
              
              <Card.Body>
              <Form className="mb-4">
                  <Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Search</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter CIN, Name, Phone, or ID"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col className="d-flex align-items-end">
                      <Button variant="primary" onClick={fetchReclamations}>
                        Search
                      </Button>
                    </Col>
                  </Row>
                </Form>

                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr className="ligth">
                        <th>N</th>
                        <th>Place</th>
                        <th>Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>CIN</th>
                        <th>Date of Creation</th>
                        <th>Image</th>
                        <th>Video</th>
                        <th>Voice</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReclamations.length > 0 ? (
                        currentReclamations.map((item) => (
                          <tr key={item.id}>
                            <td>
                              {item.niveau === 'NORMAL' && (
                                <span style={{ color: 'green', fontWeight: 'bold' }}>🟩</span>
                              )}
                              {item.niveau === 'MOYEN' && (
                                <span style={{ color: 'orange', fontWeight: 'bold' }}>🟧</span>
                              )}
                              {item.niveau === 'GRAVE' && (
                                <span style={{ color: 'red', fontWeight: 'bold' }}>🟥</span>
                              )}
                            </td>
                            <td>
                              {item.lieu.split(' ').slice(0, 3).join(' ') +
                                (item.lieu.split(' ').length > 3 ? ' ...' : '')}
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleShowLieu(item.lieu, item.lat, item.lng)}
                              >
                                View more
                              </Button>
                            </td>
                            <td>{item.nom}</td>
                            <td>{item.prenom}</td>
                            <td>{item.tel}</td>
                            <td>{item.cin}</td>
                            <td>{item.dateCreation}</td>
                            <td>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt="Image"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                              ) : (
                                "No image"
                              )}
                            </td>
                            <td>
                              {item.video ? (
                                <a href={item.video} target="_blank" rel="noopener noreferrer">
                                  Watch the video
                                </a>
                              ) : (
                                "No video"
                              )}
                            </td>
                            <td>
                              {item.voice ? (
                                <audio controls>
                                  <source src={item.voice} type="audio/mpeg" />
                                  Your browser does not support audio.
                                </audio>
                              ) : (
                                "No audio"
                              )}
                            </td>
                            <td>{item.description}</td>
                            <td>
                              <div className="flex align-items-center">
                                <Button
                                  variant="warning"
                                  className="btn-sm me-2"
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Button>
                                {role === 'admin' && (
                                  <Button
                                    variant="danger"
                                    className="btn-sm"
                                    onClick={() => handleDeleteReclamation(item.id)}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="13" className="text-center">
                            No claims found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Minimalist Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3">
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

        {/* Modal for Add/Edit Complaint */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {currentReclamation.id ? 'Modifier Réclamation' : 'Ajouter Réclamation'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReclamation.nom}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, nom: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReclamation.prenom}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, prenom: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReclamation.tel}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, tel: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={currentReclamation.description}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, description: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>CIN</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReclamation.cin}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, cin: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date Of Creation</Form.Label>
                <Form.Control
                  type="date"
                  value={currentReclamation.dateCreation}
                  onChange={(e) =>
                    setCurrentReclamation({
                      ...currentReclamation,
                      dateCreation: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Image (URL)</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReclamation.image}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, image: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Video (URL)</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReclamation.video}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, video: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Audio (URL)</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReclamation.voice}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, voice: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Place</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReclamation.lieu}
                  onChange={(e) =>
                    setCurrentReclamation({ ...currentReclamation, lieu: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
            {/* Carte d'affichage de l'emplacement */}
            <div style={{ height: '400px', width: '100%' }}>
              <MapContainer
                center={[currentReclamation.lat, currentReclamation.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[currentReclamation.lat, currentReclamation.lng]}>
                  <Popup>{currentReclamation.lieu}</Popup>
                </Marker>
                <LocationMarker setCurrentReclamation={setCurrentReclamation} />
              </MapContainer>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={currentReclamation.id ? handleEditReclamation : handleAddReclamation}
            >
              {currentReclamation.id ? 'Modifier' : 'Ajouter'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal for showing location details */}
        <Modal show={!!viewMoreData} onHide={() => setViewMoreData(null)}>
  <Modal.Header closeButton>
    <Modal.Title>Location Details</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>
      <strong>Place:</strong> {viewMoreData?.lieu}
    </p>
    <p>
      <strong>Latitude:</strong> {viewMoreData?.lat}
    </p>
    <p>
      <strong>Longitude:</strong> {viewMoreData?.lng}
    </p>
    <div style={{ height: '300px', width: '100%' }}>
      {/* Vérifiez si les coordonnées sont valides avant d'afficher la carte */}
      {viewMoreData?.lat && viewMoreData?.lng ? (
        <MapContainer
          center={[viewMoreData.lat, viewMoreData.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[viewMoreData.lat, viewMoreData.lng]}>
            <Popup>{viewMoreData?.lieu}</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p>Location not available</p>
      )}
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setViewMoreData(null)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>


      </div>
    </>
  );
};

export default ReclamationList;
