import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Home from './components/Home/Home';
import SavedPage from './components/SavedPage';
import SearchPage from './components/SearchPage';
import WelcomePage from './components/WelcomePage';
import PostContract from './components/PostContract/PostContract';
import OpportunityDetails from './components/OpportunityDetails';
import DataVisualizationPage from './components/DataVisualizationPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/welcome" element={<Navigate to="/search" replace />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/opportunity/:id" element={<OpportunityDetails />} />
              <Route path="/data-analysis" element={<DataVisualizationPage />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    <PostContract />
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/search" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
