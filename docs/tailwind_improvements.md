# Comprehensive Guide to Improving Tailwind CSS Usage

This document outlines strategies and best practices for enhancing the use of Tailwind CSS in this project. As this is a template project, these recommendations aim to provide a robust and scalable foundation for your future applications. The focus is on creating reusable styles, leveraging helper functions, and understanding the necessary configurations.

## High-Level Implementation Roadmap

Here's a suggested order of operations:

1.  **Setup Tooling**:
    *   Install and configure `prettier-plugin-tailwindcss`. Run it across the project.
2.  **Define Initial Vision Strategy & CSS Variables**:
    *   Decide on the initial set of CSS custom properties needed (colors, fonts, spacing, border-radius).
    *   Update `tailwind.config.js` to use these CSS variables (e.g., `colors: { primary: 'hsl(var(--color-primary))' }`).
3.  **Create Theme Files**:
    *   Create `src/styles/themes/` directory.
    *   Develop `corporate.css` and `casual.css` (and `base.css` if needed), defining the chosen CSS variables for each vision.
    *   Import these into your main CSS file (e.g., `src/styles/index.scss`).
4.  **Implement Vision Switching**:
    *   Add JavaScript logic to set/get `data-vision` on `<html>` (e.g., using `localStorage` and a context or simple utility).
    *   Provide a basic UI mechanism to switch visions for testing (e.g., a temporary dropdown).
5.  **Refactor Core Layout & Global Styles**:
    *   Update global styles (e.g., body background, default text color) to use the new theme variables: `bg-background`, `text-text`.
6.  **Incrementally Refactor Components**:
    *   Start with the most reused components (e.g., `Button`, `Container`, `Card`, `Dialog`, `Header`, `Footer`).
    *   Update their styles (and `cva` definitions) to use the semantic theme utilities (`bg-primary`, `rounded-button`, etc.) instead of hardcoded values (`bg-blue-500`, `rounded-md`).
    *   Test each refactored component under both visions.
7.  **Refactor Page-Level Styles**:
    *   Go through individual pages and layouts, replacing specific styles with theme-aware utilities.
8.  **Documentation**:
    *   Document the theming system: how it works, how to switch visions, how to use themed utilities in new components.
    *   Explain how to add a new vision or modify existing ones.

## Current Tailwind CSS Setup

Our project utilizes Tailwind CSS for utility-first styling. Here's a breakdown of the core configuration files:

### `tailwind.config.js`

This file is the heart of your Tailwind CSS configuration.

```javascript
// d:\work\playground\chess\tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'], // Scans these files for Tailwind class usage
  theme: {
    extend: {
      // This is where you can define custom, reusable design tokens:
      // colors: {
      //   brand: {
      //     light: '#3fbaeb',
      //     DEFAULT: '#0fa9e6',
      //     dark: '#0c87b8',
      //   },
      // },
      // spacing: {
      //   '128': '32rem',
      // },
      // fontFamily: {
      //   sans: ['Graphik', 'sans-serif'],
      // },
    },
  },
  plugins: [
    // You can add official or third-party plugins here
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};
```

-   **`content`**: Specifies the files Tailwind should scan to find class names and generate the necessary CSS. It's correctly configured to scan HTML and JavaScript/TypeScript files in the `src` directory.
-   **`theme.extend`**: Allows you to add or override Tailwind's default design tokens (colors, spacing, fonts, breakpoints, etc.) without losing the defaults. This is crucial for creating a consistent design language.
-   **`plugins`**: Enables you to add official plugins (like `@tailwindcss/forms` or `@tailwindcss/typography`) or custom plugins to extend Tailwind's functionality.

### `postcss.config.js`

PostCSS is a tool for transforming CSS with JavaScript plugins. Tailwind CSS is itself a PostCSS plugin.

```javascript
// d:\work\playground\chess\postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // Processes Tailwind directives and generates CSS
    autoprefixer: {},          // Adds vendor prefixes for browser compatibility
  },
};
```

This setup is standard for a Tailwind CSS project, ensuring that Tailwind's features are correctly processed and that CSS output is compatible across browsers.

### `src/styles/tailwind.css`

This CSS file is the entry point for Tailwind's styles.

```css
/* d:\work\playground\chess\src\styles\tailwind.css */
@tailwind base;     /* Injects Tailwind's base styles (like normalize.css) */
@tailwind components; /* Injects Tailwind's component classes */
@tailwind utilities;  /* Injects Tailwind's utility classes */

/* You can add custom global styles or @layer directives here if needed */
```

