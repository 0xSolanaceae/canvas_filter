# canvas_flter

## Introduction

`canvas_filter` is a UserScript designed to block Instructure's [Canvas](https://www.instructure.com/canvas) fingerprinting in web browsers.

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Tampermonkey extension installed

## Installation

### Step 1: Install Tampermonkey

1. Open your web browser.
2. Go to the [Tampermonkey website](https://www.tampermonkey.net/).
3. Click on the download link for your browser.
4. Follow the instructions to install the extension.

### Step 2: Add the `canvas_filter` Script

1. Open Tampermonkey by clicking on its icon in the browser toolbar.
2. Click on the "Dashboard" option.
3. Click on the `+` icon to create a new script.
4. Copy and paste the contents of [`src/canvas-filter.js`](src/canvas-filter.js) into the script editor.
5. Save the script by clicking on the "File" menu and selecting "Save".

### Step 3: Enable the Script

1. In the Tampermonkey Dashboard, ensure that the `canvas_blocker` script is enabled.
2. The script should now be active and blocking canvas fingerprinting on supported websites.

## Usage

Once the script is enabled, it will automatically block canvas fingerprinting attempts on websites you visit. You can manage the script through the Tampermonkey Dashboard, where you can enable, disable, or edit the script as needed.

## License

This project is licensed under the GNU General Public License v3.0 License. See the LICENSE file for more information.