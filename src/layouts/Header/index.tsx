import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services";
import { UserRole } from "../../common/enums";
import { User } from "./ui";
import { toast } from 'react-hot-toast';

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false); // State to control sticky behavior
  const [isScrolled, setIsScrolled] = useState(false); // State to control opacity on scroll

  const handleSearch = async () => {
    navigate("/search", { state: { searchQuery } });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleScroll = () => {
    if (window.scrollY > 0) {
      setIsSticky(true);
      setIsScrolled(true);
    } else {
      setIsSticky(false);
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const appUser = AuthService.getCurrentUser();
  const isLogin = AuthService.isLogin();
  return (
    <header
      className={`bg-white ${isSticky ? "sticky top-0 z-50 shadow-md" : ""} ${
        isScrolled ? "opacity-75" : ""
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1 items-center">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Resort Hub Logo</span>
            <img
              className="h-12 w-auto indigo-400"
              src="https://svgur.com/i/18J9.svg"
              alt="Logo"
            />
          </a>
          <form
            className="search relative flex ml-6"
            style={{ marginLeft: "50px" }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="relative w-full flex rounded-lg overflow-hidden bg-gradient-to-r from-sky-400 to-indigo-600/30 p-0.5 shadow-lg">
              <input
                type="search"
                className="block w-full p-2.5 text-sm text-gray-900 bg-white border-none rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Search..."
                onChange={handleInputChange}
                value={searchQuery}
              />
              <button
                type="submit"
                className="p-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-500/50 to-indigo-500/20 border-none rounded-r-lg ml-0.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 19l-6-6M11 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:flex lg:gap-x-12 items-center">
          {appUser?.userRole === UserRole.WarehouseStaff && (
            <a
              href="/learning"
              className="learning text-sm font-semibold leading-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600 hover:bg-indigo-100 py-2 px-4 rounded-md transition duration-300"
            >
              Learning
            </a>
          )}
          {appUser?.userRole === UserRole.WarehouseManager && (
            <a
              href="/teaching"
              className="teaching text-sm font-semibold leading-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600 hover:bg-indigo-100 py-2 px-4 rounded-md transition duration-300"
            >
              Teaching
            </a>
          )}
          <a
            href="/forum"
            className="forum text-sm font-semibold leading-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600 hover:bg-indigo-100 py-2 px-4 rounded-md transition duration-300"
          >
            Forum
          </a>
          <a
            href="/contact"
            className="news text-sm font-semibold leading-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600 hover:bg-indigo-100 py-2 px-4 rounded-md transition duration-300"
          >
            Contact
          </a>
          <a
            href={import.meta.env.VITE_TEACHMATE_CHATAPP_URL}
            className="chat text-sm font-semibold leading-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600 hover:bg-indigo-100 py-2 px-4 rounded-md transition duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat
          </a>
        </div>

        <button
          id="openMobileNav"
          type="button"
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 lg:hidden"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12h18M3 6h18M3 18h18"
            />
          </svg>
        </button>

        <User />
        {isLogin && (
          <button
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() => {
              AuthService.logout();
              toast.success('Đã đăng xuất!');
              navigate('/auth/login');
            }}
          >
            Log out
          </button>
        )}
      </nav>

      {/* Mobile navigation menu */}
      <div
        id="mobileNav"
        className="lg:hidden"
        role="dialog"
        aria-modal="true"
        style={{ display: "none" }}
      >
        <div className="fixed inset-0 z-10 bg-gray-900/50" />
        <div className="fixed inset-y-0 right-0 z-20 w-full max-w-sm bg-white shadow-lg py-6 px-4 sm:max-w-xs">
          <div className="flex justify-between items-center mb-6">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Resort Hub Logo</span>
              <img
                className="h-10 w-auto"
                src="../assets/images/logo.png"
                alt=""
              />
            </a>
            <button
              id="closeMobileNav"
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div>
            <a
              href="#"
              className="block py-2.5 px-4 text-base font-semibold text-gray-900 hover:bg-gray-100 rounded-md transition duration-300"
            >
              Product
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 text-base font-semibold text-gray-900 hover:bg-gray-100 rounded-md transition duration-300"
            >
              Features
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 text-base font-semibold text-gray-900 hover:bg-gray-100 rounded-md transition duration-300"
            >
              Marketplace
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 text-base font-semibold text-gray-900 hover:bg-gray-100 rounded-md transition duration-300"
            >
              Company
            </a>
          </div>
          <div id="login-button" className="mt-6">
            <a
              href="#"
              className="block py-2.5 px-4 text-base font-semibold text-gray-900 hover:bg-gray-100 rounded-md transition duration-300"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
