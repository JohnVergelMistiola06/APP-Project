# InventoryPro - Inventory Management System

## Overview
This project is a small business inventory management system developed as part of the Information Technology (IT) curriculum. It allows users to track items, monitor stock movements, record sales, and generate basic reports.

## Technologies Used
* **Frontend:** React, TypeScript (TSX)
* **Styling:** Tailwind CSS, shadcn/ui components
* **Build Tool:** Vite
* **Routing:** React Router DOM

## Local Development Setup

Follow these steps to set up and run the project locally:

1.  **Install Dependencies:**
    ```sh
    npm install
    ```

2.  **Start Development Server:**
    ```sh
    npm run dev
    ```
    The application will typically start at `http://localhost:8080/` (or port 8080 as you saw earlier).

## Project Structure
* `src/pages/`: Contains the main page components (Dashboard, Items, Sales, etc.).
* `src/components/layout/`: Contains the overall structure (AppLayout, AppSidebar).
* `src/components/ui/`: Contains reusable UI components.

## Key Features
* Real-time Stock Tracking: Dashboard provides immediate alerts for low and out-of-stock items.
* Item Management: Forms to add new items and edit existing product details (SKU, price, stock).
* Sales & Valuation Summary: Displays daily sales revenue, profit margin, and total inventory valuation.
* Stock Movement Logging: Tracks and displays detailed history of inventory inflows and outflows.