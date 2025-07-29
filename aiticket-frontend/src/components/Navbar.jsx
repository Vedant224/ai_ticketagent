import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <nav className="navbar bg-[#121212] border-b border-b-red-100 shadow-lg  px-6 py-3 flex items-center justify-between ">
      <Link to="/" className="text-2xl font-extrabold text-white tracking-wide">
        Ai Ticketing System
      </Link>
      <div className="flex gap-3 items-center">
        
        {token ? (
          <>
            <span className="hidden md:inline text-white font-medium">Hi, {user?.email}</span>
            {user && user?.role === "admin" ? (
              <Link to="/admin" className={`btn btn-ghost btn-sm text-white border-b-2 border-white ${location.pathname === '/admin' ? 'border-b-2 border-white' : ''}`}>
                Admin
              </Link>
            ) : null}
            <button onClick={logout} className="btn btn-secondary btn-sm text-white">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="btn btn-outline btn-sm text-white border-white">
              Signup
            </Link>
            <Link to="/login" className="btn bg-slate-300 btn-sm text-zinc-800">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
