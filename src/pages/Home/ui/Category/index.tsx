import { useNavigate } from "react-router-dom";



export function Category() {
  const navigate = useNavigate();``
  const handleSignUp = async () => {
    navigate("/auth/signup");
  }
  return (
    <>
      <div className="bg-white">
        <div className="py-16 sm:py-24 xl:mx-auto xl:max-w-7xl xl:px-8">
          <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent">
              Subject
            </h2>

            <a
              href="#"
              className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block"
            >
              Get the guides
              <span aria-hidden="true"> →</span>
            </a>
          </div>
          <div className="mt-4 flow-root">
            <div className="-my-2">
              <div className="relative box-content h-80 overflow-x-auto py-2 ">
                <div className="absolute flex space-x-4 px-4 sm:px-6 lg:px-8 xl:relative xl:grid xl:grid-cols-5 xl:gap-x-4 xl:space-x-0 xl:px-0">
                  <a
                    href="#"
                    className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
                  >
                    <span aria-hidden="true" className="absolute inset-0">
                      <img
                        src="https://i.ibb.co/p2TKqwG/Maths.jpg"
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                    />
                    <span className="relative mt-auto text-center text-xl font-bold text-white">
                      Maths
                    </span>
                  </a>
                  <a
                    href="#"
                    className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
                  >
                    <span aria-hidden="true" className="absolute inset-0">
                      <img
                        src="https://i.ibb.co/VvprhGs/english.png"
                        className="h-full w-full object-cover object-center"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                    />
                    <span className="relative mt-auto text-center text-xl font-bold text-white">
                      English
                    </span>
                  </a>
                  <a
                    href="#"
                    className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
                  >
                    <span aria-hidden="true" className="absolute inset-0">
                      <img
                        src="https://i.ibb.co/0FV16rR/physic.webp"
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                    />
                    <span className="relative mt-auto text-center text-xl font-bold text-white">
                      Physics
                    </span>
                  </a>
                  <a
                    href="#"
                    className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
                  >
                    <span aria-hidden="true" className="absolute inset-0">
                      <img
                        src="https://i.ibb.co/0ZWc7B3/chemistry.jpg"
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                    />
                    <span className="relative mt-auto text-center text-xl font-bold text-white">
                      Chemistry
                    </span>
                  </a>
                  <a
                    href="#"
                    className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
                  >
                    <span aria-hidden="true" className="absolute inset-0">
                      <img
                        src="https://i.ibb.co/BzLNrHf/geography.jpg"
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                    />
                    <span className="relative mt-auto text-center text-xl font-bold text-white">
                      Geography
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 px-4 sm:hidden">
            <a
              href="#"
              className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Browse all categories
              <span aria-hidden="true"> →</span>
            </a>
          </div>
        </div>
      </div>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl">
          <div className="relative overflow-hidden rounded-lg">
            <div className="absolute inset-0">
            </div>
            <div
              className="relative h-96 w-full lg:hidden"
            />
            <div
              aria-hidden="true"
              className="relative h-32 w-full lg:hidden"
            />
            <div className="flex">
              <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-6">
                <div className="relative lg:w-1/3 bg-white bg-opacity-90 p-8 backdrop-blur-lg backdrop-filter rounded-bl-lg rounded-br-lg lg:rounded-br-none lg:rounded-tl-lg shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                  <div className="flex flex-col items-center justify-center py-10 px-6 bg-gray-50 rounded-lg shadow-lg">
                    <div className="relative">
                      <h2 className="relative font-extrabold font-handwriting text-2xl text-purple-700 z-10 ">
                        Start as Learner!
                      </h2>
                      <div className="top-1/2 left-0 transform -translate-y-1/2 w-full h-10 bg-yellow-400 rotate-3 -z-10 rounded-md"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-800 text-center">
                      Get a free tutoring session for yourself to see how other tutors use the site. Not only will you get homework help, but you'll also gain the confidence to see if tutoring is right for you!
                    </p>
                  </div>
                  <a href="#" className="mt-6 flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-sky-500 to-indigo-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform transform hover:scale-105 w-full"
                    onClick={handleSignUp}>
                    Sign Up as Learner
                  </a>
                </div>

                <div className="relative flex overflow-hidden lg:w-2/3">
                  <video className="w-70 h-100 object-cover border-2 rounded-md border-indigo-300" autoPlay muted>
                    <source src="src/assets/intro.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
