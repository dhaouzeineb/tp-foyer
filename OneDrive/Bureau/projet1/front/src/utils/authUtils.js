export const getToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
 }
 
 // Check if the user is authenticated
 export const isAuthenticated = () => {
    const token = getToken()
    return !!token // Returns true if token exists, false otherwise
 }
 
 // Logout function to remove token and user info
 export const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userInfo')
    sessionStorage.removeItem('authToken')
    // Optionally redirect to login page
    window.location.href = '/login'
 }
 
 // Add an axios interceptor to include token in requests
 import axios from 'axios'
 
 export const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
       config => {
          const token = getToken()
          if (token) {
             config.headers['Authorization'] = `Bearer ${token}`
          }
          return config
       },
       error => {
          return Promise.reject(error)
       }
    )
 
    // Interceptor to handle unauthorized errors (401)
    axios.interceptors.response.use(
       response => response,
       error => {
          if (error.response && error.response.status === 401) {
             // Token is invalid or expired
             logout()
          }
          return Promise.reject(error)
       }
    )
 }