// ReclamationDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ReclamationDetails = () => {
    const { id } = useParams();
    const [reclamation, setReclamation] = useState(null);

    useEffect(() => {
        const fetchReclamation = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/reclamations/${id}`);
                setReclamation(response.data);
            } catch (error) {
                console.error("Erreur chargement réclamation:", error);
            }
        };
        fetchReclamation();
    }, [id]);

    return (
        <div>
            {reclamation ? (
                <div>
                    <h2>Réclamation #{reclamation.id}</h2>
                    <p>Description: {reclamation.description}</p>
                    {/* Afficher autres détails */}
                </div>
            ) : (
                <p>Chargement...</p>
            )}
        </div>
    );
};

export default ReclamationDetails;