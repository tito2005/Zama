# ZAMA - AI-Powered Development Platform

A complete rebuild of the ZAMA AI-powered development platform using HTML, CSS, JavaScript, and PHP.

## Features

- **User Authentication**: Complete registration, login, and email verification system
- **AI Chat Interface**: Interactive chat with AI assistance for development tasks
- **Code Editor**: Syntax-highlighted code editor with file management
- **Project Management**: Create, manage, and organize development projects
- **Real-time Preview**: Live preview of web applications
- **Terminal Integration**: Built-in terminal for command execution
- **Dashboard**: Comprehensive dashboard with usage analytics
- **Token Management**: Track and manage AI token usage
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **AI Integration**: Groq API (Llama 3 model)
- **Styling**: Custom CSS with CSS Variables for theming
- **Icons**: Custom icon font

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zama-platform
   ```

2. **Set up the database**
   - Create a MySQL database named `zama_platform`
   - Import the `database.sql` file
   ```bash
   mysql -u your_username -p zama_platform < database.sql
   ```

3. **Configure the application**
   - Update database credentials in `includes/config.php`
   - Set your Groq API key in `includes/config.php`

4. **Set up web server**
   - Configure Apache/Nginx to serve the application
   - Ensure PHP 7.4+ is installed with required extensions

5. **File permissions**
   ```bash
   chmod 755 uploads/
   chmod 644 includes/config.php
   ```

## Configuration

### Database Configuration
Update the database settings in `includes/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'zama_platform');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### API Configuration
Set your Groq API key:

```php
define('GROQ_API_KEY', 'your_groq_api_key');
```

## Usage

1. **Registration**: Create a new account at `/register.php`
2. **Email Verification**: Check your email and click the verification link
3. **Login**: Sign in at `/login.php`
4. **Dashboard**: Access your dashboard to view projects and usage
5. **Chat Interface**: Start building with AI assistance on the main page
6. **Code Editor**: Edit files in the integrated code editor
7. **Preview**: View your applications in the built-in preview panel

## File Structure

```
zama-platform/
├── assets/
│   ├── css/
│   │   ├── main.css          # Main styles
│   │   ├── auth.css          # Authentication styles
│   │   ├── dashboard.css     # Dashboard styles
│   │   └── animations.css    # Animation styles
│   └── js/
│       ├── main.js           # Core JavaScript
│       ├── auth.js           # Authentication logic
│       ├── chat.js           # Chat functionality
│       ├── workbench.js      # Code editor and workbench
│       ├── editor.js         # Code editor features
│       └── dashboard.js      # Dashboard functionality
├── includes/
│   ├── config.php            # Configuration settings
│   └── auth.php              # Authentication functions
├── api/
│   ├── chat.php              # Chat API endpoint
│   └── files.php             # File management API
├── index.php                 # Main application page
├── login.php                 # Login page
├── register.php              # Registration page
├── dashboard.php             # User dashboard
├── verify.php                # Email verification
├── logout.php                # Logout handler
└── database.sql              # Database schema
```

## API Endpoints

### Chat API (`/api/chat.php`)
- **POST**: Send messages to AI and receive responses
- **Authentication**: Required
- **Rate Limiting**: Based on user token limits

### Files API (`/api/files.php`)
- **GET**: Retrieve project files
- **POST**: Create new files
- **PUT**: Update existing files
- **DELETE**: Remove files
- **Authentication**: Required

## Security Features

- Password hashing with bcrypt
- SQL injection prevention with prepared statements
- XSS protection with input sanitization
- CSRF protection for forms
- Session management with secure cookies
- Email verification for new accounts

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.