import { Navigate, useLocation  } from "react-router-dom";
import { useAuth  } from "../../contexts/AuthContext";
import { CircularProgress, Box  } from "@mui/material";
interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading  } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
export default AuthGuard;
