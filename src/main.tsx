import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    }
], {
    future: {
        // Remove v7_startTransition as it's not a valid option
        v7_relativeSplatPath: true
    }
})

createRoot(document.getElementById("root")!).render(<App />);
