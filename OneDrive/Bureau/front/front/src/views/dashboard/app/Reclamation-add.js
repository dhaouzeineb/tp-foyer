import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Card from '../../../components/Card';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useMap } from 'react-leaflet';

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);

    return null;
};

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ReclamationAdd = () => {
    const [userId, setUserId] = useState('');
    const [nom, setName] = useState('');
    const [prenom, setLastName] = useState('');
    const [cin, setCin] = useState('');
    const [description, setDescription] = useState('');
    const [niveau, setNiveau] = useState('');
    const [lieu, setLieu] = useState('');
    const [tel, setTel] = useState('');
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);
    const [video, setVideo] = useState(null);
    const [lat, setLat] = useState(36.8065); // Latitude par défaut (Tunis)
    const [lng, setLng] = useState(10.1815); // Longitude par défaut
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [agents, setAgents] = useState([]);  // Initialize as an empty array

    


    // Fonction pour récupérer l'adresse à partir des coordonnées
    const fetchAddress = async (latitude, longitude) => {
        try {
            const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: 'json',
                },
            });
            setLieu(response.data.display_name || 'Adresse introuvable');
        } catch (error) {
            console.error('Erreur lors de la récupération de l’adresse:', error);
            setLieu('Adresse non disponible');
        }
    };

    // Capture le clic sur la carte et met à jour lat/lng
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                setLat(e.latlng.lat);
                setLng(e.latlng.lng);
                fetchAddress(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };

    // Met à jour l'adresse si lat/lng changent manuellement
    useEffect(() => {
        // Récupérer la liste des agents
        axios.get('http://localhost:8080/api/users/agents')
        .then(response => {
            if (response.data && response.data.length > 0) {
                setAgents(response.data);  // Update the agents state
            } else {
                console.log("No agents found");
            }
        })
        .catch(error => {
            console.error("Error fetching agents:", error);
        });
    
        // Appeler la fonction fetchAddress si lat et lng sont définis
        if (lat && lng) {
            fetchAddress(lat, lng);
        }
    }, [lat, lng]);
    
    

    const [fieldErrors, setFieldErrors] = useState({});


    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFieldErrors({});
      
        // build form data
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("nom", nom);
        formData.append("prenom", prenom);
        formData.append("cin", cin);
        formData.append("description", description);
        formData.append("niveau", niveau);
        formData.append("lieu", lieu);
        formData.append("tel", tel);
        formData.append("lat", lat);
        formData.append("lng", lng);
        if (image) formData.append("image", image);
        if (audio) formData.append("voice", audio);
        if (video) formData.append("video", video);
      
        // validation
        const errors = {};
        const nameRegex = /^[A-Za-z\s]+$/;
        const numberRegex = /^[0-9]{8}$/;
        if (!nom.trim() || !nameRegex.test(nom))    errors.nom = "Nom invalide (lettres seulement).";
        if (!prenom.trim() || !nameRegex.test(prenom)) errors.prenom = "Prénom invalide (lettres seulement).";
        if (!description.trim())                    errors.description = "La description ne doit pas être vide.";
        if (!cin || !numberRegex.test(cin))         errors.cin = "Le CIN doit comporter 8 chiffres.";
        if (!tel || !numberRegex.test(tel))         errors.tel = "Le téléphone doit comporter 8 chiffres.";
        if (!lieu.trim())                           errors.lieu = "Le lieu ne doit pas être vide.";
        if (!niveau.trim())                         errors.niveau = "Le niveau ne doit pas être vide.";
      
        if (Object.keys(errors).length) {
          setFieldErrors(errors);
          setLoading(false);
          return;
        }
      
        // common toast config
        const toastOpts = {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        };
      
        try {
          // 1️⃣ Create the réclamation
          const recResp = await axios.post(
            `http://localhost:8080/reclamations/add?userId=${userId}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
      
          if (recResp.status === 201) {
            // 2️⃣ Push a notification for the agent
         // Modifier la partie création de notification
await axios.post("http://localhost:8080/api/notifications", {
    agentId: userId,
    title: "Nouvelle réclamation",
    message: `Réclamation de ${nom} ${prenom}`,
    link: `/dashboard/reclamations/${recResp.data.id}` // Ajouter le préfixe dashboard
  });
      
            toast.success("Réclamation et notification créées avec succès !", toastOpts);
            // reset form if desired:
            // setNom(""); setPrenom(""); … etc.
          } else {
            toast.error("Erreur lors de l'ajout de la réclamation.", toastOpts);
          }
      
        } catch (err) {
          console.error(err);
          toast.error("Impossible d'ajouter la réclamation. Veuillez réessayer.", toastOpts);
        } finally {
          setLoading(false);
        }
      };
      

  
    
    



    return (
        <Row>
            <Col xl="12" lg="4">
                <Card>
                    <Card.Header>
                        <h4 className="card-title">Add Reclamation</h4>
                    </Card.Header>
                    <Card.Body>
                        {error && <p style={{ color: 'red' }}>{error.general}</p>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className='mb-4'>
                                <Form.Label>Name:</Form.Label>
                                <Form.Control type="text" value={nom} onChange={(e) => setName(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className='mb-4'>
                                <Form.Label>Last Name:</Form.Label>
                                <Form.Control type="text" value={prenom} onChange={(e) => setLastName(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className='mb-4'>
                                <Form.Label>CIN:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={cin}
                                    onChange={(e) => {
                                        setCin(e.target.value);
                                        setFieldErrors({ ...fieldErrors, cin: "" }); // Supprime l'erreur lorsque l'utilisateur tape
                                    }}
                                    required
                                />
                                {fieldErrors.cin && <p style={{ color: 'red', fontSize: '0.9rem' }}>{fieldErrors.cin}</p>}
                            </Form.Group>

                            <Form.Group className='mb-4'>
                                <Form.Label>Phone:</Form.Label>
                                <Form.Control
                                    country={'tn'}
                                    type="text"
                                    value={tel}
                                    onChange={(e) => {
                                        setTel(e.target.value);
                                        setFieldErrors({ ...fieldErrors, tel: "" }); // Supprime l'erreur lorsque l'utilisateur tape
                                    }}
                                    required
                                />
                                {fieldErrors.tel && <p style={{ color: 'red', fontSize: '0.9rem' }}>{fieldErrors.tel}</p>}
                            </Form.Group>

                            <Form.Group className='mb-4'>
                                <Form.Label>Description:</Form.Label>
                                <Form.Control as="textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className='mb-4'>
                                <Form.Label>Place:</Form.Label>
                                <Form.Control type="text" value={lieu} disabled />
                            </Form.Group>

                            {/* Champs pour latitude et longitude */}
                            <Form.Group className='mb-4'>
                                <Form.Label>Latitude:</Form.Label>
                                <Form.Control type="number" step="any" value={lat} onChange={(e) => setLat(parseFloat(e.target.value) || 0)} required />
                            </Form.Group>
                            <Form.Group className='mb-4'>
                                <Form.Label>Longitude:</Form.Label>
                                <Form.Control type="number" step="any" value={lng} onChange={(e) => setLng(parseFloat(e.target.value) || 0)} required />
                            </Form.Group>

                            {/* Carte interactive */}
                            <MapContainer center={[lat, lng]} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '10px' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapClickHandler />
                                <RecenterMap lat={lat} lng={lng} />  {/* Ajout pour recentrer la carte */}
                                <Marker position={[lat, lng]} />
                            </MapContainer>

                            <Form.Group className='mb-4'>
                                <Form.Label>Emergency Level:</Form.Label>
                                <select className="form-control" value={niveau} onChange={(e) => setNiveau(e.target.value)} required>
                                    <option value="NORMAL">NORMAL</option>
                                    <option value="MOYEN">MEDIUM</option>
                                    <option value="GRAVE">HIGHT</option>
                                </select>
                            </Form.Group>
                            <Form.Group className='mb-4'>
                                <Form.Label>Image:</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                            </Form.Group>
                            <Form.Group className='mb-4'>
                                <Form.Label>Audio:</Form.Label>
                                <Form.Control type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />
                            </Form.Group>
                            <Form.Group className='mb-4'>
                                <Form.Label>Video:</Form.Label>
                                <Form.Control type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />
                            </Form.Group>

                            <Form.Group className='mb-4'>
    <Form.Label>Agent:</Form.Label>
    <Form.Select value={userId} onChange={(e) => setUserId(e.target.value)} required>
        <option value="">Sélectionnez un agent</option>
        {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
                {agent.nom} {agent.prenom}
            </option>
        ))}
    </Form.Select>
</Form.Group>


                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Ajout en cours...' : 'Ajouter'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ReclamationAdd;