These three directives are essential for Tailwind to work.

## Strategies for Reusable Styles

While utility classes are powerful, creating reusable and maintainable styles is key for larger projects.

### 1. Component-Based Styles with SCSS Modules

For complex components or styles that don't fit the utility-first paradigm well, SCSS Modules (e.g., `ChessBoard.module.scss`) offer scoped styling.

-   **Usage**: Continue using `*.module.scss` files for component-specific styles that are not easily expressed with utilities or when strong encapsulation is desired.
-   **Benefit**: Avoids class name collisions and keeps styles tightly coupled to their respective components.

### 2. Tailwind CSS Plugins

For highly reusable utility patterns or new component styles that you want to use across the project with Tailwind's syntax:

-   **Custom Plugins**: You can write your own [Tailwind CSS plugins](https://tailwindcss.com/docs/plugins) in `tailwind.config.js`. This is useful for abstracting common UI patterns into custom utilities or components.
    *Example: A plugin for common button styles if `cva` (see below) isn't sufficient or for a different purpose.*
-   **Official/Community Plugins**:
    -   `@tailwindcss/forms`: Provides a basic reset for form elements, making them easier to style with utilities.
    -   `@tailwindcss/typography`: Adds a `prose` class for styling blocks of rich text content.
    -   Consider these if your project involves complex forms or rendering markdown/CMS content.

### 3. Theme Extensions in `tailwind.config.js`

This is the most common and recommended way to create reusable design tokens.

-   **How**: Define custom colors, spacing, fonts, border-radius values, etc., within the `theme.extend` object in `tailwind.config.js`.
-   **Benefit**: Ensures consistency across the application. Instead of hardcoding `#FF0000`, you'd use `text-red-500` or a custom `text-brand-primary`.
-   **Example**:
    ```javascript
    // tailwind.config.js
    theme: {
      extend: {
        colors: {
          brand: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#ffc107',
          },
          feedback: {
            error: '#dc3545',
            success: '#28a745',
            warning: '#ffc107',
          }
        },
        spacing: {
          'container-padding': '1rem',
        },
        borderRadius: {
          'card': '0.5rem',
        }
      },
    },
    ```
    You can then use these as `bg-brand-primary`, `p-container-padding`, `rounded-card`.

## Helper Functions for Dynamic and Conditional Styling

Managing conditional or dynamic class strings in JSX/TSX can become messy. Helper functions can significantly improve readability and maintainability.

### 1. `clsx` (or `classnames`)

For conditionally joining class names. `clsx` is a tiny (228B) utility.

-   **Need**: When you need to apply classes based on component props or state.
-   **Installation**:
    ```bash
    npm install clsx
    # or
    yarn add clsx
    ```
-   **Usage**:
    ```typescript jsx
    import clsx from 'clsx';

    interface MyComponentProps {
      isActive: boolean;
      isError?: boolean;
      className?: string;
    }

    const MyComponent = ({ isActive, isError, className }: MyComponentProps) => {
      const buttonClasses = clsx(
        'py-2 px-4 rounded font-semibold', // base classes
        {
          'bg-blue-500 text-white': isActive && !isError,
          'bg-gray-300 text-gray-700': !isActive && !isError,
          'bg-red-500 text-white': isError,
        },
        className // allow passing additional classes
      );

      return <button className={buttonClasses}>Click Me</button>;
    };
    ```

### 2. `cva` (Class Variance Authority)

`cva` is a powerful library for creating type-safe, reusable, and variant-driven UI components with Tailwind CSS. It helps manage complex style combinations based on props.

-   **Need**: Ideal for components with multiple visual variants (e.g., buttons with different colors, sizes, states).
-   **Installation**:
    ```bash
    npm install cva
    # or
    yarn add cva
    ```
-   **Configuration**: No specific configuration file. Usage is by importing and using the `cva` function.
-   **Usage Example (Button Component)**:

    Let's define styles for a button component:
    ```typescript jsx
    // src/components/Button/Button.tsx
    import { cva, type VariantProps } from 'cva';
    import React from 'react';
    import clsx from 'clsx'; // Often used with cva for additional classes

    const buttonStyles = cva(
      // Base classes applied to all variants
      'font-semibold border rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        variants: {
          intent: {
            primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            secondary: 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 focus:ring-gray-400',
            danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500',
            outline: 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
          },
          size: {
            sm: 'py-1 px-2 text-sm',
            md: 'py-2 px-4 text-base',
            lg: 'py-3 px-6 text-lg',
          },
          fullWidth: {
            true: 'w-full',
          },
          disabled: {
            true: 'opacity-50 cursor-not-allowed',
          }
        },
        compoundVariants: [
          // Example: if intent is primary and size is lg, add more padding
          {
            intent: 'primary',
            size: 'lg',
            className: 'py-4', // Additional classes for this specific combination
          },
          // Disabled outline button
          {
            intent: 'outline',
            disabled: true,
            className: 'text-gray-400 border-gray-300 hover:bg-transparent',
          }
        ],
        defaultVariants: {
          intent: 'primary',
          size: 'md',
        },
      }
    );

    export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
      // No need to redefine intent, size, fullWidth as they come from VariantProps
    }

    export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
      ({ className, intent, size, fullWidth, disabled, ...props }, ref) => {
        return (
          <button
            ref={ref}
            className={clsx(buttonStyles({ intent, size, fullWidth, disabled }), className)}
            disabled={disabled}
            {...props}
          />
        );
      }
    );

    Button.displayName = 'Button';
    ```

-   **Benefits of `cva`**:
    -   **Type Safety**: `VariantProps` ensures that only defined variants can be passed as props.
    -   **Readability**: Centralizes style logic, making component JSX cleaner.
    -   **Reusability**: Easy to create consistent UI elements.
    -   **Composition**: `compoundVariants` allow for fine-grained control over style combinations.

-   **When to use `cva`**:
    -   For UI components that have multiple visual states or styles based on props (Buttons, Badges, Alerts, Cards, etc.).
    -   When you want to enforce a consistent API for styling components.
    -   Over simple string concatenation or `clsx` when the number of variants and conditional classes grows.

## Improving Existing Component Styles

Review existing components and identify opportunities for refactoring using the strategies above.

### `Header.tsx`

Currently uses string variables for class groups:
```typescript
// const headerBaseClasses = 'sticky top-0 z-50 bg-gray-900 text-white transition-all duration-300 ease-in-out';
// const headerNormalClasses = 'py-3 h-16';
// const headerScrolledClasses = 'py-1 h-12';
// className={`${headerBaseClasses} ${scrolledPastHeader ? headerScrolledClasses : headerNormalClasses}`}
```
-   **Recommendation**: This is a good candidate for `cva` if the header had more variants. For simple conditional logic like this, `clsx` is also effective.
    ```typescript jsx
    import clsx from 'clsx';
    // ...
    const headerClasses = clsx(
      'sticky top-0 z-50 bg-gray-900 text-white transition-all duration-300 ease-in-out',
      {
        'py-3 h-16': !scrolledPastHeader,
        'py-1 h-12': scrolledPastHeader,
      }
    );
    // <header className={headerClasses}>
    ```
    The button styles within `Header.tsx` (`bg-red-600 hover:bg-red-700...` and `bg-blue-600 hover:bg-blue-700...`) are prime candidates for a shared `Button` component styled with `cva`.

### `Container.tsx`

This component already tries to build classes dynamically based on props.
```typescript
// const baseClasses = 'w-full';
// const flexClasses = !useGrid ? `flex ${orientation} ${items} ${justify}` : '';
// const gridClasses = useGrid ? `grid ${gridCols} ${gap}` : '';
// const shadowClass = shadow !== 'none' ? `shadow-${shadow}` : '';
// className={`${baseClasses} ${padding} ${flexClasses} ${gridClasses} ${shadowClass} ${className}`.trim()}
```
-   **Recommendation**: Refactor using `cva` for clearer variant management and `clsx` for combining the final class string.
    ```typescript jsx
    // src/components/Container/Container.tsx (Conceptual refactor)
    import { cva, type VariantProps } from 'cva';
    import clsx from 'clsx';

    const containerStyles = cva('w-full', {
      variants: {
        padding: { // Assuming padding props are Tailwind padding classes
          default: 'p-4',
          none: '',
          // ... add more specific padding variants if needed
        },
        display: {
          flex: 'flex',
          grid: 'grid',
        },
        orientation: { // Only applies if display is flex
          col: 'flex-col',
          row: 'flex-row',
        },
        items: { // Only applies if display is flex
          start: 'items-start',
          center: 'items-center',
          end: 'items-end',
        },
        justify: { // Only applies if display is flex
          start: 'justify-start',
          center: 'justify-center',
          between: 'justify-between',
        },
        gridCols: { // Only applies if display is grid
          '1': 'grid-cols-1',
          '2': 'grid-cols-2',
          // ...
        },
        gap: { // Only applies if display is grid
          '4': 'gap-4',
          // ...
        },
        shadow: {
          none: '',
          sm: 'shadow-sm',
          md: 'shadow-md',
          lg: 'shadow-lg',
          xl: 'shadow-xl',
          '2xl': 'shadow-2xl',
          inner: 'shadow-inner',
        },
      },
      defaultVariants: {
        padding: 'default',
        display: 'flex',
        orientation: 'col',
        items: 'start',
        justify: 'start',
        shadow: 'none',
      },
    });

    // Props would need to be adjusted to match these variants
    // interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerStyles> {
    //   useGrid?: boolean; // This logic would be handled by the 'display' variant
    // }

    // const Container = ({ className, padding, display, orientation, items, justify, gridCols, gap, shadow, children, ...props }: ContainerProps) => {
    //   const computedClasses = containerStyles({
    //     padding,
    //     display,
    //     orientation: display === 'flex' ? orientation : undefined,
    //     items: display === 'flex' ? items : undefined,
    //     justify: display === 'flex' ? justify : undefined,
    //     gridCols: display === 'grid' ? gridCols : undefined,
    //     gap: display === 'grid' ? gap : undefined,
    //     shadow
    //   });
    //   return (
    //     <div className={clsx(computedClasses, className)} {...props}>
    //       {children}
    //     </div>
    //   );
    // };
    ```
    *Note: The `ContainerProps` and its usage would need to be updated to align with the `cva` variants. The `useGrid` prop could be replaced by a `display: 'grid'` variant.*

### General Button Usage (e.g., `ChessBoard.tsx`)

```tsx
// <button
//   className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//   onClick={() => setGame(new Chess())}
// >
//   Reset
// </button>
```
-   **Recommendation**: Replace these one-off styled buttons with the new `Button` component (defined with `cva`).
    ```tsx
    // <Button intent="primary" onClick={() => setGame(new Chess())}>
    //   Reset
    // </Button>
    ```

## Linting and Formatting for Class Strings

To maintain consistency and readability of Tailwind CSS class strings.

### `prettier-plugin-tailwindcss`

This Prettier plugin automatically sorts Tailwind CSS classes according to the recommended order.

-   **Benefit**: Ensures a consistent class order across the project, making long class strings easier to scan and reducing diff noise.
-   **Installation**:
    ```bash
    npm install -D prettier prettier-plugin-tailwindcss
    # or
    yarn add -D prettier prettier-plugin-tailwindcss
    ```
-   **Configuration**:
    If you have a `.prettierrc.js` or `.prettierrc.json` file, add the plugin to the `plugins` array:

    ```javascript
    // .prettierrc.js
    module.exports = {
      // ...other Prettier options
      plugins: ['prettier-plugin-tailwindcss'],
    };
    ```
    If you configure Prettier in `package.json`:
    ```json
    // package.json
    {
      // ...
      "prettier": {
        // ...other Prettier options
        "plugins": ["prettier-plugin-tailwindcss"]
      }
    }
    ```
    *Ensure your editor is set up to format with Prettier on save, or run Prettier from the command line.*

## Best Practices

-   **Utility-First, But Not Utility-Only**: Don't be afraid to create components or use `@apply` (sparingly, in CSS/SCSS files for complex, repeated utility sets) when utilities become too verbose or unmanageable directly in the markup. `cva` often provides a better alternative to `@apply` in components.
-   **Theme for Consistency**: Rely heavily on your `tailwind.config.js` theme for colors, spacing, fonts, etc. Avoid magic numbers or one-off values in your utility classes.
-   **Readability**:
    -   Use `prettier-plugin-tailwindcss` for automatic class sorting.
    -   For very long class lists, consider breaking the component into smaller parts or using `cva`.
-   **DRY (Don't Repeat Yourself)**:
    -   Use `cva` for component variants.
    -   Extend your theme for common property-value pairs.
    -   Create custom plugins for complex, reusable utility patterns if necessary.
-   **Keep `content` Configuration Accurate**: Ensure your `tailwind.config.js` `content` array accurately reflects all files where you use Tailwind classes. Otherwise, necessary styles might not be generated.
-   **Understand Specificity**: Tailwind's utilities are generally low-specificity. If you mix Tailwind with custom CSS, be mindful of how CSS specificity rules apply.

By implementing these strategies, the project's styling will become more maintainable, scalable, and easier for developers to work with.

## Refactor Strategy Implementation Plan

This section details a plan to implement a more robust and flexible theming system, enabling "visions" (e.g., corporate vs. casual looks) for the website. The focus is on leveraging Tailwind's configuration for reusable, vision-adaptive styles rather than creating new UI components from scratch.

### 1. Plugins for Consistency

Maintaining a consistent and readable codebase is crucial, especially when dealing with numerous utility classes.

-   **`prettier-plugin-tailwindcss`**:
    -   **Purpose**: Automatically sorts Tailwind CSS classes in a predefined order. This improves readability and reduces merge conflicts.
    -   **Installation**:
        ```bash
        npm install -D prettier prettier-plugin-tailwindcss
        # or
        yarn add -D prettier prettier-plugin-tailwindcss
        ```
    -   **Configuration**:
        Add the plugin to your Prettier configuration file (`.prettierrc.js`, `.prettierrc.json`, or `package.json`).
        ```javascript
        // .prettierrc.js example
        module.exports = {
          // ...other Prettier options
          plugins: ['prettier-plugin-tailwindcss'],
        };
        ```
        Ensure your editor is configured to use Prettier for formatting on save, or integrate Prettier into your pre-commit hooks.

### 2. Core Configuration for Visions (`tailwind.config.js`)

The `tailwind.config.js` file will be central to defining how visions translate into actual styles. We will use CSS Custom Properties (CSS Variables) for dynamic theming, allowing vision changes without recompiling styles.

-   **Strategy**: Define semantic color names, font families, and other themeable properties in `tailwind.config.js` that map to CSS variables.
-   **Example `tailwind.config.js` setup**:
    ```javascript
    // d:\work\playground\chess\tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    export default {
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            primary: 'hsl(var(--color-primary) / <alpha-value>)',
            secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
            accent: 'hsl(var(--color-accent) / <alpha-value>)',
            background: 'hsl(var(--color-background) / <alpha-value>)',
            text: 'hsl(var(--color-text) / <alpha-value>)',
            'text-muted': 'hsl(var(--color-text-muted) / <alpha-value>)',
            border: 'hsl(var(--color-border) / <alpha-value>)',
            // Add more semantic color names as needed
          },
          fontFamily: {
            sans: ['var(--font-sans)', 'sans-serif'],
            serif: ['var(--font-serif)', 'serif'], // Example for an alternative font
          },
          spacing: {
            'container-padding': 'var(--spacing-container-padding)',
            // Define other themeable spacing if necessary
          },
          borderRadius: {
            'card': 'var(--border-radius-card)',
            'button': 'var(--border-radius-button)',
            // Define other themeable border-radius values
          },
          // Potentially extend other properties like boxShadows, borderWidths, etc.
        },
      },
      plugins: [
        // require('@tailwindcss/forms'),
        // require('@tailwindcss/typography'),
      ],
    };
    ```
    *Note the use of `hsl(var(--color-primary) / <alpha-value>)`. This allows Tailwind's opacity modifiers (e.g., `bg-primary/50`) to work correctly with CSS variables that store HSL values.* For simpler hex or rgb colors, you can use `rgb(var(--color-primary) / <alpha-value>)` or just `var(--color-primary)` if opacity modification isn't needed for that specific color. For HSL, ensure your CSS variables store the H, S, L values without `hsl()` wrapper e.g. `210 40% 96%`.

### 3. File Structure for Themes/Visions

Organize theme-specific CSS variable definitions into separate files.

-   **Directory Structure**: Create a new directory, for example, `src/styles/themes/`.
-   **Theme Files**: Inside this directory, create CSS files for each vision:
    -   `src/styles/themes/corporate.css`
    -   `src/styles/themes/casual.css`
    -   `src/styles/themes/base.css` (for common variables or fallbacks, if any)
-   **Example `corporate.css`**:
    ```css
    /* src/styles/themes/corporate.css */
    :root[data-vision="corporate"],
    :root { /* Default to corporate if no data-vision or for base styles */
      --color-primary: 217 91% 60%; /* e.g., HSL for a professional blue */
      --color-secondary: 215 28% 17%; /* e.g., HSL for a dark gray */
      --color-accent: 25 95% 53%;    /* e.g., HSL for an orange accent */
      --color-background: 0 0% 100%; /* White */
      --color-text: 215 28% 17%;     /* Dark Gray */
      --color-text-muted: 215 20% 45%; /* Lighter Gray */
      --color-border: 215 20% 90%;   /* Light Gray Border */

      --font-sans: 'Inter', sans-serif; /* Clean, modern sans-serif */
      --font-serif: 'Georgia', serif;

      --spacing-container-padding: 1.5rem;
      --border-radius-card: 0.5rem;
      --border-radius-button: 0.375rem;
      /* ... other corporate-specific variables */
    }
    ```
-   **Example `casual.css`**:
    ```css
    /* src/styles/themes/casual.css */
    :root[data-vision="casual"] {
      --color-primary: 350 80% 60%;  /* e.g., HSL for a vibrant pink/red */
      --color-secondary: 190 70% 50%;/* e.g., HSL for a playful teal */
      --color-accent: 45 100% 50%;   /* e.g., HSL for a bright yellow */
      --color-background: 30 50% 98%; /* Off-white, slightly warm */
      --color-text: 30 30% 20%;      /* Dark, warm gray */
      --color-text-muted: 30 25% 40%;  /* Softer warm gray */
      --color-border: 30 30% 85%;    /* Soft warm border */

      --font-sans: 'Poppins', sans-serif; /* Friendly, rounded sans-serif */
      --font-serif: 'Lora', serif;

      --spacing-container-padding: 1rem;
      --border-radius-card: 0.75rem;
      --border-radius-button: 9999px; /* Pill-shaped buttons */
      /* ... other casual-specific variables */
    }
    ```
-   **Import into Global CSS**: Import these theme files into your main CSS entry point (e.g., `src/styles/index.scss` or `src/styles/tailwind.css`).
    ```css
    /* src/styles/index.scss or tailwind.css */
    @import './themes/base.css'; /* Optional base variables */
    @import './themes/corporate.css';
    @import './themes/casual.css';

    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Other global styles */
    ```

### 4. Usage and Switching Visions

With CSS variables defined, Tailwind utilities like `bg-primary`, `text-text`, `font-sans`, `p-container-padding`, `rounded-card` will automatically use the values from the active vision.

-   **Switching Mechanism**:
    -   The vision is controlled by a `data-vision` attribute on the `<html>` or `<body>` element.
    -   Implement a JavaScript function to change this attribute. This can be managed via a settings panel, user preference, or even route-based logic.
    ```typescript jsx
    // Example: src/context/ThemeContext.tsx or a simple utility
    type Vision = 'corporate' | 'casual';

    const applyVision = (vision: Vision) => {
      document.documentElement.setAttribute('data-vision', vision);
      localStorage.setItem('app-vision', vision); // Persist preference
    };

    const loadVision = () => {
      const storedVision = localStorage.getItem('app-vision') as Vision | null;
      if (storedVision) {
        applyVision(storedVision);
      } else {
        applyVision('corporate'); // Default vision
      }
    };

    // Call loadVision() early in your application setup (e.g., in main.tsx)
    loadVision();
    ```

### 5. Defining Reusable Styles for Visions

This strategy focuses on making existing utility classes and component styles adaptive, rather than creating entirely new sets of styles or components for each vision.

-   **Semantic Naming**: The key is using the semantic names defined in `tailwind.config.js` (e.g., `bg-primary`, `text-text`, `border-border`, `font-sans`).
-   **No New Components for Visions**: You don't create `CorporateButton` and `CasualButton`. You have one `Button` component that naturally adapts its appearance based on the active vision's CSS variables.
-   **Variable-Based Styling**:
    -   **Colors**: Use `bg-primary`, `text-secondary`, `border-accent`, etc.
    -   **Fonts**: Use `font-sans` or `font-serif`.
    -   **Spacing**: Use `p-container-padding`, `m-container-padding`.
    -   **Borders**: Use `rounded-card`, `border-border`.
-   **Example**:
    A card component might use:
    `className="bg-background p-container-padding rounded-card border border-border shadow-lg"`
    All these utilities (`bg-background`, `p-container-padding`, `rounded-card`, `border-border`) will resolve to different actual values depending on whether the `corporate` or `casual` vision is active, thanks to the underlying CSS variables.

### 6. Managing and Configuring Different Visions

This involves defining the CSS variables for each vision and ensuring the system can switch between them.

-   **Centralized Vision Definitions**: The `src/styles/themes/` directory holds the style definitions (CSS variables) for each vision.
    -   `corporate.css`: Defines `--color-primary: ...; --font-sans: ...;` etc., for the corporate look.
    -   `casual.css`: Defines the same set of variables but with different values for the casual look.
-   **Adding a New Vision**:
    1.  Create a new CSS file (e.g., `src/styles/themes/futuristic.css`).
    2.  Define all the themeable CSS variables (e.g., `--color-primary`, `--font-sans`) with values appropriate for the "futuristic" vision.
    3.  Import this new CSS file in `src/styles/index.scss` (or your main CSS file): `@import './themes/futuristic.css';`
    4.  Update your JavaScript logic for switching visions to include "futuristic" as an option.
-   **Configuration Scope**:
    -   **Colors**: Primary, secondary, accent, background, text, borders.
    -   **Typography**: Font families (sans, serif, mono), potentially font weights or base sizes if they vary significantly.
    -   **Spacing**: Key spacing units like container padding, section padding.
    -   **Border Radii**: Common border radius values for cards, buttons, inputs.
    -   **Shadows**: While Tailwind provides shadow utilities, you could define themeable shadow presets if needed (e.g., `--shadow-card: 0 10px 15px -3px var(--color-shadow-primary);`). This is more advanced and might not be necessary initially.

### 7. Adapting Existing Reusable Components to Visions

Review existing components (like `Button`, `Container`, `Header`, `Dialog`) and update their styling to use the new vision-aware semantic Tailwind classes.

-   **`Button.tsx` (using `cva`)**:
    Modify the `cva` definition to use semantic color names.
    ```typescript jsx
    // src/components/Button/Button.tsx (Conceptual refactor)
    // ...
    const buttonStyles = cva(
      'font-semibold border rounded-button transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        variants: {
          intent: {
            primary: 'bg-primary text-white border-primary hover:bg-primary/80 focus:ring-primary/50', // Assuming white text on primary is desired for all visions, or define a --color-primary-foreground
            secondary: 'bg-secondary text-white border-secondary hover:bg-secondary/80 focus:ring-secondary/50', // Similarly, or --color-secondary-foreground
            danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500', // Danger might remain consistent or also be themed
            outline: 'bg-transparent text-primary border-primary hover:bg-primary/10 focus:ring-primary/50',
          },
          size: { /* ... sm, md, lg ... */ },
          // ...
        },
        defaultVariants: {
          intent: 'primary',
          size: 'md',
        },
      }
    );
    // ...
    ```
    *Consider adding `--color-primary-foreground`, `--color-secondary-foreground` variables in your theme files if the text color on primary/secondary buttons needs to change per vision.*

-   **`Container.tsx`**:
    If `Container.tsx` uses classes like `p-4`, `shadow-md`, update them to use themed values if applicable: `p-container-padding`, `shadow-card` (if you define themed shadows).
    ```typescript jsx
    // src/components/Container/Container.tsx (Conceptual refactor using cva)
    // ...
    const containerStyles = cva('w-full', {
      variants: {
        padding: {
          default: 'p-container-padding', // Uses the themed variable
          none: '',
        },
        shadow: {
          none: '',
          card: 'shadow-card', // If you define a --shadow-card variable and corresponding utility
          lg: 'shadow-lg', // Standard Tailwind shadow
        },
        // ... other variants like display, orientation, items, justify, gridCols, gap
      },
      defaultVariants: {
        padding: 'default',
        shadow: 'none',
      }
    });
    // ...
    ```

-   **`Header.tsx`**:
    Replace hardcoded colors like `bg-gray-900` with semantic theme colors like `bg-background` or `bg-secondary` (if the header has a distinct background from the page).
    ```typescript jsx
    // Header.tsx example
    import clsx from 'clsx';
    // ...
    const headerClasses = clsx(
      'sticky top-0 z-50 bg-secondary text-text-muted transition-all duration-300 ease-in-out', // Using themed colors
      {
        'py-3 h-16': !scrolledPastHeader,
        'py-1 h-12': scrolledPastHeader,
      }
    );
    // <header className={headerClasses}>
    ```

This plan provides a structured approach to refactoring your Tailwind CSS usage for better reusability and adaptability through a "vision"-based theming system.
