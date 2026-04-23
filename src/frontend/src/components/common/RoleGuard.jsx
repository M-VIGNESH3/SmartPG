const RoleGuard = ({ allowedRoles, children }) => {
  const userString = localStorage.getItem('smartpg_user');
  let userRole = null;
  if (userString) {
    try {
      userRole = JSON.parse(userString).role;
    } catch (e) {}
  }

  if (!userRole) return null;

  if (allowedRoles.includes(userRole)) {
    return children;
  }
  return null;
};

export default RoleGuard;
