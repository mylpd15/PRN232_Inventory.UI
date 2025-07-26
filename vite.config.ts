import basicSsl from "@vitejs/plugin-basic-ssl";

export default {
  plugins: [basicSsl()],
  server: {
    host: '127.0.0.1', // Use IPv4 instead of ::1 (IPv6)
    port: 5173,        // You can change this if the port is in use
    https: true,       // Required because you're using basicSsl()
  },
};
