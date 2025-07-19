import { useEffect, useState } from "react";
import { InboundMessage } from "ably";
import { ably } from "../../../../config";
import { AuthService, NotificationService } from "../../../../services";
import { PushNotification } from "../../../../interfaces";
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import Dropdown from "../dropdown";

export function User() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);

  const user = AuthService.getCurrentUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await NotificationService.getLatestNotifications();

          setNotifications(response.data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      fetchNotifications();
    }
  }, []);

  useEffect(() => {
    if (user) {
      const channel = ably.channels.get(`Notification:${user.id}`);
      const handleNewNotification = (message: InboundMessage) => {
        setNotifications((prevNotifications) => {
          const newNotification = JSON.parse(message.data);
          const updatedNotifications = [newNotification, ...prevNotifications];
          if (updatedNotifications.length > 4) {
            updatedNotifications.pop();
          }
          return updatedNotifications;
        });
      };

      channel.subscribe("Notification", handleNewNotification);

      return () => {
        channel.unsubscribe("Notification", handleNewNotification);
      };
    }
  }, [user]);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const minutes = differenceInMinutes(now, date);

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else {
      const hours = differenceInHours(now, date);
      if (hours < 24) {
        return `${hours} hours ago`;
      } else {
        const days = differenceInDays(now, date);
        return `${days} days ago`;
      }
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };
  return (
    <>
      {user === null ? (
        <div
          id="login-button"
          className="hidden lg:flex lg:flex-1 lg:justify-end"
        >
          <a
            href="/auth/login"
            className="login text-sm font-semibold leading-6 text-gray-900"
          >
            Log in <span aria-hidden="true">→</span>
          </a>
        </div>
      ) : (
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <div className="relative font-[sans-serif] w-max mx-auto">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-semibold border-none outline-none bg-gradient-to-r to-indigo-600 from-sky-400 hover:bg-white-900 active:bg-white-800"
              onClick={toggleNotification}
            >
              <i
                className="fa-regular fa-bell fa-lg"
                style={{ color: "white" }}
              />
            </button>
            {isNotificationOpen && (
              <div className="absolute shadow-lg bg-white py-2 z-[1000] min-w-full rounded-lg w-[410px] max-h-[500px] overflow-auto">
                <div className="flex items-center justify-between my-4 px-4">
                  <p className="text-xs text-blue-500 cursor-pointer">
                    Clear all
                  </p>
                  <p className="text-xs text-blue-500 cursor-pointer">
                    Mark as read
                  </p>
                </div>
                <ul className="divide-y">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="py-4 px-4 flex items-center hover:bg-gray-50 text-black text-sm cursor-pointer"
                    >
                      <div className="ml-6">
                        <h3 className="text-sm text-[#333] font-semibold">
                          {notification.creatorDisplayName
                            ? `You have a new message from ${notification.creatorDisplayName}`
                            : "System Notification"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-blue-500 leading-3 mt-2">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-sm px-4 mt-6 mb-4 inline-block text-blue-500 cursor-pointer">
                  View all Notifications
                </p>
              </div>
            )}
          </div>

          <a href="/profile" className="group block flex-shrink-0">
            <div id="user-header-card" className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-indigo-600 rounded-full shadow-md border border-gray-200"></div>
              <div className="relative flex items-center justify-center p-1 bg-white rounded-full shadow-lg">
                <div>
                  <img
                    className="inline-block h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt=""
                  />
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                    {user.displayName}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </a>

          <Dropdown />

          {/* <button id="dropdownMenuIconButton" data-dropdown-toggle="dropdownDots" className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600" type="button">
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </button>

          <div id="dropdownDots" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
              </li>
            </ul>
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Separated link</a>
            </div>
          </div>

          <button id="dropdownMenuIconHorizontalButton" data-dropdown-toggle="dropdownDotsHorizontal" className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600" type="button">
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
              <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            </svg>
          </button>

          <div id="dropdownDotsHorizontal" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconHorizontalButton">
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
              </li>
            </ul>
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Separated link</a>
            </div>
          </div> */}

          <div className="border-l mx-4" />
          <button
            id="logout-button"
            onClick={handleLogout}
            className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-600 pt-1"
          >
            Log out <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </>
  );
}
