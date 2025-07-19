import { useNavigate } from "react-router-dom";
import React from "react";


export function HeroSection() {
  const navigate = useNavigate();
  const handleSignUp = async () => {
    navigate("/auth/signup");
  }

  return (
    <div className="relative overflow-hidden bg-white">
      <div
        className="hidden lg:absolute lg:inset-0 lg:block"
        aria-hidden="true"
      >
        <svg
          className="absolute left-1/2 top-0 -translate-y-8 translate-x-64 transform"
          width={640}
          height={784}
          fill="none"
          viewBox="0 0 640 784"
        >
          <defs>
            <pattern
              id="9ebea6f4-a1f5-4d96-8c4e-4c2abf658047"
              x={118}
              y={0}
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <rect
                x={0}
                y={0}
                width={4}
                height={4}
                className="text-gray-200"
                fill="currentColor"
              />
            </pattern>
          </defs>
          <rect
            y={72}
            width={640}
            height={640}
            className="text-gray-50"
            fill="currentColor"
          />
          <rect
            x={118}
            width={404}
            height={784}
            fill="url(#9ebea6f4-a1f5-4d96-8c4e-4c2abf658047)"
          />
        </svg>
      </div>
      <div className="relative pb-16 pt-6 sm:pb-24 lg:pb-32">
        <main className="mx-auto mt-16 max-w-7xl px-4 px-6 sm:mt-24 lg:mt-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
              <h1 className="header">
                <span className="mt-1 block text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  <span className="block bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent">
                    Teach Mate Website
                  </span>
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                TeachMate is a groundbreaking platform in the field of peer tutor management, designed to optimize teaching effectiveness and enhance the comprehensive customer experience. With TeachMate, learning becomes easy, engaging and inspiring, helping learners not only achieve their learning goals but also discover and develop their potential.{" "}
              </p>
              <div className="mt-1 block font-bold tracking-tight">
                <p className="block bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent">
                  Sign up to get notified when it’s ready.
                </p>
                <form action="#" method="POST" className="mt-3 sm:flex">
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="block w-full rounded-md border-gray-300 py-3 text-base placeholder-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:flex-1"
                    placeholder="Enter your email"
                  />
                  <button onClick={handleSignUp}
                    type="button"
                    className="mt-3 w-full rounded-md bg-gradient-to-r to-indigo-600 from-sky-400 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:inline-flex sm:w-auto sm:flex-shrink-0 sm:items-center"
                  >
                    Notify me
                  </button>
                </form>
                <p className="mt-3 text-sm text-gray-300">
                  We care about the protection of your data. Read our{" "}
                  <a href="#" className="font-medium bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
            <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
              <svg
                className="absolute left-1/2 top-0 origin-top -translate-x-1/2 -translate-y-8 scale-75 transform sm:scale-100 lg:hidden"
                width={640}
                height={784}
                fill="none"
                viewBox="0 0 640 784"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="4f4f415c-a0e9-44c2-9601-6ded5a34a13e"
                    x={118}
                    y={0}
                    width={20}
                    height={20}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x={0}
                      y={0}
                      width={4}
                      height={4}
                      className="text-gray-200"
                      fill="currentColor"
                    />
                  </pattern>
                </defs>
                <rect
                  y={72}
                  width={640}
                  height={640}
                  className="text-gray-50"
                  fill="currentColor"
                />
                <rect
                  x={118}
                  width={404}
                  height={784}
                  fill="url(#4f4f415c-a0e9-44c2-9601-6ded5a34a13e)"
                />
              </svg>
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <button
                  type="button"
                  className="relative block w-full overflow-hidden rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Watch our video to learn more</span>
                  <img
                    className="w-full"
                    src="https://i.ibb.co/jW6LPMP/study.jpg"
                    alt=""
                  />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
