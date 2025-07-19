import { Navigate  } from "react-router-dom";
import { useAuth  } from "../../contexts/AuthContext";
import { Typography, Box  } from "@mui/material";
interface RoleGuardProps {
      children: React.ReactNode,
  allowedRoles: string[] }

export const RoleGuard : React.FC<RoleGuardProps> = ({ children, allowedRoles     }) => {
  const { user  } = useAuth();
  if(!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography variant="h5" color="error">
          You don't have permission to access this page
        </Typography>
      </Box>
    );
  }
  return <>{children}</>;
};
export default RoleGuard;
