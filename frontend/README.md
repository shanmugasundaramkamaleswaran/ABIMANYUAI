# Abimanyu AI Frontend

Modern React + TypeScript frontend for Abimanyu AI application with real-time chat, sentiment visualization, and spiritual wisdom display.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── ChatInput.tsx    # Message input component
│   │   ├── ChatMessage.tsx  # Message display
│   │   ├── MentalHealthGraph.tsx  # Chart visualization
│   │   └── [Other feature components]
│   ├── lib/                 # Libraries and utilities
│   │   ├── api.ts          # API client functions
│   │   ├── AuthContext.tsx  # Authentication context
│   │   └── utils.ts        # Utility functions
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main chat page
│   │   ├── Login.tsx       # Login/Register page
│   │   └── NotFound.tsx    # 404 page
│   ├── hooks/              # Custom React hooks
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Features

- 🔐 User authentication with JWT
- 💬 Real-time chat interface
- 📊 Mental health tracking with charts
- 🎵 Background music integration
- 🔮 Bhagavad Gita wisdom display
- 📱 Fully responsive design
- 🎨 Modern UI with Shadcn components
- ⚡ Fast development with Vite

## Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Shadcn/ui**: Component library
- **React Router**: Routing
- **Axios/Fetch**: API calls

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

   Server will start on `https://localhost:8081`

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## Key Components

### ChatInput
- Message input with send button
- Tracks loading state
- Handles emoji and special characters

### ChatMessage
- Displays user and AI messages
- Shows sentiment indicators
- Renders audio player for voice responses

### AuthContext
- Manages authentication state
- Handles JWT token storage
- Provides login/register functions
- Auto-reconnect with stored token

### API Functions
Located in `lib/api.ts`:
- `sendMessage()` - Send chat message
- `getChatHistory()` - Fetch chat history
- `clearChatHistory()` - Clear all messages

## Environment Configuration

API base URL configured in:
- `src/lib/api.ts`
- `src/lib/AuthContext.tsx`

Currently: `https://localhost:8000`

Change via environment variables:
```env
VITE_API_URL=https://your-api-url:8000
```

## Authentication Flow

1. User enters credentials on Login page
2. Credentials sent to `/auth/login` endpoint
3. Server returns JWT token
4. Token stored in localStorage
5. Token included in all API requests via `Authorization: Bearer` header
6. Token auto-validated on app load

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Pre-configured color scheme
- Responsive design patterns

### Components
- Shadcn/ui provides accessible, unstyled components
- Customize with Tailwind classes
- Dark mode support built-in

## Development Workflow

1. **Components**: Create reusable components in `src/components/`
2. **Pages**: Add new pages in `src/pages/`
3. **API**: Update API calls in `src/lib/api.ts`
4. **Context**: Manage global state in context files

## Debugging

### API Issues
- Check browser console (F12) for errors
- Verify backend is running on correct URL
- Check Network tab for request details
- Look for CORS or SSL certificate warnings

### Component Issues
- Use React DevTools extension
- Check console for warnings
- Inspect element styles in DevTools

## Building for Production

```bash
# Create optimized build
npm run build

# Output in 'dist' directory
# Ready for deployment
```

## Performance

- Lazy loading of routes
- Code splitting via Vite
- Image optimization
- Bundle analysis with `npm run build`

## Security Best Practices

- Never commit `.env` files with secrets
- Use environment variables for API URLs
- JWT tokens stored securely in localStorage
- HTTPS enforced for all connections
- Input validation on forms

## Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Build Errors
```bash
# Clear build cache
rm -rf dist
npm run build
```

## Contributing

1. Create feature branches
2. Follow component structure
3. Use TypeScript for type safety
4. Add proper PropTypes/interfaces
5. Test components thoroughly

## License

MIT License

## Support

For issues or questions, refer to the main [README.md](../README.md)
**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
