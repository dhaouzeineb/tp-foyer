import React from "react";
import { Container, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
// img
import error500 from "../../../assets/images/error/500.png";

const Unauthorized = () => {
  const styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",  // full screen height
      width: "100vw",   // full screen width
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      textAlign: "center",
      margin: 0,
      padding: 0,
      overflow: "hidden", // prevents scrollbars
    },
    container: {
      position: "relative",
      zIndex: 10,
      width: "100%",
      maxWidth: "600px",
      padding: "20px",
      boxSizing: "border-box",
    },
    image: {
      width: "100%",
      maxWidth: "400px",
      marginBottom: "20px",
    },
    title: {
      marginTop: "20px",
      fontSize: "24px",
      fontWeight: "bold",
    },
    button: {
      backgroundColor: "white",
      color: "#007bff",
      padding: "10px 20px",
      borderRadius: "5px",
      textDecoration: "none",
      display: "inline-block",
      marginTop: "15px",
    },
  };

  return (
    <div style={styles.page}>
      <Container style={styles.container}>
        <Image src={error500} style={styles.image} alt="Unauthorized" />
        <h2 style={styles.title}>Oops! You don’t have access.</h2>
        <p>The requested page does not exist.</p>
        <Link to="/dashboard" style={styles.button}>
          Back to Home
        </Link>
      </Container>
    </div>
  );
};

export default Unauthorized;
