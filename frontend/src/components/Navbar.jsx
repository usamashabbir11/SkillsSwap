import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800  text-white">
      <div className="flex gap-4">
        <span className="font-semibold ">
          Welcome {user?.name}
          
        </span>

        <button  className="hover:underline cursor-pointer"  onClick={() => navigate("/profile")}>Profile</button>
        <button    className="hover:underline cursor-pointer"   onClick={() => navigate("/users")}>All Users</button>
      </div>

      <button
        onClick={logout}
        className="bg-red-500 px-3 py-1 rounded"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
