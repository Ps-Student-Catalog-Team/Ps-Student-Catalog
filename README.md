# Ps-Student-Catalog
The open source of Student Catalog built in senior high school "Ps"

## Project Structure

```
Ps-Student-Catalog/
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── 后续整理指南.md
├── main.js                 # Electron main process file
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Locked dependencies
├── index.html              # Main website page
├── about_us.html           # About us page
├── clock.html              # Clock page
├── clock2.html             # Alternative clock page
├── comment.html            # Comment page
├── login.html              # Login page
├── css/                    # CSS styles
├── js/                     # JavaScript files
├── img/                    # Image resources
├── fonts/                  # Font files
├── ErrorFiles/             # Error pages
├── server/                 # Backend server files
├── public/                 # Public website files
├── tutorial/               # Tutorial files
└── other directories/      # Other project directories
```

## About the Project

The Student Catalog is a platform designed to provide file storage and transfer services for students,弥补ing the gap left by the school's lack of dedicated student file services. Built using web technologies and now with Electron support for desktop application usage, it offers a convenient and efficient way for students to manage their files.

### Key Features
- File upload and download functionality
- Tutorial viewing capabilities
- User-friendly web interface
- Desktop application support via Electron
- Multiple utility pages (clocks, comments, etc.)

## Getting Started

### Web Version
You can access the web version by opening `index.html` in your browser or by setting up the backend server:

```bash
cd server
npm install
node server.js
```

### Electron Desktop Application

#### Prerequisites
- Node.js installed on your system
- npm package manager

#### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Electron application:
   ```bash
   npm start
   ```

3. Build the application for Windows:
   ```bash
   npm run build:win
   ```

## Available Scripts

- `npm start` - Start the Electron application
- `npm run build` - Build the Electron application for all platforms
- `npm run build:win` - Build the Electron application specifically for Windows

## Why We Need a Student Catalog

The school provides SMB-based file transfer services for teachers but lacks similar services for students. This creates inconvenience for students who need to transfer files between devices on campus. The Student Catalog addresses this issue by providing:

- A web-based platform accessible from any device on the network
- A desktop application option for even greater convenience
- A user-friendly interface for easy file management
- Reliable file storage and transfer capabilities

## Development

All code has been independently developed and is open source. Contributions are welcome to help improve and expand the functionality of the Student Catalog.

## Contact

For any ideas or suggestions, feel free to reach out via email at classicmcnet@outlook.com

## License

This project is open source and available under the MIT License.


Yuebi

2026.01.01