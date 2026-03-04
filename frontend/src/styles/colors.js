// Color scheme for the entire application
// Primary: Orange (main brand color)
// Secondary: Gray (neutral)
// Accent: Blue (for info/links)
// Success: Green
// Error: Red
// Warning: Yellow

export const colors = {
  // Primary - Orange
  primary: {
    50: 'bg-orange-50',
    100: 'bg-orange-100',
    500: 'bg-orange-500',
    600: 'bg-orange-600',
    700: 'bg-orange-700',
  },
  primaryText: {
    500: 'text-orange-500',
    600: 'text-orange-600',
    700: 'text-orange-700',
  },
  primaryBorder: {
    500: 'border-orange-500',
    600: 'border-orange-600',
  },
  
  // Error - Red
  error: {
    50: 'bg-red-50',
    100: 'bg-red-100',
    500: 'bg-red-500',
    600: 'bg-red-600',
    700: 'bg-red-700',
  },
  errorText: {
    500: 'text-red-500',
    600: 'text-red-600',
    700: 'text-red-700',
  },
  errorBorder: {
    200: 'border-red-200',
    500: 'border-red-500',
  },
  
  // Success - Green
  success: {
    50: 'bg-green-50',
    500: 'bg-green-500',
    600: 'bg-green-600',
  },
  
  // Info - Blue
  info: {
    100: 'bg-blue-100',
    700: 'text-blue-700',
  },
};

// Usage guidelines:
// - Use orange for primary actions (buttons, links, highlights)
// - Use red only for errors and destructive actions
// - Use gray for neutral elements
// - Use green for success messages
// - Use blue for informational elements
