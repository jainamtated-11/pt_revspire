# App built using React + Vite

```npm create vite@latest```

- For installing dependencies

```
npm install
```

- To Start

```
npm run dev
```

# Styling - Tailwind

- Used Tailwind for styling https://tailwindcss.com/

# Sidebar Component Documentation

The Sidebar component represents a sidebar navigation menu with icons and tooltips for different menu items. It provides a collapsible sidebar with options like Home, Content Dashboard, Pitch Content, and Tag Manager.

## Tools Used

### Fontawesome

- We are dynamically importing each icon based on usage, so we need to import the following statements wherever we are planning to use.

```
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
```

- Import the required icons

```
import { faHouse, faFolderPlus, faTableColumns } from "@fortawesome/free-solid-svg-icons";
```

- Example Usage

```
<FontAwesomeIcon className="text-2xl" icon={faFolderPlus} />
```

- Reference: https://fontawesome.com


## react-tooltip

- A library for creating tooltips in React applications.

- Import statement

```
import { Tooltip } from 'react-tooltip'
```

- Sample Usage

```
<a data-tooltip-id="my-tooltip-inline" data-tooltip-content="Hello world!">◕‿‿◕</a>
<Tooltip id="my-tooltip-inline" style={{ backgroundColor: "rgb(0, 255, 30)", color: "#222"}}/>
```

- Reference: https://react-tooltip.com/docs/examples/styling

## Additional imports

- PropTypes: A library for type-checking React props to ensure that components are used correctly.


- Sidebar
  - State
    - open (boolean): Controls the sidebar open/close state.
    - activeMenuItem (number): Represents the index of the active menu item.
  - Constants
    - Menus (array): An array of menu items with titles, icons, and gap indicators.
  - Functions
    - handleMenuItemClick(index): Updates the activeMenuItem state and triggers the onMenuItemClick callback.
  - JSX Structure
    - Sidebar Container
      - Sidebar Content
        - Sidebar Toggle Button
        - Menu Items (Mapped from Menus array)
          - Menu Item
            - Icon
            - Tooltip
            - Text
State and Constants
open (boolean): Represents the open/close state of the sidebar.
activeMenuItem (number): Represents the index of the currently active menu item.
Menus (array): An array of menu items with the following structure:
title (string): The title of the menu item.
src (JSX): The FontAwesome icon JSX for the menu item.
gap (boolean): A flag indicating whether a gap should be added below the menu item.
Functions
handleMenuItemClick(index):
Parameters: index (number) - The index of the clicked menu item.
Updates the activeMenuItem state with the clicked menu item's index.
Calls the onMenuItemClick callback with the clicked index.
JSX Structure
The component uses conditional classes and styles to manage the open/close state of the sidebar.
Icons are displayed for each menu item using FontAwesome icons.
Tooltips are added to provide additional information on hover.
The onMenuItemClick callback is triggered when a menu item is clicked.
PropTypes
onMenuItemClick (function): A required function prop that is called when a menu item is clicked. It receives the index of the clicked menu item as a parameter.
Styles
The component uses Tailwind CSS classes for styling.
Transition effects are applied to create a smooth open/close animation.
Tooltips have custom styling for background color, text color, and margin.



## User Authentication

```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'jordan';
```