import React, { Fragment, useState, useEffect } from 'react';
import FsLightbox from 'fslightbox-react';
import axios from 'axios';
import { Row, Col, Image, Nav, Tab } from 'react-bootstrap';
import Card from '../../../components/Card';
import { Link } from 'react-router-dom';

// Image imports
import avatars11 from '../../../assets/images/avatars/01.png';


// Icons
import icon1 from '../../../assets/images/icons/01.png';
import icon2 from '../../../assets/images/icons/02.png';
import icon4 from '../../../assets/images/icons/04.png';
import icon8 from '../../../assets/images/icons/08.png';
import icon5 from '../../../assets/images/icons/05.png';

// Shapes
import shap2 from '../../../assets/images/shapes/02.png';
import shap4 from '../../../assets/images/shapes/04.png';
import shap6 from '../../../assets/images/shapes/06.png';


const UserProfile = () => {
  // State for the lightbox toggler
  const [toggler, setToggler] = useState(false);
  // State for storing fetched user data
  const [user, setUser] = useState(null);
  // State for managing loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Retrieve the logged-in user's email from localStorage
        const loggedInEmail = localStorage.getItem('email');
        if (!loggedInEmail) {
          setLoading(false);
          return;
        }

        // Retrieve the authentication token from localStorage or sessionStorage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Make the API call to fetch user data by email
        const response = await axios.get(
          `http://localhost:8080/api/users/email/${encodeURIComponent(loggedInEmail)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update state with the fetched user data
        if (response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Display a loading message while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user data is available, show a message
  if (!user) {
    return <div>No user found.</div>;
  }

  return (
    <Fragment>
      <FsLightbox
        toggler={toggler}
        sources={[icon4, shap2, icon8, shap4, icon2, shap6, icon5, shap4, icon1]}
      />
      <Tab.Container defaultActiveKey="first">
        <Row>
          {/* Profile Card */}
          <Col lg="12">
            <Card>
              <Card.Body>
                <div className="d-flex flex-wrap align-items-center justify-content-between">
                  {/* Profile Image */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="profile-img position-relative me-3">
                      <Image
                        className="theme-color-default-img img-fluid rounded-pill avatar-100"
                        src={avatars11}
                        alt="profile-pic"
                      />
                    </div>
                    <div>
                      <h4 className="me-2 h4">{user.nom} {user.prenom}</h4>
                      <span className="d-block">{user.role || ' '}</span>
                    </div>
                  </div>
                  {/* Right Nav (Profile Tab) */}
          
                </div>

                {/* User Details */}
                <div className="mt-4">
                  <h5>About User</h5>
                  <div className="mt-2">
                    <h6 className="mb-1">Email:</h6>
                    <p>
                      <Link to="#" className="text-body">
                        {user.email}
                      </Link>
                    </p>
                  </div>
                  <div className="mt-2">
                    <h6 className="mb-1">Name:</h6>
                    <p>{user.nom}</p>
                  </div>
                  <div className="mt-2">
                    <h6 className="mb-1">Last Name:</h6>
                    <p>{user.prenom}</p>
                  </div>
                  <div className="mt-2">
                    <h6 className="mb-1">Phone:</h6>
                    <p>{user.tel}</p>
                  </div>
                  <div className="mt-2">
                    <h6 className="mb-1">Address:</h6>
                    <p>{user.adresse}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>
    </Fragment>
  );
};

export default UserProfile;

